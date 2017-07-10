/**
 * Created by bot.su on 2017/6/21.
 * 常用工具
 */


module.exports = {
    init: function () {
        this._actionArray = [];
        this._scheduleArray = [];
        this._nowTime = 0;
        setInterval(function () {
            var curTime = new Date().getTime()/1000;
            var elapse = curTime-this._nowTime;
            for(var i=this._actionArray.length-1;i>=0;--i){
                if(this._actionArray[i].endTime<=this._nowTime){
                    this._actionArray[i].callback(elapse);
                    this._actionArray.splice(i,1);
                }
            }


            for(var i=0;i<this._scheduleArray.length;++i){
                this._scheduleArray[i].time += elapse;
                if(this._scheduleArray[i].time>=this._scheduleArray[i].interval){
                    this._scheduleArray[i].callback(elapse);
                }
            }
            this._nowTime = curTime;
        }.bind(this),1);
    },
    

    //第一个参数是对象,可以传入数字和函数
    runAction: function (node,delay,callback) {
        if(delay<0.016)delay = 0.016;
        this._actionArray.push({node:node,endTime:this._nowTime+delay,callback:callback});
    },
    
    
    //启动定时器
    schedule:function (node,interval,callback) {
        if(interval<0.016)interval = 0.016;
        this._scheduleArray.push({node:node,interval:interval,time:0,callback:callback});
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
