var BSocket = require("BSocket");
var GameConst = require("GameConst");
var CukeAni = require("CukeAni");
var JsUtil = require("JsUtil");
cc.Class({
    extends: cc.Component,

    properties: {
        _bGo: false,
    },

    // use this for initialization
    onLoad: function () {
        window.ww = {};
        ww.cukeAniCache = require("CukeAniCache");



        //cuke add for test.
        var array = [];
        for(var i=1;i<=17;++i)array.push("ani/hum"+i);
        for(var i=1;i<=4;++i)array.push("ani/effect"+i);
        cc.loader.loadResArray(array, cc.SpriteAtlas, function (err, atlas) {
            GameConst.change();
            BSocket.setup();
        }.bind(this));
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(BSocket._sessionId != null && this._bGo==false){
            this._bGo = true;
            cc.director.loadScene('FirstLayer');
        }
    },
});
