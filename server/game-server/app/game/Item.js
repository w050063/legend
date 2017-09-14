/**
 * Created by bot.su on 2017/6/21.
 * 道具表
 */


var baseItemId = 0;
module.exports = ag.class.extend({
    ctor:function (mid,location) {
        this._data = {};
        this._data.id = 'i'+(++baseItemId);
        this._data.mid = mid;
        this._data.x = location.x;
        this._data.y = location.y;
    },
});
