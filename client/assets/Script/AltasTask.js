/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (str,n) {
        this._taskArray = [];
        this._bBusy = false;
    },
    
    
    //增加一个任务
    addTask:function (key,callback) {
        var atlas = cc.loader.getRes(key);
        if(atlas){
            cc.loader.loadRes(key,cc.SpriteAtlas,callback);
        }else{
            this._taskArray.push({key:key,callback:callback,location:location});
        }
    },


    // called every frame
    update001: function (dt) {
        if(this._bBusy==false && this._taskArray.length>0){
            this._bBusy = true;
            cc.loader.loadRes(this._taskArray[0].key,cc.SpriteAtlas,function(err,atlas){
                this._taskArray[0].callback(err,atlas);
                this._taskArray.splice(0,1);
                this._bBusy = false;
            }.bind(this));
        }
    },
});
