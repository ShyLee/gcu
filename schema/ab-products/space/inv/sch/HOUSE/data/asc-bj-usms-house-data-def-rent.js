var controller = View.createController('controller', {
	changeRentUnit :function(){
		var rent_type = this.formPanel.getFieldValue("sc_zzfrentstd.rent_type");
		if(rent_type=="0"){
			this.formPanel.setFieldValue("sc_zzfrentstd.unit_rent","0");
		}else{
			this.formPanel.setFieldValue("sc_zzfrentstd.unit_rent","1");
		}
				
	},
	room_stander_view_onAddNew:function(){
		this.formPanel.refresh([],true);
	},
	formPanel_onSave:function(){
		var success=this.formPanel.canSave();
		if(success){
		   this.formPanel.save();
		   this.room_stander_view.refresh();
		}
	},
	formPanel_onDelete:function(){
		var id = this.formPanel.getFieldValue("sc_zzfrentstd.id");
		var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
		    if(button=="yes"){
		    	var restriction=new Ab.view.Restriction();
		    	restriction.addClause("sc_zzfrentstd.id",id,"=");
		    	var record = controller.sc_zzfrentstd_dataSource1.getRecord(restriction);
		    	controller.sc_zzfrentstd_dataSource1.deleteRecord(record);
		    	this.room_stander_view.refresh();
		    }else{
		     
		    }
		});
	}
    
});


