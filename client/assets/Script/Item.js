/**
 * Created by bot.su on 2017/6/21.
 * 道具
 */


cc.Class({
    extends: cc.Component,
    properties: {},

    onDestroy:function(){
        if(cc.isValid(this._nameNode))this._nameNode.destroy();
    },

    onLoad: function () {},

    init:function (data) {
        this._data = data;
        var mst = ag.gameConst._itemMst[data.mid];
        this.node.setPosition(ag.gameLayer._player.getTruePosition(cc.p(this._data.x,this._data.y)));
        var sprite = this.node.addComponent(cc.Sprite);
        sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+this._data.mid.substr(1));

        var node = new cc.Node();
        node.setPosition(this.node.getPosition());
        var tips = node.addComponent(cc.Label);
        tips.fontSize = 14;
        if(mst.level<=2){
            node.color = cc.color(255,255,255);
        }else if(mst.level==3){
            node.color = cc.color(255,0,0);
        }else if(mst.level==4){
            node.color = cc.color(255,128,0);
        }else if(mst.level==5){
            node.color = cc.color(255,255,0);
        }else if(mst.level==6){
            node.color = cc.color(0,255,0);
        }else if(mst.level==7){
            node.color = cc.color(0,255,255);
        }else if(mst.level==8){
            node.color = cc.color(0,0,255);
        }else if(mst.level==9){
            node.color = cc.color(128,0,255);
        }
        tips.string = mst.name;

        var outline = node.addComponent(cc.LabelOutline);
        outline.color = cc.color(0,0,0);
        outline.width = 1;

        ag.gameLayer._nameMap.node.addChild(node);
        this._nameNode = node;
    },
});
