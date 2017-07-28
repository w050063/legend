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
            mapX: 40,
            mapY: 40,
            collision:"",
            //collision: "9,12;9,13;9,14;9,15;9,16;9,17;9,18;9,19;9,20;" +
            //"10,12;10,13;10,14;10,15;10,16;10,17;10,18;10,19;10,20;" +
            //"11,12;11,13;11,14;11,15;11,16;11,17;11,18;11,19;11,20;" +
            //"12,12;12,13;12,14;12,15;12,16;12,17;12,18;12,19;12,20;" +
            //"13,12;13,13;13,14;13,15;13,16;13,17;13,18;13,19;13,20;" +
            //"14,12;14,13;14,14;14,15;14,16;14,17;14,18;14,19;14,20;" +
            //"15,12;15,13;15,14;15,15;15,16;15,17;15,18;15,19;15,20",
            refresh: [["m3", -1, -1, 30, 1],["m4", -1, -1, 30, 1],["m5", -1, -1, 30, 1],["m6", -1, -1, 30, 1],
                ["m7", -1, -1, 30, 1],["m8", -1, -1, 30, 1],["m9", -1, -1, 30, 1],["m10", -1, -1, 30, 1],
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
            refresh: [["redEvilBoar", -1, -1, 60, 10], ["DarkLord", 15, 12, 300, 10], ["leftProtector", 13, 12, 60, 10], ["rightProtector", 17, 12, 60, 10]]
        },
        t2:{
            id : "t2",
            name: "tiankong",
            tileX: 60,
            tileY: 60,
            mapX: 50,
            mapY: 50,
            collision: "6,5;7,5;8,5;9,5",
            refresh: [["redEvilBoar", -1, -1, 60, 10], ["DarkLord", 15, 12, 300, 10], ["leftProtector", 13, 12, 60, 10], ["rightProtector", 17, 12, 60, 10]]
        }},



    _roleMst: {
        m0:{id:"m0",name:"战士",type:"near2",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"nude",moveSpeed:0.6,attackSpeed:0.8},
        m1:{id:"m1",name:"法师",type:"far9",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"nude",moveSpeed:0.6,attackSpeed:1},
        m2:{id:"m2",name:"道士",type:"far1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"nude",moveSpeed:0.6,attackSpeed:1},
        m3:{id:"m3",name:"甲壳虫",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"beetle"},
        m4:{id:"m4",name:"红野猪",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"redboar"},
        m5:{id:"m5",name:"祖玛羊",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"zumasheep"},
        m6:{id:"m6",name:"祖玛卫士",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"zumabodyguard"},
        m7:{id:"m7",name:"白野猪",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"whiteboar"},
        m8:{id:"m8",name:"牛魔王",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"bulldemonking"},
        m9:{id:"m9",name:"千年树妖",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"treedemon"},
        m10:{id:"m10",name:"双头血魔",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"clothesbossone"},
        m11:{id:"m11",name:"骷髅精灵",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"clothesbosstwo"},
        m12:{id:"m12",name:"黄泉教主",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"clothesbossthree"},
        m13:{id:"m13",name:"虹膜教主",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"clothesbossfour"},
        m14:{id:"m14",name:"双头金刚",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"clothesbossfive"},
        m15:{id:"m15",name:"沃玛教主",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"clothesbosssix"},
        m16:{id:"m16",name:"刀卫",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"protectorone"},
        m17:{id:"m17",name:"虎卫",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"protectortwo"},
        m18:{id:"m18",name:"鹰卫",type:"near1",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,model:"protectorthree"},
    },
};
