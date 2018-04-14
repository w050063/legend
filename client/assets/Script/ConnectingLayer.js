/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */

var NodeLoading = require("NodeLoading");
cc.Class({
    extends: cc.Component,
    properties: {},

    // use this for initialization
    onLoad: function () {
        if(!window.ag){
            //if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
            //    cc.director.setProjection(cc.Director.PROJECTION_2D);
            //}else{
            //    cc.renderer.enableDirtyRegion(false);
            //}
            window.ag = {};
            ag.jsUtil = require("JsUtil");
            ag.userInfo = require("UserInfo");
            ag.userInfo.init();
            ag.gameConst = require("GameConst");
            ag.gameConst.init();
            ag.agSocket = require("AGSocket");
            var BuffManager = require("BuffManager");
            ag.buffManager = new BuffManager();
            ag.buffManager.init();
            var AgSpriteCache = require("AgSpriteCache");
            ag.spriteCache = new AgSpriteCache();
            ag.spriteCache.init();
            var MusicManager = require("MusicManager");
            ag.musicManager = new MusicManager();
            ag.musicManager.init();


            //注册前后台切换事件
            cc.game.on(cc.game.EVENT_HIDE, function () {
                if(ag.gameLayer && ag.gameLayer._player && ag.gameLayer._player._ai){
                    ag.gameLayer._player._ai._touchPointArray = [];
                }
            });
            cc.game.on(cc.game.EVENT_SHOW , function () {
                if(ag.gameLayer && ag.gameLayer._player && ag.gameLayer._player._ai){
                    ag.gameLayer._player._ai._touchPointArray = [];
                }
            });

            //cc.director.setDisplayStats(false);
        }

        ag.musicManager.playMusic("resources/voice/Victory.mp3");


        var node = cc.find("Canvas/door");
        node.setPosition(ag.userInfo.backGroundPos);
        var dis0 = cc.pDistance(cc.p(280,230),cc.p(-100,-330));
        var dis1 = cc.pDistance(cc.p(280,230),ag.userInfo.backGroundPos);
        node.runAction(cc.sequence(cc.moveTo(20*dis1/dis0,cc.p(280,230)),cc.callFunc(function(){
            node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(20,cc.p(-100,-330)),cc.moveTo(20,cc.p(280,230)))));
        })));


        this._nodeLoading = cc.find("Canvas/nodeLoading").getComponent(NodeLoading);
        //this._nodeLoading.setShow("正在连接网络...");
        //this._nodeLoading.setPercent(".");


        this.loadPrefab();
    },


    //加载资源
    loadPrefab:function(){
        //this._nodeLoading.active = true;
        //this._netState.active = false;
        this._nodeLoading.setShow("预制资源加载中");
        var array = ['prefab/nodeRequest'];
        cc.loader.loadResArray(array, cc.Prefab,function(num, totalNum, item){
            this._nodeLoading.setPercent("("+Math.floor(num/totalNum*100)+"%)");
        }.bind(this),function (err, atlas) {
            this.node.runAction(cc.sequence(cc.delayTime(0.01),cc.callFunc(function () {
                this.loadFrame();
            }.bind(this))));
        }.bind(this));
    },




    //加载资源
    loadFrame:function(){
        this._nodeLoading.setShow("图集资源加载中");
        this._nodeLoading.setPercent("(0%)");
        var array = [];
        //for(var i=1;i<=17;++i)if(i!=7 && i!=8)array.push("ani/hum"+i);
        //for(var i=1;i<=3;++i)array.push("ani/effect"+i);
        array.push("ani/icon");
        array.push("ani/neiguan");
        cc.loader.loadResArray(array, cc.SpriteAtlas,function(num, totalNum, item){
            this._nodeLoading.setPercent("("+Math.floor(num/totalNum*100)+"%)");
        }.bind(this),function (err, atlas) {
            ag.userInfo.backGroundPos = cc.find("Canvas/door").getPosition();
            cc.director.loadScene('LoginScene',function () {cc.loader.onProgress = null;});
        }.bind(this));
    },
});
