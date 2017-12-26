/**
 * Created by bot.su on 2017/6/21.
 * 道具表
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._roleMap = {};//根据id标识对象
        this._roleXYMap = {};//根据xy标识对象
    },


    add:function (obj) {
        this._roleMap[obj._data.id] = obj;
        var xyStr = this.getMapXYString(obj);
        if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
        this._roleXYMap[xyStr].push(obj);
    },


    del:function (id) {
        var obj = this._roleMap[id];
        if(obj){
            var xyStr = this.getMapXYString(obj);
            this._roleXYMap[xyStr].splice(this._roleXYMap[xyStr].indexOf(obj),1);
            if(this._roleXYMap[xyStr].length==0)delete this._roleXYMap[xyStr];
            delete this._roleMap[id];
        }
    },

    get:function (id) {
        return this._roleMap[id];
    },

    getMap:function(){
        return this._roleMap;
    },

    setMapXYById:function(id,mapId,x,y){
        var obj = this._roleMap[id];
        var xyStr = this.getMapXYString(obj);
        obj._data.mapId = mapId;
        obj._data.x = x;
        obj._data.y = y;
        this._roleXYMap[xyStr].splice(this._roleXYMap[xyStr].indexOf(obj),1);
        if(this._roleXYMap[xyStr].length==0)delete this._roleXYMap[xyStr];

        xyStr = this.getMapXYString(obj);
        if(!this._roleXYMap[xyStr])this._roleXYMap[xyStr] = [];
        this._roleXYMap[xyStr].push(obj);
    },

    getByXY:function (mapId,location) {
        var array = this._roleXYMap[''+mapId+','+location.x+','+location.y];
        return array?array:[];
    },

    getMapXYString:function(obj){
        return ''+obj._data.mapId+','+obj._data.x+','+obj._data.y;
    },
});
