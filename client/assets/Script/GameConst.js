/**
 * Created by bot.su on 2017/6/21.
 * 游戏常量相关
 */


module.exports= {
    //显示的数据方便阅读，这里转换成数组。
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

        for(var key in this._clipArray){
            this._clipArray[key] = this._clipArray[key].split(',');
        }


        for(var key in this._aniOffsetMap){
            var result = [];
            var array = this._aniOffsetMap[key].split('#');
            for(var i=0;i<array.length;++i){
                var result2 = [];
                var array2 = array[i].split(';');
                for(var j=0;j<array2.length;++j){
                    var array3 = array2[j].split(',');
                    result2.push([parseInt(array3[0]),parseInt(array3[1])]);
                }
                result.push(result2);
            }
            this._aniOffsetMap[key] =result;
        }
    },
    stateIdle : 0,
    stateMove :1,
    stateAttack : 2,
    stateDead : 3,


    campMonster:0,
    campLiuxing:1,
    campHudie:2,


    //性别
    sexBoy:0,
    sexGirl:1,



    //八个方向顺序
    directionStringArray:['0,1','1,1','1,0','1,-1','0,-1','-1,-1','-1,0','-1,1'],
    directionArray:[cc.p(0,1),cc.p(1,1),cc.p(1,0),cc.p(1,-1),cc.p(0,-1),cc.p(-1,-1),cc.p(-1,0),cc.p(-1,1)],



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
        m0:{id:"m0",name:"战士",hp:675,hpAdd:20,defense:5,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:1,
            moveSpeed:0.7,attackSpeed:0.8,checkDistance:0,visibleDistance:9,attackDistance:0},
        m1:{id:"m1",name:"法师",hp:220,hpAdd:20,defense:50,defenseAdd:1,hurt:55,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:3,
            moveSpeed:0.7,attackSpeed:1.2,checkDistance:0,visibleDistance:9,attackDistance:6},
        m2:{id:"m2",name:"道士",hp:400,hpAdd:20,defense:5,defenseAdd:1,hurt:100,hurtAdd:2,exp:100,expAdd:50,expDead:100,heal:1,healAdd:5,
            moveSpeed:0.7,attackSpeed:1.2,checkDistance:0,visibleDistance:9,attackDistance:6},
        m3:{id:"m3",name:"甲壳虫",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"beetle"},
        m4:{id:"m4",name:"红野猪",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"redboar"},
        m5:{id:"m5",name:"祖玛羊",hp:220,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:1,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:4,model:"zumasheep"},
        m6:{id:"m6",name:"祖玛卫士",hp:500,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:10,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"zumabodyguard"},
        m7:{id:"m7",name:"白野猪",hp:500,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:50,heal:10,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"whiteboar"},
        m9:{id:"m9",name:"千年树妖",hp:1000,hpAdd:0,defense:5,defenseAdd:0,hurt:30,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:20,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:6,visibleDistance:6,attackDistance:6,model:"treedemon"},
        m10:{id:"m10",name:"双头血魔",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossone"},
        m11:{id:"m11",name:"骷髅精灵",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbosstwo"},
        m12:{id:"m12",name:"黄泉教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:1,attackSpeed:0.8,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossthree"},
        m13:{id:"m13",name:"虹膜教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossfour"},
        m14:{id:"m14",name:"双头金刚",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbossfive"},
        m15:{id:"m15",name:"沃玛教主",hp:2000,hpAdd:0,defense:50,defenseAdd:0,hurt:100,hurtAdd:0,exp:0,expAdd:0,expDead:200,heal:50,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"clothesbosssix"},
        m16:{id:"m16",name:"刀卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:1,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"protectorone"},
        m17:{id:"m17",name:"虎卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:2,attackSpeed:0.7,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"protectortwo"},
        m18:{id:"m18",name:"鹰卫",hp:3000,hpAdd:0,defense:100,defenseAdd:0,hurt:150,hurtAdd:0,exp:0,expAdd:0,expDead:300,heal:100,healAdd:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:4,model:"protectorthree"},
    },

    _itemMst:{

    },
};
