/**
 * Created by bot.su on 2017/6/21.
 * 模拟角色信息表
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._infoMap = {};
        this._nLength = 0;
    },
    
    
    add:function (id,name) {
        if(!this._infoMap[id]){
            name = name?name:'r'+this._nLength;
            this._infoMap[id] = {id:id,name:name,sessions:0,score:0};
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
    }
});
