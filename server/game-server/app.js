var pomelo = require('pomelo');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'server');

// app configuration
app.configure('production|development', 'conn', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 30,
			useDict : true,
			useProtobuf : true
		});
});

app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true
		});
});



app.configure('production|development', 'work', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            useProtobuf : true
        });
});

//// app configure
//app.configure('production|development', function() {
//    // route configures
//    app.route('work', function(session, msg, app, cb) {
//        //根据玩家所在地图决定访问哪个服务器！
//        var chatServers = app.getServersByType('work');
//        var res = chatServers[(mapIndex || mapIndex==0)?mapIndex:0];
//        cb(null, res.id);
//    });
//
//    // filter configures
//    app.filter(pomelo.timeout());
//});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});