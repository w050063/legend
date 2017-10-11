/**
 * Created by bot.su on 2017/6/21.
 * 游戏常量相关
 */


module.exports = {


    //阵营类型
    campMonster:0,
    campLiuxing:1,
    campHudie:2,
    campNpc:3,


    stateIdle : 0,
    stateMove :1,
    stateAttack : 2,
    stateDead : 3,


    //性别
    sexBoy:0,
    sexGirl:1,


    //显示的数据方便策划，init做转换。
    init:function(){
        for(var key in this._terrainMap){
            var map = this._terrainMap[key];
            var array = map.collision.split(";");
            map.collision = [];
            for(var i=0;i<array.length;++i){
                var array2 = array[i].split(",");
                map.collision.push([parseInt(array2[0]),parseInt(array2[1])]);
            }
        }
    },


    //网络相关编码
    netOK: 200,
    netFAIL: 500,

    bagLength:10,


    //出生相关,_bornR怪物和角色通用
    _bornMap:"t0",


    itemDuration:20,

    //八个方向顺序
    directionStringArray:['0,1','1,1','1,0','1,-1','0,-1','-1,-1','-1,0','-1,1'],
    directionArray:[{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1}],

    searchEnemypath:[[0,0],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],
        [0,2],[1,2],[2,2],[2,1],[2,0],[2,-1],[2,-2],[1,-2],[0,-2],[-1,-2],[-2,-2],[-2,-1],[-2,0],[-2,1],[-2,2],[-1,2],
        [0,3],[1,3],[2,3],[3,3],[3,2],[3,1],[3,0],[3,-1],[3,-2],[3,-3],[2,-3],[1,-3],[0,-3],[-1,-3],[-2,-3],[-3,-3],[-3,-2],[-3,-1],[-3,0],[-3,1],[-3,2],[-3,3],[-2,3],[-1,3],
        [0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[4,2],[4,1],[4,0],[4,-1],[4,-2],[4,-3],[4,-4],[3,-4],[2,-4],[1,-4],[0,-4],[-1,-4],[-2,-4],[-3,-4],[-4,-4],[-4,-3],[-4,-2],[-4,-1],[-4,0],[-4,1],[-4,2],[-4,3],[-4,4],[-3,4],[-2,4],[-1,4],
        [0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[5,4],[5,3],[5,2],[5,1],[5,0],[5,-1],[5,-2],[5,-3],[5,-4],[5,-5],[4,-5],[3,-5],[2,-5],[1,-5],[0,-5],[-1,-5],[-2,-5],[-3,-5],[-4,-5],[-4,-5],[-5,-5],[-5,-4],[-5,-3],[-5,-2],[-5,-1],[-5,0],[-5,1],[-5,2],[-5,3],[-5,4],[-5,5],[-4,5],[-3,5],[-2,5],[-1,5]],


    //地图详细信息,refresh怪物相关刷新，坐标-1表示全地图随机刷--hero type,x,y,aliquot time,max count.
    _terrainMap: {
        t0:{
            id : "t0",
            name: "新手村",
            res: 'map/mapgrass',
            npc:[{name:"新手村接待员",x:17,y:12,title:"安全区域传送:",content:["土城"]}],
            tileX: 100,
            tileY: 60,
            mapX: 30,
            mapY: 28,
            born: {x:15,y:14},
            collision:"",
            //collision: "9,12;9,13;9,14;9,15;9,16;9,17;9,18;9,19;9,20;" +
            //"10,12;10,13;10,14;10,15;10,16;10,17;10,18;10,19;10,20;" +
            //"11,12;11,13;11,14;11,15;11,16;11,17;11,18;11,19;11,20;" +
            //"12,12;12,13;12,14;12,15;12,16;12,17;12,18;12,19;12,20;" +
            //"13,12;13,13;13,14;13,15;13,16;13,17;13,18;13,19;13,20;" +
            //"14,12;14,13;14,14;14,15;14,16;14,17;14,18;14,19;14,20;" +
            //"15,12;15,13;15,14;15,15;15,16;15,17;15,18;15,19;15,20",
            refresh: [["m3", -1, -1, 60, 15],["m4", -1, -1, 60, 15]]
        },
        t1:{
            id : "t1",
            name: "土城",
            res: 'map/mapsand',
            npc:[{name:"传送员",x:17,y:12,title:"区域传送:",content:["新手村",'BOSS之家']},
                {name:"装备回收",x:14,y:12,title:"装备回收:",content:["一级回收","二级回收","三级回收"]}],
            tileX: 100,
            tileY: 60,
            mapX: 30,
            mapY: 28,
            born: {x:15,y:14},
            collision:"",
            refresh: [["m5", -1, -1, 60, 15],["m6", -1, -1, 60, 5],["m7", -1, -1, 60, 5],["m9", -1, -1, 60, 3]]
        },
        t2:{
            id : "t2",
            name: "BOSS之家",
            res: 'map/mapdirt',
            npc:[{name:"传送员",x:10,y:6,title:"区域传送:",content:["土城"]}],
            tileX: 100,
            tileY: 60,
            mapX: 16,
            mapY: 16,
            born: {x:8,y:8},
            collision:"",
            refresh: [["m10", -1, -1, 60, 1],["m11", -1, -1, 60, 1],["m12", -1, -1, 60, 1],["m13", -1, -1, 60, 1],["m14", -1, -1, 60, 1],
                ["m15", -1, -1, 60, 1],["m16", -1, -1, 90, 1],["m17", -1, -1, 90, 1],["m18", -1, -1, 90, 1]]
        }},



    _roleMst: {
        m0:{id:"m0",name:"战士",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,
            moveSpeed:0.7,attackSpeed:0.8,checkDistance:3,visibleDistance:7,attackDistance:0},
        m1:{id:"m1",name:"法师",hp:220,hpAdd:20,defense:50,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:3,
            moveSpeed:0.7,attackSpeed:1.2,checkDistance:3,visibleDistance:7,attackDistance:5},
        m2:{id:"m2",name:"道士",hp:400,hpAdd:20,defense:5,defenseAdd:1,hurt:100,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:5,
            moveSpeed:0.7,attackSpeed:1.2,checkDistance:3,visibleDistance:7,attackDistance:5},
        m3:{id:"m3",name:"甲壳虫",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"beetle",drop:'i000,30,i001,30,i019,30',lv:1},
        m4:{id:"m4",name:"红野猪",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"redboar",drop:'i014,30,i026,30',lv:1},
        m5:{id:"m5",name:"祖玛羊",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:4,model:"zumasheep",drop:'i020,20,i021,20,i022,20',lv:1},
        m6:{id:"m6",name:"祖玛卫士",hp:1000,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:10,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"zumabodyguard",drop:'i027,20,i028,20,i029,20',lv:2},
        m7:{id:"m7",name:"白野猪",hp:1000,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:10,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"whiteboar",drop:'i002,20,i003,20,i004,20,i005,20,i006,20,i007,20',lv:2},
        m9:{id:"m9",name:"千年树妖",hp:2000,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:20,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:5,attackDistance:5,model:"treedemon",drop:'i015,50,i016,50,i017,50',lv:2},
        m10:{id:"m10",name:"双头血魔",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossone",drop:'i008,50',lv:3},
        m11:{id:"m11",name:"骷髅精灵",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbosstwo",drop:'i009,50',lv:3},
        m12:{id:"m12",name:"黄泉教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossthree",drop:'i010,50',lv:3},
        m13:{id:"m13",name:"虹膜教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossfour",drop:'i011,50',lv:3},
        m14:{id:"m14",name:"双头金刚",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossfive",drop:'i012,50',lv:3},
        m15:{id:"m15",name:"沃玛教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbosssix",drop:'i013,50',lv:3},
        m16:{id:"m16",name:"刀卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:1,attackSpeed:1,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"protectorone",drop:'i018,100',lv:3},
        m17:{id:"m17",name:"虎卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"protectortwo",drop:'i023,20,i024,20,i025,20,i030,20,i031,20,i032,20',lv:3},
        m18:{id:"m18",name:"鹰卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:4,model:"protectorthree",drop:'i033,30,i034,30,i035,30',lv:3},
    },


    //exclusive 专属,0-5分别为男战,女战,男法,女法,男道,女道
    _itemMst:{
        i000 : {id:'i000',name:'一级甲(男)',type:1,defense:1,exclusive:[0,2,4],model:'ani/hum1/002'},
        i001 : {id:'i001',name:'一级甲(女)',type:1,defense:1,exclusive:[1,3,5],model:'ani/hum1/003'},
        i002 : {id:'i002',name:'二级甲(男战)',type:1,defense:3,exclusive:[0],model:'ani/hum2/004'},
        i003 : {id:'i003',name:'二级甲(女战)',type:1,defense:3,exclusive:[1],model:'ani/hum2/005'},
        i004 : {id:'i004',name:'二级甲(男法)',type:1,defense:2,exclusive:[2],model:'ani/hum2/006'},
        i005 : {id:'i005',name:'二级甲(女法)',type:1,defense:2,exclusive:[3],model:'ani/hum2/007'},
        i006 : {id:'i006',name:'二级甲(男道)',type:1,defense:2,exclusive:[4],model:'ani/hum3/008'},
        i007 : {id:'i007',name:'二级甲(女道)',type:1,defense:2,exclusive:[5],model:'ani/hum3/009'},
        i008 : {id:'i008',name:'三级甲(男战)',type:1,hurt:5,defense:7,exclusive:[0],model:'ani/hum3/010'},
        i009 : {id:'i009',name:'三级甲(女战)',type:1,hurt:5,defense:7,exclusive:[1],model:'ani/hum3/011'},
        i010 : {id:'i010',name:'三级甲(男法)',type:1,hurt:7,defense:6,exclusive:[2],model:'ani/hum4/012'},
        i011 : {id:'i011',name:'三级甲(女法)',type:1,hurt:7,defense:6,exclusive:[3],model:'ani/hum4/013'},
        i012 : {id:'i012',name:'三级甲(男道)',type:1,hurt:9,defense:5,exclusive:[4],model:'ani/hum4/014'},
        i013 : {id:'i013',name:'三级甲(女道)',type:1,hurt:9,defense:5,exclusive:[5],model:'ani/hum4/015'},
        i014 : {id:'i014',name:'一级铁剑',type:0,hurt:20,exclusive:[0,1,2,3,4,5],model:'ani/hum17/036'},
        i015 : {id:'i015',name:'二级裁决',type:0,hurt:30,exclusive:[0,1],model:'ani/hum17/037'},
        i016 : {id:'i016',name:'二级骨玉',type:0,hurt:30,exclusive:[2,3],model:'ani/hum17/038'},
        i017 : {id:'i017',name:'二级龙纹',type:0,hurt:30,exclusive:[4,5],model:'ani/hum17/039'},
        i018 : {id:'i018',name:'三级圣剑',type:0,hurt:40,exclusive:[0,1,2,3,4,5],model:'ani/hum17/040'},
        i019 : {id:'i019',name:'一级头',type:4,defense:1,exclusive:[0,1,2,3,4,5],model:'hum17'},
        i020 : {id:'i020',name:'二级头(战)',type:4,defense:3,exclusive:[0,1],model:'hum17'},
        i021 : {id:'i021',name:'二级头(法)',type:4,defense:2,exclusive:[2,3],model:'hum17'},
        i022 : {id:'i022',name:'二级头(道)',type:4,defense:2,exclusive:[4,5],model:'hum17'},
        i023 : {id:'i023',name:'三级头(战)',type:4,defense:5,exclusive:[0,1],model:'hum17'},
        i024 : {id:'i024',name:'三级头(法)',type:4,defense:4,exclusive:[2,3],model:'hum17'},
        i025 : {id:'i025',name:'三级头(道)',type:4,defense:4,exclusive:[4,5],model:'hum17'},
        i026 : {id:'i026',name:'一级戒',type:3,hurt:1,exclusive:[0,1,2,3,4,5],model:'hum17'},
        i027 : {id:'i027',name:'二级戒(战)',type:3,hurt:3,exclusive:[0,1],model:'hum17'},
        i028 : {id:'i028',name:'二级戒(法)',type:3,hurt:2,exclusive:[2,3],model:'hum17'},
        i029 : {id:'i029',name:'二级戒(道)',type:3,hurt:2,exclusive:[4,5],model:'hum17'},
        i030 : {id:'i030',name:'三级戒(战)',type:3,hurt:5,exclusive:[0,1],model:'hum17'},
        i031 : {id:'i031',name:'三级戒(法)',type:3,hurt:4,exclusive:[2,3],model:'hum17'},
        i032 : {id:'i032',name:'三级戒(道)',type:3,hurt:4,exclusive:[4,5],model:'hum17'},
        i033 : {id:'i033',name:'羽翼(战)',type:2,hurt:10,defense:10,exclusive:[0,1],model:'ani/hum16/033'},
        i034 : {id:'i034',name:'羽翼(法)',type:2,hurt:10,defense:10,exclusive:[2,3],model:'ani/hum16/034'},
        i035 : {id:'i035',name:'羽翼(道)',type:2,hurt:10,defense:10,exclusive:[4,5],model:'ani/hum17/035'},
    },
};
