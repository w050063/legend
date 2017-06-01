/**
 * Created by bot.su on 2017/4/11.
 */
var cc = require("./util/cc");
var GameConst = require('./util/GameConst');
var JsUtil = require('./util/JsUtil');



module.exports = cc.Class.extend({
    _data:null,
    _mst:null,
    ctor:function (id,type) {

        //为什么这么设计，因为这些数据要经常发送客户端
        this._data = {};
        this._data.id = id;
        this._data.type = type;
        this._data.camp = 0;
        this._data.x = 0;
        this._data.y = 0;


        //if(id[0]=='u'){//玩家
        //}else{//怪物
        //}
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
        this._data.x = x;
        this._data.y = y;

        //走路。
        var array = cc.svGameLayer._roleMap[this.getMapName()];
        for(var i=0;i<array.length;++i){
            if(array[i]._data.camp!=GameConst.campMonster && array[i]._data.id!=this._data.id){
                JsUtil.send("svWalk",JSON.stringify({id:this._data.id,x:this._data.x,y:this._data.y}),[array[i]._data.id]);
            }
        }
    }
});
