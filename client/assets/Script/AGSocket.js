/**
 * Created by bot.su on 2017/6/21.
 * 通讯相关处理
 */

module.exports={
    _dataArray:[],
    _normalDis:false,


    //setup socket.
    init: function(callback) {
        var self = this;
        if(pomelo.getSocket()){
            self._normalDis = true;
            pomelo.disconnect(function(){
                self._normalDis = false;
                self.connect(callback);
            });
        }else{
            self.connect(callback);
        }

        //设置断开逻辑
        pomelo.removeAllListeners('disconnect');
        pomelo.on('disconnect',function () {
            if(!self._normalDis){
                ag.agSocket._dataArray = [];
                ag.userInfo._itemMap = {};
                ag.userInfo._legendID = "";
                ag.userInfo._serverIP = "";
                ag.userInfo._serverPort = "";


                //清空所有内容
                if(ag.gameLayer){
                    ag.buffManager.changeMap();
                    ag.gameLayer._map.node.destroyAllChildren();
                    ag.gameLayer._nameMap.node.destroyAllChildren();
                    ag.gameLayer._roleMap = {};
                    ag.spriteCache.release();
                    ag.gameLayer = null;
                }

                var node = cc.director.getScene();
                if(node.name!='LoginScene'){
                    cc.director.loadScene('LoginScene');
                }else{
                    var label = cc.find("Canvas/labelState").getComponent(cc.Label);
                    label.string = "网络关闭...";
                    label.node.color = cc.color(255,0,0);
                }
            }
        });

        pomelo.removeAllListeners('sOtherLogin');
        pomelo.on('sOtherLogin',function(data) {
            pomelo.disconnect(function () {
                ag.userInfo._otherLogin = data.msg;
            });
        }.bind(this));
	},

    //连接
    connect: function(callback) {
        var self = this;
        pomelo.init({host: ag.userInfo._serverIP,port: ag.userInfo._serverPort,log: true}, function() {
            pomelo.request('gate.GateHandler.queryEntry', {version:ag.userInfo._version}, function(data) {
                if(data.code==0){
                    var uid = data.uid;
                    self._normalDis = true;
                    pomelo.disconnect(function () {
                        self._normalDis = false;
                        pomelo.init({
                            host : data.host,
                            port : data.port,
                            reconnect : true
                        }, function (data1) {
                            pomelo.request("conn.ConnHandler.connect", {uid:ag.userInfo._legendID+'_'+uid}, function(data2) {
                                cc.log("网关 successed!");
                                if(callback)callback(data2);
                            });
                        });
                    });
                }else{
                    pomelo.disconnect(function () {
                        ag.userInfo._otherLogin = data.text;
                        cc.director.loadScene('LoginScene');
                    });
                }
            });
        });
    },



    //发送数据封装
    send: function(key,obj) {
        pomelo.notify("work.WorkHandler."+key, obj);
    },


    //启动战斗中网络
    onBattleEvent:function(){
        pomelo.on('onData',function(data) {
            for(var key in data){
                var array = data[key];
                for(var i=0;i<array.length;++i){
                    var value = array[i];
                    if(key=='sMoveArray'){
                        this.delWithMove(value.id);
                    }else if(key=='sAttackArray'){
                        this.delWithAttack(value.id);
                    }
                    this._dataArray.push({key:key,value:value});
                }
            }
        }.bind(this));
    },


    //停止战斗中网络
    offBattleEvent:function(){
        //pomelo.on('onData',undefined);
        pomelo.removeAllListeners('onData');
    },



    delWithMove:function (id) {
        for(var i=this._dataArray.length-1;i>=0;--i){
            var obj = this._dataArray[i];
            if(obj.value.id==id && (obj.key=='sMoveArray' || obj.key=='sAttackArray')){
                this._dataArray.splice(i,1);
            }
        }
    },

    delWithAttack:function (id) {
        for(var i=this._dataArray.length-1;i>=0;--i){
            var obj = this._dataArray[i];
            if(obj.value.id==id && obj.key=='sAttackArray'){
                this._dataArray.splice(i,1);
            }
        }
    },

    //缓存的数据，需要的时候调用。
    doWork:function(){
        for(var i=0;i<this._dataArray.length;++i){
            var obj = this._dataArray[i];
            if(obj.key=='sMoveArray'){
                var player =  ag.gameLayer._roleMap[obj.value.id];
                if(player && typeof obj.value.x=='number' && typeof obj.value.y=='number'){
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
            }else if(obj.key=='sItemBackArray'){
                var temp = ag.userInfo._itemMapBack[obj.value];
                if(temp){
                    ag.gameLayer.initItem(temp._data);
                }
            }else if(obj.key=='sItemDisappearArray'){
                ag.gameLayer.sItemDisappear(obj.value);
            }else if(obj.key=='sDeleteRoleArray'){
                ag.gameLayer.deleteRoleByServer(obj.value);
            }else if(obj.key=='sBagItemToEquipArray'){
                ag.gameLayer.initItem(obj.value);
                ag.gameLayer.addDirty(obj.value.owner);
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
            }else if(obj.key=='sSetWingArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player && player.getIsPlayer()) {
                    player.setWing(obj.value.wing);
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
            }else if(obj.key=='sComeArray'){
                var player =  ag.gameLayer.getRole(obj.value.id);
                if(player && player.getIsPlayer()) {
                    player._data.come = obj.value.come;
                    player._data.practice = obj.value.practice;
                    player._data.level = obj.value.level;
                    ag.gameLayer.addDirty(player._data.id);
                    player.addExp(obj.value.level,obj.value.exp);
                }
            }else if(obj.key=='treasureStringArray'){
                if(ag.gameLayer) {
                    ag.gameLayer.showTreasureString(obj.value);
                }
            }else if(obj.key=='sAuctionShopArray'){
                if(ag.gameLayer){
                    ag.gameLayer._auctionShop.refresh(JSON.parse(obj.value));
                }
            }else if(obj.key=='sAskTeamArray'){
                if(ag.gameLayer){
                    ag.gameLayer._teamAsk.show(ag.gameConst.askTeam,obj.value.id,obj.value.name);
                }
            }else if(obj.key=='sAskDealArray'){
                if(ag.gameLayer){
                    ag.gameLayer._teamAsk.show(ag.gameConst.askDeal,obj.value.id,obj.value.name);
                }
            }else if(obj.key=='guildMemberStringArray'){
                if(ag.gameLayer) {
                    ag.gameLayer._guildMember.guildMemberString(obj.value);
                }
            }else if(obj.key=='sRankArray'){
                if(ag.gameLayer) {
                    ag.gameLayer._rank.setData(obj.value);
                }
            }else if(obj.key=='sAddDealArray'){
                if(ag.gameLayer) {
                    ag.gameLayer._deal.show(obj.value);
                }
            }else if(obj.key=='sDelDealArray'){
                if(ag.gameLayer) {
                    ag.gameLayer._deal.close();
                }
            }else if(obj.key=='sDealAddItemArray'){
                if(ag.gameLayer) {
                    ag.gameLayer._deal.dealAddItem(obj.value);
                }
            }else if(obj.key=='sDealAddGoldArray'){
                if(ag.gameLayer) {
                    ag.gameLayer._deal.dealAddGold(obj.value);
                }
            }else if(obj.key=='sChangeSexArray'){
                var player =  ag.gameLayer.getRole(obj.value);
                if(player && player.getIsPlayer()) {
                    player._data.sex = player._data.sex==1?0:1;
                    if(player==ag.gameLayer._player){
                        ag.userInfo._accountData.sex = player._data.sex;
                    }
                }
            }else if(obj.key=='itemDelFromBagArray'){
                ag.gameLayer.delItemFormBag(obj.value);
                delete ag.userInfo._itemMap[obj.value];
                delete ag.userInfo._itemMapBack[obj.value];
            }
        }
        this._dataArray = [];
    },
};
