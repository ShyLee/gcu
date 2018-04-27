var ascBjUsmsProcChangeCreateReqAddAttachmentsTabController = View.createController("ascBjUsmsProcChangeCreateReqAddAttachmentsTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
    
    	this.tabs = View.getControl('', 'createRequestTabs');
        
//        this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.refresh(this.tabs.restriction);
//        var record = this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.getRecord();
//        this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabDestricptionForm.setRecord(record);
//        this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabDestricptionForm.show(true);
//        this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabAttachmentForm.refresh(this.tabs.restriction);
//        this.showHistoryPanel();
        var restriction = new Ab.view.Restriction();
        restriction.addClause("activity_log.activity_log_id", this.tabs.activityLodId, "=");               
        this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.refresh(restriction);
        this.docForm.refresh(restriction);
        var res = new Ab.view.Restriction();
        res.addClause("ts_rm_tu_change_log.activity_log_id", this.tabs.activityLodId, "=");
        this.roomListGrid.refresh(res);
   //     this.selectBasicFormByRequestType();
        this.enableField(false);
    },
    
    enableField:function(trueOrFalse){
		 this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.enableField("activity_log.activity_log_id",trueOrFalse);
		 this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.enableField("activity_log.requestor",trueOrFalse);
		 this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.enableField("activity_log.phone_requestor",trueOrFalse);
		 this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.enableField("activity_log.dv_id",trueOrFalse);
		 this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.enableField("activity_log.date_required",trueOrFalse);
		 this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.enableField("activity_log.activity_type",trueOrFalse);
		 this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.enableField("activity_log.description",trueOrFalse);

	},
	 selectBasicFormByRequestType: function(){
	        var restriction = new Ab.view.Restriction();
	        restriction.addClause("activity_log.activity_log_id", this.tabs.activityLogId, "=");               
	        this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.refresh(restriction);
	        var res = new Ab.view.Restriction();
	        res.addClause("tsRmTuChangeLogDS.activity_log_id", this.tabs.activityLogId, "=");
	        this.roomListGrid.refresh(restriction);
	        
	    },
	    
	    ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm_onInsert: function(){
	        View.getWindow('parent').View.setTitle("房屋用途变更-申请");
	        var tabName = 'selectTab';
	        this.tabs.restriction=null;
	        var tab = this.tabs.findTab(tabName);
	        tab.loadView();
	        this.tabs.selectTab(tabName);
	    },
    
    ascBjUsmsProcChangeCreateReqAddAttachmentsTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabHistoryPanel);
    },
    
    ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm_onCreateNew: function(){
        View.getWindow('parent').View.setTitle("房屋用途变更-申请");
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
    
   
    
    showHistoryPanel: function(){
        var historyPanel = this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', 'activity_log', 'activity_log_id', this.ascBjUsmsProcChangeCreateReqAddAttachmentsTabForm.getFieldValue('activity_log.activity_log_id'));
            
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
			/*
        if (row['helpdesk_step_log.em_id']) 
            user = row['helpdesk_step_log.em_id'];
            */
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
