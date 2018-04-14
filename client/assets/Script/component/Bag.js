/**
 * Created by bot.su on 2017/6/21.
 * 道具详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
    },

    init:function(){
        this._tabArray = [];
        this._panelArray = [];
        for(var i =0;i<4;++i){
            this._tabArray.push(cc.find('Canvas/nodeBag/nodePanel/buttonTab'+i));
            this._panelArray.push(cc.find('Canvas/nodeBag/nodePanel/equip'+i));
        }
        this._selectIndex = 0;
    },


    //tab按钮
    buttonTab:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var name = event.target.name;
        var index = parseInt(name.substr(9));
        this.showPanel(index);
    },

    showPanel:function(index){
        this._selectIndex = index;
        var node = this._panelArray[index];
        var role = ag.gameLayer._player;

        for(var i=0;i<4;++i){
            this._tabArray[i].color = i==index?cc.color(255,255,255):cc.color(120,120,120);
            this._panelArray[i].active = i==index;
        }

        node.getChildByName('labelTitle').getComponent(cc.Label).string = role._data.name;
        if(index==0){
            node.getChildByName('labelGuild').getComponent(cc.Label).string = role.getGuildShow();
            node.getChildByName('labelProp').getComponent(cc.Label).string = '攻击:'+role.getHurt()+' 防御:'+role.getDefense();
        }else if(index==1){
            node.getChildByName('labelLevel').getComponent(cc.Label).string = '等级：'+role._data.level;
            node.getChildByName('labelExp').getComponent(cc.Label).string = '当前经验：'+role._data.exp;
            node.getChildByName('labelTotalExp').getComponent(cc.Label).string = '总经验：'+role._totalExp;
            node.getChildByName('labelHurt').getComponent(cc.Label).string = '攻击：'+role.getHurt();
            node.getChildByName('labelDefense').getComponent(cc.Label).string = '防御：'+role.getDefense();
        }else if(index==2){
            node.getChildByName('labelCome').getComponent(cc.Label).string = '转生：'+role._data.come;
            node.getChildByName('labelPractice').getComponent(cc.Label).string = '修为：'+role._data.practice+'/'+ag.gameConst.comeArray[role._data.come];
            node.getChildByName('labelHurt').getComponent(cc.Label).string = '攻击：'+ag.gameConst.comeHurt[role._data.come];
            node.getChildByName('labelDefense').getComponent(cc.Label).string = '防御：'+ag.gameConst.comeDefense[role._data.come];
            if(role._data.type=='m0'){
                node.getChildByName('labelHP').getComponent(cc.Label).string = '生命：'+ag.gameConst.comeHPWarrior[role._data.come];
            }else if(role._data.type=='m1'){
                node.getChildByName('labelHP').getComponent(cc.Label).string = '生命：'+ag.gameConst.comeHPWizard[role._data.come];
            }else if(role._data.type=='m2'){
                node.getChildByName('labelHP').getComponent(cc.Label).string = '生命：'+ag.gameConst.comeHPTaoist[role._data.come];
            }
        }else if(index==3){
            var wing = role.getWingIndex();
            node.getChildByName('labelLevel').getComponent(cc.Label).string = '神羽：' + wing + '阶';
            node.getChildByName('labelHurt').getComponent(cc.Label).string = '攻击：'+ag.gameConst.wingHurt[wing];
            node.getChildByName('labelDefense').getComponent(cc.Label).string = '防御：'+ag.gameConst.wingDefense[wing];
            var all = 0;
            if(wing+1<ag.gameConst.wingProgress.length)all = ag.gameConst.wingProgress[wing+1];
            node.getChildByName('labelExp').getComponent(cc.Label).string = '当前进度：'+role._data.wing+'/'+all;
        }
    },
});
