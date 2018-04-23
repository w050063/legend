/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗逻辑
 */

var fs = require('fs');
var Role = require("./Role");
var AIController = require("./AIController");
var TigerAIController = require("./TigerAIController");
module.exports = {
	_gameTime:-1,//游戏时间
    _baseMonsterId:0,//怪物id递增标志
    _roleMap:null,//根据角色id标识对象
    _roleXYMap:null,//根据地图xy标识对象
	
	
	//初始化战斗数据
	init:function(legendID){
        ag.gameLayer = this;
        this._roleMap = {};
        this._roleXYMap = {};
        this._rankString = "";
        this._rankFirstArray = [];
        this._invincibleMap = {};
        this._sneerLockedMap = {};//嘲讽表,供怪物查找
        this._dirtyRoleArray = {};//脏数据数组


        //区域统计
        this._roleZoneMap = {};
        for(var key in ag.gameConst._terrainMap){
            this._roleZoneMap[key] = [];
        }


        var serverZoneArray = [[1,2,3],[4],[5]];
        var index = -1;
        for(var i=0;i<serverZoneArray.length;++i){
            if(serverZoneArray[i].indexOf(parseInt(legendID))!=-1){
                index = i;
                break;
            }
        }


        this._startZoneDate = JSON.parse(fs.readFileSync('./app/serverlist/serverlist.txt', 'utf8'));
        this._startZoneDate = this._startZoneDate[index]['date'].split('.');
        this._startZoneDate[0] = parseInt(this._startZoneDate[0]);
        this._startZoneDate[1] = parseInt(this._startZoneDate[1])-1;
        this._startZoneDate[2] = parseInt(this._startZoneDate[2]);


        if(index!=-1){
            this._legendID = serverZoneArray[index][0];
            this._legendIDMax = serverZoneArray[index][serverZoneArray[index].length-1];
        }else{
            console.log('error legendID!!!');
            return;
        }


        //启动定时器,每0.1秒执行一次 , 0.1-1.2
        ag.actionManager.schedule(this,0.1,function (dt) {
            for(var key in this._invincibleMap){
                ++this._invincibleMap[key];
                if(this._invincibleMap[key]>=20){
                    delete this._invincibleMap[key];
                }
            }
        }.bind(this));

        //启动定时器,每秒执行一次
        ag.actionManager.schedule(this,1,function (dt) {
            ++this._gameTime;
            this.refresh();


            //处理脏数据
            for(key in this._dirtyRoleArray) {
                var role = this.getRole(key);
                if(role){
                    role.resetAllProp();
                }
                delete this._dirtyRoleArray[key];
            }

            //计算嘲讽表
            this._sneerLockedMap = {};
            for(var key in this._roleMap){
                var role = this._roleMap[key];
                if(role._state != ag.gameConst.stateDead) {
                    if (role.getIsPlayer() && ag.userManager.getOnline(role._data.id)) {
                        this.findLocked(role);
                        if (role._tiger)this.findLocked(role._tiger);
                    }
                }
            }
        }.bind(this));

        //每隔60秒发送一次在线人数
        ag.actionManager.schedule(this,60,function (dt) {
            var rand = Math.random();
            if(rand<0.33){
                ag.jsUtil.sendDataAll("sSystemNotify","12");
            }else if(rand<0.66){
                ag.jsUtil.sendDataAll("sSystemNotify","13");
            }else{
                ag.jsUtil.sendDataAll("sSystemNotify","14");
            }

            this.getRank();//获取排行榜数据

            //更新新的一天的数据
            var date = new Date();
            var now = ''+date .getFullYear()+'.'+date .getMonth()+'.'+date .getDate();
            if(ag.db && ag.db._customData && ag.db._customData.comeDate!=now){
                ag.db._customData.comeDate = now;
                ag.db._customData.come = {};
                ag.db._customData.wing = {};
            }


            var array = [];
            for(var key in this._roleMap){
                var role = this._roleMap[key];
                if(role.getIsPlayer()){
                    array.push(role);
                }
            }
            ag.db.setRoles(array);//角色保存
            ag.db.setItems();//道具保存
            ag.db.setCustomData(ag.db._customData);//自定义数据保存
            ag.db.setAuctionShop();//拍卖行


            //每周三或者周末启动攻城
            if((date.getDay()==0 || date.getDay()==3) && date.getHours()==20 && date.getMinutes()==0){
                var day0 = Math.round(new Date(this._startZoneDate[0],this._startZoneDate[1],this._startZoneDate[2]).getTime() / 86400000);
                var day1 = Math.round(date.getTime() / 86400000);
                if(day1-day0>=2){
                    ag.shabake.start(date.getTime(),60*60*1000);
                }
            }
        }.bind(this));



        //防止出问题，存不上
        //ag.actionManager.runAction(this,300,function(){
        //        for(var key in this._roleMap){
        //            var role = this._roleMap[key];
        //            if(role.getIsPlayer() && role._data.level>=50){
        //                role.addGold(2000);
        //                role.addExp(300000);
        //                role.addOffice(1000);
        //            }
        //        }
        //}.bind(this));
	},


    addDirty:function(id){
        this._dirtyRoleArray[id] = true;
    },


    //查找目标
    findLocked:function(role){
        for(var i=0;i<121;++i){
            var array = ag.gameLayer._roleXYMap[''+role._data.mapId+','+(role._data.x+ag.gameConst.searchEnemypath[i][0])+','+(role._data.y+ag.gameConst.searchEnemypath[i][1])];
            if(array){
                for(var k=0;k<array.length;++k){
                    if(array[k].getIsMonster() && this.isEnemyForCheck(array[k],role)){
                        if(!this._sneerLockedMap[array[k]._data.id]){
                            this._sneerLockedMap[array[k]._data.id] = role._data.id;
                        }else if(array[k].getDistance(role._data.id)<array[k].getDistance(this._sneerLockedMap[array[k]._data.id])){
                            this._sneerLockedMap[array[k]._data.id] = role._data.id;
                        }
                    }
                }
            }
        }
    },


    addInvincibile:function(id){
        this._invincibleMap[id] = 1;
    },


    //所有离线角色，土城归一
    theCountryIsAtPeace:function(level){

        var array = [];
        var safe = ag.gameConst._terrainMap['t1'].safe;
        for(var key in this._roleMap){
            var role = this._roleMap[key];
            if(role.getIsPlayer() && ag.jsUtil.getIsOnline(role._data.id)==false){
                if(role._data.level<level){
                    this.deleteRole(role._data.id);
                }else{
                    var lx = role.getLocation().x,ly = role.getLocation().y;
                    var xyStr = role.getMapXYString();
                    if((!(role._data.mapId=='t1' && lx>=safe.x && lx<=safe.xx && ly>=safe.y && ly<=safe.yy))
                        || (this._roleXYMap[xyStr] && this._roleXYMap[xyStr].length>=2)){
                        if(role._state == ag.gameConst.stateDead){
                            role.relife();
                        }
                        role.changeMap('t1');
                        var x,y;
                        for(var i=0;i<10;++i){
                            x = 7+Math.floor(Math.random()*(26-7+1));
                            y = 27+Math.floor(Math.random()*(46-27+1));
                            if(!this._roleXYMap['t1'+','+x+','+y])break;
                        }
                        role.setLocation(ag.jsUtil.p(x,y));
                        array.push(role);
                    }
                }
            }
        }
        ag.db.setRoles(array);//角色保存
        ag.db.setItems();//道具保存
    },


    //删除角色
    deleteRole:function(id) {
        var player =  this.getRole(id);
        if(player){
            if(player._tiger){
                ag.jsUtil.sendDataExcept("sDeleteRole",player._tiger._data.id,player._data.id);
                ag.itemManager.delItemByRoleId(player._tiger._data.id);
                player._tiger._data.camp=ag.gameConst.campMonster;
                player._tiger._state = ag.gameConst.stateIdle;
                player._tiger.dead();
            }
            ag.jsUtil.sendDataExcept("sDeleteRole",player._data.id,player._data.id);
            ag.itemManager.delItemByRoleId(id);
            player._data.camp=ag.gameConst.campMonster;
            player._state = ag.gameConst.stateIdle;
            player.dead();
            ag.db.deleteRole(id);
            ag.db.setItems();//道具保存
        }
    },


    //获得某玩家
    getRole:function(id){
        return this._roleMap[id];
    },

    //获得某玩家
    getRoleByName:function(name){
        for(var key in this._roleMap){
            if(this._roleMap[key]._data.name==name)return this._roleMap[key];
        }
        return null;
    },
	
	
	//增加一个玩家
    addPlayer:function(id,map_id,x,y,type,camp,sex,direction,level,exp,gold,office,wing,come,practice){
        var name = ag.userManager.getName(id);
		var player = this._roleMap[id];
		if(!player){
			player = new Role();
            player._data = {};
            player._data.attackMode = ag.gameConst.attackModeGuild;
            player._data.gold = gold?gold:0;
            player._data.office = office?office:0;
            player._data.come = come?come:0;
            player._data.practice = practice?practice:0;
            player._data.wing = wing?wing:0;
            player._data.id = id;
            player._data.type = type;
            if(map_id){
                player._data.mapId = map_id;
                player._data.x = x;
                player._data.y = y;
            }else{
                player._data.mapId = ag.gameConst._bornMap;
                var pos = this.getStandLocation(ag.gameConst._bornMap,ag.gameConst.born.x,ag.gameConst.born.y);
                player._data.x = pos.x;
                player._data.y = pos.y;
            }
            player._data.name = name;
            player._data.sex = sex;
            player._data.camp = ag.gameConst.campPlayerNone;
            player._data.direction = direction!=undefined?direction:4;//默认朝下
            player._data.level = level?level:0;
            player.resetAllProp();
            player._data.hp = player._totalHP;
            player._exp = exp?exp:0;

			this._roleMap[id] = player;
            var xyStr = player.getMapXYString();
            if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
            this._roleXYMap[xyStr].push(player);
            this._roleZoneMap[player._data.mapId].push(player._data.id);

            //如果是道士，还要增加宝宝
            this.createTiger(player);

            //新手送装备
            ag.itemManager.presentWith(player._data.id);
		}

        //确认进入游戏成功。
        player.relife();
        ag.jsUtil.send("sEnter",JSON.stringify(player._data),[id]);
        ag.jsUtil.sendData("sGuildWinId",ag.shabake._guildWinId,id);
        //player.changeMap();
        if(player._data.level>47){
            if(this._rankFirstArray[0]==player._data.id){
                ag.jsUtil.sendDataAll("sSystemNotify","15%"+player._data.name+"%16");
            }else if(this._rankFirstArray[1]==player._data.id){
                ag.jsUtil.sendDataAll("sSystemNotify","17%"+player._data.name+"%16");
            }else if(this._rankFirstArray[2]==player._data.id){
                ag.jsUtil.sendDataAll("sSystemNotify","18%"+player._data.name+"%16");
            }else{
                ag.jsUtil.sendDataAll("sSystemNotify","19%"+player._data.name+"%16");
            }
        }
    },


    createTiger:function(player){
        if(player._data.type=='m2'){
            var dog = new Role();
            dog._data = {};
            dog._data.id = 'm'+(++this._baseMonsterId);
            dog._data.type = 'm19';
            var dirPos = ag.gameConst.directionArray[player._data.direction];
            var pos = this.getStandLocation(player._data.mapId,player._data.x+dirPos.x,player._data.y+dirPos.y);
            dog._data.x = pos.x;
            dog._data.y = pos.y;
            dog._data.name = '白虎('+player._data.name+')';
            dog._data.camp = player._data.camp;
            dog._data.mapId = player._data.mapId;
            dog._data.direction = 4;//默认朝下
            dog._data.level = 0;
            dog._master = player;
            player._tiger = dog;
            dog.resetAllProp();
            dog._data.hp = dog._totalHP;
            dog._exp = 0;
            this._roleMap[dog._data.id] = dog;
            var xyStr = dog.getMapXYString();
            if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
            this._roleXYMap[xyStr].push(dog);
            dog.setAIController(new TigerAIController(dog));
            this._roleZoneMap[dog._data.mapId].push(dog._data.id);
        }
    },


    //怪物刷新函数
    refresh:function(){
        for(var key in ag.gameConst._terrainMap){
            var map = ag.gameConst._terrainMap[key];
            var array = map.refresh;
            for(var i=0;i<array.length;++i){
                if(this._gameTime%ag.gameConst.refreshArray[ag.gameConst._roleMst[array[i][0]].lv-1]==0){//时间正好是倍数，可以刷新了
                    var count = this.getCountWithType(key,array[i][0]);
                    var maxCount = array[i][1];
                    for(var j=count;j<maxCount;++j){
                        var player = new Role();
                        player._data = {};
                        player._data.id = 'm'+(++this._baseMonsterId);
                        player._data.type = array[i][0];
                        var x= 0,y=0;
                        if(array[i].length==2){
                            while(true){
                                x = Math.floor(Math.random()*map.mapX);
                                y = Math.floor(Math.random()*map.mapY);
                                if(this.isCollision(key,x,y)==false)break;
                            };
                        }else{
                            x = array[i][2];
                            y = array[i][3];
                        }
                        var position = ag.jsUtil.p(x,y);//this.getStandLocation(key,x,y);
                        player._data.x = position.x;
                        player._data.y = position.y;
                        player._data.camp = ag.gameConst.campMonster;
                        player._data.mapId = key;
                        player._data.direction = Math.floor(Math.random()*8);
                        player._data.level = 0;
                        player.resetAllProp();
                        player._data.hp = player._totalHP;
                        this._roleMap[player._data.id] = player;
                        var xyStr = player.getMapXYString();
                        if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
                        this._roleXYMap[xyStr].push(player);
                        player.setAIController(new AIController(player));
                        var temp = JSON.parse(JSON.stringify(player._data));
                        delete temp.gold;
                        delete temp.attackMode;
                        delete temp.practice;
                        ag.jsUtil.sendDataAll("sRole",temp,player._data.mapId);
                        this._roleZoneMap[player._data.mapId].push(player._data.id);
                    }
                }
            }
        }
    },

    //获得某个地图上，某个怪物剩余多少
    getCountWithType:function(mapId,monsterName){
        var count = 0;
        var array = this._roleZoneMap[mapId];
        for(var i=0;i<array.length;++i){
            if(this._roleMap[array[i]]._data.type==monsterName)++count;
        }
        return count;
    },


    //获得可以站立的位置
    getStandLocation: function (mapId,x,y){
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
        if(obj){
            if(x<0 || x>=obj.mapX || y<0 || y>=obj.mapY)return true;
            return obj.collision[y*obj.mapX+x]=='1';
        }
        return true;
    },


    getMapXYRole:function(mapId,x,y){
        return ''+mapId+','+x+','+y;
    },


    //根据碰撞检测得到正确的方向
    getOffsetWithColloison:function(role,direction){
        if(direction==-1)return -1;
        var offset = ag.gameConst.directionArray[direction];
        if(this.isCollision(role._data.mapId,role._data.x+offset.x,role._data.y+offset.y)==false){
            if(role.getIsMonster()){
                if(!this._roleXYMap[''+role._data.mapId+','+(role._data.x+offset.x)+','+(role._data.y+offset.y)])return direction;
            }else{
                return direction;
            }
        }
        var pointArray=ag.gameConst.directionArray;//可走方向
        var index = direction;


        var i = 0;
        if(role.getIsMonster()){//怪物
            var percent = [10000,100,10,1,1];//权重比例
            var weight=[];
            var max = 0;
            for(i=0;i<8;++i){
                if(this.isCollision(role._data.mapId,role._data.x+pointArray[i].x,role._data.y+pointArray[i].y)
                    || this.getHavelivedRole(this.getMapXYRole(role._data.mapId,role._data.x+pointArray[i].x,role._data.y+pointArray[i].y))){
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
            for(i=0;i<8;++i){
                curWeight += weight[i];
                if(randNum<curWeight)return i;
            }
        }else{//英雄
            var randNum=Math.random()<0.5 ? -1:1;
            for(i=0;i<8;++i){
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


    getHavelivedRole:function(mapStr){
        var array = this._roleXYMap[mapStr];
        if(array)for(var i=0;i<array.length;++i){
            var role = array[i];
            if(role._master)role = role._master;
            if(role._state!=ag.gameConst.stateDead){
                if(role.getIsPlayer()){
                    if(ag.userManager.getOnline(role._data.id)){
                        return true;
                    }
                }else{
                    return true;
                }
            }
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
        var array = this._roleZoneMap[role._data.mapId];
        for(var i=0;i<array.length;++i){
            var temp = this._roleMap[array[i]];
            if(temp._ai && temp._ai._locked==role){
                temp._ai._locked = null;
            }
        }
    },


    //获得指定区域角色数组
    getRoleFromCenterXY:function (mapId,center,offset) {
        var retArray = [];
        var posX = center.x+offset,posY = center.y+offset;
        for(var i=center.y-offset;i<=posY;++i){
            for(var j=center.x-offset;j<=posX;++j){
                var array = this._roleXYMap[''+mapId+','+j+','+i];
                if(array)retArray = retArray.concat(array);
            }
        }
        return retArray;
    },



    //是否攻击
    isEnemyForCheck:function(role1,role2){
        var lastRole2 = role2;
        if(role2._master)role2 = role2._master;
        if(role2.getIsMonster() || (role2.getIsPlayer() && ag.userManager.getOnline(role2._data.id))){
            if(role1!=role2 && role1._state != ag.gameConst.stateDead
                && role2._state != ag.gameConst.stateDead
                && lastRole2._state != ag.gameConst.stateDead){
                if(role1._data.camp!=role2._data.camp)return true;
            }
        }
        return false;
    },
    isEnemyForAttack:function(role1,role2){
        if(role1==role2)return false;
        if(this._invincibleMap[role2._data.id])return false;
        if(role1._master)role1 = role1._master;
        if(role2._master)role2 = role2._master;
        if(role2.getIsMonster() || (role2.getIsPlayer() && ag.userManager.getOnline(role2._data.id))){
            if(role1!=role2 && role1._state != ag.gameConst.stateDead && role2._state != ag.gameConst.stateDead){
                if(role1._data.attackMode==ag.gameConst.attackModeAll){
                    if(role2.getIsPlayer()){
                        var safe = ag.gameConst._terrainMap[role2._data.mapId].safe;
                        if(safe){
                            var lx1 = role1.getLocation().x,ly1 = role1.getLocation().y;
                            var lx2 = role2.getLocation().x,ly2 = role2.getLocation().y;
                            if(lx1>=safe.x && lx1<=safe.xx && ly1>=safe.y && ly1<=safe.yy)return false;
                            if(lx2>=safe.x && lx2<=safe.xx && ly2>=safe.y && ly2<=safe.yy)return false;
                        }
                    }
                    return true;
                }else if(role1._data.attackMode==ag.gameConst.attackModePeace){
                    if(role2.getIsMonster()){
                        return true;
                    }
                }else if(role1._data.attackMode==ag.gameConst.attackModeGuild){
                    if(role2.getIsPlayer()){
                        var safe = ag.gameConst._terrainMap[role2._data.mapId].safe;
                        if(safe){
                            var lx1 = role1.getLocation().x,ly1 = role1.getLocation().y;
                            var lx2 = role2.getLocation().x,ly2 = role2.getLocation().y;
                            if(lx1>=safe.x && lx1<=safe.xx && ly1>=safe.y && ly1<=safe.yy)return false;
                            if(lx2>=safe.x && lx2<=safe.xx && ly2>=safe.y && ly2<=safe.yy)return false;
                        }
                    }
                    if(role1._data.camp!=role2._data.camp)return true;
                    if(role2._data.camp==ag.gameConst.campPlayerNone)return true;
                }else if(role1._data.attackMode==ag.gameConst.attackModeTeam){
                    if(role2.getIsPlayer()){
                        var safe = ag.gameConst._terrainMap[role2._data.mapId].safe;
                        if(safe){
                            var lx1 = role1.getLocation().x,ly1 = role1.getLocation().y;
                            var lx2 = role2.getLocation().x,ly2 = role2.getLocation().y;
                            if(lx1>=safe.x && lx1<=safe.xx && ly1>=safe.y && ly1<=safe.yy)return false;
                            if(lx2>=safe.x && lx2<=safe.xx && ly2>=safe.y && ly2<=safe.yy)return false;
                        }
                        return !ag.team.isSameTeam(role1._data.id,role2._data.id);
                    }else{
                        return true;
                    }
                }else{
                    if(role1._data.camp!=role2._data.camp)return true;
                }
            }
        }
        return false;
    },


    //请求排行榜
    getRank:function(){
        var levels = [],hurts = [],offices = [],i = 0,len = 0,data = {},array = [];
        for(var key in this._roleMap){
            if(this._roleMap[key].getIsPlayer()){
                array.push(this._roleMap[key]);
            }
        }
        len = Math.min(10,array.length);
        var sexTypes = {m0:['男战','女战'],m1:['男法','女法'],m2:['男道','女道']};


        //等级
        array.sort(function(a,b){
            if(b._data.level == a._data.level){
                return b._exp - a._exp;
            }
            return b._data.level - a._data.level;
        });
        for(i=0;i<len;++i){
            levels.push(array[i]._data.id);
            data[array[i]._data.id] = {name:array[i]._data.name,level:array[i]._data.level
                ,sexType:sexTypes[array[i]._data.type][array[i]._data.sex],hurt:array[i]._hurt,office:array[i]._data.office};
        }


        //攻击
        array.sort(function(a,b){
            return b._hurt - a._hurt;
        });
        for(i=0;i<len;++i){
            hurts.push(array[i]._data.id);
            data[array[i]._data.id] = {name:array[i]._data.name,level:array[i]._data.level
                ,sexType:sexTypes[array[i]._data.type][array[i]._data.sex],hurt:array[i]._hurt,office:array[i]._data.office};
        }


        //称号
        array.sort(function(a,b){
            return b._data.office - a._data.office;
        });
        for(i=0;i<len;++i){
            offices.push(array[i]._data.id);
            data[array[i]._data.id] = {name:array[i]._data.name,level:array[i]._data.level
                ,sexType:sexTypes[array[i]._data.type][array[i]._data.sex],hurt:array[i]._hurt,office:array[i]._data.office};
        }
        this._rankString = JSON.stringify({levels:levels,hurts:hurts,offices:offices,data:data});
        this._rankFirstArray = [levels[0],hurts[0],offices[0]];
    },
};
