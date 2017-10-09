/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色类
 */


var AGAniClothes = require("AGAniClothes");
var AIController = require("AIController");
var AGAni = require("AGAni");
cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (data) {
        this._data=data;
        this.resetAllProp();
        this._equipArray = [null,null,null,null,null];//装备序列
        for(var key in ag.userInfo._itemMap){
            var obj = ag.userInfo._itemMap[key];
            if(obj._data.owner==this._data.id && obj._data.puton){
                this.addEquip(obj._data.mid);
            }
        }


        this._weaponAni = null;
        this._wingAni = null;
        this._agAni = null;
        this._labelName = null;
        this.node.setScale(1.5);
        this._aniColor = cc.color(255,255,255,255);
        this.setLocation(cc.p(this._data.x,this._data.y));
        this.idle();
        this.changeHP(this._data.hp);



        //增加AI
        if(this == ag.gameLayer._player){
            this._ai = this.node.addComponent(AIController);
            this._ai.init(this);
        }


        //位置变化调用，第一次开始也调用一次
        this.node.on('position-changed', function (event) {
            this.setZorderAndMapPos();
        }.bind(this));
        this.setZorderAndMapPos();
    },


    addEquip:function(id){
        var mst = ag.gameConst._itemMst[id];
        if(mst.exclusive.indexOf(this.getTypeNum())!=-1){
            this._equipArray[mst.type] = id;
            if(this._state==ag.gameConst.stateIdle){
                this.idleAnimation();
            }
        }
    },



    delEquip:function(index){
        this._equipArray[index] = null;
        if(this._state==ag.gameConst.stateIdle){
            this.idleAnimation();
        }
    },


    getTypeNum:function(){
        if(this._data.type=='m0')return this._data.sex==ag.gameConst.sexBoy?0:1;
        if(this._data.type=='m1')return this._data.sex==ag.gameConst.sexBoy?2:3;
        if(this._data.type=='m2')return this._data.sex==ag.gameConst.sexBoy?4:5;
        return 0;
    },


    //刷新层级关系,设置地图位置
    setZorderAndMapPos:function(){
        //更新位置
        if(ag.gameLayer._player == this){
            ag.gameLayer._map.node.setPosition(-this.node.x,-this.node.y-40);
        }

        var zorder = Math.round(10000-this.node.y);
        this.node.setLocalZOrder(zorder);
    },



    //重置所有属性
    resetAllProp:function(){
        var mst = this.getMst();
        var lv = this._data.level;
        this._totalHP = mst.hp+mst.hpAdd*lv;
        this._heal = mst.heal+mst.healAdd*lv;
        this._attackSpeed = mst.attackSpeed;
        this._moveSpeed = mst.moveSpeed;
    },


    //增加经验
    addExp:function(level,exp){
        var last = this._data.level;
        this._data.level = level;
        if(last < this._data.level){
            this.resetAllProp();
            this._data.hp = this._totalHP;
            if(this==ag.gameLayer._player)ag.gameLayer.refreshEquip();
            this.changeHP(this._data.hp);
        }
    },


    //获得策划数据
    getMst : function(){
        return ag.gameConst._roleMst[this._data.type];
    },


    //设置动画颜色
    setAniColor:function(color){
        this._aniColor = color;
        if(this._agAni)this._agAni.setColor(this._aniColor);
    },


    //设置逻辑位置
    setLocation:function(location){
        this._data.x = location.x;
        this._data.y = location.y;
        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        this.node.setPosition((this._data.x-mapData.mapX/2)*mapData.tileX,(this._data.y-mapData.mapY/2)*mapData.tileY);


        //优化显示和隐藏,上下左右各多两个地块,超过1.9就认为要更新了
        if(this._state!=ag.gameConst.stateDead){
            var x = ag.gameLayer._player._data.x,y = ag.gameLayer._player._data.y;
            if(ag.gameLayer._player == this){
                ag.gameLayer._labelLocation.string = '新手村 '+this._data.x+','+this._data.y;
                for(var key in  ag.gameLayer._roleMap){
                    ag.gameLayer._roleMap[key].resetNearFlag(x,y);
                }
            }else{
                this.resetNearFlag(x,y);
            }
        }
    },


    resetNearFlag:function(x,y){
        this._nearFlag = !!(Math.abs(this._data.x-x)<7 && Math.abs(this._data.y-y)<7);
        if(this._nearFlag){
            if(!this._agAni){
                this.idleAnimation();
            }
            if(!this._propNode){
                this._propNode = ag.jsUtil.getCacheNode('prefab/nodeRoleProp',this.node);
                this._propNode._labelName.string = this._data.name?this._data.name:ag.gameConst._roleMst[this._data.type].name;
                this._propNode._labelName.node.color = ag.gameLayer.isEnemyCamp(this,ag.gameLayer._player)?cc.color(255,0,0):cc.color(255,255,255);
                this._propNode._progressBarHP.progress = this._data.hp/this._totalHP;
                this._propNode._labelHP.string = ""+this._data.hp+"/"+this._totalHP+" Lv:"+(this._data.camp==ag.gameConst.campMonster?this.getMst().lv:this._data.level);
            }
        }else{
            if(this._agAni){
                ag.agAniCache.put(this._agAni);
                this._agAni = null;
            }
            if(this._propNode){
                ag.jsUtil.putCacheNode(this._propNode);
                this._propNode = null;
            }
        }
    },


    //无事可做动画
    idleAnimation:function(){
        if(this._nearFlag){
            if(this._data.camp==ag.gameConst.campMonster){
                var model = ag.gameConst._roleMst[this._data.type].model;
                if(!model){
                    this.dead();
                    return;
                }
                var clothes = model+'0';
                var array = AGAniClothes[clothes+ag.gameConst.stateIdle+this._data.direction].split(',');
                if(this._agAni)ag.agAniCache.put(this._agAni);
                this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,0.3);
                this._agAni.setColor(this._aniColor);
            }else{
                //衣服
                var array = AGAniClothes['nudeboy0'+ag.gameConst.stateIdle+this._data.direction].split(',');
                var endName = array[0].substr(array[0].length-3);
                var name = (this._data.sex==0?'ani/hum1/000':'ani/hum1/001');
                if(this._equipArray[1])name = ag.gameConst._itemMst[this._equipArray[1]].model;
                if(this._agAni)ag.agAniCache.put(this._agAni);
                this._agAni = ag.agAniCache.getNode(this.node,name+endName,parseInt(array[1]),ag.gameConst.roleAniZorder,0.3);
                this._agAni.setColor(this._aniColor);
                //武器
                if(this._weaponAni){ag.agAniCache.put(this._weaponAni);this._weaponAni = undefined;}
                if(this._equipArray[0]){
                    var mst = ag.gameConst._itemMst[this._equipArray[0]];
                    this._weaponAni = ag.agAniCache.getNode(this.node,mst.model+endName,parseInt(array[1]),ag.gameConst.roleWeaponZorder[this._data.direction],0.3);
                    this._weaponAni.setColor(this._aniColor);
                    this._agAni.getComponent(AGAni).addControl(this._weaponAni.getComponent(AGAni));
                }
                //翅膀
                if(this._wingAni){ag.agAniCache.put(this._wingAni);this._wingAni = undefined;}
                if(this._equipArray[2]){
                    var mst = ag.gameConst._itemMst[this._equipArray[2]];
                    this._wingAni = ag.agAniCache.getNode(this.node,mst.model+endName,parseInt(array[1]),ag.gameConst.roleWingZorder,0.3);
                    this._wingAni.setColor(this._aniColor);
                    this._agAni.getComponent(AGAni).addControl(this._wingAni.getComponent(AGAni));
                }
            }
        }
    },


    //无事可以做状态，可以重复进入
    idle:function(){
        if(this._state != ag.gameConst.stateIdle && this._state != ag.gameConst.stateDead){
            this.node.stopAllActions();
            if(this._data.camp!=ag.gameConst.campMonster && this._state == ag.gameConst.stateAttack){
                if(this._agAni)this._agAni.getComponent(AGAni).pause();
                if(this._weaponAni)this._weaponAni.getComponent(AGAni).pause();
                if(this._wingAni)this._wingAni.getComponent(AGAni).pause();
                this.node.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function(){
                    this.idleAnimation();
                }.bind(this))));
            }else{
                this.idleAnimation();
            }
            this._state = ag.gameConst.stateIdle;
        }
    },


    //按方向移动
    move:function(location,bServer) {
        if(this._state==ag.gameConst.stateDead)return;
        if(Math.abs(this._data.x-location.x)>1 || Math.abs(this._data.y-location.y)>1){
            this.node.stopAllActions();
            this.setLocation(location);
            return true;
        }

        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),location);
        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var temp = cc.p((this._data.x-mapData.mapX/2)*mapData.tileX,(this._data.y-mapData.mapY/2)*mapData.tileY);
        this.setLocation(location);
        this.node.setPosition(temp);


        if(this._nearFlag){
            var mapData = ag.gameConst._terrainMap[this._data.mapId];
            var x = this._data.x - mapData.mapX / 2;
            var y = this._data.y - mapData.mapY / 2;
            var moveSpeed = this._data.camp==ag.gameConst.campMonster ? 0.8:this._moveSpeed;//怪物始终是一个播放速度，走完后等待
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(cc.moveTo(moveSpeed, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
                if(bServer){
                    this.idle();
                }else{
                    if(this._ai)this._ai._busy = false;
                }
            }.bind(this))));
            if(this._data.camp==ag.gameConst.campMonster){
                var clothes = ag.gameConst._roleMst[this._data.type].model+'0';
                var array = AGAniClothes[clothes+ag.gameConst.stateMove+this._data.direction].split(',');
                if(this._agAni)ag.agAniCache.put(this._agAni);
                var count = parseInt(array[1]);
                this._agAni = ag.agAniCache.getNode(this.node,array[0],count,ag.gameConst.roleAniZorder,moveSpeed/count);
                this._agAni.setColor(this._aniColor);
            }else{
                //衣服
                var array = AGAniClothes['nudeboy0'+ag.gameConst.stateMove+this._data.direction].split(',');
                var count = parseInt(array[1]);
                var endName = array[0].substr(array[0].length-3);
                var name = (this._data.sex==0?'ani/hum1/000':'ani/hum1/001');
                if(this._equipArray[1])name = ag.gameConst._itemMst[this._equipArray[1]].model;
                if(this._agAni)ag.agAniCache.put(this._agAni);
                this._agAni = ag.agAniCache.getNode(this.node,name+endName,parseInt(array[1]),ag.gameConst.roleAniZorder,moveSpeed/count);
                this._agAni.setColor(this._aniColor);
                //武器
                if(this._weaponAni){ag.agAniCache.put(this._weaponAni);this._weaponAni = undefined;}
                if(this._equipArray[0]){
                    var mst = ag.gameConst._itemMst[this._equipArray[0]];
                    this._weaponAni = ag.agAniCache.getNode(this.node,mst.model+endName,count,ag.gameConst.roleWeaponZorder[this._data.direction],moveSpeed/count);
                    this._weaponAni.setColor(this._aniColor);
                    this._agAni.getComponent(AGAni).addControl(this._weaponAni.getComponent(AGAni));
                }
                //翅膀
                if(this._wingAni){ag.agAniCache.put(this._wingAni);this._wingAni = undefined;}
                if(this._equipArray[2]){
                    var mst = ag.gameConst._itemMst[this._equipArray[2]];
                    this._wingAni = ag.agAniCache.getNode(this.node,mst.model+endName,count,ag.gameConst.roleWingZorder,moveSpeed/count);
                    this._wingAni.setColor(this._aniColor);
                    this._agAni.getComponent(AGAni).addControl(this._wingAni.getComponent(AGAni));
                }
            }

            //最后变更状态
            this._state = ag.gameConst.stateMove;
        }else{
            var mapData = ag.gameConst._terrainMap[this._data.mapId];
            this.node.stopAllActions();
            this.node.setPosition(cc.p((this._data.x-mapData.mapX/2)*mapData.tileX,(this._data.y-mapData.mapY/2)*mapData.tileY));
        }

        //向服务器发送
        if (this == ag.gameLayer._player) {
            var myData = this._data;
            ag.agSocket.send("move",{x: myData.x, y: myData.y});
        }
        return true;
    },


    //按方向移动,强制玩家位置
    myMoveByServer:function(location) {
        this.node.stopAllActions();
        //this._data.x = location.x;
        //this._data.y = location.y;
        //var mapData = ag.gameConst._terrainMap[this._data.mapId];
        //var x = this._data.x - mapData.mapX / 2;
        //var y = this._data.y - mapData.mapY / 2;
        //this.node.setPosition(cc.p(x * mapData.tileX, y * mapData.tileY));
        this.setLocation(location);
        this.idle();
        if(this._ai)this._ai._busy = false;
    },


    attack:function(locked,bServer){
        if(this._state==ag.gameConst.stateDead)return;
        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),locked.getLocation());
        //攻击动画
        if(this._nearFlag){
            this.node.stopAllActions();
            if(this._data.camp==ag.gameConst.campMonster){
                var clothes = ag.gameConst._roleMst[this._data.type].model+'0';
                var array = AGAniClothes[clothes+ag.gameConst.stateAttack+this._data.direction].split(',');
                if(this._agAni)ag.agAniCache.put(this._agAni);
                this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,0.1,function(){
                    this.idle();
                }.bind(this));
                this._agAni.setColor(this._aniColor);
            }else{
                //衣服
                var name = (this._data.sex==0?'ani/hum1/000':'ani/hum1/001');
                if(this._equipArray[1])name = ag.gameConst._itemMst[this._equipArray[1]].model;
                var attackCode = ag.gameConst.stateAttack;//判断是攻击动作,还是施法动作
                if(this._data.type=="m1" || this._data.type=="m2")++attackCode;
                var array = AGAniClothes['nudeboy0'+attackCode+this._data.direction].split(',');
                var endName = array[0].substr(array[0].length-3);
                if(this._agAni)ag.agAniCache.put(this._agAni);
                this._agAni = ag.agAniCache.getNode(this.node,name+endName,parseInt(array[1]),ag.gameConst.roleAniZorder,0.1,function(){
                    this.idle();
                }.bind(this));
                this._agAni.setColor(this._aniColor);
                //武器
                if(this._weaponAni){ag.agAniCache.put(this._weaponAni);this._weaponAni = undefined;}
                if(this._equipArray[0]){
                    var mst = ag.gameConst._itemMst[this._equipArray[0]];
                    this._weaponAni = ag.agAniCache.getNode(this.node,mst.model+endName,parseInt(array[1]),ag.gameConst.roleWeaponZorder[this._data.direction],0.1);
                    this._weaponAni.setColor(this._aniColor);
                    this._agAni.getComponent(AGAni).addControl(this._weaponAni.getComponent(AGAni));
                }
                //翅膀
                if(this._wingAni){ag.agAniCache.put(this._wingAni);this._wingAni = undefined;}
                if(this._equipArray[2]){
                    var mst = ag.gameConst._itemMst[this._equipArray[2]];
                    this._wingAni = ag.agAniCache.getNode(this.node,mst.model+endName,parseInt(array[1]),ag.gameConst.roleWingZorder,0.1);
                    this._wingAni.setColor(this._aniColor);
                    this._agAni.getComponent(AGAni).addControl(this._wingAni.getComponent(AGAni));
                }
            }

            ag.gameLayer.node.runAction(cc.sequence(cc.delayTime(this._attackSpeed),cc.callFunc(function(){
                if(this._ai)this._ai._busy = false;
            }.bind(this))));

            //攻击特效
            this.attackEffect(locked);

            //最后变更状态
            this._state = ag.gameConst.stateAttack;
        }


        //向服务器发送
        if (!bServer && this == ag.gameLayer._player) {
            ag.agSocket.send("attack",{id:locked._data.id});
        }
    },

    //攻击特效
    attackEffect: function (locked) {
        if(this._data.type=="m0"){
            if(ag.buffManager.getCDForFireCrit(this)==false){
                if(Math.random()>0.5){
                    ag.agAniCache.getEffect(this.node,"ani/effect2/"+(502000+this._data.direction*5),5,ag.gameConst.roleEffectZorder,0.1);
                }else{
                    ag.agAniCache.getEffect(this.node,"ani/effect2/"+(503000+this._data.direction*8),8,ag.gameConst.roleEffectZorder,0.1);
                }
                ag.buffManager.setCDForFireCrit(this,true);
                cc.audioEngine.play(cc.url.raw("resources/music/hit.mp3"),false,1);
            }else{
                if(Math.random()>0.5){
                    ag.agAniCache.getEffect(this.node,"ani/effect1/"+(500000+this._data.direction*6),6,ag.gameConst.roleEffectZorder,0.1);
                }else{
                    ag.agAniCache.getEffect(this.node,"ani/effect1/"+(501000+this._data.direction*6),6,ag.gameConst.roleEffectZorder,0.1);
                }
            }
        }else if(this._data.type=="m1"){
            var pos = locked.getTruePosition();
            if(Math.random()>0.5){
                ag.agAniCache.getNode(this.node,"ani/effect3/504000",6,ag.gameConst.roleEffectUnderZorder,0.05,function(sender){
                    ag.agAniCache.put(sender.node);
                    var node = ag.agAniCache.getEffect(ag.gameLayer._map.node,"ani/effect3/504006",13,ag.gameConst.roleEffectZorder,0.05);
                    node.getComponent(AGAni).setAniPosition(pos);
                }.bind(this));
            }else{
                ag.agAniCache.getNode(this.node,"ani/effect3/505000",10,ag.gameConst.roleEffectUnderZorder,0.05,function(sender){
                    ag.agAniCache.put(sender.node);
                    var node = ag.agAniCache.getEffect(ag.gameLayer._map.node,"ani/effect3/505010",13,ag.gameConst.roleEffectZorder,0.05);
                    node.getComponent(AGAni).setAniPosition(pos);
                }.bind(this));
            }
        }else if(this._data.type=="m2"){
            var lockedId = locked._data.id;
            var pos1 = cc.pAdd(this.node.getPosition(),cc.p(0,70*this.node.scale));
            var pos2 = cc.pAdd(locked.node.getPosition(),cc.p(0,70*this.node.scale));
            ag.agAniCache.getNode(this.node,"ani/effect3/509000",6,ag.gameConst.roleEffectZorder,0.05,function(sender){
                ag.agAniCache.put(sender.node);
                var node = new cc.Node();
                node.setPosition(pos1);
                var rotation = Math.round(cc.radiansToDegrees(cc.pToAngle(cc.pSub(pos2,pos1))));
                node.setRotation( 90-rotation);
                ag.gameLayer._map.node.addChild(node,999999);
                node.addComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/effect3",cc.SpriteAtlas).getSpriteFrame(Math.random()>0.5?'508000':'509015');
                node.runAction(cc.sequence(cc.moveTo(cc.pDistance(pos1,pos2)/2000,pos2),cc.callFunc(function () {
                    node.destroy();
                    if(ag.gameLayer.getRole(lockedId)){
                        ag.agAniCache.getEffect(locked.node,"ani/effect3/509006",9,ag.gameConst.roleEffectZorder,0.05);
                    }
                })));
            }.bind(this));


            //道士启用毒
            ag.buffManager.setPoison(locked,this);
        }else if(this._data.type=="m5" || this._data.type=="m18"){
            var pos1 = cc.pAdd(this.node.getPosition(),cc.p(0,60*this.node.scale));
            var pos2 = cc.pAdd(locked.node.getPosition(),cc.p(0,35*this.node.scale));
            var node = new cc.Node();
            var sprite = node.addComponent(cc.Sprite);
            node.setPosition(pos1);
            var rotation = Math.round(cc.radiansToDegrees(cc.pToAngle(cc.pSub(pos2,pos1))));
            node.setRotation( 90-rotation);
            ag.gameLayer._map.node.addChild(node,ag.gameConst.roleEffectZorder);
            sprite.spriteFrame = cc.loader.getRes("ani/effect3",cc.SpriteAtlas).getSpriteFrame('511000');
            node.runAction(cc.sequence(cc.delayTime(6*0.15),cc.moveTo(cc.pDistance(pos1,pos2)/1000,pos2),cc.callFunc(function () {
                node.destroy();
            })));
        }else if(this._data.type=="m9") {
            var array = ag.gameLayer.getRoleFromCenterXY(this._data.mapId,this.getLocation(), this.getMst().attackDistance);
            for (var i = 0; i < array.length; ++i) {
                if(ag.gameLayer.isEnemyCamp(this,array[i])){
                    var pos = array[i].getTruePosition();
                    var node = ag.agAniCache.getEffect(ag.gameLayer._map.node,"ani/effect3/510000",6,ag.gameConst.roleEffectZorder,0.15);
                    node.setScale(2);
                    node.getComponent(AGAni).setAniPosition(pos);
                }
            }
        }
    },


    //飘雪动画
    flyAnimation:function(){
        if(!this._flyBloodFlag){
            var hpStr = null;
            for(var i=0;i<ag.gameLayer._flyBloodArray.length;++i){
                if(this._data.id==ag.gameLayer._flyBloodArray[i].id){
                    hpStr = ag.gameLayer._flyBloodArray[i].hp;
                    ag.gameLayer._flyBloodArray.splice(i,1);
                    break;
                }
            }

            if(hpStr){
                this._flyBloodFlag = true;
                var node = new cc.Node();
                var tips = node.addComponent(cc.Label);
                node.x = 0;
                node.y = 71;
                tips.string = hpStr;
                node.color = (hpStr[0]=='+')?cc.color(0,255,0,255):cc.color(255,0,0,255);
                this.node.addChild(node,30);
                node.runAction(cc.sequence(cc.moveBy(0.4, cc.p(0,30)), cc.fadeOut(0.2),cc.callFunc(function(){
                    node.destroy();
                })));

                var id = this._data.id;
                ag.gameLayer.node.runAction(cc.sequence(cc.delayTime(0.2),cc.callFunc(function(){
                    var role = ag.gameLayer.getRole(id);
                    if(role){
                        role._flyBloodFlag = false;
                        role.flyAnimation();
                    }else{
                        for(var i=ag.gameLayer._flyBloodArray.length-1;i>=0;--i){
                            if(id==ag.gameLayer._flyBloodArray[i].id){
                                ag.gameLayer._flyBloodArray.splice(i,1);
                            }
                        }
                    }
                })));
            }else{
                this._flyBloodFlag = false;
            }
        }
    },


    //血量变化
    changeHP:function(hp){
        if(hp!=this._data.hp){
            if(this._nearFlag){
                ag.gameLayer._flyBloodArray.push({id:this._data.id,hp:(hp>this._data.hp?("+"+(hp-this._data.hp)):(""+(hp-this._data.hp)))});
                this.flyAnimation();
                if(this._propNode){
                    this._propNode._progressBarHP.progress = hp/this._totalHP;
                    this._propNode._labelHP.string = ""+hp+"/"+this._totalHP+" Lv:"+(this._data.camp==ag.gameConst.campMonster?this.getMst().lv:this._data.level);
                }
            }

            this._data.hp = hp;
        }
        if(this._data.hp<=0){//判断死亡
            this.dead();
        }
    },


    //死亡
    dead:function () {
        if(this._state==ag.gameConst.stateDead)return;
        this._state = ag.gameConst.stateDead;
        ag.buffManager.delFireWallByDead(this);
        ag.buffManager.delPoisonByDead(this);
        //取消所有锁定自己的AI
        ag.gameLayer.delLockedRole(this);
        if(this._ai)this._ai._locked = null;
        if(this._data.camp==ag.gameConst.campMonster){
            this.node.destroy();
            delete ag.gameLayer._roleMap[this._data.id];
        }else{
            this.node.active = false;
            if(this==ag.gameLayer._player && !ag.gameLayer.bShowRelife){
                ag.gameLayer.bShowRelife = true;
                ag.jsUtil.alert(ag.gameLayer.node,'重新复活!',function () {
                    ag.gameLayer.bShowRelife = undefined;
                    ag.agSocket.send("relife",{});
                });
            }
        }
    },


    //复活
    relife:function(){
        if(this._state == ag.gameConst.stateDead){
            this.node.active = true;
            this.changeHP(this._totalHP);
            this.idleAnimation();
            this._state = ag.gameConst.stateIdle;
            if(this._ai)this._ai._busy = false;
            this.setLocation(this.getLocation());


            if(this._nearFlag){
                //复活飘字
                var node = new cc.Node();
                var tips = node.addComponent(cc.Label);
                node.x = 0;
                node.y = 87;
                tips.fontSize = 12;
                node.color = cc.color(0,255,0,255);
                tips.string = "站起来还是一条好汉！！！";
                this.node.addChild(node,30);
                node.runAction(cc.sequence(cc.delayTime(3), cc.fadeOut(0.2),cc.callFunc(function(){
                    node.destroy();
                })));
            }
        }
    },


    getMapXYString:function(){
        return ''+this._data.mapId+','+this._data.x+','+this._data.y;
    },


    //获得角色位置
    getLocation:function () {
        return cc.p(this._data.x,this._data.y);
    },


    //获得逻辑上的position
    getTruePosition:function () {
        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = parseInt(this._data.x)-mapData.mapX/2;
        var y = parseInt(this._data.y)-mapData.mapY/2;
        return cc.p(x*mapData.tileX,y*mapData.tileY);
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


    //获得触摸的角色
    getPlayerForTouch:function(touch){
        var point = ag.gameLayer._map.node.convertToNodeSpaceAR(touch.getLocation());
        //计算玩家选中的角色
        var locked = null;
        var map = ag.gameLayer._roleMap;
        for(var key in map){
            var p = map[key].node.getPosition();
            if(!locked || p.y<locked.node.getPositionY()){
                if(ag.gameLayer.isEnemyCamp(map[key],this) && point.x>p.x-40 && point.x<p.x+40 && point.y>p.y && point.y< p.y+120){
                    locked = map[key];
                }
            }
        }
        return locked;
    },



    // called every frame
    update: function (dt) {
    },
});
