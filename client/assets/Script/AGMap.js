/**
 * Created by bot.su on 2017/6/21.
 * 2d地图
 */


cc.Class({
    extends: cc.Component,
    properties: {},

    init: function () {
        this._width = 0;
        this._height = 0;
        this._dataArray = [];
        this._screenRadius = 11;
        this._mapTile = {};
        this._mapObj = {};
        this._center = cc.p(0,0);
        cc.loader.loadRes('map/tucheng',function(err,data){
            var array = data.split(',');
            this._dataArray = array;
            this._width = parseInt(array[0]);
            this._height = parseInt(array[1]);
        }.bind(this));
    },


    setCenter:function(location){
        //location = cc.pMult(location,2);
        if(this._dataArray.length>0 && cc.pDistance(location,this._center)>=3.9){
            var w = 46,h=30;
            var oldMapTile = this._mapTile;
            this._mapTile = {};
            var oldMapObj = this._mapObj;
            this._mapObj = {};
            var start = cc.p(Math.max(location.x-this._screenRadius,0),Math.min(location.y-this._screenRadius-5,149));//确保都能加载上
            var end = cc.p(Math.max(location.x+this._screenRadius,0),Math.min(location.y+this._screenRadius,149));
            //增加
            for(var i=start.y;i<=end.y;++i){
                for(var j=start.x;j<=end.x;++j){
                    var str = ''+j+','+i;
                    if(oldMapTile[str]){
                        this._mapTile[str] = oldMapTile[str];
                    }else{
                        var name = this._dataArray[(j*this._width+this._height-1-i)*3+2];
                        if(name && name!='-1'){
                            var node = this.getTileSprite(name);
                            node.setPosition(w*(0.5+j-this._width/2),h*(0.5+i-this._height/2));
                            this._mapTile[str] = node;
                        }
                    }
                    if(oldMapObj[str]){
                        this._mapObj[str] = oldMapObj[str];
                    }else{
                        var name = this._dataArray[(j*this._width+this._height-1-i)*3+3];
                        if(name && name!='0'){
                            var node = this.getObjectSprite(name);
                            node.setPosition(w*(0.5+j-this._width/2),h*(0.5+i-this._height/2));
                            var zorder = Math.round(10000-node.y);
                            node.setLocalZOrder(zorder);
                            this._mapObj[str] = node;
                        }
                    }
                }
            }

            //删除
            for(var key in oldMapTile){
                if(!this._mapTile[key]){
                    ag.spriteCache.put(oldMapTile[key].getComponent(cc.Sprite));
                }
            }
            for(var key in oldMapObj){
                if(!this._mapObj[key]){
                    if(oldMapObj[key].childrenCount>0){
                        ag.spriteCache.put(oldMapObj[key].children[0].getComponent(cc.Sprite));
                    }else{
                        ag.spriteCache.put(oldMapObj[key].getComponent(cc.Sprite));
                    }
                }
            }
        }
    },


    getTileSprite:function(name){
        var sprite = ag.spriteCache.get('map/tile/'+name,function(sprite){
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            sprite.trim = false;
            sprite.spriteFrame.getTexture().setAliasTexParameters();
            sprite.node.setAnchorPoint(cc.p(24/sprite.node.width,(sprite.node.height-16)/sprite.node.height));
        }.bind(this));
        this.node.addChild(sprite.node);
        return sprite.node;
    },


    getObjectSprite:function(name){
        var before = name.split('_');
        var sprite = ag.spriteCache.get('map/object'+before[0]+'/'+name,function(sprite){
            if(sprite.spriteFrame){
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
                sprite.trim = false;
                sprite.spriteFrame.getTexture().setAliasTexParameters();
                sprite.node.setAnchorPoint(cc.p(0.5,16.0/sprite.node.height));
            }else{
                var sprite2 = ag.spriteCache.get('map/object'+before[0]+'_1/'+name,function(sprite2){
                    sprite2.sizeMode = cc.Sprite.SizeMode.RAW;
                    sprite2.trim = false;
                    sprite2.spriteFrame.getTexture().setAliasTexParameters();
                    sprite2.node.setAnchorPoint(cc.p(0.5,16.0/sprite2.node.height));
                }.bind(this));
                sprite.node.addChild(sprite2.node);
            }
        }.bind(this));
        this.node.addChild(sprite.node);
        return sprite.node;
    },
});
