/**
 * Created by bot.su on 2017/5/1.
 * 游戏角色类
 */
var UserInfo = require("UserInfo");
var CukeSpine = require("CukeSpine");


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (data) {
        this._data=data;


        var node = new cc.Node();
        this._spine = node.addComponent(CukeSpine);
        this._spine.init("spine/spineboy");
        this._spine.setAnimation(0,"walk",true);
        this._spine.setMixEx('walk','run',0.2);
        this.node.addChild(node);
    },


    //设置location
    setLocation:function(x,y){
        this._data={x:UserInfo._x,y:UserInfo._y};
    }
});
