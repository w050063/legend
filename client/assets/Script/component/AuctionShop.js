/**
 * Created by bot.su on 2017/6/21.
 * 商店详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
        //this._selectIndex = 0;
        this._maxCountByPage = 9;
        this._pageIndex = 0;
        this._dataArray = [];
        this._dataMap = {};
        this._itemId = '';
        this._lineId = '';
    },


    //商城物品事件
    show:function(event){
        this.node.active = true;
        ag.agSocket.send("requestauctionShop",{});
    },


    refresh:function(map){
        this._dataArray = [];
        this._dataMap = map;
        for(var key in map){
            this._dataArray.push(map[key]);
        }
        this._dataArray.sort(function(a,b){
            return b.create_time - a.create_time;
        });
        this.gotoPage(0);
    },


    gotoPage:function(cur){
        this._lineId = '';
        this._pageIndex = cur;
        cc.find('Canvas/nodeAuctionShop/spriteBack/labelPageIndex').getComponent(cc.Label).string = ''+(this._pageIndex+1);
        var father = this.node.getChildByName('spriteBack');
        for(var i=0;i<this._maxCountByPage;++i){
            var tempNode = cc.find('Canvas/nodeAuctionShop/spriteBack/buttonAuctionShopItem'+i);
            var index = this._pageIndex*this._maxCountByPage+i;
            if(index<this._dataArray.length){
                tempNode.active = true;
                tempNode.color = cc.color(255,255,255);
                tempNode.getChildByName('labelItemName').getComponent(cc.Label).string = ag.gameConst._itemMst[this._dataArray[index].mid].name;
                tempNode.getChildByName('labelOwner').getComponent(cc.Label).string = this._dataArray[index].name;
                tempNode.getChildByName('labelPrice').getComponent(cc.Label).string = ''+this._dataArray[index].price+'元宝';
                tempNode.getChildByName('labelTime').getComponent(cc.Label).string = ag.jsUtil.getTimestamp(this._dataArray[index].create_time);
            }else{
                tempNode.active = false;
            }
        }
    },


    left:function(){
        if(this._pageIndex>0){
            this.gotoPage(--this._pageIndex);
        }
    },

    right:function(){
        if(this._pageIndex<Math.floor(this._dataArray.length/this._maxCountByPage)){
            this.gotoPage(++this._pageIndex);
        }
    },

    //商城关闭事件
    buttonEventClose:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },


    //选择行按钮
    buttonEventSelectLine:function(event){
        var index = parseInt(event.target.name.substr(21));
        this._lineId = this._dataArray[this._pageIndex * this._maxCountByPage + index].id;
        for(var i=0;i<this._maxCountByPage;++i){
            var tempNode = cc.find('Canvas/nodeAuctionShop/spriteBack/buttonAuctionShopItem'+i);
            tempNode.color = i==index?cc.color(255,0,0):cc.color(255,255,255);
        }
    },


    //购买按钮
    buttonEventBuy:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(!this._lineId){
            ag.jsUtil.showText(this.node,'请选择一个道具！');
        }else if(!(ag.gameLayer._player._data.gold>=this._dataMap[this._lineId].price
            || ag.gameLayer._player._data.name==this._dataMap[this._lineId].name)){
            ag.jsUtil.showText(this.node,'没钱寸步难行！');
        }else{
            ag.jsUtil.alertOKCancel(this.node,'确认购买？',function(){
                ag.agSocket.send("buyAuctionShop",{id:this._lineId});
            }.bind(this),function(){}.bind(this));
        }
    },


    //出售按钮
    buttonEventSell:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var father = cc.find('Canvas/nodeAuctionShop/nodeSell');
        father.active = true;

        var father2 = cc.find('Canvas/nodeAuctionShop/nodeSell/spriteBack');
        father2.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("firstLayer/circle",cc.SpriteFrame);
        father2.getChildByName('labelName').getComponent(cc.Label).string =  '物品名称';
        this._itemId = '';

        var node = cc.find('Canvas/nodeBag/bag');
        node.removeFromParent(false);
        node.setPosition(237,0);
        father.addChild(node);
        this._bagNode = node;
    },


    //背包关闭
    buttonEventBagClose:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var father = cc.find('Canvas/nodeAuctionShop/nodeSell');
        father.active = false;

        this._bagNode.removeFromParent(false);
        this._bagNode.setPosition(-254,30);
        cc.find('Canvas/nodeBag').addChild(this._bagNode);
        this._bagNode = undefined;
    },


    //选择一件道具
    selectItem:function(id){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var obj = ag.userInfo._itemMap[id];
        var mst = ag.gameConst._itemMst[obj._data.mid];
        if(ag.gameLayer._player._data.level>=45 && mst.level>=6){
            var father = cc.find('Canvas/nodeAuctionShop/nodeSell/spriteBack');
            father.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
            father.getChildByName('labelName').getComponent(cc.Label).string =  mst.name;
            this._itemId = id;
        }else{
            ag.jsUtil.showText(this.node,'限制玩家45级以上，6级以上装备！');
        }
    },


    //选择一件道具
    buttonEventOK:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var father = cc.find('Canvas/nodeAuctionShop/nodeSell/spriteBack');
        var price = parseInt(father.getChildByName('editBoxPrice').getComponent(cc.EditBox).string);
        var item = ag.userInfo._itemMap[this._itemId];
        if(item && item._data.puton == ag.gameConst.putonBag && item._data.owner==ag.gameLayer._player._data.id && typeof price=='number' && price>0 && price<=1000000){
            item._data.puton = ag.gameConst.putonAuctionShop;
            ag.gameLayer.delItemFormBag(this._itemId);
            father.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("firstLayer/circle",cc.SpriteFrame);
            father.getChildByName('labelName').getComponent(cc.Label).string =  '物品名字';
            father.getChildByName('editBoxPrice').getComponent(cc.EditBox).string = '';
            ag.agSocket.send("sellToAuctionShop",{id:this._itemId,price:price});
            delete ag.userInfo._itemMap[this._itemId];
            this._itemId = '';
        }else{
            ag.jsUtil.showText(this.node,'输入信息有误！');
        }
    },
});
