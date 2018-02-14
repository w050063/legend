/**
 * Created by bot.su on 2017/6/21.
 * 商店详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
        this.node.getChildByName('labelADDR').on(cc.Node.EventType.TOUCH_END, function (event) {
            cc.sys.openURL('https://salecard.9wka.com/s_chuanqi.html');
        }.bind(this));
    },


    //商城关闭事件
    show:function(){
        this.node.active = true;
        this.node.getChildByName('editBoxPassword').getComponent(cc.EditBox).string = '';
    },

    //商城购买事件
    buttonEvenBuy:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");

        var str = this.node.getChildByName('editBoxPassword').getComponent(cc.EditBox).string;
        if(str.length==12){
            ag.agSocket.send("cardBuy",{psw:str});
        }else{
            ag.jsUtil.showText(ag.gameLayer.node,'输入有误，请核对后再次输入！');
        }
    },


    //商城关闭事件
    buttonEventClose:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },
});
