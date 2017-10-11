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
        this._spriteTouchArray = [];
        this._touchMoveDirection = -1;

        //加载
        cc.loader.loadRes('prefab/nodeTouchSprite',function(err,prefab){
            var node = cc.instantiate(prefab);
            node.parent = ag.gameLayer.node;
            node.setLocalZOrder(100);
            for(var i=0;i<8;++i){
                var spriteTouch = node.getChildByName("spriteTouch"+i).getComponent(cc.Sprite);
                var text = spriteTouch.node.getChildByName("labelText");
                if(text)text.cascadeOpacity = false;
                this._spriteTouchArray.push(spriteTouch);
            }
            this.changeTouchSprite(false);
        }.bind(this));


        var node = ag.gameLayer.node;
        node.off(cc.Node.EventType.TOUCH_START);
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ag.gameLayer.buttonEventNpcClose();
            this._touchPointArray = this._touchPointArray.concat(event.getTouches());
            if(this._touchPointArray.length==3)this._touchPointArray.splice(0,1);//防止出现没有end的事件的情况
            this._locked = this._role.getPlayerForTouch(this._touchPointArray[0]);
            if(this._locked && this._locked._data.camp==ag.gameConst.campNpc){
                ag.gameLayer.showNodeNpcContent(this._locked._data);
                this._locked = null;
            }else{
                this.resetTouchDirection();
                this.changeTouchSprite(true);
            }
        }.bind(this));
        node.off(cc.Node.EventType.TOUCH_MOVE);
        node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if(ag.gameLayer._nodeNpcContent.active)return;
            var tempDirection = this._touchMoveDirection;
            this.resetTouchDirection();
            if(tempDirection!=this._touchMoveDirection){
                this.changeTouchSprite();
            }
        }.bind(this));
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            var touches = event.getTouches();
            for(var i=this._touchPointArray.length-1;i>=0;--i)if(touches.indexOf(this._touchPointArray[i])!=-1){
                this._touchPointArray.splice(i,1);
            }
            this.resetTouchDirection();
            this.changeTouchSprite();
        }.bind(this));
        node.off(cc.Node.EventType.TOUCH_CANCEL);
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var touches = event.getTouches();
            for(var i=this._touchPointArray.length-1;i>=0;--i)if(touches.indexOf(this._touchPointArray[i])!=-1){
                this._touchPointArray.splice(i,1);
            }
            this.resetTouchDirection();
            this.changeTouchSprite();
        }.bind(this));

        this._role.schedule(this.update02.bind(this),0.2);
    },



    //获得当前移动方向
    resetTouchDirection:function () {
        if(!this._locked){
            if(this._touchPointArray.length==2){
                var offset1 = this._role.getTouchOffsetScreen(this._touchPointArray[0]);
                var offset2 = this._role.getTouchOffsetScreen(this._touchPointArray[1]);
                //if(cc.pointEqualToPoint(offset1,cc.p(-1,1)) && cc.pointEqualToPoint(offset2,cc.p(1,1))){
                if((offset1.x==-1 && offset1.y==1 && offset2.x==1 && offset2.y==1) || (offset1.x==1 && offset1.y==1 && offset2.x==-1 && offset2.y==1)){
                    this._touchMoveDirection = 0;
                //}else if(cc.pointEqualToPoint(offset1,cc.p(-1,-1)) && cc.pointEqualToPoint(offset2,cc.p(1,-1))){
                }else if((offset1.x==-1 && offset1.y==-1 && offset2.x==1 && offset2.y==-1) || (offset1.x==1 && offset1.y==-1 && offset2.x==-1 && offset2.y==-1)){
                    this._touchMoveDirection = 4;
                }else{
                    this._touchMoveDirection = -1;
                }
            }else if(this._touchPointArray.length==1){
                var offset1 = this._role.getTouchOffsetScreen(this._touchPointArray[0]);
                if(offset1.x==0 && offset1.y==0){
                    this._touchMoveDirection = -1;
                }else{
                    this._touchMoveDirection = ag.gameConst.directionStringArray.indexOf(""+offset1.x+","+offset1.y);
                }
            }else{
                this._touchMoveDirection = -1;
            }
        }else{
            this._touchMoveDirection = -1;
        }
    },


    //改变触摸图片
    changeTouchSprite:function (bAction) {
        if(this._touchMoveDirection!=-1){
            for(var i=0;i<this._spriteTouchArray.length;++i){
                this._spriteTouchArray[i].node.stopAllActions();
                var text = this._spriteTouchArray[i].node.getChildByName("labelText");
                if(text)text.opacity = (i==this._touchMoveDirection?255:0);
                if(bAction){
                    this._spriteTouchArray[i].node.opacity = 255*0.1;
                    if(i!=this._touchMoveDirection)this._spriteTouchArray[i].node.runAction(cc.fadeOut(1));
                }else{
                    this._spriteTouchArray[i].node.opacity = (i==this._touchMoveDirection?255*0.1:0);
                }
            }
        }else{
            for(var i=0;i<this._spriteTouchArray.length;++i) {
                this._spriteTouchArray[i].node.stopAllActions();
                this._spriteTouchArray[i].node.opacity = 0;
                var text = this._spriteTouchArray[i].node.getChildByName("labelText");
                if(text)text.opacity = 0;
            }
        }
    },


    //返回移动到锁定角色的的方向
    doMoveOperate:function (location) {
        var direction = ag.gameLayer.getDirection(this._role.getLocation(),location);
        direction = ag.gameLayer.getOffsetWithColloison(this._role, direction);
        if (direction!=-1){
            this._role.move(cc.pAdd(this._role.getLocation(),ag.gameConst.directionArray[direction]));
            this._busy = true;
        }else{
            this._role.idle();
        }
    },


    // called every frame
    update: function (dt) {
        //执行玩家操作
        if(ag.gameLayer && this._busy==false && this._state != ag.gameConst.stateDead){
            if(this._touchMoveDirection!=-1){
                this.doMoveOperate(cc.pAdd(this._role.getLocation(),ag.gameConst.directionArray[this._touchMoveDirection]));
            }else if(this._locked){
                var l1 = this._role.getLocation(), l2 = this._locked.getLocation(),vd = this._role.getMst().visibleDistance,ad = this._role.getMst().attackDistance;
                var lx = Math.abs(l1.x-l2.x), ly = Math.abs(l1.y-l2.y);
                if(lx<=vd && ly<=vd){
                    if((lx<=ad && ly<=ad) || (this._role._data.type=='m0' && lx<=2 && ly<=2 && lx+ly!=3)){
                        this._role.attack(this._locked);
                        this._busy = true;
                    }else{
                        this.doMoveOperate(this._locked.getLocation());
                    }
                }else{
                    this._role.idle();
                    this._locked = null;
                }
            }else{
                this._role.idle();
            }
        }
    },


    update02: function (dt) {
        //执行玩家操作
        if(ag.gameLayer && this._busy==false && this._state != ag.gameConst.stateDead && !this._locked && this._touchMoveDirection==-1){
            if(ag.gameLayer._setupAutoAttack)this._locked = this.findLocked();
        }
    },


    //查找目标,怪物
    findLocked:function(){
        var locked = null;
        var lockedDis = 9999;
        var checkDistance = this._role.getMst().checkDistance;
        var l1=this._role.getLocation();
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role._data.camp==ag.gameConst.campMonster){
                var l2=role.getLocation();
                var x = Math.abs(l1.x-l2.x), y = Math.abs(l1.y-l2.y);
                if(Math.max(x,y)<=checkDistance && x+y<lockedDis && ag.gameLayer.isEnemyCamp(this._role,role)){
                    locked = role;
                    lockedDis = x+y;
                }
            }
        }
        return locked;
    },


    //查找npc
    findNpcForLocation:function(){

    },
});
