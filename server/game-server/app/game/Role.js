/**
 * Created by bot.su on 2017/6/21.
 * 角色类
 */


module.exports = ag.class.extend({
    _data:null,
    _mst:null,
    ctor:function () {
        this._busy = false;
    },


    setAIController:function (ai) {
        this._ai = ai;
    },


    //重置所有属性
    resetAllProp:function(){
        var mst = this.getMst();
        var lv = this._data.level;
        this._data.totalHP = mst.hp+mst.hpAdd*lv;
        this._data.hp = this._data.totalHP;
        this._data.defense = mst.defense+mst.defenseAdd*lv;
        this._data.hurt = mst.hurt+mst.hurtAdd*lv;
        this._data.totalExp = mst.exp+mst.expAdd*lv;
        this._data.exp = 0;
        this._data.heal = mst.heal+mst.healAdd*lv;
        this._data.attackSpeed = mst.attackSpeed;
        this._data.moveSpeed = mst.moveSpeed;
    },


    //获得策划数据
    getMst : function(){
        return ag.gameConst._roleMst[this._data.type];
    },


    //获得地图名字
    getMapName : function(){
        for(var key in ag.gameLayer._roleMap){
            var array = ag.gameLayer._roleMap[key];
            for(var i=0;i<array.length;++i)if(array[i]==this)return key;
        }
        return null;
    },

    //设置逻辑位置
    setLocation:function(location){
        var oldStr = this.getMapXYString();
        this._data.x = location.x;
        this._data.y = location.y;
        var newStr = this.getMapXYString();


        //更新xy数组信息
        ag.gameLayer._roleXYMap[oldStr].splice(ag.gameLayer._roleXYMap[oldStr].indexOf(this),1);
        if(ag.gameLayer._roleXYMap[oldStr].length==0)delete ag.gameLayer._roleXYMap[oldStr];
        if(!ag.gameLayer._roleXYMap[newStr])ag.gameLayer._roleXYMap[newStr] = [];
        ag.gameLayer._roleXYMap[newStr].push(this);
    },



    //无事可以做状态，可以重复进入
    idle:function(){
        this._state = ag.gameConst.stateIdle;
    },


    move:function(location){
        var myData = this._data;
        if(Math.abs(this._data.x-location.x)>1 || Math.abs(this._data.y-location.y)>1){
            //位置异常，重新定位
            ag.jsUtil.sendData("sMoveForce",{id:this._data.id,x:myData.x,y:myData.y},this._data.id);
            return;
        }

        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),location);
        this.setLocation(location);


        //通知其他人
        ag.jsUtil.sendDataExcept("sMove",{id:myData.id, x:myData.x, y:myData.y},this);


        //忙碌状态
        this._busy = true;
        ag.actionManager.runAction(this,this._data.moveSpeed,function(){
            this._busy = false;
            this.idle();
        }.bind(this));


        this._state = ag.gameConst.stateMove;
    },


    //攻击
    attack:function(locked){
        var data = locked._data;
        var x = data.x, y = data.y;
        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),locked.getLocation());


        var sendArray = [];


        //伤害计算
        if(this._data.type=='m0'){
            var dirPoint = ag.gameConst.directionArray[this._data.direction];
            var array = [];
            var array1 = ag.gameLayer._roleXYMap[''+data.mapId+','+(this._data.x+dirPoint.x)+','+(this._data.y+dirPoint.y)];
            if(array1)array = array.concat(array1);
            array1 = ag.gameLayer._roleXYMap[''+data.mapId+','+this._data.x+','+this._data.y];
            if(array1)array = array.concat(array1);
            if(array){
                for(var k=0;k<array.length;++k){
                    var lockedData = array[k]._data;
                    if(ag.gameLayer.isEnemyCamp(array[k],this)){
                        var correct = lockedData.defense>=0 ? lockedData.defense/10+1 : -1/(lockedData.defense/10-1);
                        if(ag.buffManager.getCDForFireCrit(this)==false){
                            lockedData.hp -= Math.round(this._data.hurt/correct*3);
                        }else{
                            lockedData.hp -=  Math.round(this._data.hurt/correct);
                        }
                        sendArray.push({id:lockedData.id,hp:lockedData.hp});
                    }
                }
            }
            //刺杀位置
            array = ag.gameLayer._roleXYMap[''+data.mapId+','+(this._data.x+dirPoint.x*2)+','+(this._data.y+dirPoint.y*2)];
            if(array){
                for(var k=0;k<array.length;++k){
                    var lockedData = array[k]._data;
                    if(ag.gameLayer.isEnemyCamp(array[k],this)){
                        if(ag.buffManager.getCDForFireCrit(this)==false){
                            var correct = lockedData.defense>=0 ? lockedData.defense/10+1 : -1/(lockedData.defense/10-1);
                            lockedData.hp -=  Math.round(this._data.hurt/correct*3);
                        }else{
                            lockedData.hp -= this._data.hurt;
                        }
                        sendArray.push({id:lockedData.id,hp:lockedData.hp});
                    }
                }
            }
        }else if(this._data.type=='m1'){
            for(var i=y-1;i<=y+1;++i){
                for(var j=x-1;j<=x+1;++j){
                    var array = ag.gameLayer._roleXYMap[''+data.mapId+','+j+','+i];
                    if(array){
                        for(var k=0;k<array.length;++k){
                            var lockedData = array[k]._data;
                            if(ag.gameLayer.isEnemyCamp(array[k],this)){
                                var correct = lockedData.defense>=0 ? lockedData.defense/10+1 : -1/(lockedData.defense/10-1);
                                lockedData.hp -=  Math.round(this._data.hurt/correct);
                                sendArray.push({id:lockedData.id,hp:lockedData.hp});
                            }
                        }
                    }
                }
            }


            //启动火墙
            ag.buffManager.setFireWall(locked.getMapXYString(),this);
        }else if(this._data.type=='m2'){
            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+x+','+y];
            if(array){
                for(var k=0;k<array.length;++k){
                    var lockedData = array[k]._data;
                    if(ag.gameLayer.isEnemyCamp(array[k],this)){
                        var correct = lockedData.defense>=0 ? lockedData.defense/10+1 : -1/(lockedData.defense/10-1);
                        lockedData.hp -=  Math.round(this._data.hurt/correct);
                        sendArray.push({id:lockedData.id,hp:lockedData.hp});
                    }
                }
            }


            //启动毒
            ag.buffManager.setPoison(locked,this);
        }else if(this._data.type=='m9') {
            var array = ag.gameLayer.getRoleFromCenterXY(this._data.mapId,this.getLocation(), 9, 9);
            for (var i = 0; i < array.length; ++i) {
                var lockedData = array[i]._data;
                if (ag.gameLayer.isEnemyCamp(array[i],this)) {
                    var correct = lockedData.defense>=0 ? lockedData.defense/10+1 : -1/(lockedData.defense/10-1);
                    lockedData.hp -=  Math.round(this._data.hurt/correct);
                    sendArray.push({id: lockedData.id, hp: lockedData.hp});
                }
            }
        }else{
            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+x+','+y];
            if(array){
                for(var k=0;k<array.length;++k){
                    var lockedData = array[k]._data;
                    if(ag.gameLayer.isEnemyCamp(array[k],this)){
                        var correct = lockedData.defense>=0 ? lockedData.defense/10+1 : -1/(lockedData.defense/10-1);
                        lockedData.hp -=  Math.round(this._data.hurt/correct);
                        sendArray.push({id:lockedData.id,hp:lockedData.hp});
                    }
                }
            }
        }

        //忙碌状态
        this._busy = true;
        ag.actionManager.runAction(this,this._data.attackSpeed,function(){
            this._busy = false;
            this.idle();
        }.bind(this));


        //战士没有进入烈火cd，则开始cd
        if(this._data.type=='m0' && ag.buffManager.getCDForFireCrit(this)==false){
            ag.buffManager.setCDForFireCrit(this);
        }


        //通知所有人
        ag.jsUtil.sendDataExcept("sAttack",{id:this._data.id,lockedId:locked._data.id},this);


        //删除本地死亡怪物数据,更新AI锁定
        for(var i=0;i<sendArray.length;++i){
            ag.jsUtil.sendDataAll("sHP",sendArray[i]);
            var beAttacker = ag.gameLayer._roleMap[sendArray[i].id];
            if(sendArray[i].hp<=0){
                beAttacker.dead(this);
            }else{
                if(beAttacker._ai)beAttacker._ai.setEnemy(this);
            }
        }

        this._state = ag.gameConst.stateAttack;
    },


    dead:function (attacker) {
        this._state = ag.gameConst.stateDead;
        if(attacker._data.camp!=ag.gameConst.campMonster){
            attacker._data.exp +=  this.getMst().expDead;
            while(attacker._data.exp>=attacker._data.totalExp){
                ++attacker._data.level;
                var exp = attacker._data.exp-attacker._data.totalExp;
                attacker.resetAllProp();
                attacker._data.exp = exp;
            }
            ag.jsUtil.sendDataAll("sAddExp",{id:attacker._data.id,level:attacker._data.level,exp:attacker._data.exp});
        }


        ag.buffManager.delFireWallByDead(this);
        ag.buffManager.delPoisonByDead(this);
        //取消所有锁定自己的AI
        ag.gameLayer.delLockedRole(this);
        if(this._ai)this._ai._locked = null;
        if(this._data.camp==ag.gameConst.campMonster){
            ag.actionManager.delAll(this._ai);
            ag.actionManager.delAll(this);

            var str = this.getMapXYString();
            ag.gameLayer._roleXYMap[str].splice(ag.gameLayer._roleXYMap[str].indexOf(this),1);
            if(ag.gameLayer._roleXYMap[str].length==0)delete ag.gameLayer._roleXYMap[str];
            delete ag.gameLayer._roleMap[this._data.id];
        }
    },



    relife: function () {
        if(this._state == ag.gameConst.stateDead){
            this._state = ag.gameConst.stateIdle;
            this._data.hp = this._data.totalHP;
            var pos = ag.gameLayer.getStandLocation(ag.gameConst._bornMap,ag.gameConst._bornX,ag.gameConst._bornY,ag.gameConst._bornR);
            this.setLocation(pos);
            ag.jsUtil.sendDataAll("sMoveForce",{id:this._data.id, x:this._data.x, y:this._data.y});
            this._busy = false;
        }
    },



    getMapXYString:function(){
        return ''+this._data.mapId+','+this._data.x+','+this._data.y;
    },


    //获得角色位置
    getLocation:function () {
        return {x:this._data.x,y:this._data.y};
    },
});
