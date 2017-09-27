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
    },


    drop:function (str,location) {
        var array = str.split(',');
        for(var i=0;i<array.length;++i){
            if(i%2==0){
                var rand = Math.random()*100;
                if(rand<parseInt(array[i+1])){
                    var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
                    pos = ag.gameLayer.getStandLocation('t0',pos.x,pos.y,0);
                    var item = new Item(array[i],pos);
                    this._itemMap.add(item);
                    ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)));
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
            pos = ag.gameLayer.getStandLocation('t0',pos.x,pos.y,0);
            obj._data.x = pos.x;
            obj._data.y = pos.y;
            this._itemMap.add(obj);
            if(!this._bagLengthMap[rid])this._bagLengthMap[rid] = 1;
            --this._bagLengthMap[rid];
            ag.jsUtil.sendDataAll("sDrop",obj._data);
        }
    },


    getBagLength:function (id) {
        return this._bagLengthMap[id] || 0;
    },


    //根据位置得到掉落
    getDropByLocation:function (location) {
        return this._itemMap.getByXY(location);
    }
});
