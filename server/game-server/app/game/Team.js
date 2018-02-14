/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._dataMap = {};
        this._baseId = 0;
    },

    isSameTeam:function(rid1,rid2){
        var id1 = this.getTeam(rid1);
        var id2 = this.getTeam(rid2);
        if(id1 && id2 && id1==id2)return true;
        return false;
    },


    getTeam:function(rid){
        for(var key in this._dataMap){
            var array = this._dataMap[key];
            for(var i=0;i<array.length;++i){
                if(rid==this._dataMap[key][i])return key;
            }
        }
        return null;
    },


    //邀请
    askTeam:function(rid1,rid2){
        if(this.getTeam(rid2)){
            ag.jsUtil.sendData("sSystemNotify","对方已经组队！",rid1);
        }else if(this._dataMap[rid1] && this._dataMap[rid1].length>=4){
            ag.jsUtil.sendData("sSystemNotify","组队人数上线4人！",rid1);
        }else{
            ag.jsUtil.sendData("sSystemNotify","已经发出邀请！",rid1);
            var role = ag.gameLayer.getRole(rid1);
            ag.jsUtil.sendData("sAskTeam",{id:rid1,name:role._data.name},rid2);
        }
    },


    //增加
    addTeam:function(rid1,rid2){
        if(rid1==rid2){
            ag.jsUtil.sendData("sSystemNotify","您不能加自己！",rid2);
        }else if(this.getTeam(rid2)){
            ag.jsUtil.sendData("sSystemNotify","您已经组队！",rid2);
        }else if(this._dataMap[rid1] && this._dataMap[rid1].length>=4){
            ag.jsUtil.sendData("sSystemNotify","此队伍人数已满4人！",rid2);
        }else{
            var id = this.getTeam(rid1);
            if(!id){
                id = 'team'+(++this._baseId);
                this._dataMap[id] = [rid1];
            }
            this._dataMap[id].push(rid2);

            var i = 0;
            var str = '当前队友：';
            for(i=0;i<this._dataMap[id].length;++i){
                var role = ag.gameLayer.getRole(this._dataMap[id][i]);
                str = str + role._data.name;
                if(i!=this._dataMap[id].length-1)str = str+',';
            }
            for(i=0;i<this._dataMap[id].length;++i){
                ag.jsUtil.sendData("sSystemNotify",str,this._dataMap[id][i]);
            }
        }
    },

    //查看
    seeTeam:function(rid){
        var id = this.getTeam(rid);
        if(id){
            var str = '当前队友：';
            for(var i=0;i<this._dataMap[id].length;++i){
                var role = ag.gameLayer.getRole(this._dataMap[id][i]);
                str = str + role._data.name;
                if(i!=this._dataMap[id].length-1)str = str+',';
            }
            ag.jsUtil.sendData("sSystemNotify",str,rid);
        }else{
            ag.jsUtil.sendData("sSystemNotify","您还没有组队！",rid);
        }
    },


    //退出
    exitTeam:function(rid){
        var id = this.getTeam(rid);
        if(id){
            var role = ag.gameLayer.getRole(rid);
            for(i=0;i<this._dataMap[id].length;++i){
                ag.jsUtil.sendData("sSystemNotify",''+role._data.name+"已退出队伍！",this._dataMap[id][i]);
            }
            this._dataMap[id].splice(this._dataMap[id].indexOf(rid),1);
            if(this._dataMap[id].length==1){
                delete this._dataMap[id];
            }
        }
    },
});
