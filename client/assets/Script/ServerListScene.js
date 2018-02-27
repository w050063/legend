/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */


cc.Class({
    extends: cc.Component,
    properties: {},
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
            ag.agSocket = require("AGSocket");
            ag.gameConst.init();
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



        this._dataArray = [];
        this.refresh();//刷新界面

        ag.musicManager.playMusic("resources/voice/Victory.mp3");
    },


    refresh: function() {
        if(this._dataArray.length==0){
            this.node.runAction(cc.sequence(cc.delayTime(5),cc.callFunc(function(){
                this.refresh();
            }.bind(this))));


            var self = this;
            pomelo.init({host: '127.0.0.1',port: 3014,log: true}, function() {
                pomelo.request('gate.GateHandler.serverlist', {}, function(data) {
                    pomelo.disconnect(function () {});
                    if(data.code==0){
                        self._dataArray = JSON.parse(data.data);
                        self.refresh2();
                    }
                });
            });
        }
    },


    refresh2: function() {
        cc.find('Canvas/nodeServerList/labelTip').active = false;
        for(var i=0;i<3;++i){
            var button = cc.find('Canvas/nodeServerList/button'+i);
            if(i<this._dataArray.length){
                cc.find('Canvas/nodeServerList/button'+i+'/Label').getComponent(cc.Label).string = this._dataArray[i].name;
                button.active = true;
            }else {
                button.active = false;
            }
        }
    },


    buttonEventArea: function(event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var index = parseInt(event.target.name.substr(6));
        var obj = this._dataArray[index];
        if(obj.open){
            ag.userInfo._serverIP = obj.ip;
            ag.userInfo._serverPort = obj.port;
            cc.director.loadScene('ConnectingLayer');
        }else{
            ag.jsUtil.showText(this.node,obj.descript);
        }
    },
});
