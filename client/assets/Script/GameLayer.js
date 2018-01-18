/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗场景
 */


var Role = require("Role");
var Item = require("Item");
var AGTileMap = require("AGTileMap");
var ItemInfoNode = require('ItemInfoNode');
var Wharehouse = require('Wharehouse');
var AGAni = require("AGAni");
var baseNpcId = 5000;
cc.Class({
    extends: cc.Component,
    properties: {},

    onDestroy:function(){
        pomelo.removeAllListeners('onData');
        if(cc.sys.isBrowser){
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        }
    },

    // use this for initialization
    onLoad: function () {
        ag.gameLayer = this;
        this._chatType = ag.gameConst.chatAll;
        this._roleMap = {};
        this._player = null;
        this._lastMapPosition = cc.p(0,0);
        this._stableMinMapNpcBoss = [];
        this._bagArray = [];
        var i=0;

        for(i=0;i<ag.gameConst.bagMaxCount;++i){
            this._bagArray.push(-1);
        }
        this._wharehouseArray = [];
        for(i=0;i<ag.gameConst.bagMaxCount;++i){
            this._wharehouseArray.push(-1);
        }

        //自动攻击
        var temp = !(cc.sys.localStorage.getItem('setupAutoAttack')=='false');
        this._setupAutoAttack = temp;
        cc.sys.localStorage.setItem('setupAutoAttack',''+temp);
        cc.find('Canvas/nodeHelp/toggleAutoAttack').getComponent(cc.Toggle).isChecked = temp;

        //启用摇杆
        temp = cc.sys.localStorage.getItem('setupRock')=='true';
        cc.sys.localStorage.setItem('setupRock',''+temp);
        cc.find('Canvas/nodeHelp/toggleSetupRock').getComponent(cc.Toggle).isChecked = temp;
        cc.find('Canvas/nodeRock').active = temp;

        //背景音乐
        cc.find('Canvas/nodeHelp/toggleSetupMusic').getComponent(cc.Toggle).isChecked = ag.musicManager._musicSetup;
        cc.find('Canvas/nodeHelp/toggleSetupEffect').getComponent(cc.Toggle).isChecked = ag.musicManager._soundEffectSetup;


        this._flyBloodArray = [];//飘血数组
        this._labelNumAddClone = cc.find('Canvas/clone/labelNumAddClone');
        this._labelNumMinuteClone = cc.find('Canvas/clone/labelNumMinuteClone');
        this._nodeRolePropClone = cc.find('Canvas/clone/nodeRolePropClone');
        this._nodeRoleName = this._nodeRolePropClone.getChildByName('labelName');
        this._nodeRoleHPLabel = this._nodeRolePropClone.getChildByName('labelHP');
        this._nodeRoleHPBar = this._nodeRolePropClone.getChildByName('progressBarHP');
        this._nodeAlertClone = cc.find('Canvas/clone/nodeAlertClone');
        this._nodeAlertOKOrCancelClone = cc.find('Canvas/clone/nodeAlertOKOrCancelClone');


        //键盘事件注入
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        //地图坐标
        this._labelLocation = cc.find('Canvas/nodeMinMap/labelLocation').getComponent(cc.Label);
        this._nodeNpcContent = cc.find('Canvas/nodeNpcContent');
        this._spriteTopRight = cc.find('Canvas/nodeMinMap/spriteTopRight').getComponent(cc.Sprite);
        this._nodeMinMapBack = cc.find('Canvas/nodeMinMap/spriteMinMapBack');
        this._nodeMinMapBack.active = false;
        this._spriteMinMap = cc.find('Canvas/nodeMinMap/spriteMinMapBack/spriteMinMap').getComponent(cc.Sprite);
        this._nodeMinMapPlayer = cc.find('Canvas/nodeMinMap/spriteMinMapBack/spritePlayer');
        this._spriteTopRight.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this._nodeMinMapBack.active = !this._nodeMinMapBack.active;
        }.bind(this));


        //查看他人装备
        var node = cc.find('Canvas/buttonBag');
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            var location = event.getLocation();
            var role = this._player.getPlayerForSeeEquip(location);
            if(role){
                this.showOtherEquip(role._data.id);
            }
        }.bind(this));

        cc.find('Canvas/otherBag').on(cc.Node.EventType.TOUCH_END, function (event) {
            cc.find('Canvas/otherBag').active = false;
        }.bind(this));


        this._equipArray = [];
        for(i=0;i<5;++i){
            this._equipArray.push(0);
        }
        this._equipArray.push(0);
        this._equipArray.push(0);
        this._equipArray.push(cc.find('Canvas/nodeBag/labelLevel').getComponent(cc.Label));
        this._equipArray.push(cc.find('Canvas/nodeBag/labelExp').getComponent(cc.Label));
        this._labelGold = cc.find('Canvas/nodeBag/labelGold').getComponent(cc.Label);

        //聊天相关
        this._chatContentArray = [];
        this._chatLabelArray = [];
        for(i=0;i<5;++i){
            this._chatLabelArray.push(cc.find('Canvas/nodeChatContent/label'+i));
            this._chatLabelArray[i].opacity = 0;
        }


        this._nodeBag = cc.find("Canvas/nodeBag");
        this._nodeBag.active = false;



        //测试新地图
        this._map = cc.find("Canvas/nodeMap").addComponent(AGTileMap);
        this._map.node.setScale(1.5);
        this._nameMap = cc.find("Canvas/nodeNameMap").addComponent(AGTileMap);
        this._nameMap.node.setScale(1.5);


        //创建主角
        var node = new cc.Node();
        this._player = node.addComponent(Role);
        this._map.node.addChild(node);
        this._roleMap[ag.userInfo._data.id] = this._player;
        this._player.init(ag.userInfo._data);
        this.defaultRoleAni(this._player);
        this._labelGold.string = '元宝:'+this._player._data.gold;

        this.changeMap();
        //请求本地图所有角色
        ag.agSocket.send("changeMap",undefined);

        //重置攻击模式
        cc.find('Canvas/buttonAttackMode/Label').getComponent(cc.Label).string = ag.gameConst.attackModeTextArray[this._player._data.attackMode];
		
		
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
			this._player._ai.touchStart(event);
        }.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
			this._player._ai.touchMove(event);
        }.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
			this._player._ai.touchEnd(event);
        }.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
			this._player._ai.touchEnd(event);
        }.bind(this));


        //摇杆
        var rock = cc.find('Canvas/nodeRock');
        rock.on(cc.Node.EventType.TOUCH_START, function (event) {
			this._player._ai.rockStart(event);
        }.bind(this));
        rock.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
			this._player._ai.rockMove(event);
        }.bind(this));
        rock.on(cc.Node.EventType.TOUCH_END, function (event) {
			this._player._ai.rockEnd(event);
        }.bind(this));
        rock.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
			this._player._ai.rockEnd(event);
        }.bind(this));



        //启动定时器,每10秒执行一次
        this.schedule(function(){
            ag.agSocket.send("verifyTime",Math.floor((new Date().getTime()-ag.userInfo._startGameTime)/1000));
        },10);
        this.schedule(ag.spriteCache.update001.bind(ag.spriteCache),0.01);
    },


    //换地图
    changeMap:function(transferId){
        var i=0;
        this._player._ai._locked = null;
        //清空所有内容
        for(i=0;i<this._stableMinMapNpcBoss.length;++i){
            this._stableMinMapNpcBoss[i].destroy();
        }
        this._stableMinMapNpcBoss = [];
        ag.buffManager.changeMap();
        this.buttonEventNpcClose();
        for(var key in this._roleMap){
            if(this._roleMap[key]!=this._player){
                this._roleMap[key].putCache();
                delete this._roleMap[key];
            }
        }
        for(i=this._map.node.childrenCount-1;i>=0;--i){
            var node = this._map.node.children[i];
            if(node!=this._player.node){
                node.destroy();
            }
        }
        ag.spriteCache.release();

        if(transferId){
            var transferMst = ag.gameConst._transferMst[transferId];
            ag.userInfo._data.mapId = transferMst.mapId;
            ag.userInfo._data.x = transferMst.x;
            ag.userInfo._data.y = transferMst.y;
        }
        var mapId = ag.userInfo._data.mapId;
        var map = ag.gameConst._terrainMap[mapId];
        if(this._backMusicName!=map.music){
            this._backMusicName = map.music;
            cc.audioEngine.stopAll();
            ag.musicManager.playMusic("resources/music/"+map.music);
        }


        //地图更新
        //this._map.test(mapId);
        this._map.init(map.res);


        //增加npc
        for(i=0;i<map.npc.length;++i){
            var npc = new cc.Node().addComponent(Role);
            this._map.node.addChild(npc.node);
            var data = JSON.parse(JSON.stringify(map.npc[i]));
            data.id = 'r'+baseNpcId;
            data.mapId = mapId;
            data.camp = ag.gameConst.campNpc;
            this._roleMap[data.id] = npc;
            npc.init(data);
            ++baseNpcId;
        }

        //清空地上的道具，并更新
        for(var key in ag.userInfo._itemMap){
            if(ag.userInfo._itemMap[key]._data.owner!=this._player._data.id){
                delete ag.userInfo._itemMap[key];
            }
        }

        var minMap = map.res;
        minMap = 'minMap'+minMap.substr(minMap.indexOf('/'));
        cc.loader.loadRes(minMap, cc.SpriteFrame,function (err, spriteFrame) {
            this._spriteMinMap.spriteFrame = spriteFrame;
            //this._spriteTopRight.spriteFrame = spriteFrame.clone();
            //this.resetMinMapPos();
        }.bind(this));
    },


    resetMinMapPos:function(){
        var i=0;
        var map = ag.gameConst._terrainMap[this._player._data.mapId];
        var str = '危险区';
        var safe = map.safe;
        if(safe){
            var lx = this._player._data.x,ly = this._player._data.y;
            if(lx>=safe.x && lx<=safe.xx && ly>=safe.y && ly<=safe.yy)str = '安全区';
        }
        this._labelLocation.string = map.name+'\n'+str+' '+this._player._data.x+','+this._player._data.y;
        if(this._spriteMinMap.spriteFrame){
            var size = this._spriteMinMap.spriteFrame.getOriginalSize();
            //设置小地图上人的坐标
            var truePos = this._player.getTruePosition();
            this._nodeMinMapPlayer.setPosition(((this._player._data.x+0.5)/map.mapX-0.5)*size.width,((this._player._data.y+0.5)/map.mapY-0.5)*size.height);

            //设置boss和npc坐标
            if(this._stableMinMapNpcBoss.length==0){
                for(i=0;i<map.npc.length;++i){
                    var node = new cc.Node();
                    var label = node.addComponent(cc.Label);
                    label.fontSize = 20;
                    label.string = map.npc[i].name;
                    this._nodeMinMapBack.addChild(node);
                    node.color = cc.color(0,0,255);
                    node.setPosition(((map.npc[i].x+0.5)/map.mapX-0.5)*size.width,((map.npc[i].y+0.5)/map.mapY-0.5)*size.height);
                    this._stableMinMapNpcBoss.push(node);
                }
                for(i=0;i<map.refresh.length;++i){
                    if(map.refresh[i].length==4){
                        var node = new cc.Node();
                        var label = node.addComponent(cc.Label);
                        label.fontSize = 20;
                        label.string = ag.gameConst._roleMst[map.refresh[i][0]].name;
                        this._nodeMinMapBack.addChild(node);
                        node.color = cc.color(255,0,0);
                        node.setPosition(((map.refresh[i][2]+0.5)/map.mapX-0.5)*size.width,((map.refresh[i][3]+0.5)/map.mapY-0.5)*size.height);
                        this._stableMinMapNpcBoss.push(node);
                    }
                }
            }
        }
    },


    gotoHall:function(sender){
        pomelo.removeAllListeners('onData');
        //清空所有内容
        ag.buffManager.changeMap();
        this._map.node.destroyAllChildren();
        this._nameMap.node.destroyAllChildren();
        this._roleMap = {};
        ag.agSocket._dataArray = [];
        ag.userInfo._itemMap = {};
        cc.audioEngine.stopAll();
        ag.musicManager.playMusic("resources/music/Dragon Rider.mp3");
        ag.spriteCache.release();
        cc.director.loadScene('CreateRoleScene');
        ag.gameLayer = null;
    },


    // called every frame
    update: function (dt) {
        //设置网络
        ag.agSocket.doWork();
    },


    //增加一个角色
    addRole:function(data){
        if(!this.getRole(data.id) && data.mapId==this._player._data.mapId){
            var node = new cc.Node();
            var role = node.addComponent(Role);
            this._map.node.addChild(node);
            this._roleMap[data.id] = role;
            role.init(data);
        }
    },


    //根据id获得角色
    getRole:function(id){
        return this._roleMap[id];
    },


    //初始化道具
    initItem:function(data){
        if(ag.userInfo._itemMap[data.id]){
            ag.userInfo._itemMap[data.id]={_data:data};
            if(data.owner && data.puton>=0){
                var role = this.getRole(data.owner);
                if(role)role.addEquip(data.id);
            }
        }else{
            ag.userInfo._itemMap[data.id]={_data:data};
            if(data.owner){
                var role = this._roleMap[data.owner];
                if(role){
                    if(data.puton>=0){
                        role.addEquip(data.id);
                        if(role==this._player)this.itemBagToEquip(data.id);
                    }else if(data.puton==ag.gameConst.putonBag){
                        if(role==this._player)this.itemEquipToBag(data.id);
                    }else if(data.puton==ag.gameConst.putonWharehouse){
                        if(role==this._player)this.itemToWharehouse(data.id);
                    }
                }
            }else if(data.puton==ag.gameConst.putonGround){
                this.dropItem(data);
            }
        }
    },


    //地上增加一个道具,并且存到本地实例中
    dropItem:function (data) {
        if(data.mapId==this._player._data.mapId){
            //如果是装备，则处理掉落
            var obj = ag.userInfo._itemMap[data.id];
            if(obj && obj._data.owner && obj._data.puton>=0) {
                this.itemEquipToGround(obj._data.id,obj._data.puton,this.getRole(obj._data.owner));
            }


            var node = new cc.Node();
            var item = node.addComponent(Item);
            this._map.node.addChild(node,1);
            item.init(data);
            ag.userInfo._itemMap[data.id]={_data:data,comp:item};
        }else{
            ag.userInfo._itemMap[data.id]={_data:data};
        }
    },


    sItemDisappear:function (id) {
        var obj = ag.userInfo._itemMap[id];
        if(obj){
            if(obj.comp){
                obj.comp.node.destroy();
                obj.comp = undefined;
            }
            if(obj._data.owner==this._player._data.id){
                delete obj._data.owner;
            }
        }
    },


    deleteRoleByServer:function (id) {
        var player =  ag.gameLayer.getRole(id);
        if(player){
            player._data.camp=ag.gameConst.campMonster;
            player._state = ag.gameConst.stateIdle;
            player.dead();
        }
    },


    itemBagAdd:function (id) {
        var obj = ag.userInfo._itemMap[id];
        if(obj && obj.comp){
            obj._data.owner = this._player._data.id;
            obj.comp.node.destroy();
            obj.comp = undefined;
            obj._data.puton = ag.gameConst.putonBag;
            this.addItemToBag(id);
            this.systemNotify(ag.gameConst._itemMst[obj._data.mid].name+'被发现！');
        }
    },


    equipItemToBag:function(id,rid){
        var obj = ag.userInfo._itemMap[id];
        var role = ag.gameLayer.getRole(rid);
        if(obj && role){
            obj._data.puton = ag.gameConst.putonBag;
            var success = role.delEquip(id);
            if(success && role==this._player){
                var data = obj._data;
                var mst = ag.gameConst._itemMst[data.mid];
                var puton = ag.gameConst.putonTypes.indexOf(mst.type);
                var father = cc.find('Canvas/nodeBag/equip');
                var node = father.getChildByName('equip'+puton);
                if(node)node.destroy();
            }
        }
    },


    //根据原点和锁定点获得方向
    getDirection:function (location2,location1) {
        var x,y;
        if(location1.x>location2.x)x = 1;
        else if(location1.x<location2.x)x = -1;
        else x = 0;
        if(location1.y>location2.y)y = 1;
        else if(location1.y<location2.y)y = -1;
        else y = 0;
        if(x==0 && y==0)y = -1;
        return ag.gameConst.directionStringArray.indexOf(''+x+','+y);
    },


    //碰撞检测
    isCollision:function(mapId,x,y){
        return this._map.isCollision(cc.p(x,y));
    },



    getMapXYRole:function(mapId,x,y){
        return ''+mapId+','+x+','+y;
    },


    //根据碰撞检测得到正确的方向
    getOffsetWithColloison:function(role,direction){
        if(direction==-1)return -1;
        var offset = ag.gameConst.directionArray[direction];
        if(this.isCollision(role._data.mapId,role._data.x+offset.x,role._data.y+offset.y)==false){
            if(role.getIsMonster()){
                if(!this._roleXYMap[''+role._data.mapId+','+(role._data.x+offset.x)+','+(role._data.y+offset.y)])return direction;
            }else{
                return direction;
            }
        }
        var pointArray=ag.gameConst.directionArray;//可走方向
        var index = direction;
        var i=0;

        if(role.getIsMonster()){//怪物
            var percent = [10000,1000,100,10,1];//权重比例
            var weight=[];
            var max = 0;
            for(i=0;i<8;++i){
                if(this.isCollision(role._data.mapId,role._data.x+pointArray[i].x,role._data.y+pointArray[i].y) ||
                    this._roleXYMap[this.getMapXYRole(role._data.mapId,role._data.x+pointArray[i].x,role._data.y+pointArray[i].y)]){
                    weight.push(0);
                }else{
                    var dis = Math.abs(index-i);
                    if(dis>4)dis = 8-dis;
                    weight.push(percent[dis]);
                    max += weight[i];
                }
            }

            //遍历权重，计算返回哪一个方向
            var curWeight = 0;
            var randNum=Math.random()*max;
            for(i=0;i<8;++i){
                curWeight += weight[i];
                if(randNum<curWeight)return i;
            }
        }else{//英雄
            var randNum=Math.random()<0.5 ? -1:1;
            for(i=0;i<8;++i){
                if(this.isCollision(role._data.mapId,role._data.x+pointArray[index].x,role._data.y+pointArray[index].y)){
                    index+=(i+1)*randNum;
                    randNum=-randNum;
                    if(index>7)index -= 8;
                    else if(index<0)index += 8;
                }else{
                    return index;
                }
            }
        }

        return -1;
    },


    //解除此角色的所有锁定
    delLockedRole:function (role) {
        for(var key in this._roleMap){
            var temp = this._roleMap[key];
            if(temp._ai && temp._ai._locked==role){
                temp._ai._locked = null;
            }
        }
    },


    //获得指定区域角色数组
    getRoleFromCenterXY:function (mapId,center,offset) {
        var retArray = [];
        for(var key in this._roleMap){
            var data = this._roleMap[key]._data;
            if(mapId==data.mapId && data.x>=center.x-offset && data.x<=center.x+offset && data.y>=center.y-offset && data.y<=center.y+offset){
                retArray.push(this._roleMap[key]);
            }
        }
        return retArray;
    },


    tagAction:function(action,tag){
        action.setTag(tag);
        this.node.runAction(action);
    },



    //是否敌人阵营
    isEnemyCamp:function(role1,role2){
        if(role1!=role2 && role1._state != ag.gameConst.stateDead && role2._state != ag.gameConst.stateDead
            && role1._data.camp!=ag.gameConst.campNpc && role2._data.camp!=ag.gameConst.campNpc){
            var camp1 = role1.getGuildId();
            var camp2 = role2.getGuildId();
            if(camp1!=camp2)return true;
            if(camp2==ag.gameConst.campPlayerNone)return true;
        }
        return false;
    },


    //获得可以站立的位置
    getStandLocation: function (mapId,x,y){
        if(this.isCollision(mapId,x,y)==false)return {x:x,y:y};
        for(var i=0;i<50;++i){
            if(this.isCollision(mapId,x,y+i)==false)return {x:x,y:y+i};
            if(this.isCollision(mapId,x,y-i)==false)return {x:x,y:y-i};
            if(this.isCollision(mapId,x-i,y)==false)return {x:x-i,y:y};
            if(this.isCollision(mapId,x+i,y)==false)return {x:x+i,y:y};
            if(this.isCollision(mapId,x+i,y+i)==false)return {x:x+i,y:y+i};
            if(this.isCollision(mapId,x-i,y-i)==false)return {x:x-i,y:y-i};
            if(this.isCollision(mapId,x-i,y+i)==false)return {x:x-i,y:y+i};
            if(this.isCollision(mapId,x+i,y-i)==false)return {x:x+i,y:y-i};
        }
        console.log("error position:"+mapId+",x:"+x+",y:"+y);
        return {x:0,y:0};
    },


    buttonBagEvent:function (sender) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this._nodeBag.active = true;
    },


    buttonBagClose:function (sender) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this._nodeBag.active = false;
    },
    buttonSettingClose:function (sender) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeHelp').active = false;
    },


    addItemToBag:function(id){
        for(var i=0;i<this._bagArray.length;++i){
            if(this._bagArray[i].id==id){
                cc.log('error: bag have already had!');
                return;
            }
        }

        var index = this._bagArray.indexOf(-1);
        if(index==-1){
            cc.log('error: The bag is full!');
            return;
        }
        var bag = cc.find('Canvas/nodeBag/bag');
        var startPos = cc.p(-125,64);
        var disPos = cc.p(36,32);
        var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
        var node = new cc.Node();
        var sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.id.substr(1));
        node.setPosition(startPos.x+disPos.x*(index%8),startPos.y-disPos.y*Math.floor(index/8));
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        bag.addChild(node);
        this._bagArray[index] = {id:id,node:node};
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            ag.musicManager.playEffect("resources/voice/button.mp3");
            cc.find('Canvas/nodeItemInfo').active = true;
            if(cc.find('Canvas/nodeWharehouse').active){
                cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemIdByWharehouse(id);
            }else{
                cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemId(id);
            }
        }.bind(this));
    },


    //删除一件道具
    delItemFormBag:function(id){
        var index = -1;
        for(var i=0;i<this._bagArray.length;++i){
            if(this._bagArray[i].id==id){
                index = i;
                break;
            }
        }
        if(index!=-1){
            this._bagArray[index].node.destroy();
            this._bagArray[index] = -1;
        }
    },


    //背包道具到仓库
    itemBagToWharehouse:function(id){
        var index = -1;
        for(var i=0;i<this._bagArray.length;++i){
            if(this._bagArray[i].id==id){
                index = i;
                break;
            }
        }
        var index2 = this._wharehouseArray.indexOf(-1);
        if(index!=-1 && index2!=-1){
            var sprite = this._bagArray[index];
            this._bagArray[index] = -1;

            sprite.node.removeFromParent(false);
            var startPos = cc.p(-125,64);
            var disPos = cc.p(36,32);
            sprite.node.setPosition(startPos.x+disPos.x*(index2%8),startPos.y-disPos.y*Math.floor(index2/8));
            cc.find('Canvas/nodeWharehouse/warehouse').addChild(sprite.node);
            this._wharehouseArray[index2] = {id:id,node:sprite.node};
        }
    },


    //道具仓库到背包
    itemWharehouseToBag:function(id){
        var index = -1;
        for(var i=0;i<this._wharehouseArray.length;++i){
            if(this._wharehouseArray[i].id==id){
                index = i;
                break;
            }
        }
        var index2 = this._bagArray.indexOf(-1);
        if(index!=-1 && index2!=-1){
            var sprite = this._wharehouseArray[index];
            this._wharehouseArray[index] = -1;

            sprite.node.removeFromParent(false);
            var startPos = cc.p(-125,64);
            var disPos = cc.p(36,32);
            sprite.node.setPosition(startPos.x+disPos.x*(index2%8),startPos.y-disPos.y*Math.floor(index2/8));
            cc.find('Canvas/nodeWharehouse/bag').addChild(sprite.node);
            this._bagArray[index2] = {id:id,node:sprite.node};
        }
    },


    //增加到仓库
    itemToWharehouse:function(id){
        var index = this._wharehouseArray.indexOf(-1);
        if(index!=-1){
            var startPos = cc.p(-125,64);
            var disPos = cc.p(36,32);
            var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
            var node = new cc.Node();
            var sprite = node.addComponent(cc.Sprite);
            sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.id.substr(1));
            node.setPosition(startPos.x+disPos.x*(index%8),startPos.y-disPos.y*Math.floor(index/8));
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            sprite.trim = false;
            cc.find('Canvas/nodeWharehouse/warehouse').addChild(sprite.node);
            this._wharehouseArray[index] = {id:id,node:node};


            node.off(cc.Node.EventType.TOUCH_END);
            node.on(cc.Node.EventType.TOUCH_END, function (event) {
                ag.musicManager.playEffect("resources/voice/button.mp3");
                cc.find('Canvas/nodeItemInfo').active = true;
                if(cc.find('Canvas/nodeWharehouse').active){
                    cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemIdByWharehouse(id);
                }else{
                    cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemId(id);
                }
            }.bind(this));
        }
    },




    //卸下一件道具
    itemEquipToBag:function(id,puton){
        this.addItemToBag(id);
        var data = ag.userInfo._itemMap[id]._data;
        var mst = ag.gameConst._itemMst[data.mid];
        var success = this._player.delEquip(id);
        if(success){
            if(puton>=0){
                var father = cc.find('Canvas/nodeBag/equip');
                var node = father.getChildByName('equip'+puton);
                if(node){
                    node.removeFromParent();
                    node.destroy();
                }
            }

            //衣服
            if(mst.type==2){
                if(father.clothe){
                    father.clothe.getComponent(AGAni).putCache();
                    this.defaultRoleAni(this._player);
                }
            }
            //武器
            if(mst.type==0){
                if(father.weapon){
                    father.weapon.getComponent(AGAni).putCache();
                    father.weapon = undefined;
                }
            }
            //翅膀
            if(mst.type==6){
                if(father.wing){
                    father.wing.getComponent(AGAni).putCache();
                    father.wing = undefined;
                }
            }
            this.resetPlayerProp(this._player);
        }
    },


    //掉落下一件道具
    itemEquipToGround:function(id,puton,role){
        var data = ag.userInfo._itemMap[id]._data;
        var mst = ag.gameConst._itemMst[data.mid];
        var success = this._player.delEquip(id);
        if(success && role==this._player){
            //var puton = ag.gameConst.putonTypes.indexOf(mst.type);
            if(puton>=0){
                var father = cc.find('Canvas/nodeBag/equip');
                var node = father.getChildByName('equip'+puton);
                if(node){
                    node.removeFromParent();
                    node.destroy();
                }
            }

            //衣服
            if(mst.type==2){
                if(father.clothe){
                    father.clothe.getComponent(AGAni).putCache();
                    this.defaultRoleAni(this._player);
                }
            }
            //武器
            if(mst.type==0){
                if(father.weapon){
                    father.weapon.getComponent(AGAni).putCache();
                    father.weapon = undefined;
                }
            }
            //翅膀
            if(mst.type==6){
                if(father.wing){
                    father.wing.getComponent(AGAni).putCache();
                    father.wing = undefined;
                }
            }
            this.resetPlayerProp(this._player);
        }
    },


    //穿戴一件道具
    itemBagToEquip:function(id){
        var data = ag.userInfo._itemMap[id]._data;
        var mst = ag.gameConst._itemMst[data.mid];
        var puton = data.puton;
        if(puton<0)return;
        //if(!puton)puton = ag.gameConst.putonTypes.indexOf(mst.type);
        var role = this._roleMap[ag.userInfo._itemMap[id]._data.owner];
        if(role==this._player)this.delItemFormBag(id);


        var father = cc.find(role==this._player?'Canvas/nodeBag/equip':'Canvas/otherBag/equip');
        if(role==this._player || father.active){
            var node = father.getChildByName('equip'+puton);
            if(!node){
                node = new cc.Node();
                node.name = 'equip'+puton;
                node.setPosition(ag.gameConst.putonPositionArray[puton]);
                node.addComponent(cc.Sprite);
                father.addChild(node);
            }
            var sprite = node.getComponent(cc.Sprite);
            sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.id.substr(1));
            node.off(cc.Node.EventType.TOUCH_END);
            node.on(cc.Node.EventType.TOUCH_END, function (event) {
                ag.musicManager.playEffect("resources/voice/button.mp3");
                var nodeItemInfo = cc.find('Canvas/nodeItemInfo');
                nodeItemInfo.active = true;
                nodeItemInfo.getComponent('ItemInfoNode').setItemId(id);
            }.bind(this));


            //衣服
            var aniPos = cc.p(-2,-50);
            var scale = 1.5;
            var array = ag.userInfo.agAniClothes['nudeboy0'+ag.gameConst.stateIdle+4].split(',');
            if(mst.type==2){
                if(father.clothe)father.clothe.getComponent(AGAni).putCache();
                var name = (role._data.sex==0?'ani/hum0/000':'ani/hum1/001');
                name = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid].model;
                var node = ag.jsUtil.getNode(father,name+array[0],parseInt(array[1]),1,0.3);
                node.setPosition(aniPos);
                node.scale = scale;
                father.clothe = node;
                if(father.weapon)father.clothe.getComponent(AGAni).addControl(father.weapon.getComponent(AGAni));
                if(father.wing)father.clothe.getComponent(AGAni).addControl(father.wing.getComponent(AGAni));
            }
            //武器
            if(mst.type==0){
                if(father.weapon)father.weapon.getComponent(AGAni).putCache();
                var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                var node1 = ag.jsUtil.getNode(father,mst.model+array[0],parseInt(array[1]),0,0.3);
                if(father.clothe)father.clothe.getComponent(AGAni).addControl(node1.getComponent(AGAni));
                node1.setPosition(aniPos);
                node1.scale = scale;
                father.weapon = node1;
            }
            //翅膀
            if(mst.type==6){
                if(father.wing)father.wing.getComponent(AGAni).putCache();
                var mst = ag.gameConst._itemMst[ag.userInfo._itemMap[id]._data.mid];
                var node2 = ag.jsUtil.getNode(father,mst.model+array[0],parseInt(array[1]),2,0.3);
                if(father.clothe)father.clothe.getComponent(AGAni).addControl(node2.getComponent(AGAni));
                node2.setPosition(aniPos);
                node2.scale = scale;
                father.wing = node2;
            }
            this.resetPlayerProp(role);
        }
    },


    showOtherEquip:function(playerId){
        var role = this._roleMap[playerId];
        cc.find('Canvas/otherBag').active = true;
        var father = cc.find('Canvas/otherBag/equip');
        if(father.clothe)father.clothe.getComponent(AGAni).putCache();
        father.clothe=undefined;
        father.weapon=undefined;
        father.wing=undefined;
        var array = father.children;
        for(var i=array.length-1;i>=0;--i){
            if(array[i].name!='labelTitle' && array[i].name!='labelProp' && array[i].name!='office'){
                array[i].destroy();
                array[i].removeFromParent();
            }
        }
        this.defaultRoleAni(role);
        for(var key in ag.userInfo._itemMap){
            var data = ag.userInfo._itemMap[key]._data;
            if(data.owner==playerId && data.puton>=0){
                this.itemBagToEquip(data.id);
            }
        }

        //将官职数据保存到iteminfo界面
        cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode')._role = role;
    },


    //默认的角色模型
    defaultRoleAni:function(role){
        var father = cc.find(role==this._player?'Canvas/nodeBag/equip':'Canvas/otherBag/equip');
        if(!father.labelTitle){
            father.labelTitle = father.getChildByName('labelTitle').getComponent(cc.Label);
        }
        if(!father.labelProp){
            father.labelProp = father.getChildByName('labelProp').getComponent(cc.Label);
        }
        this.resetPlayerProp(role);

        var aniPos = cc.p(-2,-50);
        var scale = 1.5;
        var array = ag.userInfo.agAniClothes['nudeboy0'+ag.gameConst.stateIdle+4].split(',');
        if(father.clothe)father.clothe.getComponent(AGAni).putCache();
        var name = (role._data.sex==0?'ani/hum0/000':'ani/hum1/001');
        var node = ag.jsUtil.getNode(father,name+array[0],parseInt(array[1]),1,0.3);
        node.setPosition(aniPos);
        node.scale = scale;
        father.clothe = node;
        if(father.weapon)father.clothe.getComponent(AGAni).addControl(father.weapon.getComponent(AGAni));
        if(father.wing)father.clothe.getComponent(AGAni).addControl(father.wing.getComponent(AGAni));
    },


    //属性显示
    resetPlayerProp:function(role){
        var father = cc.find(role==this._player?'Canvas/nodeBag/equip':'Canvas/otherBag/equip');
        var mst = role.getMst();
        var lv = role._data.level;
        var hurt = mst.hurt+Math.floor(mst.hurtAdd*lv);
        var defense = mst.defense+Math.floor(mst.defenseAdd*lv);
        for(var i=0;i<role._equipArray.length;++i){
            if(role._equipArray[i]){
                var itemMst = ag.gameConst._itemMst[ag.userInfo._itemMap[role._equipArray[i]]._data.mid];
                if(itemMst.hurt)hurt+=itemMst.hurt;
                if(itemMst.defense)defense+=itemMst.defense;
            }
        }
        //加上官职属性
        var office = role.getOfficeIndex();
        hurt+=ag.gameConst.officeHurt[office];
        defense+=ag.gameConst.officeDefense[office];

        father.labelTitle.string = role._data.name + '(' + ag.gameConst._roleMst[role._data.type].name + ')';
        father.labelProp.string = '攻击:'+hurt+' 防御:'+defense;
    },


    //获得属性显示
    getItemBagShow:function (mst) {
        var str = '性别职业:';
        if(mst.exclusive.length==1){
            var tempArray = ['男战','女战','男法','女法','男道','女道'];
            str = str+tempArray[mst.exclusive[0]];
        }else if(mst.exclusive.length==2){
            if(mst.exclusive[0]==0){
                str = str+'战士';
            }else if(mst.exclusive[0]==2){
                str = str+'法师';
            }else if(mst.exclusive[0]==4){
                str = str+'道士';
            }
        }else if(mst.exclusive.length==3){
            if(mst.exclusive[0]==0){
                str = str+'男';
            }else if(mst.exclusive[0]==1){
                str = str+'女';
            }
        }else if(mst.exclusive.length==6){
            str = str+'全部';
        }
        var prop = '\n';
        if(mst.hurt){
            prop = prop+'攻击:'+mst.hurt;
            if(mst.defense) prop = prop+' ';
        }
        if(mst.defense){
            prop = prop+'防御:'+mst.defense;
        }
        return mst.name+prop+'\n'+str+'\n等级:'+mst.level;
    },


    //聊天按钮
    buttonShowChatNode:function(){
        var node = cc.find('Canvas/nodeChatContent/spriteBack');
        node.active = !node.active;
        if(cc.sys.isMobile==false && cc.sys.isBrowser){
            var editbox = cc.find('Canvas/nodeChatContent/spriteBack/editBoxName').getComponent(cc.EditBox);
            editbox.stayOnTop = true;
            editbox.setFocus();
        }


        //保持在最下面
        var scrollview = cc.find('Canvas/nodeChatContent/spriteBack/scrollView').getComponent(cc.ScrollView);
        var itemNode = scrollview.content.getChildByName('item');
        scrollview.content.height = Math.max(itemNode.height,200);
        scrollview.scrollToBottom();
    },

    //聊天按钮
    buttonShowHelp:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeHelp').active = true;
    },


    //回车发送信息
    editBoxConfirm: function (sender) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        //cc.find('Canvas/nodeChat').active = false;
        if(cc.sys.isMobile==false && cc.sys.isBrowser){
            cc.find('Canvas/nodeChatContent/spriteBack/editBoxName').getComponent(cc.EditBox).stayOnTop = false;
        }
        if(sender.string.length>0){
            ag.agSocket.send("chatYou",{chatType:this._chatType,str:sender.string});
            sender.string = '';
        }
        this._bEditBoxKey = true;
    },

    chat:function(id,name,content){
        var i=0;
        var role = this.getRole(id);
        if(role && role._propNode){
            var node = new cc.Node();
            var tips = node.addComponent(cc.Label);
            node.x = 0;
            node.y = 87;
            tips.fontSize = 12;
            node.color = cc.color(255,255,255);
            tips.string = content;
            //role.node.addChild(node,30);
            role._propNode.addChild(node,30);
            node.runAction(cc.sequence(cc.delayTime(5), cc.fadeOut(0.2),cc.callFunc(function(){
                node.destroy();
            })));
        }
        var lb = this._chatLabelArray[0];
        var y = this._chatLabelArray[0].y;
        for(i=0;i<4;++i){
            this._chatLabelArray[i] = this._chatLabelArray[i+1];
            var tempY = this._chatLabelArray[i].y;
            this._chatLabelArray[i].y = y;
            y = tempY;
        }
        this._chatLabelArray[4] = lb;
        lb.y = y;
        lb.opacity = 255;
        lb.getComponent(cc.Label).string = ""+name+' : '+content;
        lb.stopAllActions();
        lb.runAction(cc.sequence(cc.delayTime(30),cc.fadeOut(2)));

        //保存到聊天记录里面
        var scrollview = cc.find('Canvas/nodeChatContent/spriteBack/scrollView').getComponent(cc.ScrollView);
        var contentNode = scrollview.content;
        var itemNode = contentNode.getChildByName('item');
        if(!this._chatStringHistoryArray)this._chatStringHistoryArray = [];
        this._chatStringHistoryArray.push(""+name+' : '+content);
        if(this._chatStringHistoryArray.length>=50)this._chatStringHistoryArray.splice(0,1);
        var str = '';
        for(i=0;i<this._chatStringHistoryArray.length;++i){
            str = str + this._chatStringHistoryArray[i];
            if(i!=this._chatStringHistoryArray.length-1)str = str + '\n';
        }
        itemNode.getComponent(cc.Label).string = str;
        contentNode.height = Math.max(itemNode.height,200);
        scrollview.scrollToBottom();
    },


    systemNotify:function(content){
        var callback = function(){
            this._systemNotifyArray[0].destroy();
            this._systemNotifyArray.splice(0,1);
            for(var i=0;i<this._systemNotifyArray.length;++i){
                this._systemNotifyArray[i].y = 233-35*i;
            }
        }
        if(!this._systemNotifyArray)this._systemNotifyArray = [];
        var node = cc.instantiate(cc.find('Canvas/clone/labelSystemNotifyClone'));
        cc.find('Canvas/nodeChatContent').addChild(node);
        node.getComponent(cc.Label).string = content;
        node.runAction(cc.sequence(cc.delayTime(6),cc.fadeOut(1),cc.callFunc((callback.bind(this)))));
        this._systemNotifyArray.push(node);
        if(this._systemNotifyArray.length>=6){
            callback.call(this);
        }else{
            node.y = 233-35*(this._systemNotifyArray.length-1);
        }
    },


    toggleAutoAttack: function (event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this._setupAutoAttack = event.isChecked;
        cc.sys.localStorage.setItem('setupAutoAttack',''+event.isChecked);
    },
    toggleEventSetupRock: function (event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeRock').active = event.isChecked;
        cc.sys.localStorage.setItem('setupRock',''+event.isChecked);
    },

    toggleMusic: function (event) {
        ag.musicManager.setupMusic(event.isChecked);
    },
    toggleSoundEffect: function (event) {
        ag.musicManager.setupSoundEffect(event.isChecked);
    },


    onKeyUp: function (event) {
        switch(event.keyCode) {
            case cc.KEY.enter:
                if(this._bEditBoxKey==true){
                    this._bEditBoxKey=false;
                }else{
                    this.buttonShowChatNode();
                }
                break;
        }
    },


    buttonEventNpcClose:function(){
        this._nodeNpcContent.stopAllActions();
        this._nodeNpcContent.active = false;
    },

    getIsGuildmember:function(){
        for(var key in ag.userInfo._guildMap){
            var array = ag.userInfo._guildMap[key].member;
            for(var i=0;i<array.length;++i){
                if(array[i]==this._player._data.id){
                    return true;
                }
            }
        }
        return false;
    },

    showNodeNpcContent:function(data){
        this._nodeNpcContent.active = true;
        this._nodeNpcContent.stopAllActions();
        this._nodeNpcContent.runAction(cc.sequence(cc.delayTime(30),cc.callFunc(function(){
            this.buttonEventNpcClose();
        }.bind(this))));
        this._nodeNpcContent.getChildByName('labelTitle').getComponent(cc.Label).string = data.title;
        var content = data.content;
        if(data.content.length>0){
            if(data.content[0]=='t4000'){
                if(this.getIsGuildmember()){
                    content = ['t4006'];
                }else if(ag.userInfo._guildInvite){
                    content = ['t4000','t4001'];
                }else{
                    content = ['t4002','t4003','t4004','t4005'];
                }
            }
        }
        var self = this;
        for(var i=0;i<6;++i){
            (function(i){
                var label = self._nodeNpcContent.getChildByName('label'+i).getComponent(cc.Label);
                if(i<content.length){
                    var transferMst = ag.gameConst._transferMst[content[i]];
                    label.node.active = true;
                    label.string = transferMst.name;
                    label.node.off(cc.Node.EventType.TOUCH_END);
                    label.node.on(cc.Node.EventType.TOUCH_END, function (event) {
                        ag.musicManager.playEffect("resources/voice/button.mp3");
                        var npcStr = transferMst.name;
                        if(transferMst.id=='t6000'){
                            cc.find('Canvas/nodeWharehouse').getComponent(Wharehouse).show();
                            self.buttonEventNpcClose();
                        }else if(transferMst.id=='t5000'){
                            var index = self._bagArray.indexOf(-1);
                            if(index!=-1 && self._player._data.gold>=200){
                                ag.agSocket.send("treasure",{});
                            }else{
                                ag.jsUtil.showText(self.node,'背包已满,或者元宝不足200个！');
                            }
                        }else if(transferMst.id=='t5001'){
                            var findBagItemCount = 0;
                            for(var j=0;j<self._bagArray.length;++j){
                                if(self._bagArray[j]==-1)++findBagItemCount;
                            }
                            if(findBagItemCount>=5 && self._player._data.gold>=1000){
                                ag.agSocket.send("treasure5",{});
                            }else{
                                ag.jsUtil.showText(self.node,'背包已满,或者元宝不足1000个！');
                            }
                        }else if(transferMst.id=='t4002') {
                            var index = self._bagArray.indexOf(-1);
                            if(index!=-1 && self._player._data.gold>=500){
                                cc.find('Canvas/nodeCreateGuild').active = true;
                            }else{
                                ag.jsUtil.showText(self.node,'元宝不足500个！');
                            }
                        }else if(transferMst.id=='t4003'){
                            if(ag.userInfo._guildMap[self._player._data.id]){
                                ag.jsUtil.alert(ag.gameLayer.node,'删除行会!',function () {
                                    ag.agSocket.send("guildDelete",{});
                                },function () {});
                            }else{
                                ag.jsUtil.showText(self.node,'您还没有行会！');
                            }
                        }else if(transferMst.id=='t4004'){
                            cc.find('Canvas/nodeGuildInvite').active = true;
                        }else if(transferMst.id=='t4005'){
                            cc.find('Canvas/nodeGuildKick').active = true;
                        }else if(transferMst.id=='t4000'){
                            ag.agSocket.send("guildOK",{});
                        }else if(transferMst.id=='t4001'){
                            ag.agSocket.send("guildCancel",{});
                        }else if(transferMst.id=='t4006'){
                            ag.jsUtil.alert(ag.gameLayer.node,'退出行会!',function () {
                                ag.agSocket.send("guildExit",{});
                            },function () {});
                        }else if(npcStr=='比奇城市'){
                            ag.jsUtil.showText(self.node,"比奇城限制55级以上！");
                        }else if(npcStr=='四级以下回收' || npcStr=='五级回收' || npcStr=='六级回收' || npcStr=='七级回收' || npcStr=='八级回收' || npcStr=='九级回收'){
                            var curLevels = transferMst.levels;
                            var array = [];
                            for(var key in ag.userInfo._itemMap){
                                var obj = ag.userInfo._itemMap[key];
                                if(obj._data.owner==self._player._data.id && obj._data.puton==ag.gameConst.putonBag && curLevels.indexOf(ag.gameConst._itemMst[obj._data.mid].level)!=-1){
                                    var id = obj._data.id;
                                    array.push(id);
                                    ag.userInfo._itemMap[id]._data.owner = undefined;
                                    ag.gameLayer.delItemFormBag(id);
                                }
                            }
                            if(array.length>0){
                                ag.agSocket.send("bagItemRecycle",array.join(','));
                            }
                            else{
                                ag.jsUtil.showText(self.node,"没有可回收的装备！");
                            }
                        }else if(npcStr=='青龙堂' || npcStr=='白虎堂' || npcStr=='朱雀堂' || npcStr=='玄武堂' || npcStr=='退出门派'){
                            var camp = ag.gameConst.campPlayerNone;
                            if(npcStr=='青龙堂'){
                                camp = ag.gameConst.campPlayerQinglong;
                            }else if(npcStr=='白虎堂'){
                                camp = ag.gameConst.campPlayerBaihu;
                            }else if(npcStr=='朱雀堂'){
                                camp = ag.gameConst.campPlayerZhuque;
                            }else if(npcStr=='玄武堂'){
                                camp = ag.gameConst.campPlayerXuanwu;
                            }else if(npcStr=='退出门派'){
                                camp = ag.gameConst.campPlayerNone;
                            }
                            if(self._player._data.camp != camp){
                                ag.agSocket.send("camp",camp);
                            }else{
                                ag.jsUtil.showText(self.node,'操作无效！');
                            }
                        }else{
                            var level = ag.gameConst._terrainMap[transferMst.mapId].level;
                            var maxLevel = ag.gameConst._terrainMap[transferMst.mapId].maxLevel;
                            if(!maxLevel)maxLevel = 65535;
                            if(self._player._data.level>=level && self._player._data.level<=maxLevel){
                                self.changeMap(transferMst.id);
                                //请求本地图所有角色
                                ag.agSocket.send("changeMap",transferMst.id);
                            }else{
                                ag.jsUtil.showText(self.node,'此地图要求等级'+level+'!!!');
                            }
                        }
                    });
                }else{
                    label.node.active = false;
                }
            })(i);
        }
    },


    //绑定官职事件
    buttonEventOffice:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeItemInfo').active = true;
        cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setOfficeByRole(this._player);
    },


    //绑定其他官职事件
    buttonEventOtherOffice:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeItemInfo').active = true;
        cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setOfficeByRole();
    },




    //聊天对象
    buttonEventChatSelect:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var node = cc.find('Canvas/nodeChatContent/spriteBack/nodeButtonsChatSelect');
        node.active = !node.active;
    },
    buttonEventChatAll:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeChatContent/spriteBack/nodeButtonsChatSelect').active = false;
        cc.find('Canvas/nodeChatContent/spriteBack/buttonChatSelect/Label').getComponent(cc.Label).string = '全体  ▲';
        this._chatType = ag.gameConst.chatAll;
    },
    buttonEventChatMap:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeChatContent/spriteBack/nodeButtonsChatSelect').active = false;
        cc.find('Canvas/nodeChatContent/spriteBack/buttonChatSelect/Label').getComponent(cc.Label).string = '地图  ▲';
        this._chatType = ag.gameConst.chatMap;
    },
    buttonEventChatGuild:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeChatContent/spriteBack/nodeButtonsChatSelect').active = false;
        cc.find('Canvas/nodeChatContent/spriteBack/buttonChatSelect/Label').getComponent(cc.Label).string = '行会  ▲';
        this._chatType = ag.gameConst.chatGuild;
    },

    //攻击模式
    buttonEventAttackMode:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var node = event.target;
        if(this._player._data.attackMode==ag.gameConst.attackModeAll){
            this._player._data.attackMode=ag.gameConst.attackModePeace;
        }else if(this._player._data.attackMode==ag.gameConst.attackModePeace){
            this._player._data.attackMode=ag.gameConst.attackModeGuild;
        }else if(this._player._data.attackMode==ag.gameConst.attackModeGuild){
            this._player._data.attackMode=ag.gameConst.attackModeAll;
        }
        cc.find('Canvas/buttonAttackMode/Label').getComponent(cc.Label).string = ag.gameConst.attackModeTextArray[this._player._data.attackMode];
        ag.agSocket.send("setAttackMode",{no:this._player._data.attackMode});
    },
});
