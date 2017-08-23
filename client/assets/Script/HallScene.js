/**
 * Created by bot.su on 2017/6/21.
 * 大厅场景
 */

var AGListView = require("AgListView");
cc.Class({
    extends: cc.Component,
    properties: {},

    onLoad: function () {
        this._scrollViewList = cc.find("Canvas/scrollViewList").getComponent(AGListView);
        this._scrollViewList.setCount(50);
        this._scrollViewList.setSpace(10);
        this._scrollViewList.setCallback(function(item,index){
            item.getChildByName('label').getComponent(cc.Label).string = ''+index;
            item.off('touchend');
            item.on('touchend', function () {
                cc.log("Item " + index + ' clicked');
                cc.director.loadScene('FirstLayer',null,function () {});
            }, this);
        });
        this._scrollViewList.reload();
    },
});
