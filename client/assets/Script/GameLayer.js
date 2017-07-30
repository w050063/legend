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


        cc.audioEngine.play(cc.url.raw("resources/music/background.mp3"),true,1);


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



        //启动定时器,每秒执行一次
        this.schedule(ag.buffManager.update1.bind(ag.buffManager),1);
        this.schedule(ag.buffManager.update5.bind(ag.buffManager),5);
        this.schedule(ag.altasTask.update001.bind(ag.altasTask),0.01);
    },


    // called every frame
    update: function (dt) {
        //设置网络
        ag.agSocket.doWork();


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


    //根据id获得角色
    getRole:function(id){
        return this._roleMap[id];
    },



    //根据原点和锁定点获得方向
    getDirection:function (location2,location1) {
        var x,y;
        if(location1.x>location2.x)x = 1;
        else if(location1.x<location2.x)x = -1;
        else x = 0;
        if(location1.y>location2.y)y = 1;
        else if(location1.y<location2.y)y = -1;
        else y = 0;
        if(x==0 && y==0)y = -1;
        return ag.gameConst.directionStringArray.indexOf(''+x+','+y);
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



    getMapXYRole:function(mapId,x,y){
        return ''+mapId+','+x+','+y;
    },


    //根据碰撞检测得到正确的方向
    getOffsetWithColloison:function(role,direction){
        if(direction==-1)return -1;
        var offset = ag.gameConst.directionArray[direction];
        if(this.isCollision(role._data.mapId,role._data.x+offset.x,role._data.y+offset.y)==false){
            if(role._data.camp==ag.gameConst.campMonster){
                if(!this._roleXYMap[''+role._data.mapId+','+(role._data.x+offset.x)+','+(role._data.y+offset.y)])return direction;
            }else{
                return direction;
            }
        }
        var pointArray=ag.gameConst.directionArray;//可走方向
        var index = direction;


        if(role._data.camp==ag.gameConst.campMonster){//怪物
            var percent = [10000,1000,100,10,1];//权重比例
            var weight=[];
            var max = 0;
            for(var i=0;i<8;++i){
                if(this.isCollision(role._data.mapId,role._data.x+pointArray[i].x,role._data.y+pointArray[i].y) ||
                    this._roleXYMap[this.getMapXYRole(role._data.mapId,role._data.x+pointArray[i].x,role._data.y+pointArray[i].y)]){
                    weight.push(0);
                }else{
                    var dis = Math.abs(index-i);
                    if(dis>4)dis = 8-dis;
                    weight.push(percent[dis]);
                    max += weight[i];
                }
            }

            //遍历权重，计算返回哪一个方向
            var curWeight = 0;
            var randNum=Math.random()*max;
            for(var i=0;i<8;++i){
                curWeight += weight[i];
                if(randNum<curWeight)return i;
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
                    return index;
                }
            }
        }

        return -1;
    },


    //get every one attack rangle..
    getAttackDistance:function(role1,role2){
        var myLocation=role1.getLocation();
        var enemyLocation=role2.getLocation();
        var x=Math.abs(enemyLocation.x-myLocation.x);
        var y=Math.abs(enemyLocation.y-myLocation.y);
        if(role1._data.type=="m0"){
            if (x<=2 && y<=2 && x+y!=3)return true;
        }else{
            if(cc.pDistance(myLocation,enemyLocation)<=role1.getMst().attackDistance)return true;
        }
        return false;
    },


    //解除此角色的所有锁定
    delLockedRole:function (role) {
        for(var key in this._roleMap){
            var temp = this._roleMap[key];
            if(temp._ai && temp._ai._locked==role){
                temp._ai._locked = null;
            }
        }
    },


    //获得指定区域角色数组
    getRoleFromCenterXY:function (mapId,center,x,y) {
        x = x?x:0;
        y = y?y:0;
        var retArray = [];
        for(var key in this._roleMap){
            var data = this._roleMap[key]._data;
            if(mapId==data.mapId && data.x>=center.x-x && data.x<=center.x+x && data.y>=center.y-y && data.y<=center.y+y){
                retArray.push(this._roleMap[key]);
            }
        }
        return retArray;
    },


    tagAction:function(action,tag){
        action.setTag(tag);
        this.node.runAction(action);
    },


    //是否攻击
    isEnemyCamp:function(role1,role2){
        if(role1!=role2 && role1._state != ag.gameConst.stateDead && role2._state != ag.gameConst.stateDead){
            if(role1._data.camp!=role2._data.camp)return true;
            if(role1._data.camp==ag.gameConst.campLiuxing && role2._data.camp==ag.gameConst.campLiuxing)return true;
        }
        return false;
    },


    //获得可以站立的位置
    getStandLocation: function (mapId,x,y,r){
        x = x-r+Math.floor(Math.random()*(2*r+1));
        y = y-r+Math.floor(Math.random()*(2*r+1));
        if(this.isCollision(mapId,x,y)==false)return {x:x,y:y};
        for(var i=0;i<50;++i){
            if(this.isCollision(mapId,x,y+i)==false)return {x:x,y:y+i};
            if(this.isCollision(mapId,x,y-i)==false)return {x:x,y:y-i};
            if(this.isCollision(mapId,x-i,y)==false)return {x:x-i,y:y};
            if(this.isCollision(mapId,x+i,y)==false)return {x:x+i,y:y};
            if(this.isCollision(mapId,x+i,y+i)==false)return {x:x+i,y:y+i};
            if(this.isCollision(mapId,x-i,y-i)==false)return {x:x-i,y:y-i};
            if(this.isCollision(mapId,x-i,y+i)==false)return {x:x-i,y:y+i};
            if(this.isCollision(mapId,x+i,y-i)==false)return {x:x+i,y:y-i};
        }
        console.log("error position:"+mapId+",x:"+x+",y:"+y);
        return {x:0,y:0};
    },
});
