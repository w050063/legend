cc.Class({
    extends: cc.Component,
    properties: {},

    // use this for initialization
    onLoad: function () {
        if(!this._sourceName)this._sourceName = '资源加载中';
        this.labelShow = this.node.getChildByName("label_show").getComponent(cc.Label);
        this.labelPercent = this.node.getChildByName("label_percent").getComponent(cc.Label);
        this.labelShow.node.runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = this._sourceName+".";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = this._sourceName+"..";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = this._sourceName+"...";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = this._sourceName+"....";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = this._sourceName+".....";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = this._sourceName+"......";}.bind(this))
        )));

        //cc.loader.onProgress = function(num, totalNum, item) {
        //    if(this && this.labelPercent){
        //        this.labelPercent.string = "("+Math.floor(num*100/totalNum)+"%)";
        //    }
        //}.bind(this);
    },


    setShow:function (str) {
        this._sourceName = str;
    },
    setPercent:function (str) {
        if(this.labelPercent)this.labelPercent.string = str;
    },
});
