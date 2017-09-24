/**
 * Created by bot.su on 2017/6/21.
 * 游戏常量相关
 */


module.exports = {


    //阵营类型
    campMonster:0,
    campLiuxing:1,
    campHudie:2,


    stateIdle : 0,
    stateMove :1,
    stateAttack : 2,
    stateDead : 3,




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
    _bornX:1,
    _bornY:1,
    _bornR:4,


    //八个方向顺序
    directionStringArray:['0,1','1,1','1,0','1,-1','0,-1','-1,-1','-1,0','-1,1'],
    directionArray:[{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1}],


    //地图详细信息,refresh怪物相关刷新，坐标-1表示全地图随机刷--hero type,x,y,aliquot time,max count.
    _terrainMap: {
        t0:{
            id : "t0",
            name: "mafa",
            tileX: 100,
            tileY: 60,
            mapX: 30,
            mapY: 30,
            collision:"",
            //collision: "9,12;9,13;9,14;9,15;9,16;9,17;9,18;9,19;9,20;" +
            //"10,12;10,13;10,14;10,15;10,16;10,17;10,18;10,19;10,20;" +
            //"11,12;11,13;11,14;11,15;11,16;11,17;11,18;11,19;11,20;" +
            //"12,12;12,13;12,14;12,15;12,16;12,17;12,18;12,19;12,20;" +
            //"13,12;13,13;13,14;13,15;13,16;13,17;13,18;13,19;13,20;" +
            //"14,12;14,13;14,14;14,15;14,16;14,17;14,18;14,19;14,20;" +
            //"15,12;15,13;15,14;15,15;15,16;15,17;15,18;15,19;15,20",
            refresh: [["m3", -1, -1, 30, 50],["m4", -1, -1, 30, 50],["m5", -1, -1, 30, 20],["m6", -1, -1, 30, 10],
                ["m7", -1, -1, 30, 10],["m9", -1, -1, 30, 1],["m10", -1, -1, 30, 1],
                ["m11", -1, -1, 30, 1],["m12", -1, -1, 30, 1],["m13", -1, -1, 30, 1],["m14", -1, -1, 30, 1],
                ["m15", -1, -1, 30, 1],["m16", -1, -1, 30, 1],["m17", -1, -1, 30, 1],["m18", -1, -1, 30, 1]]
        },
        t1:{
            id : "t1",
            name: "zuma",
            tileX: 60,
            tileY: 60,
            mapX: 50,
            mapY: 50,
            collision: "6,5;7,5;8,5;9,5",
            refresh: []
        }},



    _roleMst: {
        m0:{id:"m0",name:"战士",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,
            moveSpeed:0.7,attackSpeed:0.8,checkDistance:0,visibleDistance:9,attackDistance:0},
        m1:{id:"m1",name:"法师",hp:220,hpAdd:20,defense:50,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:3,
            moveSpeed:0.7,attackSpeed:1.2,checkDistance:0,visibleDistance:9,attackDistance:6},
        m2:{id:"m2",name:"道士",hp:400,hpAdd:20,defense:5,defenseAdd:1,hurt:100,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:5,
            moveSpeed:0.7,attackSpeed:1.2,checkDistance:0,visibleDistance:9,attackDistance:6},
        m3:{id:"m3",name:"甲壳虫",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"beetle",drop:'i000,30,i001,30,i019,30'},
        m4:{id:"m4",name:"红野猪",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"redboar",drop:'i014,30,i026,30'},
        m5:{id:"m5",name:"祖玛羊",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:4,model:"zumasheep",drop:'i020,5,i021,5,i022,5'},
        m6:{id:"m6",name:"祖玛卫士",hp:1000,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:10,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"zumabodyguard",drop:'i027,5,i028,5,i029,5'},
        m7:{id:"m7",name:"白野猪",hp:1000,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:10,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"whiteboar",drop:'i002,5,i003,5,i004,5,i005,5,i006,5,i007,5'},
        m9:{id:"m9",name:"千年树妖",hp:2000,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:20,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:6,visibleDistance:6,attackDistance:6,model:"treedemon",drop:'i015,10,i016,10,i017,10'},
        m10:{id:"m10",name:"双头血魔",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossone",drop:'i008,50'},
        m11:{id:"m11",name:"骷髅精灵",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbosstwo",drop:'i009,50'},
        m12:{id:"m12",name:"黄泉教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:1,attackSpeed:0.8,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossthree",drop:'i010,50'},
        m13:{id:"m13",name:"虹膜教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossfour",drop:'i011,50'},
        m14:{id:"m14",name:"双头金刚",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossfive",drop:'i012,50'},
        m15:{id:"m15",name:"沃玛教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbosssix",drop:'i013,50'},
        m16:{id:"m16",name:"刀卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:1,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"protectorone",drop:'i018,50'},
        m17:{id:"m17",name:"虎卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:2,attackSpeed:0.7,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"protectortwo",drop:'i023,5,i023,5,i023,5,i030,5,i031,5,i032,5'},
        m18:{id:"m18",name:"鹰卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:4,model:"protectorthree",drop:'i033,30,i033,30,i033,30'},
    },


    //exclusive 专属,0-5分别为男战,女战,男法,女法,男道,女道
    _itemMst:{
        i000 : {id:'i000',name:'乱世布衣(男)',defense:1,exclusive:[0,2,4],model:'hum17'},
        i001 : {id:'i001',name:'乱世布衣(女)',defense:1,exclusive:[1,3,5],model:'hum17'},
        i002 : {id:'i002',name:'祖玛战衣(男)',defense:3,exclusive:[0],model:'hum17'},
        i003 : {id:'i003',name:'祖玛战衣(女)',defense:3,exclusive:[1],model:'hum17'},
        i004 : {id:'i004',name:'祖玛法衣(男)',defense:2,exclusive:[2],model:'hum17'},
        i005 : {id:'i005',name:'祖玛法衣(女)',defense:2,exclusive:[3],model:'hum17'},
        i006 : {id:'i006',name:'祖玛道衣(男)',defense:2,exclusive:[4],model:'hum17'},
        i007 : {id:'i007',name:'祖玛道衣(女)',defense:2,exclusive:[5],model:'hum17'},
        i008 : {id:'i008',name:'天魔神甲',hurt:5,defense:7,exclusive:[0],model:'hum17'},
        i009 : {id:'i009',name:'圣战宝甲',hurt:5,defense:7,exclusive:[1],model:'hum17'},
        i010 : {id:'i010',name:'法神披风',hurt:7,defense:6,exclusive:[2],model:'hum17'},
        i011 : {id:'i011',name:'霓裳羽衣',hurt:7,defense:6,exclusive:[3],model:'hum17'},
        i012 : {id:'i012',name:'天尊道袍',hurt:9,defense:5,exclusive:[4],model:'hum17'},
        i013 : {id:'i013',name:'天师长袍',hurt:9,defense:5,exclusive:[5],model:'hum17'},
        i014 : {id:'i014',name:'乱世铁剑',hurt:20,exclusive:[0,1,2,3,4,5],model:'hum17'},
        i015 : {id:'i015',name:'裁决之杖',hurt:30,exclusive:[0,1],model:'hum17'},
        i016 : {id:'i016',name:'骨玉权杖',hurt:30,exclusive:[2,3],model:'hum17'},
        i017 : {id:'i017',name:'龙纹剑',hurt:30,exclusive:[4,5],model:'hum17'},
        i018 : {id:'i018',name:'圣剑',hurt:40,exclusive:[0,1,2,3,4,5],model:'hum17'},
        i019 : {id:'i019',name:'乱世头盔',defense:1,exclusive:[0,1,2,3,4,5],model:'hum17'},
        i020 : {id:'i020',name:'祖玛战盔',defense:3,exclusive:[0,1],model:'hum17'},
        i021 : {id:'i021',name:'祖玛法盔',defense:2,exclusive:[2,3],model:'hum17'},
        i022 : {id:'i022',name:'祖玛道盔',defense:2,exclusive:[4,5],model:'hum17'},
        i023 : {id:'i023',name:'圣战头盔',defense:5,exclusive:[0,1],model:'hum17'},
        i024 : {id:'i024',name:'法神头盔',defense:4,exclusive:[2,3],model:'hum17'},
        i025 : {id:'i025',name:'天尊头盔',defense:4,exclusive:[4,5],model:'hum17'},
        i026 : {id:'i026',name:'乱世戒指',hurt:1,exclusive:[0,1,2,3,4,5],model:'hum17'},
        i027 : {id:'i027',name:'祖玛战戒',hurt:3,exclusive:[0,1],model:'hum17'},
        i028 : {id:'i028',name:'祖玛法戒',hurt:2,exclusive:[2,3],model:'hum17'},
        i029 : {id:'i029',name:'祖玛道戒',hurt:2,exclusive:[4,5],model:'hum17'},
        i030 : {id:'i030',name:'圣战戒指',hurt:5,exclusive:[0,1],model:'hum17'},
        i031 : {id:'i031',name:'法神戒指',hurt:4,exclusive:[2,3],model:'hum17'},
        i032 : {id:'i032',name:'天尊戒指',hurt:4,exclusive:[4,5],model:'hum17'},
        i033 : {id:'i033',name:'圣战之翼',hurt:10,defense:10,exclusive:[0,1],model:'hum17'},
        i034 : {id:'i034',name:'法神之翼',hurt:10,defense:10,exclusive:[2,3],model:'hum17'},
        i035 : {id:'i035',name:'天尊之翼',hurt:10,defense:10,exclusive:[4,5],model:'hum17'},
    },
};
