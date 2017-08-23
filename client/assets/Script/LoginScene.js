/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    buttonTourist: function() {
        cc.director.loadScene('HallScene',null,function () {});
    },
});
