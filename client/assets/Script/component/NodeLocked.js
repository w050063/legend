/**
 * Created by bot.su on 2017/6/21.
 * 商店详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.node.active = false;
        }.bind(this));
        this.node.getChildByName('labelEquip').on(cc.Node.EventType.TOUCH_END, function (event) {
            this.buttonEventEquip();
        }.bind(this));
        this.node.getChildByName('labelPrivateChat').on(cc.Node.EventType.TOUCH_END, function (event) {
            this.buttonEventPrivate();
        }.bind(this));
        this.node.getChildByName('labelTeam').on(cc.Node.EventType.TOUCH_END, function (event) {
            this.buttonEventTeam();
        }.bind(this));
        this.node.getChildByName('labelDeal').on(cc.Node.EventType.TOUCH_END, function (event) {
            this.buttonEventDeal();
        }.bind(this));
    },

    setRid:function(rid){
        this._rid = rid;
    },

    //装备
    buttonEventEquip:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var role = ag.gameLayer.getRole(this._rid);
        if(role){
            ag.gameLayer.showOtherEquip(role._data.id);
        }
    },



    //私聊
    buttonEventPrivate:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var role = ag.gameLayer.getRole(this._rid);
        if(role){
            ag.gameLayer.buttonShowChatNode();
            cc.find('Canvas/nodeChatContent/spriteBack/editBoxName').getComponent(cc.EditBox).string = '@'+role._data.name+ ' ';
        }
    },


    //组队
    buttonEventTeam:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var role = ag.gameLayer.getRole(this._rid);
        if(role){
            ag.agSocket.send("askTeam",{id:role._data.id});
        }
    },



    //交易
    buttonEventDeal:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var role = ag.gameLayer.getRole(this._rid);
        if(role){
            ag.agSocket.send("askDeal",{id:role._data.id});
        }
    },
});
