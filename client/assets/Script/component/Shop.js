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
    buttonEventShopItem:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var tempNode = cc.find('Canvas/nodeShop/spriteBack');
        this._selectIndex = parseInt(event.target.name.substr(6));
        for(var i=0;i<3;++i){
            tempNode.getChildByName('labelName'+i).color = this._selectIndex==i?cc.color(255,0,0):cc.color(255,255,255);
            tempNode.getChildByName('labelComment'+i).active = this._selectIndex==i;
        }
    },


    //商城购买事件
    buttonEventShopBuy:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(ag.gameLayer._player._data.gold>=ag.gameConst.shopPriceArray[this._selectIndex]){
            ag.agSocket.send("shopBuy",{index:this._selectIndex});
        }else{
            ag.jsUtil.showText(self.node,'元宝不足'+ag.gameConst.shopPriceArray[this._selectIndex]+'个！');
        }
    },


    //商城关闭事件
    buttonEventShopClose:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeShop').active = false;
    },


    buttonEventShowCard:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        ag.gameLayer._card.show();
    },
});
