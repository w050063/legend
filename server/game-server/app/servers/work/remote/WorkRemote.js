/**
 * Created by bot.su on 2017/6/21.
 * 接收其他服务器的通知
 */


module.exports = function(app) {
	return new WorkRemote(app);
};

var WorkRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
    this._baseUid = 0;
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
    if(!global.ag){
        global.ag = {};
        var legendId = uid.split('_')[0];
        ag.class = require("../../../game/util/cc").Class;
        ag.actionManager = require("../../../game/util/ActionManager");
        ag.actionManager.init();
        ag.jsUtil = require('../../../game/util/JsUtil');
        ag.jsUtil.init();
        ag.gameConst = require('../../../game/util/GameConst');
        ag.gameConst.init();
        var AuctionShop = require("../../../game/AuctionShop.js");
        ag.auctionShop = new AuctionShop();
        ag.gameLayer = require("../../../game/GameLayer");
        ag.gameLayer.init(legendId);
        var BuffManager = require("../../../game/BuffManager");
        ag.buffManager = new BuffManager();
		var UserManager = require("../../../game/UserManager");
		ag.userManager = new UserManager();
		var GameListManager = require("../../../game/GameListManager");
		ag.gameListManager = new GameListManager();
		var ItemManager = require("../../../game/ItemManager");
		ag.itemManager = new ItemManager();
        var DB = require("../../../game/util/db.js");
        ag.db = new DB();
        var Guild = require("../../../game/Guild.js");
        ag.guild = new Guild();
        var Shabake = require("../../../game/Shabake.js");
        ag.shabake = new Shabake();
        var Team = require("../../../game/Team.js");
        ag.team = new Team();
        var Deal = require("../../../game/Deal.js");
        ag.deal = new Deal();
    }
	var channel = this.channelService.getChannel(ag.jsUtil.dataChannel, true);
	var param = {
		route: 'onAdd',
		user: uid
	};
	channel.pushMessage(param);

	if( !! channel) {
		channel.add(uid, sid);
	}
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
	return this.channelService.getChannel(ag.jsUtil.dataChannel, true).getMembers();
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
    //解除绑定
    var id = ag.userManager.getAccountByUid(uid);
    ag.userManager.unbindUid(uid);
    ag.userManager.setOnline(id,false);
    var role = ag.gameLayer.getRole(id);
    if(role){
        role.offline();
    }

	var channel = this.channelService.getChannel(ag.jsUtil.dataChannel, true);
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
