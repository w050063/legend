/**
 * Created by bot.su on 2017/6/21.
 * 和客户端链接类
 */


var cc = require("../../..//game/util/cc");

module.exports = function(app) {
    return new Handler(app);
};


var Handler = cc.Class.extend({
    ctor:function (app) {
        this.app = app;
    },


    //���ӽ���
    connect : function(msg, session, next) {
        var self = this;
        var uid = msg.uid;
        var sessionService = self.app.get('sessionService');

        //duplicate log in
        if( !! sessionService.getByUid(uid)) {
            next(null, {
                code: 500,
                error: true
            });
            return;
        }

        var legendId = uid.split('_')[0];
        if(legendId!=1 && legendId!=2 && legendId!=3 && legendId!=4 && legendId!=5 && legendId!=6 && legendId!=7){
            next(null, {
                code: 500,
                error: true
            });
            return;
        }

        session.bind(uid);
        //session.set('uid', uid);
        //session.push('uid', function(err) {
        //    if(err) {
        //        console.error('set uid for session service failed! error is : %j', err.stack);
        //    }
        //});
        session.set('rid', legendId);
        session.push('rid', function(err) {
            if(err) {
                console.error('set rid for session service failed! error is : %j', err.stack);
            }
        });
        session.on('closed', this.onUserLeave.bind(null, self.app));

        //put user into channel
        self.app.rpc.work.WorkRemote.add(session, uid, self.app.get('serverId'), function(){
            next(null, {});
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
        if(!session || !session.uid) {
            return;
        }
        app.rpc.work.WorkRemote.kick(session, session.uid, app.get('serverId'), function(){
            //console.log("====== kick callback over! ======");
        });
    },
});
