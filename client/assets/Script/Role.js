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
        this._agAni = null;
        this._labelName = null;
        this.setLocation(this._data.x,this._data.y);
        this.node.setScale(2);
        this._aniColor = cc.color(255,255,255,255);
        this.idle();

        //血条
        var prefab = cc.loader.getRes('prefab/nodeRoleProp');
        var node = cc.instantiate(prefab);
        node.parent = this.node;
        node.setLocalZOrder(10);
        this._progressBarHP = node.getChildByName("progressBarHP").getComponent(cc.ProgressBar);
        this._labelHP = node.getChildByName("labelHP").getComponent(cc.Label);
        this._labelName = node.getChildByName("labelName").getComponent(cc.Label);
        this.changeHP(this._data.hp);
        this._labelName.string = this._data.name?this._data.name:ag.gameConst._roleMst[this._data.type].name;
        this._labelName.node.color = ag.gameLayer.isEnemyCamp(this,ag.gameLayer._player)?cc.color(255,122,0):cc.color(0,0,255);


        //增加AI
        if(this == ag.gameLayer._player){
            this._ai = this.node.addComponent(AIController);
            this._ai.init(this);
        }
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


    //增加经验
    addExp:function(level,exp){
        var last = this._data.level;
        this._data.level = level;
        if(last < this._data.level)this.resetAllProp();
        this._data.exp =  exp;
        if(last < this._data.level)this.changeHP(this._data.hp);
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
    setLocation:function(x,y){
        if(x!=undefined && y!=undefined){
            this._data.x = x;
            this._data.y = y;
        }

        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = this._data.x-mapData.mapX/2;
        var y = this._data.y-mapData.mapY/2;
        this.node.setPosition(x*mapData.tileX,y*mapData.tileY);
    },


    //无事可做动画
    idleAnimation:function(){
        var clothes = (this._data.clothes?this._data.clothes:ag.gameConst._roleMst[this._data.type].model)+'0';
        var array = AGAniClothes[clothes+ag.gameConst.stateIdle+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,0.3);
        this._agAni.setColor(this._aniColor);
    },


    //无事可以做状态，可以重复进入
    idle:function(){
        if(this._state != ag.gameConst.stateIdle){
            this.node.stopAllActions();
            if(this._data.camp!=ag.gameConst.campMonster && this._state == ag.gameConst.stateAttack){
                this._agAni.getComponent(AGAni).pause();
                this.node.runAction(cc.sequenceEx(cc.delayTime(1),cc.callFunc(function(){
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
        this.node.stopAllActions();
        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),location);
        this._data.x = location.x;
        this._data.y = location.y;


        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = this._data.x - mapData.mapX / 2;
        var y = this._data.y - mapData.mapY / 2;
        var moveSpeed = this._data.camp==ag.gameConst.campMonster ? 0.8:this._data.moveSpeed;
        this.node.runAction(cc.sequenceEx(cc.moveTo(moveSpeed, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            if(bServer){
                this.idle();
            }else{
                if(this._ai)this._ai.onMoveEnd();
            }
        }.bind(this))));
        var clothes = (this._data.clothes?this._data.clothes:ag.gameConst._roleMst[this._data.type].model)+'0';
        var array = AGAniClothes[clothes+ag.gameConst.stateMove+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        var count = parseInt(array[1]);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],count,2,moveSpeed/count);
        this._agAni.setColor(this._aniColor);



        //向服务器发送
        if (this == ag.gameLayer._player) {
            var myData = this._data;
            ag.agSocket.send("move",{x: myData.x, y: myData.y});
        }


        //最后变更状态
        this._state = ag.gameConst.stateMove;
        return true;
    },


    //按方向移动,强制玩家位置
    myMoveByServer:function(locationX,locationY) {
        cc.log("error!!!");
        this.node.stopAllActions();
        this._data.x = location.x;
        this._data.y = location.y;
        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = this._data.x - mapData.mapX / 2;
        var y = this._data.y - mapData.mapY / 2;
        this.node.setPosition(cc.p(x * mapData.tileX, y * mapData.tileY));
        this.idle();
        if(this._ai)this._ai.onMoveEnd();
    },


    attack:function(locked,bServer){
        this.node.stopAllActions();
        this._data.direction = ag.gameLayer.getDirection(this.getLocation(),locked.getLocation());
        //攻击动画
        var clothes = (this._data.clothes?this._data.clothes:ag.gameConst._roleMst[this._data.type].model)+'0';
        var attackCode = ag.gameConst.stateAttack;
        //判断是攻击动作,还是施法动作
        if(this._data.type=="m1" || this._data.type=="m2"){
            if (clothes == 'nudeboy0' || clothes == 'nudegirl0' || clothes == 'clothboy0' || clothes == 'clothgirl0') {
                ++attackCode;
            }
        }
        var array = AGAniClothes[clothes+attackCode+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,0.1,function(){
            this.idle();
        }.bind(this));
        ag.gameLayer.node.runAction(cc.sequence(cc.delayTime(this._data.attackSpeed),cc.callFunc(function(){
            if(this._ai)this._ai.onAttackEnd();
        }.bind(this))));
        this._agAni.setColor(this._aniColor);

        //攻击特效
        this.attackEffect(locked);

        if(this._data.camp!=ag.gameConst.campMonster){
            cc.audioEngine.play(cc.url.raw("resources/music/hit.mp3"),false,1);
        }


        //向服务器发送
        if (!bServer && this == ag.gameLayer._player) {
            ag.agSocket.send("attack",{id:locked._data.id});
        }

        //最后变更状态
        this._state = ag.gameConst.stateAttack;
    },


    //攻击特效
    attackEffect: function (locked) {
        if(this._data.type=="m0"){
            if(ag.buffManager.getCDForFireCrit(this)==false){
                ag.agAniCache.getEffect(this.node,"ani/effect2/"+(503000+this._data.direction*8),8,999,0.1);
                ag.buffManager.setCDForFireCrit(this,true);
            }else{
                ag.agAniCache.getEffect(this.node,"ani/effect1/"+(500000+this._data.direction*6),6,999,0.1);
            }
        }else if(this._data.type=="m1"){
            var pos = locked.getTruePosition();
            ag.agAniCache.getNode(this.node,"ani/effect3/505000",10,0,0.05,function(sender){
                ag.agAniCache.put(sender.node);
                var node = ag.agAniCache.getEffect(ag.gameLayer._map.node,"ani/effect3/505010",15,999,0.05);
                node.getComponent(AGAni).setAniPosition(pos);
            }.bind(this));
        }else if(this._data.type=="m2"){
            var lockedId = locked._data.id;
            var pos1 = cc.pAdd(this.node.getPosition(),cc.p(0,70*this.node.scale));
            var pos2 = cc.pAdd(locked.node.getPosition(),cc.p(0,70*this.node.scale));
            var node = new cc.Node();
            var sprite = node.addComponent(cc.Sprite);
            node.setPosition(pos1);
            var rotation = Math.round(cc.radiansToDegrees(cc.pToAngle(cc.pSub(pos2,pos1))));
            node.setRotation( 90-rotation);
            ag.gameLayer._map.node.addChild(node,999999);
            cc.loader.loadRes("ani/effect4", cc.SpriteAtlas, function (err, atlas) {
                if(sprite)sprite.spriteFrame = atlas.getSpriteFrame("508000");
            }.bind(this));


            ag.agAniCache.getEffect(this.node,"ani/effect4/509000",6,999,0.05);
            node.runAction(cc.sequence(cc.delayTime(6*0.15),cc.moveTo(cc.pDistance(pos1,pos2)/1000,pos2),cc.callFunc(function () {
                sprite = undefined;
                node.destroy();
                if(ag.gameLayer.getRole(lockedId)){
                    ag.agAniCache.getEffect(locked.node,"ani/effect4/509006",9,999,0.05);
                }
            })));


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
            ag.gameLayer._map.node.addChild(node,999999);
            cc.loader.loadRes("ani/effect4", cc.SpriteAtlas, function (err, atlas) {
                if(sprite)sprite.spriteFrame = atlas.getSpriteFrame("511000");
            }.bind(this));

            node.runAction(cc.sequence(cc.delayTime(6*0.15),cc.moveTo(cc.pDistance(pos1,pos2)/1000,pos2),cc.callFunc(function () {
                sprite = undefined;
                node.destroy();
            })));
        }else if(this._data.type=="m9") {
            var array = ag.gameLayer.getRoleFromCenterXY(this._data.mapId,this.getLocation(), 9, 9);
            for (var i = 0; i < array.length; ++i) {
                if(ag.gameLayer.isEnemyCamp(this,array[i])){
                    var pos = array[i].getTruePosition();
                    var node = ag.agAniCache.getEffect(ag.gameLayer._map.node,"ani/effect4/510000",6,999,0.15);
                    node.getComponent(AGAni).setAniPosition(pos);
                }
            }
        }
    },


    //血量变化
    changeHP:function(hp){
        var str = hp>this._data.hp ? "+"+(hp-this._data.hp) : ""+(hp-this._data.hp);
        //文字提示
        if(hp!=this._data.hp){
            var node = new cc.Node();
            var tips = node.addComponent(cc.Label);
            node.x = 0;
            node.y = 71;
            if(hp>this._data.hp){
                node.color = cc.color(0,255,0,255);
                tips.string = "+"+(hp-this._data.hp);
            }else{
                node.color = cc.color(255,0,0,255);
                tips.string = ""+(hp-this._data.hp);
            }
            this.node.addChild(node,30);
            node.runAction(cc.sequence(cc.moveBy(0.4, cc.p(0,30)), cc.fadeOut(0.2),cc.callFunc(function(){
                node.destroy();
            })));
        }


        this._data.hp = hp;
        this._progressBarHP.progress = this._data.hp/this._data.totalHP;
        if(this._data.camp==ag.gameConst.campMonster){
            this._labelHP.string = ""+this._data.hp+"/"+this._data.totalHP;
        }else{
            this._labelHP.string = ""+this._data.hp+"/"+this._data.totalHP+" Lv:"+this._data.level;
        }


        //判断死亡
        if(this._data.hp<=0){
            this.dead();
        }
    },


    //死亡
    dead:function () {
        this._state = ag.gameConst.stateDead;
        ag.buffManager.delFireWallByDead(this);
        ag.buffManager.delPoisonByDead(this);
        //取消所有锁定自己的AI
        ag.gameLayer.delLockedRole(this);
        if(this._ai)this._ai._locked = null;
        if(this._data.camp==ag.gameConst.campMonster){
            //this.node.removeFromParent(true);
            this.node.destroy();
            delete ag.gameLayer._roleMap[this._data.id];
        }else{
            cc.log("ready");
            this.node.active = false;
            ag.gameLayer.node.runAction(cc.sequenceEx(cc.delayTime(5),cc.callFunc(function () {
                this.node.active = true;
                cc.log("relive");
                this.changeHP(this._data.totalHP);
                var pos = ag.gameLayer.getStandLocation(this._data.mapId,this._data.x%9-4,this._data.y%9-4,0);
                this.setLocation(pos.x,pos.y);
                this.idle();
                this._state = ag.gameConst.stateIdle;
                if(this._ai)this._ai._busy = false;


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
            }.bind(this))));
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
        this.node.setLocalZOrder(Math.round(100000-this.node.y));
    },
});
