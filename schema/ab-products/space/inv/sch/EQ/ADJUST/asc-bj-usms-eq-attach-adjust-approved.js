var adjustAttachApproveController=View.createController('adjustAttachApproveController',{
	tabs: null,
	eqAttachId:"",
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
		this.eqAttachId=this.tabs.eqAttachId;
		this.rtrId=this.tabs.rtrId;
		var changeId=this.tabs.changeId;
		
		var userName=View.user.name;//为测试数据，防止出错而添加的判断
		var emId=View.user.employee.id;
		var dvId=ASEQ_getUserDvId(emId);
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_attach_change.id",changeId,"=");
		this.requestPanel.refresh(restriction);
		
		var nameList = ASEQ_getEmName(emId);
		if (nameList == null) {
			this.emName = userName;
		} else {
			this.emName = nameList[0];
		}
		this.helpPanel.show(false);
		var currentDate = ASEQ_getCurrentDate_Client();
		this.requestPanel.setFieldValue("eq_attach_change.date_appraisal",currentDate);
		//申请人姓名
		this.requestPanel.setFieldValue("eq_attach_change.person_appraisal",emId);
		this.requestPanel.setFieldValue("eq_attach_change.person_appraisal_name",this.emName);
		
		var dv_id=this.requestPanel.getFieldValue("eq_attach_change.adjust_dv_id");
		var dv_name=this.requestPanel.getFieldValue("eq_attach_change.adjust_dv_name");
		this.requestPanel.setFieldValue("eq_attach_change.dv_id",dv_id);
		this.requestPanel.setFieldValue("eq_attach_change.dv_name",dv_name);
		
		var res1=new Ab.view.Restriction();
		res1.addClause("eq_attach.eq_attach_id",this.eqAttachId,"=");
		this.eqAttachPanel.applyVpaRestrictions=false;
		this.eqAttachPanel.refresh(res1);
	},
	
	requestPanel_onBtnBack: function(){
		var nextTabName ='selectAttachTab';
	    var nextTab = this.tabs.findTab(nextTabName);
	    nextTab.loadView();
	    this.tabs.findTab("requestAttachTab").show(false);
	    this.tabs.selectTab(nextTabName);
	},
	/**
	 * adjust_status 0;未申请;1;已申请;2;已审核;3;已驳回
	 * type_adjust 0;部门内调剂;1;部门间调剂
	 */
	requestPanel_onBtnOKAdjust: function(){
		if(this.requestPanel.canSave()){
		  var controller=this;
		  var confirmMessage="确定要提交申请单吗?";
		  View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
             try {
            	 //1、保存eq_attach_change表 更改adjust_status为已审核
            	 var date=new Date();
            	 controller.requestPanel.setFieldValue("eq_attach_change.date_change",date);
            	 //完成退还状态
//            	 controller.requestPanel.setFieldValue("eq_change.audit_status","1");
            	 //完成调剂状态
            	 controller.requestPanel.setFieldValue("eq_attach_change.adjust_status","2");
            	 
            	 controller.requestPanel.setFieldValue("eq_attach_change.type_adjust","1");
            	 controller.requestPanel.save();
            	 
            	 //2、完成退还审批、更新return_dispose
            	 var apprOption=controller.requestPanel.getFieldValue("eq_attach_change.appraisal_option");
            	 var dvId=controller.requestPanel.getFieldValue("eq_attach_change.dv_id");
            	 var dpId=controller.requestPanel.getFieldValue("eq_attach_change.dp_id");
            	 var res=new Ab.view.Restriction();
            	 res.addClause('return_dispose.rtr_dip_id',controller.rtrId,'=');
            	 var account=View.dataSources.get('return_dispose_ds');
 				 var record=account.getRecord(res);
 				 record.setValue('return_dispose.audit_status','4');
 				 record.setValue('return_dispose.comments',apprOption);
 				 account.saveRecord(record);
 				 
 				//3、完成退还审批，更新eq_attach表 更新设备附件状态=7（调出），然后把改设备对应的附件调剂到申请单位  并且成为独立的设备
 				var account1=View.dataSources.get("eq_attach_ds");
 				var res4=new Ab.view.Restriction();
			    res4.addClause("eq_attach.eq_attach_id",controller.eqAttachId,"=");
			    var recordEqAttach=account1.getRecord(res4);
			    var eq_id = recordEqAttach.getValue('eq_attach.eq_id');
			    recordEqAttach.setValue('eq_attach.sch_status','7');
			    account1.saveRecord(recordEqAttach);
			    
			    var eqDs=View.dataSources.get('eq_ds');
			    var eqRecord = new Ab.data.Record();
				eqRecord.isNew = true;
				eqRecord.setValue('eq.eq_id',recordEqAttach.getValue('eq_attach.eq_attach_id'));
				eqRecord.setValue('eq.eq_name',recordEqAttach.getValue('eq_attach.eq_attach_name'));
				eqRecord.setValue('eq.brand',recordEqAttach.getValue('eq_attach.brand'));
				eqRecord.setValue('eq.eq_std',recordEqAttach.getValue('eq_attach.eq_std'));
				eqRecord.setValue('eq.eq_type',recordEqAttach.getValue('eq_attach.eq_type'));
				eqRecord.setValue('eq.csi_id',recordEqAttach.getValue('eq_attach.csi_id'));
				eqRecord.setValue('eq.eq_warehouse',recordEqAttach.getValue('eq_attach.eq_warehouse'));
				eqRecord.setValue('eq.num_eq',recordEqAttach.getValue('eq_attach.num_eq'));
				eqRecord.setValue('eq.price',recordEqAttach.getValue('eq_attach.price'));
				eqRecord.setValue('eq.total_price',recordEqAttach.getValue('eq_attach.price'));
				eqRecord.setValue('eq.units',recordEqAttach.getValue('eq_attach.units'));
				eqRecord.setValue('eq.source',recordEqAttach.getValue('eq_attach.source'));
				eqRecord.setValue('eq.ctry_id',recordEqAttach.getValue('eq_attach.ctry_id'));
				eqRecord.setValue('eq.ctry_name',recordEqAttach.getValue('eq_attach.ctry_name'));
				eqRecord.setValue('eq.type_use',recordEqAttach.getValue('eq_attach.type_use'));
				eqRecord.setValue('eq.buy_type',recordEqAttach.getValue('eq_attach.buy_type'));
				eqRecord.setValue('eq.source',recordEqAttach.getValue('eq_attach.source'));
				eqRecord.setValue('eq.num_serial',recordEqAttach.getValue('eq_attach.num_serial'));
				eqRecord.setValue('eq.date_purchased',recordEqAttach.getValue('eq_attach.date_purchased'));
				eqRecord.setValue('eq.dv_id',dvId);
				eqRecord.setValue('eq.dp_id',dpId);
				eqRecord.setValue('eq.bl_id',"");
				eqRecord.setValue('eq.fl_id',"");
				eqRecord.setValue('eq.rm_id',"");
				eqRecord.setValue('eq.em_id',"");
				eqRecord.setValue('eq.em_name',"");
				eqRecord.setValue('eq.sch_status',"2");
				eqRecord.setValue('eq.vn_id',recordEqAttach.getValue('eq_attach.vn_id'));
				eqRecord.setValue('eq.subject_funds',recordEqAttach.getValue('eq_attach.subject_funds'));
				eqRecord.setValue('eq.is_up',recordEqAttach.getValue('eq_attach.is_up'));
				eqRecord.setValue('eq.add_comment',recordEqAttach.getValue('eq_attach.add_comment'));
				eqDs.saveRecord(eqRecord);
				
 				//4.把附件的主体设备的附件数量-1
				var eqDs2=View.dataSources.get('eq_ds');
				var res5=new Ab.view.Restriction();
			    res5.addClause("eq.eq_id",eq_id,"=");
			    var recordEq=eqDs2.getRecord(res5);  
			    var num_last=recordEq.getValue("eq.attachments_num");
				var num_now=parseFloat(num_last)-1;
				recordEq.setValue("eq.attachments_num", num_now);	
				eqDs2.saveRecord(recordEq);
				
 				 controller.requestPanel.actions.get('btnOKAdjust').enable(false);
             }catch(e){
            	 View.showMessage(e.message);
                 return;
             }
            }
		  });
		}
	}
});