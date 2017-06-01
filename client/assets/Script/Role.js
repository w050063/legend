/**
 * Created by bot.su on 2017/5/1.
 * 游戏角色类
 */
var UserInfo = require("UserInfo");
var CukeSpine = require("CukeSpine");
var GameConst = require("GameConst");


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (data) {
        this._data=data;
        this._state = GameConst.stateIdle;

        //创建模型
        this._spine = this.addComponent(CukeSpine);
        this._spine.init("spine/spineboy");
        this._spine.setAnimation(0,"walk",true);
        this._spine.setMixEx('walk','run',0.2);

        this.setLocation(this._data.x,this._data.y);
    },


    //设置逻辑位置
    setLocation:function(x,y){
        if(x!=undefined && y!=undefined){
            this._data.x = x;
            this._data.y = y;
        }

        var mapData = GameConst._mapArray[UserInfo._map];
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


        var mapData = GameConst._mapArray[UserInfo._map];
        var x = this._data.x - mapData.mapX / 2;
        var y = this._data.y - mapData.mapY / 2;
        this.node.runAction(cc.sequence(cc.moveTo(0.6, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            this._state = GameConst.stateIdle;
        }.bind(this))));


        //向服务器发送
        if (this == cc.vv._gameLayer._player) {
            pomelo.request("work.WorkHandler.walk", {x: offset.x, y: offset.y}, function (data) {});
        }
    }
});
