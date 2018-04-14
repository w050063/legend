/**
 * Created by bot.su on 2017/6/21.
 * 游戏角色状态管理类
 */



module.exports = ag.class.extend({
    ctor:function () {
        this._dataMap = {};
        this._baseId = 0;
    },


    getDeal:function(rid){
        for(var key in this._dataMap){
            var obj = this._dataMap[key];
            if(rid==obj.rid1 || rid==obj.rid2)return key;
        }
        return null;
    },


    //邀请
    askDeal:function(rid1,rid2){
        if(rid1==rid2){
            ag.jsUtil.sendData("sSystemNotify","4",rid2);
        }else if(this.getDeal(rid1)){
            ag.jsUtil.sendData("sSystemNotify","5",rid1);
        }else if(this.getDeal(rid2)){
            ag.jsUtil.sendData("sSystemNotify","6",rid1);
        }else{
            ag.jsUtil.sendData("sSystemNotify","7",rid1);
            var role = ag.gameLayer.getRole(rid1);
            ag.jsUtil.sendData("sAskDeal",{id:rid1,name:role._data.name},rid2);
        }
    },


    //增加
    addDeal:function(rid1,rid2){
        if(rid1==rid2){
            ag.jsUtil.sendData("sSystemNotify","4",rid2);
        }else if(this.getDeal(rid1)){
            ag.jsUtil.sendData("sSystemNotify","5",rid1);
        }else if(this.getDeal(rid2)){
            ag.jsUtil.sendData("sSystemNotify","6",rid1);
        }else{
            var role1 = ag.gameLayer.getRole(rid1);
            var role2 = ag.gameLayer.getRole(rid2);
            var id = 'deal'+(++this._baseId);
            this._dataMap[id] = {rid1:rid1,rid2:rid2,itemArray1:[],itemArray2:[],gold1:0,gold2:0};
            ag.jsUtil.sendData("sAddDeal",role2._data.name,rid1);
            ag.jsUtil.sendData("sAddDeal",role1._data.name,rid2);
        }
    },



    //取消交易
    delDeal:function(rid){
        var id = this.getDeal(rid);
        if(id){
            ag.jsUtil.sendData("sDelDeal",0,this._dataMap[id].rid1);
            ag.jsUtil.sendData("sDelDeal",0,this._dataMap[id].rid2);
            delete this._dataMap[id];
        }
    },


    //同意交易
    okDeal:function(rid){
        var id = this.getDeal(rid);
        if(id){
            var rid1 = this._dataMap[id].rid1;
            var rid2 = this._dataMap[id].rid2;
            if(rid1==rid){
                this._dataMap[id].ok1 = true;
                ag.jsUtil.sendData("sSystemNotify","8",rid1);
                ag.jsUtil.sendData("sSystemNotify","9",rid2);
            }else{
                this._dataMap[id].ok2 = true;
                ag.jsUtil.sendData("sSystemNotify","8",rid2);
                ag.jsUtil.sendData("sSystemNotify","9",rid1);
            }

            //执行交易
            if(this._dataMap[id].ok1 && this._dataMap[id].ok2){
                var role1 = ag.gameLayer.getRole(rid1);
                var role2 = ag.gameLayer.getRole(rid2);
                if(this._dataMap[id].gold1<=role1._data.gold && this._dataMap[id].gold2<=role2._data.gold
                    && this._dataMap[id].itemArray1.length+role2._bagLength<=ag.gameConst.bagLength
                    && this._dataMap[id].itemArray2.length+role1._bagLength<=ag.gameConst.bagLength){
                    role1.addGold(this._dataMap[id].gold2-this._dataMap[id].gold1);
                    role2.addGold(this._dataMap[id].gold1-this._dataMap[id].gold2);
                    role1._bagLength += this._dataMap[id].itemArray2.length-this._dataMap[id].itemArray1.length;
                    role2._bagLength += this._dataMap[id].itemArray1.length-this._dataMap[id].itemArray2.length;
                    var array = this._dataMap[id].itemArray1.concat(this._dataMap[id].itemArray2);
                    for(var i=0;i<array.length;++i){
                        var item = ag.itemManager._itemMap.get(array[i]);
                        item._data.owner = item._data.owner==rid1?rid2:rid1;
                        ag.jsUtil.sendData("sItem",JSON.parse(JSON.stringify(item._data)),rid1);
                        ag.jsUtil.sendData("sItem",JSON.parse(JSON.stringify(item._data)),rid2);
                    }
                    ag.jsUtil.sendData("sSystemNotify","10",rid1);
                    ag.jsUtil.sendData("sSystemNotify","10",rid2);
                }else{
                    ag.jsUtil.sendData("sSystemNotify","11",rid1);
                    ag.jsUtil.sendData("sSystemNotify","11",rid2);
                }
                this.delDeal(rid);
            }
        }
    },


    dealAddItem:function(rid,iid){
        var id = this.getDeal(rid);
        var item = ag.itemManager._itemMap.get(iid);
        if(id && item && item._data.owner==rid){
            var otherRid = this._dataMap[id].rid1==rid?this._dataMap[id].rid2:this._dataMap[id].rid1;
            var array = this._dataMap[id].rid1==rid?this._dataMap[id].itemArray1:this._dataMap[id].itemArray2;
            array.push(iid);
            ag.jsUtil.sendData("sDealAddItem",item._data.mid,otherRid);
        }
    },



    dealAddGold:function(rid,gold){
        var id = this.getDeal(rid);
        gold = parseInt(gold);
        if(id){
            var otherRid = this._dataMap[id].rid1==rid?this._dataMap[id].rid2:this._dataMap[id].rid1;
            if(this._dataMap[id].rid1==rid){
                if(gold>this._dataMap[id].gold1)this._dataMap[id].gold1 = gold;
            }else{
                if(gold>this._dataMap[id].gold2)this._dataMap[id].gold2 = gold;
            }
            ag.jsUtil.sendData("sDealAddGold",gold,otherRid);
        }
    },
});
