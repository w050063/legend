/**
 * Created by bot.su on 2017/6/21.
 * 角色类
 */


module.exports = ag.class.extend({
    _data:null,
    _mst:null,
    ctor:function () {
        this._busy = false;
        this._bagLength = 0;
        this._wharehoseLength = 0;
    },


    setAIController:function (ai) {
        this._ai = ai;
    },


    //重置所有属性
    resetAllProp:function(){
        var mst = this.getMst();
        var lv = this._data.level;
        this._totalExp = this.getTotalExpFromDataBase();
        this._heal = this.getIsPlayer()?(mst.heal+Math.floor(mst.healAdd*lv)):mst.heal;
        this._attackSpeed = mst.attackSpeed;
        this._moveSpeed = mst.moveSpeed;
        this._cirt = 0;


        this._totalHP = this.getTotalHPFromDataBase();
        if(this.getIsPlayer()){
            var hurt = mst.hurt+Math.floor(mst.hurtAdd*lv);
            var defense = mst.defense+Math.floor(mst.defenseAdd*lv);
            var map = ag.itemManager._itemMap.getMap();
            for (var key in map) {
                var obj = map[key]._data;
                if (obj.owner == this._data.id && obj.puton>=0) {
                    var itemMst = ag.gameConst._itemMst[obj.mid];
                    if(itemMst.hurt)hurt+=itemMst.hurt;
                    if(itemMst.defense)defense+=itemMst.defense;
                }
            }

            //加上官职属性
            var office = this.getOfficeIndex();
            hurt+=ag.gameConst.officeHurt[office];
            defense+=ag.gameConst.officeDefense[office];


            //加上翅膀属性
            var wing = this.getWingIndex();
            hurt+=ag.gameConst.wingHurt[wing];
            defense+=ag.gameConst.wingDefense[wing];


            //加上转生属性
            var come = this._data.come;
            if(come>0){
                hurt+=ag.gameConst.comeHurt[come];
                defense+=ag.gameConst.comeDefense[come];
            }


            //加上元神属性
            var spirit = this.getSpiritIndex();
            if(spirit>0){
                hurt+=ag.gameConst.spiritHurt[spirit];
                defense+=ag.gameConst.spiritDefense[spirit];
                this._cirt += ag.gameConst.spiritCrit[spirit];
            }


            //加上套装属性
            var equipLv = this.getEquipLv();
            hurt+=ag.gameConst.equipHurt[equipLv];
            defense+=ag.gameConst.equipDefense[equipLv];

            this._hurt = hurt;
            this._defense = defense;
        }else{
            this._hurt = mst.hurt;
            this._defense = mst.defense;
        }
    },


    getTotalHPFromDataBase:function(){
        var mst = this.getMst();
        if(this.getIsPlayer()){
            var lv = this._data.level;

            var hpex = 0;//加上转生血量
            var come = this._data.come;
            if(come>0){
                if(this._data.type=='m0'){
                    hpex+=ag.gameConst.comeHPWarrior[come];
                }else if(this._data.type=='m1'){
                    hpex+=ag.gameConst.comeHPWizard[come];
                }else if(this._data.type=='m2'){
                    hpex+=ag.gameConst.comeHPTaoist[come];
                }
            }

            //加上套装属性
            var equipLv = this.getEquipLv();
            var tempArray = ag.gameConst.equipHPWarrior;
            if(this._data.type=='m1')tempArray = ag.gameConst.equipHPWizard;
            else if(this._data.type=='m2')tempArray = ag.gameConst.equipHPTaoist;
            hpex+=tempArray[equipLv];

            if(lv>51)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*8+mst.hpAdd[2]*4+mst.hpAdd[3]*4+mst.hpAdd[4]*(lv-51))+hpex;
            if(lv>47)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*8+mst.hpAdd[2]*4+mst.hpAdd[3]*(lv-47))+hpex;
            if(lv>43)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*8+mst.hpAdd[2]*(lv-43))+hpex;
            if(lv>35)return Math.floor(mst.hp+mst.hpAdd[0]*35+mst.hpAdd[1]*(lv-35))+hpex;
            return Math.floor(mst.hp+mst.hpAdd[0]*lv)+hpex;
        }
        return mst.hp;
    },

    getTotalExpFromDataBase:function(paramLevel){
        if(this.getIsPlayer()){
            var lv = paramLevel==undefined?this._data.level:paramLevel;
            var array = ag.gameConst.expDatabase;
            if(lv>50)return Math.floor(array[0]+array[1]*34+array[2]*8+array[3]*4+array[4]*4+array[5]*(lv-50));
            if(lv>46)return Math.floor(array[0]+array[1]*34+array[2]*8+array[3]*4+array[4]*(lv-46));
            if(lv>42)return Math.floor(array[0]+array[1]*34+array[2]*8+array[3]*(lv-42));
            if(lv>34)return Math.floor(array[0]+array[1]*34+array[2]*(lv-34));
            return Math.floor(array[0]+array[1]*lv);
        }
        return 0;
    },


    //获得套装属性
    getEquipLv:function(){
        var array = [];
        var map = ag.itemManager._itemMap.getMap();
        for(var key in map){
            var obj = map[key]._data;
            if(obj.owner==this._data.id && obj.puton>=0){
                array.push(ag.gameConst._itemMst[obj.mid].level);
            }
        }
        var lv = 0;
        if(array.length==13){
            lv = Math.min(array[0],array[1],array[2],array[3],array[4],array[5],array[6],array[7],array[8],array[9],array[10],array[11],array[12]);
        }
        return lv;
    },


    //获得当前的称号索引
    getOfficeIndex:function(){
        var office = 0;
        for(var i=0;i<ag.gameConst.officeProgress.length;++i){
            if(ag.gameConst.officeProgress[i]<=this._data.office){
                office = i;
            }
        }
        return office;
    },

    //获得当前的翅膀索引
    getWingIndex:function(){
        var wingIndex = 0;
        for(var i=0;i<ag.gameConst.wingProgress.length;++i){
            if(ag.gameConst.wingProgress[i]<=this._data.wing){
                wingIndex = i;
            }
        }
        return wingIndex;
    },


    //获得当前的翅膀索引
    getSpiritIndex:function(){
        var index = 0;
        for(var i=0;i<ag.gameConst.spiritArray.length;++i){
            if(ag.gameConst.spiritArray[i]<=this._data.spirit){
                index = i;
            }
        }
        return index;
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


    //下线
    offline:function(){
        if(this.getIsPlayer()){
            ag.jsUtil.sendDataExcept("sDeleteRole",this._data.id,this._data.id);
            if(this._tiger)ag.jsUtil.sendDataExcept("sDeleteRole",this._tiger._data.id,this._data.id);
            ag.deal.delDeal(this._data.id);
        }
    },


    //更换地图
    changeMap:function(transferId){
        var lastMap = this._data.mapId;
        var nowMap = null;
        var transferMst = ag.gameConst._transferMst[transferId];
        if(transferMst){
            var lastMapId = this._data.mapId;
            var mapId = transferMst.mapId;
            nowMap = mapId;

            if(lastMap!=nowMap){
                ag.jsUtil.sendDataExcept("sDeleteRole",this._data.id,this._data.id);
                if(this._tiger)ag.jsUtil.sendDataExcept("sDeleteRole",this._tiger._data.id,this._data.id);
            }


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
            ag.gameLayer._roleZoneMap[this._data.mapId].push(this._data.id);
            var index = ag.gameLayer._roleZoneMap[lastMap].indexOf(this._data.id);
            if(index!=-1)ag.gameLayer._roleZoneMap[lastMap].splice(index,1);
            if(this._tiger){
                oldStr = this._tiger.getMapXYString();
                this._tiger._data.mapId = mapId;
                this._tiger._data.x = pos.x;
                this._tiger._data.y = pos.y;
                ag.gameLayer._roleXYMap[oldStr].splice(ag.gameLayer._roleXYMap[oldStr].indexOf(this._tiger),1);
                if(ag.gameLayer._roleXYMap[oldStr].length==0)delete ag.gameLayer._roleXYMap[oldStr];
                if(!ag.gameLayer._roleXYMap[newStr])ag.gameLayer._roleXYMap[newStr] = [];
                ag.gameLayer._roleXYMap[newStr].push(this._tiger);
                ag.gameLayer._roleZoneMap[this._tiger._data.mapId].push(this._tiger._data.id);
                var index = ag.gameLayer._roleZoneMap[lastMap].indexOf(this._tiger._data.id);
                if(index!=-1)ag.gameLayer._roleZoneMap[lastMap].splice(index,1);
            }


            var map = ag.gameConst._terrainMap[mapId];
            if(!map.safe && this._data.level>47){
                ag.jsUtil.sendDataAll("sSystemNotify",'32%'+this._data.name+'%33%'+map.name+'%34');
            }

            //判断是否退出皇宫
            if(this.getIsPlayer() && (this._data.mapId=='t27' || lastMapId=='t27')){
                ag.shabake.reset();
            }
        }

        if(lastMap!=nowMap){
            ag.jsUtil.sendDataAll("sAddExp",{id:this._data.id,level:this._data.level,exp:this._exp},this._data.mapId);


            //重置玩家列表缓存
            ag.userManager._roleMapBack[this._data.id] = {};
            for(var key in  ag.userManager._roleMapBack){
                delete ag.userManager._roleMapBack[key][this._data.id];
            }
            //返回当前地图非自己的角色。
            var array = ag.gameLayer._roleZoneMap[this._data.mapId];
            for(var i=0;i<array.length;++i){
                var role = ag.gameLayer._roleMap[array[i]];
                if(role.getIsPlayer()){
                    if(ag.userManager.getOnline(role._data.id)){
                        if(role._data.id!=this._data.id){
                            var temp = JSON.parse(JSON.stringify(role._data));
                            this.sendRoleForCheckBack(this._data.id,temp);
                        }

                        if(role._tiger){
                            temp = JSON.parse(JSON.stringify(role._tiger._data));
                            this.sendRoleForCheckBack(this._data.id,temp);
                        }
                    }
                }else if(role.getIsMonster()){
                    var temp = JSON.parse(JSON.stringify(role._data));
                    this.sendRoleForCheckBack(this._data.id,temp);
                }
            }


            //通知其他人。
            var array = ag.gameLayer._roleZoneMap[this._data.mapId];
            for(var i=0;i<array.length;++i){
                var role = ag.gameLayer._roleMap[array[i]];
                if(role.getIsPlayer() && role._data.id!=this._data.id){
                    var temp = JSON.parse(JSON.stringify(this._data));
                    this.sendRoleForCheckBack(role._data.id,temp);
                    if(this._tiger){
                        temp = JSON.parse(JSON.stringify(this._tiger._data));
                        this.sendRoleForCheckBack(role._data.id,temp);
                    }
                }
            }
        }else{
            this.sendDataForMove();
        }



        //发送装备情况
        if(lastMap!=nowMap) {
            var map = ag.itemManager._itemMap.getMap();
            for (var key in map) {
                var itemData = map[key]._data;
                if (itemData.puton != ag.gameConst.putonAuctionShop) {
                    var role = ag.gameLayer.getRole(itemData.owner);
                    if ((role == this && !transferMst)
                        || (itemData.mapId == this._data.mapId && itemData.puton == ag.gameConst.putonGround)
                        || (role && role != this && role._data.mapId == this._data.mapId && itemData.puton >= 0 && ag.userManager.getOnline(role._data.id))) {
                        var temp = JSON.parse(JSON.stringify(itemData));
                        this.sendItemForCheckBack(this._data.id, temp);
                    }

                    //发给别人装备
                    if (role == this && itemData.puton >= 0) {
                        var temp2 = JSON.parse(JSON.stringify(itemData));
                        var array = ag.gameLayer._roleZoneMap[this._data.mapId];
                        for(var i=0;i<array.length;++i){
                            var role2 = ag.gameLayer._roleMap[array[i]];
                            if (role2.getIsPlayer() && role2._data.id != this._data.id) {
                                this.sendItemForCheckBack(role2._data.id, temp2);
                            }
                        }
                    }
                }
            }
        }

        //行会数据
        if(!transferMst) {
            for (var key in ag.guild._dataMap) {
                var temp = ag.guild._dataMap[key];
                var str = temp.member.length == 0 ? '' : temp.member.join(',');

                ag.jsUtil.sendDataAll("sGuildCreate", {result: 0, id: temp.id, name: temp.name, member: str});//ag add for test./行会成员
            }
        }
        //增加无敌
        ag.gameLayer.addInvincibile(this._data.id);
    },




    //发送道具，先检查备份
    sendRoleForCheckBack:function(id,temp){
        var back = ag.userManager._roleMapBack[id];
        if(back){
            delete temp.gold;
            delete temp.attackMode;
            //delete temp.practice;
            ag.jsUtil.sendData("sRole",temp,id);
            back[temp.id] = {id:temp.id,x:temp.x,y:temp.y};
        }
    },


    //发送道具，先检查备份
    sendItemForCheckBack:function(id,temp){
        var back = ag.userManager._itemMapBack[id];
        if(back){
            var obj = back[temp.id];
            if(!obj || obj.mapId!=temp.mapId || obj.x!=temp.x || obj.y!=temp.y || obj.owner!=temp.owner || obj.puton!=temp.puton){
                ag.jsUtil.sendData("sItem",temp,id);
                back[temp.id] = temp;
            }else{
                ag.jsUtil.sendData("sItemBack",temp.id,id);
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


        //忙碌状态
        this._busy = true;
        ag.actionManager.runAction(this,this._moveSpeed,function(){
            this._busy = false;
            this.idle();
        }.bind(this));


        //捡装备,是玩家,地上有东西,背包没满
        if(this.getIsPlayer()){
            var array = ag.itemManager.getDropByLocation(this._data.mapId,this.getLocation());
            var left = ag.gameConst.bagLength-this._bagLength;
            if(array.length>left && array.length>0){
                ag.jsUtil.sendData("sSystemNotify","35",this._data.id);
            }
            if(left>0 && array.length>0){
                var count = Math.min(array.length,left);
                for(var i=count-1;i>=0;--i){
                    var id = array[i]._data.id;
                    if(!array[i]._their || array[i]._their==this._data.id || ag.team.isSameTeam(array[i]._their,this._data.id)){
                        ag.itemManager.addBagItem(id,this._data.id);
                        ag.jsUtil.sendData("sItemBagAdd",id,this._data.id);
                        ag.jsUtil.sendDataExcept("sItemDisappear",id,this._data.id);
                    }else{
                        ag.jsUtil.sendData("sSystemNotify",'^'+(array[i]._duration-ag.gameConst.itemPickUpLeft)+"%36",this._data.id);
                    }
                }
            }


            //沙巴克检测
            if(this.getIsPlayer() && this._data.mapId=='t27'){
                ag.shabake.reset();
            }
        }
        this._state = ag.gameConst.stateMove;
        this.sendDataForMove();
    },


    sendDataForMove:function(){
        var key = '';

        //通知所有人=
        var myData = this._data;
        var msg = {id:myData.id, x:myData.x, y:myData.y};
        var array = ag.gameLayer._roleZoneMap[this._data.mapId];
        for(var i=0;i<array.length;++i){
            var role = ag.gameLayer._roleMap[array[i]];
            var back = array[i];
            var map = ag.userManager._roleMapBack[role._data.id];
            if(map && role._data.id!=this._data.id && role.getIsPlayer() && this.getDistance(role._data.id)<9){
                ag.jsUtil.sendData("sMove",msg,role._data.id);
                map[this._data.id] = {id:myData.id, x:myData.x, y:myData.y};
            }
        }

        //再检测自己身边有没有假死人
        var map = ag.userManager._roleMapBack[this._data.id];
        if(map){
            for(key in map){
                var back = map[key];
                var role = ag.gameLayer.getRole(back.id);
                if(role){
                    var dis = Math.max(Math.abs(this._data.x-back.x),Math.abs(this._data.y-back.y));
                    var dis2 = this.getDistance(role._data.id);
                    if((dis<9 || dis2<9) && back.x!=role._data.x && back.y!=role._data.y){
                        ag.jsUtil.sendData("sMove",{id:role._data.id, x:role._data.x, y:role._data.y},this._data.id);
                        map[key] = {id:role._data.id, x:role._data.x, y:role._data.y};
                    }

                    var back2 = ag.userManager._roleMapBack[role._data.id];
                    if(back2)back2 = back2[this._data.id];
                    if(back2){
                        var dis = Math.max(Math.abs(role._data.x-back2.x),Math.abs(role._data.y-back2.y));
                        if(dis<9){
                            ag.jsUtil.sendData("sMove",{id:this._data.id, x:this._data.x, y:this._data.y},role._data.id);
                            back2 = {id:this._data.id, x:this._data.x, y:this._data.y};
                        }
                    }
                }
            }
        }
    },


    sendHP:function(type){
        var msg = null;
        if(type==1){//正常，暴击，未命中
            msg = {id:this._data.id,hp:this._data.hp,type:1};
        }else if(type==2){
            msg = {id:this._data.id,type:2};
        }else{
            msg = {id:this._data.id,hp:this._data.hp};
        }
        if(this._data.hp<=0){
            var array = ag.gameLayer._roleZoneMap[this._data.mapId];
            for(var i=0;i<array.length;++i){
                var role = ag.gameLayer._roleMap[array[i]];
                if(role.getIsPlayer()){
                    ag.jsUtil.sendData("sHP",msg,role._data.id);
                }
            }
        }else{
            var array = ag.gameLayer._roleZoneMap[this._data.mapId];
            for(var i=0;i<array.length;++i){
                var role = ag.gameLayer._roleMap[array[i]];
                if(role.getIsPlayer() && this.getDistance(role._data.id)<9){
                    ag.jsUtil.sendData("sHP",msg,role._data.id);
                }
            }
        }
    },


    //掉血
    changeHPByHurt:function(attacker,hurt,bCisha){
        var rate = 0.9+Math.random()*0.2;
        var array = [1,(this.getIsPlayer()?0.8:0.5),0.03];
        if(!bCisha)bCisha = 0;
        var deDefense = this._defense*array[bCisha];
        var correct = (1+((this.getIsPlayer() && attacker.getIsPlayer())?0.02:0.03)*deDefense);
        var bCrit = Math.random()*100<(attacker._cirt-this._cirt/2);
        var value = 0;

        if(this.getIsMonster() && this.getMst().lv==11){
            value = Math.round(hurt*0.3/correct*rate);
        }else if(this.getIsMonster() && this.getMst().lv==10){
            value = Math.round(hurt*0.4/correct*rate);
        }else if(this.getIsMonster() && this.getMst().lv==9){
            value = Math.round(hurt*0.5/correct*rate);
        }else if(this._data.type=='m1'){
            if(attacker._data.type=='m1'){
                value = Math.round(hurt*0.75/correct*rate);
            }if(bCisha==ag.gameConst.fighterAttackFar){
                value = Math.round(hurt*0.55/correct*rate);
            }else{
                value = Math.round(hurt*0.32/correct*rate);
            }
        }else{
            value =  Math.round(hurt/correct*rate);
        }
        if(value<0)value = 0;
        this._data.hp -= value*(bCrit?1.5:1);
        if(this._data.hp<0)this._data.hp = 0;
        this.sendHP(bCrit?1:0);

        if(ag.gameLayer.isEnemyForAttack(attacker,this)) {
            if (attacker._tiger && attacker._tiger != this && attacker._tiger._state != ag.gameConst.stateDead && !attacker._tiger._ai._locked)attacker._tiger._ai._locked = this;//如果有老虎，操作老虎攻击敌人。
            if (this._tiger && this._tiger._state != ag.gameConst.stateDead && !this._tiger._ai._locked)this._tiger._ai._locked = attacker;//敌人有老虎，敌人老虎攻击自己。
        }
    },


    //攻击
    attack:function(locked){
        if(this._state==ag.gameConst.stateDead)return;
        var data = locked._data;
        var x = data.x, y = data.y;
        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),locked.getLocation());
        var i=0;


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
                        if(ag.buffManager.getCDForFireCrit(this)==false){
                            tempRole.changeHPByHurt(this,this._hurt*3,ag.gameConst.fighterAttackNear);
                        }else{
                            tempRole.changeHPByHurt(this,this._hurt,ag.gameConst.fighterAttackNear);
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
                            tempRole.changeHPByHurt(this,this._hurt*3,ag.gameConst.fighterAttackNear);
                        }else{
                            tempRole.changeHPByHurt(this,this._hurt,ag.gameConst.fighterAttackFar);
                        }
                        sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                    }
                }
            }
        }else if(this._data.type=='m1'){
            for(i=y-1;i<=y+1;++i){
                for(var j=x-1;j<=x+1;++j){
                    var array = ag.gameLayer._roleXYMap[''+data.mapId+','+j+','+i];
                    if(array){
                        for(var k=0;k<array.length;++k){
                            var tempRole = array[k];
                            if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                                tempRole.changeHPByHurt(this,this._hurt);
                                sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                            }
                        }
                    }
                }
            }


            //启动火墙
            var tempArray = ag.gameConst.searchEnemypath;
            for(i=0;i<9;++i){
                var x = locked._data.x+tempArray[i][0],y = locked._data.y+tempArray[i][1];
                if(ag.gameLayer.isCollision(this._data.mapId,x,y)==false){
                    ag.buffManager.setFireWall(this.getMapXYString(this._data.mapId,x,y),locked,this);
                }
            }
        }else if(this._data.type=='m2'){
            //启动毒
            ag.buffManager.setPoison(locked,this);


            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+x+','+y];
            if(array){
                for(var k=0;k<array.length;++k){
                    var tempRole = array[k];
                    if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                        tempRole.changeHPByHurt(this,this._hurt*2);
                        sendArray.push({id:tempRole._data.id,hp:tempRole._data.hp});
                    }
                }
            }
        }else if(this._data.type=='m8' || this._data.type=='m9' || this._data.type=="m27" || this._data.type=="m49" || this._data.type=="m50" || this._data.type=="m51" || this._data.type=="m52") {
            var array = ag.gameLayer.getRoleFromCenterXY(this._data.mapId,this.getLocation(),this.getMst().attackDistance);
            for(i = 0; i < array.length; ++i) {
                var tempRole = array[i];
                if (ag.gameLayer.isEnemyForAttack(this,tempRole)) {
                    tempRole.changeHPByHurt(this,this._hurt);
                    sendArray.push({id: tempRole._data.id, hp: tempRole._data.hp});
                }
            }
        }else{
            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+x+','+y];
            if(array){
                for(var k=0;k<array.length;++k){
                    var tempRole = array[k];
                    if(ag.gameLayer.isEnemyForAttack(this,tempRole)){
                        tempRole.changeHPByHurt(this,this._hurt);
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


        //通知所有人=
        var msg = {id:this._data.id,lockedId:locked._data.id};
        var array = ag.gameLayer._roleZoneMap[this._data.mapId];
        for(var i=0;i<array.length;++i){
            var role = ag.gameLayer._roleMap[array[i]];
            if(role.getIsPlayer() && role._data.id!=this._data.id
                && !ag.gameLayer._invincibleMap[role._data.id] && this.getDistance(role._data.id)<9){
                ag.jsUtil.sendData("sAttack",msg,role._data.id);
            }
        }


        //删除本地死亡怪物数据,更新AI锁定
        for(i=0;i<sendArray.length;++i){
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
            this._exp = this._exp-this._totalExp;
            this._totalExp = this.getTotalExpFromDataBase();
            this._totalHP = this.getTotalHPFromDataBase();
            this._data.hp = this._totalHP;
            ag.gameLayer.addDirty(this._data.id);
        }
        if(source){
            ag.jsUtil.sendDataAll("sAddExp",{id:this._data.id,level:this._data.level,exp:this._exp,source:source},this._data.mapId);
        }else{
            ag.jsUtil.sendDataAll("sAddExp",{id:this._data.id,level:this._data.level,exp:this._exp},this._data.mapId);
        }
    },


    addGold:function(count){
        this._data.gold += count;
        ag.jsUtil.sendData("sSetGold",this._data.gold,this._data.id);
    },


    addOffice:function(count){
        this._data.office += count;
        ag.jsUtil.sendDataAll("sSetOffice",{id:this._data.id,office:this._data.office},this._data.mapId);
    },


    addWing:function(count){
        this._data.wing += count;
        ag.jsUtil.sendDataAll("sSetWing",{id:this._data.id,wing:this._data.wing},this._data.mapId);
    },


    dead:function (attacker) {
        if(this._state==ag.gameConst.stateDead)return;
        this._state = ag.gameConst.stateDead;
        var master = (attacker && attacker._master)?attacker._master:attacker;
        
        //掉落装备
        if(master){
            var name = this._data.name;
            if(!name)name = this.getMst().name;
            if(this.getIsMonster()){
                var str = ag.gameConst._roleMst[this._data.type].drop;
                if(str){
                    ag.itemManager.drop(master._data.id,str,this._data.mapId,this.getLocation(),name);
                }
                ag.itemManager.dropByLevel(master._data.id,this.getMst().lv,this._data.mapId,this.getLocation(),name);
                ag.itemManager.dropByLevel(master._data.id,this.getMst().lv,this._data.mapId,this.getLocation(),name);
                if(this._data.type=='m48' || this._data.type=='m50' || this._data.type=='m52'){//玉皇大帝双倍爆率
                    ag.itemManager.dropByLevel(master._data.id,this.getMst().lv,this._data.mapId,this.getLocation(),name);
                }
            }else if(this.getIsPlayer()){
                ag.deal.delDeal(this._data.id);//死亡时如果正在交易，则取消交易
                if(Math.random()<0.2){
                    var array = [];
                    var map = ag.itemManager._itemMap.getMap();
                    for(var key in map){
                        var itemData = map[key]._data;
                        if(itemData.owner==this._data.id && itemData.puton>=0){
                            array.push(itemData.id);
                        }
                    }
                    ag.itemManager.dropEquipOneByArray(this,array,this._data.mapId,this.getLocation(),name);
                }
            }
        }

        
        if(attacker && attacker._data.camp!=ag.gameConst.campMonster){
            master.addExp(this.getMst().expDead);

            if(this.getIsPlayer()){
                ag.jsUtil.sendDataAll("sSystemNotify",master._data.name+'%37%'+this._data.name);
            }
        }



        ag.buffManager.delFireWallByDead(this);
        ag.buffManager.delPoisonByDead(this);
        //取消所有锁定自己的AI
        ag.gameLayer.delLockedRole(this);
        if(this._ai)this._ai._locked = null;
        if(this.getIsMonster()){
            ag.actionManager.delAll(this._ai);
            ag.actionManager.delAll(this);

            var str = this.getMapXYString();
            ag.gameLayer._roleXYMap[str].splice(ag.gameLayer._roleXYMap[str].indexOf(this),1);
            if(ag.gameLayer._roleXYMap[str].length==0)delete ag.gameLayer._roleXYMap[str];
            delete ag.gameLayer._roleMap[this._data.id];
            var index = ag.gameLayer._roleZoneMap[this._data.mapId].indexOf(this._data.id);
            if(index!=-1)ag.gameLayer._roleZoneMap[this._data.mapId].splice(index,1);
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

        //判断是否退出皇宫
        if(this.getIsPlayer() && this._data.mapId=='t27'){
            ag.shabake.reset();
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
                this.changeMap(ag.gameConst._terrainMap[this._data.mapId].tranCity);
                ag.jsUtil.sendDataAll("sRelife",{id:this._data.id, mapId:this._data.mapId,x:this._data.x, y:this._data.y},this._data.mapId);
            }
        }
    },


    //更换阵营
    changeCamp:function(camp){
        if(camp==ag.gameConst.campPlayerNone || camp==ag.gameConst.campPlayerQinglong || camp==ag.gameConst.campPlayerBaihu || camp==ag.gameConst.campPlayerZhuque || camp==ag.gameConst.campPlayerXuanwu){
            this._data.camp = camp;
            ag.jsUtil.sendDataAll("sCamp",{id:this._data.id, camp:camp},this._data.mapId);
            if(this._tiger){
                this._tiger._data.camp = camp;
                ag.jsUtil.sendDataAll("sCamp",{id:this._tiger._data.id, camp:camp},this._data.mapId);
            }
        }
    },

    getIsPlayer:function() {
        return this._data.camp != ag.gameConst.campMonster && this._data.camp != ag.gameConst.campNpc && this._data.type != 'm19';
    },

    getIsMonster:function() {
        return this._data.camp == ag.gameConst.campMonster;
    },

    getIsTiger:function() {
        return this._data.camp != ag.gameConst.campMonster && this._data.camp != ag.gameConst.campNpc && this._data.type=='m19';
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


    //是否在安全区
    isInSafe:function(){
        var safe = ag.gameConst._terrainMap[this._data.mapId].safe;
        if(safe){
            var lx1 = this.getLocation().x,ly1 = this.getLocation().y;
            if(lx1>=safe.x && lx1<=safe.xx && ly1>=safe.y && ly1<=safe.yy)return true;
        }
        return false;
    },


    getEquipIsEmpty:function(){
        var map = ag.itemManager._itemMap.getMap();
        for (var key in map) {
            var obj = map[key];
            if(obj._data.owner==this._data.id && obj._data.puton>=0){
                return false;
            }
        }
        return true;
    },


    getDistance:function(id){
        var role = ag.gameLayer.getRole(id);
        if(role && this._data.mapId==role._data.mapId){
            return Math.max(Math.abs(this._data.x-role._data.x),Math.abs(this._data.y-role._data.y));
        }
        return 9999;
    },
});
