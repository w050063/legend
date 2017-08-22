/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


var AGAniOffset = require("AGAniOffset");
cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (str,n) {
        this._willDoArray = [];
        this._loadOver = false;
        this.node._cukeName = str;
        this.node.addComponent(cc.Sprite);
        this._spriteFrameArray = [];
        this._curIndex = 0;
        this._passTime = 0;
        this._running = true;
        this._interval = 1;
        this._finishedCallback = null;
        this._totalCount = n;
        this._aniPosition = cc.p(0,0);

        var urls = [];
        var before = str.substr(0,str.length-7);//6是图片后面数字的长度,下同
        var after = parseInt(str.substr(str.length-6));
        for(var i=0;i<n;++i){
            urls.push(this.pad(after+i,6));
        }

        ag.altasTask.addTask(before,function (err, atlas) {
            if(!this._spriteFrameArray)return;//防止内存已经释放
            for(var i=0;i<urls.length;++i){
                this._spriteFrameArray.push({"key":urls[i],"value":atlas.getSpriteFrame(urls[i])});
            }
            this.modifyFrame();
            this._loadOver = true;
            for(var i=0;i<this._willDoArray.length;++i){
                this._willDoArray[i]();
            }
            this._willDoArray = [];
        }.bind(this));
    },

    //加载完毕后指定参数任务
    doCallback:function(callback){
        if(this._loadOver){
            callback(this);
        }else{
            this._willDoArray.push(callback);
        }
    },


    pause:function(){
        this._running = false;
    },

    resume:function(){
        this._running = true;
    },

    setInterval:function(value){
        this._interval = value;
    },

    setFinishedCallback:function(callback){
        this._finishedCallback = callback;
    },

    getTotalCount:function(){
        return this._totalCount;
    },


    setAniPosition:function(position){
        this._aniPosition = position;
    },


    modifyFrame:function(){
        var sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame = this._spriteFrameArray[this._curIndex].value;
        var key = this._spriteFrameArray[this._curIndex].key;
        var after = key.substr(key.length-6);
        var array = AGAniOffset[after].split(",");
        this.node.setPosition(cc.pAdd(this._aniPosition,cc.p(parseInt(array[0]),parseInt(array[1]))));
    },


    // called every frame
    update: function (dt) {
        if(this._running && this._spriteFrameArray.length>0){
            this._passTime += dt;
            if(this._passTime>=this._interval){
                this._passTime -= this._interval;
                ++this._curIndex;
                if(this._curIndex>=this._spriteFrameArray.length) {
                    this._curIndex = 0;
                    if (this._finishedCallback){
                        this._finishedCallback(this);
                    }
                }
                this.modifyFrame();
            }
        }
    },


    //向前补0函数
    pad:function(num,length) {
        var len = num.toString().length;
        while(len < length) {
            num = "0" + num;
            ++len;
        }
        return ""+num;
    },
});
