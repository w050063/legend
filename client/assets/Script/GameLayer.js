/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗场景
 */


var Role = require("Role");
var Item = require("Item");
var AGMap = require("AGMap");
var AGListView = require("AgListView");
var baseNpcId = 5000;
cc.Class({
    extends: cc.Component,
    properties: {},

    onDestroy:function(){
        if(cc.sys.isBrowser){
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        }
    },

    // use this for initialization
    onLoad: function () {
        ag.gameLayer = this;
        this._roleMap = {};
        this._player = null;
        this._lastMapPosition = cc.p(0,0);

        //自动攻击
        var temp = cc.sys.localStorage.getItem('setupAutoAttack');
        if(!temp){
            cc.sys.localStorage.setItem('setupAutoAttack','true');
            this._setupAutoAttack = true;
        }else if(temp=='true'){
            this._setupAutoAttack = true;
        }else{
            this._setupAutoAttack = false;
            cc.find('Canvas/nodeHelp/toggleAutoAttack').getComponent(cc.Toggle).isChecked = false;
        }

        //启用摇杆
        var temp = cc.sys.localStorage.getItem('setupRock');
        if(!temp){
            cc.sys.localStorage.setItem('setupRock','true');
        }else if(temp=='false'){
            cc.find('Canvas/nodeHelp/toggleSetupRock').getComponent(cc.Toggle).isChecked = false;
            cc.find('Canvas/nodeRock').active = false;
        }


        this._flyBloodArray = [];//飘血数组


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


        this._equipArray = [];
        var self = this;
        for(var i=0;i<5;++i){
            (function(i){
                self._equipArray.push(cc.find('Canvas/nodeBag/sprite'+i+'/sprite').getComponent(cc.Sprite));
                cc.find('Canvas/nodeBag/sprite'+i).on(cc.Node.EventType.TOUCH_END, function (event) {
                    cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
                    for(var key in ag.userInfo._itemMap){
                        var obj = ag.userInfo._itemMap[key];
                        var mst = ag.gameConst._itemMst[obj._data.mid];
                        if(obj._data.owner==self._player._data.id && obj._data.puton && mst.type==i){
                            delete obj._data.puton;
                            self._player.delEquip(i);
                            self.refreshBag();
                            self.refreshEquip();
                            ag.agSocket.send("equipItemToBag",obj._data.id);
                        }
                    }
                });
            })(i);
        }
        this._equipArray.push(cc.find('Canvas/nodeBag/labelAttack').getComponent(cc.Label));
        this._equipArray.push(cc.find('Canvas/nodeBag/labelDefense').getComponent(cc.Label));
        this._equipArray.push(cc.find('Canvas/nodeBag/labelLevel').getComponent(cc.Label));
        this._equipArray.push(cc.find('Canvas/nodeBag/labelExp').getComponent(cc.Label));

        //聊天相关
        var nodeChat = cc.find('Canvas/nodeChat');
        nodeChat.active = false;
        nodeChat.on(cc.Node.EventType.TOUCH_END, function (event) {
            cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
            nodeChat.active = false;
            cc.find('Canvas/nodeChat/editBoxName').getComponent(cc.EditBox).stayOnTop = false;
        }.bind(this));
        this._chatContentArray = [];
        this._chatLabelArray = [];
        for(var i=0;i<5;++i){
            this._chatLabelArray.push(cc.find('Canvas/nodeChatContent/label'+i));
            this._chatLabelArray[i].opacity = 0;
        }

        //系统公告
        cc.find('Canvas/nodeChatContent/labelSystemNotify').opacity = 0;

        this._nodeBag = cc.find("Canvas/nodeBag");
        this._nodeBag.active = false;
        this._scrollViewList = cc.find("Canvas/nodeBag/scrollViewList").getComponent(AGListView);
        this._scrollViewList.setSpace(2);
        this.refreshBag();


        //测试新地图
        this._map = cc.find("Canvas/nodeMap").addComponent(AGMap);
        this._map.node.setScale(1.5);
        this._nameMap = cc.find("Canvas/nodeNameMap").addComponent(AGMap);
        this._nameMap.node.setScale(1.5);

        this.changeMap();
        //请求本地图所有角色
        ag.agSocket.send("changeMap",undefined);
		
		
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



        //启动定时器,每秒执行一次
        this.schedule(ag.buffManager.update1.bind(ag.buffManager),1);
        this.schedule(ag.buffManager.update5.bind(ag.buffManager),5);
        this.schedule(ag.spriteCache.update001.bind(ag.spriteCache),0.01);
    },


    //换地图
    changeMap:function(transferId){
        //清空所有内容
        ag.buffManager.changeMap();
        this.buttonEventNpcClose();
        for(var key in this._roleMap){
            this._roleMap[key].putCache();
        }
        this._map.node.destroyAllChildren();
        this._nameMap.node.destroyAllChildren();
        ag.gameLayer._spriteTopRight.node.destroyAllChildren();
        this._roleMap = {};
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
            cc.audioEngine.play(cc.url.raw("resources/music/"+map.music),true,1);
        }


        //地图更新
        //this._map.test(mapId);
        this._map.init(map.res);

        //创建主角
        var node = new cc.Node();
        this._player = node.addComponent(Role);
        this._map.node.addChild(node);
        this._roleMap[ag.userInfo._data.id] = this._player;
        this._player.init(ag.userInfo._data);
        this.refreshEquip();

        //增加npc
        for(var i=0;i<map.npc.length;++i){
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
        ag.userInfo._itemMap = {};

        var minMap = map.res;
        minMap = 'minMap'+minMap.substr(minMap.indexOf('/'));
        cc.loader.loadRes(minMap, cc.SpriteFrame,function (err, spriteFrame) {
            this._spriteMinMap.spriteFrame = spriteFrame;
            this._spriteTopRight.spriteFrame = spriteFrame.clone();
            this.resetMinMapPos();
        }.bind(this));
    },


    resetMinMapPos:function(){
        var map = ag.gameConst._terrainMap[this._player._data.mapId];
        this._labelLocation.string = map.name+' '+this._player._data.x+','+this._player._data.y;
        var spriteFrame = this._spriteTopRight.spriteFrame;
        if(spriteFrame){
            spriteFrame = spriteFrame.clone();
            var nodeSize = this._spriteTopRight.node.getContentSize();
            var size = spriteFrame.getOriginalSize();

            var left = Math.max((this._player.getLocation().x+0.5)/map.mapX*size.width-nodeSize.width/2,0);
            left = Math.floor(Math.min(left,size.width-nodeSize.width));
            var top = Math.max(size.height-(this._player.getLocation().y+0.5)/map.mapY*size.height-nodeSize.height/2,0);
            top = Math.floor(Math.min(top,size.height-nodeSize.height));
            spriteFrame.setRect(cc.rect(left,top,nodeSize.width,nodeSize.height));
            this._spriteTopRight.spriteFrame = spriteFrame;

            //设置小地图上人的坐标
            var truePos = this._player.getTruePosition();
            this._nodeMinMapPlayer.setPosition(((this._player._data.x+0.5)/map.mapX-0.5)*size.width,((this._player._data.y+0.5)/map.mapY-0.5)*size.height);
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
        cc.audioEngine.play(cc.url.raw("resources/music/Dragon Rider.mp3"),true,1);
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
        if(!this.getRole(data.id)){
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
        if(!data.owner){
            this.dropItem(data);
        }else if(!data.puton){
            ag.userInfo._itemMap[data.id]={_data:data};
            if(data.owner==this._player._data.id)this.refreshBag();
        }else{
            ag.userInfo._itemMap[data.id]={_data:data};
            var role = this.getRole(data.owner);
            if(role){
                role.addEquip(data.mid);
                if(role == this._player)this.refreshEquip();
            }
        }
    },


    //地上增加一个道具,并且存到本地实例中
    dropItem:function (data) {
        if(data.mapId==this._player._data.mapId){
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
                this.refreshBag();
            }
        }
    },


    deleteRoleByServer:function (id) {
        var player =  ag.gameLayer.getRole(id);
        if(player){
            for(var key in ag.userInfo._itemMap){
                var obj = ag.userInfo._itemMap[key];
                if(obj._data.owner==id){
                    delete ag.userInfo._itemMap[key];
                }
            }
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
            this.refreshBag();
            this.systemNotify(ag.gameConst._itemMst[obj._data.mid].name+'被发现！');
        }
    },


    bagItemToEquip:function(id,rid){
        var obj = ag.userInfo._itemMap[id];
        var role = ag.gameLayer.getRole(rid);
        if(obj && role){
            obj._data.owner = rid;
            obj._data.puton = 1;
            role.addEquip(obj._data.mid);
        }
    },


    equipItemToBag:function(id,rid){
        var obj = ag.userInfo._itemMap[id];
        var role = ag.gameLayer.getRole(rid);
        if(obj && role){
            delete obj._data.puton;
            role.delEquip(ag.gameConst._itemMst[obj._data.mid].type);
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
            if(role._data.camp==ag.gameConst.campMonster){
                if(!this._roleXYMap[''+role._data.mapId+','+(role._data.x+offset.x)+','+(role._data.y+offset.y)])return direction;
            }else{
                return direction;
            }
        }
        var pointArray=ag.gameConst.directionArray;//可走方向
        var index = direction;


        if(role._data.camp==ag.gameConst.campMonster){//怪物
            var percent = [10000,1000,100,10,1];//权重比例
            var weight=[];
            var max = 0;
            for(var i=0;i<8;++i){
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
            for(var i=0;i<8;++i){
                curWeight += weight[i];
                if(randNum<curWeight)return i;
            }
        }else{//英雄
            var randNum=Math.random()<0.5 ? -1:1;
            for(var i=0;i<8;++i){
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


    //是否攻击
    isEnemyCamp:function(role1,role2){
        if(role1!=role2 && role1._state != ag.gameConst.stateDead && role2._state != ag.gameConst.stateDead
            && role1._data.camp!=ag.gameConst.campNpc && role2._data.camp!=ag.gameConst.campNpc){
            if(role1._data.camp!=role2._data.camp)return true;
            if(role1._data.camp==ag.gameConst.campLiuxing && role2._data.camp==ag.gameConst.campLiuxing)return true;
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
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        this._nodeBag.active = true;
    },


    buttonBagClose:function (sender) {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        this._nodeBag.active = false;
    },
    buttonSettingClose:function (sender) {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        cc.find('Canvas/nodeHelp').active = false;
    },


    refreshBag:function () {
        var array = [];
        for(var key in ag.userInfo._itemMap){
            var obj = ag.userInfo._itemMap[key];
            if(obj._data.owner==this._player._data.id && !obj._data.puton){
                array.push(obj);
            }
        }
        this._scrollViewList.setCount(array.length);
        this._scrollViewList.setCallback(function(item,index){
            var data = ag.gameConst._itemMst[array[index]._data.mid];
            item.getChildByName('spriteIcon').getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame('000'+data.id.substr(1));
            item.getChildByName('spriteIcon').setScale(2);
            item.getChildByName('labelName').getComponent(cc.Label).string = this.getItemBagShow(data);
            item.off('touchstart');
            item.on('touchstart', function (event) {
            }.bind(this));

            var button = item.getChildByName('buttonEquip');
            button.off(cc.Node.EventType.TOUCH_END);
            button.on(cc.Node.EventType.TOUCH_END, function (event) {
                var id = array[index]._data.id;
                var mst = ag.gameConst._itemMst[array[index]._data.mid];
                if(mst.exclusive.indexOf(this._player.getTypeNum())!=-1){
                    ag.agSocket.send("bagItemToEquip",id);
                    for(var key in ag.userInfo._itemMap){
                        var obj = ag.userInfo._itemMap[key]._data;
                        if(obj.owner==this._player._data.id && obj.puton && mst.type==ag.gameConst._itemMst[obj.mid].type){
                            delete obj.puton;
                            break;
                        }
                    }
                    ag.userInfo._itemMap[id]._data.puton = 1;
                    this._player.addEquip(mst.id);
                    this.refreshBag();
                    this.refreshEquip();
                }else{
                    ag.jsUtil.showText(this.node,'不能穿戴');
                }
            }.bind(this));

            var button = item.getChildByName('buttonDrop');
            button.off(cc.Node.EventType.TOUCH_END);
            button.on(cc.Node.EventType.TOUCH_END, function (event) {
                var id = array[index]._data.id;
                ag.agSocket.send("bagItemToGround",id);
                ag.userInfo._itemMap[id]._data.owner = undefined;
                this.refreshBag();
            }.bind(this));
        }.bind(this));
        this._scrollViewList.reload();
    },


    refreshEquip:function () {
        var array = [];
        for(var key in ag.userInfo._itemMap){
            var obj = ag.userInfo._itemMap[key];
            if(obj._data.owner==this._player._data.id && obj._data.puton){
                array.push(obj);
            }
        }


        for(var i=0;i<5;++i){
            this._equipArray[i].spriteFrame = undefined;
        }

        for(var i=0;i<array.length;++i){
            var mst = ag.gameConst._itemMst[array[i]._data.mid];
            this._equipArray[mst.type].spriteFrame = cc.loader.getRes("ani/icon",cc.SpriteAtlas).getSpriteFrame('000'+mst.id.substr(1));
            this._equipArray[mst.type].node.setScale(2);
        }


        //属性显示
        var mst = this._player.getMst();
        var lv = this._player._data.level;
        var hurt = mst.hurt+Math.floor(mst.hurtAdd*lv);
        var defense = mst.defense+Math.floor(mst.defenseAdd*lv);
        for(var i=0;i<5;++i){
            if(this._player._equipArray[i]){
                var itemMst = ag.gameConst._itemMst[this._player._equipArray[i]];
                if(itemMst.hurt)hurt+=itemMst.hurt;
                if(itemMst.defense)defense+=itemMst.defense;
            }
        }
        this._equipArray[5].string = '攻击:'+hurt;
        this._equipArray[6].string = '防御:'+defense;
        this._player._hurt = hurt;
        this._player._defense = defense;
    },


    //获得属性显示
    getItemBagShow:function (data) {
        return data.name+(data.hurt?' 攻击力:'+data.hurt:' ')+(data.defense?' 防御:'+data.defense:' ');
    },


    //聊天按钮
    buttonShowChatNode:function(){
        cc.find('Canvas/nodeChat').active = true;
        if(!(cc.sys.isMobile && cc.sys.isBrowser)){
            var editbox = cc.find('Canvas/nodeChat/editBoxName').getComponent(cc.EditBox);
            editbox.stayOnTop = true;
            editbox.setFocus();
        }
    },

    //聊天按钮
    buttonShowHelp:function(){
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        cc.find('Canvas/nodeHelp').active = true;
    },


    //回车发送信息
    editBoxConfirm: function (sender) {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        cc.find('Canvas/nodeChat').active = false;
        cc.find('Canvas/nodeChat/editBoxName').getComponent(cc.EditBox).stayOnTop = false;
        if(sender.string.length>0){
            ag.agSocket.send("chatYou",sender.string);
            sender.string = '';
        }
        this._bEditBoxKey = true;
    },

    chat:function(id,name,content){
        var role = this.getRole(id);
        if(role){
            var node = new cc.Node();
            var tips = node.addComponent(cc.Label);
            node.x = 0;
            node.y = 87;
            tips.fontSize = 12;
            node.color = cc.color(255,255,255);
            tips.string = content;
            role.node.addChild(node,30);
            node.runAction(cc.sequence(cc.delayTime(3), cc.fadeOut(0.2),cc.callFunc(function(){
                node.destroy();
            })));
        }
        var lb = this._chatLabelArray[0];
        var y = this._chatLabelArray[0].y;
        for(var i=0;i<4;++i){
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
        lb.runAction(cc.sequence(cc.delayTime(15),cc.fadeOut(2)));
    },


    systemNotify:function(content){
        var node = cc.find('Canvas/nodeChatContent/labelSystemNotify');
        node.opacity = 255;
        node.getComponent(cc.Label).string = content;
        node.stopAllActions();
        node.runAction(cc.sequence(cc.delayTime(3),cc.fadeOut(2)));
    },


    toggleAutoAttack: function (event) {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        this._setupAutoAttack = event.isChecked;
        cc.sys.localStorage.setItem('setupAutoAttack',''+event.isChecked);
    },
    toggleEventSetupRock: function (event) {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        cc.find('Canvas/nodeRock').active = event.isChecked;
        cc.sys.localStorage.setItem('setupRock',''+event.isChecked);
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
        this._nodeNpcContent.active = false;
    },

    showNodeNpcContent:function(data){
        this._nodeNpcContent.active = true;
        this._nodeNpcContent.getChildByName('labelTitle').getComponent(cc.Label).string = data.title;
        var self = this;
        for(var i=0;i<4;++i){
            (function(i){
                var label = self._nodeNpcContent.getChildByName('label'+i).getComponent(cc.Label);
                if(i<data.content.length){
                    var transferMst = ag.gameConst._transferMst[data.content[i]];
                    label.node.active = true;
                    label.string = transferMst.name;
                    label.node.off(cc.Node.EventType.TOUCH_END);
                    label.node.on(cc.Node.EventType.TOUCH_END, function (event) {
                        var npcStr = transferMst.name;
                        if(npcStr=='一级回收' || npcStr=='二级回收' || npcStr=='三级回收'){
                            var curLevel = 1;
                            if(npcStr=='一级回收'){
                                curLevel = 1;
                            }else if(npcStr=='二级回收'){
                                curLevel = 2;
                            }else if(npcStr=='三级回收'){
                                curLevel = 3;
                            }
                            var array = [];
                            for(var key in ag.userInfo._itemMap){
                                var obj = ag.userInfo._itemMap[key];
                                if(obj._data.owner==self._player._data.id && !obj._data.puton && ag.gameConst._itemMst[obj._data.mid].level==curLevel){
                                    array.push(obj._data.id);
                                }
                            }
                            if(array.length>0)ag.agSocket.send("bagItemRecycle",array.join(','));
                            else{
                                ag.jsUtil.showText(this.node,"没有可回收的装备！");
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
});
