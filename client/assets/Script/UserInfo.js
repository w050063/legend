/**
 * Created by bot.su on 2017/6/21.
 * 当前用户信息实例
 */


var AgXYMap = require("./AgXYMap");
module.exports={
    //全局变量相关
    //_gameLayer:null,


    //相关数据
	_accountData:null,
    _data:null,
	_id:100000,
	_level:1,
	_name:"红军小战士",
	_hero:"m0",
	_sex:0,
	_exp:0,
	_player:null,
	_tileSize:cc.p(60,60),
	_map:"mafa",
	_skillLevel:[0,0,0,0],
	_skillPointCount:1,
    _direction:4,
	_itemMap : {},
    backGroundPos :cc.p(-100,-330),
    operatePuton:'right',
    _guildMap : {},
    _guildInvite:null,
    _guildWinId:'',//沙巴克占领者
    _startGameTime :0,
    _version:'0.0.3',
    _needGameEnd:'',


	init:function () {
        //角色动画：衣服，性别，动作，朝向
        this.agAniClothes = {
            "nudeboy000":"000,4",
            "nudeboy001":"004,4",
            "nudeboy002":"008,4",
            "nudeboy003":"012,4",
            "nudeboy004":"016,4",
            "nudeboy005":"020,4",
            "nudeboy006":"024,4",
            "nudeboy007":"028,4",
            "nudeboy010":"032,6",
            "nudeboy011":"038,6",
            "nudeboy012":"044,6",
            "nudeboy013":"050,6",
            "nudeboy014":"056,6",
            "nudeboy015":"062,6",
            "nudeboy016":"068,6",
            "nudeboy017":"074,6",
            "nudeboy020":"080,6",
            "nudeboy021":"086,6",
            "nudeboy022":"092,6",
            "nudeboy023":"098,6",
            "nudeboy024":"104,6",
            "nudeboy025":"110,6",
            "nudeboy026":"116,6",
            "nudeboy027":"122,6",
            "nudeboy030":"128,6",
            "nudeboy031":"134,6",
            "nudeboy032":"140,6",
            "nudeboy033":"146,6",
            "nudeboy034":"152,6",
            "nudeboy035":"158,6",
            "nudeboy036":"164,6",
            "nudeboy037":"170,6",
        };
	},


	//get a vector's direction(8,left,right,up,down....).
	getV:function(pos){
		var offset = {x:0,y:0};
		if(pos.x<-0.01)offset.x=-1;
		if(pos.x>0.01)offset.x=1;
		if(pos.y<-0.01)offset.y=-1;
		if(pos.y>0.01)offset.y=1;
		return offset;
	},
	
	//get every one attack rangle..
	getAttackRange:function(role1,role2){
		var myLocation=role1._location;
		var enemyLocation=role2._location;
		var x=Math.abs(enemyLocation.x-myLocation.x);
		var y=Math.abs(enemyLocation.y-myLocation.y);
		if(role1._hero=="fighter"){
			if (x<=2 && y<=2 && x+y!=3)return true;
		}
		else if(role1._hero=="archmage" || role1._hero=="archmage"){
			if(cc.pGetDistance(myLocation,enemyLocation)<=4)return true;
		}
		else{
			if(x<=1 && y<=1)return true;
		}
		return false;
	},
	
	
	//is or not hit in enemy.
	hitEnemy:function(role,hitPos,ePos){
 		if(role._hero=="fighter"){
			var offset = this.getV(cc.pSub(hitPos,role._location));
			var p1 = cc.pAdd(role._location,offset);
			if(LuaUtils.pEqual(cc.pAdd(p1,offset),ePos))return 2;
			else if(LuaUtils.pEqual(role._location,ePos) || LuaUtils.pEqual(p1,ePos))return 1;
		}
		else if(role._hero=="archmage"){
			var x=Math.abs(ePos.x-hitPos.x);
			var y=Math.abs(ePos.y-hitPos.y);
			if(x<=0.01 && y<=0.01)return 2;
			else if(x<=1 && y<=1)return 1;
		}
		else if(role._hero=="taoist"){
			var x=Math.abs(ePos.x-hitPos.x);
			var y=Math.abs(ePos.y-hitPos.y);
			if(x==0 && y==0)return 1;
		}
		else{
			var offset = this.getV(cc.pSub(hitPos,role._location));
			if(LuaUtils.pEqual(role._location,ePos) || LuaUtils.pEqual(cc.pAdd(role._location,offset),ePos))return 1;
		}
		return 0;
	},
};
