/**
 * Created by bot.su on 2017/6/21.
 * 通讯相关处理
 */


//require("boot");
//require("pomelo_cocos2d_js");

module.exports={
    _sessionId:null,
    _dataArray:[],

    //setup socket.
    init: function(callback) {
        var self = this;
        var id = cc.sys.localStorage.getItem('id');
        if(!id){
            id = 'r'+(new Date().getTime());
            cc.sys.localStorage.setItem('id',id);
        }
        self._sessionId=id;
        //var tempId = null;
        pomelo.init({host: "127.0.0.1",port: 3014,log: true}, function() {
            pomelo.request('gate.GateHandler.queryEntry', {}, function(data) {
                //tempId=data.uid;
                pomelo.disconnect(function () {
                    pomelo.init({host: data.host,port: data.port,log: true}, function() {
                        pomelo.request("conn.ConnHandler.connect", {uid:self._sessionId}, function(data) {
                            cc.log("网关 successed!");
                            //self._sessionId=tempId;
                            if(callback)callback(data);
                        });
                    });
                });
            });
        });
	},


    //设置断开逻辑
    setDisconnect:function (callback) {
        pomelo.on('disconnect',function () {
            pomelo.removeAllListeners('disconnect');
            callback();
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
        //pomelo.on('sChat',undefined);
        pomelo.removeAllListeners('sChat');
    },


    //监听进入游戏
    onSEnter:function(){
        pomelo.on('sEnter',function(data) {
            var msg = JSON.parse(data.msg);
            //cc.log(JSON.stringify(msg));
            ag.userInfo._id = msg.id;
            ag.userInfo._name = msg.name;
            ag.userInfo._x = msg.x;
            ag.userInfo._y = msg.y;
            ag.userInfo._data = msg;
            //ag.agSocket.offSChat();
            ag.agSocket.offSEnter();
            ag.agSocket.onBattleEvent();
            cc.director.loadScene("GameLayer");
        });
    },
    offSEnter:function(){
        //pomelo.on('sEnter',undefined);
        pomelo.removeAllListeners('sEnter');
    },


    //启动战斗中网络
    onBattleEvent:function(){
        pomelo.on('onData',function(data) {
            for(var key in data){
                var array = data[key];
                for(var i=0;i<array.length;++i){
                    var value = array[i];
                    if(this.getExistAttackOrMove(value.id,key)==false){
                        var obj = {key:key,value:value};
                        this._dataArray.push(obj);
                    }
                }
            }
        }.bind(this));
    },


    //停止战斗中网络
    offBattleEvent:function(){
        //pomelo.on('onData',undefined);
        pomelo.removeAllListeners('onData');
    },


    //获得有没有某id攻击移动数据
    getExistAttackOrMove:function (id,key) {
        if(key=='sMoveArray' || key=='sAttackArray'){
            for(var i=0;i<this._dataArray.length;++i){
                var obj = this._dataArray[i];
                if(obj.value.id==id && (obj.key=='sMoveArray' || obj.key=='sAttackArray')){
                    return true;
                }
            }
        }
        return false;
    },


    //缓存的数据，需要的时候调用。
    doWork:function(){
        for(var i=0;i<this._dataArray.length;++i){
            var obj = this._dataArray[i];
            if(obj.key=='sMoveArray'){
                var player =  ag.gameLayer._roleMap[obj.value.id];
                if(player){
                    player.move(cc.p(obj.value.x,obj.value.y),true);
                }
            }else if(obj.key=='sAttackArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                var locked =  ag.gameLayer.getRole(obj.value.lockedId);
                if(player && locked){
                    player.attack(locked,true);
                }
            }else if(obj.key=='sHPArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player){
                    player.changeHP(obj.value.hp);
                }
            }else if(obj.key=='sRoleArray'){
                ag.gameLayer.addRole(JSON.parse(obj.value));
            }else if(obj.key=='sMoveForceArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player) {
                    player.myMoveByServer(obj.value.x, obj.value.y);
                    player.relife();
                }
            }else if(obj.key=='sBuffManagerArray'){
                ag.buffManager.setData((JSON.parse(obj.value)));
            }else if(obj.key=='sBFireCritArray'){
                ag.buffManager.setCDForFireCritById(obj.value,false);
            }else if(obj.key=='sFireWallArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player){
                    ag.buffManager.setFireWall(obj.value.mapXYString,player);
                }
            }else if(obj.key=='sAddExpArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player){
                    player.addExp(obj.value.level,obj.value.exp);
                }
            }
        }
        this._dataArray = [];


        // if(this._dataArray.length==0)return;
        // while(this._dataArray.length>0){
        //     var obj = this._dataArray[0];
        //     //cc.log(JSON.stringify(obj));
        //     this.helpForDoWork(obj,'sMoveArray',function(obj2){
        //         var player =  ag.gameLayer._roleMap[obj2.id];
        //         if(player){
        //             //cc.log(obj2.id,obj2.x,obj2.y);
        //             player.move(cc.p(obj2.x,obj2.y),true);
        //         }
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sAttackArray',function(obj){
        //         var player =  ag.gameLayer.getRole(obj.id);
        //         var locked =  ag.gameLayer.getRole(obj.lockedId);
        //         if(player && locked){
        //             player.attack(locked,true);
        //         }
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sHPArray',function(obj){
        //         var player =  ag.gameLayer.getRole(obj.id);
        //         if(player){
        //             player.changeHP(obj.hp);
        //         }
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sRoleArray',function(obj){
        //         ag.gameLayer.addRole(JSON.parse(obj));
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sMoveForceArray',function(obj){
        //         var player =  ag.gameLayer.getRole(obj.id);
        //         if(player) {
        //             player.myMoveByServer(obj.x, obj.y);
        //             player.relife();
        //         }
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sBuffManagerArray',function(obj){
        //         ag.buffManager.setData((JSON.parse(obj)));
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sBFireCritArray',function(obj){
        //         ag.buffManager.setCDForFireCritById(obj,false);
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sFireWallArray',function(obj){
        //         var player =  ag.gameLayer.getRole(obj.id);
        //         if(player){
        //             ag.buffManager.setFireWall(obj.mapXYString,player);
        //         }
        //     }.bind(this));
        //     this.helpForDoWork(obj,'sAddExpArray',function(obj){
        //         var player =  ag.gameLayer.getRole(obj.id);
        //         if(player){
        //             player.addExp(obj.level,obj.exp);
        //         }
        //     }.bind(this));
        //     this._dataArray.splice(0,1);
        // }
    },



    //帮助上面的循环遍历
    // helpForDoWork:function(obj,name,callback){
    //     for(var key in obj){
    //         if(key==name){
    //             var array = obj[name];
    //             for(var i=0;i<array.length;++i){
    //                 callback(array[i]);
    //             }
    //         }
    //     }
    // },
};
