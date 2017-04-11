/**
 * Created by bot.su on 2017/4/11.
 */
var cc = require("./cc");
var Player = require("./Player");
var BattleLogic = cc.Class.extend({
    _playerArray:[],
    ctor:function () {
        console.log("BattleLogic ctor");
    },

    addPlayer:function(uid){
        this._playerArray.push(new Player(uid));
        console.log("BattleLogic addPlayer");
    },
});
module.exports = new BattleLogic();