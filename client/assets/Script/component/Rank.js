/**
 * Created by bot.su on 2017/6/21.
 * 商店详细信息
 */


cc.Class({
    extends: cc.Component,
    properties: {},


    onLoad: function () {
        this._dataMap = null;
    },


    //商城关闭事件
    show:function(){
        this.node.active = true;
        ag.agSocket.send("requestRank",{});
    },

    //设置数据
    setData:function(data){
        if(data){
            this._dataMap = JSON.parse(data);
            this.buttonEvenLevel();
        }
    },

    refresh:function(index){
        cc.find('Canvas/nodeRank/spriteBack/buttonLevel/Label').color = index==0?cc.color(255,0,0):cc.color(255,255,255);
        cc.find('Canvas/nodeRank/spriteBack/buttonHurt/Label').color = index==1?cc.color(255,0,0):cc.color(255,255,255);
        cc.find('Canvas/nodeRank/spriteBack/buttonOffice/Label').color = index==2?cc.color(255,0,0):cc.color(255,255,255);
        var nameLabel = cc.find('Canvas/nodeRank/spriteBack/name').getComponent(cc.Label);
        var otherLabel = cc.find('Canvas/nodeRank/spriteBack/other').getComponent(cc.Label);

        var str = '',str2 = '';
        var array = this._dataMap[['levels','hurts','offices'][index]];
        for(var i=0;i<array.length;++i){
            str = str+this._dataMap['data'][array[i]].name+'\n';
            str2 = str2+this._dataMap['data'][array[i]].sexType
                +'             '+this._dataMap['data'][array[i]].level
                +'           '+this._dataMap['data'][array[i]].hurt
                +'             '+ag.gameConst.officeName[ag.gameLayer._player.getOfficeIndex(this._dataMap['data'][array[i]].office)]+'\n';
        }
        nameLabel.string = str;
        otherLabel.string = str2;
    },

    //等级
    buttonEvenLevel:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.refresh(0);
    },

    //攻击
    buttonEvenHurt:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.refresh(1);
    },

    //称号
    buttonEvenOffice:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.refresh(2);
    },

    //商城关闭事件
    buttonEventClose:function(event){
        ag.musicManager.playEffect("resources/voice/button.mp3");
        this.node.active = false;
    },
});
