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


    setItemId:function(id){
        var obj = ag.userInfo._itemMap[id];
        var mst = ag.gameConst._itemMst[obj._data.mid];
        var back = this.node.getChildByName('back');
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame('000'+mst.id.substr(1));
        back.getChildByName('labelContent').getComponent(cc.Label).string = ag.gameLayer.getItemBagShow(mst);
        var str = '确定';
        var bOther = false;
        if(obj._data.owner==ag.gameLayer._player._data.id){
            if(typeof obj._data.puton=='number'){
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
        label1.node.active = bOther;
        this._obj = obj;
        ag.jsUtil.secondInterfaceAnimation(back);
    },


    buttonDisposeEvent:function(event){
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
            delete ag.userInfo._itemMap[id]._data.puton;
            ag.gameLayer.itemEquipToBag(id);
        }else if(label.string=='穿戴'){
            var id = this._obj._data.id;
            var mst = ag.gameConst._itemMst[this._obj._data.mid];
            if(mst.exclusive.indexOf(ag.gameLayer._player.getTypeNum())!=-1){
                var index = ag.gameConst.putonTypes.indexOf(mst.type);
                ag.agSocket.send("bagItemToEquip",{id:id,puton:index});

                for(var key in ag.userInfo._itemMap){
                    var obj = ag.userInfo._itemMap[key]._data;
                    if(obj.owner==ag.gameLayer._player._data.id && obj.puton==index && mst.type==ag.gameConst._itemMst[obj.mid].type){
                        delete obj.puton;
                        break;
                    }
                }
                ag.userInfo._itemMap[id]._data.puton = index;
                ag.gameLayer.itemBagToEquip(id,index);
                ag.gameLayer._player.addEquip(id);


                //this._player.addEquip(mst.id);
                //this.refreshEquip();
            }else{
                ag.jsUtil.showText(this.node,'不能穿戴');
            }
        }
        this.node.active = false;
    },
});
