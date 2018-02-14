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


        var tips = ag.jsUtil.getLabelFromName(mst.name);
        var node = tips.node;
        var scale = ag.gameLayer._map.node.getScale();
        node.setPosition(cc.pMult(ag.gameLayer._player.getTruePosition(cc.p(this._data.x,this._data.y)),scale));
        tips.fontSize = 22;
        var color = cc.color(255,255,255);
        if(mst.level==3){
            color = cc.color(255,0,0);
        }else if(mst.level==4){
            color = cc.color(255,128,0);
        }else if(mst.level==5){
            color = cc.color(255,255,0);
        }else if(mst.level==6){
            color = cc.color(0,255,0);
        }else if(mst.level==7){
            color = cc.color(0,255,255);
        }else if(mst.level==8){
            color = cc.color(0,0,255);
        }else if(mst.level==9){
            color = cc.color(128,0,255);
        }
        if(node.color.r!=color.r || node.color.g!=color.g || node.color.b!=color.b)node.color = color;
        var outline = node.addComponent(cc.LabelOutline);
        outline.width = 2;
        if(outline.color.r!=0 || outline.color.g!=0 || outline.color.b!=0)outline.color = cc.color(0,0,0);

        ag.gameLayer._nameMap.node.addChild(node);
        this._nameNode = node;
    },
});
