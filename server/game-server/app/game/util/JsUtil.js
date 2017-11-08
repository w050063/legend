/**
 * Created by bot.su on 2017/6/21.
 * 常用工具
 */


var pomelo = require('pomelo');
module.exports = {
    dataChannel:"dataChannel",


    send : function(route,msg,uids){
        //发送信息
        //var channelService = pomelo.app.get('channelService');
        //var channel = channelService.getChannel(JsUtil.dataChannel, true);
        //var param = {msg: "cvb",from: "",target: ""};
        //
        //
        //channel.pushMessage('onChat', param);
        //
        //var sendArray = [];
        //for(var key in this._roleMap){
        //    var array = this._roleMap[key];
        //    for(var i=0;i<array.length;++i){
        //        var uid = array[i]._data.uid;
        //        var userObj = channel.getMember(uid);
        //        if(userObj)sendArray.push({uid: uid,sid: userObj['sid']});
        //    }
        //}
        //channelService.pushMessageByUids('onChat', param, sendArray);


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
                var userObj = channel.getMember(id);
                if(userObj)channelService.pushMessageByUids('onData',this._sendObj[id],[{uid: id,sid: userObj['sid']}]);
            }
            this._sendObj = {};
        }.bind(this),50);
    },


    getClientCount:function(){
        var sum = 0;
        var channelService = pomelo.app.get('channelService');
        var channel = channelService.getChannel(this.dataChannel, true);
        for(var key in ag.gameLayer._roleMap){
            var data = ag.gameLayer._roleMap[key]._data;
            if(data.camp!=ag.gameConst.campMonster){
                if(channel.getMember(data.id)){
                    ++sum;
                }
            }
        }
        return sum;
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
            var data = ag.gameLayer._roleMap[key]._data;
            if(data.camp!=ag.gameConst.campMonster && data.id!==id && data.mapId==mapId){
                this.sendData(route,msg,data.id);
            }
        }
    },



    //发送要合并的数据
    sendDataAll : function(route,msg,mapId){
        if(mapId){
            for(var key in ag.gameLayer._roleMap){
                var data = ag.gameLayer._roleMap[key]._data;
                if(data.camp!=ag.gameConst.campMonster && data.mapId==mapId){
                    this.sendData(route,msg,data.id);
                }
            }
        }else{
            for(var key in ag.gameLayer._roleMap){
                var data = ag.gameLayer._roleMap[key]._data;
                if(data.camp!=ag.gameConst.campMonster){
                    this.sendData(route,msg,data.id);
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
