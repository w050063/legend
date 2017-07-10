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
        this.idle();
        this.node.setScale(2);

        //血条
        //cc.loader.loadRes('prefab/nodeRoleProp',function(err,prefab){
        //    var node = cc.instantiate(prefab);
        //    node.parent = this.node;
        //    node.setLocalZOrder(10);
        //    this._progressBarHP = node.getChildByName("progressBarHP").getComponent(cc.ProgressBar);
        //    this._labelHP = node.getChildByName("labelHP").getComponent(cc.Label);
        //    this._labelName = node.getChildByName("labelName").getComponent(cc.Label);
        //    this._progressBarHP.progress = this._data.hp/this._data.totalHP;
        //    this._labelHP.string = ""+this._data.hp+"/"+this._data.totalHP+" Lv:"+this._data.level;
        //    this._labelName.string = this._data.name?this._data.name:ag.gameConst._roleMst[this._data.type].name;
        //}.bind(this));


        var prefab = cc.loader.getRes('prefab/nodeRoleProp');
        var node = cc.instantiate(prefab);
        node.parent = this.node;
        node.setLocalZOrder(10);
        this._progressBarHP = node.getChildByName("progressBarHP").getComponent(cc.ProgressBar);
        this._labelHP = node.getChildByName("labelHP").getComponent(cc.Label);
        this._labelName = node.getChildByName("labelName").getComponent(cc.Label);
        this._progressBarHP.progress = this._data.hp/this._data.totalHP;
        this._labelHP.string = ""+this._data.hp+"/"+this._data.totalHP+" Lv:"+this._data.level;
        this._labelName.string = this._data.name?this._data.name:ag.gameConst._roleMst[this._data.type].name;


        //增加AI
        if(this == ag.gameLayer._player){
            this._ai = this.node.addComponent(AIController);
            this._ai.init(this);
        }
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
    },


    //无事可以做状态，可以重复进入
    idle:function(){
        if(this._state != ag.gameConst.stateIdle){
            this.node.stopAllActions();
            if(this._data._camp!=ag.gameConst.campMonster && this._state == ag.gameConst.stateAttack){
                this._agAni.getComponent(AGAni).pause();
                this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(function(){
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
        this.node.runAction(cc.sequence(cc.moveTo(this._data.moveSpeed, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            if(bServer){
                this.idle();
            }else{
                if(this._ai)this._ai.onMoveEnd();
            }
        }.bind(this))));
        var clothes = (this._data.clothes?this._data.clothes:ag.gameConst._roleMst[this._data.type].model)+'0';
        var array = AGAniClothes[clothes+ag.gameConst.stateMove+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,0.15);



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
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,0.15,function(){
            if(bServer)this.idle();
            else if(this._ai)this._ai.onAttackEnd();
        }.bind(this));

        //攻击特效
        this.attackEffect(locked);

        cc.audioEngine.play(cc.url.raw("resources/music/hit.mp3"),false,1);


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
            ag.agAniCache.getEffect(this.node,"ani/effect1/"+(500000+this._data.direction*6),6,999,0.15);
        }else if(this._data.type=="m1"){
            ag.agAniCache.getNode(this.node,"ani/effect3/505000",10,0,0.05,function(sender){
                ag.agAniCache.put(sender.node);
                ag.agAniCache.getEffect(locked.node,"ani/effect3/505010",15,999,0.05);
            }.bind(this));
        }else{
        }
    },


    //血量变化
    changeHP:function(hp){
        var str = hp>this._data.hp ? "+"+(hp-this._data.hp) : ""+(hp-this._data.hp);
        //文字提示
        var node = new cc.Node();
        var tips = node.addComponent(cc.Label);
        node.x = 0;
        node.y = 71;
        node.color = cc.color(255,0,0,255);
        tips.string = str;
        this.node.addChild(node,30);
        node.runAction(cc.sequence(cc.moveBy(0.4, cc.p(0,30)), cc.fadeOut(0.2),cc.callFunc(function(){
            node.removeFromParent();
            node.destroy();
        })));


        this._data.hp = hp;
        this._progressBarHP.progress = this._data.hp/this._data.totalHP;
        this._labelHP.string = ""+this._data.hp+"/"+this._data.totalHP+" Lv:"+this._data.level;


        //判断死亡
        if(this._data.hp<=0){
            this.dead();
        }
    },


    //死亡
    dead:function () {
        this._state = ag.gameConst.stateDead;
        //取消所有锁定自己的AI
        ag.gameLayer.delLockedRole(this);
        if(this._ai)this._ai._locked = null;
        if(this._data.camp==ag.gameConst.campMonster){
            this.node.removeFromParent(true);
            delete ag.gameLayer._roleMap[this._data.id];
        }else{
            cc.log("ready");
            this.node.active = false;
            ag.gameLayer.node.runAction(cc.sequence(cc.delayTime(5),cc.callFunc(function () {
                this.node.active = true;
                cc.log("relive");
                this.changeHP(this._data.totalHP);
                this.setLocation(1,1);
                this.idle();
                this._state = ag.gameConst.stateIdle;
                if(this._ai)this._ai._busy = false;
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
                if(map[key]._data.camp!=this._data.camp && point.x>p.x-40 && point.x<p.x+40 && point.y>p.y && point.y< p.y+120){
                    locked = map[key];
                }
            }
        }
        return locked;
    },



    // called every frame
    update: function (dt) {
        this.node.setLocalZOrder(Math.floor(100000-this.node.y));
    },
});
