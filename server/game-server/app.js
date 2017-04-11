var pomelo = require('pomelo');
var JsUtil = require('./app/util/JsUtil').JsUtil;
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'server');

// app configuration
app.configure('production|development', 'connector', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			heartbeat : 3,
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

// app configure
app.configure('production|development', function() {
    // route configures
    app.route('chat', function(session, msg, app, cb) {
        //根据玩家所在地图决定访问哪个服务器！
        var chatServers = app.getServersByType('chat');
        var mapIndex = session.get("mapIndex");
        var res = chatServers[(mapIndex || mapIndex==0)?mapIndex:0];
        cb(null, res.id);
    });

    // filter configures
    app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});