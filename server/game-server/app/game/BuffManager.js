/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._baseTag = 0;
        //定义缓冲队列数组
        this._fireCritArray = {};
        this._fireWallMap = {};
        this._poisonMap = {};


        //启动定时器,每秒执行一次
        ag.actionManager.schedule(this,0.5,this.update05.bind(this));
        ag.actionManager.schedule(this,1,this.update1.bind(this));
        ag.actionManager.schedule(this,2,this.update2.bind(this));
        ag.actionManager.schedule(this,5,this.update5.bind(this));
    },

    //烈火技能相关
    getCDForFireCrit:function (role) {
        return this._fireCritArray[role._data.id]==true;
    },


    setCDForFireCrit:function(role) {
        if (this.getCDForFireCrit(role))return;
        this._fireCritArray[role._data.id] = true;
        ag.actionManager.runAction(role,10,function(){
            delete this._fireCritArray[role._data.id];
            //当玩家攻击后,服务器过10秒cd好了,会再次向客户端发送启用烈火,双方用完自动置为false
            ag.jsUtil.sendDataAll("sBFireCrit",role._data.id,role._data.mapId);
        }.bind(this));
    },



    //设置某个位置出现火墙
    setFireWall:function (mapXYString, role) {
        if(!this._fireWallMap[mapXYString]){
            var tag = ++this._baseTag;
            this._fireWallMap[mapXYString] = {id:role._data.id,tag:tag};
            ag.actionManager.runAction(role,20,function(){
                this.delFireWall(mapXYString);
            }.bind(this),tag);
            ag.jsUtil.sendDataAll("sFireWall",{id:mapXYString,rid:role._data.id},role._data.mapId);
        }
    },


    delFireWallByDead:function (role) {
        for(var key in this._fireWallMap){
            if(this._fireWallMap[key].id==role._data.id){
                this.delFireWall(key);
            }
        }
    },


    delFireWall:function (key) {
        if(this._fireWallMap[key]){
            ag.actionManager.stopActionByTag(this._fireWallMap[key].tag);
            delete this._fireWallMap[key];
        }
    },




    //设置毒
    setPoison:function (role,attacker) {
        var key = role._data.id;

        if(this._poisonMap[key]){
            this.delPoison(key);
        }
        var tag = ++this._baseTag;
        var value = Math.round(attacker._hurt*0.1);
        this._poisonMap[key] = {id:attacker._data.id,value:value,tag:tag};
        role._data.defense -=value;
        ag.actionManager.runAction(role,30,function(){
            this.delPoison(key);
        }.bind(this),tag);
    },


    delPoisonByDead:function (role) {
        for(var key in this._poisonMap){
            if(key==role._data.id || this._poisonMap[key].id==role._data.id){
                this.delPoison(key);
            }
        }
    },


    delPoison:function (key) {
        if(this._poisonMap[key]){
            ag.actionManager.stopActionByTag(this._poisonMap[key].tag);
            var role = ag.gameLayer.getRole(key);
            if(role)role._data.defense += this._poisonMap[key].value;
            delete this._poisonMap[key];
        }
    },


    getIsRelife:function(role){
        if(this._poisonMap[role._data.id] && role.getIsMonster())return false;
        return true;
    },


    //更新数据
    update05: function (dt) {
        //火墙的伤害
        for (var key in this._fireWallMap) {
            var attacker = ag.gameLayer.getRole(this._fireWallMap[key].id);
            if (attacker) {
                var array = key.split(',');
                array = ag.gameLayer.getRoleFromCenterXY(array[0], ag.jsUtil.p(parseInt(array[1]), parseInt(array[2])), 0);
                if (array) {
                    for (var i = 0; i < array.length; ++i) {
                        var tempRole = array[i];
                        if (ag.gameLayer.isEnemyForAttack(attacker, tempRole)) {
                            tempRole.changeHPByHurt(attacker, attacker._hurt * 0.5);
                            if (tempRole._data.hp <= 0) {
                                tempRole.dead(attacker);
                            }
                        }
                    }
                }
            }
        }
    },


    update1: function (dt) {
        //毒的伤害
        for(var key in this._poisonMap){
            var tempRole = ag.gameLayer.getRole(key);
            var attacker = ag.gameLayer.getRole(this._poisonMap[key].id);
            if(tempRole && attacker){
                if(ag.gameLayer.isEnemyForAttack(attacker,tempRole)){
                    tempRole._data.hp -= 1;
                    tempRole.changeHPByHurt(attacker,attacker._hurt*0.1);
                    if(tempRole._data.hp<=0){
                        tempRole.dead(attacker);
                    }
                }
            }
        }
    },


    //更新数据
    update2: function (dt) {
        //玩家自动回血
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role._data.camp!=ag.gameConst.campMonster && role._data.hp>0 && role._data.hp<role._totalHP){
                role._data.hp = Math.min(role._data.hp+role._heal,role._totalHP);
                ag.jsUtil.sendDataAll("sHP",{id:role._data.id,hp:role._data.hp},role._data.mapId);
            }
        }
    },
    update5: function (dt) {
        //怪物自动回血
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role._data.hp>0 && role._data.hp<role._totalHP && this.getIsRelife(role)){
                role._data.hp = Math.min(role._data.hp+role._heal,role._totalHP);
                ag.jsUtil.sendDataAll("sHP",{id:role._data.id,hp:role._data.hp},role._data.mapId);
            }
        }
    }
});
