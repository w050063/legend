
var JsUtil = require('../../../game/util/JsUtil');
var cc = require("../../../game/util/cc");
var GameConst = require("../../../game/util/GameConst");
var BattleLogic = require("../../../game/BattleLogic");

module.exports = function(app) {
    return new Handler(app);
};

var Handler = cc.Class.extend({
    ctor:function (app) {
        this.app = app;
        GameConst.workHandlerApp = app;
        this.abc = Math.random();
        console.log("wwwwwwwwww");
    },


    /**
     * Send messages to users
     *
     * @param {Object} msg message from client
     * @param {Object} session
     * @param  {Function} next next stemp callback
     *
     */
    send : function(msg, session, next) {
        console.log("abbbbbbbvvv:"+this.abc);
        var channelService = this.app.get('channelService');
        var param = {
            msg: msg.content,
            from: session.get("uid"),
            target: msg.target
        };
        var channel = channelService.getChannel(JsUtil.dataChannel, true);

        //the target is all users
        if(msg.target == '*') {
            channel.pushMessage('onChat', param);
        }
        //the target is specific user
        else {
            var tuid = msg.target;
            var tsid = channel.getMember(tuid)['sid'];
            channelService.pushMessageByUids('onChat', param, [{
                uid: tuid,
                sid: tsid
            }]);
        }
        next(null, {});
    },


    //Ω¯»Î”Œœ∑
    enter:function(msg, session, next) {
        BattleLogic.addPlayer(session.uid,msg.name,msg.type,msg.sex);
        next(null, {});
    },
});
