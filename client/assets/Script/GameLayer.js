/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗场景
 */


var Role = require("Role");
var AGTerrain = require("AGTerrain");
cc.Class({
    extends: cc.Component,
    properties: {},


    // use this for initialization
    onLoad: function () {
        ag.gameLayer = this;
        this._roleMap = {};
        this._player = null;

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



        //设置网络
        ag.agSocket.doSRole();
        ag.agSocket.doSMove();
    },


    // called every frame
    update: function (dt) {
        //更新位置
        if(this._player){
            this._map.node.setPosition(-this._player.node.x,-this._player.node.y);
        }
    },


    //增加一个角色
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
