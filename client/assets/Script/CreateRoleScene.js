/**
 * Created by bot.su on 2017/6/21.
 * 选人界面
 */

var AGAniClothes = require("AGAniClothes");
var AGAni = require("AGAni");
cc.Class({
    extends: cc.Component,
    properties: {},

    // use this for initialization
    onLoad: function () {
        this._selectIndex = 0;
        //初始化按钮对象
        this._nodeRoleArray = [];
        var array = AGAniClothes['nudeboy0'+ag.gameConst.stateIdle+4].split(',');
        var nameArray = ['ani/hum4/004','ani/hum5/005','ani/hum6/006','ani/hum7/007','ani/hum8/008','ani/hum9/009'];
        for(var i=0;i<6;++i){
            (function (i) {
                var nodeRole = cc.find('Canvas/layoutRole/nodeRole'+i);
                nodeRole._modelNode = ag.jsUtil.getNode(nodeRole,nameArray[i]+array[0],parseInt(array[1]),0,0.3);
                nodeRole.on('touchend', function () {
                    cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
                    this.setSelected(i);
                }.bind(this));
                this._nodeRoleArray.push(nodeRole);
            }.call(this,i));
        }

        this.setSelected(this.getRoleIndex(ag.userInfo._accountData.type,ag.userInfo._accountData.sex));
        this._buttonDelete = cc.find('Canvas/buttonDelete').getComponent(cc.Button);
        this._buttonStart = cc.find('Canvas/buttonStart').getComponent(cc.Button);
        //this._buttonDelete.enableAutoGrayEffect = true;
        //this._buttonStart.enableAutoGrayEffect = true;
        //this._buttonDelete.interactable = false;
        //this._buttonStart.interactable = true;


        ag.agSocket.onSEnter();
        this.schedule(ag.spriteCache.update001.bind(ag.spriteCache),0.01);
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
            nodeRole._modelNode.stopAllActions();
            if(index==i){
                //nodeRole._modelNode.getComponent(cc.Sprite)._sgNode.setState(0);
                nodeRole._modelNode.getComponent(AGAni).resume();
                nodeRole._modelNode.setScale(2);
                nodeRole._modelNode.runAction(cc.scaleTo(0.2,4));
            }else{
                //nodeRole._modelNode.getComponent(cc.Sprite)._sgNode.setState(1);
                nodeRole._modelNode.getComponent(AGAni).pause();
                nodeRole._modelNode.setScale(2);
            }
        }
    },


    //开始游戏按钮
    buttonDelete: function () {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        if(ag.userInfo._accountData.type!=undefined && ag.userInfo._accountData.sex!=undefined){
            ag.jsUtil.request(this.node,'deleteRole',ag.agSocket._sessionId,function (data) {
                ag.userInfo._accountData.type=undefined;
                ag.userInfo._accountData.sex=undefined;
                ag.jsUtil.showText(this.node,'删除成功！');
            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,'您还没有角色');
        }
    },

    //开始游戏按钮
    buttonStart: function () {
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
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
        cc.audioEngine.play(cc.url.raw("resources/voice/button.mp3"),false,1);
        cc.director.loadScene('HallScene');
    },
});
