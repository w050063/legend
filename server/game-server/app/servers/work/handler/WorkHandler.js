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
    },


    //开始沙巴克
    systemNotify:function(msg, session, next){
        if(typeof msg=='string'){
            ag.jsUtil.sendDataAll("sSystemNotify",msg);
            next(null, {code: 0});
            return;
        }
        next(null, {code: 1});
    },

    //开始沙巴克
    shabake:function(msg, session, next){
        var array = msg.duration.split('.');
        var startTime = new Date(parseInt(array[0]),parseInt(array[1])-1,parseInt(array[2]),parseInt(array[3]),parseInt(array[4]),parseInt(array[5])).getTime();
        var nowTime = new Date().getTime();
        console.log(msg);
        console.log(startTime);
        console.log(nowTime);

        ag.shabake.start(startTime-nowTime,parseFloat(msg.duration2)*60*60*1000);
        next(null, {code: 0});
    },


    //加元宝
    addGold:function(msg, session, next){
        var role = null;
        for(var key in ag.gameLayer._roleMap){
            if(ag.gameLayer._roleMap[key].getIsPlayer()) {
                if (ag.gameLayer._roleMap[key]._data.name == msg.name) {
                    role = ag.gameLayer._roleMap[key];
                    break;
                }
            }
        }
        if(role){
            role.addGold(msg.gold);
        }
        next(null, {
            code: role?0:1,
        });
    },


    theCountryIsAtPeace:function(msg, session, next){
        ag.gameLayer.theCountryIsAtPeace();
        next();
    },



    //注册
    register:function(msg, session, next) {

        if(ag.userManager.existAccount(msg.account)==false){
            ag.userManager.add(msg.account,msg.password,msg.account);
            //写进数据库
            var timeCounter = ''+new Date().getTime();
            ag.db.createAccount(msg.account,msg.password,msg.account,timeCounter,timeCounter);
            next(null, {code: 0});
        }else{
            next(null, {code: 1});
        }
    },


    //进入游戏,0正确,1Id为空,2ID已经存在
    login:function(msg, session, next) {
        if(ag.userManager.isRightAccountAndPassword(msg.account,msg.password)){
            var oldUid = ag.userManager.getUidByAccount(msg.account);
            console.log('dddd',msg.account,oldUid);
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
        var id = ag.userManager.getAccountByUid(session.uid);
        ag.gameLayer.deleteRole(id);
        ag.db.setItems();//道具保存
        next(null, {
            code: code
        });
    },


    chatYou : function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player){
            var str = null;
            if(msg.chatType==ag.gameConst.chatAll){
                str = '(全体)'+msg.str;
            }else if(msg.chatType==ag.gameConst.chatMap){
                str = '(地图)'+msg.str;
            }else if(msg.chatType==ag.gameConst.chatGuild){
                str = '(行会)'+msg.str;
            }
            if(str){
                ag.db.insertChat(id,str,''+new Date().getTime());
                if(msg.chatType==ag.gameConst.chatAll){
                    ag.jsUtil.sendDataAll("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str});
                }else if(msg.chatType==ag.gameConst.chatMap){
                    ag.jsUtil.sendDataAll("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str},player._data.mapId);
                }else if(msg.chatType==ag.gameConst.chatGuild){
                    for(var key in ag.gameLayer._roleMap){
                        var temp = ag.gameLayer._roleMap[key];
                        if(temp.getIsPlayer()){
                            console.log(temp._data.camp,player._data.camp);
                            if(temp._data.camp!=ag.gameConst.campPlayerNone && temp._data.camp==player._data.camp){
                                ag.jsUtil.sendData("sChatYou",{id:id,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:str},temp._data.id);
                            }
                        }
                    }
                }
            }
        }
        next();
    },


    //更换新地图
    changeMap:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player){
            player.changeMap(msg);
        }
        next();
    },


    //进入游戏
    enter:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var role = ag.gameLayer.getRole(id);
        var exist = !!role;
        ag.gameLayer.addPlayer(id,undefined,undefined,undefined,msg.type,undefined,msg.sex);
        if(!exist){
            role = ag.gameLayer.getRole(id);
            var data = role._data;
            ag.db.insertRole(data.id,data.mapId,data.x,data.y,data.type,data.camp,data.sex,data.direction,data.level,role._exp,data.gold,data.office);
        }

        //记录玩家进入游戏时间
        role._startGameTime = ag.gameLayer._gameTime;
        next();
    },


    verifyTime:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var role = ag.gameLayer.getRole(id);
        if(role && typeof msg=='number'){
            if(ag.gameLayer._gameTime-role._startGameTime+20<msg){
                ag.jsUtil.sendData("sAlert","请勿使用作弊软件！",role._data.id);
            }
        }
        next();
    },


    //移动
    move:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player){
            player.move({x:msg.x,y:msg.y});
        }
        next();
    },


    //攻击
    attack:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var attacker =  ag.gameLayer.getRole(id);
        var locked =  ag.gameLayer.getRole(msg.id);
        if(attacker && locked){
            attacker.attack(locked);
        }
        next();
    },



    //复活请求
    relife:function(msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player){
            player.relife();
        }
        next();
    },


    bagItemToGround:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        ag.itemManager.bagItemToGround(msg,id);
        next();
    },



    bagItemToEquip:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        ag.itemManager.bagItemToEquip(msg.id,msg.puton,id);
        next();
    },


    equipItemToBag:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        ag.itemManager.equipItemToBag(msg,id);
        next();
    },


    bagItemRecycle:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        ag.itemManager.bagItemRecycle(msg.split(','),id);
        next();
    },


    //更换阵营
    camp:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player){
            player.changeCamp(msg);
        }
        next();
    },


    //创建行会
    guildCreate:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player){
            if(player._data.gold>=500){
                player._data.gold-=500;
                player.addGold(-500);
                ag.guild.addGuild(msg.name,player._data.id);
            }else{
                ag.jsUtil.sendData("sSystemNotify","元宝不足500!",player._data.id);
            }
        }
        next();
    },


    //删除行会
    guildDelete:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player){
            ag.guild.guildDelete(player._data.id);
            player._data.camp = ag.gameConst.campPlayerNone;
        }
        next();
    },


    //邀请成员
    guildInvite:function (msg, session, next) {
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
        next();
    },


    //同意邀请
    guildOK:function (msg, session, next) {
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
        next();
    },


    //不同意邀请
    guildCancel:function (msg, session, next) {
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
        next();
    },


    //踢出成员
    guildKick:function (msg, session, next) {
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
        next();
    },


    //成员退出
    guildExit:function (msg, session, next) {
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
        next();
    },


    //寻宝一次
    treasure:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player) {
            if(player._data.gold>=200){
                player._data.gold-=200;
                player.addGold(-200);
                ag.itemManager.treasure(player);
            }else{
                ag.jsUtil.sendData("sSystemNotify","元宝不足200!",player._data.id);
            }
        }
        next();
    },


    //寻宝一次
    treasure5:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        if(player) {
            if(player._data.gold>=1000){
                player._data.gold-=1000;
                player.addGold(-1000);
                ag.itemManager.treasure5(player);
            }else{
                ag.jsUtil.sendData("sSystemNotify","元宝不足1000!",player._data.id);
            }
        }
        next();
    },



    //增加到仓库
    itemBagToWharehouse:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        var item = ag.itemManager._itemMap.get(msg);
        if(player && item && item._data.owner==id) {
            item._data.puton = ag.gameConst.putonWharehouse;
            --player._bagLength;
            ++player._wharehoseLength;
        }
        next();
    },



    //道具仓库到背包
    itemWharehouseToBag:function (msg, session, next) {
        var id = ag.userManager.getAccountByUid(session.uid);
        var player =  ag.gameLayer.getRole(id);
        var item = ag.itemManager._itemMap.get(msg);
        if(player && item && item._data.owner==id) {
            item._data.puton = ag.gameConst.putonBag;
            ++player._bagLength;
            --player._wharehoseLength;
        }
        next();
    },
});
