/**
 * Created by bot.su on 2017/6/21.
 * 常用工具
 */


module.exports = {
    init: function () {
        this._actionArray = [];
        this._scheduleArray = [];
        this._nowTime = new Date().getTime()/1000;
        setInterval(function () {
            var curTime = new Date().getTime()/1000;
            var elapse = curTime-this._nowTime;
            var i=0;


            //防止错误，先遍历所有函数存起来，然后在统一执行，最后重新检索删除。
            var callbacks = [];
            for(i=0;i<this._actionArray.length;++i){
                if(this._actionArray[i].endTime<=this._nowTime){
                    callbacks.push(this._actionArray[i].callback);
                }
            }

            for(i=0;i<callbacks.length;++i)callbacks[i](elapse);

            for(i=this._actionArray.length-1;i>=0;--i){
                if(this._actionArray[i].endTime<=this._nowTime){
                    this._actionArray.splice(i,1);
                }
            }


            for(i=0;i<this._scheduleArray.length;++i){
                this._scheduleArray[i].time += elapse;
                if(this._scheduleArray[i].time>=this._scheduleArray[i].interval){
                    this._scheduleArray[i].time-=this._scheduleArray[i].interval;
                    this._scheduleArray[i].callback(elapse);
                }
            }
            this._nowTime = curTime;
        }.bind(this),1);
    },
    

    //第一个参数是对象,可以传入数字和函数
    runAction: function (node,delay,callback,tag) {
        if(delay<0.016)delay = 0.016;
        if(!tag)tag = 0;
        this._actionArray.push({node:node,endTime:this._nowTime+delay,callback:callback,tag:tag});
    },
    
    
    //启动定时器
    schedule:function (node,interval,callback) {
        if(interval<0.016)interval = 0.016;
        this._scheduleArray.push({node:node,interval:interval,time:0,callback:callback});
    },


    //根据tag删除
    stopActionByTag:function(tag){
        for(var i=this._actionArray.length-1;i>=0;--i){
            if(this._actionArray[i].tag==tag) {
                this._actionArray.splice(i, 1);
            }
        }
    },


    //删除指定对象所有动画
    delAction:function (node) {
        for(var i=this._actionArray.length-1;i>=0;--i){
            if(this._actionArray[i].node==node) {
                this._actionArray.splice(i, 1);
            }
        }
    },


    //删除指定对象所有定时器
    delSchedule:function (node) {
        for(var i=this._scheduleArray.length-1;i>=0;--i){
            if(this._scheduleArray[i].node==node) {
                this._scheduleArray.splice(i, 1);
            }
        }
    },


    //删除指定对象所有元素
    delAll:function (node) {
        this.delAction(node);
        this.delSchedule(node);
    }
};
