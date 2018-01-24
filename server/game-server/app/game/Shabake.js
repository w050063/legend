/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */


module.exports = ag.class.extend({
    ctor:function () {
        this._bRunning = 0;
        this._guildWinId = '';
        if(ag.db && ag.db._customData){
            this._guildWinId = ag.db._customData.guildWinId?ag.db._customData.guildWinId:'0';
        }
    },


    //启动
    start:function(duration,duration2){
        if(this._bRunning==0){
            this._bRunning = 1;
            setTimeout(function(){
                this._bRunning = 2;
                ag.db.getCustomData(function(data){
                    this._guildWinId = data.guildWinId;
                }.bind(this));
                ag.jsUtil.sendDataAll("sSystemNotify","攻城开始!!!");
                this.reset();
                setTimeout(function(){
                    this._bRunning = 0;
                    ag.db.getCustomData(function(data2){
                        data2.guildWinId = this._guildWinId;
                        ag.db._customData.guildWinId = this._guildWinId;
                        ag.db.setCustomData(data2);
                    }.bind(this));
                    ag.jsUtil.sendDataAll("sSystemNotify","攻城结束,请城主联系管理员领取奖励!!!");
                }.bind(this),duration2);
            }.bind(this),duration);
        }
    },


    //重置
    reset:function(){
        if(this._bRunning==2){
            if(!this._guildWinId){//不存在则增加
                for(var key in ag.gameLayer._roleMap){
                    var role = ag.gameLayer._roleMap[key];
                    if(role.getIsPlayer() && ag.userManager.getOnline(role._data.id) && role._state!=ag.gameConst.stateDead && role._data.mapId=='t16' && ag.guild.getGuildId(key)){
                        this._guildWinId = ag.guild.getGuildId(key);
                        ag.jsUtil.sendDataAll("sSystemNotify","皇宫被("+ag.guild._dataMap[this._guildWinId].name+")占领！");
                        ag.jsUtil.sendDataAll("sGuildWinId",this._guildWinId);
                        break;
                    }
                }
            }else{//存在则检测皇宫是否还有本行会的人
                var bFind = false;
                for(var key in ag.gameLayer._roleMap){
                    var role = ag.gameLayer._roleMap[key];
                    if(role.getIsPlayer() && ag.userManager.getOnline(role._data.id) && role._state!=ag.gameConst.stateDead && role._data.mapId=='t16' && ag.guild.getGuildId(key)==this._guildWinId){
                        bFind = true;
                        break;
                    }
                }
                if(bFind==false){
                    this._guildWinId = '';
                    this.reset();
                }
            }
        }
    },
});
