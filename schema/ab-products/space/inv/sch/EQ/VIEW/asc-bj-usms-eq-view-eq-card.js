controller = View.createController('eqview', {
	consolePanel_onShow: function(){
		var csi= this.consolePanel.getFieldValue("eq.csi_id");	
		for(var i=0;i<5;i++){
			csi = csi.replace(/(00)\b/gi,"");
		}
		this.consolePanel.setFieldValue("eq.csi_id",csi);
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
		//房间号
		var rmId=this.consolePanel.getFieldValue('eq.rm_id');
		if(valueExistsNotEmpty(rmId)){
			restriction.addClause("eq.rm_id",rmId,'=');
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
		//分类编码
		var csiId=this.consolePanel.getFieldValue('eq.csi_id');
		if(valueExistsNotEmpty(csiId)){
			restriction.addClause("eq.csi_id",csiId+'%','LIKE');
		}
		//根据当前登录人的角色，显示相应单位的设备
		var user = this.view.user;
		if(user.role == "UNV DV ADMIN" || user.role == "UNV DIVISION HEAD")
		{
			var dv = user.employee.organization.divisionId;
			restriction.addClause("eq.dv_id",dv,"=");
		}
		//根据购置开始时间、结束时间进行相应的筛选
		var dateFrom=this.consolePanel.getFieldValue('date_purchased_from');
		var dateTo=this.consolePanel.getFieldValue('date_purchased_to');
		if(valueExistsNotEmpty(dateFrom)){
			restriction.addClause("eq.date_purchased",dateFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(dateTo)){
			restriction.addClause("eq.date_purchased",dateTo,'&lt;=');
		}
		this.gridPanel.refresh(restriction);		
	},
	gridPanel_eq_id_onClick: function(row){
		this.gridPanel_onClick(row)
	},
	gridPanel_eq_name_onClick: function(row){
		this.gridPanel_onClick(row)
	},
	gridPanel_onClick: function(row){
		var eq_id = row.getFieldValue("eq.eq_id");
		var warranty_id = row.getFieldValue("eq.warranty_id");
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq.eq_id",eq_id,"=");
		this.formPanel.refresh(restriction);
		
		var rest1=new Ab.view.Restriction();
		rest1.addClause("eq_change.eq_id",eq_id,"=");
		this.eq_changePanel.refresh(rest1);
		
		var image_file = row.getFieldValue("eq.doc2").toLowerCase();
		if (valueExistsNotEmpty(image_file)) {
        this.imagePanel.showImageDoc('image_field', 'eq.eq_id', 'eq.doc2');
    		}else {
        this.imagePanel.fields.get('image_field').dom.src = null;
        this.imagePanel.fields.get('image_field').dom.alt = '';
    	}
	}
});

