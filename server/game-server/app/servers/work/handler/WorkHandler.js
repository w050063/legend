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


    //进入游戏,0正确,1Id为空,2ID已经存在
    ykLogin:function(msg, session, next) {
        var data = null;
        if(session.uid){
            data = ag.userManager.add(session.uid,session.uid,0,0);
            var player =  ag.gameLayer.getRole(session.uid);
            if(player){
                data.type = player._data.type;
                data.sex = player._data.sex;
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
        var code = 1;
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
            if(player._tiger){
                ag.itemManager.delItemByRoleId(player._tiger._data.id);
                player._tiger._data.camp=ag.gameConst.campMonster;
                player._tiger._state = ag.gameConst.stateIdle;
                player._tiger.dead();
                ag.jsUtil.sendDataExcept("sDeleteRole",player._tiger._data.id,player._data.id);
            }
            ag.itemManager.delItemByRoleId(session.uid);
            player._data.camp=ag.gameConst.campMonster;
            player._state = ag.gameConst.stateIdle;
            player.dead();
            code = 0;
            ag.jsUtil.sendDataExcept("sDeleteRole",player._data.id,player._data.id);
        }
        next(null, {
            code: code
        });
    },


    chatYou : function(msg, session, next) {
        var player =  ag.gameLayer.getRole(session.uid);
        if(player){
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
        ag.gameLayer.addPlayer(session.uid,ag.userManager.getName(session.uid),msg.type,msg.sex);
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
});
