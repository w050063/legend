/**
 * Created by bot.su on 2017/6/21.
 * 道具详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
    },


    show:function(name){
        this.node.active = true;
        var node = cc.find('Canvas/nodeBag/bag');
        node.removeFromParent(false);
        node.setPosition(237,0);
        this.node.addChild(node);
        this._bagNode = node;

        this.node.getChildByName("labelName1").getComponent(cc.Label).string = name;
        this.node.getChildByName("labelGold1").getComponent(cc.Label).string = "0";
        this.node.getChildByName("labelName2").getComponent(cc.Label).string = ag.gameLayer._player._data.name;
        this.node.getChildByName("editBoxGold2").getComponent(cc.EditBox).string = "0";


        this._dealDataArray0 = [];
        this._dealDataArray1 = [];
        this._lastGold = 0;
    },


    close:function(){
        if(this.node.active){
            this.node.active = false;
            this._bagNode.removeFromParent(false);
            this._bagNode.setPosition(-254,30);
            cc.find('Canvas/nodeBag').addChild(this._bagNode);
            this._bagNode = undefined;

            //清空界面数据
            this.node.getChildByName('labelGold1').getComponent(cc.Label).string = '0';
            this.node.getChildByName('editBoxGold2').getComponent(cc.EditBox).string = '0';
            for(var i=0;i<this._dealDataArray0.length;++i){
                this._dealDataArray0[i].sprite.node.removeFromParent();
            }
            for(var i=0;i<this._dealDataArray1.length;++i){
                this._dealDataArray1[i].sprite.node.removeFromParent();
                ag.gameLayer.addItemToBag(this._dealDataArray1[i].id);
            }
            this._dealDataArray0 = [];
            this._dealDataArray1 = [];
            this._lastGold = 0;
        }
    },


    //关闭
    buttonEventClose:function(){
        this.close();
        ag.agSocket.send("delDeal",{});
    },



    //确认交易
    buttonEventOK:function(){
        ag.agSocket.send("okDeal",{});
    },


    getInMyDealDataArray:function(id){
        for(var i=0;i<this._dealDataArray1.length;++i){
            if(this._dealDataArray1[i].id==id){
                return this._dealDataArray1[i];
            }
        }
        return null;
    },


    //背包道具到交易框
    itemBagToDeal:function(id){
        var index = -1;
        for(var i=0;i<ag.gameLayer._bagArray.length;++i){
            if(ag.gameLayer._bagArray[i].id==id){
                index = i;
                break;
            }
        }
        if(index!=-1){
            var sprite = ag.gameLayer._bagArray[index];
            ag.gameLayer._bagArray[index] = -1;

            sprite.node.removeFromParent(false);
            var startPos = cc.p(-72,16);
            var disPos = cc.p(36,28);
            var index2 = this._dealDataArray1.length;
            sprite.node.setPosition(startPos.x+disPos.x*(index2%5),startPos.y-disPos.y*Math.floor(index2/5));
            this.node.getChildByName('deal1').addChild(sprite.node);
            this._dealDataArray1.push({id:id,sprite:sprite});
            ag.agSocket.send("dealAddItem", id);
        }
    },


    //增加对方的道具
    dealAddItem:function(mid){
        var mst = ag.gameConst._itemMst[mid];
        var sprite = new cc.Node().addComponent(cc.Sprite);
        sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(mst.icon);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        var startPos = cc.p(-72,16);
        var disPos = cc.p(36,28);
        var index2 = this._dealDataArray0.length;
        sprite.node.setPosition(startPos.x+disPos.x*(index2%5),startPos.y-disPos.y*Math.floor(index2/5));
        this.node.getChildByName('deal0').addChild(sprite.node);
        this._dealDataArray0.push({id:0,sprite:sprite});
        sprite.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            ag.musicManager.playEffect("resources/voice/button.mp3");
            cc.find('Canvas/nodeItemInfo').active = true;
            cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemMidByDealDest(mid);
        }.bind(this));
    },


    //增加对方元宝
    dealAddGold:function(gold){
        this.node.getChildByName('labelGold1').getComponent(cc.Label).string = ''+gold;
    },



    //元宝回车信息
    editBoxConfirm: function (sender) {
        var gold = parseInt(sender.string);
        if(gold>this._lastGold && gold<=ag.gameLayer._player._data.gold){
            this._lastGold = gold;
            ag.agSocket.send("dealAddGold", {gold:gold});
        }else{
            sender.string = ''+this._lastGold;
        }
    },
});
