/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗逻辑
 */


var Role = require("./Role");
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
        setInterval(function(){
            ++this._gameTime;
            this.refresh();


            //测试主动发送
            //var uids = [];
            //for(var key in this._roleMap){
            //    var array = this._roleMap[key];
            //    for(var i=0;i<array.length;++i){
            //        uids.push(array[i]._data.uid);
            //    }
            //}
            //ag.jsUtil.send("onChat","wwwww",uids);
        }.bind(this),1000);
	},


    //获得某玩家
    getPlayer:function(uid){
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
            var pos = this.getStandLocation(ag.gameConst._bornMap,ag.gameConst._bornX,ag.gameConst._bornY);
            player._data.x = pos.x;
            player._data.y = pos.y;
            player._data.name = name;
            player._data.sex = sex;
            player._data.camp = ag.gameConst.campLiuxing;
            player._data.mapId = ag.gameConst._bornMap;
            player._data.direction = 4;//默认朝下
            player._data.moveSpeed = 1;
            player._data.attackSpeed = 0.8;
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
            if(data.mapId==player._data.mapId && data.id!=player._data.id)array.push(data);
        }

        //发送当前场景的数据
        ag.jsUtil.send("sRole",JSON.stringify(array),[uid]);


        //通知其他人。
        for(var i=0;i<array.length;++i){
            if(array[i].camp!=ag.gameConst.campMonster){
                ag.jsUtil.send("sRole",JSON.stringify([player._data]),[array[i].id]);
            }
        }
    },


    //怪物刷新函数
    refresh:function(){
        var reply = {};
        for(var key in ag.gameConst._terrainMap){
            var map = ag.gameConst._terrainMap[key];
            var array = map.refresh;
            reply[key]=[];
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
                            x = Math.floor(Math.random()*map.mapX);
                            y = Math.floor(Math.random()*map.mapY);
                        }else{
                            x = array[i][1]+Math.floor(Math.random()*(ag.gameConst._bornR*2+1)-ag.gameConst._bornR);
                            y = array[i][2]+Math.floor(Math.random()*(ag.gameConst._bornR*2+1)-ag.gameConst._bornR);
                        }
                        var position = this.getStandLocation(key,x,y);
                        player._data.x = position.x;
                        player._data.y = position.y;
                        player._data.camp = ag.gameConst.campMonster;
                        player._data.mapId = key;
                        player._data.direction = Math.floor(Math.random()*8);
                        player._data.moveSpeed = 1;
                        player._data.attackSpeed = 0.8;
                        this._roleMap[player._data.id] = player;
                        var xyStr = player.getMapXYString();
                        if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
                        this._roleXYMap[xyStr].push(player);
                        reply[key].push(player._data);
                    }
                }
            }
        }

        for(var key in this._roleMap){
            var data = this._roleMap[key]._data;
            if(reply[data.mapId].length>0 && data.camp!=ag.gameConst.campMonster){
                ag.jsUtil.send("sRole",JSON.stringify(reply[data.mapId]),[data.id]);
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
    getStandLocation: function (mapId,x, y) {
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
};
