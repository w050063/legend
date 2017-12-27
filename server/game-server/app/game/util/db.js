/**
 * Created by bot.su on 2017/6/21.
 * 数据库管理
 */


var mysql=require("mysql");
var crypto = require('./crypto');
var Item = require('../Item');
module.exports = ag.class.extend({
    ctor:function () {
        this._pool = mysql.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'jiqiren316S+',
            database: 'legend',
            port: 3306,
            multipleStatements:true,
        });
        this.getAccounts(function(rows){
            for(var i=0;i<rows.length;++i){
                var name = crypto.fromBase64(rows[i].name);
                ag.userManager.add(rows[i].id,name);
            }
        });
        this.getRoles(function(rows){
            for(var i=0;i<rows.length;++i){
                var data = rows[i];
                if(data.camp==ag.gameConst.campNpc || data.camp==ag.gameConst.campMonster)data.camp=ag.gameConst.campPlayerNone;//防错处理
                ag.gameLayer.addPlayer(data.id,data.map_id,data.x,data.y,data.type,data.camp,data.sex,data.direction,data.level,data.exp,data.gold,data.office);
            }
        });
        this.getItems(function(rows){
            for(var i=0;i<rows.length;++i){
                var data = rows[i];
                var item = new Item(data.mid,undefined,undefined,data.id);
                item._duration = 0;
                item._data.owner = data.owner;
                if(data.puton!=-1)item._data.puton = data.puton;
                ag.itemManager.addItem(item);
                var role = ag.gameLayer.getRole(data.owner);
                if(role){
                    ag.jsUtil.sendDataAll("sItem",item._data,role._data.mapId);
                    role.refreshItemProp();
                }
            }
        });
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
    },


    query:function (sql,callback){
        this._pool.getConnection(function(err,conn){
            if(err){
                callback(err,null,null);
            }else{
                conn.query(sql,function(qerr,vals){
                    //释放连接
                    conn.release();
                    //事件驱动回调
                    callback(qerr,vals);
                });
            }
        });
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
            if(callback)callback(rows);
        });
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
            if(callback)callback(rows);
        });
    },


    insertRole:function(id,map_id,x,y,type,camp,sex,direction,level,exp,gold,office,callback){
        if(id && map_id){
            var sql = 'INSERT INTO t_roles(id,map_id,x,y,type,camp,sex,direction,level,exp,gold,office) VALUES("'
                + id + '","' + map_id+'",' + x+',' + y+',"' + type+'",' + camp+',' + sex+',' + direction+',' + level+',' + exp+',' + gold+',' + office + ')';
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
        var allSql = '';
        for(var i=0;i<array.length;++i){
            var role = array[i];
            var data = role._data;
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
                + ' WHERE id = "' + data.id + '";';
            allSql = allSql+sql;
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
            if(callback)callback(rows);
        });
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
                    var puton = (typeof i2.puton=='number')?i2.puton:-1;
                    if(i1.mid!=i2.mid || i1.owner!=i2.owner || i1.puton!=puton){
                        var sql = 'UPDATE t_items SET mid = "' + i2.mid
                            + '", owner = "' + i2.owner
                            + '", puton = ' + puton
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
                var puton = (typeof temp.puton=='number')?temp.puton:-1;
                var sql = 'INSERT INTO t_items(id,mid,owner,puton) VALUES("'
                    + temp.id + '","' + temp.mid+'","' + temp.owner+'",' + puton + ');';
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


    //生成聊天
    insertChat:function(aid,chat,chat_time,callback){
        if(aid && chat && chat_time){
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
            if(callback)callback(rows);
        });
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
});