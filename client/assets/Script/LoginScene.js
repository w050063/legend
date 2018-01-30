/**
 * Created by bot.su on 2017/6/21.
 * 网络链接场景
 */

var UserInfo = require('UserInfo');
cc.Class({
    extends: cc.Component,
    properties: {},
    onLoad: function () {
        var editBoxAccount = cc.find("Canvas/nodeLogin/editBoxAccount").getComponent(cc.EditBox);
        var editBoxPassword = cc.find("Canvas/nodeLogin/editBoxPassword").getComponent(cc.EditBox);
        editBoxAccount.string = cc.sys.localStorage.getItem('account') || '';
        editBoxPassword.string = cc.sys.localStorage.getItem('password') || '';
        cc.audioEngine.stopAll();
        ag.musicManager.playMusic("resources/music/Dragon Rider.mp3");
        cc.find("Canvas/labelVersion").getComponent(cc.Label).string = ag.userInfo._version;

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


    //修改密码
    buttonEventAlterPassword: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find("Canvas/nodeAlterPassWord").active = true;
    },

    buttonEventAlterPasswordClose: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        cc.find("Canvas/nodeAlterPassWord").active = false;
    },


    buttonEventAlterPasswordOK: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var editBoxAccount = cc.find("Canvas/nodeAlterPassWord/editBoxAccount").getComponent(cc.EditBox);
        var editBoxPassword = cc.find("Canvas/nodeAlterPassWord/editBoxPassword").getComponent(cc.EditBox);
        var editBoxPasswordNew = cc.find("Canvas/nodeAlterPassWord/editBoxPasswordNew").getComponent(cc.EditBox);
        var editBoxPasswordAgain = cc.find("Canvas/nodeAlterPassWord/editBoxPasswordAgain").getComponent(cc.EditBox);
        if(editBoxAccount.string.length<4){
            ag.jsUtil.showText(this.node,'账号长度最少4位');
        }else if(editBoxPassword.string.length<4){
            ag.jsUtil.showText(this.node,'原密码长度最少4位');
        }else if(editBoxPasswordNew.string.length<4){
            ag.jsUtil.showText(this.node,'新密码长度最少4位');
        }else if(editBoxPasswordAgain.string.length<4){
            ag.jsUtil.showText(this.node,'重复密码长度最少4位');
        }else if(editBoxPasswordNew.string!=editBoxPasswordAgain.string){
            ag.jsUtil.showText(this.node,'新密码和重复密码不一致');
        }else{
            ag.jsUtil.request(this.node,'alterPassWord',{account:editBoxAccount.string,password:editBoxPassword.string,passwordNew:editBoxPasswordNew.string},function (data) {
                if(data.code==0){
                    cc.find("Canvas/nodeAlterPassWord").active = false;
                    ag.jsUtil.showText(this.node,'修改成功');
                    cc.sys.localStorage.setItem('account',editBoxAccount.string);
                    cc.sys.localStorage.setItem('password',editBoxPasswordNew.string);
                    cc.find("Canvas/nodeLogin/editBoxAccount").getComponent(cc.EditBox).string = cc.sys.localStorage.getItem('account') || '';
                    cc.find("Canvas/nodeLogin/editBoxPassword").getComponent(cc.EditBox).string = cc.sys.localStorage.getItem('password') || '';
                }else{
                    editBoxPassword.string = '';
                    editBoxPassword.string = '';
                    editBoxPasswordNew.string = '';
                    ag.jsUtil.showText(this.node,'账号或者密码错误!');
                }
            }.bind(this));
        }
    },


    buttonEventHomePage: function() {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        ag.jsUtil.showText(this.node,'官网正在维护中...');
    },
});
