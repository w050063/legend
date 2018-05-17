/**
 * Created by bot.su on 2017/6/21.
 * 处理游戏中的网路事件
 */


var cc = require("../../../game/util/cc");
var pomelo = require('pomelo');


module.exports = function(app) {
    return new Handler(app);
};

var Handler = cc.Class.extend({
    ctor:function (app) {
        this.app = app;
        this._secretKey = 'att135811';
    },


    isNum:function(x){
        var re = /^\d+$/;
        return typeof x=="number" && !isNaN(x) && re.test(x);
    },


    getOnlinePlayer:function(msg, session, next) {
        var code = 1;
        var result = '';
        try{
            if(msg.secretKey==this._secretKey){
                result = result+"沙城主:\n";
                var role = ag.gameLayer._roleMap[ag.shabake._guildWinId];
                if(role){
                    result = result+role._data.id+','+role._data.name+'\n';
                }
                result = result+"外挂:\n";
                for(var key in ag.userManager._waiguaArray){
                    result = result+key+','+ag.userManager._waiguaArray[key].name+','+ag.userManager._waiguaArray[key].count+'\n';
                }
                result = result+"玩家:\n";
                var map = ag.gameLayer._roleMap;
                for(var key in map){
                    if(map[key].getIsPlayer() && ag.userManager.getOnline(key)){
                        result = result+map[key]._data.id+','+map[key]._data.name+'\n';
                    }
                }
                result = result+"\n"+ag.db._errorMsg;
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
                if(msg.secretKey==this._secretKey && typeof msg.gold=="number" && !isNaN(msg.gold)){
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


    //查找密码
    findPwd:function(msg, session, next){
        var code = 1;
        var pwd = '';
        try{
            if(msg.secretKey==this._secretKey && ag.userManager._infoMap[msg.rid]){
                pwd = ag.userManager._infoMap[msg.rid].password;
                code = 0;
            }
        }catch(e){}
        next(null, {
            code: code,
            pwd:pwd
        });
    },

    theCountryIsAtPeace:function(msg, session, next){
        try{
            if(msg.secretKey==this._secretKey){
                ag.gameLayer.theCountryIsAtPeace(48);
            }
        }catch(e){}
        next();
    },



    //注册
    register:function(msg, session, next) {
        var code = 1;
        try{
            if(msg.account && ag.userManager.existAccount(msg.account)==false){
                var rid = parseInt(msg.account.split('_')[0]);
                if(rid && rid>=ag.gameLayer._legendID && rid<=ag.gameLayer._legendIDMax){
                    //写进数据库
                    var timeCounter = ''+new Date().getTime();
                    var index = msg.account.indexOf('_');
                    ag.userManager.add(msg.account,msg.password,msg.account.substr(index+1),timeCounter);
                    ag.db.createAccount(msg.account,msg.password,msg.account,timeCounter,timeCounter);
                    code = 0;
                }
            }
        }catch(e){}
        next(null, {code: code});
    },

    //修改密码
    alterPassWord:function(msg, session, next) {
        var code = 1;
        try{
            if(msg.account && msg.password
                && msg.passwordNew && ag.userManager.isRightAccountAndPassword(msg.account,msg.password)){
                ag.userManager.alterPassWord(msg.account, msg.passwordNew);
                code = 0;
            }
        }catch(e){}
        next(null, {code: code});
    },


    //进入游戏,0正确,1Id为空,2ID已经存在
    login:function(msg, session, next) {
        var retObj = {code: 1};
        try{
            if(ag.db._bFirstReadOver && msg.account
                && msg.password && ag.userManager.isRightAccountAndPassword(msg.account,msg.password)
                && ag.userManager.getOffline(msg.account)==false){

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
                retObj = {code: 0,data: data};
            }
        }catch(e){}
        next(null, retObj);
    },


    //进入游戏,0正确,1Id为空,2ID已经存在
    ykLogin:function(msg, session, next) {
        next(null, {code:1});
    },


    //0正常,1id不存在,2名字重复
    changeName:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var code = 1;
        if(ag.db._bFirstReadOver && id){
            code = ag.userManager.changeName(id,msg);
        }
        next(null, {
            code: code
        });
    },

    //0正常,1id不存在,2名字重复
    changeNameByGold:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var code = 1;
        if(ag.db._bFirstReadOver && id){
            code = ag.userManager.changeNameByGold(id,msg);
        }
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
            if(0){//临时禁用删除角色功能
                var id = ag.userManager.getAccountByUid(session.uid);
                if(ag.db._bFirstReadOver && id){
                    ag.gameLayer.deleteRole(id);
                }
            }
        }catch(e){}
        next(null, {
            code: code
        });
    },


    chatYou : function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id){
                var player =  ag.gameLayer.getRole(id);
                if(player && player._data.level>=47 && typeof msg.str=='string' && ag.userManager.getOffline(id)==false){
                    var bSay = true;
                    if(msg.chatType==ag.gameConst.chatAll){
                        if (player._data.gold >= 10) {
                            player.addGold(-10);
                        } else {
                            ag.jsUtil.sendData("sSystemNotify", "56%1!", player._data.id);
                            bSay = false;
                        }
                    }


                    if (bSay) {
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
                                ag.jsUtil.sendData("sSystemNotify","57",id);
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
                    }
                }else{
                    ag.jsUtil.sendData("sSystemNotify","58",id);
                }
            }
        }catch(e){}
        next();
    },


    //更换新地图
    changeMap:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id){
                var player =  ag.gameLayer.getRole(id);
                if(player){
                    player.changeMap(msg);
                }
            }
        }catch(e){}
        next();
    },


    //进入游戏
    enter:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(ag.db._bFirstReadOver && id){
                ag.userManager.setOnline(id,true);
                var role = ag.gameLayer.getRole(id);
                var exist = !!role;
                ag.gameLayer.addPlayer(id,undefined,undefined,undefined,msg.type,undefined,msg.sex);
                if(!exist){
                    role = ag.gameLayer.getRole(id);
                    var data = role._data;
                    ag.db.insertRole(data.id,data.mapId,data.x,data.y,data.type,data.camp,data.sex,data.direction,data.level,role._exp
                        ,data.gold,data.office,data.wing,data.come,data.practice,data.spirit);
                }

                //记录玩家进入游戏时间
                role._startGameTime = ag.gameLayer._gameTime;
            }
        }catch(e){}
        next();
    },


    verifyTime:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id){
                var role = ag.gameLayer.getRole(id);
                if(role && typeof msg=='number'){
                    if(ag.gameLayer._gameTime-role._startGameTime+15<msg){
                        if(ag.userManager._waiguaArray[id]){
                            ++ag.userManager._waiguaArray[id]["count"];
                        }else{
                            ag.userManager._waiguaArray[id] = {name:role._data.name,count:1};
                        }
                        this.app.rpc.conn.ConnRemote.kick(session, session.uid,'', function(){});
                    }
                }else{
                }
            }
        }catch(e){}
        next();
    },


    //移动
    move:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id && this.isNum(msg.x) && this.isNum(msg.y)){
                var player =  ag.gameLayer.getRole(id);
                if(player){
                    player.move({x:msg.x,y:msg.y});
                }
            }
        }catch(e){}
        next();
    },


    //攻击
    attack:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id){
                var attacker =  ag.gameLayer.getRole(id);
                var locked =  ag.gameLayer.getRole(msg.id);
                if(attacker && locked){
                    attacker.attack(locked);
                }
            }
        }catch(e){}
        next();
    },



    //复活请求
    relife:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id){
                var player =  ag.gameLayer.getRole(id);
                if(player){
                    player.relife();
                }
            }
        }catch(e){}
        next();
    },


    bagItemToGround:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                ag.itemManager.bagItemToGround(msg, id);
            }
        }catch(e){}
        next();
    },



    bagItemToEquip:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id && this.isNum(msg.puton)) {
                ag.itemManager.bagItemToEquip(msg.id, msg.puton, id);
            }
        }catch(e){}
        next();
    },


    equipItemToBag:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                ag.itemManager.equipItemToBag(msg, id);
            }
        }catch(e){}
        next();
    },


    bagItemRecycle:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                ag.itemManager.bagItemRecycle(msg.split(','), id);
            }
        }catch(e){}
        next();
    },


    //更换阵营
    camp:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    player.changeCamp(msg);
                }
            }
        }catch(e){}
        next();
    },


    //创建行会
    guildCreate:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    ag.guild.addGuild(msg.name, player._data.id);
                }
            }
        }catch(e){}
        next();
    },


    //删除行会
    guildDelete:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    ag.guild.guildDelete(player._data.id);
                    player._data.camp = ag.gameConst.campPlayerNone;
                }
            }
        }catch(e){}
        next();
    },


    //邀请成员
    guildInvite:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    var rid = '-1';
                    for (var key in ag.gameLayer._roleMap) {
                        if (ag.gameLayer._roleMap[key].getIsPlayer()) {
                            if (ag.gameLayer._roleMap[key]._data.name == msg.name) {
                                rid = ag.gameLayer._roleMap[key]._data.id;
                                break;
                            }
                        }
                    }
                    if (rid != '-1') {
                        ag.guild.guildInvite(player._data.id, rid);
                    } else {
                        ag.jsUtil.sendData("sSystemNotify", "59", player._data.id);
                    }
                }
            }
        }catch(e){}
        next();
    },


    //同意邀请
    guildOK:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    var laoda = ag.guild._inviteMap[id];
                    if (laoda) {
                        delete ag.guild._inviteMap[id];
                        var obj = ag.guild._dataMap[laoda];
                        if (obj && laoda != id && obj.member.indexOf(id) == -1) {
                            obj.member.push(id);
                            ag.jsUtil.sendData("sSystemNotify", "60%" + obj.name + "]！", id);
                            ag.jsUtil.sendData("sSystemNotify", "61%" + player._data.name + "%62%" + obj.name + "]！", laoda);
                            var str = obj.member.length == 0 ? '' : obj.member.join(',');
                            ag.jsUtil.sendDataAll("sGuildCreate", {result: 0, id: laoda, name: obj.name, member: str});
                            player._data.camp = obj.identify;
                            ag.db.guildSaveMember(laoda, obj.member);
                        } else {
                            ag.jsUtil.sendData("sSystemNotify", "63", id);
                        }
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
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    var id = ag.guild._inviteMap[id];
                    if (id) {
                        delete ag.guild._inviteMap[id];
                        ag.jsUtil.sendData("sSystemNotify", "64", id);
                        ag.jsUtil.sendData("sSystemNotify", "61%" + player._data.name + "%65", id);
                    }
                }
            }
        }catch(e){}
        next();
    },


    //踢出成员
    guildKick:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    var rid = '-1';
                    for (var key in ag.gameLayer._roleMap) {
                        if (ag.gameLayer._roleMap[key].getIsPlayer()) {
                            if (ag.gameLayer._roleMap[key]._data.name == msg.name) {
                                rid = ag.gameLayer._roleMap[key]._data.id;
                                break;
                            }
                        }
                    }
                    if (rid != '-1') {
                        var obj = ag.guild._dataMap[id];
                        var index = obj.member.indexOf(rid);
                        if (index != -1) {
                            obj.member.splice(index, 1);
                            var str = obj.member.length == 0 ? '' : obj.member.join(',');
                            ag.jsUtil.sendDataAll("sGuildCreate", {result: 0, id: obj.id, name: obj.name, member: str});
                            ag.jsUtil.sendData("sSystemNotify", "66", id);
                            ag.jsUtil.sendData("sSystemNotify", "67", rid);
                            ag.gameLayer.getRole(rid)._data.camp = ag.gameConst.campPlayerNone;
                            ag.db.guildSaveMember(id, obj.member);
                        } else {
                            ag.jsUtil.sendData("sSystemNotify", "68", id);
                        }
                    } else {
                        ag.jsUtil.sendData("sSystemNotify", "69", id);
                    }
                }
            }
        }catch(e){}
        next();
    },


    //成员退出
    guildExit:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    for (var key in ag.guild._dataMap) {
                        var obj = ag.guild._dataMap[key];
                        var index = obj.member.indexOf(id);
                        if (index != -1) {
                            obj.member.splice(index, 1);
                            var str = obj.member.length == 0 ? '' : obj.member.join(',');
                            ag.jsUtil.sendDataAll("sGuildCreate", {result: 0, id: obj.id, name: obj.name, member: str});
                            ag.jsUtil.sendData("sSystemNotify", "70", id);
                            player._data.camp = ag.gameConst.campPlayerNone;
                            ag.db.guildSaveMember(key, obj.member);
                            break;
                        }
                    }
                }
            }
        }catch(e){}
        next();
    },


    //请求行会成员
    requestGuildMemberString:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.guild.requestGuildMemberString(id);
                }
            }
        }catch(e){}
        next();
    },


    //寻宝一次
    treasure:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    if (player._data.gold >= 200) {
                        player.addGold(-200);
                        ag.itemManager.treasure(player);
                    } else {
                        ag.jsUtil.sendData("sSystemNotify", "56%200!", player._data.id);
                    }
                }
            }
        }catch(e){}
        next();
    },


    //寻宝5次
    treasure5:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                if (player) {
                    if (player._data.gold >= 1000) {
                        player.addGold(-1000);
                        ag.itemManager.treasure5(player);
                    } else {
                        ag.jsUtil.sendData("sSystemNotify", "56%1000!", player._data.id);
                    }
                }
            }
        }catch(e){}
        next();
    },



    //增加到仓库
    itemBagToWharehouse:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                var item = ag.itemManager._itemMap.get(msg);
                if (player && item && item._data.owner == id) {
                    item._data.puton = ag.gameConst.putonWharehouse;
                    --player._bagLength;
                    ++player._wharehoseLength;
                }
            }
        }catch(e){}
        next();
    },



    //道具仓库到背包
    itemWharehouseToBag:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var player = ag.gameLayer.getRole(id);
                var item = ag.itemManager._itemMap.get(msg);
                if (player && item && item._data.owner == id) {
                    item._data.puton = ag.gameConst.putonBag;
                    ++player._bagLength;
                    --player._wharehoseLength;
                }
            }
        }catch(e){}
        next();
    },



    //更改攻击模式
    setAttackMode:function (msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id && this.isNum(msg.no)) {
                var player = ag.gameLayer.getRole(id);
                if (player && msg.no >= ag.gameConst.attackModeAll && msg.no <= ag.gameConst.attackModeTeam) {
                    player._data.attackMode = msg.no;
                    ag.jsUtil.sendData("sSystemNotify", "71%" + ag.gameConst.attackModeTextArray[msg.no] + "%72", id);
                }
            }
        }catch(e){}
        next();
    },




    //增加修为,0正常1等级不到50,2经验换取超过3次，3,到达上线，4未知错误
    come:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        if(id) {
            var role = ag.gameLayer.getRole(id);
            if (role) {
                if (msg == 'exp') {
                    if (!ag.db._customData.come[id])ag.db._customData.come[id] = 0;
                    if (role._data.level < 51) {
                        next(null, {code: 1});
                        return;
                    }
                    if (ag.db._customData.come[id] >= 3) {
                        next(null, {code: 2});
                        return;
                    }
                    if (role._data.come >= ag.gameConst.comeArray.length) {
                        next(null, {code: 3});
                        return;
                    }


                    try {
                        var rate = 1;
                        if(role._data.level>=65)rate = 4;
                        else if(role._data.level>=60)rate = 3;
                        else if(role._data.level>=55)rate = 2;

                        ++ag.db._customData.come[id];
                        role._data.practice += 10*rate;
                        while(role._data.practice >= ag.gameConst.comeArray[role._data.come]) {
                            role._data.practice -= ag.gameConst.comeArray[role._data.come];
                            ++role._data.come;
                        }
                        role._exp -= 40000*rate;
                        while(role._exp < 0) {
                            role._data.level -= 1;
                            role._exp += role.getTotalExpFromDataBase(role._data.level);
                        }
                        ag.gameLayer.addDirty(role._data.id);
                        ag.jsUtil.sendDataAll("sCome", {
                            id: role._data.id,
                            come: role._data.come,
                            practice: role._data.practice,
                            level: role._data.level,
                            exp: role._exp
                        }, role._data.mapId);
                    } catch (e) {
                    }
                    next(null, {code: 0});
                    return;
                }
            }
        }
        next(null, {code: 4});
    },



    //增加修为,0正常1等级不到50,2经验换取超过3次，3,到达上线，4未知错误
    spirit:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        if(id) {
            var role = ag.gameLayer.getRole(id);
            if (role) {
                if (msg == 'exp') {
                    if (!ag.db._customData.spirit[id])ag.db._customData.spirit[id] = 0;
                    if (role._data.level < 50) {
                        next(null, {code: 1});
                        return;
                    }
                    if (ag.db._customData.spirit[id] >= 3) {
                        next(null, {code: 2});
                        return;
                    }


                    try {
                        var rate = 1;
                        if(role._data.level>=65)rate = 4;
                        else if(role._data.level>=60)rate = 3;
                        else if(role._data.level>=55)rate = 2;

                        ++ag.db._customData.spirit[id];
                        role._data.spirit += 10*rate;
                        role._exp -= 40000*rate;
                        while(role._exp < 0) {
                            role._data.level -= 1;
                            role._exp += role.getTotalExpFromDataBase(role._data.level);
                        }
                        ag.gameLayer.addDirty(role._data.id);
                        ag.jsUtil.sendDataAll("sSpirit", {
                            id: role._data.id,
                            spirit: role._data.spirit,
                            level: role._data.level,
                            exp: role._exp
                        }, role._data.mapId);
                    } catch (e) {
                    }
                    next(null, {code: 0});
                    return;
                }
            }
        }
        next(null, {code: 4});
    },


    //增加修为,0正常,1换取超过1次，2,到达上线，3未知错误
    daily:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id && this.isNum(msg.index) && msg.index>=0 && msg.index<ag.gameConst.dailyPriceArray.length) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    var price = ag.gameConst.dailyPriceArray[msg.index];
                    if (!ag.db._customData.wing[id])ag.db._customData.wing[id] = 0;
                    if (ag.db._customData.wing[id] >= 1) {
                        ag.jsUtil.sendData("sSystemNotify", "73", id);
                    } else if (role.getWingIndex() >= ag.gameConst.wingProgress.length) {
                        ag.jsUtil.sendData("sSystemNotify", "74", id);
                    } else if (role._data.gold >= price) {
                        role.addGold(-price);
                        if (msg.index == ag.gameConst.dailyWing) {
                            ++ag.db._customData.wing[id];
                            role._data.wing += 10;
                            ag.jsUtil.sendDataAll("sSetWing", {
                                id: role._data.id,
                                wing: role._data.wing
                            }, role._data.mapId);
                        } else if (msg.index == ag.gameConst.dailyWingWithGold) {
                            ++ag.db._customData.wing[id];
                            role._data.wing += 20;
                            ag.jsUtil.sendDataAll("sSetWing", {
                                id: role._data.id,
                                wing: role._data.wing
                            }, role._data.mapId);
                        }
                        ag.gameLayer.addDirty(role._data.id);
                        ag.jsUtil.sendData("sSystemNotify", "75", id);
                    } else {
                        ag.jsUtil.sendData("sSystemNotify", "56%1000！", id);
                    }
                }
            }
        }catch(e){}
        next();
    },



    //请求寻宝记录
    requestTreasureString:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.itemManager.sendTreasureString(id);
                }
            }
        }catch(e){}
        next();
    },


    //商店记录
    shopBuy:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role && this.isNum(msg.index) && msg.index >= 0 && msg.index <= 2) {
                    var price = ag.gameConst.shopPriceArray[msg.index];
                    if (role._data.gold >= price) {
                        role.addGold(-price);

                        if (msg.index == ag.gameConst.shopOffice) {
                            role.addOffice(10);
                        } else if (msg.index == ag.gameConst.shopCome) {
                            role._data.practice += 10;
                            if (role._data.practice >= ag.gameConst.comeArray[role._data.come]) {
                                role._data.practice -= ag.gameConst.comeArray[role._data.come];
                                ++role._data.come;
                            }
                            ag.jsUtil.sendDataAll("sCome", {
                                id: role._data.id,
                                come: role._data.come,
                                practice: role._data.practice,
                                level: role._data.level,
                                exp: role._exp
                            }, role._data.mapId);
                        } else if (msg.index == ag.gameConst.shopWing) {
                            role._data.wing += 10;
                            ag.jsUtil.sendDataAll("sSetWing", {
                                id: role._data.id,
                                wing: role._data.wing
                            }, role._data.mapId);
                        }
                        ag.gameLayer.addDirty(role._data.id);
                        ag.jsUtil.sendData("sSystemNotify", "76", id);
                    } else {
                        ag.jsUtil.sendData("sSystemNotify", "56%1000！", id);
                    }
                }
            }
        }catch(e){}
        next();
    },




    //请求拍卖行
    requestauctionShop:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.auctionShop.sendData(id);
                }
            }
        }catch(e){}
        next();
    },


    sellToAuctionShop:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id && this.isNum(msg.price) && msg.price>=0 && msg.price<500000) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.auctionShop.sellToAuctionShop(msg.id, id, msg.price);
                }
            }
        }catch(e){}
        next();
    },

    buyAuctionShop:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.auctionShop.buyAuctionShop(msg.id, id);
                }
            }
        }catch(e){}
        next();
    },



    askTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.team.askTeam(id, msg.id);
                }
            }
        }catch(e){}
        next();
    },



    addTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.team.addTeam(msg.id, id);
                }
            }
        }catch(e){}
        next();
    },



    exitTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.team.exitTeam(id);
                }
            }
        }catch(e){}
        next();
    },


    seeTeam:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.team.seeTeam(id);
                }
            }
        }catch(e){}
        next();
    },


    //请求交易
    askDeal:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.deal.askDeal(id, msg.id);
                }
            }
        }catch(e){}
        next();
    },

    addDeal:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.deal.addDeal(msg.id, id);
                }
            }
        }catch(e){}
        next();
    },


    delDeal:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.deal.delDeal(id);
                }
            }
        }catch(e){}
        next();
    },



    dealAddItem:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.deal.dealAddItem(id, msg);
                }
            }
        }catch(e){}
        next();
    },


    dealAddGold:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id && this.isNum(msg.gold) && msg.gold>=0 && msg.gold<=1000000) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.deal.dealAddGold(id, msg.gold);
                }
            }
        }catch(e){}
        next();
    },


    okDeal:function(msg, session, next){
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role) {
                    ag.deal.okDeal(id);
                }
            }
        }catch(e){}
        next();
    },


    cardBuy:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role && typeof msg.psw == 'string' && msg.psw.length == 12) {
                    ag.db.cardBuy(id, msg.psw);
                }
            }
        }catch(e){}
        next();
    },



    //请求排行榜
    requestRank:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if (role && ag.gameLayer._rankString) {
                    ag.jsUtil.sendData("sRank", ag.gameLayer._rankString, id);
                }
            }
        }catch(e){}
        next();
    },


    //请求转职
    changeType:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if(role){
                    if (role.getEquipIsEmpty() && (msg.type=='m0' || msg.type=='m1' || msg.type=='m2') && role._data.type!=msg.type) {
                        if(role._data.gold>=5000){
                            role.addGold(-5000);
                            role._data.type = msg.type;
                            ag.gameLayer.addDirty(role._data.id);

                            //处理狗
                            if(role._tiger){
                                ag.jsUtil.sendDataExcept("sDeleteRole",role._tiger._data.id,role._data.id);
                                role._tiger._data.camp=ag.gameConst.campMonster;
                                role._tiger._state = ag.gameConst.stateIdle;
                                role._tiger.dead();
                                delete role._tiger;
                            }
                            ag.gameLayer.createTiger(role);

                            this.app.rpc.conn.ConnRemote.kick(session, session.uid,'', function(){});
                            ag.jsUtil.sendDataAll("sSystemNotify",'32%'+role._data.name+'%77');
                        }else{
                            ag.jsUtil.sendData("sSystemNotify",'78',role._data.id);
                        }
                    }else{
                        ag.jsUtil.sendData("sSystemNotify",'79',role._data.id);
                    }
                }
            }
        }catch(e){}
        next();
    },


    //请求转职
    changeSex:function(msg, session, next) {
        try{
            var id = ag.userManager.getAccountByUid(session.uid);
            if(id) {
                var role = ag.gameLayer.getRole(id);
                if(role){
                    if (role.getEquipIsEmpty()) {
                        if(role._data.gold>=3000){
                            role.addGold(-3000);
                            role._data.sex = role._data.sex==1?0:1;
                            ag.jsUtil.sendDataAll("sChangeSex",role._data.id,role._data.mapId);
                            ag.jsUtil.sendDataAll("sSystemNotify",'32%'+role._data.name+'80');
                        }else{
                            ag.jsUtil.sendData("sSystemNotify",'81',role._data.id);
                        }
                    }else{
                        ag.jsUtil.sendData("sSystemNotify",'82',role._data.id);
                    }
                }
            }
        }catch(e){}
        next();
    },


    //请求转职
    forge:function(msg, session, next) {
        //try{
        //    var id = ag.userManager.getAccountByUid(session.uid);
        //    if(id) {
        //        ag.itemManager.bagItemForge(id);
        //    }
        //}catch(e){}
        next();
    },
});
