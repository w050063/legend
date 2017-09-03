/**
 * Created by bot.su on 2017/6/21.
 * 模拟角色信息表
 */


module.exports = ag.class.extend({
    ctor:function () {
        this._infoMap = {};
        for(var i=0;i<10;++i){
            var id = ''+i;
            this._infoMap[id] = {id:id,name:'乱世枭雄',count:0,maxCount:100,time:Math.floor(Math.random()*1200)};
        }
        ag.actionManager.schedule(this,1,function (dt) {
            for(var key in this._infoMap){
                ++this._infoMap[key].time;
                if(this._infoMap[key].time>=1200)this._infoMap[key].time = 0;
            }
        }.bind(this));
    },
    
    
    get:function () {
        var array = [];
        for(var key in this._infoMap){
            array.push(this._infoMap[key]);
        }
        return array;
    },
});
