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

        ag.gameLayer.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this._touchPointArray = this._touchPointArray.concat(event.getTouches());
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
        if(this.dispose()==false){
            this._role.idle();
        }
    },


    // called every frame
    update: function (dt) {
        if(this._role._state==ag.gameConst.stateIdle){
            this.dispose();
        }
        this.node.setLocalZOrder(Math.floor(100000-this.node.y));
    },


    //操作处理
    dispose:function(){
        var result = false;
        //执行玩家操作
        if(this._touchPointArray.length>0){
            if(this._touchPointArray.length==2){
                var offset1 = this.getTouchOffsetScreen(this._touchPointArray[0]);
                var offset2 = this.getTouchOffsetScreen(this._touchPointArray[1]);
                if(cc.pointEqualToPoint(offset1,cc.p(-1,1)) && cc.pointEqualToPoint(offset2,cc.p(1,1))){
                    this._role.move(cc.p(0,1));
                }else if(cc.pointEqualToPoint(offset1,cc.p(-1,-1)) && cc.pointEqualToPoint(offset2,cc.p(1,-1))){
                    this._role.move(cc.p(0,-1));
                }
            }else{
                this._role.move(this.getTouchOffsetScreen(this._touchPointArray[this._touchPointArray.length-1]));
            }
            result = true;
        }
        return result;
    },


    //根据一个触摸点得到玩家方向向量
    getTouchOffsetScreen:function(touch){
        var size = cc.director.getWinSize();
        var x = touch.getLocationX();
        var y = touch.getLocationY();
        var center = 50;
        var offset = {};
        if(x<size.width/2-center)offset.x=-1;
        else if(x>size.width/2+center)offset.x=1;
        else offset.x=0;
        if(y<size.height/2-center)offset.y=-1;
        else if(y>size.height/2+center)offset.y=1;
        else offset.y=0;
        return offset;
    },
});
