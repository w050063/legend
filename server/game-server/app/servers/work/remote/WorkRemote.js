var JsUtil = require('../../../game/util/JsUtil');
var BattleLogic = require("../../../game/BattleLogic");


module.exports = function(app) {
	return new WorkRemote(app);
};

var WorkRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into work channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
WorkRemote.prototype.add = function(uid, sid, cb) {
	var channel = this.channelService.getChannel(JsUtil.dataChannel, true);
	var param = {
		route: 'onAdd',
		user: uid
	};
	channel.pushMessage(param);

	if( !! channel) {
		channel.add(uid, sid);
	}
    BattleLogic.addPlayer(uid);
	cb(this.get());
};

/**
 * Get user from work channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */

WorkRemote.prototype.get = function() {
	return this.channelService.getChannel(JsUtil.dataChannel, true).getMembers();
};

/**
 * Kick user out work channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
WorkRemote.prototype.kick = function(uid, sid, cb) {
	var channel = this.channelService.getChannel(JsUtil.dataChannel, true);
	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
	}

	var param = {
		route: 'onLeave',
		user: uid
	};
	channel.pushMessage(param);
	cb();
};
