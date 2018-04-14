/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


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
        this._color = cc.color(255,255,255);


        var pos = str.lastIndexOf('/');
        var before = str.substr(0,pos);//6是图片后面数字的长度,下同
        var after = parseInt(str.substr(pos+1));
        for(var i=0;i<n;++i){
            var curAfter = ag.jsUtil.pad0For6(after+i);
            var curStr = before+'/'+curAfter;
            var sprite = ag.spriteCache.get(curStr);
            this.node.addChild(sprite.node);
            this._spriteFrameArray.push(sprite);
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

    setColor:function(color){
        if(this._color.r!=color.r || this._color.g!=color.g || this._color.b!=color.b){
            for(var i=0;i<this._spriteFrameArray.length;++i){
                this._spriteFrameArray[i].node.color = color;
            }
            this._color = color;
        }
    },


    modifyFrame:function(){
        var i=0;
        for(i=0;i<this._spriteFrameArray.length;++i){
            var node = this._spriteFrameArray[i].node;
            var b = (this._curIndex==i);
            if(node.active!=b)node.active = b;
        }
		
		
        if(this._controllArray){
            for(i = this._controllArray.length-1;i>=0;--i){
				var comp = this._controllArray[i];
				if(comp._bBeControll){
					comp._curIndex = this._curIndex;
					comp.modifyFrame();
				}else{
					this._controllArray.splice(i,1);
				}
            }
        }
    },

    putCache:function(){
        this.setFinishedCallback(null);
        this.pause();
        var i=0;
        if(this._color.r!=255 || this._color.g!=255 || this._color.b!=255){
            for(i=0;i<this._spriteFrameArray.length;++i){
                this._spriteFrameArray[i].node.color = cc.color(255,255,255);
            }
        }
        for(i=this._spriteFrameArray.length-1;i>=0;--i){
            ag.spriteCache.put(this._spriteFrameArray[i]);
        }
        this._spriteFrameArray = [];
        this._finishedCallback = undefined;
        this.delControll();
        delete this._bBeControll;
        this.node.destroy();
    },


    //called every frame
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
});
