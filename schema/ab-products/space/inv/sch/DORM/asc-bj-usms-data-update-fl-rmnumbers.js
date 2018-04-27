
var controller = View.createController('controller',{
	
	blId: null,
	flId:null,
	rmCap:null,
	afterInitialDataFetch: function() {
		var parameters = View.parameters;
		this.blId = parameters['blId'];
		this.flId = parameters['flId'];
		//this.showTheRm();
	},
//	showTheRm:function(){
//		//alert("111");
//		this.rmNumPanel.setFieldValue('rm.cap_em','');
//		var restriction = new Ab.view.Restriction();
//		restriction.addClause("rm.bl_id",this.blId);
//		var panel = this.rmPanel;
//		panel.refresh(restriction);
//		panel.show(true);
//	},
	updatebyfloor:function(){
		//alert("xxx");
		this.rmCap = this.rmNumPanel.getFieldValue("rm.cap_em");
		var result = {};
		this.rmCap = this.rmNumPanel.getFieldValue("rm.cap_em");
		if(this.rmCap==''){
			View.alert("请输入床位数！");
			return;
		}else{
			
			var recs = {"flId":this.flId,"rmCap":this.rmCap};
			try{
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-BedNumberSet-plUpdateByFloorRoomStandardBedNumber', recs);
			}catch(e){
				Workflow.handleError(e);
			}
			
		}
		alert("修改成功!!");
		View.closeThisDialog();//自动关闭dialog
	},
	
})
