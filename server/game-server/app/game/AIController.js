/**
 * Created by bot.su on 2017/6/21.
 * 角色类
 */


module.exports = ag.class.extend({
    ctor:function (role) {
        this._role = role;
        this._locked = null;
        this._bChangeByEnemy = true;
        ag.actionManager.schedule(this,0.001,this.update.bind(this));
        ag.actionManager.schedule(this,1,this.update1s.bind(this));
    },


    //设置攻击者
    setEnemy:function(attacker){
        if(this._bChangeByEnemy && attacker!=this._locked){
            if((this._locked && Math.random() < 0.5) || !this._locked) {
                this._locked = attacker;
                this._bChangeByEnemy = false;
                ag.actionManager.runAction(this._role,3,function(){
                    this._bChangeByEnemy = true;
                }.bind(this));
            }
        }
    },



    //返回移动到锁定角色的的方向,每次移动操作，怪物有一定1/4几率重新锁定目标
    doMoveOperate:function (location) {
        var locked = this.findLocked();
        if(locked && Math.random()<0.5){
            this._role.idle();
            this._locked = locked;
        }else{
            var direction = ag.gameLayer.getDirection(this._role.getLocation(),location);
            direction = ag.gameLayer.getOffsetWithColloison(this._role, direction);
            if (direction!=-1){
                this._role.move(ag.jsUtil.pAdd(this._role.getLocation(),ag.gameConst.directionArray[direction]));
            }else{
                this._role.idle();
            }
        }
    },


    // called every frame
    update: function () {
        //执行玩家操作
        if(this._role._busy==false && this._role._state != ag.gameConst.stateDead){
            //有锁定目标
            if(this._locked){
                var l1 = this._role.getLocation(), l2 = this._locked.getLocation(),vd = this._role.getMst().visibleDistance,ad = this._role.getMst().attackDistance;
                var lx = Math.abs(l1.x-l2.x), ly = Math.abs(l1.y-l2.y);
                if(lx<=vd && ly<=vd){
                    if(lx<=ad && ly<=ad){
                        this._role.attack(this._locked);
                    }else if(this._role._data._type!="m9"){
                        this.doMoveOperate(this._locked.getLocation());
                    }
                }else{
                    this._role.idle();
                    this._locked = null;
                }
            }
        }
    },




    // called every frame
    update1s: function () {
        //执行玩家操作
        if(this._role._busy==false && this._role._state != ag.gameConst.stateDead){
            //无锁定目标,查找最近的目标
            if(!this._locked)this._locked = this.findLocked();
        }
    },


    //查找目标
    findLocked:function(){
        var checkDistance = this._role.getMst().checkDistance;
        var searchEnemypath = ag.gameConst.searchEnemypath;
        var count = Math.min(Math.pow(checkDistance*2+1,2),searchEnemypath.length);
        for(var i=0;i<count;++i){
            var array = ag.gameLayer._roleXYMap[''+this._role._data.mapId+','+(this._role._data.x+searchEnemypath[i][0])+','+(this._role._data.y+searchEnemypath[i][1])];
            if(array){
                for(var k=0;k<array.length;++k){
                    if(ag.gameLayer.isEnemyCamp(array[k],this._role)){
                        return array[k];
                    }
                }
            }
        }
        return null;
    },
});
