/**
 * Created by bot.su on 2017/6/21.
 * 游戏常量相关
 */


module.exports= {
    //显示的数据方便阅读，这里转换成数组。
    init:function(){
        //增加新forge道具
        var array = [];
        for(var key in this._itemMst){
            var mst = this._itemMst[key];
            mst.forge = 0;
            mst.icon = mst.id.substr(1);
            if(mst.level>=7){
                for(var i=1;i<=5;++i){
                    var temp = JSON.parse(JSON.stringify(mst));
                    temp.id = temp.id.substr(0,2)+i+temp.id.substr(3);
                    temp.name = temp.name+'+'+i;
                    if(!temp.hurt)temp.hurt = 0;
                    temp.hurt = temp.hurt+i;
                    if(!temp.defense)temp.defense = 0;
                    temp.defense = temp.defense+i;
                    if(!temp.forge)temp.forge = 0;
                    temp.forge = i;
                    temp.icon = mst.icon;
                    array.push(temp);
                }
            }
        }
        for(var i=0;i<array.length;++i){
            this._itemMst[array[i].id] = array[i];
        }



        //var tt = {};
        //for(var key in this._itemMst){
        //    var mst = this._itemMst[key];
        //    if(mst.level>=7 && mst.forge<5){
        //        tt[mst.id] = mst.id.substr(0,2)+(parseInt(mst.id.substr(2,1))+1)+mst.id.substr(3);
        //    }
        //}
        //cc.log(JSON.stringify(tt));
    },


    codeMap:{
        0:'寄售成功！',
        1:'拍卖行已送回道具！',
        2:'购买成功！',
        3:'未知错误！',
        4:'您不能和自己交易！',
        5:'您正在交易，取消交易请关闭界面或者小退！',
        6:'对方正在交易！',
        7:'已经发出交易请求！',
        8:'您已经确认交易！',
        9:'对方已经确认交易！',
        10:'交易成功！',
        11:'交易取消，一方元宝不够或者背包放不下！',
        12:'元宝可以在商城购买道具,提升战斗力！',
        13:'提示：战士刺杀第二格无视防御！',
        14:'提示：安全区外可随意杀人！',
        15:'欢迎天下第一等级【',
        16:'】上线！',
        17:'欢迎天下第一攻击【',
        18:'欢迎天下第一称号【',
        19:'欢迎玩家【',
        20:'创建失败，你已经创立行会！',
        21:'创建失败,名字已存在！',
        22:'创建失败，你已经加入行会！',
        23:'创建行会成功！',
        24:'删除行会成功！',
        25:'此人已经入会！',
        26:'已经发出邀请！',
        27:'邀请您加入行会[',
        28:'身上掉落在【',
        29:'在龙族宝藏寻到2000点经验',
        30:'在龙族宝藏寻到10点官职',
        31:'在龙族宝藏寻到',
        32:'玩家【',
        33:'】冲向',
        34:'寻宝去啦！',
        35:'背包已满!',
        36:'秒时间内无法捡取该装备!',
        37:' 放倒了 ',
        38:'冲锋的号角已经吹响，攻城战开始续写新的篇章!!!',
        39:'攻城结束,请城主联系管理员领取奖励!!!',
        40:'皇宫被(',
        41:')占领！',
        42:'对方已经组队！',
        43:'组队人数上线4人！',
        44:'已经发出邀请！',
        45:'您不能加自己！',
        46:'您已经组队！',
        47:'此队伍人数已满4人！',
        48:'当前队友：',
        49:'您还没有组队！',
        50:'已退出队伍！',
        51:'兑换元宝成功！',
        52:'】用秘卡购买',
        53:'个元宝！',
        54:'卡密已经使用！',
        55:'卡密不存在！',
        56:'元宝数量不足：',
        57:'目标不存在！',
        58:'等级不足47，或者处于禁言状态！',
        59:'邀请人不存在！',
        60:'您已经加入[',
        61:'玩家',
        62:'加入行会[',
        63:'同意邀请发生了未知错误！',
        64:'取消成功！',
        65:'拒绝加入行会邀请！',
        66:'踢出成功！',
        67:'您被踢出行会！',
        68:'被踢人不在本行会！',
        69:'被踢人不存在！',
        70:'退出行会成功！',
        71:'已经改为',
        72:'模式！',
        73:'每天只能领取一次！',
        74:'已经到达上线！',
        75:'领取成功！',
        76:'购买成功！',
        77:'】转职成功！',
        78:'转职需要5000元宝的服务费！',
        79:'身上有装备不能进行转职！',
        80:'】变性成功！',
        81:'变性需要3000元宝的服务费！',
        82:'身上有装备不能进行变性！',
    },


    neiguan:{
        i001000 : cc.p(-62,3),
        i001001 : cc.p(-62,3),
        i001002 : cc.p(-57,-30),
        i001003 : cc.p(-62,20),
        i001004 : cc.p(-78,29),
        i001005 : cc.p(-78,29),
        i001006 : cc.p(-67,33),

        i001007 : cc.p(-67,33),
        i001008 : cc.p(-62,-1),
        i001009 : cc.p(-51,-25),

        i001010 : cc.p(-72,45),
        i001011 : cc.p(-75,37),
        i001012 : cc.p(-72,24),

        i001013 : cc.p(-68,21),
        i001014 : cc.p(-70,28),
        i001015 : cc.p(-70,27),

        i001016 : cc.p(-76,32),
        i001017 : cc.p(-21,3),
        i001018 : cc.p(-69,31),

        i001019 : cc.p(-89,66),
        i001020 : cc.p(-68,38),
        i001021 : cc.p(-74,38),

        i001030 : cc.p(-70,53),

        i001200 : cc.p(-4,-60),
        i001201 : cc.p(-4,-58),
        i001202 : cc.p(-3,-58),
        i001203 : cc.p(-4,-58),
        i001204 : cc.p(-4,-58),
        i001205 : cc.p(-2,-56),
        i001206 : cc.p(-3,-60),
        i001207 : cc.p(-2,-55),
        i001208 : cc.p(3,-48),
        i001209 : cc.p(-1,-45),
        i001210 : cc.p(-2,-61),
        i001211 : cc.p(-2,-60),
        i001212 : cc.p(-4,-61),
        i001213 : cc.p(-2,-60),
        i001214 : cc.p(6,-27),
        i001215 : cc.p(6,-27),
        i001216 : cc.p(6,-27),
        i001217 : cc.p(6,-27),
        i001218 : cc.p(6,-27),
        i001219 : cc.p(5,-27),
        i001220 : cc.p(4,-23),
        i001221 : cc.p(4,-23),
        i001230 : cc.p(6,-50),
        i001231 : cc.p(-3,-53),

        i001031 : cc.p(-75,54),
        i001232 : cc.p(3,-2),
        i001233 : cc.p(3,-2),
    },



    //商店物品编号
    shopOffice:0,
    shopCome:1,
    shopWing:2,
    shopPriceArray:[400,1000,500],


    //每日领取物品编号
    dailyWing:0,
    dailyWingWithGold:1,
    dailyPriceArray:[0,100],


    stateIdle : 0,
    stateMove :1,
    stateAttack : 2,
    stateDead : 3,


    campNpc:0,
    campMonster:1,
    campPlayerNone:2,
    campPlayerQinglong:3,
    campPlayerBaihu:4,
    campPlayerZhuque:5,
    campPlayerXuanwu:6,
    campPlayerArray:['青龙堂','白虎堂','朱雀堂','玄武堂'],


    //聊天
    chatAll:0,
    chatMap:1,
    chatGuild:2,


    //攻击模式
    attackModeAll:0,
    attackModePeace:1,
    attackModeGuild:2,
    attackModeTeam:3,
    attackModeTextArray:['全体','和平','行会','组队'],



    //性别
    sexBoy:0,
    sexGirl:1,


    //请求类型
    askTeam:0,
    askDeal:1,


    //官职称号
    officeName:['无','风流名士','出类拔萃','一方枭雄','傲视群雄','名扬天下','所向披靡','万夫莫敌','谁与争锋','万众臣服'
        ,'天下无双','问道期','升仙期','古镜期','道镜期','真仙期','凝气期','筑基期','结丹期','元婴期','斩灵期'],
    officeProgress:[0,10,50,200,500,1200,2100,3800,9200,15000,32000,48000,60000,75000
        ,95000,130000,170000,220000,280000,350000,450000],
    officeHurt:[0,1,3,5,7,10,15,24,35,55,80,100,120,140
        ,160,190,230,280,330,380,430,490],
    officeDefense:[0,1,2,3,5,6,8,10,12,15,20,25,30,35,
        40,50,65,85,102,130,160],


    //翅膀
    wingProgress:[0,10,30,60,150,320,450,1300,2100,3500,5000,9000,13000,20000,30000,45000],
    wingHurt:[0,1,3,7,11,16,22,29,36,45,54,66,80,95,125,160],
    wingDefense:[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,32],
    wingModel:['','ani/hum110/110','ani/hum109/109','ani/hum101/101','ani/hum93/093','ani/hum91/091','ani/hum94/094'
        ,'ani/hum105/105','ani/hum100/100','ani/hum92/092'
        ,'ani/hum102/102','ani/hum104/104','ani/hum95/095','ani/hum107/107','ani/hum108/108','ani/hum97/097'],


    //装备puton编号，>0表示身上
    putonBag:-1,
    putonWharehouse:-2,
    putonGround:-3,
    putonAuctionShop:-4,


    roleNameZorder:14,
    roleEffectZorder:13,
    roleWeaponZorder:[8,12,12,12,12,8,8,8],//武器z轴
    roleWingZorder:[11,11,9,9,9,9,9,11],
    roleAniZorder:10,
    roleEffectUnderZorder:7,


    //八个方向顺序
    directionStringArray:['0,1','1,1','1,0','1,-1','0,-1','-1,-1','-1,0','-1,1'],
    directionArray:[cc.p(0,1),cc.p(1,1),cc.p(1,0),cc.p(1,-1),cc.p(0,-1),cc.p(-1,-1),cc.p(-1,0),cc.p(-1,1)],


    tileWidth:48,
    tileHeight:32,
    bagMaxCount:40,
    putonTypes:[0,1,2,3,4,4,5,5,6,7,8,9,10,11],
    putonPositionArray:[cc.p(-148,52),cc.p(148,52),cc.p(-148,-9),cc.p(148,-9),cc.p(-148,-72),cc.p(148,-72),cc.p(-148,-134),cc.p(148,-134),cc.p(-148,-201),cc.p(-87,-201),cc.p(-28,-201),cc.p(30,-201),cc.p(90,-201),cc.p(149,-201)],
    itemEquipWeapon:0,
    itemEquipClothe:2,
    itemEquipWing:8,


    //基础等级，后面接着递增等级，35,43,47,51
    expDatabase:[10,0,10,1000,10000,100000],

    //转生
    comeArray:[10,20,40,80,150,250,400,625,900,1300,1800,2500,4000,6000,9000,99998,99999],
    comeHurt:[3,6,10,15,22,29,41,55,70,88,108,140,180,230,300,370,410],
    comeDefense:[2,5,9,14,20,27,35,44,54,65,72,85,100,120,145,180,220],
    comeHPWarrior:[30,80,180,250,350,460,570,690,810,1000,1300,1800,2400,3100,3900,4900,5900],
    comeHPWizard:[10,27,60,85,118,153,190,230,270,333,433,600,800,1000,1200,1400,1600],
    comeHPTaoist:[15,40,90,125,175,230,285,345,405,500,650,900,1200,1500,1900,2400,2700],


    //穿戴转生要求,从10级开始
    equipCome:[0,0,0,0,0,0,0,0,0,0,0,8,10],



    //套装属性
    equipHurt:[0,0,0,0,0,0,0,5,12,25,42,62,85],
    equipDefense:[0,0,0,0,0,0,0,2,5,12,21,31,42],
    equipHPWarrior:[0,0,0,0,0,0,0,50,100,180,330,500,700],
    equipHPWizard:[0,0,0,0,0,0,0,20,35,60,110,175,230],
    equipHPTaoist:[0,0,0,0,0,0,0,25,50,90,165,250,350],

    //元神
    spiritArray:[0,10,20,40,80,150,250,400,625,900,1300,1800,2500,4000,6000,9000,13000,17000,21000,26000],
    spiritHurt:[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38],
    spiritDefense:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
    spiritCrit:[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20,22,24,26,28],


    //地图详细信息,refresh怪物相关刷新，坐标-1表示全地图随机刷--hero type,x,y,aliquot time,max count.
    _terrainMap: {
        t0:{
            id : "t0",
            name: "新手村",
            level:0,
            tranCity:'t0',
            res: 'map/0',
            resPad: '000',
            music:'Heart Of Courage.mp3',
            npc:[{name:"新手村接待员",model:'ani/hum41/041',x:32,y:10,title:"安全区域传送:",content:['t16','t1']}],
            mapX: 40,
            mapY: 40,
            safe:{x:29,y:7,xx:31,yy:9},
            refresh: [["m20",20]]
        },
        t1:{
            id : "t1",
            name: "盟重土城",
            level:35,
            tranCity:'t1',
            res: 'map/3',
            resPad: '001',
            music:'Victory.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:25,y:33,title:"区域传送:",content:['t17','t9','t10','t8','t2','t0','t11','t18']},
                {name:"充值中心",model:'ani/hum41/041',x:29,y:29,title:"充值中心:",content:['t9000']},
                {name:"比奇国王",model:'ani/hum41/119',x:27,y:43,title:"是否加入行会:",content:['t4000','t4001','t4002','t4003','t4004','t4005','t4006','t4007']},
                {name:"比奇城市大使",model:'ani/hum41/220',x:20,y:47,title:"比奇路途遥远，确认要去:",content:['t23']},
                {name:"拍卖行",model:'ani/hum41/221',x:16,y:47,title:"不用的东西让我帮你卖:",content:['t8000']},
                {name:"排行榜",model:'ani/hum41/117',x:8,y:47,title:"排行榜:",content:['t9001']},
                {name:"龙族宝藏",model:'ani/hum41/222',x:12,y:47,title:"200元宝一次:",content:['t5000']},
                {name:"装备合成师",model:'ani/hum41/222',x:5,y:25,title:"二合一打造装备，必成功！",content:['t9008']},
                {name:"沙巴克传送员",model:'ani/hum41/041',x:46,y:36,title:"限制40级以上",content:['t36']},
                {name:"仓库管理",model:'ani/hum41/117',x:23,y:25,title:"有什么宝贝尽管存到我这里吧:",content:['t6000']},
                {name:"每日奖励",model:'ani/hum41/222',x:26,y:25,title:"每日奖励:",content:['t7000','t7001']},
                {name:"王者幻境",model:'ani/hum41/116',x:5,y:39,title:"限制47级以上",content:['t22']},
                {name:"装备回收",model:'ani/hum41/222',x:5,y:29,title:"装备回收:",content:['t1000','t1001','t1002','t1003','t1004','t1005']},
                {name:"皇家陵墓",model:'ani/hum41/115',x:5,y:34,title:"限制47级以上",content:['t5']},
                {name:"真天宫",model:'ani/hum41/116',x:9,y:25,title:"限制44级以上",content:['t11']},
                {name:"轮回地带",model:'ani/hum41/116',x:17,y:25,title:"限制45-47级",content:['t28']},
                {name:"烈焰地狱",model:'ani/hum41/116',x:13,y:25,title:"限制48-50级",content:['t29','t32']},
                {name:"火龙洞窟",model:'ani/hum41/115',x:5,y:44,title:"限制50级以上",content:['t18']}],
            mapX: 60,
            mapY: 60,
            safe:{x:7,y:27,xx:26,yy:46},
            refresh: [["m8",1,40,29],["m9",1,31,0]]
        },
        t2:{
            id : "t2",
            name: "BOSS之家一层",
            level:40,
            tranCity:'t1',
            res: 'map/d5071',
            resPad: '002',
            music:'For The Win.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:7,y:40,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:41,y:12,title:"传送:",content:['t4','t1']}],
            mapX: 50,
            mapY: 50,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2],["m45",2],["m21",2],["m30",2],["m31",2]]
        },
        t3:{
            id : "t3",
            name: "BOSS之家二层",
            level:40,
            tranCity:'t1',
            res: 'map/d515',
            resPad: '003',
            music:'For The Win.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:29,y:24,title:"传送:",content:['t3','t1']}],
            mapX: 40,
            mapY: 40,
            refresh: [["m6",2],["m7",2],["m34",2],["m32",2],["m33",2],["m46",2],["m47",2]]
        },
        t4:{
            id : "t4",
            name: "皇家陵墓一层",
            level:47,
            tranCity:'t1',
            res: 'map/d717',
            resPad: '004',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:25,y:24,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:83,y:74,title:"传送:",content:['t7','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2]
                ,["m34",4],["m32",4],["m33",4],["m46",4],["m47",4],["m25",4],["m26",4]]
        },
        t5:{
            id : "t5",
            name: "皇家陵墓二层",
            level:47,
            tranCity:'t1',
            res: 'map/dm002',
            resPad: '005',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:7,y:9,title:"传送:",content:['t6','t1']}],
            mapX: 32,
            mapY: 38,
            refresh: [["m36",2],["m41",2],["m43",2],["m27",1,22,25],["m28",1],["m29",1],["m37",2],["m38",2],["m39",2]]
        },
        t6:{
            id : "t6",
            name: "鼠洞",
            level:35,
            tranCity:'t1',
            res: 'map/d2052',
            resPad: '006',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:87,y:32,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:18,y:18,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:50,y:75,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",20],["m5",20],["m6",10],["m7",10],["m23",2]]
        },
        t7:{
            id : "t7",
            name: "牛魔洞",
            level:35,
            tranCity:'t1',
            res: 'map/d2079',
            resPad: '007',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:14,y:86,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:15,y:12,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:52,y:48,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:89,y:84,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:89,y:10,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",20],["m5",20],["m6",10],["m7",10],["m24",2]]
        },
        t8:{
            id : "t8",
            name: "魔窟圣地",
            level:35,
            tranCity:'t1',
            res: 'map/d2063',
            resPad: '008',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:106,y:52,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:19,y:33,title:"传送:",content:['t1']}],
            mapX: 130,
            mapY: 60,
            refresh: [["m4",20],["m5",20],["m6",10],["m7",10],["m22",2]]
        },
        t9:{
            id : "t9",
            name: "真天宫一层",
            level:44,
            tranCity:'t1',
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:79,y:21,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:24,y:74,title:"传送:",content:['t13','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m37",5],["m38",5],["m39",5],["m42",5],["m43",5]]
        },
        t10:{
            id : "t10",
            name: "真天宫二层",
            level:44,
            tranCity:'t1',
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:79,y:21,title:"传送:",content:['t12','t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:24,y:74,title:"传送:",content:['t15','t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m37",5],["m38",5],["m39",5],["m40",5],["m41",5]]
        },
        t11:{
            id : "t11",
            name: "真天宫三层",
            level:44,
            tranCity:'t1',
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:79,y:21,title:"传送:",content:['t14','t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:24,y:74,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m37",5],["m38",5],["m39",5],["m35",5],["m36",5],["m48",5]]
        },
        t12:{
            id : "t12",
            name: "新手村训练基地",
            level:0,
            maxLevel:35,
            tranCity:'t0',
            res: 'map/d515',
            resPad: '003',
            music:'Heart Of Courage.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:29,y:24,title:"传送:",content:['t0']}],
            mapX: 40,
            mapY: 40,
            refresh: [["m20",50]]
        },
        t13:{
            id : "t13",
            name: "比奇城市",
            level:50,
            tranCity:'t23',
            res: 'map/1',
            resPad: '012',
            music:'Heart Of Courage.mp3',
            npc:[{name:"比奇接待员",model:'ani/hum41/041',x:33,y:48,title:"安全区域传送:",content:['t1']}
                ,{name:"转职变性",model:'ani/hum41/041',x:31,y:46,title:"快来体验转职变性的快感吧!",content:['t9002']}
                ,{name:"玛法秘境",model:'ani/hum41/116',x:28,y:43,title:"专属转生地图:",content:['t44','t45','t46','t47','t48','t49']}
                ,{name:"通天阁",model:'ani/hum41/116',x:38,y:43,title:"限制2转以上进入",content:['t30']}
                ,{name:"黑魔宫",model:'ani/hum41/115',x:41,y:40,title:"限制4转以上进入",content:['t31']}
                ,{name:"六转地图",model:'ani/hum41/116',x:41,y:36,title:"限制6转以上进入",content:['t42']}
                ,{name:"八转地图",model:'ani/hum41/115',x:38,y:33,title:"限制8转以上进入",content:['t43']}
                ,{name:"10转地图",model:'ani/hum41/116',x:35,y:30,title:"限制10转以上进入",content:['t50']}
                ,{name:"危险区域",model:'ani/hum41/115',x:35,y:46,title:"危险区域传送:",content:['t25','t26','t27','t37','t51']}],
            mapX: 70,
            mapY: 84,
            safe:{x:0,y:0,xx:69,yy:83},
            refresh: []
        },
        t14:{
            id : "t14",
            name: "猪洞",
            level:35,
            tranCity:'t1',
            res: 'map/d717',
            resPad: '004',
            music:'Star Sky.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:25,y:24,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:83,y:74,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",100],["m5",20],["m6",20],["m7",20]]
        },
        t15:{
            id : "t15",
            name: "火龙洞窟",
            level:50,
            tranCity:'t1',
            res: 'map/d2083',
            resPad: '010',
            music:'Victory.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:8,y:12,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:28,y:26,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:34,y:57,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:57,y:34,title:"传送:",content:['t1']}],
            mapX: 64,
            mapY: 72,
            refresh: [["m36",5],["m41",5],["m43",5],["m27",1,48,49],["m28",1],["m29",1],["m37",6],["m38",6],["m39",6]]
        },
        t16:{
            id : "t16",
            name: "皇宫",
            level:40,
            tranCity:'t1',
            res: 'map/0150',
            resPad: '011',
            music:'Victory.mp3',
            npc:[{name:"国王",model:'ani/hum41/041',x:8,y:15,title:"传送:",content:['t1']}],
            mapX: 23,
            mapY: 27,
            refresh: []
        },
        t17:{
            id : "t17",
            name: "王者幻境",
            level:47,
            tranCity:'t1',
            res: 'map/d2079',
            resPad: '007',
            music:'Strength Of A Thousand Men.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:14,y:86,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:15,y:12,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:52,y:48,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:89,y:84,title:"传送:",content:['t1']}
                ,{name:"传送员",model:'ani/hum41/041',x:89,y:10,title:"传送:",content:['t1']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2],["m10",5],["m11",5],["m12",5],["m13",5],["m14",5],["m15",5],["m16",5],["m17",5],["m18",5]
                ,["m27",1,48,51],["m28",1],["m29",1],["m8",10]]
        },
        t19:{
            id : "t19",
            name: "相思墓穴",
            level:50,
            tranCity:'t23',
            res: 'map/t0005',
            resPad: '014',
            music:'Strength Of A Thousand Men.mp3',
            npc:[],
            mapX: 200,
            mapY: 200,
            refresh: [["m37",2],["m38",2],["m39",2],["m10",6],["m11",6],["m12",6],["m13",6],["m14",6],["m15",6],["m16",6],["m17",6],["m18",6]
                ,["m27",1],["m28",1],["m29",1],["m8",10]]
        },
        t20:{
            id : "t20",
            name: "藏宝阁",
            level:50,
            tranCity:'t23',
            res: 'map/t0006',
            resPad: '015',
            music:'Strength Of A Thousand Men.mp3',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m37",2],["m38",2],["m39",2],["m10",2],["m11",2],["m12",2],["m13",2],["m14",2],["m15",2],["m16",2],["m17",2],["m18",2]
                ,["m27",1],["m28",1],["m29",1],["m8",5]]
        },
        t21:{
            id : "t21",
            name: "埋没之城",
            level:50,
            tranCity:'t23',
            res: 'map/t0009',
            resPad: '016',
            music:'Strength Of A Thousand Men.mp3',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m37",2],["m38",2],["m39",2],["m10",2],["m11",2],["m12",2],["m13",2],["m14",2],["m15",2],["m16",2],["m17",2],["m18",2]
                ,["m27",1],["m28",1],["m29",1],["m8",5]]
        },
        t22:{
            id : "t22",
            name: "轮回地带",
            level:45,
            tranCity:'t1',
            maxLevel:47,
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2],["m37",2],["m38",2],["m39",2],["m22",1],["m23",1],["m24",1]]
        },
        t23:{
            id : "t23",
            name: "烈焰地狱",
            level:48,
            tranCity:'t1',
            maxLevel:50,
            res: 'map/d2052',
            resPad: '006',
            music:'Strength Of A Thousand Men.mp3',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2],["m10",2],["m11",2],["m12",2],["m13",2],["m14",2],["m15",2],["m16",2],["m17",2],["m18",2]
                ,["m8",5]]
        },
        t24:{
            id : "t24",
            name: "通天阁",
            level:0,
            tranCity:'t23',
            come:2,
            res: 'map/t0006',
            resPad: '015',
            music:'Strength Of A Thousand Men.mp3',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m36",2],["m41",2],["m43",2],["m27",1,56,45],["m28",1],["m29",1],["m37",2],["m38",2],["m39",2],["m49",1]]
        },
        t25:{
            id : "t25",
            name: "黑魔宫",
            level:0,
            tranCity:'t23',
            come:4,
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m36",5],["m41",5],["m43",5],["m27",1,60,37],["m28",1],["m29",1],["m37",2],["m38",2],["m39",2],["m50",1]]
        },
        t26:{
            id : "t26",
            name: "烈焰地狱2",
            level:48,
            tranCity:'t1',
            maxLevel:50,
            res: 'map/d2013',
            resPad: '009',
            music:'Never Back Down.mp3',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2],["m10",2],["m11",2],["m12",2],["m13",2],["m14",2],["m15",2],["m16",2],["m17",2],["m18",2]
                ,["m8",5]]
        },
        t27:{
            id : "t27",
            name: "沙巴克城",
            level:40,
            tranCity:'t36',
            res: 'map/4',
            resPad: '017',
            music:'Victory.mp3',
            npc:[{name:"传送员",model:'ani/hum41/041',x:36,y:3,title:"传送:",content:['t1']}],
            mapX: 54,
            mapY: 59,
            safe:{x:27,y:0,xx:36,yy:9},
            refresh: []
        },
        t28:{
            id : "t28",
            name: "香石墓穴一层",
            level:47,
            tranCity:'t23',
            res: 'map/e701',
            resPad: '018',
            music:'',
            npc:[{name:"传送员",model:'ani/hum41/041',x:89,y:15,title:"传送:",content:['t38']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2],["m10",2],["m11",2],["m12",2],["m13",2],["m14",2],["m15",2],["m16",2],["m17",2],["m18",2]
                ,["m8",5],["m49",1]]
        },
        t29:{
            id : "t29",
            name: "香石墓穴二层",
            level:47,
            tranCity:'t23',
            res: 'map/e702',
            resPad: '019',
            music:'',
            npc:[{name:"传送员",model:'ani/hum41/041',x:60,y:31,title:"传送:",content:['t39']}
                ,{name:"传送员",model:'ani/hum41/041',x:64,y:5,title:"传送:",content:['t40']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m4",2],["m5",2],["m6",2],["m7",2],["m10",2],["m11",2],["m12",2],["m13",2],["m14",2],["m15",2],["m16",2],["m17",2],["m18",2]
                ,["m8",5],["m50",1]]
        },
        t30:{
            id : "t30",
            name: "香石墓穴三层",
            level:47,
            tranCity:'t23',
            res: 'map/e703',
            resPad: '020',
            music:'',
            npc:[{name:"传送员",model:'ani/hum41/041',x:49,y:54,title:"传送:",content:['t41']}],
            mapX: 100,
            mapY: 100,
            refresh: [["m36",5],["m41",5],["m43",5],["m27",1,19,18],["m28",1],["m29",1],["m37",2],["m38",2],["m39",2],["m51",1]]
        },
        t31:{
            id : "t31",
            name: "6转地图",
            level:47,
            tranCity:'t23',
            come:6,
            res: 'map/t0003',
            resPad: '021',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m36",5],["m41",5],["m43",5],["m27",1,10,11],["m28",1],["m29",1],["m37",2],["m38",2],["m39",2],["m51",1]]
        },
        t32:{
            id : "t32",
            name: "8转地图",
            level:47,
            tranCity:'t23',
            come:8,
            res: 'map/d024',
            resPad: '022',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m36",5],["m41",5],["m43",5],["m27",1,51,49],["m28",1],["m29",1],["m37",2],["m38",2],["m39",2],["m52",1]]
        },
        t33:{
            id : "t33",
            name: "绝望之境(1-3)",
            level:50,
            tranCity:'t23',
            come:1,
            comeMax:3,
            res: 'map/d717',
            resPad: '004',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m16",10],["m17",10],["m18",10],["m8",10]
                ,["m34",2],["m35",2],["m36",2],["m40",2],["m41",2],["m42",2],["m43",2]
                ,["m27",1],["m28",1],["m29",1]
                ,["m49",1]]
        },
        t34:{
            id : "t34",
            name: "幽暗迷宫(4-6)",
            level:50,
            tranCity:'t23',
            come:4,
            comeMax:6,
            res: 'map/d717',
            resPad: '004',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m16",10],["m17",10],["m18",10],["m8",10]
                ,["m34",2],["m35",2],["m36",2],["m40",2],["m41",2],["m42",2],["m43",2]
                ,["m27",1],["m28",1],["m29",1]
                ,["m50",1]]
        },
        t35:{
            id : "t35",
            name: "邪龙巢穴(7-8)",
            level:50,
            tranCity:'t23',
            come:7,
            comeMax:8,
            res: 'map/d717',
            resPad: '004',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m16",10],["m17",10],["m18",10],["m8",10]
                ,["m34",2],["m35",2],["m36",2],["m40",2],["m41",2],["m42",2],["m43",2]
                ,["m27",1],["m28",1],["m29",1]
                ,["m51",1]]
        },
        t36:{
            id : "t36",
            name: "冰霜通道(9-10)",
            level:50,
            tranCity:'t23',
            come:9,
            comeMax:10,
            res: 'map/d717',
            resPad: '004',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m16",10],["m17",10],["m18",10],["m8",10]
                ,["m34",2],["m35",2],["m36",2],["m40",2],["m41",2],["m42",2],["m43",2]
                ,["m27",1],["m28",1],["m29",1]
                ,["m52",1]]
        },
        t37:{
            id : "t37",
            name: "铁血之境(11-12)",
            level:50,
            tranCity:'t23',
            come:11,
            comeMax:12,
            res: 'map/d717',
            resPad: '004',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m16",12],["m17",12],["m18",12],["m8",12]
                ,["m34",3],["m35",3],["m36",3],["m40",3],["m41",3],["m42",3],["m43",3]
                ,["m27",2],["m28",2],["m29",2]
                ,["m52",1]]
        },
        t38:{
            id : "t38",
            name: "傲天逆境(13-?)",
            level:50,
            tranCity:'t23',
            come:13,
            comeMax:99,
            res: 'map/d717',
            resPad: '004',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m16",12],["m17",12],["m18",12],["m8",12]
                ,["m34",3],["m35",3],["m36",3],["m40",3],["m41",3],["m42",3],["m43",3]
                ,["m27",2],["m28",2],["m29",2]
                ,["m52",2]]
        },
        t39:{
            id : "t39",
            name: "10转地图",
            level:47,
            tranCity:'t23',
            come:10,
            res: 'map/d024',
            resPad: '022',
            music:'',
            npc:[],
            mapX: 100,
            mapY: 100,
            refresh: [["m36",5],["m41",5],["m43",5],["m27",1,51,49],["m28",2],["m29",2],["m37",3],["m38",3],["m39",3],["m52",2]]
        },
        t40:{
            id : "t40",
            name: "桃园之门",
            level:50,
            tranCity:'t23',
            come:0,
            res: 'map/r001',
            resPad: '023',
            music:'',
            npc:[],
            mapX: 200,
            mapY: 200,
            refresh: [["m8",40],["m34",15],["m35",15],["m36",15],["m40",15],["m41",15],["m42",15],["m43",15]
                ,["m9",1,55,105],["m27",1,19,116],["m28",2],["m29",2],["m48",5],["m49",1,97,156]
                ,["m50",1,153,120],["m51",1,137,54],["m52",1,89,51]]
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
        t22:{id:'t22',name:'王者幻境',mapId:'t17',x:12,y:87},
        t23:{id:'t23',name:'比奇城市',mapId:'t13',x:33,y:38},
        t25:{id:'t25',name:'相思墓穴',mapId:'t19',x:123,y:125},
        t26:{id:'t26',name:'藏宝阁',mapId:'t20',x:50,y:50},
        t27:{id:'t27',name:'埋没之城',mapId:'t21',x:20,y:76},
        t28:{id:'t28',name:'轮回地带',mapId:'t22',x:78,y:19},
        t29:{id:'t29',name:'烈焰地狱',mapId:'t23',x:84,y:33},
        t30:{id:'t30',name:'通天阁',mapId:'t24',x:50,y:50},
        t31:{id:'t31',name:'黑魔宫',mapId:'t25',x:78,y:19},
        t32:{id:'t32',name:'烈焰地狱2',mapId:'t26',x:78,y:19},
        t33:{id:'t33',name:'皇宫四号点',mapId:'t16',x:17,y:17},
        t34:{id:'t34',name:'皇宫五号点',mapId:'t16',x:12,y:17},
        t35:{id:'t35',name:'皇宫六号点',mapId:'t16',x:6,y:4},
        t36:{id:'t36',name:'沙巴克城',mapId:'t27',x:32,y:5},
        t37:{id:'t37',name:'香石墓穴',mapId:'t28',x:12,y:82},
        t38:{id:'t38',name:'香石墓穴二层',mapId:'t29',x:60,y:31},
        t39:{id:'t39',name:'香石墓穴一层',mapId:'t28',x:89,y:15},
        t40:{id:'t40',name:'香石墓穴三层',mapId:'t30',x:49,y:54},
        t41:{id:'t41',name:'香石墓穴二层',mapId:'t29',x:64,y:5},
        t42:{id:'t42',name:'六转地图',mapId:'t31',x:44,y:50},
        t43:{id:'t43',name:'八转地图',mapId:'t32',x:16,y:81},
        t44:{id:'t44',name:'绝望之境(1-3)',mapId:'t33',x:26,y:25},
        t45:{id:'t45',name:'幽暗迷宫(4-6)',mapId:'t34',x:26,y:25},
        t46:{id:'t46',name:'邪龙巢穴(7-8)',mapId:'t35',x:26,y:25},
        t47:{id:'t47',name:'冰霜通道(9-10)',mapId:'t36',x:26,y:25},
        t48:{id:'t48',name:'铁血之境(11-12)',mapId:'t37',x:26,y:25},
        t49:{id:'t49',name:'傲天逆境(13-?)',mapId:'t38',x:26,y:25},
        t50:{id:'t50',name:'10转地图',mapId:'t39',x:16,y:81},
        t51:{id:'t51',name:'桃园之门',mapId:'t40',x:100,y:100},
        t1000:{id:'t1000',name:'5级以下回收',levels:[1,2,3,4,5]},
        t1001:{id:'t1001',name:'6级回收',levels:[6]},
        t1002:{id:'t1002',name:'7级回收',levels:[7]},
        t1003:{id:'t1003',name:'8级回收',levels:[8]},
        t1004:{id:'t1004',name:'9级回收',levels:[9]},
        t1005:{id:'t1005',name:'10级回收',levels:[10]},
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
        t4007:{id:'t4007',name:'成员列表'},
        t5000:{id:'t5000',name:'寻宝'},
        t6000:{id:'t6000',name:'仓库管理'},
        t7000:{id:'t7000',name:'10点神羽'},
        t7001:{id:'t7001',name:'100元宝翻倍'},
        t7100:{id:'t7100',name:'分享奖励'},
        t8000:{id:'t8000',name:'拍卖行'},
        t9000:{id:'t9000',name:'充值中心'},
        t9001:{id:'t9001',name:'排行榜'},
        t9002:{id:'t9002',name:'转职战士',type:'m0'},
        t9003:{id:'t9003',name:'转职法师',type:'m1'},
        t9004:{id:'t9004',name:'转职道士',type:'m2'},
        t9005:{id:'t9005',name:'变为男性'},
        t9006:{id:'t9006',name:'变为女性'},
        t9007:{id:'t9007',name:'改名'},
        t9008:{id:'t9008',name:'合成'},
    },


    _roleMst: {
        m0:{id:"m0",name:"战",hp:19,hpAdd:[15,28,31,34,35],defense:0,defenseAdd:0.3,hurt:3,hurtAdd:0.45,expDead:0,heal:5,healAdd:1.5,
            moveSpeed:0.4,attackSpeed:0.8,checkDistance:5,visibleDistance:8,attackDistance:0,lv:1},
        m1:{id:"m1",name:"法",hp:16,hpAdd:[4,7,8,9,9],defense:0,defenseAdd:0.4,hurt:2,hurtAdd:0.5,expDead:0,heal:5,healAdd:2,
            moveSpeed:0.4,attackSpeed:1.2,checkDistance:5,visibleDistance:8,attackDistance:5,lv:1},
        m2:{id:"m2",name:"道",hp:17,hpAdd:[8,17,17,16,20],defense:0,defenseAdd:0.2,hurt:5,hurtAdd:0.45,expDead:0,heal:10,healAdd:2.2,
            moveSpeed:0.4,attackSpeed:1.2,checkDistance:5,visibleDistance:8,attackDistance:5,lv:1},
        m3:{id:"m3",name:"甲壳虫",hp:300,defense:2,hurt:30,expDead:30,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:3,visibleDistance:9,attackDistance:1.5,model:"ani/hum16/016",drop:'',lv:2},
        m4:{id:"m4",name:"红野猪",hp:330,defense:2,hurt:30,expDead:33,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum17/017",drop:'',lv:2},
        m5:{id:"m5",name:"祖玛羊",hp:385,hpAdd:0,defense:2,hurt:30,expDead:38,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:4,model:"ani/hum18/018",drop:'',lv:2},
        m6:{id:"m6",name:"祖玛卫士",hp:1000,defense:5,hurt:60,expDead:150,heal:0,
            moveSpeed:1.5,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum19/019",drop:'',lv:3},
        m7:{id:"m7",name:"白野猪",hp:1500,defense:8,hurt:80,expDead:150,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum20/020",drop:'',lv:3},
        m8:{id:"m8",name:"千年树妖",hp:10000,defense:100,hurt:100,expDead:1000,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum22/022",drop:'',lv:7},
        m9:{id:"m9",name:"万年树妖",hp:30000,defense:150,hurt:280,expDead:2000,heal:500,
            moveSpeed:1.5,attackSpeed:1.5,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum22/022",drop:'',lv:8},
        m10:{id:"m10",name:"暗之双头血魔",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum23/023",drop:'',lv:7},
        m11:{id:"m11",name:"暗之骷髅精灵",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum24/024",drop:'',lv:7},
        m12:{id:"m12",name:"暗之黄泉教主",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum25/025",drop:'',lv:7},
        m13:{id:"m13",name:"暗之虹膜教主",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum26/026",drop:'',lv:7},
        m14:{id:"m14",name:"暗之双头金刚",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum27/027",drop:'',lv:7},
        m15:{id:"m15",name:"暗之沃玛教主",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum28/028",drop:'',lv:7},
        m16:{id:"m16",name:"刀卫",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:1.5,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum29/029",drop:'',lv:7},
        m17:{id:"m17",name:"虎卫",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:1.5,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum30/030",drop:'',lv:7},
        m18:{id:"m18",name:"鹰卫",hp:10000,defense:100,hurt:240,expDead:1000,heal:100,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:4,model:"ani/hum31/031",drop:'',lv:7},
        m19:{id:"m19",name:"白虎",hp:2400,hpAdd:0,defense:30,defenseAdd:0,hurt:100,hurtAdd:0,expDead:0,heal:100,healAdd:0,
            moveSpeed:1,attackSpeed:0.7,checkDistance:4,visibleDistance:6,attackDistance:1.5,model:"ani/hum32/032",lv:1},
        m20:{id:"m20",name:"鸡",hp:1,defense:0,hurt:1,expDead:10,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:5,visibleDistance:9,attackDistance:1.5,model:"ani/hum72/072",drop:'',lv:1},
        m21:{id:"m21",name:"幽冥大魔神",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum52/052",drop:'',lv:6},
        m22:{id:"m22",name:"天界魔王",hp:10000,defense:100,hurt:300,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum53/053"
            ,drop:'i001700,7,i001701,4,i001702,1,i001800,7,i001801,4,i001802,1,i001900,7,i001901,4,i001902,1,i002000,7,i002001,4,i002002,1,i002100,7,i002101,4,i002102,1',lv:7},
        m23:{id:"m23",name:"鼠王",hp:10000,defense:100,hurt:300,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum54/054"
            ,drop:'i001700,7,i001701,4,i001702,1,i001800,7,i001801,4,i001802,1,i001900,7,i001901,4,i001902,1,i002000,7,i002001,4,i002002,1,i002100,7,i002101,4,i002102,1',lv:7},
        m24:{id:"m24",name:"牛魔王",hp:10000,defense:100,hurt:200,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum26/026"
            ,drop:'i001700,7,i001701,4,i001702,1,i001800,7,i001801,4,i001802,1,i001900,7,i001901,4,i001902,1,i002000,7,i002001,4,i002002,1,i002100,7,i002101,4,i002102,1',lv:7},
        m25:{id:"m25",name:"嗜血魔王",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum55/055",drop:'',lv:6},
        m26:{id:"m26",name:"幻灵魔王",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum56/056",drop:'',lv:6},
        m27:{id:"m27",name:"九天神龙",hp:30000,defense:150,hurt:400,expDead:2000,heal:500,
            moveSpeed:1.5,attackSpeed:1.5,checkDistance:5,visibleDistance:5,attackDistance:5,model:"ani/hum57/057",drop:'',lv:9},
        m28:{id:"m28",name:"狂龙教主",hp:30000,defense:150,hurt:400,expDead:2000,heal:500,
            moveSpeed:1.2,attackSpeed:1.2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum58/058",drop:'',lv:9},
        m29:{id:"m29",name:"狱火魔龙",hp:30000,defense:150,hurt:400,expDead:2000,heal:500,
            moveSpeed:1.2,attackSpeed:1.2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum59/059",drop:'',lv:9},
        m30:{id:"m30",name:"幽冥蝇王",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum60/060",drop:'',lv:6},
        m31:{id:"m31",name:"幽冥流星锤统领",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum61/061",drop:'',lv:6},
        m32:{id:"m32",name:"幽冥追魂斧王",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum62/062",drop:'',lv:6},
        m33:{id:"m33",name:"幽冥猪王",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum63/063",drop:'',lv:6},
        m34:{id:"m34",name:"圣兽之王",hp:8800,defense:150,hurt:280,expDead:880,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum64/064",drop:'',lv:8},
        m35:{id:"m35",name:"天宫之主",hp:10000,defense:150,hurt:280,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum65/065",drop:'',lv:8},
        m36:{id:"m36",name:"神王",hp:15000,defense:150,hurt:280,expDead:1500,heal:200,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum65/065",drop:'',lv:8},
        m37:{id:"m37",name:"天宫侍卫",hp:2500,defense:10,hurt:100,expDead:250,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum66/066",drop:'',lv:4},
        m38:{id:"m38",name:"天宫蜴卫",hp:2500,defense:10,hurt:100,expDead:250,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum67/067",drop:'',lv:4},
        m39:{id:"m39",name:"天宫祭师",hp:2500,defense:10,hurt:100,expDead:250,heal:0,
            moveSpeed:2,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum68/068",drop:'',lv:4},
        m40:{id:"m40",name:"天宫女王",hp:10000,defense:150,hurt:280,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum69/069",drop:'',lv:8},
        m41:{id:"m41",name:"舞后",hp:15000,defense:150,hurt:280,expDead:1500,heal:200,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum69/069",drop:'',lv:8},
        m42:{id:"m42",name:"天宫大神官",hp:10000,defense:150,hurt:280,expDead:1000,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum70/070",drop:'',lv:8},
        m43:{id:"m43",name:"招魂王",hp:15000,defense:150,hurt:280,expDead:1500,heal:200,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum70/070",drop:'',lv:8},
        m44:{id:"m44",name:"驽马法老",hp:6000,defense:100,hurt:240,expDead:600,heal:100,
            moveSpeed:1,attackSpeed:1.5,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum71/071",drop:'',lv:7},
        m45:{id:"m45",name:"爱情鸟",hp:9000,defense:0,hurt:100,expDead:900,heal:50,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum72/072",drop:'',lv:5},
        m46:{id:"m46",name:"蚁王",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum73/073",drop:'',lv:6},
        m47:{id:"m47",name:"蚁后",hp:8000,defense:50,hurt:180,expDead:800,heal:100,
            moveSpeed:1,attackSpeed:2,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum74/074",drop:'',lv:6},
        m48:{id:"m48",name:"丁春秋",hp:30000,defense:200,hurt:450,expDead:2000,heal:500,
            moveSpeed:0.8,attackSpeed:0.8,checkDistance:4,visibleDistance:9,attackDistance:1.5,model:"ani/hum10/010",drop:'',lv:9},
        m49:{id:"m49",name:"玄冰魔王",hp:40000,defense:250,hurt:550,expDead:4000,heal:500,
            moveSpeed:1.2,attackSpeed:1.2,checkDistance:5,visibleDistance:9,attackDistance:5,model:"ani/hum223/223",drop:'',lv:10},
        m50:{id:"m50",name:"黑鬼天葬",hp:50000,defense:250,hurt:650,expDead:5000,heal:500,
            moveSpeed:1,attackSpeed:1,checkDistance:5,visibleDistance:9,attackDistance:5,model:"ani/hum224/224",drop:'',lv:10},
        m51:{id:"m51",name:"幽冥骑士",hp:50000,defense:250,hurt:700,expDead:5000,heal:500,
            moveSpeed:0.9,attackSpeed:0.9,checkDistance:5,visibleDistance:9,attackDistance:5,model:"ani/hum225/225",drop:'',lv:11},
        m52:{id:"m52",name:"炼狱巨魔",hp:50000,defense:250,hurt:800,expDead:5000,heal:500,
            moveSpeed:0.8,attackSpeed:0.8,checkDistance:5,visibleDistance:9,attackDistance:5,model:"ani/hum226/226",drop:'',lv:11},
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

        i001030 : {id:'i001030',name:'天龙之刃',type:0,hurt:80,exclusive:[0,1,2,3,4,5],model:'ani/hum112/112',level:10},
        i001031 : {id:'i001031',name:'主宰神剑',type:0,hurt:100,exclusive:[0,1,2,3,4,5],model:'ani/hum229/229',level:11},

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
        i001130 : {id:'i001130',name:'天龙头盔',type:1,hurt:8,defense:12,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i001131 : {id:'i001131',name:'主宰头盔',type:1,hurt:9,defense:13,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i001132 : {id:'i001132',name:'皓月头盔',type:1,hurt:10,defense:14,exclusive:[0,1,2,3,4,5],model:'',level:12},

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
        i001230 : {id:'i001230',name:'天龙战甲(男)',type:2,hurt:13,defense:24,exclusive:[0,2,4],model:'ani/hum113/113',level:10},
        i001231 : {id:'i001231',name:'天龙战甲(女)',type:2,hurt:13,defense:24,exclusive:[1,3,5],model:'ani/hum114/114',level:10},
        i001232 : {id:'i001232',name:'主宰神甲(男)',type:2,hurt:15,defense:30,exclusive:[0,2,4],model:'ani/hum227/227',level:11},
        i001233 : {id:'i001233',name:'主宰神甲(女)',type:2,hurt:15,defense:30,exclusive:[1,3,5],model:'ani/hum228/228',level:11},


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
        i001311 : {id:'i001311',name:'黄金项链',type:3,hurt:18,exclusive:[0,1],model:'',level:6},
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
        i001330 : {id:'i001330',name:'天龙项链',type:3,hurt:30,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i001331 : {id:'i001331',name:'主宰项链',type:3,hurt:33,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i001332 : {id:'i001332',name:'皓月项链',type:3,hurt:38,exclusive:[0,1,2,3,4,5],model:'',level:12},

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
        i001430 : {id:'i001430',name:'天龙手镯',type:4,hurt:20,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i001431 : {id:'i001431',name:'主宰手镯',type:4,hurt:22,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i001432 : {id:'i001432',name:'皓月手镯',type:4,hurt:25,exclusive:[0,1,2,3,4,5],model:'',level:12},

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
        i001530 : {id:'i001530',name:'天龙戒指',type:5,hurt:20,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i001531 : {id:'i001531',name:'主宰戒指',type:5,hurt:22,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i001532 : {id:'i001532',name:'皓月戒指',type:5,hurt:25,exclusive:[0,1,2,3,4,5],model:'',level:12},

        i001700 : {id:'i001700',name:'狮蛮腰带',type:7,hurt:1,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:7},
        i001701 : {id:'i001701',name:'狼牙腰带',type:7,hurt:2,defense:4,exclusive:[0,1,2,3,4,5],model:'',level:8},
        i001702 : {id:'i001702',name:'七星腰带',type:7,hurt:3,defense:6,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i001730 : {id:'i001730',name:'天龙腰带',type:7,hurt:4,defense:8,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i001731 : {id:'i001731',name:'主宰腰带',type:7,hurt:5,defense:10,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i001732 : {id:'i001732',name:'皓月腰带',type:7,hurt:6,defense:13,exclusive:[0,1,2,3,4,5],model:'',level:12},
        i001800 : {id:'i001800',name:'狮蛮靴',type:8,hurt:1,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:7},
        i001801 : {id:'i001801',name:'狼牙靴',type:8,hurt:2,defense:4,exclusive:[0,1,2,3,4,5],model:'',level:8},
        i001802 : {id:'i001802',name:'七星靴',type:8,hurt:3,defense:6,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i001830 : {id:'i001830',name:'天龙靴',type:8,hurt:4,defense:8,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i001831 : {id:'i001831',name:'主宰靴',type:8,hurt:5,defense:10,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i001832 : {id:'i001832',name:'皓月靴',type:8,hurt:6,defense:13,exclusive:[0,1,2,3,4,5],model:'',level:12},
        i001900 : {id:'i001900',name:'狮蛮宝石',type:9,hurt:2,defense:1,exclusive:[0,1,2,3,4,5],model:'',level:7},
        i001901 : {id:'i001901',name:'狼牙宝石',type:9,hurt:4,defense:2,exclusive:[0,1,2,3,4,5],model:'',level:8},
        i001902 : {id:'i001902',name:'七星宝石',type:9,hurt:6,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i001930 : {id:'i001930',name:'天龙宝石',type:9,hurt:8,defense:4,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i001931 : {id:'i001931',name:'主宰宝石',type:9,hurt:10,defense:5,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i001932 : {id:'i001932',name:'皓月宝石',type:9,hurt:13,defense:6,exclusive:[0,1,2,3,4,5],model:'',level:12},
        i002000 : {id:'i002000',name:'释迦摩尼盾',type:10,hurt:1,defense:3,exclusive:[0,1,2,3,4,5],model:'',level:7},
        i002001 : {id:'i002001',name:'唯我独尊盾',type:10,hurt:2,defense:6,exclusive:[0,1,2,3,4,5],model:'',level:8},
        i002002 : {id:'i002002',name:'毁天灭地盾',type:10,hurt:3,defense:9,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i002003 : {id:'i002003',name:'天龙神盾',type:10,hurt:5,defense:10,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i002004 : {id:'i002004',name:'主宰神盾',type:10,hurt:7,defense:12,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i002005 : {id:'i002005',name:'皓月神盾',type:10,hurt:10,defense:15,exclusive:[0,1,2,3,4,5],model:'',level:12},
        i002100 : {id:'i002100',name:'狮蛮章',type:11,hurt:3,exclusive:[0,1,2,3,4,5],model:'',level:7},
        i002101 : {id:'i002101',name:'狼牙章',type:11,hurt:6,exclusive:[0,1,2,3,4,5],model:'',level:8},
        i002102 : {id:'i002102',name:'七星章',type:11,hurt:9,exclusive:[0,1,2,3,4,5],model:'',level:9},
        i002130 : {id:'i002130',name:'天龙章',type:11,hurt:12,exclusive:[0,1,2,3,4,5],model:'',level:10},
        i002131 : {id:'i002131',name:'主宰章',type:11,hurt:17,exclusive:[0,1,2,3,4,5],model:'',level:11},
        i002132 : {id:'i002132',name:'皓月章',type:11,hurt:21,exclusive:[0,1,2,3,4,5],model:'',level:12},

    },
};