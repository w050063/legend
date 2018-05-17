var pomelo = require('pomelo');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'server');
var serverZoneArray = [[1,2,3,4,5],[6],[7]];

// app configuration
app.configure('production|development', 'conn', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 30,
			useDict : true,
			useProtobuf : true,
		});
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true,
		});
});



app.configure('production|development', 'work', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            useProtobuf : true,
        });
});

//// app configure
app.configure('production|development', function() {
    // route configures
    //app.route('work', function(session, msg, app, cb) {
    //    //根据玩家所在地图决定访问哪个服务器！
    //    var chatServers = app.getServersByType('work');
    //    var res = chatServers[(mapIndex || mapIndex==0)?mapIndex:0];
    //    cb(null, res.id);
    //});

    app.route('conn', function(session, msg, app, cb) {
        var chatServers = app.getServersByType('conn');
        var index = 0;
        for(var i=0;i<chatServers.length;++i){
            if(chatServers[i].id==session["frontendId"]){
                index = i;
                break;
            }
        }
        var res = chatServers[index];
        cb(null, res.id);
    });


    app.route('work', function(session, msg, app, cb) {
        var chatServers = app.getServersByType('work');

        //var sessionService = app.get('sessionService');
        //var session2 = sessionService.get(session.id);
        //var index = 0;
        //var legendId = 1;
        //if(session2){
        //    var uid = session2.get('uid');
        //    if(uid)legendId = uid.split('_')[0];
        //}
        //else if(msg['args'][0])legendId = msg['args'][0].split('_')[0];
        //if(legendId==1)index = 0;
        //if(legendId==2)index = 1;

        var rid = parseInt(session.get('rid'));
        var index = -1;
        for(var i=0;i<serverZoneArray.length;++i){
            if(serverZoneArray[i].indexOf(rid)!=-1){
                index = i;
                break;
            }
        }

        if(index!=-1){
            var res = chatServers[index];
            cb(null, res.id);
        }else{
            cb(null, null);
        }
    });


    // filter configures
    app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});