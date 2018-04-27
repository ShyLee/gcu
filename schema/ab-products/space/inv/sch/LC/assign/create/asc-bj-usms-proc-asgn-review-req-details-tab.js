var ascBjUsmsProcAsgnReviewReqDetailsTabController = View.createController("ascBjUsmsProcAsgnReviewReqDetailsTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
    	this.onStart();
    },
	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
        if (this.ascBjUsmsProcAsgnReviewReqDetailsTabForm1DS.getRecords(this.tabs.restriction).length > 0) {
            this.ascBjUsmsProcAsgnReviewReqDetailsTabForm1.refresh(this.tabs.restriction);
            var record = this.ascBjUsmsProcAsgnReviewReqDetailsTabForm1.getRecord();
            this.ascBjUsmsProcAsgnReviewReqDetailsTabDestricptionForm1.setRecord(record);
            this.ascBjUsmsProcAsgnReviewReqDetailsTabDestricptionForm1.show(true);
            this.ascBjUsmsProcAsgnReviewReqDetailsTabAttachmentForm1.refresh(this.tabs.restriction);
            this.showHistoryPanel('activity_log', this.ascBjUsmsProcAsgnReviewReqDetailsTabForm1.getFieldValue('activity_log.activity_log_id'));
        }
        else {
            this.ascBjUsmsProcAsgnReviewReqDetailsTabForm2.refresh(this.tabs.restriction);
            var record = this.ascBjUsmsProcAsgnReviewReqDetailsTabForm2.getRecord();
            this.ascBjUsmsProcAsgnReviewReqDetailsTabDestricptionForm2.setRecord(record);
            this.ascBjUsmsProcAsgnReviewReqDetailsTabDestricptionForm2.show(true);
            this.ascBjUsmsProcAsgnReviewReqDetailsTabAttachmentForm2.refresh(this.tabs.restriction);
            this.showHistoryPanel('hactivity_log', this.ascBjUsmsProcAsgnReviewReqDetailsTabForm2.getFieldValue('hactivity_log.activity_log_id'));
        }
	},
    afterSelect:function(){
		this.onStart();
	},
    ascBjUsmsProcAsgnReviewReqDetailsTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnReviewReqDetailsTabForm1,true);
    },
    
    ascBjUsmsProcAsgnReviewReqDetailsTabForm2_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnReviewReqDetailsTabForm2,true);
    },
    
    ascBjUsmsProcAsgnReviewReqDetailsTabHistoryPanel_afterRefresh: function(){
    
        reloadHistoryPanel(this.ascBjUsmsProcAsgnReviewReqDetailsTabHistoryPanel);
    },
    
    showHistoryPanel: function(tableName, activityLogId){
        var historyPanel = this.ascBjUsmsProcAsgnReviewReqDetailsTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', tableName, 'activity_log_id', activityLogId);
            
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
