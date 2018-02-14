/**
 * Created by bot.su on 2017/6/21.
 * 处理游戏中的网路事件
 */


var cc = require("../../../game/util/cc");


module.exports = function(app) {
    return new Handler(app);
};

var Handler = cc.Class.extend({
    ctor:function (app) {
        this.app = app;
        this._secretKey = 'att135811';
    },


    getOnlinePlayer:function(msg, session, next) {
        var code = 1;
        var result = '';
        try{
            if(msg.secretKey==this._secretKey){
                var map = ag.gameLayer._roleMap;
                for(var key in map){
                    if(map[key].getIsPlayer() && ag.userManager.getOnline(key)){
                        result = result+map[key]._data.name+'\n';
                    }
                }
                code = 0;
            }
        }catch(e){}
        next(null, {code: code,result:result});
    },


    setOffline:function(msg, session, next) {
        var code = 1;
        try{
            if(msg.secretKey==this._secretKey){
                var role = ag.gameLayer.getRoleByName(msg.name);
                if(role){
                    ag.userManager.setOffline(role._data.id,msg.offline);
                    code = 0;
                }
            }
        }catch(e){}
        next(null, {code: code});
    },


    //系统通知
    systemNotify:function(msg, session, next){
        var code = 1;
        try{
            if(msg.secretKey==this._secretKey){
                ag.jsUtil.sendDataAll("sSystemNotify",msg.text);
                code = 0;
            }
        }catch(e){}
        next(null, {code: code});
    },

    //开始沙巴克
    shabake:function(msg, session, next){
        var code = 1;
        try{
            if(msg.secretKey==this._secretKey){
                var array = msg.duration.split('.');
                if(array.length==6){
                    var startTime = new Date(parseInt(array[0]),parseInt(array[1])-1,parseInt(array[2]),parseInt(array[3]),parseInt(array[4]),parseInt(array[5])).getTime();
                    var nowTime = new Date().getTime();
                    code = 0;

                    ag.shabake.start(startTime-nowTime,parseFloat(msg.duration2)*60*60*1000);
                }
            }
        }catch(e){}
        next(null, {code: code});
    },


    //加元宝
    addGold:function(msg, session, next){
        var role = ag.gameLayer.getRole(msg.rid);
        var code = 1;
        if(role){
            try{
                if(msg.secretKey==this._secretKey){
                    role.addGold(msg.gold);
                    code = 0;
                }
            }catch(e){}
        }
        next(null, {
            code: code,
        });
    },

    //买装备
    itemBuy:function(msg, session, next){
        var role = ag.gameLayer.getRole(msg.rid);
        var code = 1;
        if(role){
            try{
                if(msg.secretKey==this._secretKey){
                    code = ag.itemManager.itemBuy(msg.rid,msg.iid)?0:1;
                }
            }catch(e){}
        }
        next(null, {
            code: code,
        });
    },

    theCountryIsAtPeace:function(msg, session, next){
        try{
            if(msg.secretKey==this._secretKey){
                ag.gameLayer.theCountryIsAtPeace(47);
            }
        }catch(e){}
        next();
    },



    //注册
    register:function(msg, session, next) {
        if(ag.userManager.existAccount(msg.account)==false){
            try{
                //写进数据库
                var timeCounter = ''+new Date().getTime();
                ag.userManager.add(msg.account,msg.password,msg.account,timeCounter);
                ag.db.createAccount(msg.account,msg.password,msg.account,timeCounter,timeCounter);
            }catch(e){}
            next(null, {code: 0});
        }else{
            next(null, {code: 1});
        }
    },

    //修改密码
    alterPassWord:function(msg, session, next) {
        if(msg.account && msg.password && msg.passwordNew && ag.userManager.isRightAccountAndPassword(msg.account,msg.password)){
            try{
                ag.userManager.alterPassWord(msg.account,msg.passwordNew);
            }catch(e){}
            next(null, {code: 0});
        }else{
            next(null, {code: 1});
        }
    },


    //进入游戏,0正确,1Id为空,2ID已经存在
    login:function(msg, session, next) {
        if(msg.account && msg.password && ag.userManager.isRightAccountAndPassword(msg.account,msg.password)
            && ag.userManager.getOffline(msg.account)==false){
            try{
                var oldUid = ag.userManager.getUidByAccount(msg.account);
                if(oldUid){
                    //解除绑定
                    ag.userManager.unbindUid(oldUid);
                    ag.jsUtil.sendByUids('sOtherLogin','此账号已在其他地方登陆，您被迫下线！',[oldUid]);
                }

                //绑定账号和uid
                ag.userManager.bindUid(session.uid,msg.account);
                var data = ag.userManager.add(msg.account);
                var player =  ag.gameLayer.getRole(msg.account);
                if(player){
                    data.type = player._data.type;
                    data.sex = player._data.sex;
                }

                //写进数据库
                var timeCounter = ''+new Date().getTime();
                ag.db.setAccountLastTime(msg.account,timeCounter);
            }catch(e){}
            next(null, {code: 0,data: data});
        }else{
            next(null, {code: 1});
        }
    },


    //进入游戏,0正确,1Id为空,2ID已经存在
    ykLogin:function(msg, session, next) {
        next(null, {code:1});
    },


    //0正常,1id不存在,2名字重复
    changeName:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var code = ag.userManager.changeName(id,msg);
        next(null, {
            code: code
        });
    },


    //进入游戏,0正确,1Id为空
    getGameList:function(msg, session, next) {
        next(null, {
            code: 0,
            data: ag.gameListManager.get()
        });
    },


    //删除角色,0正常，1不存在角色
    deleteRole:function(msg, session, next) {
        var code = 0;
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            ag.gameLayer.deleteRole(id);
            ag.db.setItems();//道具保存
            ag.auctionShop.deleteInvalid();//拍卖行的无效数据
        }catch(e){}
        next(null, {
            code: code
        });
    },


    chatYou : function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player && player._data.level>=47 && typeof msg.str=='string' && ag.userManager.getOffline(id)==false){
                var str = null;
                var index = msg.str.indexOf(' ');
                var bPrivate = false;
                if(msg.str[0]=='@' && index>0){
                    var lockedRole = ag.gameLayer.getRoleByName(msg.str.substr(1,index-1));
                    if(lockedRole){
                        str = '('+lockedRole._data.name+')'+msg.str.substr(index+1);
                        bPrivate = true;
                        ag.jsUtil.sendData("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str},id);
                        ag.jsUtil.sendData("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str},lockedRole._data.id);
                    }else{
                        ag.jsUtil.sendData("sSystemNotify","目标不存在！",id);
                    }
                }else if(msg.chatType==ag.gameConst.chatAll){
                    str = '(世界)'+msg.str;
                }else if(msg.chatType==ag.gameConst.chatMap){
                    str = '(当前)'+msg.str;
                }else if(msg.chatType==ag.gameConst.chatGuild){
                    str = '(行会)'+msg.str;
                }
                if(bPrivate){
                    //...
                }else if(str){
                    ag.db.insertChat(id,str,''+new Date().getTime());
                    if(msg.chatType==ag.gameConst.chatAll){
                        ag.jsUtil.sendDataAll("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str});
                    }else if(msg.chatType==ag.gameConst.chatMap){
                        ag.jsUtil.sendDataAll("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str},player._data.mapId);
                    }else if(msg.chatType==ag.gameConst.chatGuild){
                        for(var key in ag.gameLayer._roleMap){
                            var temp = ag.gameLayer._roleMap[key];
                            if(temp.getIsPlayer()){
                                if(temp._data.camp!=ag.gameConst.campPlayerNone && temp._data.camp==player._data.camp){
                                    ag.jsUtil.sendData("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str},temp._data.id);
                                }
                            }
                        }
                    }
                }
            }else{
                ag.jsUtil.sendData("sSystemNotify","等级不足47，或者处于禁言状态！",id);
            }
        }catch(e){}
        next();
    },


    //更换新地图
    changeMap:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                player.changeMap(msg);
            }
        }catch(e){}
        next();
    },


    //进入游戏
    enter:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            ag.userManager.setOnline(id,true);
            var role = ag.gameLayer.getRole(id);
            var exist = !!role;
            ag.gameLayer.addPlayer(id,undefined,undefined,undefined,msg.type,undefined,msg.sex);
            if(!exist){
                role = ag.gameLayer.getRole(id);
                var data = role._data;
                ag.db.insertRole(data.id,data.mapId,data.x,data.y,data.type,data.camp,data.sex,data.direction,data.level,role._exp,data.gold,data.office,data.wing,data.come,data.practice);
            }

            //记录玩家进入游戏时间
            role._startGameTime = ag.gameLayer._gameTime;
        }catch(e){}
        next();
    },


    verifyTime:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role = ag.gameLayer.getRole(id);
            if(role && typeof msg=='number'){
                if(ag.gameLayer._gameTime-role._startGameTime+20<msg){
                    ag.jsUtil.sendData("sAlert","请勿使用作弊软件！",role._data.id);
                }
            }
        }catch(e){}
        next();
    },


    //移动
    move:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                player.move({x:msg.x,y:msg.y});
            }
        }catch(e){}
        next();
    },


    //攻击
    attack:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var attacker =  ag.gameLayer.getRole(id);
            var locked =  ag.gameLayer.getRole(msg.id);
            if(attacker && locked){
                attacker.attack(locked);
            }
        }catch(e){}
        next();
    },



    //复活请求
    relife:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                player.relife();
            }
        }catch(e){}
        next();
    },


    bagItemToGround:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            ag.itemManager.bagItemToGround(msg,id);
        }catch(e){}
        next();
    },



    bagItemToEquip:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            ag.itemManager.bagItemToEquip(msg.id,msg.puton,id);
        }catch(e){}
        next();
    },


    equipItemToBag:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            ag.itemManager.equipItemToBag(msg,id);
        }catch(e){}
        next();
    },


    bagItemRecycle:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            ag.itemManager.bagItemRecycle(msg.split(','),id);
        }catch(e){}
        next();
    },


    //更换阵营
    camp:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                player.changeCamp(msg);
            }
        }catch(e){}
        next();
    },


    //创建行会
    guildCreate:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                if(player._data.gold>=100){
                    player.addGold(-100);
                    ag.guild.addGuild(msg.name,player._data.id);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","元宝不足100!",player._data.id);
                }
            }
        }catch(e){}
        next();
    },


    //删除行会
    guildDelete:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                ag.guild.guildDelete(player._data.id);
                player._data.camp = ag.gameConst.campPlayerNone;
            }
        }catch(e){}
        next();
    },


    //邀请成员
    guildInvite:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                var rid = '-1';
                for(var key in ag.gameLayer._roleMap){
                    if(ag.gameLayer._roleMap[key].getIsPlayer()) {
                        if (ag.gameLayer._roleMap[key]._data.name == msg.name) {
                            rid = ag.gameLayer._roleMap[key]._data.id;
                            break;
                        }
                    }
                }
                if(rid!='-1'){
                    ag.guild.guildInvite(player._data.id,rid);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","邀请人不存在！",player._data.id);
                }
            }
        }catch(e){}
        next();
    },


    //同意邀请
    guildOK:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                var laoda = ag.guild._inviteMap[id];
                if(laoda){
                    delete ag.guild._inviteMap[id];
                    var obj = ag.guild._dataMap[laoda];
                    if(obj && laoda!=id && obj.member.indexOf(id)==-1){
                        obj.member.push(id);
                        ag.jsUtil.sendData("sSystemNotify","您已经加入["+obj.name+"]！",id);
                        ag.jsUtil.sendData("sSystemNotify","玩家"+player._data.name+"加入行会["+obj.name+"]！",laoda);
                        var str = obj.member.length==0?'':obj.member.join(',');
                        ag.jsUtil.sendDataAll("sGuildCreate",{result:0,id:laoda,name:obj.name,member:str});
                        player._data.camp = obj.identify;
                        ag.db.guildSaveMember(laoda,obj.member);
                    }else{
                        ag.jsUtil.sendData("sSystemNotify","同意邀请发生了未知错误！",id);
                    }
                }
            }
        }catch(e){}
        next();
    },


    //不同意邀请
    guildCancel:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                var id = ag.guild._inviteMap[id];
                if(id){
                    delete ag.guild._inviteMap[id];
                    ag.jsUtil.sendData("sSystemNotify","取消成功！",id);
                    ag.jsUtil.sendData("sSystemNotify","玩家"+player._data.name+"拒绝加入行会邀请！",id);
                }
            }
        }catch(e){}
        next();
    },


    //踢出成员
    guildKick:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player){
                var rid = '-1';
                for(var key in ag.gameLayer._roleMap){
                    if(ag.gameLayer._roleMap[key].getIsPlayer()) {
                        if (ag.gameLayer._roleMap[key]._data.name == msg.name) {
                            rid = ag.gameLayer._roleMap[key]._data.id;
                            break;
                        }
                    }
                }
                if(rid!='-1'){
                    var obj = ag.guild._dataMap[id];
                    var index = obj.member.indexOf(rid);
                    if(index!=-1){
                        obj.member.splice(index,1);
                        var str = obj.member.length==0?'':obj.member.join(',');
                        ag.jsUtil.sendDataAll("sGuildCreate",{result:0,id:obj.id,name:obj.name,member:str});
                        ag.jsUtil.sendData("sSystemNotify","踢出成功！",id);
                        ag.jsUtil.sendData("sSystemNotify","您被踢出行会！",rid);
                        ag.gameLayer.getRole(rid)._data.camp = ag.gameConst.campPlayerNone;
                        ag.db.guildSaveMember(id,obj.member);
                    }else{
                        ag.jsUtil.sendData("sSystemNotify","被踢人不在本行会！",id);
                    }
                }else{
                    ag.jsUtil.sendData("sSystemNotify","被踢人不存在！",id);
                }
            }
        }catch(e){}
        next();
    },


    //成员退出
    guildExit:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player) {
                for (var key in ag.guild._dataMap) {
                    var obj = ag.guild._dataMap[key];
                    var index = obj.member.indexOf(id);
                    if (index != -1) {
                        obj.member.splice(index, 1);
                        var str = obj.member.length == 0 ? '' : obj.member.join(',');
                        ag.jsUtil.sendDataAll("sGuildCreate", {result: 0, id: obj.id, name: obj.name, member: str});
                        ag.jsUtil.sendData("sSystemNotify", "退出行会成功！", id);
                        player._data.camp = ag.gameConst.campPlayerNone;
                        ag.db.guildSaveMember(key,obj.member);
                        break;
                    }
                }
            }
        }catch(e){}
        next();
    },


    //寻宝一次
    treasure:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player) {
                if(player._data.gold>=200){
                    player.addGold(-200);
                    ag.itemManager.treasure(player);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","元宝不足200!",player._data.id);
                }
            }
        }catch(e){}
        next();
    },


    //寻宝5次
    treasure5:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player) {
                if(player._data.gold>=1000){
                    player.addGold(-1000);
                    ag.itemManager.treasure5(player);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","元宝不足1000!",player._data.id);
                }
            }
        }catch(e){}
        next();
    },



    //增加到仓库
    itemBagToWharehouse:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            var item = ag.itemManager._itemMap.get(msg);
            if(player && item && item._data.owner==id) {
                item._data.puton = ag.gameConst.putonWharehouse;
                --player._bagLength;
                ++player._wharehoseLength;
            }
        }catch(e){}
        next();
    },



    //道具仓库到背包
    itemWharehouseToBag:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            var item = ag.itemManager._itemMap.get(msg);
            if(player && item && item._data.owner==id) {
                item._data.puton = ag.gameConst.putonBag;
                ++player._bagLength;
                --player._wharehoseLength;
            }
        }catch(e){}
        next();
    },



    //更改攻击模式
    setAttackMode:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var player =  ag.gameLayer.getRole(id);
            if(player && typeof msg.no=='number' && msg.no>=ag.gameConst.attackModeAll && msg.no<=ag.gameConst.attackModeTeam) {
                player._data.attackMode = msg.no;
                ag.jsUtil.sendData("sSystemNotify","已经改为"+ag.gameConst.attackModeTextArray[msg.no]+"模式！",id);
            }
        }catch(e){}
        next();
    },




    //增加修为,0正常1等级不到50,2经验换取超过3次，3,到达上线，4未知错误
    come:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var role =  ag.gameLayer.getRole(id);
        if(role){
            if(msg=='exp'){
                if(!ag.db._customData.come[id])ag.db._customData.come[id] = 0;
                if(role._data.level<51){
                    next(null, {code: 1});
                    return;
                }
                if(ag.db._customData.come[id]>=3){
                    next(null, {code: 2});
                    return;
                }
                if(role._data.come>=ag.gameConst.comeArray.length){
                    next(null, {code: 3});
                    return;
                }


                try{
                    ++ag.db._customData.come[id];
                    role._data.practice += 10;
                    if(role._data.practice>=ag.gameConst.comeArray[role._data.come]){
                        role._data.practice -= ag.gameConst.comeArray[role._data.come];
                        ++role._data.come;
                    }
                    role._exp -= 40000;
                    if(role._exp<0){
                        role._data.level -= 1;
                        role._exp += role.getTotalExpFromDataBase(role._data.level);
                    }
                    role.resetAllProp(role._exp);
                    ag.jsUtil.sendDataAll("sCome",{id:role._data.id,come:role._data.come,practice:role._data.practice,level:role._data.level,exp:role._exp},role._data.mapId);
                }catch(e){}
                next(null, {code: 0});
                return;
            }
        }
        next(null, {code: 4});
    },


    //增加修为,0正常,1换取超过1次，2,到达上线，3未知错误
    daily:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                var price = ag.gameConst.dailyPriceArray[msg.index];
                if(!ag.db._customData.wing[id])ag.db._customData.wing[id] = 0;
                if(ag.db._customData.wing[id]>=1){
                    ag.jsUtil.sendData("sSystemNotify","每天只能领取一次！",id);
                }else if(role.getWingIndex()>=ag.gameConst.wingProgress.length){
                    ag.jsUtil.sendData("sSystemNotify","已经到达上线！",id);
                }else if(role._data.gold>=price){
                    role.addGold(-price);
                    if(msg.index==ag.gameConst.dailyWing){
                        ++ag.db._customData.wing[id];
                        role._data.wing += 10;
                        ag.jsUtil.sendDataAll("sSetWing",{id:role._data.id,wing:role._data.wing},role._data.mapId);
                    }else if(msg.index==ag.gameConst.dailyWingWithGold){
                        ++ag.db._customData.wing[id];
                        role._data.wing += 20;
                        ag.jsUtil.sendDataAll("sSetWing",{id:role._data.id,wing:role._data.wing},role._data.mapId);
                    }
                    role.resetAllProp(role._exp);
                    ag.jsUtil.sendData("sSystemNotify","领取成功！",id);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","您的元宝不足1000！",id);
                }
            }
        }catch(e){}
        next();
    },



    //请求寻宝记录
    requestTreasureString:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.itemManager.sendTreasureString(id);
            }
        }catch(e){}
        next();
    },


    //商店记录
    shopBuy:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role && msg.index>=0 && msg.index<=2){
                var price = ag.gameConst.shopPriceArray[msg.index];
                if(role._data.gold>=price){
                    role.addGold(-price);

                    if(msg.index==ag.gameConst.shopOffice){
                        role.addOffice(10);
                    }else if(msg.index==ag.gameConst.shopCome){
                        role._data.practice += 10;
                        if(role._data.practice>=ag.gameConst.comeArray[role._data.come]){
                            role._data.practice -= ag.gameConst.comeArray[role._data.come];
                            ++role._data.come;
                        }
                        ag.jsUtil.sendDataAll("sCome",{id:role._data.id,come:role._data.come,practice:role._data.practice,level:role._data.level,exp:role._exp},role._data.mapId);
                    }else if(msg.index==ag.gameConst.shopWing){
                        role._data.wing += 10;
                        ag.jsUtil.sendDataAll("sSetWing",{id:role._data.id,wing:role._data.wing},role._data.mapId);
                    }
                    role.resetAllProp(role._exp);
                    ag.jsUtil.sendData("sSystemNotify","购买成功！",id);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","您的元宝不足1000！",id);
                }
            }
        }catch(e){}
        next();
    },




    //请求拍卖行
    requestauctionShop:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.auctionShop.sendData(id);
            }
        }catch(e){}
        next();
    },


    sellToAuctionShop:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.auctionShop.sellToAuctionShop(msg.id,id,msg.price);
            }
        }catch(e){}
        next();
    },

    buyAuctionShop:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.auctionShop.buyAuctionShop(msg.id,id);
            }
        }catch(e){}
        next();
    },



    askTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.team.askTeam(id,msg.id);
            }
        }catch(e){}
        next();
    },



    addTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.team.addTeam(msg.id,id);
            }
        }catch(e){}
        next();
    },



    exitTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.team.exitTeam(id);
            }
        }catch(e){}
        next();
    },


    seeTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role){
                ag.team.seeTeam(id);
            }
        }catch(e){}
        next();
    },

    cardBuy:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            var role =  ag.gameLayer.getRole(id);
            if(role && typeof msg.psw=='string' && msg.psw.length==12){
                ag.db.cardBuy(id,msg.psw);
            }
        }catch(e){}
        next();
    },


});
