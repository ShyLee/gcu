var adjustApproveController=View.createController('adjustApproveController',{
	tabs: null,
	eqId:"",
	rtrId:"",
	afterInitialDataFetch:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
		this.onStart();
	},
	helpPanel_afterRefresh:function(){
		this.onStart();
	},
	onStart:function(){
		this.tabs=View.getControlsByType(parent, 'tabs')[0];
		this.eqId=this.tabs.eqId;
		this.rtrId=this.tabs.rtrId;
		var changeId=this.tabs.changeId;
		
		var userName=View.user.name;//为测试数据，防止出错而添加的判断
		var emId=View.user.employee.id;
//		var dvId=View.user.employee.organization.divisionId;
		var dvId=ASEQ_getUserDvId(emId);
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_change.id",changeId,"=");
		this.requestPanel.refresh(restriction);
		
		var nameList = ASEQ_getEmName(emId);
		if (nameList == null) {
			this.emName = userName;
		} else {
			this.emName = nameList[0];
		}
		this.helpPanel.show(false);
		var currentDate = ASEQ_getCurrentDate_Client();
		this.requestPanel.setFieldValue("eq_change.date_appraisal",currentDate);
		//申请人姓名
		this.requestPanel.setFieldValue("eq_change.person_appraisal",emId);
		this.requestPanel.setFieldValue("eq_change.person_appraisal_name",this.emName);
		
		var dv_id=this.requestPanel.getFieldValue("eq_change.adjust_dv_id");
		var dv_name=this.requestPanel.getFieldValue("eq_change.adjust_dv_name");
		this.requestPanel.setFieldValue("eq_change.dv_id",dv_id);
		this.requestPanel.setFieldValue("eq_change.dv_name",dv_name);
		
		var res=new Ab.view.Restriction();
		res.addClause("eq.eq_id",this.eqId,"=");
		this.eqDetailPanel.applyVpaRestrictions=false;
		this.eqDetailPanel.refresh(res);
		
		var res1=new Ab.view.Restriction();
		res1.addClause("eq_attach.eq_id",this.eqId,"=");
		this.eqAttachPanel.applyVpaRestrictions=false;
		this.eqAttachPanel.refresh(res1);
		if(this.eqId==null){
			this.eqAttachPanel.setTitle("设备附件列表");
		}else{
			this.eqAttachPanel.setTitle("设备【"+this.eqId+"】的附件列表");
		}
	},
	
	requestPanel_onBtnBack: function(){
		var nextTabName ='selectTab';
	    var nextTab = this.tabs.findTab(nextTabName);
	    nextTab.loadView();
	    this.tabs.findTab("requestTab").show(false);
	    this.tabs.selectTab(nextTabName);
	},
	requestPanel_onBtnOKAdjust: function(){
		if(this.requestPanel.canSave()){
		  var controller=this;
		  var confirmMessage="确定要通过申请单吗?";
		  View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
             try {
            	 //1、保存eq_change表 更改adjust_status为已审核
            	 var date=new Date();
            	 controller.requestPanel.setFieldValue("eq_change.date_change",date);
            	 //完成退还状态
            	 controller.requestPanel.setFieldValue("eq_change.audit_status","1");
            	 //完成调剂状态
            	 controller.requestPanel.setFieldValue("eq_change.adjust_status","2");
            	 
            	 controller.requestPanel.setFieldValue("eq_change.type_adjust","1");
            	 controller.requestPanel.save();
            	 
            	 //2、完成退还审批、更新return_dispose
            	 var apprOption=controller.requestPanel.getFieldValue("eq_change.appraisal_option");
            	 var dvId=controller.requestPanel.getFieldValue("eq_change.dv_id");
            	 var res=new Ab.view.Restriction();
            	 res.addClause('return_dispose.rtr_dip_id',controller.rtrId,'=');
            	 var account=View.dataSources.get('return_dispose_ds');
 				 var record=account.getRecord(res);
 				 record.setValue('return_dispose.audit_status','4');
 				 record.setValue('return_dispose.eq_head_suggest',apprOption);
 				 account.saveRecord(record);
 				 
 				 //3、完成退还审批、更新eq表，把该设备调剂到申请单位
 				 var eqRes=new Ab.view.Restriction();
				 eqRes.addClause('eq.eq_id',controller.eqId,'=');
				 var eqDs=View.dataSources.get('eq_ds');
				 var eqRecord=eqDs.getRecord(eqRes);
				 
 				 eqRecord.setValue('eq.dv_id',dvId);
 				 eqRecord.setValue('eq.bl_id','');
 				 eqRecord.setValue('eq.fl_id','');
 				 eqRecord.setValue('eq.rm_id','');
 				 eqRecord.setValue('eq.em_id','');
 				 eqRecord.setValue('eq.em_name','');
 				 eqRecord.setValue('eq.dp_id','');
 				 eqRecord.setValue('eq.sch_status','2');
 				 eqDs.saveRecord(eqRecord);
 				 
 				 //4、完成退还审批，更新eq_attach表，把改设备对应的附件调剂到申请单位
 				var account1=View.dataSources.get("eq_attach_ds");
             	var res3=new Ab.view.Restriction();
			    res3.addClause("eq_attach.eq_id",controller.eqId,"=");
			    var recordEqs=account1.getRecords(res3);
			    for(var i=0;i<recordEqs.length;i++){
			    	var eqAttachId=recordEqs[i].getValue("eq_attach.eq_attach_id");
			    	var res4=new Ab.view.Restriction();
    			    res4.addClause("eq_attach.eq_attach_id",eqAttachId,"=");
    			    var recordEqAttach=account1.getRecord(res4);
    			    recordEqAttach.setValue("eq_attach.dv_id",dvId);
    			    recordEqAttach.setValue("eq_attach.bl_id","");
    			    recordEqAttach.setValue("eq_attach.fl_id","");
    			    recordEqAttach.setValue("eq_attach.rm_id","");
    			    recordEqAttach.setValue("eq_attach.em_id","");
    			    recordEqAttach.setValue("eq_attach.em_name","");
    			    recordEqAttach.setValue("eq_attach.dp_id","");
    			    recordEqAttach.setValue('eq_attach.sch_status','2');
    			    account1.saveRecord(recordEqAttach);
			    }
 				 
 				 controller.requestPanel.actions.get('btnOKAdjust').enable(false);
             }catch(e){
            	 View.showMessage(e.message);
                 return;
             }
            }
		  });
		}
	},
	requestPanel_onBtnNoAdjust: function(){
		if(this.requestPanel.canSave()){
			var controller=this;
			var confirmMessage="确定要驳回申请单吗?";
			View.confirm(confirmMessage, function(button){
				if (button == 'yes') {
					try {
						//1、保存eq_change表 更改adjust_status为已审核
						var date=new Date();
						controller.requestPanel.setFieldValue("eq_change.date_change",date);
						//完成退还状态  0;已提交;1;审核已通过;2;审核未通过
						controller.requestPanel.setFieldValue("eq_change.audit_status","2");
						//完成调剂状态 0;未申请;1;已申请;2;已审核;3;已驳回
						controller.requestPanel.setFieldValue("eq_change.adjust_status","3");
						//type_adjust 0;部门内调剂;1;部门间调剂;2;退还学校;3;处置
						controller.requestPanel.setFieldValue("eq_change.type_adjust","2");
						controller.requestPanel.save();
						
						//2、完成退还审批、更新return_dispose
						var apprOption=controller.requestPanel.getFieldValue("eq_change.appraisal_option");
//						var dvId=controller.requestPanel.getFieldValue("eq_change.dv_id");
						var res=new Ab.view.Restriction();
						res.addClause('return_dispose.rtr_dip_id',controller.rtrId,'=');
						var account=View.dataSources.get('return_dispose_ds');
						var record=account.getRecord(res);
						//0;未提交;1;已提交;2;审核已通过;3;审核未通过;4;处理完成;5;已公示
						record.setValue('return_dispose.audit_status','3');
						record.setValue('return_dispose.eq_head_suggest',apprOption);
						account.saveRecord(record);
						
//						//3、完成退还审批、更新eq表，把该设备调剂到申请单位
//						var eqRes=new Ab.view.Restriction();
//						eqRes.addClause('eq.eq_id',controller.eqId,'=');
//						var eqDs=View.dataSources.get('eq_ds');
//						var eqRecord=eqDs.getRecord(eqRes);
//						
//						eqRecord.setValue('eq.dv_id',dvId);
//						eqRecord.setValue('eq.bl_id','');
//						eqRecord.setValue('eq.fl_id','');
//						eqRecord.setValue('eq.rm_id','');
//						eqRecord.setValue('eq.em_id','');
//						eqRecord.setValue('eq.em_name','');
//						eqRecord.setValue('eq.dp_id','');
//						eqRecord.setValue('eq.sch_status','2');
//						eqDs.saveRecord(eqRecord);
						
//						//4、完成退还审批，更新eq_attach表，把改设备对应的附件调剂到申请单位
//						var account1=View.dataSources.get("eq_attach_ds");
//						var res3=new Ab.view.Restriction();
//						res3.addClause("eq_attach.eq_id",controller.eqId,"=");
//						var recordEqs=account1.getRecords(res3);
//						for(var i=0;i<recordEqs.length;i++){
//							var eqAttachId=recordEqs[i].getValue("eq_attach.eq_attach_id");
//							var res4=new Ab.view.Restriction();
//							res4.addClause("eq_attach.eq_attach_id",eqAttachId,"=");
//							var recordEqAttach=account1.getRecord(res4);
//							recordEqAttach.setValue("eq_attach.dv_id",dvId);
//							recordEqAttach.setValue("eq_attach.bl_id","");
//							recordEqAttach.setValue("eq_attach.fl_id","");
//							recordEqAttach.setValue("eq_attach.rm_id","");
//							recordEqAttach.setValue("eq_attach.em_id","");
//							recordEqAttach.setValue("eq_attach.em_name","");
//							recordEqAttach.setValue("eq_attach.dp_id","");
//							recordEqAttach.setValue('eq_attach.sch_status','2');
//							account1.saveRecord(recordEqAttach);
//						}
						
						controller.requestPanel.actions.get('btnNoAdjust').enable(false);
					}catch(e){
						View.showMessage(e.message);
						return;
					}
				}
			});
		}
	}
});