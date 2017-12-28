/**
 * Created by bot.su on 2017/6/21.
 * 道具详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
    },


    show:function(){
        this.node.active = true;
        var node = cc.find('Canvas/nodeBag/bag');
        node.removeFromParent(false);
        node.setPosition(237,0);
        this.node.addChild(node);
        this._bagNode = node;
    },


    //关闭
    buttonEventClose:function(){
        this.node.active = false;
        this._bagNode.removeFromParent(false);
        this._bagNode.setPosition(-254,30);
        cc.find('Canvas/nodeBag').addChild(this._bagNode);
        this._bagNode = undefined;
    },
});
