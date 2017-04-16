/**
 * Created by bot.su on 2017/4/11.
 */

var cc = require("./util/cc");
module.exports = cc.Class.extend({
    _data : null,
    ctor:function (uid) {

        //为什么这么设计，因为这些数据要经常发送客户端
        this._data = {};
        this._data.uid = uid;
		this._data._name = "";
		this._data._hp = 0;
		this._data._hpAdd = 0;
		this._data._defense = 0;
		this._data._defenseAdd = 0;
		this._data._hurt = 0;
		this._data._hurtAdd = 0;
		this._data._exp = 0;
		this._data._expAdd = 0;
		this._data._deadExp = 0;
		this._data._heal = 0;
		this._data._healAdd = 0;
		this._data._model = "";
		this._data._x = 0;
		this._data._y = 0;


        this._data._type = 0;
        this._data._camp = 0;
    },
});
