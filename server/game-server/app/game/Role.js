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
        if(Math.abs(this._data.x-x)>1 || Math.abs(this._data.y-y)>1){
            //位置异常，重新定位
            ag.jsUtil.send("sMyMove",JSON.stringify({x:this._data.x,y:this._data.y}),[this._data.id]);
            return;
        }
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


    //攻击
    attack:function(lockedId){
        var data = ag.gameLayer._roleMap[lockedId]._data;
        var x = data.x, y = data.y;
        var sendArray = [];
        for(var i=y-1;i<=y+1;++i){
            for(var j=x-1;j<=x+1;++j){
                var array = ag.gameLayer._roleXYMap[''+data.mapId+','+j+','+i];
                if(array){
                    for(var k=0;k<array.length;++k){
                        var lockedData = array[k]._data;
                        if(lockedData.camp!=this._data.camp){
                            lockedData.hp -= 5;
                            sendArray.push({id:lockedData.id,hp:lockedData.hp});
                        }
                    }
                }
            }
        }
        //通知所有人
        for(var key in ag.gameLayer._roleMap){
            var data = ag.gameLayer._roleMap[key]._data;
            if(data.camp!=ag.gameConst.campMonster && data.id!=this._data.id){
                ag.jsUtil.send("sAttack",JSON.stringify({id:this._data.id,lockedId:lockedId}),[data.id]);
            }
        }

        ag.jsUtil.sendAll("sHP",JSON.stringify(sendArray));
    },


    getMapXYString:function(){
        return ''+this._data.mapId+','+this._data.x+','+this._data.y;
    },
});
