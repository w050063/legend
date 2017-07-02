/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (role) {
        this._role = role;
    },


    // called every frame
    update: function (dt) {
        this.node.setLocalZOrder(Math.floor(100000-this.node.y));
    },

    //一次移动完成
    onMoveEnd:function(){

    },

    //一次移动完成
    onAttackEnd:function(){

    },

    //攻击特效
    attackEffect: function () {
    },
});
