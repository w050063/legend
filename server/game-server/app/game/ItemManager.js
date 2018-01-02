/**
 * Created by bot.su on 2017/6/21.
 * 道具管理表
 */


var Item = require("./Item");
var AgXYMap = require("./AgXYMap");
module.exports = ag.class.extend({
    ctor:function () {
        this._itemMap = new AgXYMap();
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
            var array = ['i001000','i001200','i001201'];
            for(var i=0;i<array.length;++i){
                var item = new Item(array[i]);
                item._duration = 0;
                item._data.owner = id;
                item._data.puton = ag.gameConst.putonBag;
                this._itemMap.add(item);
                ++role._bagLength;
                ag.jsUtil.sendDataAll("sItem",item._data,role._data.mapId);
            }
        }
    },


    drop:function (rid,str,mapId,location) {
        var array = str.split(',');
        for(var i=0;i<array.length;++i){
            if(i%2==0){
                var rand = Math.random()*100;
                if(rand<parseInt(array[i+1])){
                    var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
                    pos = ag.gameLayer.getStandLocation(mapId,pos.x,pos.y);
                    var item = new Item(array[i],mapId,pos);
                    item._duration = ag.gameConst.itemDuration;
                    item._data.owner = '';
                    item._data.puton = ag.gameConst.putonGround;
                    item._their = rid;
                    this._itemMap.add(item);
                    ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)),item._data.mapId);
                }
            }
        }
    },


    dropEquipOneByArray:function (role,array,mapId,location) {
        if(array.length>0){
            var index = Math.floor(Math.random()*array.length);
            var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
            pos = ag.gameLayer.getStandLocation(mapId,pos.x,pos.y);
            var item =this._itemMap.get(array[index]);
            this._itemMap.setMapXYById(item._data.id,mapId,pos.x,pos.y);
            item._duration = ag.gameConst.itemDuration;
            item._data.owner = '';
            item._data.puton = ag.gameConst.putonGround;
            delete item._their;
            role.refreshItemProp();
            ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)),item._data.mapId);
        }
    },


    dropByLevel:function (rid,level,rate,mapId,location) {
        var map = ag.gameConst._itemMst;
        for(var key in map){
            if(map[key].level==level){
                var rand = Math.random()*100;
                if(rand<rate){
                    var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
                    pos = ag.gameLayer.getStandLocation(mapId,pos.x,pos.y);
                    var item = new Item(key,mapId,pos);
                    item._data.owner = '';
                    item._data.puton = ag.gameConst.putonGround;
                    item._duration = ag.gameConst.itemDuration;
                    item._their = rid;
                    this._itemMap.add(item);
                    ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)),item._data.mapId);
                }
            }
        }

        //6级以上boss必爆圣战铜域系列装备2个
        if(level>=6){
            var tempArray = ['i001101','i001102','i001103','i001104','i001105','i001106',
                'i001304','i001305','i001306','i001307','i001308','i001309',
                'i001404','i001405','i001406','i001407','i001408','i001409',
                'i001504','i001505','i001506','i001507','i001508','i001509'];
            for(var i=0;i<2;++i){
                var rand = Math.floor(Math.random()*tempArray.length);
                var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
                pos = ag.gameLayer.getStandLocation(mapId,pos.x,pos.y);
                var item = new Item(tempArray[rand],mapId,pos);
                item._data.owner = '';
                item._data.puton = ag.gameConst.putonGround;
                item._duration = ag.gameConst.itemDuration;
                item._their = rid;
                this._itemMap.add(item);
                ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)),item._data.mapId);
            }
        }else if(level>=4){
            var tempArray = ['i001101','i001102','i001103',
                'i001301','i001302','i001303',
                'i001401','i001402','i001403',
                'i001501','i001502','i001503'];
            for(var i=0;i<2;++i){
                var rand = Math.floor(Math.random()*tempArray.length);
                var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
                pos = ag.gameLayer.getStandLocation(mapId,pos.x,pos.y);
                var item = new Item(tempArray[rand],mapId,pos);
                item._data.owner = '';
                item._data.puton = ag.gameConst.putonGround;
                item._duration = ag.gameConst.itemDuration;
                item._their = rid;
                this._itemMap.add(item);
                ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)),item._data.mapId);
            }
        }
    },


    addBagItem:function (id,rid) {
        var role = ag.gameLayer.getRole(rid);
        var obj = this._itemMap.get(id);
        if(obj){
            this._itemMap.setMapXYById(id);
            obj._data.owner = rid;
            delete obj._their;
            obj._data.puton = ag.gameConst.putonBag;
            ++role._bagLength;
        }
    },


    bagItemToGround:function (id,rid) {
        var obj = this._itemMap.get(id);
        var role = ag.gameLayer.getRole(rid);
        if(obj && role){
            var location = role.getLocation();
            var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
            pos = ag.gameLayer.getStandLocation(role._data.mapId,pos.x,pos.y);
            this._itemMap.setMapXYById(id,role._data.mapId,pos.x,pos.y);
            obj._data.owner = '';
            obj._data.puton = ag.gameConst.putonGround;
            obj._duration = ag.gameConst.itemDuration;

            --role._bagLength;
            ag.jsUtil.sendDataAll("sDrop",obj._data,obj._data.mapId);
        }
    },


    //背包装备回收
    bagItemRecycle:function(array,rid){
        var expArray = [20,20,20,20,100,200,300,400,800];
        var goldArray = [2,2,2,2,3,5,10,15,30];
        var officeArray = [0,0,0,0,1,3,8,20,100];
        var role = ag.gameLayer.getRole(rid);
        if(role){
            var sum = 0;
            var sumOffice = 0;
            //var sumGold = 0;
            for(var i=0;i<array.length;++i){
                var id = array[i];
                var obj = this._itemMap.get(id);
                if(obj && obj._data.owner==rid){
                    ag.jsUtil.sendDataAll("sItemDisappear",obj._data.id,role._data.mapId);
                    var index = ag.gameConst._itemMst[obj._data.mid].level-1;
                    sum += expArray[index];
                    sumOffice += officeArray[index];
                    //sumGold += goldArray[ag.gameConst._itemMst[obj._data.mid].level-1];
                    this._itemMap.del(id);
                    --role._bagLength;
                }
            }
            role.addExp(sum,'recycle');
            role.addOffice(sumOffice);
            //role.addGold(sumGold);//回收不加元宝
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
                        obj.puton = ag.gameConst.putonBag;
                        ++role._bagLength;
                        break;
                    }
                }
                item._data.puton = puton;
                --role._bagLength;
                ag.jsUtil.sendDataExcept("sBagItemToEquip",item._data,rid);
                role.refreshItemProp();
            }
        }
    },


    equipItemToBag:function (id,rid) {
        var item = this._itemMap.get(id);
        var role = ag.gameLayer.getRole(rid);
        if(item && role){
            item._data.puton = ag.gameConst.putonBag;
            ++role._bagLength;
            role.refreshItemProp();
            ag.jsUtil.sendDataExcept("sEquipItemToBag",{id:id,rid:rid},rid);
        }
    },


    //删除指定角色的道具
    delItemByRoleId:function(rid){
        var role = ag.gameLayer.getRole(rid);
        var map = this._itemMap.getMap();
        for (var key in map) {
            var obj = map[key]._data;
            if (obj.owner == rid) {
                this._itemMap.del(key);
            }
        }
        role._bagLength = 0;
    },


    //根据位置得到掉落
    getDropByLocation:function (mapId,location) {
        return this._itemMap.getByXY(mapId,location);
    },


    //寻宝一次
    treasure:function (role) {
        var rand = Math.random();
        if(rand<0.4){
            role.addExp(100);
            ag.jsUtil.sendData("sSystemNotify",role._data.name+"在龙族宝藏寻到10点经验",role._data.id);
        }else if(rand<0.5){
            role.addOffice(10);
            ag.jsUtil.sendData("sSystemNotify",role._data.name+"在龙族宝藏寻到10点官职",role._data.id);
        }else{
            var array = [];
            var map = ag.gameConst._itemMst;
            if(rand<0.95){
                for(var key in map){
                    if(map[key].level==1 || map[key].level==2 || map[key].level==3 || map[key].level==4 || map[key].level==5)array.push(key);
                }
            }else if(rand<0.98){
                for(var key in map){
                    if(map[key].level==6)array.push(key);
                }
            }else if(rand<0.998){
                for(var key in map){
                    if(map[key].level==7)array.push(key);
                }
            }else if(rand<0.9995){
                for(var key in map){
                    if(map[key].level==8)array.push(key);
                }
            }else{
                for(var key in map){
                    if(map[key].level==9)array.push(key);
                }
            }
            var index = Math.floor(Math.random()*array.length);
            var item = new Item(array[index]);
            item._duration = 0;
            item._data.owner = role._data.id;
            item._data.puton = ag.gameConst.putonBag;
            this._itemMap.add(item);
            ++role._bagLength;
            ag.jsUtil.sendDataAll("sItem",item._data,role._data.mapId);
            ag.jsUtil.sendDataAll("sSystemNotify", role._data.name+"在龙族宝藏寻到"+ag.gameConst._itemMst[item._data.mid].name+"！");
        }
    },


    //寻宝一次
    treasure5:function (role) {
        for(var i=0;i<5;++i){
            this.treasure(role);
        }
    },
});
