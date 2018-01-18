/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */

cc.Class({
    extends: cc.Component,
    properties: {},

    init: function () {
        if(!this._bInit){
            this._bInit = true;
            this.totalCount = 0; // how many items we need for the whole list
            this.spacing = 10; // space between each item
            this.scrollView = this.node.getComponent(cc.ScrollView);
            this.content = this.scrollView.content;
            this.itemTemplate = this.content.getChildByName('item');
            this.itemTemplate.active = false;
            this.items = []; // array to store spawned items
            this.lastContentPosY = 0; // use this variable to detect if we are scrolling up or down
            this._callback = null;
            this.scrollView.node.on('scrolling', this.scrolling, this);
        }
    },

    setCount:function(num){
        this.init();
        this.totalCount = num;
    },

    setSpace:function(num){
        this.init();
        this.spacing = num;
    },

    setCallback:function(callback){
        this.init();
        this._callback = callback;
    },

    reload:function(){
        var i=0;
        this.init();
        for(i=0;i<this.items.length;++i){
            this.items[i].destroy();
        }
        this.items = [];
        this.content.height = this.totalCount==0?0:(this.totalCount * (this.itemTemplate.height + this.spacing) - this.spacing);
        if(this.content.height<=this.node.height)this.content.height = this.node.height+1;
        var realCount = 2;
        while ((realCount-1)*(this.itemTemplate.height + this.spacing)<this.node.height)++realCount;
        if(realCount>this.totalCount)realCount = this.totalCount;
        for(i = 0; i < realCount; ++i) { // spawn items, we only need to do this once
            var item = cc.instantiate(this.itemTemplate);
            this.content.addChild(item);
            item.active = true;
            this.items.push(item);
            item.setPosition(0, -item.height * (0.5 + i) - this.spacing * i);
            item._index = i;
            if (this._callback)this._callback(item, item._index);
        }
    },

    scrolling: function() {
        var len = this.items.length;
        if(len==0)return;
        if (this.scrollView.content.y < this.lastContentPosY) {
            var item = this.items[this.items.length-1];
            var worldPos = item.parent.convertToWorldSpaceAR(item.position);
            var viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
            if (viewPos.y + item.height/2 < -this.node.height/2 &&  this.items[0]._index>0) {
                item.y = this.items[0].y+item.height+this.spacing;
                item._index = this.items[0]._index-1;
                if(this._callback)this._callback(item,item._index);
                this.items.pop();
                this.items.unshift(item);
            }
        }else{
            var item = this.items[0];
            var worldPos = item.parent.convertToWorldSpaceAR(item.position);
            var viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
            if (viewPos.y - item.height/2 > this.node.height/2 && this.items[len-1]._index+1<this.totalCount) {
                item.y = this.items[len-1].y-item.height-this.spacing;
                item._index = this.items[len-1]._index+1;
                if(this._callback)this._callback(item,item._index);
                this.items.shift();
                this.items.push(item);
            }
        }
        this.lastContentPosY = this.scrollView.content.y;
    },
});
