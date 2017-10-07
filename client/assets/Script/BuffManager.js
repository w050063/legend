/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化
    init: function () {
        this._baseTag = 0;
        //定义缓冲队列数组
        this._fireCritArray = {};
        this._fireWallMap = {};
        this._poisonMap = {};
    },


    setData:function (data) {
        for(var key in data){
            this[key] = data[key];
        }
        for(var key in this._fireWallMap){
            this.setFireWall(key,ag.gameLayer.getRole(this._fireWallMap[key].id));
        }
        for(var key in this._poisonMap){
            this.setPoison(ag.gameLayer.getRole(key),ag.gameLayer.getRole(this._poisonMap[key].id));
        }
    },


    //烈火技能相关
    getCDForFireCrit:function (role) {
        return this._fireCritArray[role._data.id]==true;
    },


    setCDForFireCrit:function(role,b) {
        this.setCDForFireCritById(role._data.id,b);
    },



    setCDForFireCritById:function(id,b) {
        if(b){
            this._fireCritArray[id] = true;
        }else{
            delete this._fireCritArray[id];
        }
    },



    //设置某个位置出现火墙
    setFireWall:function (mapXYString, role) {
        if(!this._fireWallMap[mapXYString]){
            this.delFireWall(mapXYString);
        }
        var tag = ++this._baseTag;
        ag.gameLayer.tagAction(cc.sequence(cc.delayTime(10),cc.callFunc(function(){
            this.delFireWall(mapXYString);
        }.bind(this))),tag);


        var array = mapXYString.split(',');
        var node = new cc.Node();
        ag.gameLayer._map.node.addChild(node,9999999999);
        var mapData = ag.gameConst._terrainMap[array[0]];
        var x = parseInt(array[1])-mapData.mapX/2;
        var y = parseInt(array[2])-mapData.mapY/2;
        node.setPosition(x*mapData.tileX,y*mapData.tileY);
        node._agani = ag.agAniCache.getNode(node,"ani/effect3/507000",4,0,0.05,function(sender){});
        node.setScale(2);

        this._fireWallMap[mapXYString] = {id:role._data.id,tag:tag,node:node};
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
            ag.agAniCache.put(this._fireWallMap[key].node._agani);
            this._fireWallMap[key].node.destroy();
            ag.gameLayer.node.stopActionByTag(this._fireWallMap[key].tag);
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
        role.setAniColor(cc.color(0,255,0,255));
        ag.gameLayer.tagAction(cc.sequence(cc.delayTime(10),cc.callFunc(function(){
            this.delPoison(role._data.id);
        }.bind(this))),tag);
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
            var role = ag.gameLayer.getRole(key);
            role.setAniColor(cc.color(255,255,255,255));
            ag.gameLayer.node.stopActionByTag(this._poisonMap[key].tag);
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
                array = ag.gameLayer.getRoleFromCenterXY(array[0],cc.p(parseInt(array[1]),parseInt(array[2])),0);
                if(array){
                    for(var i=0;i<array.length;++i){
                        if(ag.gameLayer.isEnemyCamp(attacker,array[i])){
                            array[i].changeHP(array[i]._data.hp - 1);
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
                    role.changeHP(role._data.hp - 1);
                }
            }
        }
    },




    //更新数据
    update5: function (dt) {
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role._data.hp>0 && role._data.hp<role._totalHP){
                role.changeHP(Math.min(role._data.hp+role._heal,role._totalHP));
            }
        }
    }
});
