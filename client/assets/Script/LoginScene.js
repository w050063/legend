/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */

var UserInfo = require('UserInfo');
cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {
        var node = cc.find("Canvas/door");
        node.setPosition(ag.userInfo.backGroundPos);
        var dis0 = cc.pDistance(cc.p(280,230),cc.p(-100,-330));
        var dis1 = cc.pDistance(cc.p(280,230),ag.userInfo.backGroundPos);
        node.runAction(cc.sequence(cc.moveTo(20*dis1/dis0,cc.p(280,230)),cc.callFunc(function(){
            node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(20,cc.p(-100,-330)),cc.moveTo(20,cc.p(280,230)))));
        })));
        cc.audioEngine.stopAll();
        cc.audioEngine.play(cc.url.raw("resources/music/Dragon Rider.mp3"),true,1);
    },

    buttonTourist: function() {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        ag.jsUtil.request(this.node,'ykLogin',ag.agSocket._sessionId,function (data) {
            ag.userInfo.backGroundPos = cc.find("Canvas/door").getPosition();
            UserInfo._accountData = data.data;
            cc.director.loadScene('CreateRoleScene');
        });
    },


    theCountryIsAtPeace: function() {
        ag.agSocket.send("theCountryIsAtPeace",'');
    },
});
