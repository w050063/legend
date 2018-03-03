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
        cc.find("Canvas/labelVersion").getComponent(cc.Label).string = ag.userInfo._version;
        this.setLabelStateClose();
        if(ag.userInfo._otherLogin){
            ag.jsUtil.alert(cc.director.getScene().getChildByName('Canvas'),ag.userInfo._otherLogin,function () {});
            ag.userInfo._otherLogin = "";
        }

        ag.userInfo._legendID = "";
        ag.userInfo._serverIP = "";
        ag.userInfo._serverPort = "";
        this._dataArray = [];
        this.refresh();//刷新界面
    },


    onTextChangedForNumber111: function(str,editbox, customEventData)
    {
        var result = '';
        for(var i=0;i<str.length;++i){
            var code = str[i].charCodeAt();
            if(code>=48 && code<=57){
                result = result+str[i];
            }else{
                ag.jsUtil.showText(this.node,'账号仅限数字，推荐QQ，方便找回！');
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
        if(ag.userInfo._legendID){
            cc.find("Canvas/nodeRegister").active = true;
        }else{
            ag.jsUtil.showText(this.node,"请先选择区！");
        }
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
            ag.jsUtil.request(this.node,'register',{account:ag.userInfo._legendID+'_'+editBoxAccount.string,password:editBoxPassword.string},function (data) {
                if(data.code==0){
                    cc.find("Canvas/nodeRegister").active = false;
                    ag.jsUtil.showText(this.node,'注册成功');
                    cc.sys.localStorage.setItem('firstChangeName','');
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
        if(ag.userInfo._legendID){
            cc.find("Canvas/nodeLogin").active = true;
        }else{
            ag.jsUtil.showText(this.node,"请先选择区！");
        }
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
            ag.jsUtil.request(this.node,'login',{account:ag.userInfo._legendID+'_'+editBoxAccount.string,password:editBoxPassword.string},function (data) {
                if(data.code==0){
                    ag.userInfo.backGroundPos = cc.find("Canvas/door").getPosition();
                    UserInfo._accountData = data.data;
                    cc.director.loadScene('CreateRoleScene');
                }else if(data.code==1){
                    editBoxPassword.string = '';
                    ag.jsUtil.showText(this.node,'账号或者密码错误!');
                }else{
                    ag.jsUtil.showText(this.node,'未知错误!');
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
        if(ag.userInfo._legendID){
            cc.find("Canvas/nodeAlterPassWord").active = true;
        }else{
            ag.jsUtil.showText(this.node,"请先选择区！");
        }
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
            ag.jsUtil.request(this.node,'alterPassWord',{account:ag.userInfo._legendID+'_'+editBoxAccount.string,password:editBoxPassword.string,passwordNew:editBoxPasswordNew.string},function (data) {
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


    refresh: function() {
        if(this._dataArray.length==0){
            this.node.runAction(cc.sequence(cc.delayTime(5),cc.callFunc(function(){
                this.refresh();
            }.bind(this))));


            var self = this;
            pomelo.init({host: '123.56.218.100',port: 4070,log: true}, function() {
                pomelo.request('gate.GateHandler.serverlist', {}, function(data) {
                    pomelo.disconnect(function () {});
                    if(data.code==0){
                        self._dataArray = JSON.parse(data.data);
                        self.refresh2();
                    }
                });
            });
        }
    },


    refresh2: function() {
        cc.find('Canvas/labelTip').active = false;
        for(var i=0;i<3;++i){
            var button = cc.find('Canvas/button'+i);
            if(i<this._dataArray.length){
                cc.find('Canvas/button'+i+'/Label').getComponent(cc.Label).string = this._dataArray[i].name;
                button.active = true;
            }else {
                button.active = false;
            }
        }


        this.node.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(function(){
            var temp = cc.sys.localStorage.getItem('area') || '0';
            temp = parseInt(temp);
            this.buttonEventArea(temp);
        }.bind(this))));
    },


    buttonEventArea: function(event) {
        ag.musicManager.playEffect("resources/voice/button.mp3");
        var index = 0;
        if(typeof event=='number')index = event;
        else if(event)index = parseInt(event.target.name.substr(6));
        if(index>=3)index = 0;
        cc.sys.localStorage.setItem('area',''+index);

        for(var i=0;i<3;++i){
            cc.find('Canvas/button'+i+'/Label').color = i==index?cc.color(0,255,0):cc.color(255,255,255);
        }


        var obj = this._dataArray[index];
        if(obj.open){
            ag.userInfo._legendID = obj.id;
            ag.userInfo._serverIP = obj.ip;
            ag.userInfo._serverPort = obj.port;
            var label = cc.find("Canvas/labelState").getComponent(cc.Label);
            label.string = "网络连接中...";
            label.node.color = cc.color(0,0,255);
            ag.agSocket.init(function(){
                label.string = "网络连接良好...";
                label.node.color = cc.color(0,255,0);
            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,obj.descript);
        }
    },


    setLabelStateClose:function(){
        var label = cc.find("Canvas/labelState").getComponent(cc.Label);
        label.string = "网络关闭...";
        label.node.color = cc.color(255,0,0);
    },
});
