/**
 * Created by bot.su on 2017/6/21.
 * 模拟角色信息表
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._infoMap = {};
        this._nLength = 0;
        this._uidBindMap = {};
    },


    existAccount:function (id) {
        if(this._infoMap[id]){
            return true;
        }
        return false;
    },
    
    
    add:function (id,password,name) {
        if(!this._infoMap[id]){
            name = name?name:'r'+this._nLength;
            this._infoMap[id] = {id:id,name:name,password:password,sessions:0,score:0};
            ++this._nLength;
        }
        return this._infoMap[id];
    },
    changeName:function (id,name) {
        if(!id)return 1;
        var bFind = false;
        for(var key in this._infoMap){
            if(key!=id && this._infoMap[key].name==name){
                bFind = true;
            }
        }
        if(bFind)return 2;
        this._infoMap[id].name = name;
        var role = ag.gameLayer.getRole(id);
        if(role){
            role._data.name = name;
            if(role._tiger)role._tiger._data.name = '白虎('+name+')';
        }
        ag.db.setAccountName(id,name);
        return 0;
    },
    getName:function(id){
        if(id && this._infoMap[id])return this._infoMap[id].name;
        return "";
    },


    //账号密码是否正确
    isRightAccountAndPassword:function(account,password){
        if(account && this._infoMap[account].password==password)return true;
        return false;
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
        return this._uidBindMap[uid];
    },

    //根据账号获得uid
    getUidByAccount:function(account){
        if(this._infoMap[account]){
            return this._infoMap[account].uid;
        }
        return undefined;
    },
});
