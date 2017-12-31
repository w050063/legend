/**
 * Created by bot.su on 2017/6/21.
 * 道具详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
        this._editBox = this.node.getChildByName('editBoxName').getComponent(cc.EditBox);
    },


    //确认按钮
    buttonOKEvent:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(this._editBox.string.length>=2 && this._editBox.string.length<=8){
            ag.agSocket.send("guildInvite",{name:this._editBox.string});
            ag.userInfo._guildInvite = null;
            this.node.active = false;
        }else{
            ag.jsUtil.showText(ag.gameLayer.node,'名字长度必须为2-8');
        }
    },


    //关闭按钮
    buttonCloseEvent:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },
});
