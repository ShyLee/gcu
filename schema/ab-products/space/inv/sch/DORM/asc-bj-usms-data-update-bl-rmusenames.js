
var controller = View.createController('controller',{
	
	siteId: null,
	prId: null,
	blId: null,
	rmUsename:null,
	rmCategory:null,
	rmType:null,
	afterInitialDataFetch: function() {
		var parameters = View.parameters;
		this.siteId = parameters['siteId'];
		this.prId = parameters['prId'];
		this.blId = parameters['blId'];
		
	},

	updatermusenamebyfloor: function(){
		
		var result = {};
		this.rmUsename = this.updatermusenamesDsPanel.getFieldValue("rm.rm_use");
		this.rmCategory = this.updatermusenamesDsPanel.getFieldValue("rm.rm_cat");
		this.rmType = this.updatermusenamesDsPanel.getFieldValue("rm.rm_type");
		
		if(this.rmUsename==''){
			View.alert("请选择房间大类名称！");
			return;
		}else{
			if(this.rmCategory==''){
				View.alert("请选择房间类别名称！");
				return;
				
			}else{
				if(this.rmType==''){
					View.alert("请选择房间类型名称！");
					return;					
				}else{					
					var recs = {"blId":this.blId,"rmUsename":this.rmUsename,"rmCategory":this.rmCategory,"rmType":this.rmType};
					try{
						result = Workflow.callMethod('AbSpaceRoomInventoryBAR-BedNumberSet-plUpdateRoomUseNameByBl', recs);
					}catch(e){
						Workflow.handleError(e);
					}
				}
			}		
		}
		alert("修改成功!!");
		View.closeThisDialog();//自动关闭dialog
	}
	
})
