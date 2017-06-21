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
        var param = {msg: msg,from: "",target: ""};
        var infoArray = [];
        for(var i=0;i<uids.length;++i){
            var uid = uids[i];
            var userObj = channel.getMember(uid);
            if(userObj)infoArray.push({uid: uid,sid: userObj['sid']});
        }
        channelService.pushMessageByUids(route,param,infoArray);
    },
};
