var controller=View.createController('printBarCodes',{
	
	sql:"",
	consolePanel_onShow: function(){
		//var restriction = this.consolePanel.getFieldRestriction();
		var restriction=new Ab.view.Restriction();
		this.sql="";
		//建筑物
		var blId=this.consolePanel.getFieldValue('eq.bl_id');
		if(valueExistsNotEmpty(blId)){
			restriction.addClause("eq.bl_id",blId,'=');
			this.sql=this.sql+" and bl_id='"+blId+"'";
		}
		//楼层
		var flId=this.consolePanel.getFieldValue('eq.fl_id');
		if(valueExistsNotEmpty(flId)){
			restriction.addClause("eq.fl_id",flId,'=');
			this.sql=this.sql+" and fl_id='"+flId+"'";
		}
		//单位学院
		var dv_id=this.consolePanel.getFieldValue('eq.dv_id');
		if(valueExistsNotEmpty(dv_id)){
			restriction.addClause("eq.dv_id",dv_id,'=');
			this.sql=this.sql+" and dv_id='"+dv_id+"'";
		}
		//分库类型
		var eq_warehouse=this.consolePanel.getFieldValue('eq.eq_warehouse');
		if(valueExistsNotEmpty(eq_warehouse)){
			restriction.addClause("eq.eq_warehouse",eq_warehouse,'=');
			this.sql=this.sql+" and eq_warehouse='"+eq_warehouse+"'";
		}
		//有无标签
		var is_label=this.consolePanel.getFieldValue('eq.is_label');
		if(valueExistsNotEmpty(is_label)){
			restriction.addClause("eq.is_label",is_label,'=');
			this.sql=this.sql+" and is_label='"+is_label+"'";
		}
		//设备编码
		var eqId=this.consolePanel.getFieldValue('eq.eq_id');
		if(valueExistsNotEmpty(eqId)){
			restriction.addClause("eq.eq_id",eqId,'=');
			this.sql=this.sql+" and eq_id='"+eqId+"'";
		}
		//设备名称
		var eqName=this.consolePanel.getFieldValue('eq.eq_name');
		if(valueExistsNotEmpty(eqName)){
			restriction.addClause("eq.eq_name",'%'+eqName+'%','LIKE');
			this.sql=this.sql+" and eq_name like '%"+eqName+"%'";
		}
		var dateFrom=this.consolePanel.getFieldValue('eq.dateServiceFrom');
		if(valueExistsNotEmpty(dateFrom)){
			restriction.addClause('eq.date_in_service',dateFrom,'&gt;=');
			this.sql=this.sql+" and to_char(date_in_service,'YYYY-MM-dd')>='"+dateFrom+"'";
		}
		var dateTo=this.consolePanel.getFieldValue('eq.dateServiceTo');
		if(valueExistsNotEmpty(dateTo)){
			restriction.addClause('eq.date_in_service',dateTo,'&lt;=');
			this.sql=this.sql+" and to_char(date_in_service,'YYYY-MM-dd')<='"+dateTo+"'";
		}
		this.eqPanel.refresh(restriction);			
	},
	
	eqPanel_onPrintBarCodes:function(){
		var restriction = new Ab.view.Restriction();
		var records = View.panels.get('eqPanel').getSelectedRows();
		if(records.length==0){
			View.showMessage("请选择一个设备!");
		    return;
		  }
		var eqId = records[0]['eq.eq_id'];
//		var eqId = new 	Array();
//		for (var i = 0; i < records.length; i++) {
//			eqId.push(records[0]['eq.eq_id']);
//		  }
//		   
//		View.openDialog("ab-paginated-report-job.axvw?viewName=asc-bj-usms-eq-check-barcodes.axvw", {'eqDS': restriction});
		
		window.open("/archibus/schema/ab-products/htmlreport/tiaoxingmaprintreport.jsp?xmlName=gcu-eq-code&EQ_ID="+eqId);
	    
	},
	eqPanel_onBtnExport:function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
	        width: 470,
	        height: 200,
	        xmlName: "barCodeExport",
	         parameters: {
	        	 'applyId':this.sql
	             
	         },
	        closeButton: false
	    });
	},	
	eqPanel_onChangeStatus:function(){
		var records = View.panels.get('eqPanel').getSelectedRows();
		var account=this.eqDS;
		if(records.length==0){
			View.showMessage("请选择一个设备!");
	   		return;
		}else{
			for (var i = 0; i < records.length; i++) {
				var restriction = new Ab.view.Restriction();
				var eqId=records[i]['eq.eq_id'];
				restriction.addClause('eq.eq_id', eqId, '=');
				var record=account.getRecord(restriction);
				record.setValue("eq.is_label",'1');
				account.saveRecord(record);
			}
			this.eqPanel.refresh();
		}
	}

});
