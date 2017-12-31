/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */

var UserInfo = require('UserInfo');
cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {
        //var node = cc.find("Canvas/door");
        //node.setPosition(ag.userInfo.backGroundPos);
        //var dis0 = cc.pDistance(cc.p(280,230),cc.p(-100,-330));
        //var dis1 = cc.pDistance(cc.p(280,230),ag.userInfo.backGroundPos);
        //node.runAction(cc.sequence(cc.moveTo(20*dis1/dis0,cc.p(280,230)),cc.callFunc(function(){
        //    node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(20,cc.p(-100,-330)),cc.moveTo(20,cc.p(280,230)))));
        //})));
        var editBoxAccount = cc.find("Canvas/nodeLogin/editBoxAccount").getComponent(cc.EditBox);
        var editBoxPassword = cc.find("Canvas/nodeLogin/editBoxPassword").getComponent(cc.EditBox);
        editBoxAccount.string = cc.sys.localStorage.getItem('account') || '';
        editBoxPassword.string = cc.sys.localStorage.getItem('password') || '';
        cc.audioEngine.stopAll();
        ag.musicManager.playMusic("resources/music/Dragon Rider.mp3");
    },


    theCountryIsAtPeace: function() {
        ag.agSocket.send("theCountryIsAtPeace",'');
    },


    buttonEventAddGold: function() {
        var name = cc.find("Canvas/editBoxGoldName").getComponent(cc.EditBox).string;
        var count = parseInt(cc.find("Canvas/editBoxGoldCount").getComponent(cc.EditBox).string);
        if(typeof count=='number' && count>=0 && count<=1000000){
            //ag.agSocket.send("addGold",{name:name,gold:count});
            ag.jsUtil.request(this.node,'addGold',{name:name,gold:count},function (data) {
                if(data.code==0){
                    ag.jsUtil.showText(this.node,''+count+'元宝增加成功');
                }else{
                    ag.jsUtil.showText(this.node,''+'玩家不存在');
                }
            }.bind((this)));
        }
    },


    onTextChangedForNumber: function(str,editbox, customEventData)
    {
        var result = '';
        for(var i=0;i<str.length;++i){
            var code = str[i].charCodeAt();
            if(code>=48 && code<=57){
                result = result+str[i];
            }
        }
        editbox.string = result;
        cc.log(str,result);
    },



    onTextChangedForCharacterAndNumber: function(str,editbox, customEventData)
    {
        var result = '';
        for(var i=0;i<str.length;++i){
            var code = str[i].charCodeAt();
            if(code>=48 && code<=57)result = result+str[i];
            if(code>=65 && code<=90)result = result+str[i];
            if(code>=97 && code<=122)result = result+str[i];
        }
        editbox.string = result;
        cc.log(str,result);
    },


    //注册
    buttonEventRegister: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find("Canvas/nodeRegister").active = true;
    },

    buttonEventRegisterOK: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var editBoxAccount = cc.find("Canvas/nodeRegister/editBoxAccount").getComponent(cc.EditBox);
        var editBoxPassword = cc.find("Canvas/nodeRegister/editBoxPassword").getComponent(cc.EditBox);
        var editBoxPasswordAgain = cc.find("Canvas/nodeRegister/editBoxPasswordAgain").getComponent(cc.EditBox);
        if(editBoxAccount.string.length<4){
            ag.jsUtil.showText(this.node,'账号长度最少4位');
        }else if(editBoxPassword.string.length<4){
            ag.jsUtil.showText(this.node,'密码长度最少4位');
        }else if(editBoxPasswordAgain.string.length<4){
            ag.jsUtil.showText(this.node,'重复密码长度最少4位');
        }else if(editBoxPassword.string!=editBoxPasswordAgain.string){
            ag.jsUtil.showText(this.node,'密码和重复密码不一致');
        }else{
            ag.jsUtil.request(this.node,'register',{account:editBoxAccount.string,password:editBoxPassword.string},function (data) {
                if(data.code==0){
                    cc.find("Canvas/nodeRegister").active = false;
                    ag.jsUtil.showText(this.node,'注册成功');
                    cc.sys.localStorage.setItem('account',editBoxAccount.string);
                    cc.sys.localStorage.setItem('password',editBoxPassword.string);
                    cc.find("Canvas/nodeLogin/editBoxAccount").getComponent(cc.EditBox).string = cc.sys.localStorage.getItem('account') || '';
                    cc.find("Canvas/nodeLogin/editBoxPassword").getComponent(cc.EditBox).string = cc.sys.localStorage.getItem('password') || '';
                }else{
                    editBoxPassword.string = '';
                    editBoxPasswordAgain.string = '';
                    ag.jsUtil.showText(this.node,'账号已经存在!');
                }
            }.bind(this));
        }
    },

    buttonEventRegisterClose: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find("Canvas/nodeRegister").active = false;
    },


    //登陆
    buttonEventLogin: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find("Canvas/nodeLogin").active = true;
    },

    buttonEventLoginOK: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var editBoxAccount = cc.find("Canvas/nodeLogin/editBoxAccount").getComponent(cc.EditBox);
        var editBoxPassword = cc.find("Canvas/nodeLogin/editBoxPassword").getComponent(cc.EditBox);
        if(editBoxAccount.string.length<4){
            ag.jsUtil.showText(this.node,'账号长度最少4位');
        }else if(editBoxPassword.string.length<4){
            ag.jsUtil.showText(this.node,'密码长度最少4位');
        }else{
            cc.sys.localStorage.setItem('account',editBoxAccount.string);
            cc.sys.localStorage.setItem('password',editBoxPassword.string);
            ag.jsUtil.request(this.node,'login',{account:editBoxAccount.string,password:editBoxPassword.string},function (data) {
                if(data.code==0){
                    ag.userInfo.backGroundPos = cc.find("Canvas/door").getPosition();
                    UserInfo._accountData = data.data;
                    cc.director.loadScene('CreateRoleScene');
                }else{
                    editBoxPassword.string = '';
                    ag.jsUtil.showText(this.node,'账号或者密码错误!');
                }
            }.bind(this));
        }
    },

    buttonEventLoginClose: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find("Canvas/nodeLogin").active = false;
    },
});
