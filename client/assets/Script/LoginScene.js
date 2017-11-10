/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */

var UserInfo = require('UserInfo');
cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {
        cc.audioEngine.stopAll();
        cc.audioEngine.play(cc.url.raw("resources/music/Dragon Rider.mp3"),true,1);
    },

    buttonTourist: function() {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        ag.jsUtil.request(this.node,'ykLogin',ag.agSocket._sessionId,function (data) {
            UserInfo._accountData = data.data;
            cc.director.loadScene('CreateRoleScene');
        });
    },
});
