module.exports={
    //全局变量相关
    //_gameLayer:null,


    //相关数据
    _data:null,
    _sessionId:-1,
	_id:100000,
	_level:1,
	_name:"红军小战士",
	_camp:"liuxing",
	_hero:"fighter",
	_sex:"boy",
	_exp:0,
	_player:null,
	_tileSize:cc.p(60,60),
	_map:"mafa",
	_skillLevel:[0,0,0,0],
	_skillPointCount:1,
	_bornLocation:cc.p(2,2),
	

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
	
	
	//player is collision with tile or wall.
	isCollision:function(location){
		var rect = cc.rect(1,1,MapData[this._map].size.width,MapData[this._map].size.height);
		if(cc.rectContainsPoint(rect,location)==false)return true;
		var collision = MapData[this._map].collision;
		for(var v in collision){
			if(LuaUtils.pEqual(cc.p(v[1],v[2]),location))return true;
		}
		return false;
	},
	
	
	
	//get an moveable place.let monster born and relife.
	getStandLocation:function(){
		var w=MapData[this._map].size.width;
		var h=MapData[this._map].size.height;
		var location = cc.p(math.random(1,w),math.random(1,h));
		while(this.isCollision(location)){
			location = cc.p(math.random(1,w),math.random(1,h));
		}
		return location;
	},
	

};
