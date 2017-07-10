/**
 * Created by bot.su on 2017/6/21.
 * 通讯相关处理
 */


require("boot");
module.exports={
    _sessionId:null,
    _dataArray:[],

    //setup socket.
    init: function(callback) {
        var self = this;
        var tempId = null;
        pomelo.init({host: "47.92.67.211",port: 3014,log: true}, function() {
			pomelo.request('gate.GateHandler.queryEntry', {}, function(data) {
				pomelo.disconnect();
				tempId=data.uid;
				pomelo.init({host: data.host,port: data.port,log: true}, function() {
					pomelo.request("conn.ConnHandler.connect", {uid:tempId}, function(data) {
                        cc.log("网关 successed!");
				        self._sessionId=tempId;
                        if(callback)callback();
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
            ag.agSocket.onBattleEvent();
            cc.director.loadScene("GameLayer");
        });
    },
    offSEnter:function(){
        pomelo.on('sEnter',undefined);
    },


    //启动战斗中网络
    onBattleEvent:function(){
        pomelo.on('sRole',function(data) {
            var array = JSON.parse(data.msg);
            this._dataArray.push({key:"sRole",value:array});
        }.bind(this));

        pomelo.on('sMove',function(data) {
            var obj = JSON.parse(data.msg);
            this._dataArray.push({key:"sMove",value:obj});
        }.bind(this));

        pomelo.on('sMyMove',function(data) {
            var obj = JSON.parse(data.msg);
            this._dataArray.push({key:"sMyMove",value:obj});
        }.bind(this));

        pomelo.on('sAttack',function(data) {
            var obj = JSON.parse(data.msg);
            this._dataArray.push({key:"sAttack",value:obj});
        }.bind(this));

        pomelo.on('sHP',function(data) {
            var array = JSON.parse(data.msg);
            this._dataArray.push({key:"sHP",value:array});
        }.bind(this));
    },



    //停止战斗中网络
    offBattleEvent:function(){
        pomelo.on('sRole',undefined);
        pomelo.on('sMove',undefined);
        pomelo.on('sMyMove',undefined);
        pomelo.on('sAttack',undefined);
        pomelo.on('sHP',undefined);
    },


    //缓存的数据，需要的时候调用。
    doWork:function(){
        if(this._dataArray.length==0)return;
        while(this._dataArray.length>0){
            var obj = this._dataArray[0];
            if(obj.key=="sRole"){
                var array = obj.value;
                for(var j=0;j<array.length;++j){
                    ag.gameLayer.addRole(array[j]);
                }
            }else if(obj.key=="sMove"){
                var obj2 = obj.value;
                var player =  ag.gameLayer._roleMap[obj2.id];
                if(player){
                    player.move(cc.p(obj2.x,obj2.y),true);
                }
            }else if(obj.key=="sMyMove"){
                var obj = obj.value;
                ag.gameLayer._player.myMoveByServer(obj.x,obj.y);
            }else if(obj.key=="sAttack"){
                var obj = obj.value;
                var player =  ag.gameLayer.getRole(obj.id);
                var locked =  ag.gameLayer.getRole(obj.lockedId);
                if(player && locked){
                    player.attack(locked,true);
                }
            }else if(obj.key=="sHP"){
                var array = obj.value;
                for(var i=0;i<array.length;++i){
                    var player =  ag.gameLayer.getRole(array[i].id);
                    if(player){
                        player.changeHP(array[i].hp);
                    }
                }
            }
            this._dataArray.splice(0,1);
        }
    },
};
