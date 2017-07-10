/**
 * Created by bot.su on 2017/6/21.
 * 角色类
 */


module.exports = ag.class.extend({
    _data:null,
    _mst:null,
    ctor:function () {
        this._busy = false;
    },


    setAIController:function (ai) {
        this._ai = ai;
    },


    //获得策划数据
    getMst : function(){
        return ag.gameConst._roleMst[type];
    },


    //获得地图名字
    getMapName : function(){
        for(var key in ag.gameLayer._roleMap){
            var array = ag.gameLayer._roleMap[key];
            for(var i=0;i<array.length;++i)if(array[i]==this)return key;
        }
        return null;
    },

    //设置逻辑位置
    setLocation:function(location){
        var oldStr = this.getMapXYString();
        this._data.x = location.x;
        this._data.y = location.y;
        var newStr = this.getMapXYString();


        //更新xy数组信息
        ag.gameLayer._roleXYMap[oldStr].splice(ag.gameLayer._roleXYMap[oldStr].indexOf(this),1);
        if(ag.gameLayer._roleXYMap[oldStr].length==0)delete ag.gameLayer._roleXYMap[oldStr];
        if(!ag.gameLayer._roleXYMap[newStr])ag.gameLayer._roleXYMap[newStr] = [];
        ag.gameLayer._roleXYMap[newStr].push(this);
    },



    //无事可以做状态，可以重复进入
    idle:function(){
        this._state = ag.gameConst.stateIdle;
    },


    move:function(location){
        var myData = this._data;
        if(Math.abs(this._data.x-location.x)>1 || Math.abs(this._data.y-location.y)>1){
            //位置异常，重新定位
            ag.jsUtil.send("sMyMove",JSON.stringify({x:myData.x,y:myData.y}),[this._data.id]);
            return;
        }

        this.setLocation(location);


        //通知其他人
        for(var key in ag.gameLayer._roleMap){
            var data = ag.gameLayer._roleMap[key]._data;
            if(data.mapId==this._data.mapId && data.camp!=ag.gameConst.campMonster && data.id!=this._data.id){
                ag.jsUtil.send("sMove",JSON.stringify({id:myData.id, x:myData.x, y:myData.y}),[data.id]);
            }
        }


        //忙碌状态
        this._busy = true;
        ag.actionManager.runAction(this,this._data.moveSpeed,function(){
            this._busy = false;
            this.idle();
        }.bind(this));


        this._state = ag.gameConst.stateMove;
    },


    //攻击
    attack:function(locked){
        var data = locked._data;
        var x = data.x, y = data.y;
        var sendArray = [];


        //伤害计算
        if(this._data.type=='m0'){
            var dirPoint = ag.gameConst.directionArray[this._data.direction];
            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+(this._data.x+dirPoint.x)+','+(this._data.y+dirPoint.y)];
            if(array){
                for(var k=0;k<array.length;++k){
                    var lockedData = array[k]._data;
                    if(lockedData.camp!=this._data.camp){
                        lockedData.hp -= 5;
                        sendArray.push({id:lockedData.id,hp:lockedData.hp});
                    }
                }
            }
            //刺杀位置
            array = ag.gameLayer._roleXYMap[''+data.mapId+','+(this._data.x+dirPoint.x*2)+','+(this._data.y+dirPoint.y*2)];
            if(array){
                for(var k=0;k<array.length;++k){
                    var lockedData = array[k]._data;
                    if(lockedData.camp!=this._data.camp){
                        lockedData.hp -= 8;
                        sendArray.push({id:lockedData.id,hp:lockedData.hp});
                    }
                }
            }
        }
        if(this._data.type=='m1'){
            for(var i=y-1;i<=y+1;++i){
                for(var j=x-1;j<=x+1;++j){
                    var array = ag.gameLayer._roleXYMap[''+data.mapId+','+j+','+i];
                    if(array){
                        for(var k=0;k<array.length;++k){
                            var lockedData = array[k]._data;
                            if(lockedData.camp!=this._data.camp){
                                lockedData.hp -= 5;
                                sendArray.push({id:lockedData.id,hp:lockedData.hp});
                            }
                        }
                    }
                }
            }
        }else{
            var array = ag.gameLayer._roleXYMap[''+data.mapId+','+x+','+y];
            if(array){
                for(var k=0;k<array.length;++k){
                    var lockedData = array[k]._data;
                    if(lockedData.camp!=this._data.camp){
                        lockedData.hp -= 5;
                        sendArray.push({id:lockedData.id,hp:lockedData.hp});
                    }
                }
            }
        }
        //通知所有人
        for(var key in ag.gameLayer._roleMap){
            var data = ag.gameLayer._roleMap[key]._data;
            if(data.camp!=ag.gameConst.campMonster && data.id!=this._data.id){
                ag.jsUtil.send("sAttack",JSON.stringify({id:this._data.id,lockedId:locked._data.id}),[data.id]);
            }
        }



        //忙碌状态
        this._busy = true;
        ag.actionManager.runAction(this,this._data.attackSpeed,function(){
            this._busy = false;
            this.idle();
        }.bind(this));


        ag.jsUtil.sendAll("sHP",JSON.stringify(sendArray));


        //删除本地怪物数据
        for(var i=0;i<sendArray.length;++i){
            if(sendArray[i].hp<=0){
                ag.gameLayer._roleMap[sendArray[i].id].dead();
            }
        }
        this._state = ag.gameConst.stateAttack;
    },


    dead:function () {
        this._state = ag.gameConst.stateDead;

        //取消所有锁定自己的AI
        ag.gameLayer.delLockedRole(this);
        if(this._ai)this._ai._locked = null;
        if(this._data.camp==ag.gameConst.campMonster){
            var str = this.getMapXYString();
            ag.gameLayer._roleXYMap[str].splice(ag.gameLayer._roleXYMap[str].indexOf(this),1);
            if(ag.gameLayer._roleXYMap[str].length==0)delete ag.gameLayer._roleXYMap[str];
            delete ag.gameLayer._roleMap[this._data.id];
            ag.actionManager.delAll(this._ai);
            ag.actionManager.delAll(this);
        }else{//玩家5秒后重新复活
            ag.actionManager.runAction(this,5,function () {
                this._state = ag.gameConst.stateIdle;
                this._data.hp = this._data.totalHP;
                this.setLocation(ag.jsUtil.p(1,1));
                this._busy = false;
            }.bind(this));
        }
    },


    getMapXYString:function(){
        return ''+this._data.mapId+','+this._data.x+','+this._data.y;
    },


    //获得角色位置
    getLocation:function () {
        return {x:this._data.x,y:this._data.y};
    },
});
