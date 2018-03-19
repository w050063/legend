/**
 * Created by bot.su on 2017/6/21.
 * 数据库管理
 */


var mysql=require("mysql");
var crypto = require('./crypto');
var Item = require('../Item');
module.exports = ag.class.extend({
    ctor:function () {
        //console.log(crypto.fromBase64("5YeJ5Yaw5bCP5rOV"));
        this._chatCount = 0;
        this._dataArray = [];
        this._cardMap = {};
        this._bDoing = false;
        this._bFirstReadOver = false;

        this._pool = mysql.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'jiqiren316S+',
            database: 'legend',
            connectionLimit: 10,
            port: 3306,
            multipleStatements:true,
        });


        this.getAccounts(function(rows){
            //先处理同名问题
            var map = {};
            for(var i=0;i<rows.length;++i){
                var name = crypto.fromBase64(rows[i].name);
                name = name.replace(/ /g,"*");
                name = name.replace(/\n/g,"*");
                if(name.length==0)name='**';
                if(name.length==1)name='*'+name;
                for(var j=ag.gameLayer._legendID;j<=ag.gameLayer._legendIDMax;++j){
                    if(name.substr(name.length-3)==('.s'+j)){
                        name = name.substr(0,name.length-3);
                    }
                }
                rows[i].name = name;
                if(!map[name])map[name] = [];
                map[name].push(i);
            }

            for(var key in map){
                if(map[key].length>=2){
                    for(var i=0;i<map[key].length;++i){
                        var index = map[key][i];
                        var legendId = rows[index].id.split('_')[0];
                        rows[index].name = rows[index].name + '.s' + legendId;
                    }
                }
            }


            for(var i=0;i<rows.length;++i){
                ag.userManager.add(rows[i].id,rows[i].password,rows[i].name,rows[i].create_time);
            }
        });
        this.getRoles(function(rows){
            for(var i=0;i<rows.length;++i){
                var data = rows[i];
                if(data.camp==ag.gameConst.campNpc || data.camp==ag.gameConst.campMonster)data.camp=ag.gameConst.campPlayerNone;//防错处理
                ag.gameLayer.addPlayer(data.id,data.map_id,data.x,data.y,data.type,data.camp,data.sex,data.direction,data.level,data.exp,data.gold,data.office,data.wing,data.come,data.practice);
            }
        });
        this.getItems(function(rows){
            for(var i=0;i<rows.length;++i){
                var data = rows[i];
                if(ag.gameConst._itemMst[data.mid]){
                    var role = ag.gameLayer.getRole(data.owner);
                    if(role){
                        var item = new Item(data.mid,undefined,undefined,data.id);
                        item._duration = 0;
                        item._data.owner = data.owner;
                        item._data.puton = data.puton;
                        if(this.existSamePuton(role._data.id,data.puton)){
                            item._data.puton = ag.gameConst.putonBag;
                        }
                        ag.itemManager._itemMap.add(item);
                        if(item._data.puton==ag.gameConst.putonBag){
                            ++role._bagLength;
                        }
                        //ag.jsUtil.sendDataAll("sItem",item._data,role._data.mapId);
                        //role.refreshItemProp();
                    }
                }
            }
            for(var key in ag.gameLayer._roleMap){
                ag.gameLayer._roleMap[key].refreshItemProp();
            }
        }.bind(this));
        this.getGuilds(function(rows){
            for(var i=0;i<rows.length;++i){
                var name = crypto.fromBase64(rows[i].name);
                var member = [];
                if(rows[i].member && rows[i].member!=''){
                    member = rows[i].member.split(',');
                }
                var obj = {id:rows[i].id,name:name,member:member,identify:++ag.guild._baseIdentify};
                ag.guild._dataMap[rows[i].id] = obj;
                var temp = ag.gameLayer.getRole(obj.id);
                if(temp){
                    temp._data.camp = obj.identify;
                }
                for(var j=0;j<member.length;++j){
                    var temp = ag.gameLayer.getRole(member[j]);
                    if(temp){
                        temp._data.camp = obj.identify;
                    }
                }
            }
        });


        //读取拍卖行数据
        this.getAuctionShop(function(rows){
            for(var i=0;i<rows.length;++i){
                var obj = {id:rows[i].id,price:rows[i].price,create_time:rows[i].create_time};
                ag.auctionShop._dataMap[obj.id] = obj;
            }
            //拍卖数据矫正
            ag.auctionShop.correct();
        });



        //自定义数据
        this.getCustomData(this._legendID,function(data){
            this._customData = data;
            if(!this._customData.guildWinId)this._customData.guildWinId = '0';
            if(ag.shabake)ag.shabake._guildWinId = this._customData.guildWinId;
            if(!ag.db._customData.comeDate){
                var date = new Date();
                ag.db._customData.comeDate = ''+date .getFullYear()+'.'+date .getMonth()+'.'+date .getDate();
            }
            if(!ag.db._customData.come)ag.db._customData.come = {};
            if(!ag.db._customData.wing)ag.db._customData.wing = {};
        }.bind(this));


        //获得卡密数据
        this.getCard();


        ag.actionManager.runAction(this,3,function(){
            ag.gameLayer.theCountryIsAtPeace(35);
        }.bind(this));

        //启动定时器,每秒执行一次
        ag.actionManager.schedule(this,0.01,function (dt) {
            if(this._dataArray.length>0 && this._bDoing==false){
                var obj = this._dataArray[0];
                this._dataArray.splice(0,1);
                this._bDoing = true;
                var self = this;
                this._pool.getConnection(function(err,conn){
                    if(err){
                        obj.callback(err,null,null);
                        self._bDoing = false;
                    }else{
                        conn.query(obj.sql,function(qerr,vals){
                            //释放连接
                            conn.release();
                            //事件驱动回调
                            obj.callback(qerr,vals);
                            self._bDoing = false;
                        });
                    }
                });
            }
        }.bind(this));
    },



    existSamePuton:function (id,puton){
        if(puton>=0){
            var map = ag.itemManager._itemMap.getMap();
            for (var key in map) {
                var obj = map[key]._data;
                if (obj.owner == id && obj.puton==puton) {
                    return true;
                }
            }
        }
        return false;
    },


    query:function (sql,callback){
        this._dataArray.push({sql:sql,callback:callback});
    },


    //获得当前区域的数据
    getCurZone:function(rows){
        for(var i=rows.length-1;i>=0;--i){
            var zone = parseInt(rows[i].id.split('_')[0]);
            if(!zone || zone<ag.gameLayer._legendID || zone>ag.gameLayer._legendIDMax){
                rows.splice(i,1);
            }
        }
        return rows;
    },


    //获取所有账户
    getAccounts:function(callback){
        var sql = 'SELECT * FROM t_accounts';
        this.query(sql, function(err, rows) {
            if (err) {
                if(callback)callback([]);
                throw err;
            }

            if(rows.length == 0){
                if(callback)callback([]);
                return;
            }
            if(callback){
                callback(this.getCurZone(rows));
            }
        }.bind(this));
    },

    createAccount:function(id,password,name,create_time,last_time,callback){
        name = crypto.toBase64(name);
        if(id && password && name && create_time && last_time){
            var sql = 'INSERT INTO t_accounts(id,password,name,create_time,last_time) VALUES("'
                + id + '","' + password+'","' + name+'","' + create_time+'","' + last_time + '")';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    setAccountName:function(id,name,callback){
        if(id && name && name.indexOf(';')==-1){
            name = crypto.toBase64(name);
            var sql = 'UPDATE t_accounts SET name = "' + name + '" WHERE id = "' + id + '"';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    setAccountLastTime:function(id,last_time,callback){
        if(id && last_time){
            var sql = 'UPDATE t_accounts SET last_time = "' + last_time + '" WHERE id = "' + id + '"';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    alterPassWord:function(id,password,callback){
        if(id && password){
            var sql = 'UPDATE t_accounts SET password = "' + password + '" WHERE id = "' + id + '"';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    //获取所有角色信息
    getRoles:function(callback){
        var sql = 'SELECT * FROM t_roles';
        this.query(sql, function(err, rows) {
            if (err) {
                if(callback)callback([]);
                throw err;
            }

            if(rows.length == 0){
                if(callback)callback([]);
                return;
            }
            if(callback){
                callback(this.getCurZone(rows));
            }
        }.bind(this));
    },


    insertRole:function(id,map_id,x,y,type,camp,sex,direction,level,exp,gold,office,wing,come,practice,callback){
        if(id && map_id){
            var sql = 'INSERT INTO t_roles(id,map_id,x,y,type,camp,sex,direction,level,exp,gold,office,wing,come,practice) VALUES("'
                + id + '","' + map_id+'",' + x+',' + y+',"' + type+'",' + camp+',' + sex+',' + direction
                +',' + level+',' + exp+',' + gold+',' + office +',' + wing +',' + come+',' + practice + ')';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    setRoles:function(array,callback){
        this.getRoles(function(roles){
            var roleMap = {};
            for(var i=0;i<roles.length;++i){
                roleMap[roles[i].id] = roles[i];
            }

            var allSql = '';

            for(var i=0;i<array.length;++i){
                var role = array[i];
                var data = role._data;
                var base = roleMap[data.id];
                if(data.mapId!=base.mapId || data.x!=base.x || data.y!=base.y || data.level!=base.level
                    || role._exp!=base.exp || data.gold!=base.gold || data.office!=base.office || data.wing!=base.wing
                    || data.come!=base.come || data.practice!=base.practice)
                var sql = 'UPDATE t_roles SET map_id = "' + data.mapId
                    + '", x = ' + data.x
                    + ', y = ' + data.y
                    + ', type = "' + data.type
                    + '", camp = ' + data.camp
                    + ', sex = ' + data.sex
                    + ', direction = ' + data.direction
                    + ', level = ' + data.level
                    + ', exp = ' + role._exp
                    + ', gold = ' + data.gold
                    + ', office = ' + data.office
                    + ', wing = ' + data.wing
                    + ', come = ' + data.come
                    + ', practice = ' + data.practice
                    + ' WHERE id = "' + data.id + '";';
                allSql = allSql+sql;
            }
            if(allSql.length>0){
                this.query(allSql, function(err, rows) {
                    if (err) {
                        if(err.code == 'ER_DUP_ENTRY'){
                            if(callback)callback(false);
                            return;
                        }
                        if(callback)callback(false);
                        throw err;
                    }
                    else{
                        if(callback)callback(true);
                    }
                });
            }
        }.bind(this));
    },

    deleteRole:function(id,callback){
        var sql = 'DELETE FROM t_roles WHERE id = "' + id + '";';
        this.query(sql, function(err, rows) {
            if (err) {
                if(err.code == 'ER_DUP_ENTRY'){
                    if(callback)callback(false);
                    return;
                }
                if(callback)callback(false);
                throw err;
            }
            else{
                if(callback)callback(true);
            }
        });
    },


    //获取所有道具
    getItems:function(callback){
        var sql = 'SELECT * FROM t_items';
        this.query(sql, function(err, rows) {
            if (err) {
                if(callback)callback([]);
                throw err;
            }

            if(rows.length == 0){
                if(callback)callback([]);
                return;
            }
            if(callback){
                callback(this.getCurZone(rows));
            }
        }.bind(this));
    },


    //更新所有道具
    setItems:function(callback){
        this.getItems(function(items){
            var allSql = '';


            var idMaps = {};
            var map = ag.itemManager._itemMap.getMap();
            for(var key in map){
                if(map[key]._data.owner){
                    idMaps[key] = key;
                }
            }
            for(var i=0;i<items.length;++i){
                var i1 = items[i];
                if(map[i1.id]){
					var i2 = map[i1.id]._data;
                    if(i1.mid!=i2.mid || i1.owner!=i2.owner || i1.puton!=i2.puton){
                        var sql = 'UPDATE t_items SET mid = "' + i2.mid
                            + '", owner = "' + i2.owner
                            + '", puton = ' + i2.puton
                            + ' WHERE id = "' + i1.id + '";';
                        allSql = allSql+sql;
                    }
                    delete idMaps[i1.id];
                }else{
                    var sql = 'DELETE FROM t_items WHERE id = "'+i1.id+'";';
                    allSql = allSql+sql;
                }
            }

            for(var key in idMaps){
                var temp = map[key]._data;
                var sql = 'INSERT INTO t_items(id,mid,owner,puton) VALUES("'
                    + temp.id + '","' + temp.mid+'","' + temp.owner+'",' + temp.puton + ');';
                allSql = allSql+sql;
            }
            if(allSql.length>0){
                this.query(allSql, function(err, rows) {
                    if (err) {
                        if(err.code == 'ER_DUP_ENTRY'){
                            if(callback)callback(false);
                            return;
                        }
                        if(callback)callback(false);
                        throw err;
                    }
                    else{
                        if(callback)callback(true);
                    }
                });
            }
            else{
                if(callback)callback(true);
            }
        }.bind(this));
    },


    //获取拍卖行道具
    getAuctionShop:function(callback){
        var sql = 'SELECT * FROM t_auctionShop';
        this.query(sql, function(err, rows) {
            if (err) {
                callback([]);
                throw err;
            }

            if(rows.length == 0){
                callback([]);
                return;
            }
            if(callback){
                callback(this.getCurZone(rows));
            }
        }.bind(this));
    },


    //更新拍卖行
    setAuctionShop:function(callback){
        this.getAuctionShop(function(items){
            var allSql = '';
            var i= 0,j=0;
            var dataMap = ag.auctionShop._dataMap;
            var itemMap = {};
            for(i=0;i<items.length;++i){
                itemMap[items[i].id] = 1;
            }


            for(i=0;i<items.length;++i){
                var i1 = items[i];
                var i2 = dataMap[i1.id];
                if(i2){
                    if(i1.price!=i2.price){
                        var sql = 'UPDATE t_auctionShop SET create_time = "' + i2.create_time
                            + '", price = ' + i2.price
                            + ' WHERE id = "' + i1.id + '";';
                        allSql = allSql+sql;
                    }
                }else{
                    var sql = 'DELETE FROM t_auctionShop WHERE id = "'+i1.id+'";';
                    allSql = allSql+sql;
                }
            }

            for(var key in dataMap){
                if(!itemMap[key]){
                    var temp = dataMap[key];
                    var sql = 'INSERT INTO t_auctionShop(id,create_time,price) VALUES("'
                        + temp.id + '","' + temp.create_time+'",' + temp.price + ');';
                    allSql = allSql+sql;
                }
            }
            if(allSql.length>0){
                this.query(allSql, function(err, rows) {
                    if (err) {
                        if(err.code == 'ER_DUP_ENTRY'){
                            if(callback)callback(false);
                            return;
                        }
                        if(callback)callback(false);
                        throw err;
                    }
                    else{
                        if(callback)callback(true);
                    }
                });
            }
            else{
                if(callback)callback(true);
            }
        }.bind(this));
    },



    //生成聊天
    insertChat:function(aid,chat,chat_time,callback){
        return;
        if(aid && chat && chat_time){
            ++this._chatCount;
            if(this._chatCount>99){
                this._chatCount = 0;
                var sql = 'DELETE FROM t_chats';
                this.query(sql, function(err, rows) {});
            }
            chat = crypto.toBase64(chat);
            var sql = 'INSERT INTO t_chats(aid,chat,chat_time) VALUES("'
                + aid + '","' + chat+'","' + chat_time + '")';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    //获得当前行会数据
    getGuilds:function(callback){
        var sql = 'SELECT * FROM t_guilds';
        this.query(sql, function(err, rows) {
            if (err) {
                if(callback)callback([]);
                throw err;
            }

            if(rows.length == 0){
                if(callback)callback([]);
                return;
            }
            if(callback){
                callback(this.getCurZone(rows));
            }
        }.bind(this));
    },

    //创建行会
    guildCreate:function(id,name,callback){
        if(name && id){
            name = crypto.toBase64(name);
            var sql = 'INSERT INTO t_guilds(id,name,member) VALUES("'
                + id + '","' + name + '","")';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    //保存行会成员
    guildSaveMember:function(id,member,callback){
        if(id){
            var str = member.length==0?'':member.join(',');
            var sql = 'UPDATE t_guilds SET member = "' + str
                + '" WHERE id = "' + id + '";';
            this.query(sql, function(err, rows) {
                if (err) {
                    if(err.code == 'ER_DUP_ENTRY'){
                        if(callback)callback(false);
                        return;
                    }
                    if(callback)callback(false);
                    throw err;
                }
                else{
                    if(callback)callback(true);
                }
            });
        }
    },


    //删除行会
    guildDelete:function(id,callback){
        var sql = 'DELETE FROM t_guilds WHERE id = "' + id + '";';
        this.query(sql, function(err, rows) {
            if (err) {
                if(err.code == 'ER_DUP_ENTRY'){
                    if(callback)callback(false);
                    return;
                }
                if(callback)callback(false);
                throw err;
            }
            else{
                if(callback)callback(true);
            }
        });
    },


    //获得当前行会数据
    getCustomData:function(legendID,callback){
        var self = this;
        var sql = 'SELECT * FROM t_custom where id = "'+legendID+'_0";';
        this.query(sql, function(err, rows) {
            var data = '';
            if(rows.length>=1){
                data = rows[0].data.replace(/%/g,'"');
            }else{
                data = '{}';
                self.createCustomData();
            }
            if(callback)callback(JSON.parse(data));
        });
    },

    //创建自定义数据
    setCustomData:function(data){
        var sql = 'UPDATE t_custom SET data = "' + JSON.stringify(data).replace(/"/g,'%')
            + '" WHERE id = "'+ag.gameLayer._legendID+'_0";';
        this.query(sql, function(err, rows) {});
    },

    //创建自定义数据
    createCustomData:function(){
        var sql = 'INSERT INTO t_custom(id,data) VALUES("'
            + ag.gameLayer._legendID + '_0","{}")';
        this.query(sql, function(err, rows) {});
    },


    getCard:function(){
        var sql = 'SELECT * FROM t_card';
        this.query(sql, function(err, rows) {
            for(var i=0;i<rows.length;++i){
                this._cardMap[rows[i].id] = rows[i];
            }

            //数据库读取完毕
            this._bFirstReadOver = true;
        }.bind(this));
    },


    cardBuy:function(rid,psw){
        var sql = 'SELECT * FROM t_card';
        var obj = this._cardMap[psw];
        if(obj){
            if(obj.rid=='0'){
                var timeCounter = ''+new Date().getTime();
                obj.rid = rid;
                obj.buy_time = timeCounter;
                var role =  ag.gameLayer.getRole(rid);
                role.addGold(obj.gold);
                var sql2 = 'UPDATE t_card SET rid = "' + obj.rid
                    + '", buy_time = "' + obj.buy_time
                    + '" WHERE id = "' + obj.id + '";';
                this.query(sql2, function(err, rows) {});
                ag.jsUtil.sendData("sSystemNotify","兑换元宝成功！",rid);
                ag.jsUtil.sendDataAll("sSystemNotify","玩家【"+role._data.name+"】用秘卡购买"+obj.gold+"个元宝！");
            }else{
                ag.jsUtil.sendData("sSystemNotify","卡密已经使用！",rid);
            }
        }else{
            ag.jsUtil.sendData("sSystemNotify","卡密不存在！",rid);
        }
    },
});