var dialogController=View.createController('dialogController',{
	afterInitialDataFetch:function(){
		var user = this.view.user;
		if(user.role == "UNV EQ HEAD")
		{
			this.showEqAttachPanel.setTitle("全校设备附件列表");
		}
		
	}
});