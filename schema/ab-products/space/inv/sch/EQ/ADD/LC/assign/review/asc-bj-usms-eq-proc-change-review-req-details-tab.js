var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
	record: null,
	
    afterInitialDataFetch: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.selectBasicFormByRequestType();
		
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setRecord(this.record);
        
        var red=this.record;
    	var addEqId = red.getValue('activity_log.add_eq_id');
    	var restriction=new Ab.view.Restriction();
		    restriction.addClause("add_eq.add_eq_id",addEqId,"=");
		this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.refresh(restriction);
		
        this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.show(true);
       // this.ascBjUsmsProcAsgnApproveReqApproveTabAttachmentForm.refresh(this.tabs.approveTabrestriction);
        this.showHistoryPanel('activity_log');
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
    },
    
	selectBasicFormByRequestType: function(){
        if (this.tabs.requestType != '房屋分配-项目用房') {
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.show(false);
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
            this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord();
        }
        else {
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.refresh(this.tabs.approveTabrestriction);
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.show(false);
            this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.getRecord();
        }
    },
       ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1,false);
    },
	
	ascBjUsmsProcAsgnApproveReqApproveTabForm2_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm2,true);
    },
    
    ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnApproveReqApproveTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName){
		var panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm1");
        if (!panel.visible) {
            panel = View.panels.get("ascBjUsmsProcAsgnApproveReqApproveTabForm2");
        }
		
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
	
    //显示报增设备分配列表
    onShowEqAddListWindow: function(){
    	var restriction=new Ab.view.Restriction();
    	var addEqId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.add_eq_id');
            restriction.addClause("add_eq_list.add_eq_id",addEqId,"=");
        this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh(restriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.showInWindow({
            width: 800,
            height: 300
        })
    },
    //显示预算项详细信息
    onShowBudgetDetailsWindow: function(){
    	var restriction=new Ab.view.Restriction();
	  
    	var budgetItemId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.budget_item_id');
            restriction.addClause("eq_budget_item.budget_item_id",budgetItemId,"=");
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.refresh(restriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.showInWindow({
            width: 800,
            height: 300
        })
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
		this.ascBjUsmsProcAsgnApproveReqApproveTabForm2.actions.get('approve').enable(false);
		
	
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
