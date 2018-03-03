/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._dataMap = {};
    },


    //矫正数据
    correct:function(){
        var map = ag.itemManager._itemMap.getMap();
        for(var key in map){
            if(map[key]._data.puton!=ag.gameConst.putonAuctionShop && this._dataMap[key]){
                map[key]._data.puton=ag.gameConst.putonAuctionShop;
            }else if(map[key]._data.puton==ag.gameConst.putonAuctionShop && !this._dataMap[key]){
                map[key]._data.puton=ag.gameConst.putonBag;
            }
        }
        for(var key in this._dataMap){
            if(!map[key]){
                delete this._dataMap[key];
            }
        }
    },


    sendData:function(id){
        var map = JSON.parse(JSON.stringify(this._dataMap));
        for(var key in map){
            var item = ag.itemManager._itemMap.get(key);
            map[key].mid = item._data.mid;
            var role = ag.gameLayer.getRole(item._data.owner);
            map[key].name = role?role._data.name:'';
        }
        ag.jsUtil.sendData("sAuctionShop",JSON.stringify(map),id);
    },


    //删除无效的数据
    deleteInvalid:function(){
        for(var key in this._dataMap){
            var item = ag.itemManager._itemMap.get(key);
            if(!ag.gameLayer.getRole(item._data.owner)){
                delete this._dataMap[key];
            }
        }
    },


    sellToAuctionShop:function(id,rid,price){
        var item = ag.itemManager._itemMap.get(id);
        var role =  ag.gameLayer.getRole(rid);
        if(item && role && item._data.owner==rid && item._data.puton==ag.gameConst.putonBag){
            item._data.puton = ag.gameConst.putonAuctionShop;
            this._dataMap[item._data.id] = {id:item._data.id,price:price,create_time:new Date().getTime()};
            --role._bagLength;
            this.sendData(rid);
            ag.jsUtil.sendData("sSystemNotify","寄售成功！",rid);
        }
    },



    buyAuctionShop:function(id,rid){
        var item = ag.itemManager._itemMap.get(id);
        var role =  ag.gameLayer.getRole(rid);
        var lastRole = ag.gameLayer.getRole(item._data.owner);

        if(item && role && lastRole && item._data.puton==ag.gameConst.putonAuctionShop
            && role._bagLength<ag.gameConst.bagLength
            &&(role._data.gold>=this._dataMap[id].price || role._data.id==item._data.owner)){
            role.addGold(-this._dataMap[id].price);
            lastRole.addGold(this._dataMap[id].price);
            item._data.puton = ag.gameConst.putonBag;
            item._data.owner = rid;
            delete this._dataMap[id];
            ++role._bagLength;
            this.sendData(rid);
            ag.jsUtil.sendData("sSystemNotify","购买成功！",rid);
            ag.jsUtil.sendData("sItem",item._data,rid);
        }else{
            ag.jsUtil.sendData("sSystemNotify","未知错误！",rid);
        }
    },
});
