/**
 * Created by bot.su on 2017/6/21.
 * 动画缓存封装
 */


var AGAni = require("AGAni");

module.exports={
    getEffect:function(father,name,count,zorder,interval){
        return this.getNode(father,name,count,zorder,interval,function(sender){this.put(sender.node);}.bind(this));
    },


    getNode:function(father,name,count,zorder,interval,callback){
        var node = this.get(name,count);
        father.addChild(node,zorder);
        var ani = node.getComponent(AGAni);
        ani.setInterval(interval);
        ani.setFinishedCallback(callback);
        return node;
    },

    get : function(str,n){
        if(!this._clipPoolArray){
            this._clipPoolArray = [];
            this._clipPoolMaxCount = 100;
        }
        for(var i=0;i<this._clipPoolArray.length;++i){
            var node = this._clipPoolArray[i];
            if(node._cukeName==str){
                //node.release();
                this._clipPoolArray.splice(i,1);
                var ani = node.getComponent(AGAni);
                ani.resume();
                return node;
            }
        }

        var node = new cc.Node();
        var ani = node.addComponent(AGAni);
        ani.init(str,n);
        return node;
    },

    //将一个用完的动画节点放回池中
    put : function(node){
        if(node && node._cukeName){
            if(this._clipPoolArray.length>=this._clipPoolMaxCount){
                //var delNode = this._clipPoolArray[i];
                //delNode.release();
                this._clipPoolArray.splice(0,1);
            }
            //node.retain();
            var ani = node.getComponent(AGAni);
            ani.pause();
            ani.setAniPosition(cc.p(0,0));
            ani.setFinishedCallback(null);
            ani.delControll();
            node.setScale(1);
            node.setColor(cc.color(255,255,255));
            node.removeFromParent();
            this._clipPoolArray.push(node);
        }
    }
};
