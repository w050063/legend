/**
 * Created by bot.su on 2017/6/21.
 * 选人界面
 */

var AGAniClothes = require("AGAniClothes");
var AGAni = require("AGAni");
var UserInfo = require("UserInfo");
cc.Class({
    extends: cc.Component,
    properties: {},

    // use this for initialization
    onLoad: function () {
        this._selectIndex = 0;
        //初始化按钮对象
        this._nodeRoleArray = [];
        var showClothes = ['fighteroneboy004','fighteronegirl004','magicianoneboy004','magicianonegirl004','taoistoneboy004','taoistonegirl004'];
        for(var i=0;i<6;++i){
            (function (i) {
                var nodeRole = cc.find('Canvas/layoutRole/nodeRole'+i);
                var array = AGAniClothes[showClothes[i]].split(',');
                nodeRole._modelNode = ag.agAniCache.getNode(nodeRole,array[0],parseInt(array[1]),0,0.3);
                nodeRole.on('touchend', function () {
                    this.setSelected(i);
                }.bind(this));
                this._nodeRoleArray.push(nodeRole);
            }.call(this,i));
        }

        this.setSelected(this.getRoleIndex(UserInfo._accountData.type,UserInfo._accountData.sex));
        this._buttonDelete = cc.find('Canvas/buttonDelete').getComponent(cc.Button);
        this._buttonStart = cc.find('Canvas/buttonStart').getComponent(cc.Button);
        //this._buttonDelete.enableAutoGrayEffect = true;
        //this._buttonStart.enableAutoGrayEffect = true;
        //this._buttonDelete.interactable = false;
        //this._buttonStart.interactable = true;
        this.schedule(ag.altasTask.update001.bind(ag.altasTask),0.01);

        ag.agSocket.onSEnter();
    },


    //选中哪一个
    setSelected:function (index) {
        //如果存在角色，不能选，必须先删除
        if(UserInfo._accountData.type!=undefined && UserInfo._accountData.sex!=undefined
            && this.getRoleIndex(UserInfo._accountData.type,UserInfo._accountData.sex)!=index){
            ag.jsUtil.showText(this.node,'已存在角色');
            return;
        }
        this._selectIndex = index;
        for(var i=0;i<6;++i){
            var nodeRole = this._nodeRoleArray[i];
            nodeRole._modelNode.stopAllActions();
            if(index==i){
                nodeRole._modelNode.getComponent(cc.Sprite)._sgNode.setState(0);
                nodeRole._modelNode.getComponent(AGAni).resume();
                nodeRole._modelNode.setScale(2);
                nodeRole._modelNode.runAction(cc.scaleTo(0.2,4));
            }else{
                nodeRole._modelNode.getComponent(cc.Sprite)._sgNode.setState(1);
                nodeRole._modelNode.getComponent(AGAni).pause();
                nodeRole._modelNode.setScale(2);
            }
        }
    },


    //开始游戏按钮
    buttonDelete: function () {
        cc.log('buttonDelete');
        if(UserInfo._accountData.type!=undefined && UserInfo._accountData.sex!=undefined){
            ag.jsUtil.request(this.node,'deleteRole',ag.agSocket._sessionId,function (data) {
                UserInfo._accountData.type=undefined;
                UserInfo._accountData.sex=undefined;
                ag.jsUtil.showText(this.node,'删除成功！');
            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,'您还没有角色');
        }
    },

    //开始游戏按钮
    buttonStart: function () {
        cc.log('buttonStart');
        var type,sex;
        if(this._selectIndex==0){type='m0';sex=ag.gameConst.sexBoy}
        else if(this._selectIndex==1){type='m0';sex=ag.gameConst.sexGirl}
        else if(this._selectIndex==2){type='m1';sex=ag.gameConst.sexBoy}
        else if(this._selectIndex==3){type='m1';sex=ag.gameConst.sexGirl}
        else if(this._selectIndex==4){type='m2';sex=ag.gameConst.sexBoy}
        else if(this._selectIndex==5){type='m2';sex=ag.gameConst.sexGirl}
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



    back:function(){
        cc.director.loadScene('HallScene');
    },
});
