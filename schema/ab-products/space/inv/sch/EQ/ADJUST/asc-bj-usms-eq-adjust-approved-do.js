var controller=View.createController('adjustDoForm',{
	tabs: null,
	parameters: {'eqChangeId':''},
	
	afterInitialDataFetch: function(){
		this.tabs=View.getControlsByType(parent, 'tabs')[0];
		var eqChangeId=this.tabs.approveTabrestriction['eq_change.id'];
		var eqChangeRes=new Ab.view.Restriction();
		eqChangeRes.addClause('eq_change.id',eqChangeId,'=');
		this.formPanel.refresh(eqChangeRes);
		
	},
	formPanel_afterRefresh: function(){
		var emId=this.formPanel.getFieldValue('eq_change.person_check');
		if(valueExistsNotEmpty(emId)){
			var emRes=new Ab.view.Restriction();
			emRes.addClause('em.em_id',emId,'=');
			var emDs=View.dataSources.get('ascBjUsmsEmDs');
			var record=emDs.getRecord(emRes);
			var emName=record.getValue('em.name');
			this.formPanel.setFieldValue('em.name',emName);
		}else{
			
		}
		
	},
	
	formPanel_onBtnBack: function(){
		var tabs=controller.tabs;
		var nextTabName ='selectTab';
	    var nextTab = tabs.findTab(nextTabName);
	    nextTab.loadView();
	    tabs.selectTab(nextTabName);
	},
	
	formPanel_onBtnUpload: function(){
		View.alert("功能未开发");
	},
	
	formPanel_onBtnOKAdjust: function(){
		var eqId=this.formPanel.getFieldValue('eq_change.eq_id');
		var eqName=this.formPanel.getFieldValue('eq_change.eq_name');
		var dvId=this.formPanel.getFieldValue('eq_change.dv_id');
		var costNow=this.formPanel.getFieldValue('eq_change.cost');
		var option=this.formPanel.getFieldValue('eq_change.appraisal_option');
		
		if(!valueExistsNotEmpty(dvId)){
			View.alert('【使用单位】项不能为空!');
			return;
		}
		if(!valueExistsNotEmpty(costNow)){
			View.alert('【现值】项不能为空');
			return;
		}
		if(!valueExistsNotEmpty(option)){
			View.alert('【审核意见】项不能为空');
			return;
		}
		if(isNaN(costNow)){
			View.alert("【现值】必须为数字格式，如2000");
			return;
		}
		var formPanel=this.formPanel;
		//1.询问是否确定调剂
		View.confirm('将要进行调剂操作，设备编号为：【'+eqId+'】,设备名称为：【'+eqName+'】,是否继续？',function(button){
			if(button=='yes'){
				//1.更改eq中相应信息，如dvId,bulding,floor,room,emId,status="多余",typeUse
				var eqDs=View.dataSources.get('ascBjUsmsEqDs');
				var eqRes=new Ab.view.Restriction();
				eqRes.addClause('eq.eq_id',eqId,'=');
				var record=eqDs.getRecord(eqRes);
				var dvId=formPanel.getFieldValue('eq_change.dv_id');
				record.setValue('eq.dv_id',dvId);
				var blId=formPanel.getFieldValue('eq_change.bl_id');
				if(valueExistsNotEmpty(blId)){
					record.setValue('eq.bl_id',blId);		
				}else{
					record.setValue('eq.bl_id','');
				}
				var price=formPanel.getFieldValue('eq_change.cost');
				record.setValue('eq.price',price);
				record.setValue('eq.fl_id','');
				record.setValue('eq.rm_id','');
				record.setValue('eq.em_id','');
				record.setValue('eq.sch_status','2');
				var dateChange=new Date();
				record.setValue('eq.date_change',dateChange);
				record.setValue('eq.type_use',formPanel.getFieldValue('eq_change.type_use'));
				try{
					eqDs.saveRecord(record);
				}catch(e){
					View.alert("更新设备表时出错，操作终止!");
					return ;
				}
				
				//2.更改eqChange中的内容，更改审核人、审核时间、审核状态、审核意见、dvID,blID,flID,rmID,使用方向
				var eqChangeDs=View.dataSources.get('ascBjUsmsEqAdjustApprovedEqChangeDs');
				var eqChangeId=formPanel.getFieldValue('eq_change.id');
				var eqChangeRes=new Ab.view.Restriction();
				eqChangeRes.addClause('eq_change.id',eqChangeId,'=');
				var eqChangeRecord=eqChangeDs.getRecord(eqChangeRes);
				eqChangeRecord.setValue('eq_change.audit_status','1');
				if(valueExistsNotEmpty(blId)){
					eqChangeRecord.setValue('eq_change.bl_id',blId);
				}else{
					eqChangeRecord.setValue('eq_change.bl_id','');
				}
				eqChangeRecord.setValue('eq_change.fl_id','');
				eqChangeRecord.setValue('eq_change.rm_id','');
				var appraisalPerson=View.user.employee.id;
				eqChangeRecord.setValue('eq_change.person_appraisal',appraisalPerson);
				eqChangeRecord.setValue('eq_change.operator',appraisalPerson);
				var appraisalDate=new Date();
				eqChangeRecord.setValue('eq_change.date_appraisal',appraisalDate);
				eqChangeRecord.setValue('eq_change.date_change',appraisalDate);
				var typeUse=formPanel.getFieldValue('eq_change.type_use');
				eqChangeRecord.setValue('eq_change.type_use',typeUse);
				var appraisalOption=formPanel.getFieldValue('eq_change.appraisal_option');
				eqChangeRecord.setValue('eq_change.appraisal_option',appraisalOption);
				eqChangeRecord.setValue('eq_change.status','1');
				
				eqChangeDs.saveRecord(eqChangeRecord);
				
				View.alert('审批成功!');
				
				
			}
			
		});
	},

	formPanel_onBtnXNTZD: function(){
		var id=this.formPanel.getFieldValue('eq_change.id');
		var eqChangeId=parseInt(id);
		if(eqChangeId==NaN){
			View.alert("设备变更编号非数字格式");
			return;
		}
		this.parameters['eqChangeId']=parseInt(id);
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmReport",parameters:this.parameters, closeButton:false});
	}
});