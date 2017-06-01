/**
 * Created by bot.su on 2017/4/11.
 */
var cc = require("./util/cc");
var JsUtil = require('./util/JsUtil');
var GameConst = require('./util/GameConst');
var SVRole = require("./SVRole");

//核心战斗逻辑
module.exports = {
    //游戏时间
	_gameTime:-1,


	//战斗场景初始化标志
	_bInit:false,


    _baseMonsterId:0,
	
	
	//玩家的二维数组,每个元素是每个场景玩家数组
    _roleMap:{},
	
	
	//初始化战斗数据
	init:function(){
        cc.svGameLayer = this;
        for(var key in GameConst._mapArray){
			this._roleMap[key] = [];
		}


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
            //JsUtil.send("onChat","wwwww",uids);
        }.bind(this),1000);
	},
	
	
	//增加一个玩家
    addPlayer:function(uid,name,type,sex){
		if(!this._bInit){
			this._bInit = true;
            GameConst.init();
			this.init();
		}
		
		var player = this.getPlayer(uid);
		if(!player){
			player = new SVRole(uid,type);
            var pos = this.getStandLocation(GameConst._bornMap,GameConst._bornX,GameConst._bornY);
            player._data.x = pos.x;
            player._data.y = pos.y;
            player._data.name = name;
            player._data.sex = sex;
            player._data.camp = GameConst.campLiuxing;
			this._roleMap[GameConst._bornMap].push(player);
		}

        //确认进入游戏成功。
        JsUtil.send("svEnter",JSON.stringify(player._data),[uid]);


        //返回当前地图所有角色。
        var array = this._roleMap[player.getMapName()];
        var sendArray = [];
        for(var i=0;i<array.length;++i)if(array[i]._data.id!=player._data.id){
            sendArray.push(array[i]._data);
        }
        JsUtil.send("svRole",JSON.stringify(sendArray),[uid]);


        //通知其他人。
        for(var i=0;i<array.length;++i){
            if(array[i]._data.camp!=GameConst.campMonster && array[i]._data.id!=player._data.id){
                JsUtil.send("svRole",JSON.stringify([player._data]),[array[i]._data.id]);
            }
        }
    },


	//根据uid返回玩家数据，mapName地图名字，可选，加速查找。
	getPlayer:function(uid,mapName){
        if(mapName){
            var array = this._roleMap[mapName];
            for(var i=0;i<array.length;++i)if(array[i]._data.id==uid)return array[i];
        }else{
            for(var key in this._roleMap){
                var array = this._roleMap[key];
                for(var i=0;i<array.length;++i)if(array[i]._data.id==uid)return array[i];
            }
        }
		return null;
	},


    //怪物刷新函数
    refresh:function(){
        var reply={};
        for(var key in GameConst._mapArray){
            var map = GameConst._mapArray[key];
            var array = map.refresh;
            reply[key]=[];
            for(var i=0;i<array.length;++i){
                if(this._gameTime%array[i][3]==0){//时间正好是倍数，可以刷新了
                    var count = this.getCountWithType(map.name,array[i][0]);
                    var maxCount = array[i][4];
                    for(var j=count;j<maxCount;++j){
                        var player = new SVRole('m'+(++this._baseMonsterId),array[i][0]);
                        player.mid = array[i][0];
                        var x= 0,y=0;
                        if(array[i][1]==-1 && array[i][2]==-1){
                            x = Math.floor(Math.random()*map.mapX);
                            y = Math.floor(Math.random()*map.mapY);
                        }else{
                            x = array[i][1]+Math.floor(Math.random()*(GameConst._bornR*2+1)-GameConst._bornR);
                            y = array[i][2]+Math.floor(Math.random()*(GameConst._bornR*2+1)-GameConst._bornR);
                        }
                        var position = this.getStandLocation(map.name,x,y);
                        player._data.x = position.x;
                        player._data.y = position.y;
                        player._data.camp = GameConst.campMonster;
                        this._roleMap[map.name].push(player);
                        reply[key].push(player._data);
                    }
                }
            }
        }

        for(var key in this._roleMap){
            if(reply[key].length>0){
                var array = this._roleMap[key];
                for(var i=0;i<array.length;++i)if(array[i]._data.camp!=GameConst.campMonster){
                    JsUtil.send("svRole",JSON.stringify(reply[key]),[array[i]._data.id]);
                }
            }
        }
    },


    //获得某个地图上，某个怪物剩余多少
    getCountWithType:function(mapName,monsterName){
        var count =0;
        var array = this._roleMap[mapName];
        for(var i=0;i<array.length;++i){
            if(array[i]._data.type==monsterName)++count;
        }
        return count;
    },


    //获得可以站立的位置
    getStandLocation: function (mapName,x, y) {
        if(this.isCollision(mapName,x,y)==false)return {x:x,y:y};
        for(var i=0;i<50;++i){
            if(this.isCollision(mapName,x,y+1)==false)return {x:x,y:y+1};
            if(this.isCollision(mapName,x,y-1)==false)return {x:x,y:y-1};
            if(this.isCollision(mapName,x-1,y)==false)return {x:x-1,y:y};
            if(this.isCollision(mapName,x+1,y)==false)return {x:x+1,y:y};
            if(this.isCollision(mapName,x+1,y+1)==false)return {x:x+1,y:y+1};
            if(this.isCollision(mapName,x-1,y-1)==false)return {x:x-1,y:y-1};
            if(this.isCollision(mapName,x-1,y+1)==false)return {x:x-1,y:y+1};
            if(this.isCollision(mapName,x+1,y-1)==false)return {x:x+1,y:y-1};
        }
        console.log("error position:"+mapName+",x:"+x+",y:"+y);
        return {x:0,y:0};
    },


    //碰撞检测
    isCollision:function(mapName,x,y){
        var obj = GameConst._mapArray[mapName];
        if(x<0 || x>obj.mapX || y<0 || y>obj.mapY)return true;
        for(var i=0;i<obj.collision.length;++i){
            if(obj.collision[i][0]==x && obj.collision[i][1]==y)return true;
        }
        return false;
    },
};
