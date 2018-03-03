/**
 * Created by bot.su on 2017/6/21.
 * 动画
 */


var NodeLocked = require('NodeLocked');
cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (role) {
        this._role = role;
        this._locked = null;
        this._busy = false;
        this._touchMoveDirection = -1;
        this._dirBackUp = -1;
        this._bShowNPCMoment = false;


        this._nodeRock = cc.find('Canvas/nodeRock');
        this._rockBack = cc.find('Canvas/nodeRock/back');
        this._rockPoint = cc.find('Canvas/nodeRock/back/rock');


        this._role.schedule(this.update02.bind(this),0.2);
    },
	
	touchStart:function(event){
		var location = event.getLocation();
		this._locked = this._role.getPlayerForTouch(location);
		if(this._locked){
            if(this._locked._data.camp==ag.gameConst.campNpc) {
                ag.gameLayer.showNodeNpcContent(this._locked._data);
                this._locked = null;
                this._bShowNPCMoment = true;
                ag.gameLayer.node.runAction(cc.sequence(cc.delayTime(0.2), cc.callFunc(function () {
                    this._bShowNPCMoment = false;
                }.bind(this))));
            }else if(this._locked.getIsPlayer()){
                cc.find('Canvas/buttonLocked/buttonBoy').active = this._locked._data.sex==ag.gameConst.sexBoy;
                cc.find('Canvas/buttonLocked/buttonGirl').active = this._locked._data.sex==ag.gameConst.sexGirl;
                cc.find('Canvas/buttonLocked/labelName').getComponent(cc.Label).string = this._locked._data.name;
                cc.find('Canvas/nodeLockedList').getComponent(NodeLocked).setRid(this._locked._data.id);
                var temp = cc.find('Canvas/buttonLocked');
                temp.active = true;
                temp.stopAllActions();
                temp.runAction(cc.sequence(cc.delayTime(30),cc.callFunc(function(){
                    temp.active = false;
                }.bind(this))));
                this._locked.nameDisapper();
            }else{
                this._locked.nameDisapper();
            }
		}else{
			this.resetTouchDirection(location);
            this._dirBackUp = this._touchMoveDirection;
		}
	},

	touchMove:function(event){
        if(this._bShowNPCMoment==false){
            var location = event.getLocation();
            var tempDirection = this._touchMoveDirection;
            this.resetTouchDirection(location);
        }
	},
	touchEnd:function(event){
		this._touchMoveDirection = -1;
	},
	rockStart:function(event){
		var location = this._nodeRock.convertToNodeSpaceAR(event.getLocation());
		this._rockBack.setPosition(location);
		this._rockBack.opacity = 255;
        this._locked = null;
	},
	rockMove:function(event){
		var location = this._nodeRock.convertToNodeSpaceAR(event.getLocation());
		var angle = cc.pToAngle(cc.pSub(location,this._rockBack.getPosition()));
		var dis = Math.min(76,cc.pDistance(location,this._rockBack.getPosition()));
		this._rockPoint.setPosition(cc.p(dis*Math.cos(angle),dis*Math.sin(angle)));
		if(dis>20){
            this.resetDirectionByRock(angle);
        }else{
            this._touchMoveDirection = -1;
        }
	},
	rockEnd:function(event){
		this._rockPoint.setPosition(cc.p(0,0));
		this._rockBack.setPosition(cc.p(0,0));
		this._rockBack.opacity = 100;
		this._touchMoveDirection = -1;
	},
	

    //获得当前移动方向
    resetTouchDirection:function (location) {
        if(!this._locked){
            var offset1 = this._role.getTouchOffsetScreen(location);
            if(offset1.x==0 && offset1.y==0){
                this._touchMoveDirection = -1;
            }else{
                this._touchMoveDirection = ag.gameConst.directionStringArray.indexOf(""+offset1.x+","+offset1.y);
            }
        }else{
            this._touchMoveDirection = -1;
        }
    },

    resetDirectionByRock:function (angle) {
        angle = angle/Math.PI/2;
        if(angle<0)angle+=1;
        if(angle<1/16 || angle>15/16)this._touchMoveDirection = 2;
        else if(angle<3/16)this._touchMoveDirection = 1;
        else if(angle<5/16)this._touchMoveDirection = 0;
        else if(angle<7/16)this._touchMoveDirection = 7;
        else if(angle<9/16)this._touchMoveDirection = 6;
        else if(angle<11/16)this._touchMoveDirection = 5;
        else if(angle<13/16)this._touchMoveDirection = 4;
        else if(angle<15/16)this._touchMoveDirection = 3;
    },


    //返回移动到锁定角色的的方向
    doMoveOperate:function (location) {
        var direction = ag.gameLayer.getDirection(this._role.getLocation(),location);
        direction = ag.gameLayer.getOffsetWithColloison(this._role, direction);
        if (direction!=-1){
            //ag.gameLayer.buttonEventNpcClose();
            this._role.move(cc.pAdd(this._role.getLocation(),ag.gameConst.directionArray[direction]));
            this._busy = true;
        }else{
            this._role.idle();
        }
    },


    // called every frame
    update: function (dt) {
        //执行玩家操作
        if(this._busy==false && this._state != ag.gameConst.stateDead){
            if(this._touchMoveDirection!=-1 || (this._touchMoveDirection==-1 && this._dirBackUp!=-1)){
                this.doMoveOperate(cc.pAdd(this._role.getLocation(),ag.gameConst.directionArray[this._touchMoveDirection!=-1?this._touchMoveDirection:this._dirBackUp]));
                this._dirBackUp = -1;
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
            if(ag.gameLayer._setupAutoPlayer){
                this._locked = this.findLockedPlayer();
            }else if(ag.gameLayer._setupAutoAttack){
                this._locked = this.findLocked();
            }
        }
    },


    //查找目标,怪物
    findLockedPlayer:function(){
        var locked = null;
        var lockedDis = 9999;
        var checkDistance = this._role.getMst().checkDistance;
        var l1=this._role.getLocation();
        var playerCamp = ag.gameLayer._player.getGuildId();
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            var camp = role.getGuildId();
            if(role.getIsPlayer() && camp!=ag.gameConst.campPlayerNone && camp!=playerCamp && this.isInSafe(role)==false){//是玩家，没在安全区域，别的行会
                var l2=role.getLocation();
                var x = Math.abs(l1.x-l2.x), y = Math.abs(l1.y-l2.y);
                if(Math.max(x,y)<=checkDistance && x+y<lockedDis){
                    locked = role;
                    lockedDis = x+y;
                }
            }
        }
        return locked;
    },


    //是否在安全区
    isInSafe:function(role){
        var safe = ag.gameConst._terrainMap[role._data.mapId].safe;
        if(safe){
            var lx1 = role.getLocation().x,ly1 = role.getLocation().y;
            if(lx1>=safe.x && lx1<=safe.xx && ly1>=safe.y && ly1<=safe.yy)return true;
        }
        return false;
    },


    //查找目标,怪物
    findLocked:function(){
        var locked = null;
        var lockedDis = 9999;
        var checkDistance = this._role.getMst().checkDistance;
        var l1=this._role.getLocation();
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role.getIsMonster()){
                var l2=role.getLocation();
                var x = Math.abs(l1.x-l2.x), y = Math.abs(l1.y-l2.y);
                if(Math.max(x,y)<=checkDistance && x+y<lockedDis){
                    locked = role;
                    lockedDis = x+y;
                }
            }
        }
        return locked;
    },
});
