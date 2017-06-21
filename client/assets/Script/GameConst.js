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
    stateStand : 1,
    stateAttack : 2,
    stateMove :3,
    stateDead : 4,


    campMonster:0,
    campLiuxing:1,
    campHudie:2,



    //地图详细信息,refresh怪物相关刷新，坐标-1表示全地图随机刷--hero type,x,y,aliquot time,max count.
    _terrainMap: {
        t0:{
            id : "t0",
            name: "mafa",
            tileX: 80,
            tileY: 60,
            mapX: 102,
            mapY: 136,
            collision: "9,12;9,13;9,14;9,15;9,16;9,17;9,18;9,19;9,20;" +
            "10,12;10,13;10,14;10,15;10,16;10,17;10,18;10,19;10,20;" +
            "11,12;11,13;11,14;11,15;11,16;11,17;11,18;11,19;11,20;" +
            "12,12;12,13;12,14;12,15;12,16;12,17;12,18;12,19;12,20;" +
            "13,12;13,13;13,14;13,15;13,16;13,17;13,18;13,19;13,20;" +
            "14,12;14,13;14,14;14,15;14,16;14,17;14,18;14,19;14,20;" +
            "15,12;15,13;15,14;15,15;15,16;15,17;15,18;15,19;15,20",
            refresh: [["redEvilBoar", -1, -1, 10, 10], ["DarkLord", 15, 12, 300, 10], ["leftProtector", 13, 12, 60, 10], ["rightProtector", 17, 12, 60, 10]]
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
};
