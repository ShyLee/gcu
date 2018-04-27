var controller=View.createController('lossCheckViewForm',{
	//当点击清查任务时，显示任务详细和这次任务下各单位清查列表
	clickCheckMain: function(value){
		var selectIndex=this.eqCheckMainListPanel.selectedRowIndex;
		var RowRecord=this.eqCheckMainListPanel.gridRows.get(selectIndex).getRecord();
		var eqCheckMainId=RowRecord.getValue('eq_check_main.check_main_id');
		var mainRes=new Ab.view.Restriction();
		mainRes.addClause('eq_check_main.check_main_id',eqCheckMainId,'=');
		this.eqCheckMainDetailPanel.show(true);
		this.eqCheckMainDetailPanel.refresh(mainRes);
		
		var reportRes=new Ab.view.Restriction();
		reportRes.addClause('eq_check_report.check_main_id',eqCheckMainId,'=');
		this.eqCheckReportSumPanel.show(true);
		this.eqCheckReportLossListPanel.show(false);
		this.eqCheckReportSumPanel.refresh(reportRes);
	},
	//当点击单位时，显示该单位所有的报亏设备
	showDvLossEq: function(){
		var selectIndex=this.eqCheckReportSumPanel.selectedRowIndex;
		var RowRecord=this.eqCheckReportSumPanel.gridRows.get(selectIndex).getRecord();
		var eqCheckMainId=RowRecord.getValue('eq_check_report.check_main_id');
		var dvId=RowRecord.getValue('eq_check_report.dv_id');
		var dpId=RowRecord.getValue('eq_check_report.dp_id');
		var dvName=RowRecord.getValue('dv.dv_name');
		var dpName=RowRecord.getValue('dp.dp_name');
		
		var reportRes=new Ab.view.Restriction();
		reportRes.addClause('eq_check.check_main_id',eqCheckMainId,'=');
		reportRes.addClause('eq_check.dv_id',dvId,'=');
		if(dpId!=""){
			reportRes.addClause('eq_check.dp_id',dpId,'=');
		}else{
			reportRes.addClause('eq_check.dp_id','','IS NULL');
		}
		reportRes.addClause('eq_check.approved','3','=');
		this.eqCheckReportLossListPanel.refresh(reportRes);
		if(dpName!=""){
			this.eqCheckReportLossListPanel.setTitle(dvName+"-"+dpName+" 盘亏设备列表");
		}else{
			this.eqCheckReportLossListPanel.setTitle(dvName+' 盘亏设备列表');
		}
		
		var reportAttachRes=new Ab.view.Restriction();
		reportAttachRes.addClause('eq_check_attach.check_main_id',eqCheckMainId,'=');
		reportAttachRes.addClause('eq_check_attach.dv_id',dvId,'=');
		if(dpId!=""){
			reportAttachRes.addClause('eq_check_attach.dp_id',dpId,'=');
		}else{
			reportAttachRes.addClause('eq_check_attach.dp_id','','IS NULL');
		}
		reportAttachRes.addClause('eq_check_attach.approved','3','=');
		this.eqAttachCheckReportLossListPanel.refresh(reportAttachRes);
		if(dpName!=""){
			this.eqAttachCheckReportLossListPanel.setTitle(dvName+"-"+dpName+"盘亏设备附件列表");
		}else{
			this.eqAttachCheckReportLossListPanel.setTitle(dvName+"盘亏设备附件列表");
		}
	},
	//点击设备编码，弹出设备详细信息panel
	showEqDetial: function(){
		var selectIndex=this.eqCheckReportLossListPanel.selectedRowIndex;
		var RowRecord=this.eqCheckReportLossListPanel.gridRows.get(selectIndex).getRecord();
		var eq_id = RowRecord.getValue("eq_check.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
	}
});