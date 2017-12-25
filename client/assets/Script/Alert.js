/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {

    },

    buttonOK: function() {
        if (this.node._callback)this.node._callback();
        this.node.destroy();
    },


    buttonCancel: function() {
        if (this.node._callbackCancel)this.node._callbackCancel();
        this.node.destroy();
    },
});
