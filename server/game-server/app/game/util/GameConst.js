/**
 * Created by bot.su on 2017/6/21.
 * 游戏常量相关
 */

var fs = require('fs');
module.exports = {
    //显示的数据方便策划，init做转换。
    init:function(){
        for(var key in this._terrainMap){
            var map = this._terrainMap[key];
            var data = fs.readFileSync('./app/'+map.res+'.mapag', 'utf8');
            var array = data.split(',');
            map.collision = [];
            var count = map.mapX*map.mapY;
            for(var i=0;i<count;++i){
                var x = i%map.mapX;
                var y = Math.floor(i/map.mapX);
                map.collision.push(array[(y*map.mapX+x)*3+4]);
            }
        }
    },



    //阵营类型
    campNpc:0,
    campMonster:1,
    campPlayerNone:2,
    campPlayerQinglong:3,
    campPlayerBaihu:4,
    campPlayerZhuque:5,
    campPlayerXuanwu:6,
    campPlayerArray:['青龙堂','白虎堂','朱雀堂','玄武堂'],


    stateIdle : 0,
    stateMove :1,
    stateAttack : 2,
    stateDead : 3,


    //性别
    sexBoy:0,
    sexGirl:1,


    //网络相关编码
    netOK: 200,
    netFAIL: 500,

    bagLength:40,


    //出生相关,_bornR怪物和角色通用
    _bornMap:"t0",
    born: {x:30,y:8},

    itemDuration:60,

    //八个方向顺序
    directionStringArray:['0,1','1,1','1,0','1,-1','0,-1','-1,-1','-1,0','-1,1'],
    directionArray:[{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1}],

    searchEnemypath:[[0,0],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],
        [0,2],[1,2],[2,2],[2,1],[2,0],[2,-1],[2,-2],[1,-2],[0,-2],[-1,-2],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-1,2],
        [0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[3,-1],[3,-2],[3,-3],[2,-3],[1,-3],[0,-3],[-1,-3],[-2,-3],[-3,-3],[-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-3,3],[-2,3],[-1,3],
        [0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0],[4,-1],[4,-2],[4,-3],[4,-4],[3,-4],[2,-4],[1,-4],[0,-4],[-1,-4],[-2,-4],[-3,-4],[-4,-4],[-4,-3],[-4,-2],[-4,-1],[-4,0],[-4,1],[-4,2],[-4,3],[-4,4],[-3,4],[-2,4],[-1,4],
        [0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3],[5,2],[5,1],[5,0],[5,-1],[5,-2],[5,-3],[5,-4],[5,-5],[4,-5],[3,-5],[2,-5],[1,-5],[0,-5],[-1,-5],[-2,-5],[-3,-5],[-4,-5],[-4,-5],[-5,-5],[-5,-4],[-5,-3],[-5,-2],[-5,-1],[-5,0],[-5,1],[-5,2],[-5,3],[-5,4],[-5,5],[-4,5],[-3,5],[-2,5],[-1,5]],

    //基础等级，后面接着递增等级，35,43,47,51
    expDatabase:[10,0,10,1000,10000,100000],

    //地图详细信息,refresh怪物相关刷新，坐标-1表示全地图随机刷--hero type,x,y,aliquot time,max count.
    _terrainMap: {
        t0:{
            id : "t0",
            name: "新手村",
            level:0,
            res: 'map/0',
            music:'Heart Of Courage.mp3',
            npc:[{name:"新手村接待员",x:32,y:9,title:"安全区域传送:",content:['t16','t1']}],
            mapX: 40,
            mapY: 40,
            safe:{x:25,y:4,xx:35,yy:12},
            refresh: []
        },
        t1:{
            id : "t1",
            name: "盟城土城",
            level:35,
            res: 'map/3',
            music:'Victory.mp3',
            npc:[{name:"传送员",x:26,y:25,title:"区域传送:",content:['t0','t2','t5','t11']},
                {name:"装备回收",x:30,y:25,title:"装备回收:",content:['t1000','t1001','t1002']},
                {name:"门派使者",x:30,y:30,title:"加入门派:",content:['t2001','t2002','t2003','t2004','t2000']},
                {name:"苍月使者",x:28,y:25,title:"区域传送:",content:['t8','t9','t10']}],
            mapX: 60,
            mapY: 60,
            safe:{x:7,y:27,xx:26,yy:46},
            refresh: [["m8", 40, 29, 600, 1],["m9", 31, 0, 600, 1]]
        },
        t2:{
            id : "t2",
            name: "BOSS之家一层",
            level:35,
            res: 'map/d5071',
            music:'For The Win.mp3',
            npc:[{name:"传送员",x:7,y:40,title:"传送:",content:['t1']},{name:"传送员",x:41,y:12,title:"传送:",content:['t4','t1']}],
            mapX: 50,
            mapY: 50,
            refresh: [["m4", -1, -1, 300, 10],["m5", -1, -1, 300, 10],["m6", -1, -1, 300, 10],["m7", -1, -1, 300, 10],["m8", 26, 20, 600, 1]]
        },
        t3:{
            id : "t3",
            name: "BOSS之家二层",
            level:35,
            res: 'map/d515',
            music:'For The Win.mp3',
            npc:[{name:"传送员",x:29,y:24,title:"传送:",content:['t3','t1']}],
            mapX: 40,
            mapY: 40,
            refresh: [["m6", -1, -1, 300, 5],["m7", -1, -1, 300, 5],["m20", -1, -1, 600, 1]]
        },
        t4:{
            id : "t4",
            name: "皇家陵墓一层",
            level:43,
            res: 'map/d717',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",x:25,y:24,title:"传送:",content:['t1']},{name:"传送员",x:83,y:74,title:"传送:",content:['t7','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 300, 60],["m5", -1, -1, 300, 60],["m6", -1, -1, 300, 20],["m7", -1, -1, 300, 20],["m9", 73, 64, 600, 1]]
        },
        t5:{
            id : "t5",
            name: "皇家陵墓二层",
            level:43,
            res: 'map/dm002',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",x:7,y:9,title:"传送:",content:['t6','t1']}],
            mapX: 32,
            mapY: 38,
            refresh: [["m5", -1, -1, 300, 20],["m16", -1, -1, 600, 1],["m17", -1, -1, 180, 1],["m18", -1, -1, 600, 1]]
        },
        t6:{
            id : "t6",
            name: "鼠洞",
            level:35,
            res: 'map/d2052',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",x:87,y:32,title:"传送:",content:['t1']},{name:"传送员",x:18,y:18,title:"传送:",content:['t1']},{name:"传送员",x:50,y:75,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m5", -1, -1, 300, 60],["m6", -1, -1, 300, 20],["m10", -1, -1, 600, 1],["m11", -1, -1, 600, 1]]
        },
        t7:{
            id : "t7",
            name: "牛魔洞",
            level:35,
            res: 'map/d2079',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",x:14,y:86,title:"传送:",content:['t1']},{name:"传送员",x:15,y:12,title:"传送:",content:['t1']},{name:"传送员",x:52,y:48,title:"传送:",content:['t1']},{name:"传送员",x:89,y:84,title:"传送:",content:['t1']},{name:"传送员",x:89,y:10,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 300, 60],["m6", -1, -1, 300, 30],["m7", -1, -1, 300, 30],["m12", -1, -1, 600, 1],["m13", -1, -1, 600, 1]]
        },
        t8:{
            id : "t8",
            name: "魔窟圣地",
            level:35,
            res: 'map/d2063',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",x:106,y:52,title:"传送:",content:['t1']},{name:"传送员",x:19,y:33,title:"传送:",content:['t1']}],
            mapX: 130,
            mapY: 60,
            refresh: [["m4", -1, -1, 300, 30],["m5", -1, -1, 300, 30],["m7", -1, -1, 300, 20],["m14", -1, -1, 600, 1],["m15", -1, -1, 600, 1]]
        },
        t9:{
            id : "t9",
            name: "真天宫一层",
            level:43,
            res: 'map/d2013',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",x:79,y:21,title:"传送:",content:['t1']},{name:"传送员",x:24,y:74,title:"传送:",content:['t13','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 300, 30],["m5", -1, -1, 300, 30],["m6", -1, -1, 300, 10],["m7", -1, -1, 300, 10],["m8", 37, 60, 600, 1]]
        },
        t10:{
            id : "t10",
            name: "真天宫二层",
            level:43,
            res: 'map/d2013',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",x:79,y:21,title:"传送:",content:['t12','t1']},{name:"传送员",x:24,y:74,title:"传送:",content:['t15','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 300, 60],["m7", -1, -1, 300, 20],["m16", -1, -1, 600, 1],["m17", -1, -1, 600, 1],["m18", -1, -1, 600, 1]]
        },
        t11:{
            id : "t11",
            name: "真天宫三层",
            level:43,
            res: 'map/d2013',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",x:79,y:21,title:"传送:",content:['t14','t1']},{name:"传送员",x:24,y:74,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m5", -1, -1, 300, 60],["m6", -1, -1, 300, 20],["m9", 37, 60, 600, 1]]
        },
        t12:{
            id : "t12",
            name: "新手村训练基地",
            level:0,
            maxLevel:35,
            res: 'map/d515',
            music:'Heart Of Courage.mp3',
            npc:[{name:"传送员",x:29,y:24,title:"传送:",content:['t0']}],
            mapX: 40,
            mapY: 40,
            refresh: [["m3", -1, -1, 30, 100]]
        },
    },


    _transferMst:{
        t0:{id:'t0',name:'新手村',mapId:'t0',x:30,y:8},
        t1:{id:'t1',name:'盟城土城',mapId:'t1',x:16,y:36},
        t2:{id:'t2',name:'BOSS之家',mapId:'t2',x:8,y:39},
        t3:{id:'t3',name:'BOSS一层',mapId:'t2',x:39,y:6},
        t4:{id:'t4',name:'BOSS二层',mapId:'t3',x:14,y:7},
        t5:{id:'t5',name:'皇家陵墓',mapId:'t4',x:26,y:25},
        t6:{id:'t6',name:'陵墓一层',mapId:'t4',x:82,y:73},
        t7:{id:'t7',name:'陵墓二层',mapId:'t5',x:8,y:9},
        t8:{id:'t8',name:'鼠洞',mapId:'t6',x:84,y:33},
        t9:{id:'t9',name:'牛魔洞',mapId:'t7',x:12,y:87},
        t10:{id:'t10',name:'魔窟圣地',mapId:'t8',x:103,y:52},
        t11:{id:'t11',name:'真天宫',mapId:'t9',x:78,y:19},
        t12:{id:'t12',name:'天宫一层',mapId:'t9',x:23,y:72},
        t13:{id:'t13',name:'天宫二层',mapId:'t10',x:78,y:19},
        t14:{id:'t14',name:'天宫二层',mapId:'t10',x:23,y:72},
        t15:{id:'t15',name:'天宫三层',mapId:'t11',x:78,y:19},
        t16:{id:'t16',name:'训练基地',mapId:'t12',x:26,y:21},
        t1000:{id:'t1000',name:'一级回收'},
        t1001:{id:'t1001',name:'二级回收'},
        t1002:{id:'t1002',name:'三级回收'},
        t2000:{id:'t2000',name:'退出门派'},
        t2001:{id:'t2001',name:'青龙堂'},
        t2002:{id:'t2002',name:'白虎堂'},
        t2003:{id:'t2003',name:'朱雀堂'},
        t2004:{id:'t2004',name:'玄武堂'},
    },

    _roleMst: {
        m0:{id:"m0",name:"战",hp:19,hpAdd:[15,28,31,34,35],defense:0,defenseAdd:0.2,hurt:3,hurtAdd:0.45,expDead:0,heal:5,healAdd:2,
            moveSpeed:0.5,attackSpeed:0.8,checkDistance:5,visibleDistance:8,attackDistance:0},
        m1:{id:"m1",name:"法",hp:16,hpAdd:[4,7,8,9,9],defense:0,defenseAdd:0.4,hurt:2,hurtAdd:0.5,expDead:0,heal:5,healAdd:1.5,
            moveSpeed:0.5,attackSpeed:1.2,checkDistance:5,visibleDistance:8,attackDistance:5},
        m2:{id:"m2",name:"道",hp:17,hpAdd:[8,17,17,16,20],defense:0,defenseAdd:0.1,hurt:5,hurtAdd:0.45,expDead:0,heal:5,healAdd:2,
            moveSpeed:0.5,attackSpeed:1.2,checkDistance:5,visibleDistance:8,attackDistance:5},
        m3:{id:"m3",name:"甲壳虫",hp:10,hpAdd:0,defense:0,defenseAdd:0,hurt:1,hurtAdd:0,expDead:10,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"ani/hum16/016",drop:'',lv:1},
        m4:{id:"m4",name:"红野猪",hp:330,hpAdd:0,defense:0,defenseAdd:0,hurt:43,hurtAdd:0,expDead:33,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum17/017",drop:'i000,20,i001,20,i019,20,i014,20,i026,20,i038,20,i045,20,i048,20,i055,20,i059,20,i066,20',lv:1},
        m5:{id:"m5",name:"祖玛羊",hp:385,hpAdd:0,defense:10,defenseAdd:0,hurt:30,hurtAdd:0,expDead:38,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:4,model:"ani/hum18/018",drop:'i000,20,i001,20,i019,20,i014,20,i026,20,i038,20,i045,20,i048,20,i055,20,i059,20,i066,20',lv:1},
        m6:{id:"m6",name:"祖玛卫士",hp:495,hpAdd:0,defense:15,defenseAdd:0,hurt:56,hurtAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:1,attackSpeed:1,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum19/019",drop:'i002,10,i003,10,i004,10,i005,10,i006,10,i007,10,i020,10,i021,10,i022,10,i027,10,i028,10,i029,10,i039,10,i040,10,i041,10,i046,10,i049,10,i050,10,i051,10,i056,20,i060,20,i063,20,i067,20',lv:2},
        m7:{id:"m7",name:"白野猪",hp:1000,hpAdd:0,defense:15,defenseAdd:0,hurt:85,hurtAdd:0,expDead:100,heal:10,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum20/020",drop:'i002,10,i003,10,i004,10,i005,10,i006,10,i007,10,i020,10,i021,10,i022,10,i027,10,i028,10,i029,10,i039,10,i040,10,i041,10,i046,10,i049,10,i050,10,i051,10,i056,20,i060,20,i063,20,i067,20',lv:2},
        m8:{id:"m8",name:"千年树妖",hp:1800,hpAdd:0,defense:20,defenseAdd:0,hurt:70,hurtAdd:0,expDead:180,heal:20,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum21/022",drop:'i015,50,i016,50,i017,50',lv:2},
        m9:{id:"m9",name:"万年树妖",hp:8000,hpAdd:0,defense:20,defenseAdd:0,hurt:150,hurtAdd:0,expDead:800,heal:100,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum21/022",drop:'i018,50,i033,50,i034,50,i035,50,i047,50',lv:4},
        m10:{id:"m10",name:"暗之双头血魔",hp:3000,hpAdd:0,defense:12,defenseAdd:0,hurt:90,hurtAdd:0,expDead:300,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum22/023",drop:'i008,100,i036,50',lv:3},
        m11:{id:"m11",name:"暗之骷髅精灵",hp:3000,hpAdd:0,defense:12,defenseAdd:0,hurt:90,hurtAdd:0,expDead:300,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum23/024",drop:'i009,100,i037,50',lv:3},
        m12:{id:"m12",name:"暗之黄泉教主",hp:3000,hpAdd:0,defense:12,defenseAdd:0,hurt:90,hurtAdd:0,expDead:300,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum24/025",drop:'i010,100,i036,50',lv:3},
        m13:{id:"m13",name:"暗之虹膜教主",hp:3000,hpAdd:0,defense:12,defenseAdd:0,hurt:90,hurtAdd:0,expDead:300,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum25/026",drop:'i011,100,i037,50',lv:3},
        m14:{id:"m14",name:"暗之双头金刚",hp:3000,hpAdd:0,defense:12,defenseAdd:0,hurt:90,hurtAdd:0,expDead:300,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum26/027",drop:'i012,100,i036,50',lv:3},
        m15:{id:"m15",name:"暗之沃玛教主",hp:3000,hpAdd:0,defense:12,defenseAdd:0,hurt:90,hurtAdd:0,expDead:300,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum27/028",drop:'i013,100,i037,50',lv:3},
        m16:{id:"m16",name:"刀卫",hp:5000,hpAdd:0,defense:20,defenseAdd:0,hurt:85,hurtAdd:0,expDead:500,heal:60,healAdd:0,
            moveSpeed:1.5,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum28/029",drop:'i023,50,i030,50,i042,50,i052,50',lv:3},
        m17:{id:"m17",name:"虎卫",hp:5000,hpAdd:0,defense:20,defenseAdd:0,hurt:85,hurtAdd:0,expDead:500,heal:60,healAdd:0,
            moveSpeed:2,attackSpeed:1.5,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum29/030",drop:'i024,50,i031,50,i043,50,i053,50',lv:3},
        m18:{id:"m18",name:"鹰卫",hp:5000,hpAdd:0,defense:20,defenseAdd:0,hurt:85,hurtAdd:0,expDead:500,heal:60,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:4,model:"ani/hum30/031",drop:'i025,50,i032,50,i044,50,i054,50',lv:3},
        m19:{id:"m19",name:"白虎",hp:2400,hpAdd:0,defense:10,defenseAdd:0,hurt:71,hurtAdd:0,expDead:0,heal:10,healAdd:0,
            moveSpeed:1,attackSpeed:0.7,checkDistance:4,visibleDistance:6,attackDistance:1.5,model:"ani/hum31/032",drop:'',lv:1},
        m20:{id:"m20",name:"重装使者",hp:3600,hpAdd:0,defense:12,defenseAdd:0,hurt:90,hurtAdd:0,expDead:360,heal:60,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum29/030",drop:'i008,20,i009,20,i010,20,i011,20,i012,20,i013,20',lv:3},
    },


    //exclusive 专属,0-5分别为男战,女战,男法,女法,男道,女道
    _itemMst:{
        i000 : {id:'i000',name:'一级甲(男)',type:2,defense:1,exclusive:[0,2,4],model:'ani/hum2/002',level:1},
        i001 : {id:'i001',name:'一级甲(女)',type:2,defense:1,exclusive:[1,3,5],model:'ani/hum3/003',level:1},
        i002 : {id:'i002',name:'二级甲(男战)',type:2,hurt:3,defense:3,exclusive:[0],model:'ani/hum4/004',level:2},
        i003 : {id:'i003',name:'二级甲(女战)',type:2,hurt:3,defense:3,exclusive:[1],model:'ani/hum5/005',level:2},
        i004 : {id:'i004',name:'二级甲(男法)',type:2,hurt:3,defense:2,exclusive:[2],model:'ani/hum6/006',level:2},
        i005 : {id:'i005',name:'二级甲(女法)',type:2,hurt:3,defense:2,exclusive:[3],model:'ani/hum7/007',level:2},
        i006 : {id:'i006',name:'二级甲(男道)',type:2,hurt:3,defense:2,exclusive:[4],model:'ani/hum8/008',level:2},
        i007 : {id:'i007',name:'二级甲(女道)',type:2,hurt:3,defense:2,exclusive:[5],model:'ani/hum9/009',level:2},
        i008 : {id:'i008',name:'三级甲(男战)',type:2,hurt:6,defense:7,exclusive:[0],model:'ani/hum10/010',level:3},
        i009 : {id:'i009',name:'三级甲(女战)',type:2,hurt:6,defense:7,exclusive:[1],model:'ani/hum11/011',level:3},
        i010 : {id:'i010',name:'三级甲(男法)',type:2,hurt:6,defense:6,exclusive:[2],model:'ani/hum12/012',level:3},
        i011 : {id:'i011',name:'三级甲(女法)',type:2,hurt:6,defense:6,exclusive:[3],model:'ani/hum13/013',level:3},
        i012 : {id:'i012',name:'三级甲(男道)',type:2,hurt:6,defense:5,exclusive:[4],model:'ani/hum14/014',level:3},
        i013 : {id:'i013',name:'三级甲(女道)',type:2,hurt:6,defense:5,exclusive:[5],model:'ani/hum15/015',level:3},
        i014 : {id:'i014',name:'一级铁剑',type:0,hurt:20,exclusive:[0,1,2,3,4,5],model:'ani/hum35/036',level:1},
        i015 : {id:'i015',name:'二级裁决',type:0,hurt:30,exclusive:[0,1],model:'ani/hum36/037',level:2},
        i016 : {id:'i016',name:'二级骨玉',type:0,hurt:30,exclusive:[2,3],model:'ani/hum37/038',level:2},
        i017 : {id:'i017',name:'二级龙纹',type:0,hurt:30,exclusive:[4,5],model:'ani/hum38/039',level:2},
        i018 : {id:'i018',name:'三级圣剑',type:0,hurt:40,exclusive:[0,1,2,3,4,5],model:'ani/hum39/040',level:3},
        i019 : {id:'i019',name:'一级头',type:1,hurt:1,defense:1,exclusive:[0,1,2,3,4,5],model:'hum17',level:1},
        i020 : {id:'i020',name:'二级头(战)',type:1,hurt:3,defense:3,exclusive:[0,1],model:'hum17',level:2},
        i021 : {id:'i021',name:'二级头(法)',type:1,hurt:3,defense:2,exclusive:[2,3],model:'hum17',level:2},
        i022 : {id:'i022',name:'二级头(道)',type:1,hurt:3,defense:2,exclusive:[4,5],model:'hum17',level:2},
        i023 : {id:'i023',name:'三级头(战)',type:1,hurt:5,defense:7,exclusive:[0,1],model:'hum17',level:3},
        i024 : {id:'i024',name:'三级头(法)',type:1,hurt:5,defense:5,exclusive:[2,3],model:'hum17',level:3},
        i025 : {id:'i025',name:'三级头(道)',type:1,hurt:5,defense:5,exclusive:[4,5],model:'hum17',level:3},
        i026 : {id:'i026',name:'一级戒',type:5,hurt:5,exclusive:[0,1,2,3,4,5],model:'hum17',level:1},
        i027 : {id:'i027',name:'二级戒(战)',type:5,hurt:10,exclusive:[0,1],model:'hum17',level:2},
        i028 : {id:'i028',name:'二级戒(法)',type:5,hurt:10,exclusive:[2,3],model:'hum17',level:2},
        i029 : {id:'i029',name:'二级戒(道)',type:5,hurt:10,exclusive:[4,5],model:'hum17',level:2},
        i030 : {id:'i030',name:'三级戒(战)',type:5,hurt:15,exclusive:[0,1],model:'hum17',level:3},
        i031 : {id:'i031',name:'三级戒(法)',type:5,hurt:15,exclusive:[2,3],model:'hum17',level:3},
        i032 : {id:'i032',name:'三级戒(道)',type:5,hurt:15,exclusive:[4,5],model:'hum17',level:3},
        i033 : {id:'i033',name:'羽翼(战)',type:6,hurt:10,defense:10,exclusive:[0,1],model:'ani/hum32/033',level:3},
        i034 : {id:'i034',name:'羽翼(法)',type:6,hurt:10,defense:10,exclusive:[2,3],model:'ani/hum33/034',level:3},
        i035 : {id:'i035',name:'羽翼(道)',type:6,hurt:10,defense:10,exclusive:[4,5],model:'ani/hum34/035',level:3},
        i036 : {id:'i036',name:'四级甲(男)',type:2,hurt:10,defense:10,exclusive:[0,2,4],model:'ani/hum42/042',level:4},
        i037 : {id:'i037',name:'四级甲(女)',type:2,hurt:10,defense:10,exclusive:[1,3,5],model:'ani/hum43/043',level:4},
        i038 : {id:'i038',name:'一级项链',type:3,hurt:4,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i039 : {id:'i039',name:'二级项链(战)',type:3,hurt:7,exclusive:[0,1],model:'',level:2},
        i040 : {id:'i040',name:'二级项链(法)',type:3,hurt:7,exclusive:[2,3],model:'',level:2},
        i041 : {id:'i041',name:'二级项链(道)',type:3,hurt:7,exclusive:[4,5],model:'',level:2},
        i042 : {id:'i042',name:'三级项链(战)',type:3,hurt:10,exclusive:[0,1],model:'',level:3},
        i043 : {id:'i043',name:'三级项链(法)',type:3,hurt:10,exclusive:[2,3],model:'',level:3},
        i044 : {id:'i044',name:'三级项链(道)',type:3,hurt:10,exclusive:[4,5],model:'',level:3},
        i045 : {id:'i045',name:'一级勋章',type:11,hurt:3,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i046 : {id:'i046',name:'二级勋章',type:11,hurt:6,exclusive:[0,1,2,3,4,5],model:'',level:2},
        i047 : {id:'i047',name:'三级勋章',type:11,hurt:9,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i048 : {id:'i048',name:'一级手镯',type:4,hurt:2,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i049 : {id:'i049',name:'二级手镯(战)',type:4,hurt:4,exclusive:[0,1],model:'',level:2},
        i050 : {id:'i050',name:'二级手镯(法)',type:4,hurt:4,exclusive:[2,3],model:'',level:2},
        i051 : {id:'i051',name:'二级手镯(道)',type:4,hurt:4,exclusive:[4,5],model:'',level:2},
        i052 : {id:'i052',name:'三级手镯(战)',type:4,hurt:6,exclusive:[0,1],model:'',level:3},
        i053 : {id:'i053',name:'三级手镯(法)',type:4,hurt:6,exclusive:[2,3],model:'',level:3},
        i054 : {id:'i054',name:'三级手镯(道)',type:4,hurt:6,exclusive:[4,5],model:'',level:3},
        i055 : {id:'i055',name:'一级腰带',type:7,hurt:2,defense:1,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i056 : {id:'i056',name:'二级腰带',type:7,hurt:4,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:2},
        i057 : {id:'i057',name:'三级腰带',type:7,hurt:6,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i058 : {id:'i058',name:'四级腰带',type:7,hurt:8,defense:4,exclusive:[0,1,2,3,4,5],model:'',level:4},
        i059 : {id:'i059',name:'一级靴',type:8,hurt:2,defense:1,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i060 : {id:'i060',name:'二级靴',type:8,hurt:4,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:2},
        i061 : {id:'i061',name:'三级靴',type:8,hurt:6,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i062 : {id:'i062',name:'四级靴',type:8,hurt:8,defense:4,exclusive:[0,1,2,3,4,5],model:'',level:4},
        i063 : {id:'i063',name:'二级石',type:9,hurt:3,defense:1,exclusive:[0,1,2,3,4,5],model:'',level:2},
        i064 : {id:'i064',name:'三级石',type:9,hurt:6,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i065 : {id:'i065',name:'四级石',type:9,hurt:9,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:4},
        i066 : {id:'i066',name:'一级盾',type:10,hurt:2,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i067 : {id:'i067',name:'二级盾',type:10,hurt:4,defense:4,exclusive:[0,1,2,3,4,5],model:'',level:2},
        i068 : {id:'i068',name:'三级盾',type:10,hurt:6,defense:6,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i069 : {id:'i069',name:'四级盾',type:10,hurt:8,defense:8,exclusive:[0,1,2,3,4,5],model:'',level:4},
    },
};
