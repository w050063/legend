/**
 * Created by bot.su on 2017/6/21.
 * 商店详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {

    },

    show:function(rid,name){
        if(cc.find('Canvas/nodeHelp/toggleAllowTeam').getComponent(cc.Toggle).isChecked){
            this.node.active = true;
            this._rid = rid;
            this.node.getChildByName('label').getComponent(cc.Label).string = ''+name+'邀请你组队';
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(cc.delayTime(10),cc.callFunc(function(){
                this.node.active = false;
            }.bind(this))));
        }
    },

    //拒绝
    buttonEventNO:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },


    //同意
    buttonEventYES:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        ag.agSocket.send("addTeam",{id:this._rid});
        this.node.active = false;
    },
});
