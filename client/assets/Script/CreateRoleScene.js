/**
 * Created by bot.su on 2017/6/21.
 * 选人界面
 */


var AGAni = require("AGAni");
cc.Class({
    extends: cc.Component,
    properties: {},

    onDestroy:function(){
        pomelo.removeAllListeners('sEnter');
    },

    // use this for initialization
    onLoad: function () {
        var node = cc.find("Canvas/door");
        node.setPosition(ag.userInfo.backGroundPos);
        var dis0 = cc.pDistance(cc.p(280,230),cc.p(-100,-330));
        var dis1 = cc.pDistance(cc.p(280,230),ag.userInfo.backGroundPos);
        node.runAction(cc.sequence(cc.moveTo(20*dis1/dis0,cc.p(280,230)),cc.callFunc(function(){
            node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(20,cc.p(-100,-330)),cc.moveTo(20,cc.p(280,230)))));
        })));

        this._selectIndex = 0;
        //初始化按钮对象
        this._nodeRoleArray = [];
        var pageView = cc.find('Canvas/pageViewRole').getComponent(cc.PageView);
        for(var i=0;i<6;++i){
            (function (i) {
                var nodeRole = pageView.content.getChildByName('page_'+Math.floor(i/2)).getChildByName('role'+i);
                nodeRole.on('touchend', function () {
                    ag.musicManager.playEffect("resources/voice/button.mp3");
                    this.setSelected(i);
                }.bind(this));
                this._nodeRoleArray.push(nodeRole);
            }.call(this,i));
        }
        var selectIndex = this.getRoleIndex(ag.userInfo._accountData.type,ag.userInfo._accountData.sex);
        this.setSelected(selectIndex);


        this._buttonDelete = cc.find('Canvas/buttonDelete').getComponent(cc.Button);
        this._buttonStart = cc.find('Canvas/buttonStart').getComponent(cc.Button);
        //this._buttonDelete.enableAutoGrayEffect = true;
        //this._buttonStart.enableAutoGrayEffect = true;
        //this._buttonDelete.interactable = false;
        //this._buttonStart.interactable = true;


        //个人信息相关
        cc.find('Canvas/spriteIconButton').on('touchend', function () {
            cc.find('Canvas/spriteHeadInfo').active = true;
            this.nextUpdateInfo();
        }, this);


        //是否第一次改名字
        if(!cc.sys.localStorage.getItem('firstChangeName')){
            cc.sys.localStorage.setItem('firstChangeName','1');
            ag.jsUtil.showText(this.node,'欢迎大侠，给您起个霸气的名字吧！');
            cc.find('Canvas/spriteHeadInfo').active = true;
        }else{
            cc.find('Canvas/spriteHeadInfo').active = false;
        }
        this.firstUpdateInfo();


        pomelo.on('sEnter',function(data) {
            var msg = JSON.parse(data.msg);
            ag.userInfo._id = msg.id;
            ag.userInfo._name = msg.name;
            ag.userInfo._x = msg.x;
            ag.userInfo._y = msg.y;
            ag.userInfo._data = msg;
            ag.userInfo._accountData.sex = msg.sex;
            ag.userInfo._accountData.type = msg.type;
            ag.agSocket.onBattleEvent();
            cc.director.loadScene("GameLayer");
        }.bind(this));
        this.schedule(ag.spriteCache.update001.bind(ag.spriteCache),0.01);
    },

    start:function(){
        var pageView = cc.find('Canvas/pageViewRole').getComponent(cc.PageView);
        var selectIndex = this.getRoleIndex(ag.userInfo._accountData.type,ag.userInfo._accountData.sex);
        pageView.setCurrentPageIndex(Math.floor(selectIndex/2));
    },


    //选中哪一个
    setSelected:function (index) {
        //如果存在角色，不能选，必须先删除
        if(ag.userInfo._accountData.type!=undefined && ag.userInfo._accountData.sex!=undefined
            && this.getRoleIndex(ag.userInfo._accountData.type,ag.userInfo._accountData.sex)!=index){
            ag.jsUtil.showText(this.node,'已存在角色');
            return;
        }
        this._selectIndex = index;
        for(var i=0;i<6;++i){
            var nodeRole = this._nodeRoleArray[i];
            nodeRole.stopAllActions();
            if(index==i){
                nodeRole.runAction(cc.scaleTo(0.2,1.2));
            }else{
                nodeRole.setScale(1);
            }
        }
    },


    //开始游戏按钮
    buttonDelete: function () {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(ag.userInfo._accountData.type!=undefined && ag.userInfo._accountData.sex!=undefined){
            ag.jsUtil.alertOKCancel(this.node,'确认要删除此角色及其装备？',function(){
                ag.jsUtil.request(this.node,'deleteRole',ag.userInfo._accountData.id,function (data) {
                    ag.userInfo._accountData.type=undefined;
                    ag.userInfo._accountData.sex=undefined;
                    ag.jsUtil.showText(this.node,'删除成功！');
                }.bind(this));
            }.bind(this),function(){

            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,'您还没有角色');
        }
    },

    //开始游戏按钮
    buttonStart: function () {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var prefab = cc.loader.getRes('prefab/nodeRequest',cc.Prefab);
        var node = cc.instantiate(prefab);
        node.parent = this.node;
        node.setLocalZOrder(101);
        node.runAction(cc.sequence(cc.delayTime(5),cc.callFunc(function(){
            node.destroy();
        })));

        var type='m0',sex=ag.gameConst.sexBoy;
        if(this._selectIndex==1){type='m0';sex=ag.gameConst.sexGirl;}
        else if(this._selectIndex==2){type='m1';sex=ag.gameConst.sexBoy;}
        else if(this._selectIndex==3){type='m1';sex=ag.gameConst.sexGirl;}
        else if(this._selectIndex==4){type='m2';sex=ag.gameConst.sexBoy;}
        else if(this._selectIndex==5){type='m2';sex=ag.gameConst.sexGirl;}
        ag.userInfo._startGameTime = new Date().getTime();
        ag.agSocket.send("enter",{type:type,sex:sex});
    },



    getRoleIndex:function(type,sex){
        if(type=='m0' && sex==ag.gameConst.sexBoy)return 0;
        if(type=='m0' && sex==ag.gameConst.sexGirl)return 1;
        if(type=='m1' && sex==ag.gameConst.sexBoy)return 2;
        if(type=='m1' && sex==ag.gameConst.sexGirl)return 3;
        if(type=='m2' && sex==ag.gameConst.sexBoy)return 4;
        if(type=='m2' && sex==ag.gameConst.sexGirl)return 5;
        return 0;
    },

    //更新个人资料数据
    firstUpdateInfo:function(){
        //cc.find('Canvas/spriteHeadInfo/labelId').getComponent(cc.Label).string = 'ID：'+ag.userInfo._accountData.id;
        //cc.find('Canvas/spriteHeadInfo/labelSessions').getComponent(cc.Label).string = '场次：'+ag.userInfo._accountData.sessions;
        this.nextUpdateInfo();
    },
    nextUpdateInfo:function(){
        cc.find('Canvas/spriteHeadInfo/editBoxName').getComponent(cc.EditBox).string = ag.userInfo._accountData.name;
    },

    //回车发送信息
    editBoxConfirm: function (sender) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        if(sender.string.length>=2){
            ag.jsUtil.request(this.node,'changeName',sender.string,function (data) {
                ag.userInfo._accountData.name = sender.string;
                ag.jsUtil.showText(this.node,'名字更新成功');
            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,'名字至少2个字符');
        }
    },

    buttonClose:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find('Canvas/spriteHeadInfo').active = false;
    },

    back:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        ag.userInfo.backGroundPos = cc.find("Canvas/door").getPosition();
        cc.director.loadScene('LoginScene');
    },

    buttonEventLeft:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var pageView = cc.find('Canvas/pageViewRole').getComponent(cc.PageView);
        pageView.scrollToPage(Math.max(0,pageView.getCurrentPageIndex()-1),0.3);
    },

    buttonEventRight:function(){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var pageView = cc.find('Canvas/pageViewRole').getComponent(cc.PageView);
        pageView.scrollToPage(Math.min(2,pageView.getCurrentPageIndex()+1),0.3);
    },
});
