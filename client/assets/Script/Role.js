/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色类
 */


var AGAniClothes = require("AGAniClothes");
var AIController = require("AIController");
var AGAni = require("AGAni");
var AGAniOffset = require("AGAniOffset");
cc.Class({
    extends: cc.Component,
    properties: {},


    //初始化角色
    init: function (data) {
        this._data=data;
        this.resetAllProp();
        this._equipArray = [null,null,null,null,null,null,null,null,null,null,null,null,null];//装备序列
        for(var key in ag.userInfo._itemMap){
            var data = ag.userInfo._itemMap[key]._data;
            if(data.owner==this){
                if(typeof data.puton=='number'){
                    this.addEquip(data.id);
                    if(this==ag.gameLayer._player)ag.gameLayer.itemBagToEquip(data.id);
                }else{
                    if(this==ag.gameLayer._player)ag.gameLayer.itemEquipToBag(data.id);
                }
            }
        }


        this._weaponAni = null;
        this._wingAni = null;
        this._agAni = null;
        this._labelName = null;
        this._aniColor = cc.color(255,255,255,255);
        this.setLocation(cc.p(this._data.x,this._data.y));
        this.idle();
        this.changeHP(this._data.hp);


        //法师的盾
        if(this._data.type=='m1'){
            var sprite = ag.spriteCache.get('ani/effect8/513000');
            var array = AGAniOffset[513000].split(',');
            sprite.node.setPosition(array[0],array[1]);
            //sprite.node.opacity = 128;
            this.node.addChild(sprite.node,ag.gameConst.roleEffectZorder);
        }



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
        var data = ag.userInfo._itemMap[id]._data;
        var mst = ag.gameConst._itemMst[data.mid];
        //var puton = ag.gameConst.putonTypes.indexOf(mst.type);
        var puton = data.puton;
            this._equipArray[puton] = id;
        if(this._state==ag.gameConst.stateIdle){
            this.idleAnimation();
        }
    },


    delEquip:function(id){
        var index = this._equipArray.indexOf(id);
        if(index!=-1){
            this._equipArray[index] = null;
            if(this._state==ag.gameConst.stateIdle){
                this.idleAnimation();
            }
            return true;
        }
        return false;
    },


    getTypeNum:function(){
        if(this._data.type=='m0')return this._data.sex==ag.gameConst.sexBoy?0:1;
        if(this._data.type=='m1')return this._data.sex==ag.gameConst.sexBoy?2:3;
        if(this._data.type=='m2')return this._data.sex==ag.gameConst.sexBoy?4:5;
        return 0;
    },


    //刷新层级关系,设置地图位置
    setZorderAndMapPos:function(){
        if(!ag.gameLayer)return;
        //更新位置
        if(ag.gameLayer._player == this){
            var scale = ag.gameLayer._map.node.getScale();
            ag.gameLayer._map.node.setPosition(Math.round(-this.node.x*scale),Math.round((-this.node.y-40)*scale));
            ag.gameLayer._nameMap.node.setPosition(Math.round(-this.node.x*scale),Math.round((-this.node.y-40)*scale));
        }

        var zorder = Math.round(10000-this.node.y);
        this.node.setLocalZOrder(zorder);
        if(this._propNode)this._propNode.setPosition(this.node.getPosition());
    },



    //重置所有属性
    resetAllProp:function(){
        var mst = this.getMst();
        if(mst){
            var lv = this._data.level;
            this._totalHP = this.getTotalHPFromDataBase();
            this._totalExp = this.getTotalExpFromDataBase();
            this._heal = mst.heal+Math.floor(mst.healAdd*lv);
            this._attackSpeed = mst.attackSpeed;
            this._moveSpeed = mst.moveSpeed;
        }
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


    //增加经验
    addExp:function(level,exp,source){
        var bShowLevelUp = false;
        var last = this._data.level;
        this._data.level = level;
        if(last < this._data.level){
            this.resetAllProp();
            this._data.hp = 1;//确保可以进入改血量
            if(this==ag.gameLayer._player) {
                ag.gameLayer.refreshEquip();
                ag.jsUtil.showText(ag.gameLayer.node, '升级！！！');
            }
            cc.audioEngine.play(cc.url.raw("resources/voice/levelup.mp3"),false,1);
            var node = ag.jsUtil.getEffect(this.node,"ani/effect8/512000",15,ag.gameConst.roleEffectZorder,0.1);
            node.setScale(0.5);
            bShowLevelUp = true;
            this.changeHP(this._totalHP);
        }
        if(this==ag.gameLayer._player){
            ag.gameLayer._equipArray[7].string = '等级:'+this._data.level;
            ag.gameLayer._equipArray[8].string = '经验:'+exp+'/'+this._totalExp+' ('+(100*exp/this._totalExp).toFixed(2)+'%)';
            if(source && bShowLevelUp==false){
                ag.jsUtil.showText(ag.gameLayer.node,'装备回收成功');
            }
        }
        if(last < this._data.level && this==ag.gameLayer._player && this._data.mapId=='t12' && this._data.level>=35){
            ag.gameLayer.changeMap('t1');
            ag.agSocket.send("changeMap",'t1');
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
        this.node.setPosition(this.getTruePosition());


        //优化显示和隐藏,上下左右各多两个地块,超过1.9就认为要更新了
        if(this._state!=ag.gameConst.stateDead){
            var x = ag.gameLayer._player._data.x,y = ag.gameLayer._player._data.y;
            if(ag.gameLayer._player == this){
                ag.gameLayer._map.setCenter(location);
                ag.gameLayer.resetMinMapPos();
                for(var key in  ag.gameLayer._roleMap){
                    ag.gameLayer._roleMap[key].resetNearFlag(x,y);
                }
            }else{
                this.resetNearFlag(x,y);
            }
        }
    },


    resetNearFlag:function(x,y){
        this._nearFlag = !!(Math.abs(this._data.x-x)<9 && Math.abs(this._data.y-y)<9);
        if(this._nearFlag){
            if(!this._agAni){
                this.idleAnimation();
            }

            //人名字创建
            if(!this._propNode && this.node.active){
                this._propNode = ag.jsUtil.getCacheNode('prefab/nodeRoleProp',ag.gameLayer._nameMap.node);
                this._propNode.setPosition(this.node.getPosition());
                if(this._data.camp==ag.gameConst.campNpc){
                    this._propNode._progressBarHP.progress = 1;
                    this._propNode._labelHP.string = "npc";
                }else{
                    this._propNode._progressBarHP.progress = this._data.hp/this._totalHP;
                    this._propNode._labelHP.string = ""+this._data.hp+"/"+this._totalHP+" Lv:"+(this._data.camp==ag.gameConst.campMonster?this.getMst().lv:this._data.level);
                }
                var name = '';
                if(this._data.camp==ag.gameConst.campNpc || this._data.type=='m19')name = this._data.name;
                else if(this._data.camp==ag.gameConst.campMonster)name = ag.gameConst._roleMst[this._data.type].name;
                else name = this._data.name+'('+ag.gameConst._roleMst[this._data.type].name+')';
                this._propNode._labelName.string = name;
                if(this._data.camp==ag.gameConst.campMonster || this._data.camp==ag.gameConst.campNpc){
                    this._propNode._labelName.node.color = cc.color(255,255,255);
                }else{
                    this._propNode._labelName.node.color = cc.color(255,255,255);
                }
                if(this._data.camp==ag.gameConst.campMonster || this._data.type=='19'){
                    this._propNode._labelHP.node.opacity = 0;
                    this._propNode._labelName.node.opacity = 0;
                }else{
                    this._propNode._labelHP.node.opacity = 255;
                    this._propNode._labelName.node.opacity = 255;
                }
            }

            //小地图上的点创建
            if(!this._minMapNode && this.node.active){
                this._minMapNode = new cc.Node();
                var sprite = this._minMapNode.addComponent(cc.Sprite);
                sprite.spriteFrame = ag.gameLayer._nodeMinMapPlayer.getComponent(cc.Sprite).spriteFrame.clone();
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                this._minMapNode.setContentSize(ag.gameLayer._nodeMinMapPlayer.getContentSize());
                ag.gameLayer._spriteTopRight.node.addChild(this._minMapNode);
                if(this==ag.gameLayer._player){
                    this._minMapNode.color = cc.color(0,255,0);
                }else if(this._data.camp==ag.gameConst.campNpc){
                    this._minMapNode.color = cc.color(0,0,255);
                }else if(this._data.camp==ag.gameConst.campMonster || this._data.type=='19'){
                    this._minMapNode.color = cc.color(255,0,0);
                }else if(this._data.camp==ag.gameConst.campLiuxing){
                    this._minMapNode.color = cc.color(255,255,0);
                }
            }
            this.updateMinMapNodePos();
        }else{
            if(this._agAni){
                this._agAni.getComponent(AGAni).putCache();
                this._agAni = null;
            }
            if(this._weaponAni){
                this._weaponAni.getComponent(AGAni).putCache();
                this._weaponAni = null;
            }
            if(this._wingAni){
                this._wingAni.getComponent(AGAni).putCache();
                this._wingAni = null;
            }
            if(this._propNode){
                ag.jsUtil.putCacheNode(this._propNode);
                this._propNode = null;
            }
            if(this._minMapNode){
                this._minMapNode.destroy();
                this._minMapNode = null;
            }
        }
    },


    updateMinMapNodePos:function(){
        if(this._minMapNode){
            var spriteFrame = ag.gameLayer._spriteTopRight.spriteFrame;
            if(spriteFrame){
                var map = ag.gameConst._terrainMap[this._data.mapId];
                var nodeSize = ag.gameLayer._spriteTopRight.node.getContentSize();
                var size = spriteFrame.getOriginalSize();
                var left = Math.max((ag.gameLayer._player.getLocation().x+0.5)/map.mapX*size.width-nodeSize.width/2,0);
                left = Math.floor(Math.min(left,size.width-nodeSize.width));
                left+=nodeSize.width/2;
                var top = Math.max(size.height-(ag.gameLayer._player.getLocation().y+0.5)/map.mapY*size.height-nodeSize.height/2,0);
                top = Math.floor(Math.min(top,size.height-nodeSize.height));
                top=size.height-(top+nodeSize.height/2);
                this._minMapNode.setPosition(((this._data.x+0.5)/map.mapX)*size.width-left,((this._data.y+0.5)/map.mapY)*size.height-top);
            }
        }
    },


    //无事可做动画
    idleAnimation:function(){
        if(this._nearFlag){
            if(this._data.camp==ag.gameConst.campNpc){
                var array = AGAniClothes['nudeboy0'+ag.gameConst.stateIdle+4].split(',');
                var name = 'ani/hum41/041';
                if(this._agAni)this._agAni.getComponent(AGAni).putCache();
                this._agAni = ag.jsUtil.getNode(this.node,name+array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,0.3);
                this._agAni.setColor(this._aniColor);
            }else if(this._data.camp==ag.gameConst.campMonster || (this._data.camp==ag.gameConst.campLiuxing && this._data.type=='m19')){
                var str = 'nudeboy0'+ag.gameConst.stateIdle+this._data.direction;
                if(this._data.type=='m8' || this._data.type=='m9')str = 'nudeboy0'+ag.gameConst.stateIdle+0;
                var array = AGAniClothes[str].split(',');
                var name = ag.gameConst._roleMst[this._data.type].model;
                if(this._agAni)this._agAni.getComponent(AGAni).putCache();
                this._agAni = ag.jsUtil.getNode(this.node,name+array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,0.3);
                this._agAni.setColor(this._aniColor);
            }else{
                //衣服
                var array = AGAniClothes['nudeboy0'+ag.gameConst.stateIdle+this._data.direction].split(',');
                var name = (this._data.sex==0?'ani/hum0/000':'ani/hum1/001');
                var id = this._equipArray[ag.gameConst.itemEquipClothe];
                if(id)name = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid].model;
                if(this._agAni)this._agAni.getComponent(AGAni).putCache();
                this._agAni = ag.jsUtil.getNode(this.node,name+array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,0.3);
                this._agAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
                this._agAni.setColor(this._aniColor);
                //武器
                if(this._weaponAni){this._weaponAni.getComponent(AGAni).putCache();this._weaponAni = undefined;}
                var id = this._equipArray[ag.gameConst.itemEquipWeapon];
                if(id){
                    var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                    this._weaponAni = ag.jsUtil.getNode(this.node,mst.model+array[0],parseInt(array[1]),ag.gameConst.roleWeaponZorder[this._data.direction],0.3);
                    this._weaponAni.setColor(this._aniColor);
                    this._weaponAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
                    this._agAni.getComponent(AGAni).addControl(this._weaponAni.getComponent(AGAni));
                }
                //翅膀
                if(this._wingAni){this._wingAni.getComponent(AGAni).putCache();this._wingAni = undefined;}
                var id = this._equipArray[ag.gameConst.itemEquipWing];
                if(id){
                    var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                    this._wingAni = ag.jsUtil.getNode(this.node,mst.model+array[0],parseInt(array[1]),ag.gameConst.roleWingZorder,0.3);
                    this._wingAni.setColor(this._aniColor);
                    this._wingAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
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
        var lastLocation = this.getLocation();
        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        this.setLocation(location);


        if(this._nearFlag){
            this.node.setPosition(this.getTruePosition(lastLocation));
            var moveSpeed = this._data.camp==ag.gameConst.campMonster ? 0.8:this._moveSpeed;//怪物始终是一个播放速度，走完后等待
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(cc.moveTo(moveSpeed,this.getTruePosition(location)),cc.callFunc(function(){
                if(bServer){
                    this.idle();
                }else{
                    if(this._ai)this._ai._busy = false;
                }
            }.bind(this))));
            if(this._data.camp==ag.gameConst.campMonster || (this._data.camp==ag.gameConst.campLiuxing && this._data.type=='m19')){
                var str = 'nudeboy0'+ag.gameConst.stateMove+this._data.direction;
                if(this._data.type=='m8' || this._data.type=='m9')str = 'nudeboy0'+ag.gameConst.stateIdle+0;
                var array = AGAniClothes[str].split(',');
                var name = ag.gameConst._roleMst[this._data.type].model;
                if(this._agAni)this._agAni.getComponent(AGAni).putCache();
                var count = parseInt(array[1]);
                this._agAni = ag.jsUtil.getNode(this.node,name+array[0],count,ag.gameConst.roleAniZorder,moveSpeed/count);
                this._agAni.setColor(this._aniColor);
            }else{
                //衣服
                var array = AGAniClothes['nudeboy0'+ag.gameConst.stateMove+this._data.direction].split(',');
                var count = parseInt(array[1]);
                var name = (this._data.sex==0?'ani/hum0/000':'ani/hum1/001');
                var id = this._equipArray[ag.gameConst.itemEquipClothe];
                if(id)name = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid].model;
                if(this._agAni)this._agAni.getComponent(AGAni).putCache();
                this._agAni = ag.jsUtil.getNode(this.node,name+array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,moveSpeed/count);
                this._agAni.setColor(this._aniColor);
                this._agAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
                //武器
                if(this._weaponAni){this._weaponAni.getComponent(AGAni).putCache();this._weaponAni = undefined;}
                var id = this._equipArray[ag.gameConst.itemEquipWeapon];
                if(id){
                    var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                    this._weaponAni = ag.jsUtil.getNode(this.node,mst.model+array[0],count,ag.gameConst.roleWeaponZorder[this._data.direction],moveSpeed/count);
                    this._weaponAni.setColor(this._aniColor);
                    this._weaponAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
                    this._agAni.getComponent(AGAni).addControl(this._weaponAni.getComponent(AGAni));
                }
                //翅膀
                if(this._wingAni){this._wingAni.getComponent(AGAni).putCache();this._wingAni = undefined;}
                var id = this._equipArray[ag.gameConst.itemEquipWing];
                if(id){
                    var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                    this._wingAni = ag.jsUtil.getNode(this.node,mst.model+array[0],count,ag.gameConst.roleWingZorder,moveSpeed/count);
                    this._wingAni.setColor(this._aniColor);
                    this._wingAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
                    this._agAni.getComponent(AGAni).addControl(this._wingAni.getComponent(AGAni));
                }
            }

            //最后变更状态
            this._state = ag.gameConst.stateMove;
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
            if(this._data.camp==ag.gameConst.campMonster || (this._data.camp==ag.gameConst.campLiuxing && this._data.type=='m19')){
                var str = 'nudeboy0'+ag.gameConst.stateAttack+this._data.direction;
                if(this._data.type=='m8' || this._data.type=='m9')str = 'nudeboy0'+ag.gameConst.stateIdle+0;
                var array = AGAniClothes[str].split(',');
                var name = ag.gameConst._roleMst[this._data.type].model;
                if(this._agAni)this._agAni.getComponent(AGAni).putCache();
                this._agAni = ag.jsUtil.getNode(this.node,name+array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,0.1,function(){
                    this.idle();
                }.bind(this));
                this._agAni.setColor(this._aniColor);
            }else{
                //衣服
                var name = (this._data.sex==0?'ani/hum0/000':'ani/hum1/001');
                var id = this._equipArray[ag.gameConst.itemEquipClothe];
                if(id)name = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid].model;
                var attackCode = ag.gameConst.stateAttack;//判断是攻击动作,还是施法动作
                if(this._data.type=="m1" || this._data.type=="m2")++attackCode;
                var array = AGAniClothes['nudeboy0'+attackCode+this._data.direction].split(',');
                if(this._agAni)this._agAni.getComponent(AGAni).putCache();
                this._agAni = ag.jsUtil.getNode(this.node,name+array[0],parseInt(array[1]),ag.gameConst.roleAniZorder,0.1,function(){
                    this.idle();
                }.bind(this));
                this._agAni.setColor(this._aniColor);
                this._agAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
                //武器
                if(this._weaponAni){this._weaponAni.getComponent(AGAni).putCache();this._weaponAni = undefined;}
                var id = this._equipArray[ag.gameConst.itemEquipWeapon];
                if(id){
                    var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                    this._weaponAni = ag.jsUtil.getNode(this.node,mst.model+array[0],parseInt(array[1]),ag.gameConst.roleWeaponZorder[this._data.direction],0.1);
                    this._weaponAni.setColor(this._aniColor);
                    this._weaponAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
                    this._agAni.getComponent(AGAni).addControl(this._weaponAni.getComponent(AGAni));
                }
                //翅膀
                if(this._wingAni){this._wingAni.getComponent(AGAni).putCache();this._wingAni = undefined;}
                var id = this._equipArray[ag.gameConst.itemEquipWing];
                if(id){
                    var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                    this._wingAni = ag.jsUtil.getNode(this.node,mst.model+array[0],parseInt(array[1]),ag.gameConst.roleWingZorder,0.1);
                    this._wingAni.setColor(this._aniColor);
                    this._wingAni.getComponent(AGAni).setNobility(this==ag.gameLayer._player);
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
                    ag.jsUtil.getEffect(this.node,"ani/effect2/"+(502000+this._data.direction*5),5,ag.gameConst.roleEffectZorder,0.1);
                }else{
                    ag.jsUtil.getEffect(this.node,"ani/effect3/"+(503000+this._data.direction*8),8,ag.gameConst.roleEffectZorder,0.1);
                }
                ag.buffManager.setCDForFireCrit(this,true);
                cc.audioEngine.play(cc.url.raw("resources/voice/liehuo.mp3"),false,1);
            }else{
                ag.jsUtil.getEffect(this.node,"ani/effect0/"+(500000+this._data.direction*6),6,ag.gameConst.roleEffectZorder,0.1);
                cc.audioEngine.play(cc.url.raw(Math.random()>0.5?"resources/voice/cisha0.mp3":"resources/voice/cisha1.mp3"),false,1);
            }
        }else if(this._data.type=="m1"){
            var pos = locked.getTruePosition();
            if(Math.random()>0.5){
                ag.jsUtil.getNode(this.node,"ani/effect4/504000",6,ag.gameConst.roleEffectUnderZorder,0.05,function(sender){
                    sender.putCache();
                    var node = ag.jsUtil.getEffect(ag.gameLayer._map.node,"ani/effect4/504006",13,9999999,0.05);
                    node.setPosition(pos);
                }.bind(this));
            }else{
                ag.jsUtil.getNode(this.node,"ani/effect4/505000",10,ag.gameConst.roleEffectUnderZorder,0.05,function(sender){
                    sender.putCache();
                    var node = ag.jsUtil.getEffect(ag.gameLayer._map.node,"ani/effect4/505010",13,9999999,0.05);
                    node.setPosition(pos);
                }.bind(this));
            }
            cc.audioEngine.play(cc.url.raw("resources/voice/mietianhuo.mp3"),false,1);
        }else if(this._data.type=="m2"){
            var pos1 = cc.pAdd(this.node.getPosition(),cc.p(0,60));
            var pos2 = cc.pAdd(locked.node.getPosition(),cc.p(0,60));
            ag.jsUtil.getNode(this.node,"ani/effect8/509000",6,ag.gameConst.roleEffectZorder,0.05,function(sender){
                sender.putCache();
                var sprite = ag.spriteCache.get(Math.random()>0.5?'ani/effect8/508000':'ani/effect8/509015');
                sprite.node.setPosition(pos1);
                var rotation = Math.round(cc.radiansToDegrees(cc.pToAngle(cc.pSub(pos2,pos1))));
                sprite.node.setRotation( 90-rotation);
                ag.gameLayer._map.node.addChild(sprite.node,999999);
                sprite.node.runAction(cc.sequence(cc.moveTo(cc.pDistance(pos1,pos2)/2000,pos2),cc.callFunc(function () {
                    ag.spriteCache.put(sprite);
                    var node = ag.jsUtil.getEffect(ag.gameLayer._map.node,"ani/effect8/509006",9,9999999,0.05);
                    node.setPosition(pos2.x,pos2.y-60);
                })));
            }.bind(this));

            ag.buffManager.setPoison(locked,this);//道士启用毒
            cc.audioEngine.play(cc.url.raw("resources/voice/huofu.mp3"),false,1);
        }else if(this._data.type=="m5" || this._data.type=="m18"){
            var pos1 = cc.pAdd(this.node.getPosition(),cc.p(0,60));
            var pos2 = cc.pAdd(locked.node.getPosition(),cc.p(0,35));
            var sprite = ag.spriteCache.get('ani/effect8/511000');
            sprite.node.setPosition(pos1);
            var rotation = Math.round(cc.radiansToDegrees(cc.pToAngle(cc.pSub(pos2,pos1))));
            sprite.node.setRotation( 90-rotation);
            ag.gameLayer._map.node.addChild(sprite.node,ag.gameConst.roleEffectZorder);
            sprite.node.runAction(cc.sequence(cc.delayTime(6*0.15),cc.moveTo(cc.pDistance(pos1,pos2)/1000,pos2),cc.callFunc(function () {
                ag.spriteCache.put(sprite);
            })));
        }else if(this._data.type=='m8' || this._data.type=="m9") {
            var array = ag.gameLayer.getRoleFromCenterXY(this._data.mapId,this.getLocation(), this.getMst().attackDistance);
            for (var i = 0; i < array.length; ++i) {
                if(ag.gameLayer.isEnemyCamp(this,array[i])){
                    var pos = array[i].getTruePosition();
                    var node = ag.jsUtil.getEffect(ag.gameLayer._map.node,"ani/effect8/510000",6,ag.gameConst.roleEffectZorder,0.15);
                    node.setScale(2);
                    node.setPosition(pos);
                }
            }
        }
        if(locked._data.camp!=ag.gameConst.campMonster && locked._data.type!='m19'){
            cc.audioEngine.play(cc.url.raw(locked._data.sex==1?"resources/voice/behit1.mp3":"resources/voice/behit0.mp3"),false,1);
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
        var bVoice = this._data.hp > 0;
        if(this._data.camp==ag.gameConst.campNpc){
            if(this._nearFlag && this._propNode){
                this._propNode._progressBarHP.progress = 1;
                this._propNode._labelHP.string = "npc";
            }
        }else if(hp!=this._data.hp){
            if(this._nearFlag){
                ag.gameLayer._flyBloodArray.push({id:this._data.id,hp:(hp>this._data.hp?("+"+(hp-this._data.hp)):(""+(hp-this._data.hp)))});
                this.flyAnimation();
                if(this._propNode){
                    this._propNode._progressBarHP.progress = hp/this._totalHP;
                    this._propNode._labelHP.string = ""+hp+"/"+this._totalHP+" Lv:"+(this._data.camp==ag.gameConst.campMonster?this.getMst().lv:this._data.level);
                    if(hp<this._data.hp && (this._data.camp==ag.gameConst.campMonster || this._data.type=='m19')){
                        this._propNode._labelHP.node.stopAllActions();
                        this._propNode._labelHP.node.opacity = 255;
                        this._propNode._labelHP.node.runAction(cc.sequence(cc.delayTime(10),cc.callFunc((function(sender){sender.opacity=0;}))));

                        this._propNode._labelName.node.stopAllActions();
                        this._propNode._labelName.node.opacity = 255;
                        this._propNode._labelName.node.runAction(cc.sequence(cc.delayTime(10),cc.callFunc((function(sender){sender.opacity=0;}))));
                    }
                }
            }

            this._data.hp = hp;
        }
        if(this._data.hp<=0){//判断死亡
            this.dead(bVoice);
        }
    },


    //死亡
    dead:function (bVoice) {
        if(this._state==ag.gameConst.stateDead)return;
        this._state = ag.gameConst.stateDead;
        ag.buffManager.delFireWallByDead(this);
        ag.buffManager.delPoisonByDead(this);
        //取消所有锁定自己的AI
        ag.gameLayer.delLockedRole(this);
        if(this._ai)this._ai._locked = null;
        if(this._data.camp==ag.gameConst.campMonster){
            if(this._propNode)ag.jsUtil.putCacheNode(this._propNode);
            if(this._minMapNode){
                this._minMapNode.destroy();
                this._minMapNode = null;
            }
            this.node.destroy();
            delete ag.gameLayer._roleMap[this._data.id];
        }else{
            if(bVoice)cc.audioEngine.play(cc.url.raw(this._data.sex==1?"resources/voice/dead1.mp3":"resources/voice/dead0.mp3"),false,1);
            if(this._propNode)this._propNode.active = false;
            if(this._minMapNode)this._minMapNode.active = false;
            this.node.active = false;
            if(this==ag.gameLayer._player && !ag.gameLayer.bShowRelife){
                ag.gameLayer.buttonEventNpcClose();
                ag.gameLayer.bShowRelife = true;
                ag.jsUtil.alert(ag.gameLayer.node,'重新复活!',function () {
                    ag.gameLayer.bShowRelife = undefined;
                    ag.agSocket.send("relife",{});
                });
            }
        }
    },


    putCache:function(){
        if(this._agAni){
            this._agAni.getComponent(AGAni).putCache();
            this._agAni = null;
        }
        if(this._weaponAni){
            this._weaponAni.getComponent(AGAni).putCache();
            this._weaponAni = null;
        }
        if(this._wingAni){
            this._wingAni.getComponent(AGAni).putCache();
            this._wingAni = null;
        }
        if(this._propNode){
            ag.jsUtil.putCacheNode(this._propNode);
            this._propNode = null;
        }
        if(this._minMapNode){
            this._minMapNode.destroy();
            this._minMapNode = null;
        }
        this.node.destroy();
    },


    //复活
    relife:function(data){
        if(this._state == ag.gameConst.stateDead){
            this.changeHP(this._totalHP);
            if(this._propNode)this._propNode.active = true;
            if(this._minMapNode)this._minMapNode.active = true;
            this.node.active = true;
            this.idleAnimation();
            this._state = ag.gameConst.stateIdle;
            if(this._ai)this._ai._busy = false;

            if(this==ag.gameLayer._player){
                ag.gameLayer.changeMap((this._data.mapId=='t0' || this._data.mapId=='t12')?'t0':'t1');
            }else{
                this.setLocation(cc.p(data.x,data.y));
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
    getTruePosition:function (location) {
        if(!location)location = this.getLocation();
        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = parseInt(location.x)-mapData.mapX/2+0.5;
        var y = parseInt(location.y)-mapData.mapY/2+0.5;
        return cc.p(x*ag.gameConst.tileWidth,y*ag.gameConst.tileHeight);
    },


    //根据一个触摸点得到玩家方向向量
    getTouchOffsetScreen:function(location){
        var size = cc.director.getWinSize();
        var x = location.x;
        var y = location.y;
        var center = 80;
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
    getPlayerForTouch:function(location){
        var point = ag.gameLayer._map.node.convertToNodeSpaceAR(location);
        //计算玩家选中的角色
        var locked = null;
        var map = ag.gameLayer._roleMap;
        var w = ag.gameConst.tileWidth/ 2,h = ag.gameConst.tileHeight*2;
        for(var key in map){
            var role = map[key];
            var p = role.node.getPosition();
            if(point.x>p.x-w && point.x<p.x+w && point.y>p.y && point.y< p.y+h){
                if(role._data.camp==ag.gameConst.campNpc)return role;
                if((!locked || p.y<locked.node.getPositionY()) && ag.gameLayer.isEnemyCamp(this,role))locked = map[key];
            }
        }
        return locked;
    },

    //获得选中玩家
    getPlayerForSeeEquip:function(location){
        var point = ag.gameLayer._map.node.convertToNodeSpaceAR(location);
        //计算玩家选中的角色
        var locked = null;
        var map = ag.gameLayer._roleMap;
        var w = ag.gameConst.tileWidth/ 2,h = ag.gameConst.tileHeight*2;
        for(var key in map){
            var role = map[key];
            var p = role.node.getPosition();
            if(point.x>p.x-w && point.x<p.x+w && point.y>p.y && point.y< p.y+h && role!=ag.gameLayer._player && role._data.camp==ag.gameConst.campLiuxing && role._data.type!='m19'){
                if(!locked || p.y<locked.node.getPositionY())locked = map[key];
            }
        }
        return locked;
    },


    // called every frame
    update: function (dt) {
    },
});
