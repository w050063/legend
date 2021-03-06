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
        this._stableCount = 200;
        this._cacheMaxCount = 300;
        this._downloadArray = [];
        this._bLoading = false;
        this._waitFrameArray = [];
        this._fileMap = {};
    },
    

    //增加一个任务,挂一个组建监听销毁  onDestroy
    get:function (name,callback) {
        for(var i=this._cacheArray.length-1;i>=0;--i){
            var sprite = this._cacheArray[i];
            if(sprite._agName==name){
                this._cacheArray.splice(i,1);
                if(cc.isValid(sprite) && cc.isValid(sprite.node)){
                    if(callback)callback(sprite);
                    return sprite;
                }
            }
        }
        var pos = name.lastIndexOf('/');
        var before = name.substr(0,pos);
        var after = name.substr(pos+1);
        var i=0;
        for(;i<10;++i){//默认顶多2个备用plist
            var trueBefore = i==0?before:(before+'_'+i);
            if(this._fileMap[trueBefore]){
                if(this._fileMap[trueBefore].indexOf(after)!=-1)break;
            }else{
                if(this._downloadArray.indexOf(trueBefore)==-1)this._downloadArray.push(trueBefore);
                break;
            }
        }
        var sprite = new cc.Node().addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        this._waitFrameArray.push(sprite);
        sprite._agName = name;
        if(i!=0)sprite._agTime = i;
        sprite._agCallback = callback;
        //设置坐标
        var tempArray = AGAniOffset[name.substr(name.lastIndexOf('/')+1)].split(",");
        if(tempArray)sprite.node.setPosition(parseInt(tempArray[0]),parseInt(tempArray[1]));
        return sprite;
    },

    //将一个用完的节点放回池中
    put : function(sprite){
        if(cc.isValid(sprite) && cc.isValid(sprite.node)){
            sprite.node.removeFromParent();
            if(this._cacheArray.length>=this._cacheMaxCount){
                var num = this._cacheMaxCount-this._stableCount;
                for(var i=0;i<num;++i){
                    this._cacheArray[i].destroy();
                }
                this._cacheArray.splice(0,num);
            }
            this._cacheArray.push(sprite);
        }
    },


    // called every frame
    update001: function (dt) {
        if(this._bLoading==false){
            //先显示图片20张，再进行下载，最后处理无法显示的图片
            var bDisposeCount = 0;
            var index = 0;
            while(index<this._waitFrameArray.length && bDisposeCount<20){
                var sprite = this._waitFrameArray[index];
                if(cc.isValid(sprite) && cc.isValid(sprite.node)){
                    var name = sprite._agName;
                    var pos = name.lastIndexOf('/');
                    var before = name.substr(0,pos);
                    if(sprite._agTime)before = before+'_'+sprite._agTime;
                    var after = name.substr(pos+1);
                    var atlas = cc.loader.getRes(before,cc.SpriteAtlas);
                    if(atlas){
                        var spriteFrame = atlas.getSpriteFrame(after);
                        if(spriteFrame){
                            sprite.spriteFrame = spriteFrame;
                            if(sprite._agCallback){
                                var temp = sprite._agCallback;
                                sprite._agCallback = undefined;
                                temp(sprite);
                            }
                            this._waitFrameArray.splice(index,1);
                            ++bDisposeCount;
                        }else{
                            ++index;
                        }
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
                            var tempArray = atlas.getSpriteFrames();
                            var tempArray2 = [];
                            for(var i=0;i<tempArray.length;++i){
                                tempArray2.push(tempArray[i].name);
                            }
                            this._fileMap[this._downloadArray[0]] = tempArray2;

                            //this._atlasArray.push(this._downloadArray[0]);
                            //++this._test;
                            //cc.log("heihei2:"+this._test);
                            this._downloadArray.splice(0,1);
                            this._bLoading = false;
                        }.bind(this));
                    }
                }else{
                    for(var i=this._waitFrameArray.length-1;i>=0;--i){
                        var sprite = this._waitFrameArray[i];
                        if(cc.isValid(sprite) && cc.isValid(sprite.node)){
                            var name = sprite._agName;
                            var pos = name.lastIndexOf('/');
                            var before = name.substr(0,pos);
                            var trueBefore = before;
                            if(sprite._agTime)trueBefore = before+'_'+sprite._agTime;
                            if(this._fileMap[trueBefore]){
                                if(!sprite._agTime)sprite._agTime = 0;
                                ++sprite._agTime;
                                trueBefore = before+'_'+sprite._agTime;
                                if(this._downloadArray.indexOf(trueBefore)==-1)this._downloadArray.push(trueBefore);
                            }else{
                                cc.log('not exist frame:'+name);
                                this._waitFrameArray.splice(i,1);
                            }
                        }else{
                            this._waitFrameArray.splice(i,1);
                        }
                    }
                }
            }
        }
    },


    release:function(){
        return;
        for(var i=0;i<this._atlasArray.length;++i){
            //var deps = cc.loader.getDependsRecursively(this._atlasArray[i]);
            //cc.loader.release(deps);
            //cc.loader.releaseRes(this._atlasArray[i], cc.Texture2D);




            //cc.log("ww:"+cc.loader.getResCount());
            var atlas = cc.loader.getRes(this._atlasArray[i],cc.SpriteAtlas);
            ////cc.log("ww2:"+cc.loader.getResCount());
            var deps = cc.loader.getDependsRecursively(atlas);
            //cc.loader.release(deps);

            //var obj = {};
            //for(var key in cc.loader._cache){
            //    obj[key] = "1";
            //}
            //for(var i=0;i<deps.length;++i){
            //    if(obj[deps[i]]){
            //        delete obj[deps[i]];
            //    }
            //}
            //cc.log(obj);

            //cc.loader.releaseAsset(this.weapon.getComponent(cc.Sprite).spriteFrame);
            //cc.loader.releaseAsset(atlas);

            //for(var j=0;j<deps.length;++j){
            //    cc.loader.release(deps[j],cc.SpriteFrame);
            //    cc.loader.release(deps[j],cc.SpriteAtlas);
            //    cc.loader.release(deps[j], cc.Texture2D);
            //}
            //cc.loader.releaseRes(this._atlasArray[i],cc.SpriteFrame);
            //cc.loader.releaseRes(this._atlasArray[i],cc.SpriteAtlas);
            //cc.loader.releaseRes(this._atlasArray[i], cc.Texture2D);
        }
        //for(var key in cc.loader._cache){
        //    var array = cc.loader._cache[key].dependKeys;
        //    if(Array.isArray(array)){
        //        for(var i=array.length-1;i>=0;--i){
        //            if(array[i].indexOf('resources/map')!=-1 || array[i].indexOf('resources/ani/effect')!=-1 || array[i].indexOf('resources/ani/hum')!=-1){
        //                var array2 = cc.loader.getDependsRecursively(key);
        //                for(var j=array2.length;j>=0;--j){
        //                    cc.loader.release(array2[j]);
        //                }
        //            }
        //        }
        //    }
        //}
        cc.sys.garbageCollect();
        //this._atlasArray = [];
        //this._test = 0;
    },
});
