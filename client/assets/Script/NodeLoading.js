cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this.labelShow = this.node.getChildByName("label_show").getComponent(cc.Label);
        this.labelPercent = this.node.getChildByName("label_percent").getComponent(cc.Label);
        this.labelShow.node.runAction(cc.repeatForever(new cc.Sequence(
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = "资源加载中.";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = "资源加载中..";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = "资源加载中...";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = "资源加载中....";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = "资源加载中.....";}.bind(this)),
            cc.delayTime(0.2),cc.callFunc(function(){this.labelShow.string = "资源加载中......";}.bind(this))
        )));

        //cc.loader.onProgress = function(num, totalNum, item) {
        //    if(this && this.labelPercent){
        //        this.labelPercent.string = "("+Math.floor(num*100/totalNum)+"%)";
        //    }
        //}.bind(this);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
