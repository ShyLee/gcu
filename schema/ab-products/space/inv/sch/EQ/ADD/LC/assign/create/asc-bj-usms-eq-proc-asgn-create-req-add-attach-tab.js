var ascBjUsmsProcAsgnCreateReqAddAttachmentsTabController = View.createController("ascBjUsmsProcAsgnCreateReqAddAttachmentsTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    record: null,
    
    afterInitialDataFetch: function(){
    
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        
        this.selectBasicFormByRequestType();
        
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm.setRecord(this.record);
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabDestricptionForm.show(true);
        this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabAttachmentForm.refresh(this.tabs.restriction);
        this.ascBjUsmsProcAsgnCreateReqAttachmentsAddEqGrid.refresh();
        this.showAddEqGrid();
       
    },
   
    selectBasicFormByRequestType: function(){
        if (this.tabs.requestType != '房屋分配-项目用房') {
            this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2.show(false);
            this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm1.refresh(this.tabs.restriction);
            this.record = this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm1.getRecord();
        }
        else {
            this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2.refresh(this.tabs.restriction);
            this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm1.show(false);
            this.record = this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2.getRecord();
        }
    },
    
    showAddEqGrid: function(){
    	  var restriction = new Ab.view.Restriction();
    	  var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm1");
    	  var grid = View.panels.get("ascBjUsmsProcAsgnCreateReqAttachmentsAddEqGrid");
    	  var addEqId=panel.getFieldValue('activity_log.add_eq_id');
    	
    	      restriction.addClause("add_eq.add_eq_id",addEqId,'=');
    		  grid.refresh(restriction);
    	  
    },
    
	ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm1,false);
        this.showAddEqGrid();
    },
	
	ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2,true);
    },
	
	
    ascBjUsmsProcAsgnCreateReqAddAttachmentsTabHistoryPanel_afterRefresh: function(){
        reloadHistoryPanel(this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabHistoryPanel);
    },
    
    onCreateNew: function(){
        View.getWindow('parent').View.setTitle("设备分配-申请");
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
    
    showHistoryPanel: function(){
        var panel = View.panels.get("ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm1");
        if (!panel.visible) {
            panel = View.panels.get("ascBjUsmsProcAsgnCreateReqAddAttachmentsTabForm2");
        }
        var historyPanel = this.ascBjUsmsProcAsgnCreateReqAddAttachmentsTabHistoryPanel;
        try {
            var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepInformation', 'activity_log', 'activity_log_id', panel.getFieldValue('activity_log.activity_log_id'));
            
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
