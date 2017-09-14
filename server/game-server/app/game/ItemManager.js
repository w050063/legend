/**
 * Created by bot.su on 2017/6/21.
 * 道具管理表
 */


var Item = require("./Item");
var AgXYMap = require("./AgXYMap");
module.exports = ag.class.extend({
    ctor:function () {
        this._dropMap = new AgXYMap();
        this._bagMap = {};
        this._equipMap = {};
    },


    drop:function (str,location) {
        console.log('drop1');
        var array = str.split(',');
        for(var i=0;i<array.length;++i){
            if(i%2==0){
                var rand = Math.random()*100;
                if(rand<parseInt(array[i+1])){
                    console.log('drop4');
                    var pos = ag.jsUtil.p(location.x+Math.floor(Math.random()*3)-1,location.y+Math.floor(Math.random()*3)-1);
                    pos = ag.gameLayer.getStandLocation('t0',pos.x,pos.y,0);
                    var item = new Item(array[i],pos);
                    this._dropMap.add(item);
                    ag.jsUtil.sendDataAll("sDrop",JSON.parse(JSON.stringify(item._data)));
                }
            }
        }
    },


    addBagItem:function (id,obj) {
        if(!this._bagMap[id])this._bagMap[id] = [];
        this._bagMap[id].push(obj);
    },


    getBagLength:function (id) {
        var array = this._bagMap[id];
        return array?array.length:0;
    },


    //根据位置得到掉落
    getDropByLocation:function (location) {
        return this._dropMap.getByXY(location);
    }
});
