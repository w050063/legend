/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._dataMap = {};
    },


    sendData:function(id){
        ag.jsUtil.sendData("sAuctionShop",JSON.stringify(this._dataMap),id);
    },
});
