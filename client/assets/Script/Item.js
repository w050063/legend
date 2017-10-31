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

        var mapData = ag.gameConst._terrainMap[data.mapId];
        var x = data.x-mapData.mapX/2;
        var y = data.y-mapData.mapY/2;
        this.node.setPosition(x*mapData.tileX,y*mapData.tileY);
        //this.node.setScale(2);


        var sprite = this.node.addComponent(cc.Sprite);
        sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame('000'+this._data.mid.substr(1));
    },
});
