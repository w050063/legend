/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */


cc.Class({
    extends: cc.Component,
    properties: {},

    // use this for initialization
    onLoad: function () {
        cc.sequenceEx = function(){
            if(arguments.length==1)return new cc.Sequence(arguments[0]);
            if(arguments.length==2)return new cc.Sequence(arguments[0],arguments[1]);
            if(arguments.length==3)return new cc.Sequence(arguments[0],arguments[1],arguments[2]);
            if(arguments.length==4)return new cc.Sequence(arguments[0],arguments[1],arguments[2],arguments[3]);
            if(arguments.length==5)return new cc.Sequence(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]);
            if(arguments.length==6)return new cc.Sequence(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);
            return cc.Sequence();
        };
        window.ag = {};
        ag.jsUtil = require("JsUtil");
        ag.agAniCache = require("AGAniCache");
        ag.userInfo = require("UserInfo");
        ag.gameConst = require("GameConst");
        ag.agSocket = require("AGSocket");
        ag.gameConst.init();
        var BuffManager = require("BuffManager");
        ag.buffManager = new BuffManager();
        ag.buffManager.init();
        var AltasTask = require("AltasTask");
        ag.altasTask = new AltasTask();
        ag.altasTask.init();


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


        this._netState = cc.find("Canvas/label_netState");
        this._loadRes = cc.find("Canvas/load_res");
        this.labelPercent = cc.find("Canvas/load_res/label_percent").getComponent(cc.Label);
        this._loadRes.active = false;
        ag.agSocket.init(this.loadRes.bind(this));
    },


    //加载资源
    loadRes:function(){
        this._loadRes.active = true;
        this._netState.active = false;


        //公共资源在此添加,依次加载Prefab,SpriteAtlas,spriteFrame...
        var array = ['prefab/nodeRoleProp'];
        cc.loader.loadResArray(array, cc.Prefab,function(num, totalNum, item){
            this.labelPercent.string = "("+Math.floor(num/totalNum*100)+"%)";
        }.bind(this),function (err, atlas) {
            cc.director.loadScene('FirstLayer',null,function () {
                cc.loader.onProgress = null;
            });
        }.bind(this));
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
    },
});
