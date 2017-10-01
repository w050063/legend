/**
 * Created by bot.su on 2017/6/21.
 * 核心战斗场景
 */


var Role = require("Role");
var Item = require("Item");
var AGTerrain = require("AGTerrain");
var AGListView = require("AgListView");
cc.Class({
    extends: cc.Component,
    properties: {},



    // use this for initialization
    onLoad: function () {
        ag.gameLayer = this;
        this._roleMap = {};
        this._player = null;
        this._lastMapPosition = cc.p(0,0);

        this._equipArray = [];
        var self = this;
        for(var i=0;i<5;++i){
            (function(i){
                self._equipArray.push(cc.find('Canvas/nodeBag/sprite'+i+'/sprite').getComponent(cc.Sprite));
                cc.find('Canvas/nodeBag/sprite'+i).on(cc.Node.EventType.TOUCH_END, function (event) {
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




        this._nodeBag = cc.find("Canvas/nodeBag");
        this._nodeBag.active = false;
        this._scrollViewList = cc.find("Canvas/nodeBag/scrollViewList").getComponent(AGListView);
        this._scrollViewList.setSpace(2);
        this.refreshBag();


        cc.audioEngine.play(cc.url.raw("resources/music/background.mp3"),true,1);


        //测试新地图
        this._map = cc.find("Canvas/nodeMap").addComponent(AGTerrain);
        this._map.init(["resources/map/terrain0.png","resources/map/terrain1.png",
            "resources/map/terrain2.png","resources/map/terrain3.png","resources/map/terrain4.png","resources/map/terrain5.png"]);
        //node.setScale(0.2);



        //创建主角
        var node = new cc.Node();
        this._player = node.addComponent(Role);
        this._map.node.addChild(node);
        this._roleMap[ag.userInfo._data.id] = this._player;
        this._player.init(ag.userInfo._data);



        //启动定时器,每秒执行一次
        this.schedule(ag.buffManager.update1.bind(ag.buffManager),1);
        this.schedule(ag.buffManager.update5.bind(ag.buffManager),5);
        this.schedule(ag.altasTask.update001.bind(ag.altasTask),0.01);
    },


    gotoHall:function(sender){
        pomelo.removeAllListeners('onData');
        ag.agSocket._dataArray = [];
        ag.userInfo._itemMap = {};
        cc.audioEngine.stopAll();
        cc.director.loadScene('HallScene');
        ag.gameLayer = null;
    },

    log:function(str){
        //if(!this._log){
        //    this._log = this.node.getChildByName('editBoxName').getComponent('cc.EditBox');
        //    this._log.node.setLocalZOrder(99999);
        //}
        //var s = this._log.string + str;
        //s = s.substr(s.length-400,400);
        //this._log.string = s;
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
            this.refreshBag();
        }else{
            ag.userInfo._itemMap[data.id]={_data:data};
            var role = this.getRole(data.owner);
            role.addEquip(data.mid);
            if(role == this._player)this.refreshEquip();
        }
    },


    //地上增加一个道具,并且存到本地实例中
    dropItem:function (data) {
        var node = new cc.Node();
        var item = node.addComponent(Item);
        this._map.node.addChild(node,1);
        item.init(data);
        ag.userInfo._itemMap[data.id]={_data:data,comp:item};
    },


    sItemDisappear:function (id) {
        var obj = ag.userInfo._itemMap[id];
        if(obj && obj.comp){
            obj._data.owner = undefined;
            obj.comp.node.destroy();
            obj.comp = undefined;
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
        var obj = ag.gameConst._terrainMap[mapId];
        if(x<0 || x>obj.mapX || y<0 || y>obj.mapY)return true;
        for(var i=0;i<obj.collision.length;++i){
            if(obj.collision[i][0]==x && obj.collision[i][1]==y)return true;
        }
        return false;
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


    //get every one attack rangle..
    getAttackDistance:function(role1,role2){
        var myLocation=role1.getLocation();
        var enemyLocation=role2.getLocation();
        var x=Math.abs(enemyLocation.x-myLocation.x);
        var y=Math.abs(enemyLocation.y-myLocation.y);
        if(role1._data.type=="m0"){
            if (x<=2 && y<=2 && x+y!=3)return true;
        }else{
            if(cc.pDistance(myLocation,enemyLocation)<=role1.getMst().attackDistance)return true;
        }
        return false;
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
    getRoleFromCenterXY:function (mapId,center,x,y) {
        x = x?x:0;
        y = y?y:0;
        var retArray = [];
        for(var key in this._roleMap){
            var data = this._roleMap[key]._data;
            if(mapId==data.mapId && data.x>=center.x-x && data.x<=center.x+x && data.y>=center.y-y && data.y<=center.y+y){
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
        if(role1!=role2 && role1._state != ag.gameConst.stateDead && role2._state != ag.gameConst.stateDead){
            if(role1._data.camp!=role2._data.camp)return true;
            if(role1._data.camp==ag.gameConst.campLiuxing && role2._data.camp==ag.gameConst.campLiuxing)return true;
        }
        return false;
    },


    //获得可以站立的位置
    getStandLocation: function (mapId,x,y,r){
        x = x-r+Math.floor(Math.random()*(2*r+1));
        y = y-r+Math.floor(Math.random()*(2*r+1));
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
        this._nodeBag.active = true;
    },


    buttonClose:function (sender) {
        this._nodeBag.active = false;
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

            item.off(cc.Node.EventType.TOUCH_END);
            item.getChildByName('buttonEquip').on(cc.Node.EventType.TOUCH_END, function (event) {
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
            item.off(cc.Node.EventType.TOUCH_END);
            item.getChildByName('buttonDrop').on(cc.Node.EventType.TOUCH_END, function (event) {
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
        var hurt = mst.hurt+mst.hurtAdd*lv;
        var defense = mst.defense+mst.defenseAdd*lv;
        for(var i=0;i<5;++i){
            if(this._player._equipArray[i]){
                var itemMst = ag.gameConst._itemMst[this._player._equipArray[i]];
                if(itemMst.hurt)hurt+=itemMst.hurt;
                if(itemMst.defense)defense+=itemMst.defense;
            }
        }
        this._equipArray[5].string = '攻击:'+hurt;
        this._equipArray[6].string = '防御:'+defense;
    },


    //获得属性显示
    getItemBagShow:function (data) {
        return data.name+(data.hurt?' 攻击力:'+data.hurt:' ')+(data.defense?' 防御:'+data.defense:' ');
    }
});
