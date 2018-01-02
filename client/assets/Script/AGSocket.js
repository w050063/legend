/**
 * Created by bot.su on 2017/6/21.
 * 通讯相关处理
 */

module.exports={
    _dataArray:[],
    _step : 0,


    //setup socket.
    init: function(callback) {
        var self = this;
        if(self._step != 0)pomelo.disconnect();
        self._step = 0;
        pomelo.init({host: "192.168.99.174",port: 3014,log: true}, function() {
            pomelo.request('gate.GateHandler.queryEntry', {}, function(data) {
                var uid = data.uid;
				pomelo.disconnect(function () {
					self._step = 1;
					pomelo.init({
						host : data.host,
						port : data.port,
						reconnect : true
					}, function (data1) {
						pomelo.request("conn.ConnHandler.connect", {uid:uid}, function(data2) {
							self._step = 2;
							cc.log("网关 successed!");
							if(callback)callback(data2);
						});
					})
				});
            });
        });


        //设置断开逻辑
        pomelo.removeAllListeners('disconnect');
        pomelo.on('disconnect',function () {
            if(self._step == 0){
            }else if(self._step == 1){
            }else if(self._step == 2){
                var node = cc.director.getScene();
                ag.agSocket._dataArray = [];
                ag.userInfo._itemMap = {};
                cc.audioEngine.stopAll();
                ag.gameLayer = null;
                if(node.name!='ConnectingLayer'){
                    cc.director.loadScene('ConnectingLayer');
                }
            }
        });
	},


    //发送数据封装
    send: function(key,obj) {
        pomelo.notify("work.WorkHandler."+key, obj);
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
        ag.jsUtil.startTime();
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
                    player.addExp(obj.value.level,obj.value.exp,obj.value.source);
                }
            }else if(obj.key=='sSetGoldArray'){
                ag.gameLayer._player.addGold(obj.value);
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
                ag.gameLayer.initItem(obj.value);
            }else if(obj.key=='sEquipItemToBagArray'){
                ag.gameLayer.equipItemToBag(obj.value.id,obj.value.rid);
            }else if(obj.key=='sChatYouArray'){
                ag.gameLayer.chat(obj.value.id,obj.value.name,obj.value.content);
            }else if(obj.key=='sSystemNotifyArray'){
                ag.gameLayer.systemNotify(obj.value);
            }else if(obj.key=='sRelifeArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player) {
                    player.relife(obj.value);
                }
            }else if(obj.key=='sGuildCreateArray'){
                if(obj.value.result==0){
                    var tempArray = [];
                    if(obj.value.member!='' && obj.value.member){
                        tempArray = obj.value.member.split(',');
                    }
                    ag.userInfo._guildMap[obj.value.id] = {id:obj.value.id,name:obj.value.name,member:tempArray};
                    for(var key in ag.gameLayer._roleMap){
                        var tempRole = ag.gameLayer._roleMap[key];
                        if(tempRole.getIsPlayer()){
                            tempRole.resetName();
                            tempRole.resetNameColor();
                        }
                    }
                }
            }else if(obj.key=='sGuildDeleteArray'){
                delete ag.userInfo._guildMap[obj.value];
                ag.userInfo._guildInvite = null;
                for(var key in ag.gameLayer._roleMap){
                    var tempRole = ag.gameLayer._roleMap[key];
                    if(tempRole.getIsPlayer()){
                        tempRole.resetName();
                        tempRole.resetNameColor();
                    }
                }
            }else if(obj.key=='sGuildInviteArray'){
                ag.userInfo._guildInvite = obj.value;
            }else if(obj.key=='sCampArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player) {
                    if(player.getIsPlayer()){
                        if(obj.value.camp>=ag.gameConst.campPlayerQinglong && obj.value.camp<=ag.gameConst.campPlayerXuanwu){
                            ag.gameLayer.systemNotify("恭喜玩家【"+player._data.name+"】加入"+ag.gameConst.campPlayerArray[obj.value.camp-ag.gameConst.campPlayerQinglong]+"！");
                        }else{
                            if(player==ag.gameLayer._player){
                                ag.jsUtil.showText(ag.gameLayer.node,"您已退出"+ag.gameConst.campPlayerArray[player._data.camp-ag.gameConst.campPlayerQinglong]+"！");
                            }
                        }
                    }
                    player._data.camp = obj.value.camp;
                    player.resetNameColor();
                }
            }else if(obj.key=='sSetOfficeArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player && player.getIsPlayer()) {
                    player.setOffice(obj.value.office);
                }
            }else if(obj.key=='sGuildWinIdArray'){
                ag.userInfo._guildWinId = obj.value;
                for(var key in ag.gameLayer._roleMap){
                    var tempRole = ag.gameLayer._roleMap[key];
                    if(tempRole.getIsPlayer()){
                        tempRole.resetName();
                        tempRole.resetNameColor();
                    }
                }
            }else if(obj.key=='sAlertArray'){
                ag.jsUtil.alert(ag.gameLayer.node,obj.value,function () {});
            }
        }
        this._dataArray = [];
        ag.jsUtil.addTime('socket');
    },
};
