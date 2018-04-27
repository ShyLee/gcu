var abBjBizHouseRmListController =  View.createController('abBjBizHouseRmListController', {
	
	titleText:null,
	afterInitialDataFetch:function(){
		//30301对应的是教工周转房，30305对应的是博士后公寓
		var sql = " rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES;
		this.bizHouseRmGrid.addParameter('isKZF',sql);
		this.titleText="allRoom";
    	this.bizHouseRmGrid.refresh();
	},
	bizHouseRmGrid_onIsKZF:function(){
		var sql = " rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES+" and rm.count_house_yz = 0 ";
		this.bizHouseRmGrid.addParameter('isKZF',sql);
		this.titleText="emptyRoom";
    	this.bizHouseRmGrid.refresh();
	},
	bizHouseRmGrid_onIsWMF:function(){
		var sql = " rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES+"  and rm.count_house_yz > 0 and rm.count_house_yz < rm.count_house_all ";
		this.bizHouseRmGrid.addParameter('isKZF',sql);
		this.titleText="unEmptyRoom";
    	this.bizHouseRmGrid.refresh();
	},
	bizHouseRmGrid_onAll:function(){
		var sql = " rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES;
		this.bizHouseRmGrid.addParameter('isKZF',sql);
		this.titleText="allRoom";
    	this.bizHouseRmGrid.refresh();
	},
	bizHouseRmGrid_afterRefresh:function(){
		if(this.titleText=="allRoom"){
			this.bizHouseRmGrid.setTitle("学校所有周转房列表");
		}else if(this.titleText=="emptyRoom"){
			this.bizHouseRmGrid.setTitle("学校空置周转房列表");
		}else if(this.titleText=="unEmptyRoom"){
			this.bizHouseRmGrid.setTitle("学校所未住满周转房列表");
		}
		
	}
	
	
});