/**
 * Created by bot.su on 2017/6/21.
 * 道具详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.node.active = false;
        }.bind(this));
    },



    setOfficeByRole:function(role){
        if(!role)role = this._role;
        var back = this.node.getChildByName('back');
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.find('Canvas/nodeBag/nodePanel/equip0/office').getComponent(cc.Sprite).spriteFrame.clone();


        var office = role.getOfficeIndex();
        var str = '当前称号:'+ag.gameConst.officeName[office]
            +'\n攻击:'+ag.gameConst.officeHurt[office]
            +'\n防御:'+ag.gameConst.officeDefense[office]
            +'\n当前进度:'+role._data.office;



        back.getChildByName('labelContent').getComponent(cc.Label).string = str;
        var buttonNode = back.getChildByName('buttonDispose');
        buttonNode.x = 0;
        var label = buttonNode.getChildByName('label').getComponent(cc.Label);
        label.string = '确定';
        back.getChildByName('buttonDispose1').active = false;
        ag.jsUtil.secondInterfaceAnimation(back);
    },

    setWingByRole:function(role){
        if(!role)role = this._role;
        var back = this.node.getChildByName('back');
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame('001600');

        var wing = role.getWingIndex();
        var str = '神羽' + wing + '阶'
            +'\n攻击:'+ag.gameConst.wingHurt[wing]
            +'\n防御:'+ag.gameConst.wingDefense[wing]
            +'\n当前进度:'+role._data.wing;



        back.getChildByName('labelContent').getComponent(cc.Label).string = str;
        var buttonNode = back.getChildByName('buttonDispose');
        buttonNode.x = 0;
        var label = buttonNode.getChildByName('label').getComponent(cc.Label);
        label.string = '确定';
        back.getChildByName('buttonDispose1').active = false;
        ag.jsUtil.secondInterfaceAnimation(back);
    },


    setItemIdByWharehouse:function(id){
        var obj = ag.userInfo._itemMap[id];
        var mst = ag.gameConst._itemMst[obj._data.mid];
        var back = this.node.getChildByName('back');
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
        back.getChildByName('labelContent').getComponent(cc.Label).string = ag.gameLayer.getItemBagShow(mst);
        var buttonNode = back.getChildByName('buttonDispose');
        buttonNode.x = 0;
        var label = buttonNode.getChildByName('label').getComponent(cc.Label);
        label.string = obj._data.puton==ag.gameConst.putonBag?'存储':'取出';
        var label1 = back.getChildByName('buttonDispose1').getChildByName('label').getComponent(cc.Label);
        back.getChildByName('buttonDispose1').active = false;
        this._obj = obj;
        ag.jsUtil.secondInterfaceAnimation(back);
    },


    setItemIdByDeal:function(id){
        var obj = ag.userInfo._itemMap[id];
        var mst = ag.gameConst._itemMst[obj._data.mid];
        var back = this.node.getChildByName('back');
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
        back.getChildByName('labelContent').getComponent(cc.Label).string = ag.gameLayer.getItemBagShow(mst);
        var buttonNode = back.getChildByName('buttonDispose');
        buttonNode.x = 0;
        var label = buttonNode.getChildByName('label').getComponent(cc.Label);
        label.string = ag.gameLayer._deal.getInMyDealDataArray(id)?'确定':'放入';
        var label1 = back.getChildByName('buttonDispose1').getChildByName('label').getComponent(cc.Label);
        back.getChildByName('buttonDispose1').active = false;
        this._obj = obj;
        ag.jsUtil.secondInterfaceAnimation(back);
    },


    setItemMidByDealDest:function(mid){
        var mst = ag.gameConst._itemMst[mid];
        var back = this.node.getChildByName('back');
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
        back.getChildByName('labelContent').getComponent(cc.Label).string = ag.gameLayer.getItemBagShow(mst);
        var buttonNode = back.getChildByName('buttonDispose');
        buttonNode.x = 0;
        var label = buttonNode.getChildByName('label').getComponent(cc.Label);
        label.string = '确定';
        var label1 = back.getChildByName('buttonDispose1').getChildByName('label').getComponent(cc.Label);
        back.getChildByName('buttonDispose1').active = false;
        this._obj = null;
        ag.jsUtil.secondInterfaceAnimation(back);
    },


    setItemId:function(id){
        var obj = ag.userInfo._itemMap[id];
        var mst = ag.gameConst._itemMst[obj._data.mid];
        var back = this.node.getChildByName('back');
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
        back.getChildByName('labelContent').getComponent(cc.Label).string = ag.gameLayer.getItemBagShow(mst);
        var str = '确定';
        var bOther = false;
        if(obj._data.owner==ag.gameLayer._player._data.id){
            if(obj._data.puton>=0){
                str = '卸下';
            }else{
                str = '丢弃';
                bOther = true;
            }
        }
        var buttonNode = back.getChildByName('buttonDispose');
        buttonNode.x = bOther?-60:0;
        var label = buttonNode.getChildByName('label').getComponent(cc.Label);
        label.string = str;
        var label1 = back.getChildByName('buttonDispose1').getChildByName('label').getComponent(cc.Label);
        back.getChildByName('buttonDispose1').active = bOther;
        this._obj = obj;
        ag.userInfo.operatePuton = ag.userInfo.operatePuton=='left'?'right':'left';
        ag.jsUtil.secondInterfaceAnimation(back);
    },


    buttonDisposeEvent:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var buttonNode = event.target;
        var label = buttonNode.getChildByName('label').getComponent(cc.Label);
        if(label.string=='确定'){
        }else if(label.string=='丢弃'){
            var id = this._obj._data.id;
            ag.agSocket.send("bagItemToGround",id);
            ag.userInfo._itemMap[id]._data.owner = undefined;
            ag.gameLayer.delItemFormBag(id);
        }else if(label.string=='卸下'){
            var id = this._obj._data.id;
            var mst = ag.gameConst._itemMst[this._obj._data.mid];
            ag.agSocket.send("equipItemToBag",id);
            var puton = ag.userInfo._itemMap[id]._data.puton;
            ag.userInfo._itemMap[id]._data.puton = ag.gameConst.putonBag;
            ag.gameLayer.itemEquipToBag(id,puton);
            ag.gameLayer.addDirty(ag.gameLayer._player._data.id);
        }else if(label.string=='穿戴'){
            var id = this._obj._data.id;
            var mst = ag.gameConst._itemMst[this._obj._data.mid];
            if(ag.gameLayer._player._data.come>=ag.gameConst.equipCome[mst.level]){
                if(mst.exclusive.indexOf(ag.gameLayer._player.getTypeNum())!=-1){
                    var index = ag.gameConst.putonTypes.indexOf(mst.type);
                    if((mst.type==4 || mst.type==5) && ag.userInfo.operatePuton=='right')++index;
                    ag.agSocket.send("bagItemToEquip",{id:id,puton:index});


                    //如果有装备，则切换装备
                    var tempId = ag.gameLayer.getPlayerItemId(index);
                    if(tempId)ag.userInfo._itemMap[tempId]._data.puton = ag.gameConst.putonBag;
                    ag.userInfo._itemMap[id]._data.puton = index;
                    ag.gameLayer.itemBagToEquip(id);
                    if(tempId)ag.gameLayer.addItemToBag(tempId);
                    ag.gameLayer.addDirty(ag.gameLayer._player._data.id);
                }else{
                    var tempArray = ['男战','女战','男法','女法','男道','女道'];
                    var str = '此装备限于：';
                    for(var i=0;i<mst.exclusive.length;++i){
                        str = str+tempArray[mst.exclusive[i]];
                        if(i!=mst.exclusive.length-1)str = str+'，';
                    }
                    ag.jsUtil.showText(ag.gameLayer.node,str);
                }
            }else{
                ag.jsUtil.showText(ag.gameLayer.node,'此装备需要转生'+ag.gameConst.equipCome[mst.level]+'级！');
            }
        }else if(label.string=='存储'){
            var index = ag.gameLayer._wharehouseArray.indexOf(-1);
            if(index!=-1) {
                this._obj._data.puton = ag.gameConst.putonWharehouse;
                ag.agSocket.send("itemBagToWharehouse", this._obj._data.id);
                ag.gameLayer.itemBagToWharehouse(this._obj._data.id);
            }
        }else if(label.string=='取出'){
            var index = ag.gameLayer._bagArray.indexOf(-1);
            if(index!=-1) {
                this._obj._data.puton = ag.gameConst.putonBag;
                ag.agSocket.send("itemWharehouseToBag", this._obj._data.id);
                ag.gameLayer.itemWharehouseToBag(this._obj._data.id);
            }
        }else if(label.string=='放入'){
            if(ag.gameLayer._deal._dealDataArray1.length<10){
                ag.gameLayer._deal.itemBagToDeal(this._obj._data.id);
            }else{
                ag.jsUtil.showText(ag.gameLayer.node,"一次最多交易10个装备");
            }
        }
        this.node.active = false;
    },
});
