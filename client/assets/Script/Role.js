/**
 * Created by bot.su on 2017/5/1.
 * 游戏角色类
 */
var UserInfo = require("UserInfo");
var GameConst = require("GameConst");


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (data) {
        this._data=data;
        this._state = GameConst.stateIdle;

        //创建模型

        var func = function(){
            ww.cukeAniCache.getEffect(this.node,"ani/hum17/040116",6,1,0.1);
            ww.cukeAniCache.getEffect(this.node,"ani/hum16/033116",6,3,0.1);
            //ww.cukeAniCache.getEffect(this.node,"ani/effect2/503048",8,4,0.1);
        }.bind(this);
        ww.cukeAniCache.getNode(this.node,"ani/hum3/010116",6,2,0.1,func);
        func();


        this.setLocation(this._data.x,this._data.y);
    },


    //设置逻辑位置
    setLocation:function(x,y){
        if(x!=undefined && y!=undefined){
            this._data.x = x;
            this._data.y = y;
        }

        var mapData = GameConst._terrainMap[this._data.mapId];
        var x = this._data.x-mapData.mapX/2;
        var y = this._data.y-mapData.mapY/2;
        this.node.setPosition(x*mapData.tileX,y*mapData.tileY);
    },


    //按方向移动
    walk:function(offset) {
        if (this == cc.vv._gameLayer._player) {
            if (this._state != GameConst.stateIdle && this._state != GameConst.stateStand)return;
        }
        offset = cc.vv._gameLayer.getOffsetWithColloison(this, offset);
        if (!offset)return;

        this._state = GameConst.stateWalk;
        this.node.stopAllActions();
        this._data.x += offset.x;
        this._data.y += offset.y;


        var mapData = GameConst._terrainMap[this._data.mapId];
        var x = this._data.x - mapData.mapX / 2;
        var y = this._data.y - mapData.mapY / 2;
        this.node.runAction(cc.sequence(cc.moveTo(0.6, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            this._state = GameConst.stateIdle;
        }.bind(this))));


        //向服务器发送
        if (this == cc.vv._gameLayer._player) {
            pomelo.request("work.WorkHandler.walk", {x: offset.x, y: offset.y}, function (data) {});
        }
    },


    getMapXYString:function(){
        return ''+this._data.map+','+this._data.x+','+this._data.y;
    },
});
