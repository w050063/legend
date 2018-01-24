/**
 * Created by bot.su on 2017/6/21.
 * 商店详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
        this._selectIndex = 0;
    },


    //商城物品事件
    show:function(event){
        this.node.active = true;
        ag.agSocket.send("requestauctionShop",{});
    },


    refresh:function(map){
        cc.log(map);
    },


    //商城关闭事件
    buttonEventClose:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },
});
