/**
 * Created by bot.su on 2017/6/21.
 * 网关
 */


var cc = require("../../..//game/util/cc");

module.exports = function(app) {
    return new Handler(app);
};

var Handler = cc.Class.extend({
    ctor:function (app) {
        this.app = app;
    },


    /**
     * Gate handler that dispatch user to connectors.
     *
     * @param {Object} msg message from client
     * @param {Object} session
     * @param {Function} next next stemp callback
     *
     */
    queryEntry : function(msg, session, next) {
        // get all connectors
        var connectors = this.app.getServersByType('conn');
        if(!connectors || connectors.length === 0) {
            next(null, {
                code: 500
            });
            return;
        }

        // select conn
        var res = connectors[Math.floor(Math.random()*connectors.length)];
        next(null, {
            code: 200,
            host: res.host,
            port: res.clientPort
        });
    },
});