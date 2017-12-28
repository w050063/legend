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


    //进入游戏,0正确,1Id为空,2ID已经存在
    ykLogin:function(msg, session, next) {
        var data = null;
        if(session.uid){
            var exist = ag.userManager.getName(session.uid)!='';


            data = ag.userManager.add(session.uid);
            var player =  ag.gameLayer.getRole(session.uid);
            if(player){
                data.type = player._data.type;
                data.sex = player._data.sex;
            }


            //写进数据库
            var timeCounter = ''+new Date().getTime();
            if(!exist){
                ag.db.createAccount(session.uid,'111111',data.name,timeCounter,timeCounter);
            }else{
                ag.db.setAccountLastTime(session.uid,timeCounter);
            }
        }
        next(null, {
            code: data?0:1,
            data: data?data:0
        });
    },


    //0正常,1id不存在,2名字重复
    changeName:function(msg, session, next) {
        var code = ag.userManager.changeName(session.uid,msg);
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
        ag.gameLayer.deleteRole(session.uid);
        ag.db.setItems();//道具保存
        next(null, {
            code: code
        });
    },


    chatYou : function(msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            ag.db.insertChat(session.uid,msg,''+new Date().getTime());
            ag.jsUtil.sendDataAll("sChatYou",{id:session.uid,name:player._data.name+'('+ag.gameConst._roleMst[player._data.type].name+')',content:msg});
        }
        next();
    },


    //更换新地图
    changeMap:function(msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            player.changeMap(msg);
        }
        next();
    },


    //进入游戏
    enter:function(msg, session, next) {
        var role = ag.gameLayer.getRole(session.uid);
        var exist = !!role;
        ag.gameLayer.addPlayer(session.uid,undefined,undefined,undefined,msg.type,undefined,msg.sex);
        if(!exist){
            role = ag.gameLayer.getRole(session.uid);
            var data = role._data;
            ag.db.insertRole(data.id,data.mapId,data.x,data.y,data.type,data.camp,data.sex,data.direction,data.level,role._exp,data.gold,data.office);
        }
        next();
    },


    //移动
    move:function(msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            player.move({x:msg.x,y:msg.y});
        }
        next();
    },


    //攻击
    attack:function(msg, session, next) {
        var attacker =  ag.gameLayer.getRole(session.uid);
        var locked =  ag.gameLayer.getRole(msg.id);
        if(attacker && locked){
            attacker.attack(locked);
        }
        next();
    },



    //复活请求
    relife:function(msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            player.relife();
        }
        next();
    },


    bagItemToGround:function (msg, session, next) {
        ag.itemManager.bagItemToGround(msg,session.uid);
        next();
    },



    bagItemToEquip:function (msg, session, next) {
        ag.itemManager.bagItemToEquip(msg.id,msg.puton,session.uid);
        next();
    },


    equipItemToBag:function (msg, session, next) {
        ag.itemManager.equipItemToBag(msg,session.uid);
        next();
    },


    bagItemRecycle:function (msg, session, next) {
        ag.itemManager.bagItemRecycle(msg.split(','),session.uid);
        next();
    },


    //更换阵营
    camp:function (msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            player.changeCamp(msg);
        }
        next();
    },


    //创建行会
    guildCreate:function (msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
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
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            ag.guild.guildDelete(player._data.id);
            player._data.camp = ag.gameConst.campPlayerNone;
        }
        next();
    },


    //邀请成员
    guildInvite:function (msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
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
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            var id = ag.guild._inviteMap[session.uid];
            if(id){
                delete ag.guild._inviteMap[session.uid];
                var obj = ag.guild._dataMap[id];
                obj.member.push(session.uid);
                ag.jsUtil.sendData("sSystemNotify","您已经加入["+obj.name+"]！",session.uid);
                ag.jsUtil.sendData("sSystemNotify","玩家"+player._data.name+"加入行会["+obj.name+"]！",id);
                var str = obj.member.length==0?'':obj.member.join(',');
                ag.jsUtil.sendDataAll("sGuildCreate",{result:0,id:id,name:obj.name,member:str});
                player._data.camp = obj.identify;
                ag.db.guildSaveMember(id,obj.member);
            }
        }
        next();
    },


    //不同意邀请
    guildCancel:function (msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            var id = ag.guild._inviteMap[session.uid];
            if(id){
                delete ag.guild._inviteMap[session.uid];
                ag.jsUtil.sendData("sSystemNotify","取消成功！",session.uid);
                ag.jsUtil.sendData("sSystemNotify","玩家"+player._data.name+"拒绝加入行会邀请！",id);
            }
        }
        next();
    },


    //踢出成员
    guildKick:function (msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
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
                var obj = ag.guild._dataMap[session.uid];
                var index = obj.member.indexOf(rid);
                if(index!=-1){
                    obj.member.splice(index,1);
                    var str = obj.member.length==0?'':obj.member.join(',');
                    ag.jsUtil.sendDataAll("sGuildCreate",{result:0,id:obj.id,name:obj.name,member:str});
                    ag.jsUtil.sendData("sSystemNotify","踢出成功！",session.uid);
                    ag.jsUtil.sendData("sSystemNotify","您被踢出行会！",rid);
                    ag.gameLayer.getRole(rid)._data.camp = ag.gameConst.campPlayerNone;
                    ag.db.guildSaveMember(session.uid,obj.member);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","被踢人不在本行会！",session.uid);
                }
            }else{
                ag.jsUtil.sendData("sSystemNotify","被踢人不存在！",session.uid);
            }
        }
        next();
    },


    //成员退出
    guildExit:function (msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player) {
            for (var key in ag.guild._dataMap) {
                var obj = ag.guild._dataMap[key];
                var index = obj.member.indexOf(session.uid);
                if (index != -1) {
                    obj.member.splice(index, 1);
                    var str = obj.member.length == 0 ? '' : obj.member.join(',');
                    ag.jsUtil.sendDataAll("sGuildCreate", {result: 0, id: obj.id, name: obj.name, member: str});
                    ag.jsUtil.sendData("sSystemNotify", "退出行会成功！", session.uid);
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
        var player =  ag.gameLayer.getRole(session.uid);
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
        var player =  ag.gameLayer.getRole(session.uid);
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
        var player =  ag.gameLayer.getRole(session.uid);
        var item = ag.itemManager._itemMap.get(msg);
        if(player && item && item._data.owner==session.uid) {
            item._data.puton = ag.gameConst.putonWharehouse;
            --player._bagLength;
            ++player._wharehoseLength;
        }
        next();
    },



    //道具仓库到背包
    itemWharehouseToBag:function (msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        var item = ag.itemManager._itemMap.get(msg);
        if(player && item && item._data.owner==session.uid) {
            item._data.puton = ag.gameConst.putonBag;
            ++player._bagLength;
            --player._wharehoseLength;
        }
        next();
    },
});
