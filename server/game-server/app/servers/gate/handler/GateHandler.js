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
        this._baseUid = 0;
        this._version = '0.0.1';
    },



    getUniqueUid: function() {
        return 'r'+(++this._baseUid);
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

        if(typeof msg.version=='string'){
            var array1 = this._version.split('.');
            var array2 = msg.version.split('.');
            if(parseInt(array1[0])>parseInt(array2[0])){
                next(null, {code:1,text:'请下载新版本!'});
                return;
            }else if(parseInt(array1[0])==parseInt(array2[0]) && parseInt(array1[1])>parseInt(array2[1])){
                next(null, {code:1,text:'请下载新版本!'});
                return;
            }else if(parseInt(array1[1])==parseInt(array2[1]) && parseInt(array1[2])>parseInt(array2[2])){
                next(null, {code:1,text:'请下载新版本!'});
                return;
            }
        }


        // select conn
        var res = connectors[Math.floor(Math.random()*connectors.length)];
        next(null, {
            code: 0,
            host: res.host,
            port: res.clientPort,
            uid:this.getUniqueUid()
        });
    },
});