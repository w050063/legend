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
        this._totalHP = this.getTotalHPFromDataBase();
        this._data.hp = this._totalHP;
        this._totalExp = this.getTotalExpFromDataBase();
        this._exp = 0;
        this._heal = mst.heal+Math.floor(mst.healAdd*lv);
        this._attackSpeed = mst.attackSpeed;
        this._moveSpeed = mst.moveSpeed;
        this.refreshItemProp();
    },


    getTotalHPFromDataBase:function(){
        var mst = this.getMst();
        if(this._data.camp==ag.gameConst.campMonster || this._data.type=='m19')return mst.hp;
        var lv = this._data.level;
        if(lv>51)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*8+mst.hpAdd[2]*4+mst.hpAdd[3]*4+mst.hpAdd[4]*(lv-51));
        if(lv>47)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*8+mst.hpAdd[2]*4+mst.hpAdd[3]*(lv-47));
        if(lv>43)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*8+mst.hpAdd[2]*(lv-43));
        if(lv>35)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*(lv-35));
        return Math.floor(mst.hp+mst.hpAdd[0]*lv);
    },

    getTotalExpFromDataBase:function(){
        if(this._data.camp==ag.gameConst.campMonster || this._data.type=='m19')return 0;
        var lv = this._data.level;
        var array = ag.gameConst.expDatabase;
        if(lv>50)return Math.floor(array[0]+array[1]*34+array[2]*8+array[3]*4+array[4]*4+array[5]*(lv-50));
        if(lv>46)return Math.floor(array[0]+array[1]*34+array[2]*8+array[3]*4+array[4]*(lv-46));
        if(lv>42)return Math.floor(array[0]+array[1]*34+array[2]*8+array[3]*(lv-42));
        if(lv>34)return Math.floor(array[0]+array[1]*34+array[2]*(lv-34));
        return Math.floor(array[0]+array[1]*lv);
    },


    refreshItemProp:function(){
        var mst = this.getMst();
        var lv = this._data.level;
        var hurt = mst.hurt+Math.floor(mst.hurtAdd*lv);
        var defense = mst.defense+Math.floor(mst.defenseAdd*lv);
        var map = ag.itemManager._itemMap.getMap();
        for (var key in map) {
            var obj = map[key]._data;
            if (obj.owner == this._data.id && typeof obj.puton=='number') {
                var itemMst = ag.gameConst._itemMst[obj.mid];
                if(itemMst.hurt)hurt+=itemMst.hurt;
                if(itemMst.defense)defense+=itemMst.defense;
            }
        }
        this._hurt = hurt;
        this._defense = defense;
    },


    getTypeNum:function(){
        if(this._data.type=='m0')return this._data.sex==ag.gameConst.sexBoy?0:1;
        if(this._data.type=='m1')return this._data.sex==ag.gameConst.sexBoy?2:3;
        if(this._data.type=='m2')return this._data.sex==ag.gameConst.sexBoy?4:5;
        return 0;
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


    //更换地图
    changeMap:function(transferId){
        var transferMst = ag.gameConst._transferMst[transferId];
        if(transferMst){
            var mapId = transferMst.mapId;
            ag.jsUtil.sendDataExcept("sDeleteRole",this._data.id,this._data.id);
            if(this._tiger)ag.jsUtil.sendDataExcept("sDeleteRole",this._tiger._data.id,this._data.id);

            //更新地图数据
            var oldStr = this.getMapXYString();
            var pos = ag.gameLayer.getStandLocation(mapId,transferMst.x,transferMst.y);
            this._data.mapId = mapId;
            this._data.x = pos.x;
            this._data.y = pos.y;
            var newStr = this.getMapXYString();
            ag.gameLayer._roleXYMap[oldStr].splice(ag.gameLayer._roleXYMap[oldStr].indexOf(this),1);
            if(ag.gameLayer._roleXYMap[oldStr].length==0)delete ag.gameLayer._roleXYMap[oldStr];
            if(!ag.gameLayer._roleXYMap[newStr])ag.gameLayer._roleXYMap[newStr] = [];
            ag.gameLayer._roleXYMap[newStr].push(this);
            if(this._tiger){
                oldStr = this._tiger.getMapXYString();
                this._tiger._data.mapId = mapId;
                this._tiger._data.x = pos.x;
                this._tiger._data.y = pos.y;
                ag.gameLayer._roleXYMap[oldStr].splice(ag.gameLayer._roleXYMap[oldStr].indexOf(this._tiger),1);
                if(ag.gameLayer._roleXYMap[oldStr].length==0)delete ag.gameLayer._roleXYMap[oldStr];
                if(!ag.gameLayer._roleXYMap[newStr])ag.gameLayer._roleXYMap[newStr] = [];
                ag.gameLayer._roleXYMap[newStr].push(this._tiger);
            }
        }
        ag.jsUtil.sendDataAll("sAddExp",{id:this._data.id,level:this._data.level,exp:this._exp},this._data.mapId);

        //返回当前地图非自己的角色。
        for(var key in ag.gameLayer._roleMap){
            var data = ag.gameLayer._roleMap[key]._data;
            if(data.mapId==this._data.mapId && data.id!=this._data.id){
                ag.jsUtil.sendData("sRole",data,this._data.id);
            }
        }

        //通知其他人。
        ag.jsUtil.sendDataExcept("sRole",this._data,this._data.id);
        if(this._tiger)ag.jsUtil.sendDataExcept("sRole",this._tiger._data,this._data.id);

        //发送装备情况
        var map = ag.itemManager._itemMap.getMap();
        for(var key in map){
            var itemData = map[key]._data;
            var role = ag.gameLayer.getRole(itemData.owner);
            if(itemData.mapId==this._data.mapId || (role && role._data.mapId==this._data.mapId)){
                ag.jsUtil.sendDataAll("sItem",itemData,this._data.mapId);
            }
        }
    },



    //无事可以做状态，可以重复进入
    idle:function(){
        if(this._state==ag.gameConst.stateDead)return;
        this._state = ag.gameConst.stateIdle;
    },


    move:function(location){
        if(this._state==ag.gameConst.stateDead)return;
        var myData = this._data;
        if(Math.abs(this._data.x-location.x)>1 || Math.abs(this._data.y-location.y)>1){
            //位置异常，重新定位
            ag.jsUtil.sendData("sMoveForce",{id:this._data.id,x:myData.x,y:myData.y},this._data.id);
            return;
        }

        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),location);
        this.setLocation(location);


        //通知其他人
        ag.jsUtil.sendDataExcept("sMove",{id:myData.id, x:myData.x, y:myData.y},this._data.id);


        //忙碌状态
        this._busy = true;
        ag.actionManager.runAction(this,this._moveSpeed,function(){
            this._busy = false;
            this.idle();
        }.bind(this));


        //捡装备,是玩家,地上有东西,背包没满
        if(this._data.camp!=ag.gameConst.campMonster && !this._master){
            var array = ag.itemManager.getDropByLocation(this.getLocation());
            var left = ag.gameConst.bagLength-ag.itemManager.getBagLength(this._data.id);
            if(array.length>left){
                ag.jsUtil.sendData("sSystemNotify","背包已满!",this._data.id);
            }
            if(left>0){
                var count = Math.min(array.length,left);
                for(var i=count-1;i>=0;--i){
                    var id = array[i]._data.id;
                    ag.jsUtil.sendData("sItemBagAdd",id,this._data.id);
                    ag.jsUtil.sendDataExcept("sItemDisappear",id,this._data.id);
                    ag.itemManager.addBagItem(id,this._data.id);
                }
            }
        }
        this._state = ag.gameConst.stateMove;
    },


    //攻击
    attack:function(locked){
        if(this._state==ag.gameConst.stateDead)return;
        var data = locked._data;
        var x = data.x, y = data.y;
        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),locked.getLocation());
        if(this._tiger && this._tiger!=locked && this._tiger._state!=ag.gameConst.stateDead && !this._tiger._ai._locked)this._tiger._ai._locked = locked;//如果有老虎，操作老虎攻击敌人。
        if(locked._tiger && locked._tiger._state!=ag.gameConst.stateDead && !locked._tiger._ai._locked)locked._tiger._ai._locked = this;//敌人有老虎，敌人老虎攻击自己。


        //伤害计算
        var sendArray = [];
        if(this._data.type=='m0'){
            var dirPoint = ag.gameConst.directionArray[this._data.direction];
            var array = [];
            var array1 = ag.gameLayer._roleXYMap[''+data.mapId+','+(this._data.x+dirPoint.x)+','+(this._data.y+dirPoint.y)];
            if(array1)array = array.concat(array1);
            array1 = ag.gameLayer._roleXYMap[''+data.mapId+','+this._data.x+','+this._data.y];
            if(array1)array = array.concat(array1);
            if(array){
                for(var k=0;k<array.length;++k){
                    var tempRole = array[k];
                    if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                        var correct = tempRole._defense>=0 ? tempRole._defense/10+1 : -1/(tempRole._defense/10-1);
                        if(ag.buffManager.getCDForFireCrit(this)==false){
                            tempRole._data.hp -= Math.round(this._hurt/correct*3);
                        }else{
                            tempRole._data.hp -=  Math.round(this._hurt/correct);
                        }
                        sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                    }
                }
            }
            //刺杀位置
            array = ag.gameLayer._roleXYMap[''+data.mapId+','+(this._data.x+dirPoint.x*2)+','+(this._data.y+dirPoint.y*2)];
            if(array){
                for(var k=0;k<array.length;++k){
                    var tempRole = array[k];
                    if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                        if(ag.buffManager.getCDForFireCrit(this)==false){
                            var correct = tempRole._defense>=0 ? tempRole._defense/10+1 : -1/(tempRole._defense/10-1);
                            tempRole._data.hp -=  Math.round(this._hurt/correct*3);
                        }else{
                            tempRole._data.hp -= this._hurt;
                        }
                        sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                    }
                }
            }
        }else if(this._data.type=='m1'){
            for(var i=y-1;i<=y+1;++i){
                for(var j=x-1;j<=x+1;++j){
                    var array = ag.gameLayer._roleXYMap[''+data.mapId+','+j+','+i];
                    if(array){
                        for(var k=0;k<array.length;++k){
                            var tempRole = array[k];
                            if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                                var correct = tempRole._defense>=0 ? tempRole._defense/10+1 : -1/(tempRole._defense/10-1);
                                tempRole._data.hp -=  Math.round(this._hurt/correct);
                                sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                            }
                        }
                    }
                }
            }


            //启动火墙
            var tempArray = ag.gameConst.searchEnemypath;
            for(var i=0;i<9;++i){
                var x = locked._data.x+tempArray[i][0],y = locked._data.y+tempArray[i][1];
                if(ag.gameLayer.isCollision(this._data.mapId,x,y)==false){
                    ag.buffManager.setFireWall(this.getMapXYString(this._data.mapId,x,y),this);
                }
            }
        }else if(this._data.type=='m2'){
            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+x+','+y];
            if(array){
                for(var k=0;k<array.length;++k){
                    var tempRole = array[k];
                    if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                        var correct = tempRole._defense>=0 ? tempRole._defense/10+1 : -1/(tempRole._defense/10-1);
                        tempRole._data.hp -=  Math.round(this._hurt/correct);
                        sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                    }
                }
            }


            //启动毒
            ag.buffManager.setPoison(locked,this);
        }else if(this._data.type=='m8' || this._data.type=='m9') {
            var array = ag.gameLayer.getRoleFromCenterXY(this._data.mapId,this.getLocation(),this.getMst().attackDistance);
            for (var i = 0; i < array.length; ++i) {
                var tempRole = array[i];
                if (ag.gameLayer.isEnemyForAttack(this,tempRole)) {
                    var correct = tempRole._defense>=0 ? tempRole._defense/10+1 : -1/(tempRole._defense/10-1);
                    tempRole._data.hp -= Math.round(this._hurt/correct);
                    sendArray.push({id: tempRole._data.id, hp: tempRole._data.hp});
                }
            }
        }else{
            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+x+','+y];
            if(array){
                for(var k=0;k<array.length;++k){
                    var tempRole = array[k];
                    if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                        var correct = tempRole._defense>=0 ? tempRole._defense/10+1 : -1/(tempRole._defense/10-1);
                        tempRole._data.hp -=  Math.round(this._hurt/correct);
                        sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                    }
                }
            }
        }

        //忙碌状态
        this._busy = true;
        ag.actionManager.runAction(this,this._attackSpeed,function(){
            this._busy = false;
            this.idle();
        }.bind(this));


        //战士没有进入烈火cd，则开始cd
        if(this._data.type=='m0' && ag.buffManager.getCDForFireCrit(this)==false){
            ag.buffManager.setCDForFireCrit(this);
        }


        //通知所有人
        ag.jsUtil.sendDataExcept("sAttack",{id:this._data.id,lockedId:locked._data.id},this._data.id);


        //删除本地死亡怪物数据,更新AI锁定
        for(var i=0;i<sendArray.length;++i){
            ag.jsUtil.sendDataAll("sHP",sendArray[i],this._data.mapId);
            var beAttacker = ag.gameLayer._roleMap[sendArray[i].id];
            if(sendArray[i].hp<=0){
                beAttacker.dead(this);
            }else{
                if(beAttacker._ai)beAttacker._ai.setEnemy(this);
            }
        }

        this._state = ag.gameConst.stateAttack;
    },


    addExp:function(count,source){
        this._exp +=  count;
        while(this._exp>=this._totalExp){
            ++this._data.level;
            var exp = this._exp-this._totalExp;
            this.resetAllProp();
            this._exp = exp;
        }
        if(source){
            ag.jsUtil.sendDataAll("sAddExp",{id:this._data.id,level:this._data.level,exp:this._exp,source:source},this._data.mapId);
        }else{
            ag.jsUtil.sendDataAll("sAddExp",{id:this._data.id,level:this._data.level,exp:this._exp},this._data.mapId);
        }
    },


    dead:function (attacker) {
        if(this._state==ag.gameConst.stateDead)return;
        this._state = ag.gameConst.stateDead;
        
        //掉落装备
        var str = ag.gameConst._roleMst[this._data.type].drop;
        if(str){
            ag.itemManager.drop(str,this._data.mapId,this.getLocation());
        }
        
        
        if(attacker && attacker._data.camp!=ag.gameConst.campMonster){
            var master = attacker._master?attacker._master:attacker;
            master.addExp(this.getMst().expDead);

            if(this._data.camp!=ag.gameConst.campMonster){
                ag.jsUtil.sendDataAll("sSystemNotify",master._data.name+' 击杀 '+this._data.name,this._data.mapId);
            }
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

        if(this._tiger){
            this._tiger._data.hp=0;
            ag.jsUtil.sendDataAll("sHP",{id:this._tiger._data.id,hp:0},this._data.mapId);
            this._tiger.dead();
            this._tiger._ai._relifeCD = true;
            ag.actionManager.runAction(this,10,function(){
                this._tiger._ai._relifeCD = false;
            }.bind(this));
        }else if(this._master){
            this._ai._relifeCD = true;
            ag.actionManager.runAction(this,10,function(){
                this._ai._relifeCD = false;
            }.bind(this));
        }
    },


    relife: function () {
        if(this._state == ag.gameConst.stateDead){
            this._state = ag.gameConst.stateIdle;
            this._data.hp = this._totalHP;
            this._busy = false;
            if(this._master){
                this.changeMap();
                this.setLocation(this._master.getLocation());
                ag.jsUtil.sendDataAll("sRelife",{id:this._data.id, mapId:this._data.mapId,x:this._data.x, y:this._data.y},this._data.mapId);
            }else{
                ag.jsUtil.sendDataAll("sRelife",{id:this._data.id, mapId:this._data.mapId,x:this._data.x, y:this._data.y},this._data.mapId);
                this.changeMap((this._data.mapId=='t0' || this._data.mapId=='t12')?'t0':'t1');
            }
        }
    },



    getMapXYString:function(mapId,x,y){
        if(!mapId){
            mapId = this._data.mapId;
            x = this._data.x;
            y = this._data.y;
        }
        return ''+mapId+','+x+','+y;
    },


    //获得角色位置
    getLocation:function () {
        return {x:this._data.x,y:this._data.y};
    },
});
