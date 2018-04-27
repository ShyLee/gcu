var controller=View.createController('listAssignForm',{
	
	afterInitialDataFetch: function(){
	
	},
	consolePanel_onBtnCancel: function(){
		this.consolePanel.clear();
		this.gridPanel.restriction=null;
		this.gridPanel.refresh("");
	},
	consolePanel_onBtnShow: function(){
		var id=this.consolePanel.getFieldValue('eq_change.id');
		var dvIdOld=this.consolePanel.getFieldValue('eq_change.dv_id_old');
		var dvId=this.consolePanel.getFieldValue('eq_change.dv_id');
		var eqId=this.consolePanel.getFieldValue('eq_change.eq_id');
		var eqName=this.consolePanel.getFieldValue('eq_change.eq_name');
		var eqType=this.consolePanel.getFieldValue('eq_change.eq_type');
		var eqRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(id)){
			eqRes.addClause('eq_change.id',id,'=');
		}
		if(valueExistsNotEmpty(dvIdOld)){
			eqRes.addClause('eq_change.dv_id_old',dvIdOld,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			eqRes.addClause('eq_change.dv_id',dvId,'=');
		}
		if(valueExistsNotEmpty(eqId)){
			eqRes.addClause('eq_change.eq_id',eqId,'=');
		}
		if(valueExistsNotEmpty(eqName)){
			eqRes.addClause('eq_change.eq_name','%'+eq_name+'%','Like');
		}
		if(valueExistsNotEmpty(eqType)){
			eqRes.addClause('eq_change.eq_type',eqType,'=');
		}
		
		this.gridPanel.refresh(eqRes);
	},
	formPanel_onBtnDone: function(){
		//将eq_change中的信息进行更新
		var nowTime=getNowTime();
		var eqChangeId=this.formPanel.getFieldValue('eq_change.id');
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_change.id',eqChangeId);
		var eqChangeDs=View.dataSources.get('ascBjEqAssignDs');
		var record=eqChangeDs.getRecord(eqChangeRes);
		var newDvId=this.formPanel.getFieldValue('eq_change.dv_id');
		if(!valueExistsNotEmpty(newDvId)){
			View.alert("转入单位不能为空");
			return;
		}
		var newBlId=this.formPanel.getFieldValue('eq_change.bl_id');
		var newTypeUse=this.formPanel.getFieldValue('eq_change.type_use');
		record.setValue('eq_change.dv_id',newDvId);
		record.setValue('eq_change.type_use',newTypeUse);
		record.setValue('eq_change.bl_id',newBlId);
		record.setValue('eq_change.audit_status','1');
		record.setValue('eq_change.status','1');
		record.setValue('eq_change.date_appraisal',nowTime);
		var user=View.user.employee.id;
		record.setValue('eq_change.person_appraisal',user);
		try{
			eqChangeDs.saveRecord(record);
		}catch(e){
			
			
		}finally{
			
			//对eq表中的信息进行修改
			var eqId=this.formPanel.getFieldValue('eq_change.eq_id');
			var eqRes=new Ab.view.Restriction();
			eqRes.addClause('eq.eq_id',eqId);
			var eqDs=View.dataSources.get('ascBjEqDs');
			var eqRecord=eqDs.getRecord(eqRes);
			eqRecord.setValue('eq.dv_id',newDvId);
			eqRecord.setValue('eq.dp_id','');
			eqRecord.setValue('eq.dl_id','');
			eqRecord.setValue('eq.bl_id',newBlId);
			eqRecord.setValue('eq.fl_id','');
			eqRecord.setValue('eq.rm_id','');
			eqRecord.setValue('eq.type_use',newTypeUse);
			eqRecord.setValue('eq.sch_status','2');
			try{
				eqDs.saveRecord(eqRecord);
			}catch(e){
				for(var p in e){
					document.writeln(e[p]);
				}
			}
			
			this.gridPanel.refresh();
			View.panels.get('formPanel').show(false);
			View.alert("调剂成功");
		}
		
		
		
		
	},
	
	formPanel_afterRefresh: function(){
		//this.formPanel.clear();
	}
});

function getNowTime(){
	var nowTime="";
	var date=new Date();
	var year=date.getFullYear();
	var month=date.getMonth()+1;
	var day=date.getDate();
	nowTime=year+"-"+month+"-"+day;
	return nowTime;
}