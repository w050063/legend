/**
 * 常用工具
 */
var CukeAni = require("CukeAni");
module.exports={
    getEffect:function(father,name,count,zorder,interval){
        return this.getNode(father,name,count,zorder,interval,function(sender){this.put(sender.node);}.bind(this));
    },


    getNode:function(father,name,count,zorder,interval,callback){
        var node = this.get(name,count);
        father.addChild(node,zorder);
        var ani = node.getComponent(CukeAni);
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
                var ani = node.getComponent(CukeAni);
                ani.resume();
                return node;
            }
        }

        var node = new cc.Node();
        var ani = node.addComponent(CukeAni);
        ani.init(str,n);
        return node;
    },

    //将一个用完的动画节点放回池中
    put : function(node){
        if(node && node._cukeName && this._clipPoolArray.length<this._clipPoolMaxCount){
            //node.retain();
            var ani = node.getComponent(CukeAni);
            ani.pause();
            ani.setFinishedCallback(null);
            node.setScale(1);
            node.setColor(cc.color(255,255,255));
            node.removeFromParent(false);
            this._clipPoolArray.push(node);
        }
    }
};
