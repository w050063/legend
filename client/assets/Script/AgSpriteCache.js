/**
 * Created by bot.su on 2017/6/21.
 * 图片缓存
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (str,n) {
        this._cacheArray = [];
        this._cacheMaxCount = 500;
        this._downloadArray = [];
        this._bLoading = false;
        this._waitFrameArray = [];
    },
    
    
    //增加一个任务,挂一个组建监听销毁  onDestroy
    get:function (name,callback) {
        for(var i=0;i<this._cacheArray.length;++i){
            var sprite = this._cacheArray[i];
            if(sprite._agName==name){
                this._cacheArray.splice(i,1);
                if(sprite._callback)sprite._callback(sprite);
                return sprite;
            }
        }
        var pos = name.lastIndexOf('/');
        var before = name.substr(0,pos);
        var atlas = cc.loader.getRes(before,cc.SpriteAtlas);
        if(!atlas)this._downloadArray.push(before);
        var sprite = new cc.Node().addComponent(cc.Sprite);
        this._waitFrameArray.push(sprite);
        sprite._agName = name;
        sprite._callback = callback;
        return sprite;
    },

    //将一个用完的节点放回池中
    put : function(sprite){
        if(cc.isValid(sprite) && cc.isValid(sprite.node)){
            if(sprite && sprite._agName && sprite.spriteFrame){
                if(this._cacheArray.length>=this._cacheMaxCount){
                    this._cacheArray[0].destroy();
                    this._cacheArray.splice(0,1);
                }
                sprite.node.setPosition(cc.p(0,0));
                sprite.node.setScale(1);
                sprite.node.setColor(cc.color(255,255,255));
                sprite.node.removeFromParent();
                this._cacheArray.push(sprite);
            }else{
                sprite.node.destroy();
            }
        }
    },


    // called every frame
    update001: function (dt) {
        if(this._bLoading==false){
            //先显示图片10张，再进行下载，最后处理无法显示的图片
            var bDisposeCount = 0;
            var index = 0;
            while(index<this._waitFrameArray.length && bDisposeCount<10){
                var sprite = this._waitFrameArray[index];
                if(cc.isValid(sprite) && cc.isValid(sprite.node)){
                    var name = sprite._agName;
                    var pos = name.lastIndexOf('/');
                    var before = name.substr(0,pos);
                    var after = name.substr(pos+1);
                    var atlas = cc.loader.getRes(before,cc.SpriteAtlas);
                    if(atlas){
                        sprite.spriteFrame = atlas.getSpriteFrame(after);
                        if(sprite._callback)sprite._callback(sprite);
                        this._waitFrameArray.splice(index,1);
                        ++bDisposeCount;
                    }else{
                        ++index;
                    }
                }else{
                    this._waitFrameArray.splice(index,1);
                }
            }


            if(bDisposeCount == 0){
                if(this._downloadArray.length>0){
                    if(this._bLoading==false){
                        this._bLoading = true;
                        cc.loader.loadRes(this._downloadArray[0],cc.SpriteAtlas,function(err,atlas){
                            this._downloadArray.splice(0,1);
                            this._bLoading = false;
                        }.bind(this));
                    }
                }else{
                    var array = this._waitFrameArray;
                    this._waitFrameArray = [];
                    for(var i=0;i<array.length;++i){
                        var sprite = array[i];
                        if(cc.isValid(sprite) && cc.isValid(sprite.node)){
                            if(sprite._callback)sprite._callback(sprite);
                        }
                    }
                }
            }
        }
    },
});
