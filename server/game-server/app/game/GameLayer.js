/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗逻辑
 */


var Role = require("./Role");
var AIController = require("./AIController");
module.exports = {
	_gameTime:-1,//游戏时间
    _baseMonsterId:0,//怪物id递增标志
    _roleMap:null,//根据角色id标识对象
    _roleXYMap:null,//根据地图xy标识对象
	
	
	//初始化战斗数据
	init:function(){
        ag.gameLayer = this;
        this._roleMap = {};
        this._roleXYMap = {};


        //启动定时器,每秒执行一次
        ag.actionManager.schedule(this,1,function (dt) {
            ++this._gameTime;
            this.refresh();
        }.bind(this));
	},


    //获得某玩家
    getRole:function(uid){
        return this._roleMap[uid];
    },
	
	
	//增加一个玩家
    addPlayer:function(uid,name,type,sex){
		var player = this._roleMap[uid];
		if(!player){
			player = new Role();
            player._data = {};
            player._data.id = uid;
            player._data.type = type;
            var pos = this.getStandLocation(ag.gameConst._bornMap,ag.gameConst._bornX,ag.gameConst._bornY,ag.gameConst._bornR);
            player._data.x = pos.x;
            player._data.y = pos.y;
            player._data.name = name;
            player._data.sex = sex;
            player._data.camp = ag.gameConst.campLiuxing;
            player._data.mapId = ag.gameConst._bornMap;
            player._data.direction = 4;//默认朝下
            player._data.level = 0;
            player.resetAllProp();
            if(player._data.type=="m0"){
                player._data.clothes = player._data.sex==1?"fightertwogirl":"fightertwoboy";
            }else if(player._data.type=="m1"){
                player._data.clothes = player._data.sex==1?"magiciantwogirl":"magiciantwoboy";
            }else if(player._data.type=="m2"){
                player._data.clothes = player._data.sex==1?"taoisttwogirl":"taoisttwoboy";
            }
			this._roleMap[uid] = player;
            var xyStr = player.getMapXYString();
            if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
            this._roleXYMap[xyStr].push(player);
		}

        //确认进入游戏成功。
        ag.jsUtil.send("sEnter",JSON.stringify(player._data),[uid]);


        //返回当前地图非自己的角色。
        var array = [];
        for(var key in this._roleMap){
            var data = this._roleMap[key]._data;
            if(data.mapId==player._data.mapId && data.id!=player._data.id){
                array.push(data);
                ag.jsUtil.sendData("sRole",JSON.stringify(data),uid);
            }
        }

        //通知其他人。
        ag.jsUtil.sendDataExcept("sRole",JSON.stringify(player._data),player);


        //发送buff管理数据
        ag.jsUtil.sendData("sBuffManager",JSON.stringify(ag.buffManager.getData()),player._data.id);
    },


    //怪物刷新函数
    refresh:function(){
        for(var key in ag.gameConst._terrainMap){
            var map = ag.gameConst._terrainMap[key];
            var array = map.refresh;
            for(var i=0;i<array.length;++i){
                if(this._gameTime%array[i][3]==0){//时间正好是倍数，可以刷新了
                    var count = this.getCountWithType(key,array[i][0]);
                    var maxCount = array[i][4];
                    for(var j=count;j<maxCount;++j){
                        var player = new Role();
                        player._data = {};
                        player._data.id = 'm'+(++this._baseMonsterId);
                        player._data.type = array[i][0];
                        var x= 0,y=0;
                        if(array[i][1]==-1 && array[i][2]==-1){
                            x = Math.floor(Math.random()*(map.mapX+1));
                            y = Math.floor(Math.random()*(map.mapY+1));
                        }else{
                            x = array[i][1]+Math.floor(Math.random()*(ag.gameConst._bornR*2+1)-ag.gameConst._bornR);
                            y = array[i][2]+Math.floor(Math.random()*(ag.gameConst._bornR*2+1)-ag.gameConst._bornR);
                        }
                        var position = this.getStandLocation(key,x,y,0);
                        player._data.x = position.x;
                        player._data.y = position.y;
                        player._data.camp = ag.gameConst.campMonster;
                        player._data.mapId = key;
                        player._data.direction = Math.floor(Math.random()*8);
                        player._data.level = 0;
                        player.resetAllProp();
                        this._roleMap[player._data.id] = player;
                        var xyStr = player.getMapXYString();
                        if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
                        this._roleXYMap[xyStr].push(player);
                        player.setAIController(new AIController(player));
                        ag.jsUtil.sendDataAll("sRole",JSON.stringify(player._data));
                    }
                }
            }
        }
    },


    //获得某个地图上，某个怪物剩余多少
    getCountWithType:function(mapId,monsterName){
        var count =0;
        for(var key in this._roleMap){
            var data = this._roleMap[key]._data;
            if(data.mapId==mapId && data.camp==ag.gameConst.campMonster && data.type==monsterName)++count;
        }
        return count;
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
            if(ag.jsUtil.pDistance(myLocation,enemyLocation)<=role1.getMst().attackDistance)return true;
        }
        return false;
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
        for(var i=center.y-y;i<=center.y+y;++i){
            for(var j=center.x-x;j<=center.x+x;++j){
                var array = this._roleXYMap[''+mapId+','+j+','+i];
                if(array){
                    retArray = retArray.concat(array);
                }
            }
        }
        return retArray;
    },



    //是否攻击
    isEnemyCamp:function(role1,role2){
        if(role1!=role2 && role1._state != ag.gameConst.stateDead && role2._state != ag.gameConst.stateDead){
            if(role1._data.camp!=role2._data.camp)return true;
            if(role1._data.camp==ag.gameConst.campLiuxing && role2._data.camp==ag.gameConst.campLiuxing)return true;
        }
        return false;
    },
};
