/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */
var AGAni = require("AGAni");
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


    changeMap:function(){
        this._fireCritArray = {};
        for(var key in this._fireWallMap){
            this.delFireWall(key);
        }
        for(var key in this._poisonMap){
            this.delPoison(key);
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
        ag.gameLayer.tagAction(cc.sequence(cc.delayTime(20),cc.callFunc(function(){
            this.delFireWall(mapXYString);
        }.bind(this))),tag);


        var array = mapXYString.split(',');
        var node = ag.jsUtil.getNode(ag.gameLayer._map.node,"ani/effect4/507000",6,ag.gameConst.roleEffectZorder,0.1,function(sender){});
        node.setPosition(ag.gameLayer._player.getTruePosition(cc.p(parseInt(array[1]),parseInt(array[2]))));
        node.setLocalZOrder(Math.round(10000-node.y)-1);
        node.scale = 0.3;
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
            if(this._fireWallMap[key].node && this._fireWallMap[key].node.getComponent(AGAni)){
                this._fireWallMap[key].node.getComponent(AGAni).putCache();
            }
            ag.gameLayer.node.stopActionByTag(this._fireWallMap[key].tag);
            delete this._fireWallMap[key];
        }
    },



    //设置毒
    setPoison:function (role,attacker) {
        var id = role._data.id;
        if(this._poisonMap[id]){
            this.delPoison(id);
        }
        var tag = ++this._baseTag;
        this._poisonMap[id] = {id:attacker._data.id,tag:tag};
        role.setAniColor(cc.color(0,255,0));
        ag.gameLayer.tagAction(cc.sequence(cc.delayTime(30),cc.callFunc(function(){
            var tempRole = ag.gameLayer.getRole(id);
            if(tempRole)this.delPoison(id);
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
            if(role)role.setAniColor(cc.color(255,255,255));
            ag.gameLayer.node.stopActionByTag(this._poisonMap[key].tag);
            delete this._poisonMap[key];
        }
    },
});
