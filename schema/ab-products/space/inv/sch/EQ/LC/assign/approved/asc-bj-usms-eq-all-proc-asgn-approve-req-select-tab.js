
var ascBjUsmsProcAsgnApproveReqSelectTabController = View.createController("ascBjUsmsProcAsgnApproveReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.addParameter('probType', "设备管理");
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('proType', "设备管理");
        
        if (this.tabs.selectTabConsoleRestriction) {
            this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh(this.tabs.selectTabConsoleRestriction);
            var selectTabConsoleRecord = this.tabs.selectTabConsoleRecord;
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.activity_type', selectTabConsoleRecord['activity_log.activity_type']);
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.from', selectTabConsoleRecord['activity_log.date_requested.from']);
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.to', selectTabConsoleRecord['activity_log.date_requested.to']);
        }
        else {
            this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh();
            this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh();
        }
    }
});

function selectNextTab(){
    var grid = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
    var requestType = record.getValue('activity_log.activity_type');
    var stepType = record.getValue('activity_log_step_waiting.step');
    View.getWindow('parent').View.setTitle(requestType + "-" + stepType.substring(stepType.length - 2));
    var restriction = new Ab.view.Restriction();
    restriction.addClause('activity_log.activity_log_id', activityLogId, '=');
    
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcAsgnApproveReqSelectTabController.tabs;
    tabs.approveTabrestriction = restriction;
    tabs.selectTabConsoleRestriction = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabGrid').restriction;
    var consolePanel = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabConsole');
    var selectTabConsoleRecord = {};
    selectTabConsoleRecord['activity_log.activity_type'] = consolePanel.getFieldValue('activity_log.activity_type');
    selectTabConsoleRecord['activity_log.date_requested.from'] = consolePanel.getFieldValue('activity_log.date_requested.from');
    selectTabConsoleRecord['activity_log.date_requested.to'] = consolePanel.getFieldValue('activity_log.date_requested.to');
    tabs.selectTabConsoleRecord = selectTabConsoleRecord;
    
    
    var activity_type = record.getValue('activity_log.activity_type');
    
    var nextTabName = 'approveRequestTab';
    //select next tab and reload the tab view
    if(activity_type == "SD -设备报增")
    {
    	nextTabName = 'addEqApproveRequestTab';
    }
    if(activity_type == "SD -设备处置")
    {
    	nextTabName = 'eqDisposeApproveRequestTab';
    }/*
    if(prob_type == "设备管理-设备清查")
    {
    	nextTabName = 'eqCheckApproveRequestTab';
    }*/
    
    
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}
function refeshGrid(){
	 var grid = View.panels.get('ascBjUsmsProcAsgnReviewReqSelectTabGrid');
	 var console = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabConsole');
	var from_date = console.getFieldValue('activity_log.date_requested.from');
	var to_date = console.getFieldValue('activity_log.date_requested.to');
	var restriction = new Ab.view.Restriction();
	if(valueExistsNotEmpty(to_date)){
		restriction.addClause('activity_log_hactivity_log.date_requested', to_date, '&lt;=');
	}
	if(valueExistsNotEmpty(from_date)){
		restriction.addClause('activity_log_hactivity_log.date_requested', from_date, '&gt;=');
	}
	grid.refresh(restriction);
}