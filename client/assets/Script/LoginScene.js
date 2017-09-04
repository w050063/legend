/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */

var UserInfo = require('UserInfo');
cc.Class({
    extends: cc.Component,
    properties: {},


    buttonTourist: function() {
        ag.jsUtil.request(this.node,'ykLogin',ag.agSocket._sessionId,function (data) {
            UserInfo._accountData = data.data;
            cc.director.loadScene('HallScene');
        });
    },
});
