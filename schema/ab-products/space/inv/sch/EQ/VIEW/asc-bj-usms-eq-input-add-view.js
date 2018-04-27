controller = View.createController('eqview', {
	consolePanel_onShow: function(){
		//var restriction = this.consolePanel.getFieldRestriction();
		var restriction=new Ab.view.Restriction();
		//建筑物
		var blId=this.consolePanel.getFieldValue('eq.bl_id');
		if(valueExistsNotEmpty(blId)){
			restriction.addClause("eq.bl_id",blId,'=');
		}
		//楼层
		var flId=this.consolePanel.getFieldValue('eq.fl_id');
		if(valueExistsNotEmpty(flId)){
			restriction.addClause("eq.fl_id",flId,'=');
		}
		//教职工号
		var emId=this.consolePanel.getFieldValue('eq.em_id');
		if(valueExistsNotEmpty(emId)){
			restriction.addClause("eq.em_id",emId,'=');
		}
		//领用人名称
		var emName=this.consolePanel.getFieldValue('eq.em_name');
		if(valueExistsNotEmpty(emName)){
			restriction.addClause("eq.em_name",'%'+emName+'%','LIKE');
		}
		//设备编码
		var eqId=this.consolePanel.getFieldValue('eq.eq_id');
		if(valueExistsNotEmpty(eqId)){
			restriction.addClause("eq.eq_id",eqId,'=');
		}
		//设备名称
		var eqName=this.consolePanel.getFieldValue('eq.eq_name');
		if(valueExistsNotEmpty(eqName)){
			restriction.addClause("eq.eq_name",'%'+eqName+'%','LIKE');
		}
		this.gridPanel.refresh(restriction);		
		this.formPanel.show(false);		
	},
	gridPanel_eq_id_onClick: function(row){
		this.gridPanel_onClick(row)
	},
	gridPanel_eq_name_onClick: function(row){
		this.gridPanel_onClick(row)
	},
	gridPanel_onClick: function(row){
		var eq_id = row.getFieldValue("eq.eq_id");
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq.eq_id",eq_id,"=");
		this.formPanel.refresh(restriction,false);
		
	},
	gridPanel_onAdd:function(){
		this.formPanel.refresh([],true);
		var answer="";
		try {
	        result = Workflow.callMethod('AbSpaceRoomInventoryBAR-EquipmentExtraAdd-getEqId');
	    }
	    catch (e) {
	        Workflow.handleError(e);
	        View.showMessage("操作失败，请联系管理员");
	    }
	    if(result.code == 'executed'){
	    	answer=result.message;
	    	this.formPanel.setFieldValue("eq.eq_id",answer);
	    }		
	    this.formPanel.setFieldValue("eq.input_type","2");
	},
	formPanel_onSave:function(){
		var success=this.formPanel.canSave();
		if(success){
			var price = this.formPanel.getFieldValue("eq.price");
			this.formPanel.setFieldValue("eq.total_price",price);
			this.formPanel.save();
			var record=this.formPanel.getRecord();
			this.eq_DS.saveRecord(record);
			this.gridPanel.refresh();
		}
	}
});

