/**
 * Created by bot.su on 2017/6/21.
 * 带有xy索引的map
 */


cc.Class({
    extends: cc.Component,
    properties: {},

    init:function () {
        this._roleMap = {};//根据id标识对象
        this._roleXYMap = {};//根据xy标识对象
    },


    add:function (obj) {
        this._roleMap[obj.id] = obj;
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

    getByXY:function (location) {
        return this._roleXYMap[''+location.x+','+location.y];
    },

    getMapXYString:function(obj){
        return ''+obj.x+','+obj.y;
    },
});
