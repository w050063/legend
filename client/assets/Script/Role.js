/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色类
 */


var AGAniAction = require("AGAniAction");
var PlayerAI = require("PlayerAI");
var BoarAI = require("BoarAI");
cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (data) {
        this._data=data;
        this._agAni = null;
        this.setLocation(this._data.x,this._data.y);
        this.idle();
        this.node.setScale(2);

        //增加AI
        if(this == ag.gameLayer._player){
            this._ai = this.node.addComponent(PlayerAI);
            this._ai.init(this);
        }else{
            this._ai = this.node.addComponent(BoarAI);
            this._ai.init(this);
        }
    },


    //设置逻辑位置
    setLocation:function(x,y){
        if(x!=undefined && y!=undefined){
            this._data.x = x;
            this._data.y = y;
        }

        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = this._data.x-mapData.mapX/2;
        var y = this._data.y-mapData.mapY/2;
        this.node.setPosition(x*mapData.tileX,y*mapData.tileY);
    },


    //无事可以做状态
    idle:function(){
        if(this._state != ag.gameConst.stateIdle){
            var array = AGAniAction[(this._data.clothes?"1":"nude")+(this._data.sex==1?1:0)+ag.gameConst.stateIdle+this._data.direction].split(',');
            if(this._agAni)ag.agAniCache.put(this._agAni);
            this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,0.5);
            this._state = ag.gameConst.stateIdle;
        }
    },


    //按方向移动
    move:function(offset) {
        offset = ag.gameLayer.getOffsetWithColloison(this, offset);
        if (!offset){
            this.idle();
            return;
        }

        this.node.stopAllActions();
        this._data.x += offset.x;
        this._data.y += offset.y;
        var direction = ag.gameConst.directionStringArray.indexOf(''+offset.x+','+offset.y);


        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = this._data.x - mapData.mapX / 2;
        var y = this._data.y - mapData.mapY / 2;
        this.node.runAction(cc.sequence(cc.moveTo(this._data.moveSpeed, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            this._ai.onMoveEnd();
        }.bind(this))));
        if(this._state != ag.gameConst.stateMove || this._data.direction != direction){
            var array = AGAniAction[(this._data.clothes?"1":"nude")+(this._data.sex==1?1:0)+ag.gameConst.stateMove+direction].split(',');
            if(this._agAni)ag.agAniCache.put(this._agAni);
            this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,this._data.moveSpeed/parseInt(array[1]));
        }


        //向服务器发送
        if (this == ag.gameLayer._player) {
            ag.agSocket.send("move",{x: offset.x, y: offset.y});
        }


        //最后变更状态
        this._state = ag.gameConst.stateMove;
        this._data.direction = direction;
    },


    getMapXYString:function(){
        return ''+this._data.map+','+this._data.x+','+this._data.y;
    },
});
