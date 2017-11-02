/**
 * Created by bot.su on 2017/6/21.
 * 道具
 */


cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {},

    init:function (data) {
        this._data = data;
        this.node.setPosition(ag.gameLayer._player.getTruePosition(cc.p(this._data.x,this._data.y)));
        var sprite = this.node.addComponent(cc.Sprite);
        sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame('000'+this._data.mid.substr(1));
    },
});
