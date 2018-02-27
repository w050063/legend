/**
 * Created by bot.su on 2017/6/21.
 * 接收其他服务器的通知
 */

var pomelo = require('pomelo');

module.exports = function(app) {
	return new WorkRemote(app);
};

var WorkRemote = function(app) {
	this.app = app;
};


WorkRemote.prototype.kick = function(uid, sid, cb) {
    var sessionService = pomelo.app.get('sessionService');
    if(sessionService){
        sessionService.kick(uid,function(){});
    }
    cb();
};
