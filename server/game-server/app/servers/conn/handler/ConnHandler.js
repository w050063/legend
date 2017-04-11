var cc = require("../../..//game/util/cc");

module.exports = function(app) {
    return new Handler(app);
};


var Handler = cc.Class.extend({
    ctor:function (app) {
        this.app = app;
    },

    /**
     * New client entry work server.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next stemp callback
     * @return {Void}
     */
    enter : function(msg, session, next) {
        var self = this;
        var uid = msg.uid
        var sessionService = self.app.get('sessionService');

        //duplicate log in
        if( !! sessionService.getByUid(uid)) {
            next(null, {
                code: 500,
                error: true
            });
            return;
        }

        session.bind(uid);
        session.set('uid', msg.uid);
        session.push('uid', function(err) {
            if(err) {
                console.error('set uid for session service failed! error is : %j', err.stack);
            }
        });

        session.set('mapIndex', Math.floor(Math.random()*3));
        session.push('mapIndex', function(err) {
            if(err) {
                console.error('set mapIndex for session service failed! error is : %j', err.stack);
            }
        });

        session.on('closed', this.onUserLeave.bind(null, self.app));

        //put user into channel
        self.app.rpc.work.WorkRemote.add(session, uid, self.app.get('serverId'), function(users){
            next(null, {
                users:users
            });
        });
    },


    /**
     * User log out handler
     *
     * @param {Object} app current application
     * @param {Object} session current session object
     *
     */
    onUserLeave : function(app, session) {
        if(!session || !session.get("uid")) {
            return;
        }
        app.rpc.work.WorkRemote.kick(session, session.get("uid"), app.get('serverId'), null);
    },
});
