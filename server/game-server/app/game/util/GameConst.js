/**
 * Created by bot.su on 2017/4/11.
 */
module.exports = {

    //显示的数据方便策划，init做转换。
    init:function(){
        for(var key in this._mapArray){
            var map = this._mapArray[key];
            var array = map.collision.split(";");
            map.collision = [];
            for(var i=0;i<array.length;++i){
                var array2 = array[i].split(",");
                map.collision.push([parseInt(array2[0]),parseInt(array2[1])]);
            }
        }
    },


    //地图详细信息,refresh怪物相关刷新，坐标-1表示全地图随机刷--hero type,x,y,aliquot time,max count.
    _mapArray: {
        mafa: {
            name: "mafa",
            tileX: 60,
            tileY: 60,
            mapX: 50,
            mapY: 50,
            collision: "6,5;7,5;8,5;9,5",
            refresh: [["redEvilBoar", -1, -1, 10, 10], ["DarkLord", 15, 12, 300, 10], ["leftProtector", 13, 12, 60, 10], ["rightProtector", 17, 12, 60, 10]]
        },
        zuma: {
            name: "zuma",
            tileX: 60,
            tileY: 60,
            mapX: 50,
            mapY: 50,
            collision: "6,5;7,5;8,5;9,5",
            refresh: [["redEvilBoar", -1, -1, 60, 10], ["DarkLord", 15, 12, 300, 10], ["leftProtector", 13, 12, 60, 10], ["rightProtector", 17, 12, 60, 10]]
        },
        tiankong: {
            name: "tiankong",
            tileX: 60,
            tileY: 60,
            mapX: 50,
            mapY: 50,
            collision: "6,5;7,5;8,5;9,5",
            refresh: [["redEvilBoar", -1, -1, 60, 10], ["DarkLord", 15, 12, 300, 10], ["leftProtector", 13, 12, 60, 10], ["rightProtector", 17, 12, 60, 10]]
        }
    },


    //出生相关,_bornR怪物和角色通用
    _bornMap:"mafa",
    _bornX:1,
    _bornY:1,
    _bornR:4,


    //怪物当前id
    _baseMonsterId:0,
};
