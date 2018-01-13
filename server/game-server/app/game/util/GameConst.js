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
                map.collision.push(array[y*map.mapX+x+2]);
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


    //聊天
    chatAll:0,
    chatMap:1,
    chatGuild:2,


    //性别
    sexBoy:0,
    sexGirl:1,

    officeName:['无','风流名士','出类拔萃','一方枭雄','傲视群雄','名扬天下','所向披靡','万夫莫敌','谁与争锋','万众臣服','天下无双'],
    officeProgress:[0,10,50,200,500,1200,2100,3800,9200,15000,32000],
    officeHurt:[0,1,3,5,7,10,15,24,35,55,80],
    officeDefense:[0,1,2,3,5,6,8,10,12,15,20],


    //装备puton编号，>0表示身上
    putonBag:-1,
    putonWharehouse:-2,
    putonGround:-3,




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
            resPad: '000',
            music:'Heart Of Courage.mp3',
            npc:[{name:"新手村接待员",x:32,y:10,title:"安全区域传送:",content:['t16','t1']}],
            mapX: 40,
            mapY: 40,
            safe:{x:29,y:7,xx:31,yy:9},
            refresh: [["m20", -1, -1, 30, 100]]
        },
        t1:{
            id : "t1",
            name: "盟重土城",
            level:35,
            res: 'map/3',
            resPad: '001',
            music:'Victory.mp3',
            npc:[{name:"传送员",x:25,y:33,title:"区域传送:",content:['t17','t0','t2','t5','t11','t18']},
                {name:"装备回收",x:6,y:32,title:"装备回收:",content:['t1000','t1001','t1002','t1003','t1004','t1005']},
                {name:"比奇国王",x:27,y:43,title:"是否加入行会:",content:['t4000','t4001','t4002','t4003','t4004','t4005','t4006']},
                {name:"比奇城市大使",x:18,y:47,title:"比奇路途遥远，确认要去:",content:['t3000']},
                {name:"龙族宝藏",x:12,y:25,title:"200元宝一次:",content:['t5000','t5001']},
                {name:"皇宫",x:46,y:36,title:"危险区域:",content:['t19','t20','t21']},
                {name:"仓库管理",x:24,y:25,title:"有什么宝贝尽管存到我这里吧:",content:['t6000']},
                {name:"苍月使者",x:18,y:25,title:"区域传送:",content:['t9','t10','t8']}],
            mapX: 60,
            mapY: 60,
            safe:{x:7,y:27,xx:26,yy:46},
            refresh: [["m8", 40, 29, 600, 1],["m9", 31, 0, 600, 1]]
        },
        t2:{
            id : "t2",
            name: "BOSS之家一层",
            level:40,
            res: 'map/d5071',
            resPad: '002',
            music:'For The Win.mp3',
            npc:[{name:"传送员",x:7,y:40,title:"传送:",content:['t1']},{name:"传送员",x:41,y:12,title:"传送:",content:['t4','t1']}],
            mapX: 50,
            mapY: 50,
            refresh: [["m4", -1, -1, 60, 5],["m5", -1, -1, 60, 5],["m6", -1, -1, 60, 5],["m7", -1, -1, 60, 5]
                ,["m45", 26, 20, 1800, 1],["m21", -1, -1, 1800, 1],
                ["m30", -1, -1, 1800, 1],["m31", -1, -1, 1800, 1]]
        },
        t3:{
            id : "t3",
            name: "BOSS之家二层",
            level:40,
            res: 'map/d515',
            resPad: '003',
            music:'For The Win.mp3',
            npc:[{name:"传送员",x:29,y:24,title:"传送:",content:['t3','t1']}],
            mapX: 40,
            mapY: 40,
            refresh: [["m6", -1, -1, 60, 2],["m7", -1, -1, 60, 2],["m34", -1, -1, 1800, 1],["m32", -1, -1, 1800, 1]
                ,["m33", -1, -1, 1800, 1],["m46", -1, -1, 1800, 1],["m47", -1, -1, 1800, 1]]
        },
        t4:{
            id : "t4",
            name: "皇家陵墓一层",
            level:48,
            res: 'map/d717',
            resPad: '004',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",x:25,y:24,title:"传送:",content:['t1']},{name:"传送员",x:83,y:74,title:"传送:",content:['t7','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 60, 10],["m5", -1, -1, 60, 10],["m6", -1, -1, 60, 5],["m7", -1, -1, 60, 5]
                ,["m34", -1, -1, 1800, 1],["m32", -1, -1, 1800,1],["m33", -1, -1, 1800, 1],["m46", -1, -1, 1800, 1],["m47", -1, -1, 1800, 1]
                ,["m25", -1, -1, 1800, 1],["m26", -1, -1, 1800, 1]]
        },
        t5:{
            id : "t5",
            name: "皇家陵墓二层",
            level:48,
            res: 'map/dm002',
            resPad: '005',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",x:7,y:9,title:"传送:",content:['t6','t1']}],
            mapX: 32,
            mapY: 38,
            refresh: [["m36", -1, -1, 3600, 1],["m41", -1, -1, 3600, 1],["m43", -1, -1, 3600, 1],["m27", 22, 25, 7200, 1]
                ,["m28", -1, -1, 7200, 1],["m29", -1, -1, 7200, 1]
                ,["m37", -1, -1, 300, 2],["m38", -1, -1, 300, 2],["m39", -1, -1, 300, 2]]
        },
        t6:{
            id : "t6",
            name: "鼠洞",
            level:35,
            res: 'map/d2052',
            resPad: '006',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",x:87,y:32,title:"传送:",content:['t1']},{name:"传送员",x:18,y:18,title:"传送:",content:['t1']},{name:"传送员",x:50,y:75,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 120, 15],["m6", -1, -1, 120, 15],["m6", -1, -1, 120, 5],["m7", -1, -1, 120, 5],["m12", -1, -1, 600, 1],
                ["m10", -1, -1, 600, 1],["m11", -1, -1, 600, 1],["m12", -1, -1, 600, 1],["m13", -1, -1, 600, 1],["m14", -1, -1, 600, 1]
                ,["m15", -1, -1, 600, 1],["m23", 60, 33, 3600, 1],["m48", -1, -1, 7200, 1]]
        },
        t7:{
            id : "t7",
            name: "牛魔洞",
            level:35,
            res: 'map/d2079',
            resPad: '007',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",x:14,y:86,title:"传送:",content:['t1']},{name:"传送员",x:15,y:12,title:"传送:",content:['t1']},{name:"传送员",x:52,y:48,title:"传送:",content:['t1']},{name:"传送员",x:89,y:84,title:"传送:",content:['t1']},{name:"传送员",x:89,y:10,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 120, 20],["m6", -1, -1, 120, 20],["m6", -1, -1, 120, 10],["m7", -1, -1, 120, 10],["m12", -1, -1, 600, 1],
                ["m10", -1, -1, 600, 1],["m11", -1, -1, 600, 1],["m12", -1, -1, 600, 1],["m13", -1, -1, 600, 1],["m14", -1, -1, 600, 1]
                ,["m15", -1, -1, 600, 1],["m24", 49, 50, 3600, 1],["m48", -1, -1, 7200, 1]]
        },
        t8:{
            id : "t8",
            name: "魔窟圣地",
            level:35,
            res: 'map/d2063',
            resPad: '008',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",x:106,y:52,title:"传送:",content:['t1']},{name:"传送员",x:19,y:33,title:"传送:",content:['t1']}],
            mapX: 130,
            mapY: 60,
            refresh: [["m4", -1, -1, 120, 15],["m6", -1, -1, 120, 15],["m6", -1, -1, 120, 5],["m7", -1, -1, 120, 5],["m12", -1, -1, 600, 1],
                ["m10", -1, -1, 600, 1],["m11", -1, -1, 600, 1],["m12", -1, -1, 600, 1],["m13", -1, -1, 600, 1],["m14", -1, -1, 600, 1]
                ,["m15", -1, -1, 600, 1],["m22", 59, 25, 3600, 1],["m48", -1, -1, 7200, 1]]
        },
        t9:{
            id : "t9",
            name: "真天宫一层",
            level:50,
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",x:79,y:21,title:"传送:",content:['t1']},{name:"传送员",x:24,y:74,title:"传送:",content:['t13','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m37", -1, -1, 600, 15],["m38", -1, -1, 600, 15],["m39", -1, -1, 600, 15],["m42", -1, -1, 3600, 1]
                ,["m43", -1, -1, 3600, 1],["m48", -1, -1, 7200, 1]]
        },
        t10:{
            id : "t10",
            name: "真天宫二层",
            level:50,
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",x:79,y:21,title:"传送:",content:['t12','t1']},{name:"传送员",x:24,y:74,title:"传送:",content:['t15','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m37", -1, -1, 600, 15],["m38", -1, -1, 600, 15],["m39", -1, -1, 600, 15],["m40", -1, -1, 3600, 1]
                ,["m41", -1, -1, 3600, 1],["m48", -1, -1, 7200, 1]]
        },
        t11:{
            id : "t11",
            name: "真天宫三层",
            level:50,
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",x:79,y:21,title:"传送:",content:['t14','t1']},{name:"传送员",x:24,y:74,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m37", -1, -1, 600, 15],["m38", -1, -1, 600, 15],["m39", -1, -1, 600, 15],["m35", -1, -1, 3600, 1]
                ,["m36", -1, -1, 3600, 1],["m48", -1, -1, 7200, 1]]
        },
        t12:{
            id : "t12",
            name: "新手村训练基地",
            level:0,
            maxLevel:35,
            res: 'map/d515',
            resPad: '003',
            music:'Heart Of Courage.mp3',
            npc:[{name:"传送员",x:29,y:24,title:"传送:",content:['t0']}],
            mapX: 40,
            mapY: 40,
            refresh: [["m20", -1, -1, 30, 100]]
        },
        t14:{
            id : "t14",
            name: "猪洞",
            level:35,
            res: 'map/d717',
            resPad: '004',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",x:25,y:24,title:"传送:",content:['t1']},{name:"传送员",x:83,y:74,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4", -1, -1, 120, 100],["m5", -1, -1, 120, 20],["m6", -1, -1, 120, 30],["m7", -1, -1, 120, 30]]
        },
        t15:{
            id : "t15",
            name: "火龙洞窟",
            level:50,
            res: 'map/d2083',
            resPad: '010',
            music:'Victory.mp3',
            npc:[{name:"传送员",x:8,y:12,title:"传送:",content:['t1']}
                ,{name:"传送员",x:28,y:26,title:"传送:",content:['t1']}
                ,{name:"传送员",x:34,y:57,title:"传送:",content:['t1']}
                ,{name:"传送员",x:57,y:34,title:"传送:",content:['t1']}],
            mapX: 64,
            mapY: 72,
            refresh: [["m36", -1, -1, 3600, 4],["m41", -1, -1, 3600, 4],["m43", -1, -1, 3600, 4],["m27", 49, 49, 7200, 1]
                ,["m28", -1, -1, 7200, 1],["m29", -1, -1, 7200, 1]
                ,["m37", -1, -1, 300, 6],["m38", -1, -1, 300, 6],["m39", -1, -1, 300, 6]]
        },
        t16:{
            id : "t16",
            name: "皇宫",
            level:35,
            res: 'map/0150',
            resPad: '011',
            music:'Victory.mp3',
            npc:[{name:"国王",x:8,y:15,title:"传送:",content:['t1']}],
            mapX: 23,
            mapY: 27,
            refresh: []
        },
    },


    _transferMst:{
        t0:{id:'t0',name:'新手村',mapId:'t0',x:30,y:8},
        t1:{id:'t1',name:'盟重土城',mapId:'t1',x:21,y:32},
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
        t17:{id:'t17',name:'石墓七层',mapId:'t14',x:26,y:25},
        t18:{id:'t18',name:'火龙洞窟',mapId:'t15',x:10,y:8},
        t19:{id:'t19',name:'皇宫一号点',mapId:'t16',x:10,y:3},
        t20:{id:'t20',name:'皇宫二号点',mapId:'t16',x:16,y:7},
        t21:{id:'t21',name:'皇宫三号点',mapId:'t16',x:19,y:12},
        t1000:{id:'t1000',name:'四级以下回收',levels:[1,2,3,4]},
        t1001:{id:'t1001',name:'五级回收',levels:[5]},
        t1002:{id:'t1002',name:'六级回收',levels:[6]},
        t1003:{id:'t1003',name:'七级回收',levels:[7]},
        t1004:{id:'t1004',name:'八级回收',levels:[8]},
        t1005:{id:'t1005',name:'九级回收',levels:[9]},
        t2000:{id:'t2000',name:'退出门派'},
        t2001:{id:'t2001',name:'青龙堂'},
        t2002:{id:'t2002',name:'白虎堂'},
        t2003:{id:'t2003',name:'朱雀堂'},
        t2004:{id:'t2004',name:'玄武堂'},
        t3000:{id:'t3000',name:'比奇城市'},
        t4000:{id:'t4000',name:'确认'},
        t4001:{id:'t4001',name:'取消'},
        t4002:{id:'t4002',name:'创建行会'},
        t4003:{id:'t4003',name:'删除行会'},
        t4004:{id:'t4004',name:'邀请成员'},
        t4005:{id:'t4005',name:'踢出成员'},
        t4006:{id:'t4006',name:'退出行会'},
        t5000:{id:'t5000',name:'寻宝一次'},
        t5001:{id:'t5001',name:'寻宝五次'},
        t6000:{id:'t6000',name:'仓库管理'},
    },


    _roleMst: {
        m0:{id:"m0",name:"战",hp:19,hpAdd:[15,28,31,34,35],defense:0,defenseAdd:0.2,hurt:3,hurtAdd:0.45,expDead:0,heal:5,healAdd:1,
            moveSpeed:0.4,attackSpeed:0.8,checkDistance:5,visibleDistance:8,attackDistance:0},
        m1:{id:"m1",name:"法",hp:16,hpAdd:[4,7,8,9,9],defense:0,defenseAdd:0.4,hurt:2,hurtAdd:0.5,expDead:0,heal:5,healAdd:1.5,
            moveSpeed:0.4,attackSpeed:1.2,checkDistance:5,visibleDistance:8,attackDistance:5},
        m2:{id:"m2",name:"道",hp:17,hpAdd:[8,17,17,16,20],defense:0,defenseAdd:0.1,hurt:5,hurtAdd:0.45,expDead:0,heal:5,healAdd:1,
            moveSpeed:0.4,attackSpeed:1.2,checkDistance:5,visibleDistance:8,attackDistance:5},
        m3:{id:"m3",name:"甲壳虫",hp:300,defense:2,hurt:30,expDead:30,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"ani/hum16/016",drop:'',dropLevels:[1,5,2,5],lv:2},
        m4:{id:"m4",name:"红野猪",hp:330,defense:2,hurt:30,expDead:33,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum17/017",
            drop:'',dropLevels:[1,2,2,2],lv:2},
        m5:{id:"m5",name:"祖玛羊",hp:385,hpAdd:0,defense:2,hurt:30,expDead:38,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:4,model:"ani/hum18/018",drop:'',dropLevels:[1,2,2,2],lv:2},
        m6:{id:"m6",name:"祖玛卫士",hp:1000,defense:5,hurt:60,expDead:150,heal:0,
            moveSpeed:1.5,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum19/019",drop:'',dropLevels:[3,2],lv:3},
        m7:{id:"m7",name:"白野猪",hp:1500,defense:8,hurt:80,expDead:150,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum20/020",drop:'',dropLevels:[3,2],lv:3},
        m8:{id:"m8",name:"千年树妖",hp:1800,defense:5,hurt:60,expDead:180,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum22/022",drop:'',dropLevels:[3,3],lv:3},
        m9:{id:"m9",name:"万年树妖",hp:8000,defense:5,hurt:90,expDead:800,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum22/022",drop:'',dropLevels:[4,5],lv:4},
        m10:{id:"m10",name:"暗之双头血魔",hp:4000,defense:5,hurt:90,expDead:300,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum23/023",drop:'',dropLevels:[4,3],lv:4},
        m11:{id:"m11",name:"暗之骷髅精灵",hp:4000,defense:5,hurt:90,expDead:300,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum24/024",drop:'',dropLevels:[4,3],lv:4},
        m12:{id:"m12",name:"暗之黄泉教主",hp:4000,defense:5,hurt:90,expDead:300,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum25/025",drop:'',dropLevels:[4,3],lv:4},
        m13:{id:"m13",name:"暗之虹膜教主",hp:4000,defense:5,hurt:90,expDead:300,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum26/026",drop:'',dropLevels:[4,3],lv:4},
        m14:{id:"m14",name:"暗之双头金刚",hp:4000,defense:5,hurt:90,expDead:300,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum27/027",drop:'',dropLevels:[4,3],lv:4},
        m15:{id:"m15",name:"暗之沃玛教主",hp:4000,defense:5,hurt:90,expDead:300,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum28/028",drop:'',dropLevels:[4,5],lv:4},
        m16:{id:"m16",name:"刀卫",hp:5000,defense:5,hurt:90,expDead:500,heal:50,
            moveSpeed:1.5,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum29/029",drop:'',dropLevels:[4,5],lv:4},
        m17:{id:"m17",name:"虎卫",hp:5000,defense:5,hurt:90,expDead:500,heal:50,
            moveSpeed:2,attackSpeed:1.5,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum30/030",drop:'',dropLevels:[4,5],lv:4},
        m18:{id:"m18",name:"鹰卫",hp:5000,defense:5,hurt:90,expDead:500,heal:50,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:4,model:"ani/hum31/031",drop:'',dropLevels:[4,5],lv:4},
        m19:{id:"m19",name:"白虎",hp:2400,hpAdd:0,defense:30,defenseAdd:0,hurt:100,hurtAdd:0,expDead:0,heal:100,healAdd:0,
            moveSpeed:1,attackSpeed:0.7,checkDistance:4,visibleDistance:6,attackDistance:1.5,model:"ani/hum32/032",lv:1},
        m20:{id:"m20",name:"鸡",hp:1,defense:0,hurt:1,expDead:10,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum72/072",drop:'',dropLevels:[1,2],lv:1},
        m21:{id:"m21",name:"幽冥大魔神",hp:8000,defense:10,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum52/052",drop:'',dropLevels:[6,3],lv:6},
        m22:{id:"m22",name:"天界魔王",hp:10000,defense:10,hurt:200,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum53/053",drop:'i001900,9,i001901,6,i001902,3',dropLevels:[7,1],lv:7},
        m23:{id:"m23",name:"鼠王",hp:10000,defense:10,hurt:200,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum54/054",drop:'i001900,9,i001901,6,i001902,3',dropLevels:[7,1],lv:7},
        m24:{id:"m24",name:"牛魔王",hp:10000,defense:10,hurt:200,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum26/026",drop:'i001900,9,i001901,6,i001902,3',dropLevels:[7,1],lv:7},
        m25:{id:"m25",name:"嗜血魔王",hp:8000,defense:10,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum55/055",drop:'i001010,5,i001011,5,i001012,5',dropLevels:[],lv:6},
        m26:{id:"m26",name:"幻灵魔王",hp:8000,defense:10,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum56/056",drop:'i001010,5,i001011,5,i001012,5',dropLevels:[],lv:6},
        m27:{id:"m27",name:"九天神龙",hp:20000,defense:100,hurt:400,expDead:2000,heal:300,
            moveSpeed:1,attackSpeed:1.5,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum57/057",drop:'',dropLevels:[9,1],lv:9},
        m28:{id:"m28",name:"狂龙教主",hp:20000,defense:100,hurt:400,expDead:2000,heal:300,
            moveSpeed:1,attackSpeed:1,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum58/058",drop:'',dropLevels:[9,1],lv:9},
        m29:{id:"m29",name:"狱火魔龙",hp:20000,defense:100,hurt:400,expDead:2000,heal:300,
            moveSpeed:1,attackSpeed:1,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum59/059",drop:'',dropLevels:[9,1],lv:9},
        m30:{id:"m30",name:"幽冥蝇王",hp:8000,defense:10,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum60/060",drop:'',dropLevels:[6,1],lv:6},
        m31:{id:"m31",name:"幽冥流星锤统领",hp:8000,defense:10,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum61/061",drop:'',dropLevels:[6,1],lv:6},
        m32:{id:"m32",name:"幽冥追魂斧王",hp:8000,defense:10,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum62/062",drop:'',dropLevels:[6,1],lv:6},
        m33:{id:"m33",name:"幽冥猪王",hp:8000,defense:10,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum63/063",drop:'',dropLevels:[6,1],lv:6},
        m34:{id:"m34",name:"圣兽之王",hp:8800,defense:10,hurt:200,expDead:880,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum64/064",drop:'i001214,2,i001215,2,i001216,2,i001217,2,i001218,2,i001219,2',dropLevels:[],lv:8},
        m35:{id:"m35",name:"天宫之主",hp:10000,defense:50,hurt:300,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum65/065",drop:'',dropLevels:[8,1],lv:8},
        m36:{id:"m36",name:"神王",hp:15000,defense:20,hurt:300,expDead:1500,heal:200,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum65/065",drop:'i002100,9,i002101,6,i002101,3',dropLevels:[8,1],lv:8},
        m37:{id:"m37",name:"天宫侍卫",hp:2500,defense:10,hurt:100,expDead:250,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum66/066",drop:'',dropLevels:[4,2],lv:4},
        m38:{id:"m38",name:"天宫蜴卫",hp:2500,defense:10,hurt:100,expDead:250,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum67/067",drop:'',dropLevels:[4,2],lv:4},
        m39:{id:"m39",name:"天宫祭师",hp:2500,defense:10,hurt:100,expDead:250,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum68/068",drop:'',dropLevels:[4,2],lv:4},
        m40:{id:"m40",name:"天宫女王",hp:10000,defense:50,hurt:300,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum69/069",drop:'',dropLevels:[8,1],lv:8},
        m41:{id:"m41",name:"舞后",hp:15000,defense:50,hurt:300,expDead:1500,heal:200,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum69/069",drop:'i002100,9,i002101,6,i002101,3',dropLevels:[8,1],lv:8},
        m42:{id:"m42",name:"天宫大神官",hp:10000,defense:50,hurt:300,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum70/070",drop:'',dropLevels:[8,1],lv:8},
        m43:{id:"m43",name:"招魂王",hp:15000,defense:50,hurt:300,expDead:1500,heal:200,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum70/070",drop:'i002100,9,i002101,6,i002101,3',dropLevels:[8,1],lv:8},
        m44:{id:"m44",name:"驽马法老",hp:6000,defense:10,hurt:200,expDead:600,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum71/071",drop:'i001700,9,i001701,6,i001702,3,i001800,9,i001801,6,i001802,3,i002000,9,i002001,6,i002002,3',dropLevels:[],lv:9},
        m45:{id:"m45",name:"爱情鸟",hp:9000,defense:10,hurt:100,expDead:900,heal:50,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum72/072",drop:'',dropLevels:[5,5],lv:5},
        m46:{id:"m46",name:"蚁王",hp:8000,defense:20,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum73/073",drop:'',dropLevels:[6,1],lv:6},
        m47:{id:"m47",name:"蚁后",hp:8000,defense:20,hurt:200,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum74/074",drop:'',dropLevels:[6,1],lv:6},
        m48:{id:"m48",name:"玉皇大帝",hp:30000,defense:100,hurt:500,expDead:2000,heal:500,
            moveSpeed:0.8,attackSpeed:0.8,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum10/010",drop:'',dropLevels:[9,2],lv:9},
    },


    //exclusive 专属,0-5分别为男战,女战,男法,女法,男道,女道
    _itemMst:{
        i001000 : {id:'i001000',name:'铁剑',type:0,hurt:8,exclusive:[0,1,2,3,4,5],model:'ani/hum36/036',level:1},
        i001001 : {id:'i001001',name:'裁决之杖',type:0,hurt:20,exclusive:[0,1],model:'ani/hum37/037',level:2},
        i001002 : {id:'i001002',name:'骨玉权杖',type:0,hurt:20,exclusive:[2,3],model:'ani/hum38/038',level:2},
        i001003 : {id:'i001003',name:'龙纹之剑',type:0,hurt:20,exclusive:[4,5],model:'ani/hum39/039',level:2},
        i001004 : {id:'i001004',name:'屠龙',type:0,hurt:30,exclusive:[0,1],model:'ani/hum76/076',level:3},
        i001005 : {id:'i001005',name:'绿玉屠龙',type:0,hurt:40,exclusive:[0,1],model:'ani/hum76/076',level:4},
        i001006 : {id:'i001006',name:'爱情之刃',type:0,hurt:45,exclusive:[0,1,2,3,4,5],model:'ani/hum84/084',level:5},

        i001007 : {id:'i001007',name:'黄金龙刃',type:0,hurt:50,exclusive:[0,1],model:'ani/hum78/078',level:6},
        i001008 : {id:'i001008',name:'黄金法杖',type:0,hurt:50,exclusive:[2,3],model:'ani/hum81/081',level:6},
        i001009 : {id:'i001009',name:'黄金天机棍',type:0,hurt:50,exclusive:[4,5],model:'ani/hum75/075',level:6},

        i001010 : {id:'i001010',name:'玄铁斩',type:0,hurt:55,exclusive:[0,1],model:'ani/hum80/080',level:6},
        i001011 : {id:'i001011',name:'断浪',type:0,hurt:55,exclusive:[2,3],model:'ani/hum85/085',level:6},
        i001012 : {id:'i001012',name:'灵蛇鞭',type:0,hurt:55,exclusive:[4,5],model:'ani/hum82/082',level:6},

        i001013 : {id:'i001013',name:'绿魄剑',type:0,hurt:60,exclusive:[0,1],model:'ani/hum86/086',level:7},
        i001014 : {id:'i001014',name:'烈焰魔剑',type:0,hurt:60,exclusive:[2,3],model:'ani/hum77/077',level:7},
        i001015 : {id:'i001015',name:'蓝灵降魔刃',type:0,hurt:60,exclusive:[4,5],model:'ani/hum78/078',level:7},

        i001016 : {id:'i001016',name:'斩妖泣血',type:0,hurt:65,exclusive:[0,1],model:'ani/hum40/040',level:8},
        i001017 : {id:'i001017',name:'冰风雷焱',type:0,hurt:65,exclusive:[2,3],model:'ani/hum79/079',level:8},
        i001018 : {id:'i001018',name:'碧海狂灵',type:0,hurt:65,exclusive:[4,5],model:'ani/hum83/083',level:8},

        i001019 : {id:'i001019',name:'残月狂刀',type:0,hurt:70,exclusive:[0,1],model:'ani/hum89/089',level:9},
        i001020 : {id:'i001020',name:'金雨魔刀',type:0,hurt:70,exclusive:[2,3],model:'ani/hum87/087',level:9},
        i001021 : {id:'i001021',name:'倚天金剑',type:0,hurt:70,exclusive:[4,5],model:'ani/hum88/088',level:9},

        i001100 : {id:'i001100',name:'道士头盔',type:1,defense:4,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i001101 : {id:'i001101',name:'圣战头盔',type:1,hurt:1,defense:5,exclusive:[0,1],model:'',level:3},
        i001102 : {id:'i001102',name:'法神头盔',type:1,hurt:1,defense:5,exclusive:[2,3],model:'',level:3},
        i001103 : {id:'i001103',name:'天尊头盔',type:1,hurt:1,defense:5,exclusive:[4,5],model:'',level:3},
        i001104 : {id:'i001104',name:'宙神头盔',type:1,hurt:2,defense:6,exclusive:[0,1],model:'',level:4},
        i001105 : {id:'i001105',name:'勇士头盔',type:1,hurt:2,defense:6,exclusive:[2,3],model:'',level:4},
        i001106 : {id:'i001106',name:'道域头盔',type:1,hurt:2,defense:6,exclusive:[4,5],model:'',level:4},
        i001107 : {id:'i001107',name:'黄金圣盔',type:1,hurt:4,defense:8,exclusive:[0,1],model:'',level:6},
        i001108 : {id:'i001108',name:'黄金魔盔',type:1,hurt:4,defense:8,exclusive:[2,3],model:'',level:6},
        i001109 : {id:'i001109',name:'黄金道盔',type:1,hurt:4,defense:8,exclusive:[4,5],model:'',level:6},
        i001110 : {id:'i001110',name:'绿魄盔',type:1,hurt:5,defense:9,exclusive:[0,1],model:'',level:7},
        i001111 : {id:'i001111',name:'烈焰盔',type:1,hurt:5,defense:9,exclusive:[2,3],model:'',level:7},
        i001112 : {id:'i001112',name:'蓝灵盔',type:1,hurt:5,defense:9,exclusive:[4,5],model:'',level:7},
        i001113 : {id:'i001113',name:'武神之盔',type:1,hurt:6,defense:10,exclusive:[0,1],model:'',level:8},
        i001114 : {id:'i001114',name:'月舞仙盔',type:1,hurt:6,defense:10,exclusive:[2,3],model:'',level:8},
        i001115 : {id:'i001115',name:'招魂道冠',type:1,hurt:6,defense:10,exclusive:[4,5],model:'',level:8},
        i001116 : {id:'i001116',name:'狂龙盔',type:1,hurt:7,defense:11,exclusive:[0,1],model:'',level:9},
        i001117 : {id:'i001117',name:'魔龙盔',type:1,hurt:7,defense:11,exclusive:[2,3],model:'',level:9},
        i001118 : {id:'i001118',name:'神龙盔',type:1,hurt:7,defense:11,exclusive:[4,5],model:'',level:9},

        i001200 : {id:'i001200',name:'布衣(男)',type:2,defense:1,exclusive:[0,2,4],model:'ani/hum2/002',level:1},
        i001201 : {id:'i001201',name:'布衣(女)',type:2,defense:1,exclusive:[1,3,5],model:'ani/hum3/003',level:1},
        i001202 : {id:'i001202',name:'重盔甲(男)',type:2,hurt:2,defense:7,exclusive:[0],model:'ani/hum4/004',level:2},
        i001203 : {id:'i001203',name:'重盔甲(女)',type:2,hurt:2,defense:7,exclusive:[1],model:'ani/hum5/005',level:2},
        i001204 : {id:'i001204',name:'魔法长袍(男)',type:2,hurt:2,defense:7,exclusive:[2],model:'ani/hum6/006',level:2},
        i001205 : {id:'i001205',name:'魔法长袍(女)',type:2,hurt:2,defense:7,exclusive:[3],model:'ani/hum7/007',level:2},
        i001206 : {id:'i001206',name:'灵魂道袍(男)',type:2,hurt:2,defense:7,exclusive:[4],model:'ani/hum8/008',level:2},
        i001207 : {id:'i001207',name:'灵魂道袍(女)',type:2,hurt:2,defense:7,exclusive:[5],model:'ani/hum9/009',level:2},
        i001208 : {id:'i001208',name:'白虎战甲(男)',type:2,hurt:4,defense:13,exclusive:[0],model:'ani/hum10/010',level:3},
        i001209 : {id:'i001209',name:'白虎战甲(女)',type:2,hurt:4,defense:13,exclusive:[1],model:'ani/hum11/011',level:3},
        i001210 : {id:'i001210',name:'朱雀魔袍(男)',type:2,hurt:4,defense:13,exclusive:[2],model:'ani/hum12/012',level:3},
        i001211 : {id:'i001211',name:'朱雀魔袍(女)',type:2,hurt:4,defense:13,exclusive:[3],model:'ani/hum13/013',level:3},
        i001212 : {id:'i001212',name:'青龙道衣(男)',type:2,hurt:4,defense:13,exclusive:[4],model:'ani/hum14/014',level:3},
        i001213 : {id:'i001213',name:'青龙道衣(女)',type:2,hurt:4,defense:13,exclusive:[5],model:'ani/hum15/015',level:3},
        i001214 : {id:'i001214',name:'鹰扬战袍',type:2,hurt:5,defense:13,exclusive:[0,2,4],model:'ani/hum44/044',level:4},
        i001215 : {id:'i001215',name:'凤舞九天',type:2,hurt:5,defense:13,exclusive:[1,3,5],model:'ani/hum45/045',level:4},
        i001216 : {id:'i001216',name:'黄金鹰扬',type:2,hurt:7,defense:13,exclusive:[0,2,4],model:'ani/hum46/046',level:6},
        i001217 : {id:'i001217',name:'黄金凤舞',type:2,hurt:7,defense:13,exclusive:[1,3,5],model:'ani/hum47/047',level:6},
        i001218 : {id:'i001218',name:'噬血鹰扬',type:2,hurt:9,defense:13,exclusive:[0,2,4],model:'ani/hum48/048',level:8},
        i001219 : {id:'i001219',name:'噬血凤舞',type:2,hurt:9,defense:13,exclusive:[1,3,5],model:'ani/hum49/049',level:8},
        i001220 : {id:'i001220',name:'金龙圣甲(男)',type:2,hurt:10,defense:20,exclusive:[0,2,4],model:'ani/hum50/050',level:9},
        i001221 : {id:'i001221',name:'金龙圣甲(女)',type:2,hurt:10,defense:20,exclusive:[1,3,5],model:'ani/hum51/051',level:9},

        i001300 : {id:'i001300',name:'蓝色翡翠项链',type:3,hurt:3,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i001301 : {id:'i001301',name:'绿色项链',type:3,hurt:6,exclusive:[0,1],model:'',level:2},
        i001302 : {id:'i001302',name:'恶魔铃铛',type:3,hurt:6,exclusive:[2,3],model:'',level:2},
        i001303 : {id:'i001303',name:'灵魂项链',type:3,hurt:6,exclusive:[4,5],model:'',level:2},
        i001304 : {id:'i001304',name:'圣战项链',type:3,hurt:9,exclusive:[0,1],model:'',level:3},
        i001305 : {id:'i001305',name:'法神项链',type:3,hurt:9,exclusive:[2,3],model:'',level:3},
        i001306 : {id:'i001306',name:'天尊项链',type:3,hurt:9,exclusive:[4,5],model:'',level:3},
        i001307 : {id:'i001307',name:'铜域项链',type:3,hurt:12,exclusive:[0,1],model:'',level:4},
        i001308 : {id:'i001308',name:'水域项链',type:3,hurt:12,exclusive:[2,3],model:'',level:4},
        i001309 : {id:'i001309',name:'土域项链',type:3,hurt:12,exclusive:[4,5],model:'',level:4},
        i001310 : {id:'i001310',name:'爱情项链',type:3,hurt:15,exclusive:[0,1,2,3,4,5],model:'',level:5},
        i001311 : {id:'i001311',name:'黄金勋章',type:3,hurt:18,exclusive:[0,1],model:'',level:6},
        i001312 : {id:'i001312',name:'黄金魔星',type:3,hurt:18,exclusive:[2,3],model:'',level:6},
        i001313 : {id:'i001313',name:'黄金灵坠',type:3,hurt:18,exclusive:[4,5],model:'',level:6},
        i001314 : {id:'i001314',name:'绿魄链',type:3,hurt:21,exclusive:[0,1],model:'',level:7},
        i001315 : {id:'i001315',name:'烈焰链',type:3,hurt:21,exclusive:[2,3],model:'',level:7},
        i001316 : {id:'i001316',name:'蓝灵坠',type:3,hurt:21,exclusive:[4,5],model:'',level:7},
        i001317 : {id:'i001317',name:'武神链',type:3,hurt:24,exclusive:[0,1],model:'',level:8},
        i001318 : {id:'i001318',name:'月舞链',type:3,hurt:24,exclusive:[2,3],model:'',level:8},
        i001319 : {id:'i001319',name:'招魂灵',type:3,hurt:24,exclusive:[4,5],model:'',level:8},
        i001320 : {id:'i001320',name:'狂龙项链',type:3,hurt:27,exclusive:[0,1],model:'',level:9},
        i001321 : {id:'i001321',name:'魔龙项链',type:3,hurt:27,exclusive:[2,3],model:'',level:9},
        i001322 : {id:'i001322',name:'神龙项链',type:3,hurt:27,exclusive:[4,5],model:'',level:9},

        i001400 : {id:'i001400',name:'金手镯',type:4,hurt:2,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i001401 : {id:'i001401',name:'骑士手镯',type:4,hurt:4,exclusive:[0,1],model:'',level:2},
        i001402 : {id:'i001402',name:'龙之手镯',type:4,hurt:4,exclusive:[2,3],model:'',level:2},
        i001403 : {id:'i001403',name:'三眼手镯',type:4,hurt:4,exclusive:[4,5],model:'',level:2},
        i001404 : {id:'i001404',name:'圣战手镯',type:4,hurt:6,exclusive:[0,1],model:'',level:3},
        i001405 : {id:'i001405',name:'法神手镯',type:4,hurt:6,exclusive:[2,3],model:'',level:3},
        i001406 : {id:'i001406',name:'天尊手镯',type:4,hurt:6,exclusive:[4,5],model:'',level:3},
        i001407 : {id:'i001407',name:'铜域手镯',type:4,hurt:8,exclusive:[0,1],model:'',level:4},
        i001408 : {id:'i001408',name:'水域手镯',type:4,hurt:8,exclusive:[2,3],model:'',level:4},
        i001409 : {id:'i001409',name:'土域手镯',type:4,hurt:8,exclusive:[4,5],model:'',level:4},
        i001410 : {id:'i001410',name:'爱情手镯',type:4,hurt:10,exclusive:[0,1,2,3,4,5],model:'',level:5},
        i001411 : {id:'i001411',name:'黄金护手',type:4,hurt:12,exclusive:[0,1],model:'',level:6},
        i001412 : {id:'i001412',name:'黄金法镯',type:4,hurt:12,exclusive:[2,3],model:'',level:6},
        i001413 : {id:'i001413',name:'黄金灵镯',type:4,hurt:12,exclusive:[4,5],model:'',level:6},
        i001414 : {id:'i001414',name:'绿魄手镯',type:4,hurt:14,exclusive:[0,1],model:'',level:7},
        i001415 : {id:'i001415',name:'烈焰手镯',type:4,hurt:14,exclusive:[2,3],model:'',level:7},
        i001416 : {id:'i001416',name:'蓝灵手镯',type:4,hurt:14,exclusive:[4,5],model:'',level:7},
        i001417 : {id:'i001417',name:'武神之手',type:4,hurt:16,exclusive:[0,1],model:'',level:8},
        i001418 : {id:'i001418',name:'月舞手套',type:4,hurt:16,exclusive:[2,3],model:'',level:8},
        i001419 : {id:'i001419',name:'招魂护腕',type:4,hurt:16,exclusive:[4,5],model:'',level:8},
        i001420 : {id:'i001420',name:'狂龙手镯',type:4,hurt:18,exclusive:[0,1],model:'',level:9},
        i001421 : {id:'i001421',name:'魔龙手镯',type:4,hurt:18,exclusive:[2,3],model:'',level:9},
        i001422 : {id:'i001422',name:'神龙手镯',type:4,hurt:18,exclusive:[4,5],model:'',level:9},

        i001500 : {id:'i001500',name:'降魔除妖戒指',type:5,hurt:2,exclusive:[0,1,2,3,4,5],model:'',level:1},
        i001501 : {id:'i001501',name:'力量戒指',type:5,hurt:4,exclusive:[0,1],model:'',level:2},
        i001502 : {id:'i001502',name:'紫碧螺',type:5,hurt:4,exclusive:[2,3],model:'',level:2},
        i001503 : {id:'i001503',name:'泰坦戒指',type:5,hurt:4,exclusive:[4,5],model:'',level:2},
        i001504 : {id:'i001504',name:'圣战戒指',type:5,hurt:6,exclusive:[0,1],model:'',level:3},
        i001505 : {id:'i001505',name:'法神戒指',type:5,hurt:6,exclusive:[2,3],model:'',level:3},
        i001506 : {id:'i001506',name:'天尊戒指',type:5,hurt:6,exclusive:[4,5],model:'',level:3},
        i001507 : {id:'i001507',name:'铜域戒指',type:5,hurt:8,exclusive:[0,1],model:'',level:4},
        i001508 : {id:'i001508',name:'水域戒指',type:5,hurt:8,exclusive:[2,3],model:'',level:4},
        i001509 : {id:'i001509',name:'土域戒指',type:5,hurt:8,exclusive:[4,5],model:'',level:4},
        i001510 : {id:'i001510',name:'爱情戒指',type:5,hurt:10,exclusive:[0,1,2,3,4,5],model:'',level:5},
        i001511 : {id:'i001511',name:'黄金圣戒',type:5,hurt:12,exclusive:[0,1],model:'',level:6},
        i001512 : {id:'i001512',name:'黄金魔戒',type:5,hurt:12,exclusive:[2,3],model:'',level:6},
        i001513 : {id:'i001513',name:'黄金玉戒',type:5,hurt:12,exclusive:[4,5],model:'',level:6},
        i001514 : {id:'i001514',name:'绿魄戒指',type:5,hurt:14,exclusive:[0,1],model:'',level:7},
        i001515 : {id:'i001515',name:'烈焰戒指',type:5,hurt:14,exclusive:[2,3],model:'',level:7},
        i001516 : {id:'i001516',name:'蓝灵戒指',type:5,hurt:14,exclusive:[4,5],model:'',level:7},
        i001517 : {id:'i001517',name:'武神战戒',type:5,hurt:16,exclusive:[0,1],model:'',level:8},
        i001518 : {id:'i001518',name:'月舞戒指',type:5,hurt:16,exclusive:[2,3],model:'',level:8},
        i001519 : {id:'i001519',name:'招魂戒指',type:5,hurt:16,exclusive:[4,5],model:'',level:8},
        i001520 : {id:'i001520',name:'狂龙戒指',type:5,hurt:18,exclusive:[0,1],model:'',level:9},
        i001521 : {id:'i001521',name:'魔龙戒指',type:5,hurt:18,exclusive:[2,3],model:'',level:9},
        i001522 : {id:'i001522',name:'神龙戒指',type:5,hurt:18,exclusive:[4,5],model:'',level:9},

        i001700 : {id:'i001700',name:'一级腰带',type:7,hurt:1,defense:1,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i001701 : {id:'i001701',name:'二级腰带',type:7,hurt:2,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:6},
        i001702 : {id:'i001702',name:'三级腰带',type:7,hurt:3,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i001800 : {id:'i001800',name:'一级靴',type:8,hurt:1,defense:1,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i001801 : {id:'i001801',name:'二级靴',type:8,hurt:2,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:6},
        i001802 : {id:'i001802',name:'三级靴',type:8,hurt:3,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i001900 : {id:'i001900',name:'一级石',type:9,hurt:1,defense:1,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i001901 : {id:'i001901',name:'二级石',type:9,hurt:2,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:6},
        i001902 : {id:'i001902',name:'三级石',type:9,hurt:3,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i002000 : {id:'i002000',name:'一级盾',type:10,hurt:1,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i002001 : {id:'i002001',name:'二级盾',type:10,hurt:2,defense:6,exclusive:[0,1,2,3,4,5],model:'',level:6},
        i002002 : {id:'i002002',name:'三级盾',type:10,hurt:3,defense:9,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i002100 : {id:'i002100',name:'一级勋章',type:11,hurt:3,exclusive:[0,1,2,3,4,5],model:'',level:3},
        i002101 : {id:'i002101',name:'二级勋章',type:11,hurt:6,exclusive:[0,1,2,3,4,5],model:'',level:6},
        i002102 : {id:'i002102',name:'三级勋章',type:11,hurt:9,exclusive:[0,1,2,3,4,5],model:'',level:9},
    },
};