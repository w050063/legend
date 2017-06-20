/**
 * Created by bot.su on 2017/4/11.
 */
var cc = require("./util/cc");
var GameConst = require('./util/GameConst');
var JsUtil = require('./util/JsUtil');



module.exports = cc.Class.extend({
    _data:null,
    _mst:null,
    ctor:function () {

    },


    //获得策划数据
    getMst : function(){
        return GameConst._roleMst[type];
    },


    //获得地图名字
    getMapName : function(){
        for(var key in cc.svGameLayer._roleMap){
            var array = cc.svGameLayer._roleMap[key];
            for(var i=0;i<array.length;++i)if(array[i]==this)return key;
        }
        return null;
    },


    walk:function(x,y){
        var oldStr = this.getMapXYString();
        this._data.x = x;
        this._data.y = y;
        var newStr = this.getMapXYString();


        //更新xy数组信息
        cc.svGameLayer._roleXYMap[oldStr].splice(cc.svGameLayer._roleXYMap[oldStr].indexOf(oldStr),1);
        if(!cc.svGameLayer._roleXYMap[newStr])cc.svGameLayer._roleXYMap[newStr] = [];
        cc.svGameLayer._roleXYMap[newStr].push(this);



        //通知其他人
        for(var key in cc.svGameLayer._roleMap){
            var data = cc.svGameLayer._roleMap[key]._data;
            if(data.mapId==this._data.mapId && data.camp!=GameConst.campMonster && data.id!=this._data.id){
                JsUtil.send("svWalk",JSON.stringify({id:this._data.id,x:this._data.x,y:this._data.y}),[data.id]);
            }
        }
    },


    getMapXYString:function(){
        return ''+this._data.mapId+','+this._data.x+','+this._data.y;
    },
});
