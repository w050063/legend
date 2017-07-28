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
        ag.actionManager.schedule(this,1,this.update1.bind(this));
        ag.actionManager.schedule(this,5,this.update5.bind(this));
    },


    //获得当前的buff数据,不包括函数
    getData:function () {
        return {_fireCritArray:this._fireCritArray,
            _fireWallMap:this._fireWallMap,
            _poisonMap:this._poisonMap};
    },


    //烈火技能相关
    getCDForFireCrit:function (role) {
        return this._fireCritArray[role._data.id]==true;
    },


    setCDForFireCrit:function(role) {
        if (this.getCDForFireCrit(role))return;
        this._fireCritArray[role._data.id] = true;
        ag.actionManager.runAction(role,5,function(){
            delete this._fireCritArray[role._data.id];
            //当玩家攻击后,服务器过10秒cd好了,会再次向客户端发送启用烈火,双方用完自动置为false
            ag.jsUtil.sendAll("sBFireCrit",JSON.stringify({id:role._data.id}));
        }.bind(this));
    },


    //设置某个位置出现火墙
    setFireWall:function (mapXYString, role) {
        if(!this._fireWallMap[mapXYString]){
            var tag = ++this._baseTag;
            this._fireWallMap[mapXYString] = {id:role._data.id,tag:tag};
            ag.actionManager.runAction(role,10,function(){
                this.delFireWall(mapXYString);
            }.bind(this),tag);
            ag.jsUtil.sendAll("sFireWall",JSON.stringify({mapXYString:mapXYString,id:role._data.id}));
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
        if(this._poisonMap[role._data.id]){
            this.delPoison(role._data.id);
        }
        var tag = ++this._baseTag;
        this._poisonMap[role._data.id] = {id:attacker._data.id,tag:tag};
        ag.actionManager.runAction(role,10,function(){
            this.delPoison(role._data.id);
        }.bind(this));
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
            delete this._poisonMap[key];
        }
    },




    //更新数据
    update1: function (dt) {
        //火墙的伤害
        for(var key in this._fireWallMap){
            var attacker = ag.gameLayer.getRole(this._fireWallMap[key].id);
            if(attacker){
                var array = key.split(',');
                array = ag.gameLayer.getRoleFromCenterXY(array[0],ag.jsUtil.p(parseInt(array[1]),parseInt(array[2])));
                if(array){
                    for(var i=0;i<array.length;++i){
                        if(ag.gameLayer.isEnemyCamp(attacker,array[i])){
                            array[i]._data.hp -= 1;
                        }
                    }
                }
            }
        }



        //毒的伤害
        for(var key in this._poisonMap){
            var role = ag.gameLayer.getRole(key);
            var attacker = ag.gameLayer.getRole(this._poisonMap[key].id);
            if(role && attacker){
                if(ag.gameLayer.isEnemyCamp(attacker,role)){
                    role._data.hp -= 1;
                }
            }
        }
    },


    //更新数据
    update5: function (dt) {
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role._data.hp>0 && role._data.hp<role._data.totalHP){
                role._data.hp+=1;
                if(role._data.hp>role._data.totalHP)role._data.hp=role._data.totalHP;
            }
        }
    }
});
