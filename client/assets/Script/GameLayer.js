var UserInfo = require("UserInfo");
var GameConst = require("GameConst");
var Role = require("Role");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.vv._gameLayer = this;
        this._roleMap = {};
        this._player = null;
        this._map = this.node.getChildByName("map1");
        //cc.audioEngine.playMusic(res.background_mp3, true);
        var size = cc.director.getWinSize();



        //创建主角
        var node = new cc.Node();
        this._player = node.addComponent(Role);
        this._player.init(UserInfo._data);
        this._player.setLocation(UserInfo._x,UserInfo._y);
        this.node.addChild(node);
        this._roleMap[this._player._data.id] = this._player;
    },

    // called every frame
    update: function (dt) {
        this.updateMapPos();
    },


    //更新位置
    updateMapPos:function(){
        if(this._player){
            var mapData = GameConst._mapArray[UserInfo._map];
            var x = mapData.mapX/2-this._player._data.x;
            var y = mapData.mapY/2-this._player._data.y;
            this._map.setPosition(x*mapData.tileX,y*mapData.tileY);
        }
    },
});
