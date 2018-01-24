/**
 * Created by bot.su on 2017/6/21.
 * 2d地图
 */


cc.Class({
    extends: cc.Component,
    properties: {},
    init: function (name) {
        var map = ag.gameConst._terrainMap[ag.gameLayer._player._data.mapId];
        this._width = map.mapX;
        this._height = map.mapY;
        this._dataArray = [];
        this._mapTile = {};
        if(this._fileResArray){
            for(var i=0;i<this._fileResArray.length;++i){
                cc.loader.releaseRes(this._fileResArray[i], cc.SpriteFrame);
                cc.loader.releaseRes(this._fileResArray[i], cc.Texture2D);
            }
        }
        this._fileResArray = [];
        cc.loader.loadRes(name,function(err,data){
            var array = data.split(',');
            this._dataArray = array;
            if(ag.gameLayer && ag.gameLayer._player){
                ag.gameLayer._player.setLocation(ag.gameLayer._player.getLocation(),true);
            }
        }.bind(this));
    },


    setCenter:function(location){
        var w = ag.gameConst.tileWidth,h=ag.gameConst.tileHeight;
        var logicX = Math.floor((location.x+0.5)*w/512), logicY = Math.floor((location.y+0.5)*h/512);
        var logicXAll = Math.ceil((this._width*w-1)/512), logicYAll = Math.ceil((this._height*h-1)/512);
        var oldMapTile = this._mapTile;
        this._mapTile = {};
        //增加
        for(var i=-1;i<=1;++i){
            for(var j=-2;j<=2;++j){
                if(logicX+j>=0 && logicX+j<logicXAll && logicY+i>=0 && logicY+i<logicYAll){
                    var str = ''+(logicX+j)+','+(logicY+i);
                    if(oldMapTile[str]){
                        this._mapTile[str] = oldMapTile[str];
                    }else{
                        this._mapTile[str] = this.getSprite(j,i,w,h,logicX,logicY,logicXAll,logicYAll);
                    }
                }
            }
        }
        //删除
        for(var key in oldMapTile){
            if(!this._mapTile[key]){
                oldMapTile[key].destroy();
            }
        }
    },


    getSprite :function(j,i,w,h,logicX,logicY,logicXAll,logicYAll){
        var sprite = new cc.Node().addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        sprite.node.setPosition((logicX+j+0.5)*512-w*this._width/2,(logicY+i+0.5)*512-h*this._height/2);
        this.node.addChild(sprite.node);
        var name = 'mapRes/'+ag.gameConst._terrainMap[ag.gameLayer._player._data.mapId].resPad+ag.jsUtil.pad0For3((logicY+i)*logicXAll+logicX+j);
        if(this._fileResArray.indexOf(name)==-1)this._fileResArray.push(name);
        cc.loader.loadRes(name, cc.SpriteFrame,function (err, spriteFrame) {
            if(cc.isValid(sprite)){
                sprite.spriteFrame = spriteFrame;
                sprite.spriteFrame.getTexture().setAliasTexParameters();
            }
        }.bind(this));
        return sprite.node;
    },


    //获取碰撞
    isCollision:function(location){
        if(location.x<0 || location.x>=this._width || location.y<0 || location.y>=this._height)return true;
        if(!this._dataArray || this._dataArray.length==0)return true;
        return this._dataArray[location.y*this._width+location.x+2]=='1';
    },
});
