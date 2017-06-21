/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗场景
 */


var Role = require("Role");
var AGTerrain = require("AGTerrain");
cc.Class({
    extends: cc.Component,

    properties: {
        jockSprite: {
            default: null,
            type: cc.Sprite
        },
    },

    // use this for initialization
    onLoad: function () {
        ag.gameLayer = this;
        this._roleMap = {};
        this._player = null;
        this._map = this.node.getChildByName("map1");
        this._touchPoint = null;
        this._touchCenter = null;
        this.jockSprite.node.setLocalZOrder(1);
        this.jockSprite.node.active = false;

        //cc.audioEngine.playMusic(res.background_mp3, true);


        //测试新地图
        var node = new cc.Node();
        node.x = 0,node.y = 0;
        this._map = node.addComponent(AGTerrain);
        this.node.addChild(node);
        this._map.init(["resources/map/terrain0.png","resources/map/terrain1.png",
            "resources/map/terrain2.png","resources/map/terrain3.png","resources/map/terrain4.png","resources/map/terrain5.png"]);
        //node.setScale(0.2);



        //创建主角
        var node = new cc.Node();
        this._player = node.addComponent(Role);
        this._player.init(ag.userInfo._data);
        this._map.node.addChild(node);
        this._roleMap[this._player._data.id] = this._player;



        //触摸事件
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                var size = cc.director.getWinSize();
                this._touchCenter = null;
                this._touchPoint = touch.getLocation();
                this.jockSprite.node.active = false;
                return true;
            }.bind(this),
            onTouchMoved: function (touch, event) {
                var size = cc.director.getWinSize();
                this._touchCenter = touch.getStartLocation();
                this._touchPoint = touch.getLocation();
                this.jockSprite.node.active = true;
                this.jockSprite.node.setPosition(cc.pSub(this._touchCenter,cc.p(size.width/2,size.height/2)));
            }.bind(this),
            onTouchEnded: function (touch, event) {
                this._touchCenter = null;
                this._touchPoint = null;
                this.jockSprite.node.active = false;
            }.bind(this),
            swallowTouches: true
        }, this.node);



        ag.agSocket.doSRole();
        ag.agSocket.doSMove();
    },


    // called every frame
    update: function (dt) {
        //执行玩家操作
        if(this._touchPoint){
            if(this._touchCenter) {
                var offset = null;
                var radian = cc.pToAngle(cc.pSub(this._touchPoint, this._touchCenter));
                if (Math.abs(radian) > Math.PI * 7 / 8)offset = cc.p(-1, 0);
                else if (radian > Math.PI * 5 / 8)offset = cc.p(-1, 1);
                else if (radian > Math.PI * 3 / 8)offset = cc.p(0, 1);
                else if (radian > Math.PI * 1 / 8)offset = cc.p(1, 1);
                else if (radian > -Math.PI * 1 / 8)offset = cc.p(1, 0);
                else if (radian > -Math.PI * 3 / 8)offset = cc.p(1, -1);
                else if (radian > -Math.PI * 5 / 8)offset = cc.p(0, -1);
                else if (radian > -Math.PI * 7 / 8)offset = cc.p(-1, -1);
                this._player.move(offset);
            }else{
                var size = cc.director.getWinSize();
                var x = this._touchPoint.x;
                var y = this._touchPoint.y;
                var center = 50;
                var offset = {};
                if(x<size.width/2-center)offset.x=-1;
                else if(x>size.width/2+center)offset.x=1;
                else offset.x=0;
                if(y<size.height/2-center)offset.y=-1;
                else if(y>size.height/2+center)offset.y=1;
                else offset.y=0;
                this._player.move(offset);
            }
        }


        //更新位置
        if(this._player){
            this._map.node.setPosition(-this._player.node.x,-this._player.node.y);
        }
    },


    addRole:function(data){
        var node = new cc.Node();
        var role = node.addComponent(Role);
        role.init(data);
        this._map.node.addChild(node);
        this._roleMap[role._data.id] = role;
    },


    getRole:function(id){
        return this._roleMap[id];
    },



    //碰撞检测
    isCollision:function(mapId,x,y){
        var obj = ag.gameConst._terrainMap[mapId];
        if(x<0 || x>obj.mapX || y<0 || y>obj.mapY)return true;
        for(var i=0;i<obj.collision.length;++i){
            if(obj.collision[i][0]==x && obj.collision[i][1]==y)return true;
        }
        return false;
    },


    //根据碰撞检测得到正确的方向
    getOffsetWithColloison:function(role,offset){
        if(offset.x==0 && offset.y==0)return null;
        if(this.isCollision(role._data.mapId,role._data.x+offset.x,role._data.y+offset.y)==false)return offset;
        var pointStringArray=['0,1','1,1','1,0','1,-1','0,-1','-1,-1','-1,0','-1,1'];//可走方向
        var pointArray=[cc.p(0,1),cc.p(1,1),cc.p(1,0),cc.p(1,-1),cc.p(0,-1),cc.p(-1,-1),cc.p(-1,0),cc.p(-1,1)];//可走方向
        var index = pointStringArray.indexOf(''+offset.x+','+offset.y);


        if(role._camp==ag.gameConst.campMonster){//怪物
            var percent = (role._camp==ag.gameConst.campMonster)?[16,4,1,1]:[100000000,10000,1,1];//权重比例
            var weight=[];
            var max = 0;
            for(var i=0;i<8;++i){
                if(this.isCollision(role._data.mapId,role._data.x+pointArray[i].x,role._data.y+pointArray[i].y) || this._roleXYMap[role.getMapXYString()]){
                    weight.push(0);
                }else{
                    var dis = Math.abs(index-i);
                    if(dis>4)dis = 8-dis;
                    dis = percent[dis-1];
                    weight.push(dis);
                    max += dis;
                }
            }

            //遍历权重，计算返回哪一个方向
            var curWeight = 0;
            var randNum=Math.random()*max;
            for(var i=0;i<8;++i){
                curWeight += weight[i];
                if(randNum<curWeight)return pointArray[i];
            }
        }else{//英雄
            var randNum=Math.random()<0.5 ? -1:1;
            for(var i=0;i<8;++i){
                if(this.isCollision(role._data.mapId,role._data.x+pointArray[index].x,role._data.y+pointArray[index].y)){
                    index+=(i+1)*randNum;
                    randNum=-randNum;
                    if(index>7)index -= 8;
                    else if(index<0)index += 8;
                }else{
                    return pointArray[index];
                }
            }
        }

        return null;
    }
});
