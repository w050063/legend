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
        this._spriteFrameArray = [];
        this._curIndex = 0;
        this._passTime = 0;
        this._running = true;
        this._interval = 1;
        this._finishedCallback = null;
        this._aniPosition = cc.p(0,0);


        var pos = str.lastIndexOf('/');
        var before = str.substr(0,pos);//6是图片后面数字的长度,下同
        var after = parseInt(str.substr(pos+1));
        for(var i=0;i<n;++i){
            this._spriteFrameArray.push(before+'/'+this.pad(after+i,6));
        }
        this.modifyFrame();
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


    setAniPosition:function(position){
        this._aniPosition = position;
        this.modifyFrame();
    },


    modifyFrame:function(){
        if(this.node.childrenCount>0)ag.spriteCache.put(this.node.children[0].getComponent(cc.Sprite));
        var str = this._spriteFrameArray[this._curIndex];
        var sprite = ag.spriteCache.get(str);
        var pos = str.lastIndexOf('/');
        var after = str.substr(pos+1);
        var array = AGAniOffset[after].split(",");
        this.node.addChild(sprite.node);
        this.node.setPosition(cc.pAdd(this._aniPosition,cc.p(parseInt(array[0]),parseInt(array[1]))));

        if(this._controllArray){
            for(var i=0;i<this._controllArray.length;++i){
                this._controllArray[i]._curIndex = this._curIndex;
                this._controllArray[i].modifyFrame();
            }
        }
    },


    // called every frame
    update: function (dt) {
        if(this._bBeControll)return;
        if(this._running){
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


    addControl:function(comp){
        if(!this._controllArray)this._controllArray = [];
        this._controllArray.push(comp);
        comp.beControll();
    },

    beControll:function(){
        this._bBeControll=true;
    },

    delControll:function(){
        if(this._controllArray){
            for(var i=0;i<this._controllArray.length;++i){
                delete this._controllArray[i]._bBeControll;
            }
            delete this._controllArray;
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
