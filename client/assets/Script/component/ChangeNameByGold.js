/**
 * Created by bot.su on 2017/6/21.
 * 商店详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
    },


    //商城关闭事件
    show:function(){
        this.node.active = true;
        this.node.getChildByName('editBoxName').getComponent(cc.EditBox).string = ag.gameLayer._player._data.name;
    },

    //改名字事件
    buttonEvenchangeNameByGold:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        ag.jsUtil.alertOKCancel(ag.gameLayer.node,'确认花费5000元宝改名？',function(){
            var str = this.node.getChildByName('editBoxName').getComponent(cc.EditBox).string;
            if(str!=ag.gameLayer._player._data.name && str.length>=2 && str.length<=8 && str.indexOf(' ')==-1 && str.indexOf('\n')==-1 && str.indexOf('%')==-1){
                ag.jsUtil.request(this.node,'changeNameByGold',str,function (data) {
                    if(data.code==0) {
                        ag.userInfo._accountData.name = str;
                        ag.gameLayer._player._data.name = str;
                        ag.gameLayer._player.resetName();
                        ag.jsUtil.showText(this.node, '名字更新成功!');
                    }else if(data.code==1) {
                        ag.jsUtil.showText(this.node, '账号不存在！');
                    }else if(data.code==2) {
                        ag.jsUtil.showText(this.node, '名字已经存在');
                    }else if(data.code==3) {
                        ag.jsUtil.showText(this.node, '改名需要服务费5000！');
                    }
                }.bind(this));
            }else{
                ag.jsUtil.showText(this.node,'名字至少2个字符且不能有空格换行%！');
            }
        }.bind(this),function(){});
    },


    //商城关闭事件
    buttonEventClose:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },
});
