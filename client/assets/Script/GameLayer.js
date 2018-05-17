/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗场景
 */


var Role = require("Role");
var Item = require("Item");
var AGTileMap = require("AGTileMap");
var ItemInfoNode = require('ItemInfoNode');
var Wharehouse = require('Wharehouse');
var Deal = require('Deal');
var AuctionShop = require('AuctionShop');
var GuildMember = require('GuildMember');
var Card = require('Card');
var ChangeNameByGold = require('ChangeNameByGold');
var Rank = require('Rank');
var AGAni = require("AGAni");
var TeamAsk = require('TeamAsk');
var Bag = require('Bag');
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
        this._chatType = ag.gameConst.chatMap;
        this._roleMap = {};
        this._player = null;
        this._lastMapPosition = cc.p(0,0);
        this._stableMinMapNpcBoss = [];
        this._bagArray = [];
        this._auctionShop = cc.find('Canvas/nodeAuctionShop').getComponent(AuctionShop);
        this._card = cc.find('Canvas/nodeCard').getComponent(Card);
        this._changeNameByGold = cc.find('Canvas/nodeChangeNameByGold').getComponent(ChangeNameByGold);
        this._rank = cc.find('Canvas/nodeRank').getComponent(Rank);
        this._teamAsk = cc.find('Canvas/nodeTeamAsk').getComponent(TeamAsk);
        this._guildMember = cc.find('Canvas/nodeGuildMember').getComponent(GuildMember);
        this._deal = cc.find('Canvas/nodeDeal').getComponent(Deal);
        this._bag = cc.find('Canvas/nodeBag').getComponent(Bag);
        this._bag.init();
        var i,key;



        for(i=0;i<ag.gameConst.bagMaxCount;++i){
            this._bagArray.push(-1);
        }
        this._wharehouseArray = [];
        for(i=0;i<ag.gameConst.bagMaxCount;++i){
            this._wharehouseArray.push(-1);
        }
        //cc.find('Canvas/nodeBag/nodePanel/equip0/buttonWing').setLocalZOrder(10);
        cc.find('Canvas/buttonLocked').active = false;
        cc.find('Canvas/nodeLockedList').active = false;


        cc.find('Canvas/nodeMinMap').active = true;

        //自动攻击
        var temp = !(cc.sys.localStorage.getItem('setupAutoAttack')=='false');
        this._setupAutoAttack = temp;
        cc.sys.localStorage.setItem('setupAutoAttack',''+temp);
        cc.find('Canvas/nodeHelp/toggleAutoAttack').getComponent(cc.Toggle).isChecked = temp;

        //自动玩家
        temp = cc.sys.localStorage.getItem('setupAutoPlayer')=='true';
        this._setupAutoPlayer = temp;
        cc.sys.localStorage.setItem('setupAutoPlayer',''+temp);
        cc.find('Canvas/nodeHelp/toggleAutoPlayer').getComponent(cc.Toggle).isChecked = temp;


        //启用摇杆
        temp = cc.sys.localStorage.getItem('setupRock')=='true';
        cc.sys.localStorage.setItem('setupRock',''+temp);
        cc.find('Canvas/nodeHelp/toggleSetupRock').getComponent(cc.Toggle).isChecked = temp;
        cc.find('Canvas/nodeRock').active = temp;

        //是否显示翅膀
        temp = !(cc.sys.localStorage.getItem('setupShowWing')=='false');
        cc.sys.localStorage.setItem('setupShowWing',''+temp);
        cc.find('Canvas/nodeHelp/toggleShowWing').getComponent(cc.Toggle).isChecked = temp;
        this._setupShowWing = temp;
        this.showWing(this._setupShowWing);

        //背景音乐
        cc.find('Canvas/nodeHelp/toggleSetupMusic').getComponent(cc.Toggle).isChecked = ag.musicManager._musicSetup;
        cc.find('Canvas/nodeHelp/toggleSetupEffect').getComponent(cc.Toggle).isChecked = ag.musicManager._soundEffectSetup;


        //允许组队
        //cc.find('Canvas/nodeHelp/toggleAllowTeam').getComponent(cc.Toggle).isChecked = !!ag.userInfo._data.allowTeam;


        this._flyBloodArray = [];//飘血数组
        this._flyBloodFlagArray = {};//飘血数组
        this._dirtyRoleArray = {};//脏数据数组
        this._labelNumAddClone = cc.find('Canvas/clone/labelNumAddClone');
        this._labelNumMinuteClone = cc.find('Canvas/clone/labelNumMinuteClone');
        this._spriteBaojiClone = cc.find('Canvas/clone/spriteBaojiClone');
        this._spriteshanbiClone = cc.find('Canvas/clone/spriteshanbiClone');
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
        //this._equipArray.push(0);
        //this._equipArray.push(0);
        //this._equipArray.push(cc.find('Canvas/nodeBag1/labelLevel').getComponent(cc.Label));
        //this._equipArray.push(cc.find('Canvas/nodeBag1/labelExp').getComponent(cc.Label));
        this._labelGold = cc.find('Canvas/nodeBag/labelGold').getComponent(cc.Label);
        //cc.find('Canvas/nodeBag/labelCome').getComponent(cc.Label).string = '转生：'+ag.userInfo._data.come;
        //cc.find('Canvas/nodeBag/labelPractice').getComponent(cc.Label).string = '修为：'+ag.userInfo._data.practice+'/'+ag.gameConst.comeArray[ag.userInfo._data.come];

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
        //this._nameMap.node.setScale(1.5);


        //创建主角
        var node = new cc.Node();
        this._player = node.addComponent(Role);
        this._map.node.addChild(node);
        this._roleMap[ag.userInfo._data.id] = this._player;
        this._player.init(ag.userInfo._data);
        //this._labelGold.string = '元宝:'+this._player._data.gold;
        this._player.addGold(this._player._data.gold);

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

        this.schedule(function(){
            //处理脏数据
            for(key in this._dirtyRoleArray) {
                var role = this.getRole(key);
                if(role){
                    role.resetAllProp();
                }
                delete this._dirtyRoleArray[key];
            }



            //清理无效的飘雪数据
            for(i=0;i<this._flyBloodArray.length;){
                var id = this._flyBloodArray[i].id;
                var role = this.getRole(id);
                if(role){
                    if(!this._flyBloodFlagArray[id]){
                        role.flyAnimation(this._flyBloodArray[i].hp,this._flyBloodArray[i].type);
                        this._flyBloodFlagArray[id] = true;
                        this.node.runAction(cc.sequence(cc.delayTime(0.2),cc.callFunc(function(sender,value){
                            delete this._flyBloodFlagArray[value];
                        }.bind(this),this.node,id)));
                        this._flyBloodArray.splice(i,1);
                    }else{
                        ++i;
                    }
                }else{
                    this._flyBloodArray.splice(i,1);
                }
            }
        }.bind(this),0.01);
        this.schedule(ag.spriteCache.update001.bind(ag.spriteCache),0.01);
    },


    addDirty:function(id){
        this._dirtyRoleArray[id] = true;
    },


    //换地图
    changeMap:function(transferId){

        var lastMap = this._player._data.mapId;
        var nowMap = null;
        if(transferId){
            var transferMst = ag.gameConst._transferMst[transferId];
            ag.userInfo._data.mapId = transferMst.mapId;
            nowMap = transferMst.mapId;
            ag.userInfo._data.x = transferMst.x;
            ag.userInfo._data.y = transferMst.y;
        }

        var i=0;
        this._player._rightPos = cc.p(-1,-1);
        this._player._ai._locked = null;
        var mapId = ag.userInfo._data.mapId;
        var map = ag.gameConst._terrainMap[mapId];

        if(lastMap!=nowMap){
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
        }else{
            this._player.setLocation(ag.userInfo._data);
        }
        this._player._ai._busy = false;
        this._player.idle();
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
            var lastItem = ag.userInfo._itemMap[data.id];
            ag.userInfo._itemMap[data.id]={_data:data};
            ag.userInfo._itemMapBack[data.id] = ag.userInfo._itemMap[data.id];
            if(data.owner){
                var role = this.getRole(data.owner);
                if(role){
                    if(data.puton>=0){
                        role.addEquip(data.id);
                        this.addDirty(role._data.id);
                    }else if(data.puton==ag.gameConst.putonBag){
                        if(role==this._player)this.addItemToBag(data.id);
                    }
                }
            }
            if(lastItem._data.owner==this._player._data.id
                && lastItem._data.puton==ag.gameConst.putonBag
                && data.owner!=this._player._data.id ){//取消背包的装备
                this.delItemFormBag(data.id);
            }
        }else{
            ag.userInfo._itemMap[data.id]={_data:data};
            ag.userInfo._itemMapBack[data.id] = ag.userInfo._itemMap[data.id];
            if(data.owner){
                var role = this._roleMap[data.owner];
                if(role){
                    if(data.puton>=0){
                        role.addEquip(data.id);
                        if(role==this._player)this.itemToEquip(data.id);
                        this.addDirty(role._data.id);
                    }else if(data.puton==ag.gameConst.putonBag){
                        if(role==this._player)this.addItemToBag(data.id);
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
                this.addDirty(this._player._data.id);
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
        obj._data.puton = ag.gameConst.putonBag;
        if(obj && role){
            role.delEquip(id);
            this.addDirty(role._data.id);
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
        this._bag.showPanel(0);
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
        this._deal.close();//防止背包不在当前界面
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
        sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
        node.setPosition(startPos.x+disPos.x*(index%8),startPos.y-disPos.y*Math.floor(index/8));
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        bag.addChild(node);
        this._bagArray[index] = {id:id,node:node};
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            ag.musicManager.playEffect("resources/voice/button.mp3");
            if(this._auctionShop.node.active){
                this._auctionShop.selectItem(id);
            }else if(cc.find('Canvas/nodeWharehouse').active){
                cc.find('Canvas/nodeItemInfo').active = true;
                cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemIdByWharehouse(id);
            }else if(cc.find('Canvas/nodeDeal').active){
                cc.find('Canvas/nodeItemInfo').active = true;
                cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemIdByDeal(id);
            }else{
                cc.find('Canvas/nodeItemInfo').active = true;
                cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemId(id);
            }
        }.bind(this));
    },


    //删除一件道具
    delItemFormBag:function(id){
        this._deal.close();//防止背包不在当前界面
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
            sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
            node.setPosition(startPos.x+disPos.x*(index%8),startPos.y-disPos.y*Math.floor(index/8));
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            sprite.trim = false;
            cc.find('Canvas/nodeWharehouse/warehouse').addChild(sprite.node);
            this._wharehouseArray[index] = {id:id,node:node};



            node.off(cc.Node.EventType.TOUCH_END);
            node.on(cc.Node.EventType.TOUCH_END, function (event) {
                ag.musicManager.playEffect("resources/voice/button.mp3");
                if(this._auctionShop.node.active){
                    this._auctionShop.selectItem(id);
                }else if(cc.find('Canvas/nodeWharehouse').active){
                    cc.find('Canvas/nodeItemInfo').active = true;
                    cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemIdByWharehouse(id);
                }else if(cc.find('Canvas/nodeDeal').active){
                    cc.find('Canvas/nodeItemInfo').active = true;
                    cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setItemIdByDeal(id);
                }else{
                    cc.find('Canvas/nodeItemInfo').active = true;
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
        this._player.delEquip(id);
        if(puton>=0){
            var father = cc.find('Canvas/nodeBag/nodePanel/equip0');
            var node = father.getChildByName('equip'+puton);
            if(node){
                node.removeFromParent();
                node.destroy();
            }
        }

        if(mst.type==2){
            var spriteClothes = father.getChildByName('spriteClothes').getComponent(cc.Sprite);
            spriteClothes.spriteFrame = null;
        }else if(mst.type==0){
            var spriteWeapon = father.getChildByName('spriteWeapon').getComponent(cc.Sprite);
            spriteWeapon.spriteFrame = null;
        }
    },


    //掉落下一件道具
    itemEquipToGround:function(id,puton,role){
        var data = ag.userInfo._itemMap[id]._data;
        var mst = ag.gameConst._itemMst[data.mid];
        role.delEquip(id);
        if(role==this._player){
            if(puton>=0){
                var father = cc.find('Canvas/nodeBag/nodePanel/equip0');
                var node = father.getChildByName('equip'+puton);
                if(node){
                    node.removeFromParent();
                    node.destroy();
                }
            }

            if(mst.type==2){
                var spriteClothes = father.getChildByName('spriteClothes').getComponent(cc.Sprite);
                spriteClothes.spriteFrame = null;
            }else if(mst.type==0){
                var spriteWeapon = father.getChildByName('spriteWeapon').getComponent(cc.Sprite);
                spriteWeapon.spriteFrame = null;
            }
        }
    },


    //初始化一件道具
    itemBagToEquip:function(id){
        this._player.addEquip(id);
        this.delItemFormBag(id);
        this.itemToEquip(id);
    },


    //初始化一件道具
    itemToEquip:function(id){
        var data = ag.userInfo._itemMap[id]._data;
        var mst = ag.gameConst._itemMst[data.mid];
        var father = cc.find(data.owner==this._player._data.id?'Canvas/nodeBag/nodePanel/equip0':'Canvas/otherBag/equip');
        var node = father.getChildByName('equip'+data.puton);
        if(!node){
            node = new cc.Node();
            node.name = 'equip'+data.puton;
            node.scale = 1.5;
            node.setPosition(ag.gameConst.putonPositionArray[data.puton]);
            node.addComponent(cc.Sprite);
            father.addChild(node,10);
        }
        var sprite = node.getComponent(cc.Sprite);
        sprite.spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(''+mst.icon);
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            ag.musicManager.playEffect("resources/voice/button.mp3");
            var nodeItemInfo = cc.find('Canvas/nodeItemInfo');
            nodeItemInfo.active = true;
            nodeItemInfo.getComponent('ItemInfoNode').setItemId(id);
        }.bind(this));


        if(mst.type==2){
            var num = data.mid.substr(1);
            var spriteClothes = father.getChildByName('spriteClothes').getComponent(cc.Sprite);
            spriteClothes.spriteFrame = cc.loader.getRes("ani/neiguan",cc.SpriteAtlas).getSpriteFrame('n'+num);
            spriteClothes.node.setPosition(ag.gameConst.neiguan['i'+num]);
        }else if(mst.type==0){
            var num = data.mid.substr(1);
            var spriteWeapon = father.getChildByName('spriteWeapon').getComponent(cc.Sprite);
            spriteWeapon.spriteFrame = cc.loader.getRes("ani/neiguan",cc.SpriteAtlas).getSpriteFrame('n'+num);
            spriteWeapon.node.setPosition(ag.gameConst.neiguan['i'+num]);
        }
    },


    showOtherEquip:function(playerId){
        var role = this._roleMap[playerId];
        cc.find('Canvas/otherBag').active = true;
        var father = cc.find('Canvas/otherBag/equip');
        var array = father.children;
        for(var i=array.length-1;i>=0;--i){
            if(array[i].name!='labelTitle' && array[i].name!='spriteClothes'
                && array[i].name!='office' && array[i].name!='spriteWeapon'
                && array[i].name!='labelProp'
                && array[i].name!='labelGuild'){
                array[i].destroy();
                array[i].removeFromParent();
            }
        }
        var spriteClothes = father.getChildByName('spriteClothes').getComponent(cc.Sprite);
        spriteClothes.spriteFrame = null;
        var spriteWeapon = father.getChildByName('spriteWeapon').getComponent(cc.Sprite);
        spriteWeapon.spriteFrame = null;


        father.getChildByName('labelTitle').getComponent(cc.Label).string = role._data.name;
        father.getChildByName('labelGuild').getComponent(cc.Label).string = role.getGuildShow();
        father.getChildByName('labelProp').getComponent(cc.Label).string = '攻击:'+role.getHurt()+' 防御:'+role.getDefense();
        for(var key in ag.userInfo._itemMap){
            var data = ag.userInfo._itemMap[key]._data;
            if(data.owner==playerId && data.puton>=0){
                this.itemToEquip(data.id);
            }
        }

        //将官职数据保存到iteminfo界面
        cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode')._role = role;
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
    buttonShowChatNode:function(event){
        var node = cc.find('Canvas/nodeChatContent/spriteBack');
        this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
            var target = cc.find('Canvas/buttonChat');
            target.scaleX = -target.scaleX;
        })));
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
        //var role = this.getRole(id);
        //if(role && role._propNode){
        //    var node = new cc.Node();
        //    var tips = node.addComponent(cc.Label);
        //    node.x = 0;
        //    node.y = 140;
        //    tips.fontSize = 20;
        //    node.color = cc.color(255,255,255);
        //    tips.string = content;
        //    //role.node.addChild(node,30);
        //    role._propNode.addChild(node,30);
        //    node.runAction(cc.sequence(cc.delayTime(5), cc.fadeOut(0.2),cc.callFunc(function(){
        //        node.destroy();
        //    })));
        //}
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
        var i=0;
        var array = content.split('%');
        for(i = 0;i<array.length;++i){
            var str = ag.gameConst.codeMap[array[i]];
            if(str)array[i] = str;
        }
        content = array.join('');

        var callback = function(){
            this._systemNotifyArray[0].destroy();
            this._systemNotifyArray.splice(0,1);
            for(i=0;i<this._systemNotifyArray.length;++i){
                this._systemNotifyArray[i].y = 280-25*i;
            }
        }
        if(!this._systemNotifyArray)this._systemNotifyArray = [];
        var node = cc.instantiate(cc.find('Canvas/clone/labelSystemNotifyClone'));
        cc.find('Canvas/nodeChatContent').addChild(node);
        node.getComponent(cc.Label).string = content;
        node.runAction(cc.sequence(cc.delayTime(6),cc.fadeOut(1),cc.callFunc((callback.bind(this)))));
        this._systemNotifyArray.push(node);
        if(this._systemNotifyArray.length>=5){
            callback.call(this);
        }else{
            node.y = 280-25*(this._systemNotifyArray.length-1);
        }
    },


    toggleAutoAttack: function (event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this._setupAutoAttack = event.isChecked;
        cc.sys.localStorage.setItem('setupAutoAttack',''+event.isChecked);
    },
    toggleAutoPlayer: function (event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this._setupAutoPlayer = event.isChecked;
        cc.sys.localStorage.setItem('setupAutoPlayer',''+event.isChecked);
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
    toggleEventShowWing: function (event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.sys.localStorage.setItem('setupShowWing',''+event.isChecked);
        this._setupShowWing = event.isChecked;
        this.showWing(this._setupShowWing);
    },
    toggleEventAllowTeam: function (event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(!event.isChecked){
            ag.agSocket.send("exitTeam",{});
        }
    },


    showWing:function(bShow){
        for(var key in this._roleMap){
            var role = this._roleMap[key];
            if(role.getIsPlayer()){
                if(bShow){
                    role.idleAnimation();
                }else{
                    if(role._wingAni){role._wingAni.getComponent(AGAni).putCache();role._wingAni = undefined;}
                }
                role.setOffice(role._data.office);
            }
        }
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



    onShareResult:function(code, msg){
        cc.log("share result, resultcode:"+code+", msg: "+msg);
        switch ( code ) {
            case anysdk.ShareResultCode.kShareSuccess:
                ag.jsUtil.showText(this.node,'分享成功！');
                break;
            case anysdk.ShareResultCode.kShareFail:
                ag.jsUtil.showText(this.node,'分享失败！');
                break;
            case anysdk.ShareResultCode.kShareCancel:
                ag.jsUtil.showText(this.node,'分享取消！');
                break;
            case anysdk.ShareResultCode.kShareNetworkError:
                ag.jsUtil.showText(this.node,'分享网络错误！');
                break;
        }
    },


    getEquipIsEmpty:function(){
        for(var key in ag.userInfo._itemMap){
            var obj = ag.userInfo._itemMap[key];
            if(obj._data.owner==this._player._data.id && obj._data.puton>=0){
                return false;
            }
        }
        return true;
    },


    showNodeNpcContent:function(data){
        if(data.content.length==1){
            var transferMst = ag.gameConst._transferMst[data.content[0]];
            if(transferMst.id=='t9001'){
                this._rank.show();
                return;
            }else if(transferMst.id=='t9000'){
                this._card.show();
                return;
            }else if(transferMst.id=='t8000'){
                this._auctionShop.show();
                return;
            }else if(transferMst.id=='t6000'){
                cc.find('Canvas/nodeWharehouse').getComponent(Wharehouse).show();
                return;
            }else if(transferMst.id=='t5000'){
                cc.find('Canvas/nodeTreasure').active = true;
                var tempArray = ['001021','001020','001019','001016','001017','001018'
                    ,'001216','001217','001218','001219','001220','001221'
                    ,'001317','001318','001319','001320','001321','001322'
                    ,'001417','001418','001419','001420','001421','001422'
                    ,'001517','001518','001519','001520','001521','001522'
                    ,'001702','001802','002002'
                    ,'icon3','icon4','icon5','icon6','icon7','icon8','icon9','icon10'
                    ,'icon11','icon12','icon13','icon14'];

                var tempNode = cc.find('Canvas/nodeTreasure/spriteBack');
                for(var j=3;j<15;++j){
                    var random = Math.floor(Math.random()*tempArray.length);
                    tempNode.getChildByName('sprite'+j).getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame(tempArray[random]);
                }
                ag.agSocket.send("requestTreasureString",{});
                return;
            }
        }

        this._nodeNpcContent.active = true;
        this._nodeNpcContent.stopAllActions();
        this._nodeNpcContent.runAction(cc.sequence(cc.delayTime(30),cc.callFunc(function(){
            this.buttonEventNpcClose();
        }.bind(this))));
        this._nodeNpcContent.getChildByName('labelTitle').getComponent(cc.Label).string = data.title;
        var content = data.content;

        //处理特出显示
        if(data.content.length>0){
            if(data.content[0]=='t4000'){
                if(this.getIsGuildmember()){
                    content = ['t4006','t4007'];
                }else if(ag.userInfo._guildInvite){
                    content = ['t4000','t4001'];
                }else{
                    content = ['t4002','t4003','t4004','t4005','t4007'];
                }
            }else if(data.content[0]=='t9002'){
                if(this._player._data.type=='m0'){
                    content = ['t9003','t9004'];
                }else if(this._player._data.type=='m1'){
                    content = ['t9002','t9004'];
                }else if(this._player._data.type=='m2'){
                    content = ['t9002','t9003'];
                }
                content[2] = this._player._data.sex==ag.gameConst.sexBoy?'t9006':'t9005';
                content[3] = 't9007';
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
                        if(transferMst.id=='t9008'){
                            ag.jsUtil.alertOKCancel(self.node,'背包中2个一样的装备将全部合成？',function(){
                                ag.agSocket.send("forge",{});
                            },function(){});
                        }else if(transferMst.id=='t9002' || transferMst.id=='t9003' || transferMst.id=='t9004'){
                            if (self.getEquipIsEmpty()) {
                                if(self._player._data.gold>=5000){
                                    ag.jsUtil.alertOKCancel(self.node,'确认花费5000元宝'+transferMst.name+'？',function(){
                                        ag.agSocket.send("changeType",{type:transferMst.type});
                                    },function(){});
                                }else{
                                    ag.jsUtil.showText(self.node,'转职需要5000元宝的服务费！');
                                }
                            }else{
                                ag.jsUtil.showText(self.node,'身上有装备不能进行转职！');
                            }
                        }else if(transferMst.id=='t9005' || transferMst.id=='t9006'){
                            if (self.getEquipIsEmpty()) {
                                if(self._player._data.gold>=3000){
                                    ag.jsUtil.alertOKCancel(self.node,'确认花费3000元宝'+transferMst.name+'？',function(){
                                        ag.agSocket.send("changeSex",{});
                                    },function(){});
                                }else{
                                    ag.jsUtil.showText(self.node,'变性需要3000元宝的服务费！');
                                }
                            }else{
                                ag.jsUtil.showText(self.node,'身上有装备不能进行变性！');
                            }
                        }else if(transferMst.id=='t9007'){
                            if(self._player._data.gold>=5000){
                                self._changeNameByGold.show();
                            }else{
                                ag.jsUtil.showText(self.node,'改名需要5000元宝的服务费！');
                            }
                        }else if(transferMst.id=='t7100'){
                            if (cc.sys.isNative && (cc.sys.os === cc.sys.OS_ANDROID || cc.sys.os === cc.sys.OS_IOS)) {
                                var agent = anysdk.agentManager;
                                var share_plugin = agent.getSharePlugin();
                                share_plugin.setListener(self.onShareResult, self);
                                var info = {
                                    title : "邹平传奇",   // title 标题，印象笔记、邮箱、信息、微信、人人网和 QQ 空间使用
                                    imagePath:"",            // imagePath 是图片的本地路径，Linked-In 以外的平台都支持此参数
                                    url:"http://botsu.gitee.io/chuanqi",        // url 仅在微信（包括好友和朋友圈）中使用
                                    mediaType:'2',
                                    text : "手机版的传奇私服！",            // text 是分享文本，所有平台都需要这个字段
                                    thumbImage:'',
                                    thumbSize:'64',
                                    shareTo:'1'
                                }
                                share_plugin.share(info);
                            }else{
                                ag.jsUtil.showText(self.node,'分享只支持安卓和苹果APP包！');
                            }
                        }else if(transferMst.id=='t7000'){
                            if(self._player._data.gold>=ag.gameConst.dailyPriceArray[ag.gameConst.dailyWing]){
                                ag.agSocket.send("daily",{index:ag.gameConst.dailyWing});
                            }else{
                                ag.jsUtil.showText(self.node,'元宝不足'+ag.gameConst.dailyPriceArray[ag.gameConst.dailyWing]+'个！');
                            }
                        }else if(transferMst.id=='t7001'){
                            if(self._player._data.gold>=ag.gameConst.dailyPriceArray[ag.gameConst.dailyWingWithGold]){
                                ag.agSocket.send("daily",{index:ag.gameConst.dailyWingWithGold});
                            }else{
                                ag.jsUtil.showText(self.node,'元宝不足'+ag.gameConst.dailyPriceArray[ag.gameConst.dailyWingWithGold]+'个！');
                            }
                        }else if(transferMst.id=='t4002') {
                            var index = self._bagArray.indexOf(-1);
                            if(index!=-1 && self._player._data.gold>=100){
                                cc.find('Canvas/nodeCreateGuild').active = true;
                            }else{
                                ag.jsUtil.showText(self.node,'元宝不足100个！');
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
                        }else if(transferMst.id=='t4007'){
                            self._guildMember.show();
                        }else if(npcStr=='5级以下回收' || npcStr=='6级回收' || npcStr=='7级回收' || npcStr=='8级回收' || npcStr=='9级回收' || npcStr=='10级回收'){
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
                            var come = ag.gameConst._terrainMap[transferMst.mapId].come;
                            if(!come)come = 0;
                            var comeMax = ag.gameConst._terrainMap[transferMst.mapId].comeMax;
                            if(!comeMax)comeMax = 999;

                            if(self._player._data.come<come) {
                                ag.jsUtil.showText(self.node, '此地图要求转生等级' + come + '!!!');
                            }else if(self._player._data.come>comeMax) {
                                ag.jsUtil.showText(self.node, '此地图要求最高转生等级' + comeMax + '!!!');
                            }else if(self._player._data.level<level){
                                ag.jsUtil.showText(self.node,'此地图要求等级'+level+'!!!');
                            }else if(self._player._data.level>maxLevel){
                                ag.jsUtil.showText(self.node,'此地图要求最高等级'+maxLevel+'!!!');
                            }else{
                                if(transferMst.mapId=='t20'){
                                    if(ag.userInfo._guildMap[self._player._data.id]){
                                        if(ag.userInfo._guildWinId==self._player._data.id){
                                            self.changeMap(transferMst.id);
                                            ag.agSocket.send("changeMap",transferMst.id);
                                        }else{
                                            ag.jsUtil.showText(self.node,'此为沙巴克专属地图!!!');
                                        }
                                    }else{
                                        var bFind = false;
                                        for(var key in ag.userInfo._guildMap){
                                            var index = ag.userInfo._guildMap[key].member.indexOf(self._player._data.id);
                                            if(index!=-1){
                                                bFind = true;
                                                if(ag.userInfo._guildWinId==key){
                                                    self.changeMap(transferMst.id);
                                                    ag.agSocket.send("changeMap",transferMst.id);
                                                }else{
                                                    ag.jsUtil.showText(self.node,'此为沙巴克专属地图!!!');
                                                }
                                                break;
                                            }
                                        }
                                        if(bFind==false){
                                            ag.jsUtil.showText(self.node,'此为沙巴克专属地图!!!');
                                        }
                                    }
                                }else{
                                    self.changeMap(transferMst.id);
                                    ag.agSocket.send("changeMap",transferMst.id);
                                }
                            }
                        }
                    });
                }else{
                    label.node.active = false;
                }
            })(i);
        }
    },


    //整理背包
    buttonEventSortBag:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        for(var key in ag.userInfo._itemMap){
            var obj = ag.userInfo._itemMap[key];
            if(obj._data.owner==this._player._data.id && obj._data.puton==ag.gameConst.putonBag){
                var id = obj._data.id;
                this.delItemFormBag(id);
                this.addItemToBag(id);
            }
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



    //绑定翅膀事件
    //buttonEventWing:function(event){
    //    ag.musicManager.playEffect("resources/voice/button.mp3");
    //    cc.find('Canvas/nodeItemInfo').active = true;
    //    cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setWingByRole(this._player);
    //},


    //绑定其他翅膀事件
    buttonEventOtherWing:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeItemInfo').active = true;
        cc.find('Canvas/nodeItemInfo').getComponent('ItemInfoNode').setWingByRole();
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
        cc.find('Canvas/nodeChatContent/spriteBack/buttonChatSelect/Label').getComponent(cc.Label).string = '世界  ▲';
        this._chatType = ag.gameConst.chatAll;
    },
    buttonEventChatMap:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeChatContent/spriteBack/nodeButtonsChatSelect').active = false;
        cc.find('Canvas/nodeChatContent/spriteBack/buttonChatSelect/Label').getComponent(cc.Label).string = '当前  ▲';
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
            this._player._data.attackMode=ag.gameConst.attackModeTeam;
        }else if(this._player._data.attackMode==ag.gameConst.attackModeTeam){
            this._player._data.attackMode=ag.gameConst.attackModeAll;
        }
        cc.find('Canvas/buttonAttackMode/Label').getComponent(cc.Label).string = ag.gameConst.attackModeTextArray[this._player._data.attackMode];
        ag.agSocket.send("setAttackMode",{no:this._player._data.attackMode});
    },


    //转生事件
    buttonEventCome:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(this._player._data.level>=51){
            var rate = 1;
            if(this._player._data.level>=65)rate = 4;
            else if(this._player._data.level>=60)rate = 3;
            else if(this._player._data.level>=55)rate = 2;
            ag.jsUtil.alertOKCancel(this.node,'确认要使用'+(4*rate)+'万经验换取'+(10*rate)+'点修为？',function(){
                ag.jsUtil.request(this.node,'come','exp',function (data) {
                    if(data.code==0){
                        this.systemNotify('转生成功！');
                    }else if(data.code==1){
                        this.systemNotify('转生需要51级以上！');
                    }else if(data.code==2){
                        this.systemNotify('每天顶多转生三次！');
                    }else if(data.code==3){
                        this.systemNotify('您转生已经到达顶级！');
                    }else if(data.code==4){
                        this.systemNotify('未知错误！');
                    }
                }.bind(this));
            }.bind(this),function(){
            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,'转生需要51级以上！');
        }
    },


    //元神事件
    buttonEventSpirit:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(this._player._data.level>=50){
            var rate = 1;
            if(this._player._data.level>=65)rate = 4;
            else if(this._player._data.level>=60)rate = 3;
            else if(this._player._data.level>=55)rate = 2;
            ag.jsUtil.alertOKCancel(this.node,'确认要使用'+(4*rate)+'万经验换取'+(10*rate)+'点元神进度？',function(){
                ag.jsUtil.request(this.node,'spirit','exp',function (data) {
                    if(data.code==0){
                        this.systemNotify('兑换成功！');
                    }else if(data.code==1){
                        this.systemNotify('元神需要50级以上！');
                    }else if(data.code==2){
                        this.systemNotify('每天顶多元神三次！');
                    }else if(data.code==3){
                        this.systemNotify('您元神已经到达顶级！');
                    }else if(data.code==4){
                        this.systemNotify('未知错误！');
                    }
                }.bind(this));
            }.bind(this),function(){
            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,'元神需要50级以上！');
        }
    },

    //treasure一次
    buttonEventTreasureClose:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeTreasure').active = false;
    },

    //treasure一次
    buttonEventTreasureOne:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var index = this._bagArray.indexOf(-1);
        if(index!=-1 && this._player._data.gold>=200){
            ag.agSocket.send("treasure",{});
        }else{
            ag.jsUtil.showText(this.node,'背包已满,或者元宝不足200个！');
        }
    },

    //treasure5次
    buttonEventTreasureFive:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var findBagItemCount = 0;
        for(var j=0;j<this._bagArray.length;++j){
            if(this._bagArray[j]==-1)++findBagItemCount;
        }
        if(findBagItemCount>=5 && this._player._data.gold>=1000){
            ag.agSocket.send("treasure5",{});
        }else{
            ag.jsUtil.showText(this.node,'背包已满,或者元宝不足1000个！');
        }
    },


    //回城事件
    buttonEventGotoCity:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var transferMst = ag.gameConst._transferMst[ag.gameConst._terrainMap[this._player._data.mapId].tranCity];
        var level = ag.gameConst._terrainMap[transferMst.mapId].level;
        var maxLevel = ag.gameConst._terrainMap[transferMst.mapId].maxLevel;
        if(!maxLevel)maxLevel = 65535;
        if(this._player._data.level>=level && this._player._data.level<=maxLevel){
            this.changeMap(transferMst.id);
            //请求本地图所有角色
            ag.agSocket.send("changeMap",transferMst.id);
            this._nodeBag.active = false;
        }else{
            ag.jsUtil.showText(this.node,'此地图要求等级'+level+'!!!');
        }
    },


    //抽奖记录
    showTreasureString:function(str){
        //保存到聊天记录里面
        var scrollview = cc.find('Canvas/nodeTreasure/spriteBack/scrollView').getComponent(cc.ScrollView);
        var contentNode = scrollview.content;
        var itemNode = contentNode.getChildByName('item');
        itemNode.getComponent(cc.Label).string = str;
        contentNode.height = Math.max(itemNode.height,270);
        scrollview.scrollToBottom();
    },

    //商城事件
    buttonEventShop:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeShop').active = true;
    },


    //显示锁定角色信息列表
    buttonEventNodeLockedList:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/nodeLockedList').active = true;
    },

    //查看组队信息
    buttonEventSeeTeam:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        ag.agSocket.send("seeTeam",{});
    },



    //一键穿戴装备
    buttonEventPuton:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        for(var key in ag.userInfo._itemMap){
            var obj = ag.userInfo._itemMap[key];
            if(obj._data.owner==this._player._data.id && obj._data.puton==ag.gameConst.putonBag){
                var mst = ag.gameConst._itemMst[obj._data.mid];
                if(this._player._data.come>=ag.gameConst.equipCome[mst.level]
                    && mst.exclusive.indexOf(this._player.getTypeNum())!=-1){
                    var index = ag.gameConst.putonTypes.indexOf(mst.type);
                    var putOnId = this.getPlayerItemId(index);
                    if(putOnId) {//手和戒指右边的处理
                        var mst2 = ag.gameConst._itemMst[ag.userInfo._itemMap[putOnId]._data.mid];
                        if ((mst.type == 4 || mst.type == 5)) {
                            var indexRight = index + 1;
                            var putOnIdRight = this.getPlayerItemId(indexRight);
                            if (putOnIdRight) {
                                var mstOther = ag.gameConst._itemMst[ag.userInfo._itemMap[putOnIdRight]._data.mid];
                                if (mstOther.level < mst2.level) {
                                    index = indexRight;
                                    putOnId = putOnIdRight;
                                }
                            } else {
                                index = indexRight;
                                putOnId = putOnIdRight;
                            }
                        }
                    }

                    if(putOnId){//如果有装备，则切换装备
                        var mst2 = ag.gameConst._itemMst[ag.userInfo._itemMap[putOnId]._data.mid];
                        if(mst.level>mst2.level){
                            var id = obj._data.id;
                            ag.agSocket.send("bagItemToEquip",{id:id,puton:index});
                            if(putOnId)ag.userInfo._itemMap[putOnId]._data.puton = ag.gameConst.putonBag;
                            ag.userInfo._itemMap[id]._data.puton = index;
                            this.itemBagToEquip(id);
                            if(putOnId)ag.gameLayer.addItemToBag(putOnId);
                        }
                    }else{
                        var id = obj._data.id;
                        ag.agSocket.send("bagItemToEquip",{id:id,puton:index});
                        ag.userInfo._itemMap[id]._data.puton = index;
                        this.itemBagToEquip(id);
                    }
                }
            }
        }
        this.addDirty(this._player._data.id);
    },


    //获得身上位置的道具id
    getPlayerItemId:function(index){
        var tempId = null;
        for(var key in ag.userInfo._itemMap){
            var obj = ag.userInfo._itemMap[key]._data;
            if(obj.owner==ag.gameLayer._player._data.id && obj.puton==index){
                tempId = obj.id;
                break;
            }
        }
        return tempId;
    },

});
