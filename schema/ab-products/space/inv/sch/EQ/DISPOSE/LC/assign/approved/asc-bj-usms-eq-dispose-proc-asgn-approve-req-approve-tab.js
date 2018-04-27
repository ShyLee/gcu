var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
	record: null,
	parameters: {'rtrId':0,'dvId':''},
	ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.selectBasicFormByRequestType();
		
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setRecord(this.record);
        var red=this.record;

        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.show(true);
       // this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log');
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
        
        
        var rtr_dip_id = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue("activity_log.rtr_dip_id");
        
        var res = new  Ab.view.Restriction();
		res.addClause("return_dispose.rtr_dip_id",rtr_dip_id);
		this.returnDisposePanel.refresh(res);
		
		var res2 = new  Ab.view.Restriction();
		res2.addClause("eq_change.rtr_dip_id",rtr_dip_id);
		this.eqChangePanel.refresh(res2);
		this.eqChangePanelPrint.refresh(res2);
		this.eqChangePanelPrint.show(false);
		
		USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1,false);
        
    },
    
	selectBasicFormByRequestType: function(){
		//this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
        this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord(); 
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName){
		var panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm1");
		
        var historyPanel = this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', tableName, 'activity_log_id', panel.getFieldValue('activity_log.activity_log_id'));
            
            var apps = eval('(' + result.jsonExpression + ')');
            if (apps.length == 0) {
                historyPanel.show(false);
            }
            else {
                historyPanel.show(true);
                var restriction = new Ab.view.Restriction();
                if (apps.length == 1) {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=");
                }
                else {
                    restriction.addClause('helpdesk_step_log.step_log_id', apps[0].step_log_id, "=", ")AND(");
                    for (var i = 1, app; app = apps[i]; i++) {
                        restriction.addClause('helpdesk_step_log.step_log_id', app.step_log_id, "=", "OR");
                    }
                }
                historyPanel.refresh(restriction);
            }
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
    },
	
    onBack: function(){
        View.getWindow('parent').View.setTitle("设备管理-审批");
        //select next tab and reload the tab view
        var tabName = 'selectRequestTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
	//审批信息
    onShowApproveWindow: function(){
        $("comments").value = '';
        var role=View.user.role;
        var area = this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.getFieldValue('activity_log.area');
        var count_rm = this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.getFieldValue('activity_log.count_rm');
      
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.save();
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
            width: 800,
            height: 300
        })
    },

    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onApprove: function(){
    	    	
    	var record = this.getRecord();
        var comments = $("comments").value;
        if(comments.length<1){
        	View.showMessage("请输入审核批语!");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        //如果审批成功，同时要更新return_dispose表的数据 标记此处置单已经完成处置
        if (result.code == 'executed') {
			var activityID = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord().getValue('activity_log.activity_log_id');
			var actRes=new Ab.view.Restriction();
			actRes.addClause('activity_log.activity_log_id',activityID,'=');
			var status=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabFormDS').getRecord(actRes).getValue('activity_log.status');
			
			//修改eq_check的状态为通过
			var restriction=new Ab.view.Restriction();
			var rtr_dip_id = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue("activity_log.rtr_dip_id");
			restriction.addClause("return_dispose.rtr_dip_id",rtr_dip_id,"=");
			
			var rtr_dip_idRecord = this.dispose_DS.getRecord(restriction);
			if(status == 'APPROVED')
			{
    			rtr_dip_idRecord.setValue("return_dispose.audit_status",'2');
    			//更改设备状态
    			var rtr_dip_id = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue("activity_log.rtr_dip_id");
    			var eqChangeStatusRes=new Ab.view.Restriction();
    			eqChangeStatusRes.addClause('eq_change.rtr_dip_id',rtr_dip_id,'=');
    			var eqChangeStatusDs=View.dataSources.get('eqChangeStatusDs');
    			var eqDs=View.dataSources.get('eqStatusDs');
    			var eqChangeRecords=eqChangeStatusDs.getRecords(eqChangeStatusRes);
    	    	for(var i=0;i<eqChangeRecords.length;i++){
    	    		var eqChangeRec=eqChangeRecords[i];
    	    		var eqId=eqChangeRec.getValue('eq_change.eq_id');
    	    		var ecStatus=eqChangeRec.getValue('eq_change.status');
    	    		//将eq表中eq的状态更改为相应的状态
    	    		var eqRes=new Ab.view.Restriction();
    	    		eqRes.addClause('eq.eq_id',eqId,'=');
    	    		var eqRec=eqDs.getRecord(eqRes);
    	    		eqRec.setValue('eq.sch_status',ecStatus);
    	    		eqDs.saveRecord(eqRec);
    	    	}
    			 
			}
			rtr_dip_idRecord.setValue('return_dispose.comments',comments);
	        this.dispose_DS.saveRecord(rtr_dip_idRecord);		
		} 
        this.closeApproveWindow(false);
        this.returnDisposePanel.refresh();
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('approve').forceDisable(true);
      	View.alert("审批成功!");
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onReject: function(){
        //将处置申请状态改为审核未通过
    	var record = this.getRecord();
        var comments = $("comments").value;
        if(comments.length<1){
        	View.showMessage("请输入审核批语!");
        	return ;
        }
        
        var rtrDs=View.dataSources.get('dispose_DS');
        var rtrDipId=this.returnDisposePanel.getFieldValue('return_dispose.rtr_dip_id');
        if(!valueExistsNotEmpty(rtrDipId)){
        	View.alert('不存在此处置单,无法执行驳回操作');
        	return;
        }
        var rtrRes=new Ab.view.Restriction();
        rtrRes.addClause('return_dispose.rtr_dip_id',rtrDipId,'=');
        rtrRecord=rtrDs.getRecord(rtrRes);
        rtrRecord.setValue('return_dispose.audit_status','3');
        rtrRecord.setValue('return_dispose.comments',comments);
        rtrDs.saveRecord(rtrRecord);
        this.closeApproveWindow(false);
        this.returnDisposePanel.refresh();
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('approve').forceDisable(true);
      	View.alert("此处置单已成功驳回申请单位!");
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onForward: function(){
        var forwardTo = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue("activity_log.approved_by");
        if (!forwardTo) {
            View.alert(getMessage('请在 审批转发给 输入框后选择，要转发的目标用户。'))
            return;
        }
        
        var record = this.getRecord();
        var comments = $("comments").value;
        
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-forwardApproval', record, comments, forwardTo);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        this.closeApproveWindow(false);
        View.showMessage("审批转发！");
    },
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        return record;
    },
    
    closeApproveWindow: function(isReject){
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.closeWindow();
        if (isReject) {
            this.showHistoryPanel('hactivity_log');
        }
        else {
            this.showHistoryPanel('activity_log');
        }
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('approve').enable(false);	
    },
    eqChangePanel_eq_name_onClick: function(row){
    	var eq_id = row.getFieldValue("eq_change.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
    },
    eqChangePanel_afterRefresh: function(){
    	var role=View.user.role;
    	var gridRows=this.eqChangePanel.gridRows;
    	for(var i=0;i<gridRows.length;i++){
    		var row=gridRows.get(i);
    		if(role!='UNV EQ ADMIN'){
    			row.actions.get('dispose').setTitle('查看设备报减信息');
            }
    	}
    	
    },
    eqChangePanel_dispose_onClick: function(row){
    	var rtr_dip_id = row.getFieldValue("eq_change.rtr_dip_id");
    	var eqId=row.getFieldValue("eq_change.eq_id");
    	var res = new  Ab.view.Restriction();
		res.addClause("eq_change.rtr_dip_id",rtr_dip_id);
		res.addClause("eq_change.eq_id",eqId);
		this.eqChangeFormPanel.refresh(res);
		/*
		//此处根据审批角色确定是否能修改某些项目
		var em_id = View.user.name;
		var res2 = new  Ab.view.Restriction();
		res2.addClause("sc_role_em.em_id",em_id);
		var record = this.sc_role_em_DS.getRecord(res2);
		if(!record.isNew){
			var role = record.getValue("sc_role_em.role");
			if(role == "设备科管理员"){
				this.eqChangeFormPanel.enableField("eq_change.status",true);
			}else{
				this.eqChangeFormPanel.enableField("eq_change.status",false);
			}
			if(role == "设备科领导"){
				this.eqChangeFormPanel.enableField("eq_change.cost",true);
			}else{
				this.eqChangeFormPanel.enableField("eq_change.cost",false);
			}
			
		}else{
			this.eqChangeFormPanel.enableField("eq_change.status",false);
			this.eqChangeFormPanel.enableField("eq_change.cost",false);
		}
		*/
		this.eqChangeFormPanel.showInWindow({
        	width: 800,
        	height: 400
        });
		var role=View.user.role;
    	if(role!='UNV EQ ADMIN'){
    		this.eqChangeFormPanel.enableField('eq_change.status',false);
    		this.eqChangeFormPanel.actions.get('save').show(false);
        }else{
        	this.eqChangeFormPanel.enableField('eq_change.status',true);
    		this.eqChangeFormPanel.actions.get('save').show(true);
        }
    },
    eqChangeFormPanel_onSave: function(){
    	this.eqChangeFormPanel.save();
    	this.eqChangeFormPanel.closeWindow();
    	this.eqChangePanel.refresh();
    },
  //打印处置单
    returnDisposePanel_onReport: function(){
		//固定报表
		var rtr_dip_id = this.returnDisposePanel.getFieldValue("return_dispose.rtr_dip_id");
		var dvId=this.returnDisposePanel.getFieldValue("return_dispose.dv_id");
		if(!valueExistsNotEmpty(rtr_dip_id)){
			View.alert('没有退还单号,不能打印 !');
			return;
		}
		if(rtr_dip_id==0){
			View.alert('退还单号没有成功传入,不能打印!');
			return;
		}
		var eqCountDs=View.dataSources.get("eqChangeCountDs");
		var eqCountRes=new Ab.view.Restriction();
		eqCountRes.addClause("eq_change.rtr_dip_id",rtr_dip_id,'=');
		
		var count=parseInt(eqCountDs.getRecord(eqCountRes).getValue("eq_change.countEq"));
		this.parameters['rtrId']=parseInt(rtr_dip_id);
		this.parameters['dvId']=dvId;
		if(count<5){
			View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmChuZhiShenBao",parameters:this.parameters, closeButton:false});
			
		}else{
			View.alert("此处置单下有其余设备，请打印处置单附件!");
			View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmChuZhiShenBaoMulti",parameters:this.parameters, closeButton:false});
		}
		
		//window.open("/archibus/schema/ab-products/htmlreport/printreport.jsp?xmlName=wjmChuZhiShenBao&rtrId="+parseInt(rtr_dip_id)+"&dvId="+dvId);
	},
	//打印处置单附件
	returnDisposePanel_onReportAttr: function(){
		var rtr_dip_id = this.returnDisposePanel.getFieldValue("return_dispose.rtr_dip_id");
		var dvId=this.returnDisposePanel.getFieldValue("return_dispose.dv_id");
		if(!valueExistsNotEmpty(rtr_dip_id)){
			View.alert('没有处置单号,不能打印 !');
			return;
		}
		if(rtr_dip_id==0){
			View.alert('处置单号没有成功传入,不能打印!');
			return;
		}
		var eqCountDs=View.dataSources.get("eqChangeCountDs");
		var eqCountRes=new Ab.view.Restriction();
		eqCountRes.addClause("eq_change.rtr_dip_id",rtr_dip_id,'=');
		
		var count=parseInt(eqCountDs.getRecord(eqCountRes).getValue("eq_change.countEq"));
		this.parameters['rtrId']=parseInt(rtr_dip_id);
		this.parameters['dvId']=dvId;
		if(count<5){
			View.alert("此处置单无附件!");
			return;
		}else{
			View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200,xmlName:"wjmChuZhiShenBaoMultiAttr",parameters:this.parameters, closeButton:false});
		}
	}
      
});

function reloadHistoryPanel(historyPanel){
    var rows = historyPanel.rows;
    
    var datetime = "";
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var user = "";
        if (row['helpdesk_step_log.user_name']) 
            user = row['helpdesk_step_log.user_name'];
        if (row['em.name']) 
            user = row['em.name'];
        if (row['helpdesk_step_log.vn_id']) 
            user = row['helpdesk_step_log.vn_id'];
        row['helpdesk_step_log.vn_id'] = user;
        
        if (row["helpdesk_step_log.date_response"] == "" && row["helpdesk_step_log.time_response"] == "") {
            datetime = '下一步>>';
        }
        else {
            datetime = row["helpdesk_step_log.date_response"] + " " + row["helpdesk_step_log.time_response"];
        }
        row['helpdesk_step_log.date_response'] = datetime;

		if(row['afm_wf_steps.step'] == '基础'){
			if(i==0){
				row['afm_wf_steps.step'] = '申请人提交申请';
			}else{
				row['afm_wf_steps.step'] = '';
			}
		}
    }
    historyPanel.reloadGrid();
}
