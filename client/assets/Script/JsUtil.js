/**
 * Created by bot.su on 2017/6/21.
 * 常用工具
 */

var AGAni = require("AGAni");
module.exports={

    //获得时间戳
    getTimestamp:function(time){
        var result;
        var minute = 1000 * 60;
        var hour = minute * 60;
        var day = hour * 24;
        var month = day * 30;
        var diffValue = new Date().getTime() - time;
        var monthC =diffValue/month;
        var weekC =diffValue/(7*day);
        var dayC =diffValue/day;
        var hourC =diffValue/hour;
        var minC =diffValue/minute;
        if(monthC>=1){
            result="" + parseInt(monthC) + "月前";
        }
        else if(weekC>=1){
            result="" + parseInt(weekC) + "周前";
        }
        else if(dayC>=1){
            result=""+ parseInt(dayC) +"天前";
        }
        else if(hourC>=1){
            result=""+ parseInt(hourC) +"小时前";
        }
        else if(minC>=1){
            result=""+ parseInt(minC) +"分钟前";
        }else{
            result="刚刚";
        }
        return result;
    },




    //获取当前时间,begin
    _timeCounter: 0,
    _addTimeMap : {},
    startTime: function () {
        this._timeCounter = new Date().getTime();
    },
    printTime: function (tag) {
        cc.log(tag + " time:" + (new Date().getTime() - this._timeCounter));
    },

    addTime:function(tag){
        //if(!this._addTimeMap[tag])this._addTimeMap[tag] = 0;
        //this._addTimeMap[tag] += (new Date().getTime() - this._timeCounter);
    },


    //向前补0函数
    pad0For3:function(num){
        num = ''+num;
        while(num.length < 3) {
            num = "0" + num;
        }
        return num;
    },
    pad0For6:function(num){
        num = ''+num;
        while(num.length < 6) {
            num = "0" + num;
        }
        return num;
    },


    //名字缓存
    _heroNameMap : {},
    getLabelFromName:function(name){
        var array = this._heroNameMap[name];
        if(array){
            var ret = array[array.length-1];
            array.splice(array.length-1,1);
            return ret;
        }
        var node = cc.instantiate(ag.gameLayer._nodeRoleName);
        var label = node.getComponent(cc.Label);
        label.string = name;
        return label;
    },

    putLabelFromName:function(name,label){
        label.node.removeFromParent();
        var array = this._heroNameMap[name];
        if(!array)array = [];
        array.push(label);
    },


    secondInterfaceAnimation:function(node){
        node.stopAllActions();
        node.scaleY = 0;
        node.runAction(cc.sequence(cc.scaleTo(0.1,1,1.1),cc.scaleTo(0.02,1,1)));
    },


    alert:function (father,content,callback) {
        //加载
        cc.loader.loadRes('prefab/nodeAlert',cc.Prefab,function(err, prefab){
            var node = cc.instantiate(prefab);
            node.parent = father;
            node.setLocalZOrder(101);
            var label = node.getChildByName("labelContent").getComponent(cc.Label);
            label.string = content;
            node._callback = callback;
        });
    },


    alertOKCancel:function (father,content,callback,callbackCancel) {
        //加载
        cc.loader.loadRes('prefab/nodeAlertOKOrCancel',cc.Prefab,function(err, prefab){
            var node = cc.instantiate(prefab);
            node.parent = father;
            node.setLocalZOrder(101);
            var label = node.getChildByName("labelContent").getComponent(cc.Label);
            label.string = content;
            node._callback = callback;
            node._callbackCancel = callbackCancel;
        });
    },


    request:function (father,key,obj,callback,bShowLoading) {
        if(bShowLoading==undefined)bShowLoading = true;
        //加载
        var node = null;
        if(bShowLoading){
            var prefab = cc.loader.getRes('prefab/nodeRequest',cc.Prefab);
            node = cc.instantiate(prefab);
            node.parent = father;
            node.setLocalZOrder(101);
        }
        pomelo.request("work.WorkHandler."+key, obj, function(data) {
            if(node)node.destroy();
            //ag.jsUtil.showText(father,'错误码:'+data.code);
            if(callback)callback(data);
            //if(data.code==0){
            //}else{
            //    ag.jsUtil.showText(father,'错误码:'+data.code);
            //}
        });
    },


    showText:function (father,str) {
        //文字提示
        var node = new cc.Node();
        var tips = node.addComponent(cc.Label);
        tips.fontSize = 40;
        node.color = cc.color(255,0,0,255);
        tips.string = str;
        father.addChild(node);
        node.setLocalZOrder(109);
        var outline = node.addComponent(cc.LabelOutline);
        outline.color = cc.color(255, 255, 255);
        outline.width = 1;
        node.runAction(cc.sequence(cc.moveBy(0.3, cc.p(0, 160)), cc.delayTime(0.5),
            cc.spawn(cc.moveBy(0.4, cc.p(0, 100)), cc.fadeOut(0.4)),
            cc.callFunc(function () {
                node.destroy();
            })));
    },


    getCacheNode:function(str,father){
        var node = cc.instantiate(ag.gameLayer._nodeRolePropClone);
        node.setLocalZOrder(ag.gameConst.roleNameZorder);
        node._progressBarHP = node.getChildByName("progressBarHP").getComponent(cc.ProgressBar);
        node._labelHP = node.getChildByName("labelHP").getComponent(cc.Label);
        node._labelName = node.getChildByName("labelName").getComponent(cc.Label);
        node.parent = father;
        return node;
    },


    getEffect:function(father,name,count,zorder,interval){
        return this.getNode(father,name,count,zorder,interval,function(sender){sender.putCache();}.bind(this));
    },


    getNode:function(father,name,count,zorder,interval,callback){
        var node = new cc.Node();
        var ani = node.addComponent(AGAni);
        ani.init(name,count);
        father.addChild(node,zorder);
        ani.setInterval(interval);
        ani.setFinishedCallback(callback);
        return node;
    },


    //获取图片的rgba数据，以左下角为起点
    loadImageData:function(name,callback,aaa){
        var myImage = new Image();
        myImage.src = "/res/raw-assets/resources/"+name;
        myImage.onload = function(){
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var w = myImage.width,h = myImage.height;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(myImage,0,0,w,h);
            var imageData = ctx.getImageData(0,0,w,h);
            var data = imageData.data;
            for(var i=0;i<h;++i){
                var index = i*w*4;
                for(var j = 0;j<w;++j){
                    var t = index+4*j;
                    var average=(data[t],data[t+1],data[t+2])/3;
                    imageData.data[t]=average;
                    imageData.data[t+1]=average;
                    imageData.data[t+2]=average;
                    imageData.data[t+3]=data[t+3];
                }
            }
            ctx.putImageData(imageData,0,0);
            var urlData = canvas.toDataURL('image/png');

            var img = new Image();
            img.src = urlData;
            img.onload = function(){
                var texture = new cc.Texture2D();
                texture.generateMipmaps = false;
                texture.initWithElement(img);
                texture.handleLoadedTexture();
                var newframe = new cc.SpriteFrame(texture);
                var node = new cc.Node("New Sprite");
                var sprite = node.addComponent(cc.Sprite);
                node.parent = aaa.node;
                sprite.spriteFrame = newframe;
            };

            //callback(data,w,h);
        }
    },


    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },




    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = this._utf8_decode(output);
        return output;
    },

// private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    },

// private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    },
};
