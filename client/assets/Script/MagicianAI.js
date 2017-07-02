/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (role) {
        this._role = role;
    },


    //一次移动完成
    onMoveEnd:function(){
    },


    //一次移动完成
    onAttackEnd:function(){
    },


    //攻击特效
    attackEffect: function (locked) {
        ag.agAniCache.getNode(this._role.node,"ani/effect3/505000",10,0,this._role._data.attackSpeed/10,function(sender){
            ag.agAniCache.put(sender.node);
            ag.agAniCache.getEffect(locked.node,"ani/effect3/505010",15,999,0.1);
        }.bind(this));
    },


    // called every frame
    update: function (dt) {
        this.node.setLocalZOrder(Math.floor(100000-this.node.y));
    },
});
