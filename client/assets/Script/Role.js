/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色类
 */


var AGAniAction = require("AGAniAction");
var PlayerAI = require("PlayerAI");
var PlayerMagicianAI = require("PlayerMagicianAI");
var MagicianAI = require("MagicianAI");
var BoarAI = require("BoarAI");
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
        cc.loader.loadRes('prefab/nodeRoleProp',function(err,prefab){
            var node = cc.instantiate(prefab);
            node.parent = this.node;
            node.setLocalZOrder(10);
            this._progressBarHP = node.getChildByName("progressBarHP").getComponent(cc.ProgressBar);
            this._labelHP = node.getChildByName("labelHP").getComponent(cc.Label);
            this._labelName = node.getChildByName("labelName").getComponent(cc.Label);
            this._progressBarHP.progress = this._data.hp/this._data.totalHP;
            this._labelHP.string = ""+this._data.hp+"/"+this._data.totalHP+" Lv:"+this._data.level;
            this._labelName.string = this._data.name;
        }.bind(this));

        //增加AI
        if(this == ag.gameLayer._player){
            if(this._data.type=="m1"){
                this._ai = this.node.addComponent(PlayerMagicianAI);
                this._ai.init(this);
            }else{
                this._ai = this.node.addComponent(PlayerAI);
                this._ai.init(this);
            }
        }else{
            if(this._data.type=="m1"){
                this._ai = this.node.addComponent(MagicianAI);
                this._ai.init(this);
            }else{
                this._ai = this.node.addComponent(BoarAI);
                this._ai.init(this);
            }
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
        var array = AGAniAction[(this._data.clothes?"1":"nude")+(this._data.sex==1?1:0)+ag.gameConst.stateIdle+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,0.5);
    },


    //无事可以做状态，可以重复进入
    idle:function(){
        if(this._state != ag.gameConst.stateIdle){
            this.node.stopAllActions();
            if(this._state == ag.gameConst.stateAttack){
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
    move:function(offset) {
        offset = ag.gameLayer.getOffsetWithColloison(this, offset);
        if (!offset){
            this.idle();
            return false;
        }

        this.node.stopAllActions();
        this._data.x += offset.x;
        this._data.y += offset.y;
        this._data.direction = ag.gameConst.directionStringArray.indexOf(''+offset.x+','+offset.y);


        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        var x = this._data.x - mapData.mapX / 2;
        var y = this._data.y - mapData.mapY / 2;
        this.node.runAction(cc.sequence(cc.moveTo(this._data.moveSpeed, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            this._ai.onMoveEnd();
        }.bind(this))));
        var array = AGAniAction[(this._data.clothes?"1":"nude")+(this._data.sex==1?1:0)+ag.gameConst.stateMove+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,this._data.moveSpeed/parseInt(array[1]));



        //向服务器发送
        if (this == ag.gameLayer._player) {
            ag.agSocket.send("move",{x: this._data.x, y: this._data.y});
        }


        //最后变更状态
        this._state = ag.gameConst.stateMove;
        return true;
    },


    //按方向移动
    moveByServer:function(locationX,locationY) {
        var x,y;
        if(locationX>this._data.x)x = 1;
        else if(locationX<this._data.x)x = -1;
        else x = 0;
        if(locationY>this._data.y)y = 1;
        else if(locationY<this._data.y)y = -1;
        else y = 0;
        if(x==0 && y==0)y = -1;
        this._data.direction = ag.gameConst.directionStringArray.indexOf(''+x+','+y);

        this._data.x = locationX;
        this._data.y = locationY;


        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        x = this._data.x - mapData.mapX / 2;
        y = this._data.y - mapData.mapY / 2;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(cc.moveTo(this._data.moveSpeed, cc.p(x * mapData.tileX, y * mapData.tileY)),cc.callFunc(function(){
            this.idle();
        }.bind(this))));
        var array = AGAniAction[(this._data.clothes?"1":"nude")+(this._data.sex==1?1:0)+ag.gameConst.stateMove+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,this._data.moveSpeed/parseInt(array[1]));


        //最后变更状态
        this._state = ag.gameConst.stateMove;
    },



    //按方向移动,强制玩家位置
    myMoveByServer:function(locationX,locationY) {
        this.node.stopAllActions();
        this._data.x = locationX;
        this._data.y = locationY;
        var mapData = ag.gameConst._terrainMap[this._data.mapId];
        x = this._data.x - mapData.mapX / 2;
        y = this._data.y - mapData.mapY / 2;
        this.node.setPosition(cc.p(x * mapData.tileX, y * mapData.tileY));
        this.idle();
    },


    attack:function(locked,bServer){
        this.node.stopAllActions();
        var x,y;
        if(locked._data.x>this._data.x)x = 1;
        else if(locked._data.x<this._data.x)x = -1;
        else x = 0;
        if(locked._data.y>this._data.y)y = 1;
        else if(locked._data.y<this._data.y)y = -1;
        else y = 0;
        if(x==0 && y==0)y = -1;
        this._data.direction = ag.gameConst.directionStringArray.indexOf(''+x+','+y);

        //攻击动画
        var clothes = this._data.clothes?"1":"nude";
        var attackCode = ag.gameConst.stateAttack;
        if(clothes=="nude" && (this._data.type=="m1" || this._data.type=="m2"))++attackCode;
        var array = AGAniAction[clothes+(this._data.sex==1?1:0)+attackCode+this._data.direction].split(',');
        if(this._agAni)ag.agAniCache.put(this._agAni);
        this._agAni = ag.agAniCache.getNode(this.node,array[0],parseInt(array[1]),2,this._data.attackSpeed/parseInt(array[1]),function(){
            if(bServer)this.idle();
            else this._ai.onAttackEnd();
        }.bind(this));

        //攻击特效
        this._ai.attackEffect(locked);

        cc.audioEngine.play(cc.url.raw("resources/music/hit.mp3"),false,0.1);


        //向服务器发送
        if (!bServer && this == ag.gameLayer._player) {
            ag.agSocket.send("attack",{id:locked._data.id});
        }

        //最后变更状态
        this._state = ag.gameConst.stateAttack;
    },


    //血量变化
    changeHP:function(hp){
        var str = hp>this._data.hp ? "+"+(hp-this._data.hp) : ""+(hp-this._data.hp);
        //文字提示
        var node = new cc.Node();
        var tips = node.addComponent(cc.Label);
        node.x = 0;
        node.y = 71;
        tips.string = str;
        this.node.addChild(node,30);
        node.runAction(cc.sequence(cc.moveBy(0.4, cc.p(0,30)), cc.fadeOut(0.2),cc.removeSelf()));


        this._data.hp = hp;
        this._progressBarHP.progress = this._data.hp/this._data.totalHP;
        this._labelHP.string = ""+this._data.hp+"/"+this._data.totalHP+" Lv:"+this._data.level;
    },


    getMapXYString:function(){
        return ''+this._data.map+','+this._data.x+','+this._data.y;
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
});
