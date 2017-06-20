require("boot");
var Role = require("Role");
var UserInfo = require("UserInfo");
module.exports={
    _sessionId:null,
    _dataArray:[],

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




        //网络事件
        pomelo.on('svRole',function(data) {
            var array = JSON.parse(data.msg);
            cc.log("svRole");
            cc.log(array);

            if(cc.vv._gameLayer){
                for(var i=0;i<array.length;++i){
                    cc.vv._gameLayer.addRole(array[i]);
                }
            }else{
                this._dataArray.push({key:"svRole",value:array});
            }
        }.bind(this));


        pomelo.on('svWalk',function(data) {
            var obj = JSON.parse(data.msg);
            cc.log("svWalk");
            cc.log(obj);

            if(cc.vv._gameLayer){
                cc.vv._gameLayer.getRole(obj.id).walk(cc.p(obj.x,obj.y));
            }else{
                this._dataArray.push({key:"svWalk",value:obj});
            }
        }.bind(this));
	},


    //缓存的数据，需要的时候调用。
    doSVRole:function(){
        for(var i=this._dataArray.length-1;i>=0;--i){
            var obj = this._dataArray[i];
            if(obj.key=="svRole"){
                var array = obj.value;
                for(var j=0;j<array.length;++j){
                    cc.vv._gameLayer.addRole(array[j]);
                }
            }
        }
    },


    doSVWalk:function(){
        for(var i=this._dataArray.length-1;i>=0;--i){
            var obj = this._dataArray[i];
            if(obj.key=="svWalk"){
                var obj2 = obj.value;
                cc.vv._gameLayer.getPlayer(obj2.id,UserInfo._mapName).walk(cc.p(obj2.x,obj2.y));
            }
        }
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
