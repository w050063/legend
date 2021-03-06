/**
 * Created by bot.su on 2017/6/21.
 * 模拟角色信息表
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._infoMap = {};
        this._nLength = 0;
        this._uidBindMap = {};
        this._roleMapBack = {};
        this._itemMapBack = {};
        this._waiguaArray = {};
    },

    existAccount:function (id) {
        if(this._infoMap[id]){
            return true;
        }
        return false;
    },
    
    
    add:function (id,password,name,create_time) {
        if(!this._infoMap[id]){
            name = name?name:'r'+this._nLength;
            this._infoMap[id] = {id:id,name:name,password:password,create_time:create_time,online:false};
            ++this._nLength;
        }
        return this._infoMap[id];
    },
    changeName:function (id,name) {
        if(!id || !this._infoMap[id])return 1;


        var day = 1000 * 60 * 60 * 24;
        if(new Date().getTime() - parseInt(this._infoMap[id].create_time) > day)return 3;

        var bFind = false;
        for(var key in this._infoMap){
            if(key!=id && this._infoMap[key].name==name){
                bFind = true;
            }
        }
        if(bFind)return 2;
        if(name.length<2 || name.length>8 || name.indexOf(' ')!=-1 || name.indexOf('\n')!=-1 || name.indexOf('%')!=-1)return 2;
        try{
            this._infoMap[id].name = name;
            var role = ag.gameLayer.getRole(id);
            if(role){
                role._data.name = name;
                if(role._tiger)role._tiger._data.name = '白虎('+name+')';
            }
            ag.db.setAccountName(id,name);
        }catch(e){}
        return 0;
    },


    changeNameByGold:function (id,name) {
        var code = 1;
        try{
            var role = ag.gameLayer.getRole(id);
            if(role && this._infoMap[id]){
                if (role._data.gold >= 5000) {
                    var bFind = false;
                    for(var key in this._infoMap){
                        if(this._infoMap[key].name==name){
                            bFind = true;
                        }
                    }
                    if(!bFind && name.length>=2 && name.length<=8 && name.indexOf(' ')==-1 && name.indexOf('\n')==-1 && name.indexOf('%')==-1){
                        role.addGold(-5000);
                        this._infoMap[id].name = name;
                        role._data.name = name;
                        if(role._tiger)role._tiger._data.name = '白虎('+name+')';
                        ag.db.setAccountName(id,name);
                        code = 0;
                    }else {
                        code = 2;
                    }
                }else {
                    code = 3;
                }
            }else{
                code = 1;
            }
        }catch(e){}
        return code;
    },


    getName:function(id){
        if(id && this._infoMap[id])return this._infoMap[id].name;
        return "";
    },

    getOnline:function(id){
        if(id && this._infoMap[id])return this._infoMap[id].online;
        return false;
    },

    setOnline:function(id,online){
        if(id && this._infoMap[id]){
            this._infoMap[id].online = online;
            if(online){
                this._itemMapBack[id] = {};
                this._roleMapBack[id] = {};
            }else{
                delete this._itemMapBack[id];
                delete this._roleMapBack[id];
            }
        }
    },

    //账号密码是否正确
    isRightAccountAndPassword:function(account,password){
        if(account && this._infoMap[account] && this._infoMap[account].password==password)return true;
        return false;
    },


    alterPassWord:function(account,password){
        if(account && this._infoMap[account]){
            this._infoMap[account].password = password;
            ag.db.alterPassWord(account,password);//写进数据库
        }
    },


    //设置uid
    bindUid:function(uid,account){
        this._uidBindMap[uid] = account;
        this._infoMap[account].uid = uid;
    },


    //解除绑定uid
    unbindUid:function(uid){
        if(this._uidBindMap[uid]){
            delete this._infoMap[this._uidBindMap[uid]].uid;
            delete this._uidBindMap[uid];
        }
    },


    //根据uid获得账号
    getAccountByUid:function(uid){
        var id = this._uidBindMap[uid];
        if(id){
            var rid = parseInt(id.split('_')[0]);
            if(rid && rid>=ag.gameLayer._legendID && rid<=ag.gameLayer._legendIDMax)
            return id;
        }
        return undefined;
    },

    //根据账号获得uid
    getUidByAccount:function(account){
        if(this._infoMap[account]){
            return this._infoMap[account].uid;
        }
        return undefined;
    },


    //设置禁言
    setOffline:function(account,offline){
        if(this._infoMap[account]){
            this._infoMap[account].offline = offline;
        }
    },

    //获得是否
    getOffline:function(account){
        if(this._infoMap[account] && this._infoMap[account].offline){
            return true;
        }
        return false;
    },
});
