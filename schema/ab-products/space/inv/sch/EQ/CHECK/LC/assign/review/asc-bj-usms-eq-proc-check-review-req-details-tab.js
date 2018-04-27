var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
	record: null,
	
    afterInitialDataFetch: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.selectBasicFormByRequestType();
		
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setRecord(this.record);
        var red=this.record;
    	var checkId = red.getValue('activity_log.check_id');
    	var restriction=new Ab.view.Restriction();
		    restriction.addClause("eq_check.check_id",checkId,"=");
		this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.refresh(restriction);
		
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.show(true);
       // this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log');
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
    },
    
	selectBasicFormByRequestType: function(){
		this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
        this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord(); 
    },
       ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1,false);
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
        View.getWindow('parent').View.setTitle("房屋分配-审批");
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
        //如果审批成功，同时要更新add_eq表的数据 标记此暴增单已经完成报增
        if (result.code == 'executed') {
			var activityID = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord().getValue('activity_log.activity_log_id');
			var actRes=new Ab.view.Restriction();
			actRes.addClause('activity_log.activity_log_id',activityID,'=');
			var status=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabFormDS').getRecord(actRes).getValue('activity_log.status');
			if(status == 'APPROVED')
			{
				var restriction=new Ab.view.Restriction();
    			var addEqId = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue("activity_log.add_eq_id");
    			restriction.addClause("eq_check.check_id",addEqId,"=");
    			
    			var addEqRecord = this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.getRecord(restriction);
    			addEqRecord.setValue("eq_check.approved",'1');
    			this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.saveRecord(addEqRecord);
			}
		} 
        this.closeApproveWindow(false);
      
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabApproveForm_onReject: function(){
        var record = this.getRecord();
        var comments = $("comments").value;
       
        if(comments.length<1){
        	View.showMessage("请输入评语-驳回原因！");
        	return ;
        }
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record, comments);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
       if (result.code == 'executed') {

			var restriction=new Ab.view.Restriction();
    		var addEqId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue("add_eq.add_eq_id");
    		restriction.addClause("eq_check.check_id",addEqId,"=");
    			
    		var addEqRecord = this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.getRecord(restriction);
    		addEqRecord.setValue("eq_check.approved",'2');
    		this.ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS.saveRecord(addEqRecord);

		} 
        this.closeApproveWindow(true);
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
    //显示设备的详细信息
    onShowEqDetailsWindow: function(){
    	var eq_id = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue("eq_check.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
    },
    onShowCheckInfoWindow: function(){
    	var checkMianId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue("eq_check.check_main_id");
    	var dvId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue("eq_check.dv_id");
		View.openDialog("asc-bj-usms-eq-approved-dialog.axvw", null, false, {
        	width: 800,
        	height: 600,
        	check_main_id: checkMianId,
        	dv_id: dvId
        });
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
