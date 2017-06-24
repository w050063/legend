/**
 * Created by bot.su on 2017/6/21.
 * 通讯相关处理
 */


require("boot");
module.exports={
    _sessionId:null,
    _dataArray:[],

    //setup socket.
    init: function() {
        var self = this;
        var tempId = null;
        pomelo.init({host: "192.168.99.174",port: 3014,log: true}, function() {
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


    //发送数据封装
    send: function(key,obj) {
        pomelo.notify("work.WorkHandler."+key, obj);
    },


    //监听聊天
    onSChat:function(){
        pomelo.on('sChat',function(data) {
            cc.log(JSON.stringify(data));
        });
    },
    offSChat:function(){
        pomelo.on('sChat',undefined);
    },


    //监听进入游戏
    onSEnter:function(){
        pomelo.on('sEnter',function(data) {
            var msg = JSON.parse(data.msg);
            cc.log(JSON.stringify(msg));
            ag.userInfo._id = msg.id;
            ag.userInfo._name = msg.name;
            ag.userInfo._x = msg.x;
            ag.userInfo._y = msg.y;
            ag.userInfo._data = msg;
            ag.agSocket.offSChat();
            ag.agSocket.offSEnter();
            ag.agSocket.onSRole();
            ag.agSocket.onSMove();
            cc.director.loadScene("GameLayer");
        });
    },
    offSEnter:function(){
        pomelo.on('sEnter',undefined);
    },


    //监听角色加载
    onSRole:function(){
        pomelo.on('sRole',function(data) {
            var array = JSON.parse(data.msg);
            if(ag.gameLayer){
                for(var i=0;i<array.length;++i){
                    ag.gameLayer.addRole(array[i]);
                }
            }else{
                this._dataArray.push({key:"sRole",value:array});
            }
        }.bind(this));
    },
    offSRole:function(){
        pomelo.on('sRole',undefined);
    },


    //监听角色加载
    onSMove:function(){
        pomelo.on('sMove',function(data) {
            var obj = JSON.parse(data.msg);
            if(ag.gameLayer){
                ag.gameLayer.getRole(obj.id).move(cc.p(obj.x,obj.y));
            }else{
                this._dataArray.push({key:"sMove",value:obj});
            }
        }.bind(this));
    },
    offSMove:function(){
        pomelo.on('sMove',undefined);
    },


    //缓存的数据，需要的时候调用。
    doSRole:function(){
        for(var i=this._dataArray.length-1;i>=0;--i){
            var obj = this._dataArray[i];
            if(obj.key=="sRole"){
                var array = obj.value;
                for(var j=0;j<array.length;++j){
                    ag.gameLayer.addRole(array[j]);
                }
            }
        }
    },


    doSMove:function(){
        for(var i=this._dataArray.length-1;i>=0;--i){
            var obj = this._dataArray[i];
            if(obj.key=="sMove"){
                var obj2 = obj.value;
                ag.gameLayer.getPlayer(obj2.id,ag.userInfo._mapName).move(cc.p(obj2.x,obj2.y));
            }
        }
    },
};
