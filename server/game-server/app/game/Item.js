/**
 * Created by bot.su on 2017/6/21.
 * 道具表
 */


var baseItemId = 0;
module.exports = ag.class.extend({
    ctor:function (mid,mapId,location,id) {
        this._data = {};
        if(id){
            this._data.id = id;
        }else{
            this._data.id = ''+ag.gameLayer._legendID+'_i'+(++baseItemId);
            while(ag.itemManager._itemMap.get(this._data.id)){
                this._data.id = ''+ag.gameLayer._legendID+'_i'+(++baseItemId);
            }
        }
        this._data.mid = mid;
        if(mapId)this._data.mapId = mapId;
        if(location){
            this._data.x = location.x;
            this._data.y = location.y;
        }
    },
});
