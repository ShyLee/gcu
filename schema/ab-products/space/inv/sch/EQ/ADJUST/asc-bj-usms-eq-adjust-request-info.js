var abCreateReqBasicInputTabController = View.createController("abCreateReqBasicInputTabController", {
	afterViewLoad: function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
	},
    afterInitialDataFetch:function(){
    	this.onStart();
    },	
	helpPanel_afterRefresh:function(){
		this.onStart();
	},
	onStart:function(){
		var eqId=this.tabs.eqId;
		var rtrId=this.tabs.rtrId;
		
		var userName=View.user.name;//为测试数据，防止出错而添加的判断
		var emId=View.user.employee.id;
		var dvId=ASEQ_getUserDvId(emId);
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause("eq_change.eq_id",eqId,"=");
		restriction.addClause("eq_change.rtr_dip_id",rtrId,"=");
		this.requestPanel.refresh(restriction);
		var nameList = ASEQ_getEmName(emId);
		if (nameList == null) {
			this.emName = userName;
		} else {
			this.emName = nameList[0];
		}
		this.helpPanel.show(false);
		var currentDate = ASEQ_getCurrentDate_Client();
		this.requestPanel.setFieldValue("eq_change.adjust_date",currentDate);
		//申请人姓名
		this.requestPanel.setFieldValue("eq_change.adjust_em_id",emId);
		this.requestPanel.setFieldValue("eq_change.adjust_em_name",this.emName);
		
		var dvName = ASEQ_getDvName(dvId);
		this.requestPanel.setFieldValue("eq_change.adjust_dv_id",dvId);
		this.requestPanel.setFieldValue("eq_change.adjust_dv_name",dvName);
		

		var res=new Ab.view.Restriction();
		this.eqDetailPanel.applyVpaRestrictions=false;
		res.addClause("eq.eq_id",eqId,"=");
		this.eqDetailPanel.refresh(res);
		
		var res1=new Ab.view.Restriction();
		res1.addClause("eq_attach.eq_id",eqId,"=");
		this.eqAttachPanel.applyVpaRestrictions=false;
		this.eqAttachPanel.refresh(res1);
		if(eqId==null){
			this.eqAttachPanel.setTitle("设备附件列表");
		}else{
			this.eqAttachPanel.setTitle("设备【"+eqId+"】的附件列表");
		}
		
	},
	/**
	 * 提交调剂申请
	 * 调剂申请是二级单位根据其他单位退还的设备  
	 */
	requestPanel_onSubmit : function() { 
		if(this.requestPanel.canSave()){
			var controller=this;
			var confirmMessage="确定要提交申请单吗?";
			View.confirm(confirmMessage, function(button){
				if (button == 'yes') {
					try {
						controller.requestPanel.setFieldValue("eq_change.adjust_status",'1');
						controller.requestPanel.setFieldValue("eq_change.approved_status",'1');
						controller.requestPanel.setFieldValue("eq_change.type_adjust",'1');
						controller.requestPanel.save();
						controller.requestPanel.actions.get('submit').enable(false);
						View.showMessage("申请已提交");
					}catch(e){
						View.showMessage(e.message);
						return;
					}
				}
			});
		}
	},
	requestPanel_onBack : function() {
		var tabName = 'selectTab';
		this.tabs.findTab(tabName).loadView();
		this.tabs.selectTab(tabName);
	}
});
