/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */

//var AGAniOffset = require("AGAniOffset");
cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (str,n) {
        this._name = str;
        this._spriteFrameArray = [];
        this._curIndex = 0;
        this._passTime = 0;
        this._running = true;
        this._interval = 1;
        this._finishedCallback = null;


        var pos = str.lastIndexOf('/');
        var before = str.substr(0,pos);//6是图片后面数字的长度,下同
        var after = parseInt(str.substr(pos+1));
        for(var i=0;i<n;++i){
            var curAfter = this.pad(after+i,6);
            var curStr = before+'/'+curAfter;
            var sprite = ag.spriteCache.get(curStr);
            if(!sprite._customAniPosition){
                var array = AGAniOffset[curAfter].split(",");
                sprite._customAniPosition = cc.p(parseInt(array[0]),parseInt(array[1]));
            }
            this._spriteFrameArray.push(sprite);
        }
        this.modifyFrame();
    },


    clone:function(father){
        var node = new cc.Node();
        var AGAni = require("AGAni");
        var ani = node.addComponent(AGAni);
        ani.init(this._name,this._spriteFrameArray.length);
        father.addChild(node,this.getLocalZOrder());
        if(this._interval)ani.setInterval(this._interval);
        if(this._finishedCallback)ani.setFinishedCallback(this._finishedCallback);
        return node;
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


    modifyFrame:function(){
        if(this.node.childrenCount>0){
            this.node.children[0].removeFromParent();
        }
        var sprite = this._spriteFrameArray[this._curIndex];
        this.node.addChild(sprite.node);
        sprite.node.setColor(this.node.getColor());
        sprite.node.setPosition(sprite._customAniPosition);


        if(this._controllArray){
            for(var i=this._controllArray.length-1;i>=0;--i){
                if(this._controllArray[i]){
                    if(this._controllArray[i]._bBeControll){
                        this._controllArray[i]._curIndex = this._curIndex;
                        this._controllArray[i].modifyFrame();
                    }else{
                        this._controllArray.splice(i,1);
                    }
                }
            }
        }
    },

    putCache:function(){
        for(var i=this._spriteFrameArray.length-1;i>=0;--i){
            ag.spriteCache.put(this._spriteFrameArray[i]);
        }
        this._spriteFrameArray = [];
        this._finishedCallback = undefined;
        this.delControll();
        delete this._bBeControll;
        this.node.destroy();
    },


    // called every frame
    update: function (dt) {
        if(this._bBeControll)return;
        if(this._running){
            this._passTime += dt;
            if(this._passTime>=this._interval){
                this._passTime -= this._interval;
                ++this._curIndex;
                var bFinished = false;
                if(this._curIndex>=this._spriteFrameArray.length) {
                    bFinished = true;
                    this._curIndex = 0;
                }
                this.modifyFrame();

                if (bFinished && this._finishedCallback){
                    this._finishedCallback(this);
                }
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
