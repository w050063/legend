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
        pomelo.init({host: "47.92.67.211",port: 3014,log: true}, function() {
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


    //监听进入游戏
    onSEnter:function(){
        pomelo.on('sEnter',function(data) {
            var msg = JSON.parse(data.msg);
            ag.userInfo._id = msg.id;
            ag.userInfo._name = msg.name;
            ag.userInfo._x = msg.x;
            ag.userInfo._y = msg.y;
            ag.userInfo._data = msg;
            ag.userInfo._accountData.sex = msg.sex;
            ag.userInfo._accountData.type = msg.type;
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
            cc.log(data);
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
                ag.gameLayer.addRole(obj.value);
            }else if(obj.key=='sMoveForceArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player) {
                    player.myMoveByServer(cc.p(obj.value.x, obj.value.y));
                    player.relife();
                }
            }else if(obj.key=='sBFireCritArray'){
                ag.buffManager.setCDForFireCritById(obj.value,false);
            }else if(obj.key=='sFireWallArray'){
                var player =  ag.gameLayer.getRole(obj.value.rid);
                if(player){
                    ag.buffManager.setFireWall(obj.value.id,player);
                }
            }else if(obj.key=='sAddExpArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player){
                    player.addExp(obj.value.level,obj.value.exp);
                }
            }else if(obj.key=='sDropArray'){
                ag.gameLayer.dropItem(obj.value);
            }else if(obj.key=='sItemGroundDeleteArray'){
                ag.gameLayer.itemGroundDelete(obj.value);
            }else if(obj.key=='sItemBagAddArray'){
                ag.gameLayer.itemBagAdd(obj.value);
            }else if(obj.key=='sItemArray'){
                ag.gameLayer.initItem(obj.value);
            }else if(obj.key=='sItemDisappearArray'){
                ag.gameLayer.sItemDisappear(obj.value);
            }else if(obj.key=='sDeleteRoleArray'){
                ag.gameLayer.deleteRoleByServer(obj.value);
            }else if(obj.key=='sBagItemToEquipArray'){
                ag.gameLayer.bagItemToEquip(obj.value.id,obj.value.rid);
            }else if(obj.key=='sEquipItemToBagArray'){
                ag.gameLayer.equipItemToBag(obj.value.id,obj.value.rid);
            }else if(obj.key=='sChatYouArray'){
                ag.gameLayer.chat(obj.value.id,obj.value.content);
            }else if(obj.key=='sSystemNotifyArray'){
                ag.gameLayer.systemNotify(obj.value);
            }
        }
        this._dataArray = [];
    },
};
