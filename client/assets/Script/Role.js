/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色类
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (data) {
        this._data=data;
        this._state = ag.gameConst.stateIdle;

        //创建模型

        //var func = function(){
        //    ag.agAniCache.getEffect(this.node,"ani/hum17/040116",6,1,0.1);
        //    ag.agAniCache.getEffect(this.node,"ani/hum16/033116",6,3,0.1);
        //    //ag.agAniCache.getEffect(this.node,"ani/effect2/503048",8,4,0.1);
        //}.bind(this);
        //ag.agAniCache.getNode(this.node,"ani/hum3/010116",6,2,0.1,func);
        //func();


        this.setLocation(this._data.x,this._data.y);
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


    //按方向移动
    move:function(offset) {
        if (this == ag.gameLayer._player) {
            if (this._state != ag.gameConst.stateIdle && this._state != ag.gameConst.stateStand)return;
        }
        offset = ag.gameLayer.getOffsetWithColloison(this, offset);
        if (!offset)return;

        this._state = ag.gameConst.stateMove;
        this.node.stopAllActions();
        this._data.x += offset.x;
        this._data.y += offset.y;


        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = this._data.x - mapData.mapX / 2;
        var y = this._data.y - mapData.mapY / 2;
        this.node.runAction(cc.sequence(cc.moveTo(0.6, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            this._state = ag.gameConst.stateIdle;
        }.bind(this))));


        //向服务器发送
        if (this == ag.gameLayer._player) {
            ag.agSocket.send("move",{x: offset.x, y: offset.y});
        }
    },


    getMapXYString:function(){
        return ''+this._data.map+','+this._data.x+','+this._data.y;
    },
});
