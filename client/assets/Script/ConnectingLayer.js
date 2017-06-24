/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */


cc.Class({
    extends: cc.Component,

    properties: {
        _bGo: false,
    },

    // use this for initialization
    onLoad: function () {
        global.ag = {};
        ag.jsUtil = require("JsUtil");
        ag.agAniCache = require("AGAniCache");
        ag.userInfo = require("UserInfo");
        ag.gameConst = require("GameConst");
        ag.agSocket = require("AGSocket");
        ag.gameConst.init();
        ag.agSocket.init();

        //cuke add for test.
        //var array = [];
        //for(var i=1;i<=17;++i)array.push("ani/hum"+i);
        //for(var i=1;i<=4;++i)array.push("ani/effect"+i);
        //cc.loader.loadResArray(array, cc.SpriteAtlas, function (err, atlas) {
        //    ag.agSocket.init();
        //}.bind(this));
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(ag.agSocket._sessionId != null && this._bGo==false){
            this._bGo = true;
            cc.director.loadScene('FirstLayer');
        }
    },
});
