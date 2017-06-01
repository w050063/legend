/*
 * ..
 */
var cc = require("../../../game/util/cc");
var JsUtil = require('../../../game/util/JsUtil');
var SVGameLayer = require("../../../game/SVGameLayer");


module.exports = function(app) {
    return new Handler(app);
};

var Handler = cc.Class.extend({
    ctor:function (app) {
        this.app = app;
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


    //进入游戏
    enter:function(msg, session, next) {
        SVGameLayer.addPlayer(session.uid,msg.name,msg.type,msg.sex);
        next(null, {});
    },



    //移动
    walk:function(msg, session, next) {
        SVGameLayer.getPlayer(session.uid).walk(msg.x,msg.y);
        next(null, {});
    },
});
