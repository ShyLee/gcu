
var controller = View.createController('controller',{
	blId: null,
	flId: null,
	rmUsename:null,
	rmCategory:null,
	rmType:null,
	afterInitialDataFetch: function() {
		var parameters = View.parameters;
		this.blId = parameters['blId'];
		this.flId = parameters['flId'];
	},

	updatermusenamesbyfloor: function(){
		
		this.rmUsename = this.updatermusenamesDsPanel.getFieldValue("rm.rm_use");
		this.rmCategory = this.updatermusenamesDsPanel.getFieldValue("rm.rm_cat");
		this.rmType = this.updatermusenamesDsPanel.getFieldValue("rm.rm_type");
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
					View.alert("请选择房间类别名称！");
					return;					
				}else{					
					var recs = {"flId":this.flId,"rmUsename":this.rmUsename,"rmCategory":this.rmCategory,"rmType":this.rmType};
					try{
						result = Workflow.callMethod('AbSpaceRoomInventoryBAR-BedNumberSet-plUpdateRoomUseNameByFl', recs);
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