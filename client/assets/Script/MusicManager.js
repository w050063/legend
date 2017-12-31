/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化
    init: function () {
        this._musicName = null;
        this._musicSetup = cc.sys.localStorage.getItem('musicSetup')!='false';
        this._soundEffectSetup = cc.sys.localStorage.getItem('soundEffectSetup')!='false';
    },


    setupMusic:function (setup) {
        this._musicSetup = setup;
        cc.sys.localStorage.setItem('musicSetup',setup?'true':'false');
        if(setup){
            if(this._musicName)this.playMusic(this._musicName);
        }else{
            cc.audioEngine.stopAll();
        }
    },


    setupSoundEffect:function (setup) {
        this._soundEffectSetup = setup;
        cc.sys.localStorage.setItem('soundEffectSetup',setup?'true':'false');
    },


    playEffect:function(name){
        if(this._soundEffectSetup){
            cc.audioEngine.play(cc.url.raw(name),false,1);
        }
    },


    playMusic:function(name){
        this._musicName = name;
        if(this._musicSetup){
            cc.audioEngine.stopAll();
            cc.audioEngine.play(cc.url.raw(name),true,1);
        }
    },
});
