/**
 * Created by bot.su on 2017/4/11.
 */
var Player = require("./Player");
module.exports = {
    _playerArray:[],
    addPlayer:function(uid){
        this._playerArray.push(new Player(uid));
        console.log("BattleLogic addPlayer");
    },
};
