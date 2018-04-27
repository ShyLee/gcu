
var controller = View.createController('controller',{
	
	siteId: null,
	prId: null,
	blId: null,
	rmCap:null,
	afterInitialDataFetch: function() {
		var parameters = View.parameters;
		this.siteId = parameters['siteId'];
		this.prId = parameters['prId'];
		this.blId = parameters['blId'];
		
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
	updatebednumberbybl:function(){
		
		var result = {};
		this.rmCap = this.rmNumPanel.getFieldValue("rm.cap_em");
		if(this.rmCap==''){
			View.alert("请输入床位数！");
			return;
		}else{
			//var rmArr = this.getSelectedRoomNum();
			//var newRmArr = rmArr.join("-");
			//var recs = {"blId":this.blId,"rmCap":this.rmCap,"rmArr":rmArr};
			//var recs = {"blId":this.blId,"rmCap":this.rmCap,"newRmArr":newRmArr};
			var recs = {"blId":this.blId,"rmCap":this.rmCap};
			try{
				result = Workflow.callMethod('AbSpaceRoomInventoryBAR-BedNumberSet-plUpdateRoomStandardBedNumber', recs);
			}catch(e){
				Workflow.handleError(e);
			}
			
		}
		alert("修改成功!!");
		View.closeThisDialog();//自动关闭dialog
	},
	
	/**
	 * 此方法是获取选择的房间号
	 */
	/*
	getSelectedRoomNum:function(){
		var selectedRows = this.rmPanel.getSelectedRows();
		var len = selectedRows.length;
		if(len == 0){
			View.alert("请选择房间！")
			return;
		}else{
			var rmArr = new Array();
			for(var i=0;i<len;i++){
				var rmId = selectedRows[i]['rm.rm_id'];
				rmArr.push(rmId)
			}
			return rmArr;
		}
		
	}
	*/
	
})
