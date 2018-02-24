/**
 * Created by bot.su on 2017/6/21.
 * 道具详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
    },

    show: function () {
        this.node.active = true;
        ag.agSocket.send("requestGuildMemberString",{});
        this.guildMemberString('正在刷新成员列表...');
    },


    guildMemberString: function (str) {
        //保存到聊天记录里面
        var scrollview = cc.find('Canvas/nodeGuildMember/spriteBack/scrollView').getComponent(cc.ScrollView);
        var contentNode = scrollview.content;
        var itemNode = contentNode.getChildByName('item');
        itemNode.getComponent(cc.Label).string = str;
        contentNode.height = Math.max(itemNode.height,440);
        scrollview.scrollToBottom();
    },


    //关闭按钮
    buttonCloseEvent:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },
});
