/**
 * Created by bot.su on 2017/5/1.
 * 自定义spine
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (name) {
        this._willDoArray = [];
        this._name = name;
        cc.loader.loadRes(name,sp.SkeletonData,function (err,data) {
            //加载完成
            var node = new cc.Node();
            node.x=0;
            node.y=0;
            node.scale = 0.25;
            this._spine = node.addComponent(sp.Skeleton);
            this._spine.skeletonData = data;
            this.node.addChild(node);
            for(var i=0;i<this._willDoArray.length;++i){
                this._willDoArray[i]();
            }
        }.bind(this));
    },

    setMixEx:function(anim1,anim2,mixTime) {
        if(this._spine){
            this._spine.setMix(anim1, anim2, mixTime);
            this._spine.setMix(anim2, anim1, mixTime);
        }else{
            this._willDoArray.push(this.setMixEx.bind(this,anim1,anim2,mixTime));
        }
    },


    //加载完成回调
    addLoadOverListener:function(func){
        this._loadOverListener = func;
    },


    //设置动画
    setTimeScale: function (scale) {
        if(this._spine){
            this._spine.setTimeScale(scale);
        }else{
            this._willDoArray.push(this.setTimeScale.bind(this,scale));
        }
    },




    //设置动画
    addAnimation: function (trackIndex, name, loop) {
        if(this._spine){
            this._spine.addAnimation(trackIndex, name, loop);
        }else{
            this._willDoArray.push(this.addAnimation.bind(this,trackIndex, name, loop));
        }
    },

    //设置动画
    setAnimation: function (trackIndex, name, loop) {
        if(this._spine){
            this._spine.setAnimation(trackIndex, name, loop);
        }else{
            this._willDoArray.push(this.setAnimation.bind(this,trackIndex, name, loop));
        }
    },
    //设置动画回调
    setCompleteListener: function (funcallback) {
        if(this._spine){
            this._spine.setCompleteListener(funcallback);
        }else{
            this._willDoArray.push(this.setCompleteListener.bind(this,funcallback));
        }
    },
    //设置两个动画衔接
    setMix:function(fromAnimation, toAnimation, duration) {
        if(this._spine){
            this._spine.setMix(fromAnimation, toAnimation, duration);
        }else{
            this._willDoArray.push(this.setMix.bind(this,fromAnimation, toAnimation, duration));
        }
    },

    //设置完成监听
    setEndListener: function (func) {
        if(this._spine){
            this._spine.setEndListener(func);
        }else{
            this._willDoArray.push(this.setEndListener.bind(this,func));
        }
    },

    setSpineDim:function(){//变暗
        if(this._spine){
            this._spine.setColor(cc.color(100, 100, 100));
        }else{
            this._willDoArray.push(this.setSpineDim.bind(this));
        }
    },
    normalSpineDim:function(){//恢复
        if(this._spine){
            this._spine.setColor(cc.color(255, 255, 255));
        }else{
            this._willDoArray.push(this.normalSpineDim.bind(this));
        }
    },
    pauseSpineAnimation:function(){//暂停
        this.setTimeScale(0);
    },
    resumeSpineAnimation:function(){//恢复
        this.setTimeScale(1);
    },
    stopSpineAnimation:function(){//停止动画
        this.setTimeScale(0);
    },
    //获得槽坐标
    doForSlotPosition: function (func) {
        this._slotPositionFunc = func;
    },
    findSlot:function(_slotName,sprite){
        sprite.retain()
        if(this._spine){
            //if(this.getChildByTag(10000)){
            //    this.removeChildByTag(10000);
            //}
            this.addChild(sprite);
            sprite.release();
            var spine =  this._spine;
            sprite.schedule(function (dt) {
                var node  = this.node;
                var slotName = this.slotName;
                var tempSlot =spine.findSlot(slotName);
                var bone = tempSlot.bone;
                var x = 1;
                var y = 1;
                while (bone) {
                    x = x * bone.scaleX;
                    y = y * bone.scaleY;
                    bone = bone.parent;
                }
                node.setPosition(cc.p(tempSlot.bone.worldX, tempSlot.bone.worldY));
                node.setScaleX(x);
                node.setScaleY(y);
                //node.setColor(cc.color(tempSlot.r*255,tempSlot.g*255,tempSlot.b*255));
                node.setOpacity(tempSlot.a*255);
            }.bind({self:this,node:sprite,slotName:_slotName}));
        }else{
            this._willDoArray.push(this.findSlot.bind(this,_slotName,sprite));
        }

    },

    findBone:function(boneName){
        if(this._spine){
            var bone = this._spine.findBone(boneName);
            return bone;
        }else{
            this._willDoArray.push(this.findSlot.bind(this,boneName));
        }
    },
});


/*
var CukeSpine = cc.Node.extend({
    _spine:null,
    _willDoArray:null,
    _name:"",
    _slotPositionFunc:null,
    ctor:function (name) {
        this._super();
        this._willDoArray = [];
        this._name = name;
        var array = JsUtil.getSpineResource([name]);
        var cache = cc.loader.cache;
        if(cache[array[0]] && cache[array[1]] && cache[array[2]]){
            this.loadOver();
        }else{
            cc.loader.load(array,function (result, count, loadedCount) {}, function () {
                this.loadOver();
            }.bind(this));
        }
    },

    //加载完成
    loadOver:function(){
        this._spine = new sp.SkeletonAnimation(this._name+".json",this._name+".atlas");
        this.addChild(this._spine);
        for(var i=0;i<this._willDoArray.length;++i){
            this._willDoArray[i]();
        }
        if(this._slotPositionFunc){
            this._slotPositionFunc();
        }
        if(this._loadOverListener){
            this.runAction(cc.sequence(cc.delayTime(0.01),cc.callFunc(this._loadOverListener)));
        }
    },


    //加载完成回调
    addLoadOverListener:function(func){
        this._loadOverListener = func;
    },


    //设置动画
    setTimeScale: function (scale) {
        if(this._spine){
            this._spine.setTimeScale(scale);
        }else{
            this._willDoArray.push(this.setTimeScale.bind(this,scale));
        }
    },




    //设置动画
    addAnimation: function (trackIndex, name, loop) {
        if(this._spine){
            this._spine.addAnimation(trackIndex, name, loop);
        }else{
            this._willDoArray.push(this.addAnimation.bind(this,trackIndex, name, loop));
        }
    },

    //设置动画
    setAnimation: function (trackIndex, name, loop) {
        if(this._spine){
            this._spine.setAnimation(trackIndex, name, loop);
        }else{
            this._willDoArray.push(this.setAnimation.bind(this,trackIndex, name, loop));
        }
    },
    //设置动画回调
    setCompleteListener: function (funcallback) {
        if(this._spine){
            this._spine.setCompleteListener(funcallback);
        }else{
            this._willDoArray.push(this.setCompleteListener.bind(this,funcallback));
        }
    },
    //设置两个动画衔接
    setMix:function(fromAnimation, toAnimation, duration) {
        if(this._spine){
            this._spine.setMix(fromAnimation, toAnimation, duration);
        }else{
            this._willDoArray.push(this.setMix.bind(this,fromAnimation, toAnimation, duration));
        }
    },

    //设置完成监听
    setEndListener: function (func) {
        if(this._spine){
            this._spine.setEndListener(func);
        }else{
            this._willDoArray.push(this.setEndListener.bind(this,func));
        }
    },

    setSpineDim:function(){//变暗
        if(this._spine){
            this._spine.setColor(cc.color(100, 100, 100));
        }else{
            this._willDoArray.push(this.setSpineDim.bind(this));
        }
    },
    normalSpineDim:function(){//恢复
        if(this._spine){
            this._spine.setColor(cc.color(255, 255, 255));
        }else{
            this._willDoArray.push(this.normalSpineDim.bind(this));
        }
    },    
    pauseSpineAnimation:function(){//暂停
        this.setTimeScale(0);
    },    
    resumeSpineAnimation:function(){//恢复
        this.setTimeScale(1);
    },
    stopSpineAnimation:function(){//停止动画
        this.setTimeScale(0);
    },
    //获得槽坐标
    doForSlotPosition: function (func) {
        this._slotPositionFunc = func;
    },
    findSlot:function(_slotName,sprite){
        sprite.retain()
        if(this._spine){
            //if(this.getChildByTag(10000)){
            //    this.removeChildByTag(10000);
            //}
            this.addChild(sprite);
            sprite.release();
            var spine =  this._spine;
            sprite.schedule(function (dt) {
                var node  = this.node;
                var slotName = this.slotName;
                var tempSlot =spine.findSlot(slotName);
                var bone = tempSlot.bone;
                var x = 1;
                var y = 1;
                while (bone) {
                    x = x * bone.scaleX;
                    y = y * bone.scaleY;
                    bone = bone.parent;
                }
                node.setPosition(cc.p(tempSlot.bone.worldX, tempSlot.bone.worldY));
                node.setScaleX(x);
                node.setScaleY(y);
                //node.setColor(cc.color(tempSlot.r*255,tempSlot.g*255,tempSlot.b*255));
                node.setOpacity(tempSlot.a*255);
            }.bind({self:this,node:sprite,slotName:_slotName}));
        }else{
            this._willDoArray.push(this.findSlot.bind(this,_slotName,sprite));
        }

    },

    findBone:function(boneName){
        if(this._spine){
            var bone = this._spine.findBone(boneName);
            return bone;
        }else{
            this._willDoArray.push(this.findSlot.bind(this,boneName));
        }
    },
});
*/