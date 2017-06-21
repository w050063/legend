/**
 * Created by bot.su on 2017/6/21.
 * 角色类
 */


module.exports = ag.class.extend({
    _data:null,
    _mst:null,
    ctor:function () {

    },


    //获得策划数据
    getMst : function(){
        return ag.gameConst._roleMst[type];
    },


    //获得地图名字
    getMapName : function(){
        for(var key in ag.gameLayer._roleMap){
            var array = ag.gameLayer._roleMap[key];
            for(var i=0;i<array.length;++i)if(array[i]==this)return key;
        }
        return null;
    },


    move:function(x,y){
        var oldStr = this.getMapXYString();
        this._data.x = x;
        this._data.y = y;
        var newStr = this.getMapXYString();


        //更新xy数组信息
        ag.gameLayer._roleXYMap[oldStr].splice(ag.gameLayer._roleXYMap[oldStr].indexOf(oldStr),1);
        if(!ag.gameLayer._roleXYMap[newStr])ag.gameLayer._roleXYMap[newStr] = [];
        ag.gameLayer._roleXYMap[newStr].push(this);



        //通知其他人
        for(var key in ag.gameLayer._roleMap){
            var data = ag.gameLayer._roleMap[key]._data;
            if(data.mapId==this._data.mapId && data.camp!=ag.gameConst.campMonster && data.id!=this._data.id){
                ag.jsUtil.send("sMove",JSON.stringify({id:this._data.id,x:this._data.x,y:this._data.y}),[data.id]);
            }
        }
    },


    getMapXYString:function(){
        return ''+this._data.mapId+','+this._data.x+','+this._data.y;
    },
});
