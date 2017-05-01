require("boot");
module.exports={
    _sessionId:null,

    //setup socket.
    setup: function() {
        var self = this;
        var tempId = null;
        pomelo.init({host: "127.0.0.1",port: 3014,log: true}, function() {
			pomelo.request('gate.GateHandler.queryEntry', {}, function(data) {
				pomelo.disconnect();
				tempId=data.uid;
				pomelo.init({host: data.host,port: data.port,log: true}, function() {
					pomelo.request("conn.ConnHandler.connect", {uid:tempId}, function(data) {
				        self._sessionId=tempId;
						cc.log("网关 successed!");
					});
				});
			});
		});

	},

    //send data.
    send: function(tempKey,tempContent) {
	    pomelo.request("work.WorkHandler.send", {key:tempKey,content:tempContent,target:"*"}, function(data) {
			cc.log(JSON.stringify(data));
		});
    },

    //receive data.
    setRecv: function(func) {
        pomelo.on('onChat',func);
    }
};
