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
        back.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.id.substr(1));
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
        back.getChildByName('buttonDispose1').active = bOther;
        this._obj = obj;
        ag.userInfo.operatePuton = ag.userInfo.operatePuton=='left'?'right':'left';
        ag.jsUtil.secondInterfaceAnimation(back);
    },


    buttonDisposeEvent:function(event){
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
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
            delete ag.userInfo._itemMap[id]._data.puton;
            ag.gameLayer.itemEquipToBag(id,puton);
        }else if(label.string=='穿戴'){
            var id = this._obj._data.id;
            var mst = ag.gameConst._itemMst[this._obj._data.mid];
            if(mst.exclusive.indexOf(ag.gameLayer._player.getTypeNum())!=-1){
                var index = ag.gameConst.putonTypes.indexOf(mst.type);
                if((mst.type==4 || mst.type==5) && ag.userInfo.operatePuton=='right')++index;
                cc.log('chuan:'+index);
                ag.agSocket.send("bagItemToEquip",{id:id,puton:index});


                //如果有装备，则切换装备
                var tempId = -1;
                for(var key in ag.userInfo._itemMap){
                    var obj = ag.userInfo._itemMap[key]._data;
                    if(obj.owner==ag.gameLayer._player._data.id && obj.puton==index && mst.type==ag.gameConst._itemMst[obj.mid].type){
                        delete obj.puton;
                        tempId = obj.id;
                        break;
                    }
                }
                ag.userInfo._itemMap[id]._data.puton = index;
                ag.gameLayer._player.addEquip(id);
                ag.gameLayer.itemBagToEquip(id);
                if(tempId!=-1)ag.gameLayer.addItemToBag(obj.id);
            }else{
                var tempArray = ['男战','女战','男法','女法','男道','女道'];
                var str = '此装备限于：';
                for(var i=0;i<mst.exclusive.length;++i){
                    str = str+tempArray[mst.exclusive[i]];
                    if(i!=mst.exclusive.length-1)str = str+'，';
                }
                ag.jsUtil.showText(ag.gameLayer.node,str);
            }
        }
        this.node.active = false;
    },
});
