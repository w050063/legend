/**
 * Created by bot.su on 2017/6/21.
 * 角色类
 */


module.exports = ag.class.extend({
    ctor:function (role) {
        this._role = role;
        this._locked = null;
        ag.actionManager.schedule(this,0.001,this.update.bind(this));
        ag.actionManager.schedule(this,1,this.update1s.bind(this));
    },


    //返回移动到锁定角色的的方向
    doMoveOperate:function (location) {

        var direction = ag.gameLayer.getDirection(this._role.getLocation(),location);
        direction = ag.gameLayer.getOffsetWithColloison(this._role, direction);
        if (direction!=-1){
            this._role.move(ag.jsUtil.pAdd(this._role.getLocation(),ag.gameConst.directionArray[direction]));
        }else{
            this._role.idle();
        }
    },


    // called every frame
    update: function () {
        //执行玩家操作
        if(this._role._busy==false && this._role._state != ag.gameConst.stateDead){
            //有锁定目标
            if(this._locked){
                if(ag.jsUtil.pDistance(this._role.getLocation(),this._locked.getLocation())<this._role._data.visibleDistance){
                    if(ag.gameLayer.getAttackDistance(this._role,this._locked)){
                        this._role.attack(this._locked);
                    }else{
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
            if(!this._locked){
                for(var i= 0,iAdd=1;Math.abs(i)<3 && !this._locked;i+=iAdd,iAdd=-iAdd+(iAdd>0?-1:1)){
                    for(var j= 0,jAdd=1;Math.abs(j)<3 && !this._locked;j+=jAdd,jAdd=-jAdd+(jAdd>0?-1:1)){
                        var array = ag.gameLayer._roleXYMap[''+this._role._data.mapId+','+(this._role._data.x+j)+','+(this._role._data.y+i)];
                        if(array){
                            for(var k=0;k<array.length && !this._locked;++k){
                                if(array[k]._data.camp!=this._role._data.camp && array[k]._state != ag.gameConst.stateDead){
                                    this._locked = array[k];
                                }
                            }
                        }
                    }
                }
            }
        }
    },
});
