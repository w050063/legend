/**
 * Created by bot.su on 2017/6/21.
 * 2d地图
 */


cc.Class({
    extends: cc.Component,
    properties: {
        _dataArray: null,
    },


    //初始化地图信息,顺序为rgbap.红绿蓝,透明度,地图分布
    init: function (nameArray) {
        this.test();
        return;
        this._nodeTips = new cc.Node();
        var tips = this._nodeTips.addComponent(cc.Label);
        tips.string = "等待10秒,加载地图中";
        ag.gameLayer.node.addChild(this._nodeTips);

        this._dataArray = [];
        for(var i=0;i<nameArray.length;++i){
            this.loadImageData(nameArray[i],function(data,w,h){
                var self = this.self;
                self._dataArray.push([this.num,data,w,h]);
                self.loadOver();
            }.bind({self:this,num:i}));
        }
    },


    test:function(){
        ag.altasTask.addTask("map/terrainMap",function (err, atlas) {
            var w = 170,h=170, x=Math.ceil(ag.gameConst._terrainMap['t0'].mapX*100/w),y=Math.ceil(ag.gameConst._terrainMap['t0'].mapY*60/h);
            for(var i=0;i<y;++i){
                for(var j=0;j<x;++j){
                    var node = new cc.Node();
                    var sprite = node.addComponent(cc.Sprite);
                    node.setPosition(Math.round(w*(0.5+j-x/2)),Math.round(h*(0.5+i-y/2)));
                    this.node.addChild(node,0);
                    sprite.spriteFrame = atlas.getSpriteFrame(""+(i%2)+(j%2));
                    sprite.spriteFrame.getTexture().setAliasTexParameters();
                }
            }
        }.bind(this));
    },


    //加载完成
    loadOver:function(){
        if(this._dataArray.length<6)return;
        //this._nodeTips.removeFromParent();
        this._nodeTips.destroy();


        this._dataArray.sort(function(a,b){return a[0]-b[0];});
        var tile = 32, reTile = 256/tile;
        var data = this._dataArray[4][1],w = this._dataArray[4][2],h = this._dataArray[4][3];
        var deepData = this._dataArray[5][1];
        var newData = new Uint8ClampedArray(data.length*tile*tile);


        //遍历地图模块分布，并且定义临时常量，进行优化
        var cw4 = w*4, cw4Tile = cw4*tile;
        for(var i=0;i<h;++i){
            var ciw4 = i*cw4, ciTile = i*tile, ciModTile = i%reTile*tile;
            for(var j = 0;j<w;++j){
                var cijIndex = ciw4+j*4, cjTile = j*tile, cjModTile = j%reTile*tile;
                var temp = this._dataArray[this.getDataNum(cijIndex)][1];
                var tempDown = this._dataArray[this.getDataNum(cijIndex-cw4)][1];
                var tempUp = this._dataArray[this.getDataNum(cijIndex+cw4)][1];
                var tempLeft = this._dataArray[this.getDataNum(cijIndex-4)][1];
                var tempRight = this._dataArray[this.getDataNum(cijIndex+4)][1];
                var deepRate = (this._dataArray[5][1][cijIndex]+0)/255+0.5;
                deepRate = deepRate*deepRate*deepRate;


                //处理每个小格子
                for(var m=0;m<tile;++m){
                    var cimw4Tile = (ciTile+m)*cw4Tile,cim1024 = (ciModTile+m)*1024,cmDivTile = m/tile;
                    for(var n=0;n<tile;++n){
                        var index = cimw4Tile+(cjTile+n)*4, index2 = cim1024+(cjModTile+n)*4, cnDivTile = n/tile;
                        newData[index] = temp[index2], newData[index+1] = temp[index2+1], newData[index+2] = temp[index2+2], newData[index+3] = temp[index2+3];
                        if(i>0 && m<=n && m<=32-n && temp!=tempDown){//逻辑坐标下
                            var rate1 = 0.5+cmDivTile, rate2 = 0.5-cmDivTile;
                            this.setDataColor(newData,temp,tempDown,index,index2,rate1,rate2);
                        }
                        if(i<h-1 && m>=n && m>=32-n && temp!=tempUp){//逻辑坐标上
                            var rate1 = 1.5-cmDivTile, rate2 = cmDivTile-0.5;
                            this.setDataColor(newData,temp,tempUp,index,index2,rate1,rate2);
                        }
                        if(j>0 && m>n && m<32-n && temp!=tempLeft){//逻辑坐标左
                            var rate1 = 0.5+cnDivTile, rate2 = 0.5-cnDivTile;
                            this.setDataColor(newData,temp,tempLeft,index,index2,rate1,rate2);
                        }
                        if(j<w-1 && m<n && m>32-n && temp!=tempRight){//逻辑坐标右
                            var rate1 = 1.5-cnDivTile, rate2 = cnDivTile-0.5;
                            this.setDataColor(newData,temp,tempRight,index,index2,rate1,rate2);
                        }
                        newData[index] = newData[index]*deepRate;
                        if(newData[index]>255)newData[index]=255;
                        newData[index+1] = newData[index+1]*deepRate;
                        if(newData[index+1]>255)newData[index+1]=255;
                        newData[index+2] = newData[index+2]*deepRate;
                        if(newData[index+2]>255)newData[index+2]=255;
                    }
                }
            }
        }
        this.addComSprite(newData,w*tile,h*tile);


        //处理完毕，删除保存的数据
        delete this._dataArray;
    },


    //设置颜色函数
    setDataColor:function(newData,temp,tempN,index,index2,rate1,rate2){
        newData[index] = temp[index2]*rate1+tempN[index2]*rate2;
        newData[index+1] = temp[index2+1]*rate1+tempN[index2+1]*rate2;
        newData[index+2] = temp[index2+2]*rate1+tempN[index2+2]*rate2;
    },


    //得到当前的编号
    getDataNum:function(index){
        var data = this._dataArray[4][1];
        if(data[index+3]==0)return 3;
        var b = data[index]>data[index+1];
        var ret = b?0:1;
        b = Math.max(data[index],data[index+1])>data[index+2];
        ret = b?ret:2;
        return ret;
    },


    //获取图片的rgba数据
    loadImageData:function(name,callback){
        var myImage = new Image();
        myImage.src = cc.url.raw(name);
        myImage.onload = function(){
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var w = myImage.width,h = myImage.height;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(myImage,0,0,w,h);
            var imageData = ctx.getImageData(0,0,w,h);
            callback(imageData.data,w,h);
        }.bind(this);
    },


    //创建精灵
    addComSprite:function(data,w,h){
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = w;
        canvas.height = h;
        var imageData = ctx.createImageData(w,h);
        imageData.data.set(data);
        ctx.putImageData(imageData,0,0);

        var img = new Image();
        img.src = canvas.toDataURL('image/png');
        img.onload = function(){
            var texture = new cc.Texture2D();
            texture.generateMipmaps = false;
            texture.initWithElement(img);
            texture.handleLoadedTexture();
            var sprite = this.node.addComponent(cc.Sprite);
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        }.bind(this);
    },
});
