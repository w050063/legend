/**
 * Created by bot.su on 2017/6/21.
 * 常用工具
 */


var pomelo = require('pomelo');
module.exports = {
    dataChannel:"dataChannel",


    sendByUids : function(route,msg,uids){
        //发送信息
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(this.dataChannel, true);
        var infoArray = [];
        for(var i=0;i<uids.length;++i){
            var uid = uids[i];
            var userObj = channel.getMember(uid);
            if(userObj)infoArray.push({uid: uid,sid: userObj['sid']});
        }
        var param = {msg: msg,from: "",target: ""};
        channelService.pushMessageByUids(route,param,infoArray);
    },



    send : function(route,msg,uids){
        //发送信息
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(this.dataChannel, true);
        var infoArray = [];
        for(var i=0;i<uids.length;++i){
            var uid = ag.userManager.getUidByAccount(uids[i]);
            var userObj = channel.getMember(uid);
            if(userObj)infoArray.push({uid: uid,sid: userObj['sid']});
        }
        var param = {msg: msg,from: "",target: ""};
        channelService.pushMessageByUids(route,param,infoArray);
    },



    //发送给所有人
    sendAll : function(route,msg){
        //发送信息
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(this.dataChannel, true);
        var param = {msg: msg,from: "",target: ""};
        channel.pushMessage(route,param);
    },



    init:function(){
        this._sendObj = {};
        setInterval(function () {
            var channelService = pomelo.app.get('channelService');
            var channel = channelService.getChannel(this.dataChannel, true);
            for(var id in this._sendObj){
                var uid = ag.userManager.getUidByAccount(id);
                var userObj = channel.getMember(uid);
                if(userObj)channelService.pushMessageByUids('onData',this._sendObj[id],[{uid: uid,sid: userObj['sid']}]);
            }
            this._sendObj = {};
        }.bind(this),50);
    },


    getClientCount:function(){
        var sum = 0;
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(this.dataChannel, true);
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role.getIsPlayer()){
                var uid = ag.userManager.getUidByAccount(role._data.id);
                if(channel.getMember(uid)){
                    ++sum;
                }
            }
        }
        return sum;
    },



    //获取一个id是否在线
    getIsOnline:function(id){
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(this.dataChannel, true);
        var uid = ag.userManager.getUidByAccount(id);
        if(channel.getMember(uid)){
            return true;
        }
        return false;
    },


    //发送要合并的数据
    sendData : function(route,msg,id){
        if(!this._sendObj[id])this._sendObj[id] = {};
        var idObj = this._sendObj[id];
        var key = route+'Array';
        if(!idObj[key])idObj[key] = [];
        idObj[key].push(msg);
    },


    //发送要合并的数据
    sendDataExcept : function(route,msg,id){
        var role = ag.gameLayer._roleMap[id];
        var mapId = role?role._data.mapId:'t0';
        for(var key in ag.gameLayer._roleMap){
            var role = ag.gameLayer._roleMap[key];
            if(role.getIsPlayer() && role._data.mapId==mapId && role._data.id!==id){
                this.sendData(route,msg,role._data.id);
            }
        }
    },


    //发送要合并的数据
    sendDataAll : function(route,msg,mapId){
        if(mapId){
            for(var key in ag.gameLayer._roleMap){
                var role = ag.gameLayer._roleMap[key];
                if(role.getIsPlayer() && role._data.mapId==mapId){
                    this.sendData(route,msg,role._data.id);
                }
            }
        }else{
            for(var key in ag.gameLayer._roleMap){
                var role = ag.gameLayer._roleMap[key];
                if(role.getIsPlayer()){
                    this.sendData(route,msg,role._data.id);
                }
            }
        }
    },


    p:function(x,y){
        return {x:x,y:y};
    },

    pDistance: function(v1,v2){
        var vx = v1.x - v2.x,vy = v1.y - v2.y;
        return Math.sqrt(vx*vx+vy*vy);
    },


    pAdd : function (v1, v2) {
        return {x:v1.x + v2.x, y:v1.y + v2.y};
    },
};
