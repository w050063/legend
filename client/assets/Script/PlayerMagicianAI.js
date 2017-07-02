/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (role) {
        this._touchPointArray = [];
        this._role = role;
        this._locked = null;
        this._busy = false;

        ag.gameLayer.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this._touchPointArray = this._touchPointArray.concat(event.getTouches());
            this._locked = this._role.getPlayerForTouch(this._touchPointArray[0]);
        }.bind(this));
        ag.gameLayer.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
        }.bind(this));
        ag.gameLayer.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var touches = event.getTouches();
            for(var i=this._touchPointArray.length-1;i>=0;--i)if(touches.indexOf(this._touchPointArray[i])!=-1)this._touchPointArray.splice(i,1);
        }.bind(this));

        ag.gameLayer.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var touches = event.getTouches();
            for(var i=this._touchPointArray.length-1;i>=0;--i)if(touches.indexOf(this._touchPointArray[i])!=-1)this._touchPointArray.splice(i,1);
        }.bind(this));
    },


    //一次移动完成
    onMoveEnd:function(){
        this._busy = false;
        this.update(0);
    },


    //一次移动完成
    onAttackEnd:function(){
        this._busy = false;
        this.update(0);
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
        //执行玩家操作
        if(this._busy==false){
            if(this._locked){
                this._role.attack(this._locked);
                this._busy = true;
            }else if(this._touchPointArray.length>0){
                if(this._touchPointArray.length==2){
                    var offset1 = this._role.getTouchOffsetScreen(this._touchPointArray[0]);
                    var offset2 = this._role.getTouchOffsetScreen(this._touchPointArray[1]);
                    if(cc.pointEqualToPoint(offset1,cc.p(-1,1)) && cc.pointEqualToPoint(offset2,cc.p(1,1))){
                        this._busy = this._role.move(cc.p(0,1));
                    }else if(cc.pointEqualToPoint(offset1,cc.p(-1,-1)) && cc.pointEqualToPoint(offset2,cc.p(1,-1))){
                        this._busy = this._role.move(cc.p(0,-1));
                    }
                }else{
                    this._busy = this._role.move(this._role.getTouchOffsetScreen(this._touchPointArray[this._touchPointArray.length-1]));
                }
            }else{
                this._role.idle();
            }
        }
        this.node.setLocalZOrder(Math.floor(100000-this.node.y));
    },
});
