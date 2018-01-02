/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._dataMap = {};
        this._inviteMap = {};
        this._baseIdentify = 10;
    },


    //增加
    addGuild:function(name,id){
        if(this._dataMap[id]){
            ag.jsUtil.sendDataAll("sSystemNotify","创建失败，你已经创立行会！");
            ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
            return;
        }else{
            for(var key in this._dataMap){
                var temp = this._dataMap[key];
                if(temp.name==name){
                    ag.jsUtil.sendDataAll("sSystemNotify","创建失败,名字已存在！");
                    ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
                    return;
                }else{
                    for(var i=0;i<temp.member.length;++i){
                        if(temp.member[i]==id){
                            ag.jsUtil.sendDataAll("sSystemNotify","创建失败，你已经加入行会！");
                            ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
                            return;
                        }
                    }
                }
            }
        }

        this._dataMap[id] = {id:id,name:name,member:[],identify:++this._baseIdentify};
        ag.gameLayer.getRole(id)._data.camp = this._dataMap[id].identify;
        ag.db.guildCreate(id,name);
        ag.jsUtil.sendData("sSystemNotify","创建行会成功！",id);
        ag.jsUtil.sendDataAll("sGuildCreate",{result:0,id:id,name:name,member:''});
    },


    //删除
    guildDelete:function(id){
        if(this._dataMap[id]){
            delete this._dataMap[id];
            ag.db.guildDelete(id);
            ag.jsUtil.sendData("sSystemNotify","删除行会成功！",id);
            ag.jsUtil.sendDataAll("sGuildDelete",id);
        }
    },


    //邀请
    guildInvite:function(id,rid){
        var bFind = false;
        if(this._dataMap[rid]){
            bFind = true;
        }else{
            for(var key in this._dataMap){
                var array = this._dataMap[key].member;
                for(var i=0;i<array.length;++i){
                    if(array[i]==rid){
                        bFind = true;
                        break;
                    }
                }
            }
        }
        if(bFind){
            ag.jsUtil.sendData("sSystemNotify","此人已经入会！",id);
        }else{
            this._inviteMap[rid] = id;
            ag.jsUtil.sendData("sGuildInvite",id,rid);
            ag.jsUtil.sendData("sSystemNotify","已经发出邀请！",id);
            var role = ag.gameLayer.getRole(rid);
            ag.jsUtil.sendData("sSystemNotify",role._data.name+"邀请您加入行会["+this._dataMap[id].name+"]！",rid);
        }
    },


    getGuildId:function(rid){
        if(this._dataMap[rid]){
            return rid;
        }
        for(var key in this._dataMap){
            if(this._dataMap[key].member.indexOf(rid)!=-1){
                return key;
            }
        }
        return null;
    },
});
