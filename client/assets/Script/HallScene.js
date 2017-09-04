/**
 * Created by bot.su on 2017/6/21.
 * 大厅场景
 */

var AGListView = require("AgListView");
var UserInfo = require("UserInfo");
var existThis = false;
cc.Class({
    extends: cc.Component,
    properties: {},

    onLoad: function () {
        existThis = true;
        this._scrollViewList = cc.find("Canvas/scrollViewList").getComponent(AGListView);
        this._scrollViewList.setSpace(2);
        this.update5();
        this.schedule(this.update5.bind(this),5);

        cc.find('Canvas/spriteIconButton').on('touchend', function () {
            cc.find('Canvas/spriteHeadInfo').active = true;
            this.nextUpdateInfo();
        }, this);


        //是否第一次改名字
        if(!cc.sys.localStorage.getItem('firstChangeName')){
            cc.sys.localStorage.setItem('firstChangeName','1');
        }else{
            cc.find('Canvas/spriteHeadInfo').active = false;
        }
        this.firstUpdateInfo();
    },



    update5:function(){
        var self = this;
        ag.jsUtil.request(this.node,'getGameList',ag.agSocket._sessionId,function (data) {
            if(existThis){
                var array = data.data;
                self._scrollViewList.setCount(array.length);
                self._scrollViewList.setCallback(function(item,index){
                    item.getChildByName('labelName').getComponent(cc.Label).string = array[index].name;
                    item.getChildByName('labelCount').getComponent(cc.Label).string = ''+array[index].count+'/'+array[index].maxCount;
                    item.getChildByName('labelTime').getComponent(cc.Label).string = ''+Math.floor(array[index].time/60)+'分钟'+(array[index].time%60)+'秒';
                    item.off('touchend');
                    item.on('touchend', function () {
                        cc.log("Item " + index + ' clicked');
                        existThis = false;
                        cc.director.loadScene('CreateRoleScene');
                    });
                });
                self._scrollViewList.reload();
            }
        },false);
    },


    //更新个人资料数据
    firstUpdateInfo:function(){
        cc.find('Canvas/spriteHeadInfo/labelId').getComponent(cc.Label).string = 'ID：'+UserInfo._accountData.id;
        cc.find('Canvas/spriteHeadInfo/labelSessions').getComponent(cc.Label).string = '场次：'+UserInfo._accountData.sessions;
        this.nextUpdateInfo();
    },
    nextUpdateInfo:function(){
        cc.find('Canvas/spriteHeadInfo/editBoxName').getComponent(cc.EditBox).string = UserInfo._accountData.name;
    },


    //回车发送信息
    editBoxConfirm: function (sender) {
        if(sender.string.length>=2){
            ag.jsUtil.request(this.node,'changeName',sender.string,function (data) {
                UserInfo._accountData.name = sender.string;
                ag.jsUtil.showText(this.node,'名字更新成功');
            }.bind(this));
        }else{
            ag.jsUtil.showText(this.node,'名字至少2个字符');
        }
    },

    buttonClose:function(){
        cc.find('Canvas/spriteHeadInfo').active = false;
    },

    back:function(){
        existThis = false;
        cc.director.loadScene('LoginScene');
    },
});
