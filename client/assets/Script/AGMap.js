/**
 * Created by bot.su on 2017/6/21.
 * 2d地图
 */


cc.Class({
    extends: cc.Component,
    properties: {},

    init: function (name) {
        this._width = 0;
        this._height = 0;
        this._dataArray = [];
        this._screenRadius = 8;
        this._mapTile = {};
        this._mapObj = {};
        this._center = cc.p(0,0);
        cc.loader.loadRes(name,function(err,data){
            var array = data.split(',');
            this._dataArray = array;
            this._width = parseInt(array[0]);
            this._height = parseInt(array[1]);
            this.setCenter(this._center);
        }.bind(this));
    },


    setCenter:function(location){
        this._center = location;
        if(this._dataArray.length==0)return;
        var w = 48,h=32;
        var oldMapTile = this._mapTile;
        this._mapTile = {};
        var oldMapObj = this._mapObj;
        this._mapObj = {};
        var start = cc.p(Math.max(location.x-this._screenRadius,0),Math.max(location.y-this._screenRadius,0));
        var end = cc.p(Math.min(location.x+this._screenRadius,this._width-1),Math.min(location.y+this._screenRadius,this._height-1));
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
            }
        }
        start.y = Math.max(start.y-10,0);//确保对象都能加载上
        for(var i=start.y;i<=end.y;++i){
            for(var j=start.x;j<=end.x;++j){
                var str = ''+j+','+i;
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
    },


    //获取碰撞
    isCollision:function(location){
        if(location.x<0 || location.x>=this._width || location.y<0 || location.y>=this._height)return true;
        return this._dataArray[(location.x*this._width+this._height-1-location.y)*3+4]=='1';
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
