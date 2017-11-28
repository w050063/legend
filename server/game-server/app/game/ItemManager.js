/**
 * Created by bot.su on 2017/6/21.
 * 道具管理表
 */


var Item = require("./Item");
var AgXYMap = require("./AgXYMap");
module.exports = ag.class.extend({
    ctor:function () {
        this._itemMap = new AgXYMap();
        this._bagLengthMap = {};
        ag.actionManager.schedule(this,1,this.update1.bind(this));
    },


    //更新数据
    update1: function (dt) {
        var map = this._itemMap.getMap();
        for (var key in map) {
            var obj = map[key];
            if(!obj._data.owner){
                --obj._duration;
                if(obj._duration<=0){
                    ag.jsUtil.sendDataAll("sItemDisappear",obj._data.id,obj._data.mapId);
                    this._itemMap.del(key);
                }
            }
        }
    },


    //为初始化准备道具
    presentWith:function(id){
        var role = ag.gameLayer.getRole(id);
        if(role){
            //var array = ['i000','i001','i014','i019','i026','i033','i038','i045','i048','i055','i059','i063','i066'];
            var array = ['i000','i001','i014'];
            for(var i=0;i<array.length;++i){
                var item = new Item(array[i]);
                item._duration = 0;
                item._data.owner = id;
                this._itemMap.add(item);
                ag.jsUtil.sendDataAll("sItem",item._data,role._data.mapId);
            }
        }
    },


    drop:function (str,mapId,location) {
        var array = str.split(',');
        for(var i=0;i<array.length;++i){
            if(i%2==0){
                var rand = Math.random()*100;
                if(rand<parseInt(array[i+1])){
                    var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
                    pos = ag.gameLayer.getStandLocation(mapId,pos.x,pos.y);
                    var item = new Item(array[i],mapId,pos);
                    item._duration = ag.gameConst.itemDuration;
                    this._itemMap.add(item);
                    ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)),item._data.mapId);
                }
            }
        }
    },


    addBagItem:function (id,rid) {
        var obj = this._itemMap.get(id);
        if(obj){
            this._itemMap.del(id);
            obj._data.owner = rid;
            obj._data.x = undefined;
            obj._data.y = undefined;
            this._itemMap.add(obj);
            if(!this._bagLengthMap[rid])this._bagLengthMap[rid] = 0;
            ++this._bagLengthMap[rid];
        }
    },


    bagItemToGround:function (id,rid) {
        var obj = this._itemMap.get(id);
        var role = ag.gameLayer.getRole(rid);
        if(obj && role){
            this._itemMap.del(id);
            obj._data.owner = undefined;
            var location = role.getLocation();
            var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
            pos = ag.gameLayer.getStandLocation(role._data.mapId,pos.x,pos.y);
            obj._data.mapId = role._data.mapId;
            obj._data.x = pos.x;
            obj._data.y = pos.y;
            obj._duration = ag.gameConst.itemDuration;
            this._itemMap.add(obj);
            if(!this._bagLengthMap[rid])this._bagLengthMap[rid] = 1;
            --this._bagLengthMap[rid];
            ag.jsUtil.sendDataAll("sDrop",obj._data,obj._data.mapId);
        }
    },


    //背包装备回收
    bagItemRecycle:function(array,rid){
        var expArray = [20,50,300];
        var role = ag.gameLayer.getRole(rid);
        if(role){
            var sum = 0;
            for(var i=0;i<array.length;++i){
                var id = array[i];
                var obj = this._itemMap.get(id);
                if(obj && obj._data.owner==rid){
                    ag.jsUtil.sendDataAll("sItemDisappear",obj._data.id,role._data.mapId);
                    sum += expArray[ag.gameConst._itemMst[obj._data.mid].level-1];
                    this._itemMap.del(id);
                    --this._bagLengthMap[rid];
                }
            }
            role.addExp(sum,'recycle');
        }
    },


    bagItemToEquip:function (id,puton,rid) {
        var item = this._itemMap.get(id);
        var role = ag.gameLayer.getRole(rid);
        if(item && role){
            var mst = ag.gameConst._itemMst[item._data.mid];
            if(mst.exclusive.indexOf(role.getTypeNum())!=-1) {
                var map = this._itemMap.getMap();
                for (var key in map) {
                    var obj = map[key]._data;
                    if (obj.owner == rid && obj.puton==puton && mst.type == ag.gameConst._itemMst[obj.mid].type) {
                        delete obj.puton;
                        ++this._bagLengthMap[rid];
                        break;
                    }
                }
                item._data.puton = puton;
                --this._bagLengthMap[rid];
                ag.jsUtil.sendDataExcept("sBagItemToEquip",{id:id,puton:puton,rid:rid},rid);
                role.refreshItemProp();
            }
        }
    },


    equipItemToBag:function (id,rid) {
        var item = this._itemMap.get(id);
        var role = ag.gameLayer.getRole(rid);
        if(item && role){
            delete item._data.puton;
            ++this._bagLengthMap[rid];
            role.refreshItemProp();
            ag.jsUtil.sendDataExcept("sEquipItemToBag",{id:id,rid:rid},rid);
        }
    },


    //删除指定角色的道具
    delItemByRoleId:function(rid){
        var map = this._itemMap.getMap();
        for (var key in map) {
            var obj = map[key]._data;
            if (obj.owner == rid) {
                this._itemMap.del(key);
            }
        }
        this._bagLengthMap[rid]=0;
    },


    getBagLength:function (id) {
        return this._bagLengthMap[id] || 0;
    },


    //根据位置得到掉落
    getDropByLocation:function (location) {
        return this._itemMap.getByXY(location);
    }
});
