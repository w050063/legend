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
        var player = ag.gameLayer.getRole(id);
        if (player._data.gold < 100) {
            ag.jsUtil.sendData("sSystemNotify", "56%100!", player._data.id);
            ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
            return;
        }

        if(name.length<2 || name.length>8 || name.indexOf(' ')!=-1 || name.indexOf('\n')!=-1 || name.indexOf('%')!=-1){
            ag.jsUtil.sendDataAll("sSystemNotify","20");
            ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
            return;
        }

        if(this._dataMap[id]){
            ag.jsUtil.sendDataAll("sSystemNotify","20");
            ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
            return;
        }else{
            for(var key in this._dataMap){
                var temp = this._dataMap[key];
                if(temp.name==name){
                    ag.jsUtil.sendDataAll("sSystemNotify","21");
                    ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
                    return;
                }else{
                    for(var i=0;i<temp.member.length;++i){
                        if(temp.member[i]==id){
                            ag.jsUtil.sendDataAll("sSystemNotify","22");
                            ag.jsUtil.sendDataAll("sGuildCreate",{result:1});
                            return;
                        }
                    }
                }
            }
        }

        player.addGold(-100);
        this._dataMap[id] = {id:id,name:name,member:[],identify:++this._baseIdentify};
        player._data.camp = this._dataMap[id].identify;
        ag.db.guildCreate(id,name);
        ag.jsUtil.sendData("sSystemNotify","23",id);
        ag.jsUtil.sendDataAll("sGuildCreate",{result:0,id:id,name:name,member:''});
    },


    //删除
    guildDelete:function(id){
        if(this._dataMap[id]){
            delete this._dataMap[id];
            ag.db.guildDelete(id);
            ag.jsUtil.sendData("sSystemNotify","24",id);
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
            ag.jsUtil.sendData("sSystemNotify","25",id);
        }else{
            this._inviteMap[rid] = id;
            ag.jsUtil.sendData("sGuildInvite",id,rid);
            ag.jsUtil.sendData("sSystemNotify","26",id);
            var role = ag.gameLayer.getRole(rid);
            ag.jsUtil.sendData("sSystemNotify",role._data.name+"%27%"+this._dataMap[id].name+"]！",rid);
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


    requestGuildMemberString:function(rid){
        var guildId = this.getGuildId(rid);
        if(guildId){
            var result = '\n掌门人：\n';
            var role = ag.gameLayer.getRole(guildId);
            result = result+(role?role._data.name:'XXX')+'\n\n成员列表：\n';
            var array = this._dataMap[guildId].member;
            for(var i=0;i<array.length;++i){
                var role = ag.gameLayer.getRole(array[i]);
                result = result+(role?role._data.name:'XXX')+'        ';
            }
            ag.jsUtil.sendData("guildMemberString",result,rid);
        }else{
            ag.jsUtil.sendData("guildMemberString",'您还没加入行会！',rid);
        }
    },
});
