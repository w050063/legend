/**
 * Created by bot.su on 2017/4/11.
 */

var cc = require("./cc");
module.exports = cc.Class.extend({
    _data : null,
    ctor:function (uid) {
        this._data = {};
        this._data.uid = uid;
        console.log("player ctor");
    },
});
