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
        var str = this._editBox.string;
        if(str.length>=2 && str.length<=8 && str.indexOf(' ')==-1 && str.indexOf('\n')==-1 && str.indexOf('%')==-1){
            ag.agSocket.send("guildCreate",{name:this._editBox.string});
            this.node.active = false;
        }else{
            ag.jsUtil.showText(ag.gameLayer.node,'名字长度必须为2-8，并且不能包含特殊字符');
        }
    },


    //关闭按钮
    buttonCloseEvent:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },
});
