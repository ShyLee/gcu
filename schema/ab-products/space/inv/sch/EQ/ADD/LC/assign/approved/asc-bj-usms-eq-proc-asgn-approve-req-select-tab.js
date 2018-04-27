
var ascBjUsmsProcAsgnApproveReqSelectTabController = View.createController("ascBjUsmsProcAsgnApproveReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.addParameter('activityType', ascBjUsmsConstantControl.TYPE_EQ_ADD);
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.addParameter('probType', ascBjUsmsConstantControl.PB_EQ_REQUEST);
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('actyType', ascBjUsmsConstantControl.TYPE_EQ_ADD);
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('problemType', ascBjUsmsConstantControl.PB_EQ_REQUEST);
        
        var year =new Date().getFullYear();
//        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('bzYear',year);
        
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('doPrint','已打印');
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('undoPrint','未打印');
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.columns[8].filterEnabled=false;
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.columns[9].filterEnabled=false;
        if (this.tabs.selectTabConsoleRestriction) {
            this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh(this.tabs.selectTabConsoleRestriction);
            var selectTabConsoleRecord = this.tabs.selectTabConsoleRecord;
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.prob_type', selectTabConsoleRecord['activity_log.prob_type']);
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.from', selectTabConsoleRecord['activity_log.date_requested.from']);
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.to', selectTabConsoleRecord['activity_log.date_requested.to']);
        }
        else {
            this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh();
            this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh();
        }
        
        
    }
    
    
    
    //已经审核过的请求中显示审核的状态
    
    	
});

function selectNextTab(){
    var grid = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
    var requestType = record.getValue('activity_log.prob_type');
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
    selectTabConsoleRecord['activity_log.prob_type'] = consolePanel.getFieldValue('activity_log.prob_type');
    selectTabConsoleRecord['activity_log.date_requested.from'] = consolePanel.getFieldValue('activity_log.date_requested.from');
    selectTabConsoleRecord['activity_log.date_requested.to'] = consolePanel.getFieldValue('activity_log.date_requested.to');
    tabs.selectTabConsoleRecord = selectTabConsoleRecord;
    
    //select next tab and reload the tab view
    var nextTabName = 'approveRequestTab';
    var nextTab = tabs.findTab(nextTabName);
    //nextTab.loadView();
    tabs.selectTab(nextTabName,tabs.approveTabrestriction);
}
function selectReviewTab(){
	var grid = View.panels.get('ascBjUsmsProcAsgnReviewReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log_hactivity_log.activity_log_id');
    var requestType = record.getValue('activity_log_hactivity_log.prob_type');
    View.getWindow('parent').View.setTitle('请求查看');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('activity_log.activity_log_id', activityLogId, '=');
    
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcAsgnApproveReqSelectTabController.tabs;
    tabs.approveTabrestriction = restriction;
    tabs.selectTabConsoleRestriction = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabGrid').restriction;
    var consolePanel = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabConsole');
    var selectTabConsoleRecord = {};
    selectTabConsoleRecord['activity_log.prob_type'] = consolePanel.getFieldValue('activity_log.prob_type');
    selectTabConsoleRecord['activity_log.date_requested.from'] = consolePanel.getFieldValue('activity_log.date_requested.from');
    selectTabConsoleRecord['activity_log.date_requested.to'] = consolePanel.getFieldValue('activity_log.date_requested.to');
    tabs.selectTabConsoleRecord = selectTabConsoleRecord;
    
    //select next tab and reload the tab view
    var nextTabName = 'approveRequestViewTab';
    var nextTab = tabs.findTab(nextTabName);
   // nextTab.loadView();
    
    tabs.selectTab(nextTabName,tabs.approveTabrestriction);
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