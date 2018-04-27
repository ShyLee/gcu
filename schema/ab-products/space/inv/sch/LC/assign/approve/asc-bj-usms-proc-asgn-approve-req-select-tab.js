
var ascBjUsmsProcAsgnApproveReqSelectTabController = View.createController("ascBjUsmsProcAsgnApproveReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        var activityType1=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_RM;
        var activityType2=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_DV;
    	var activityType3=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_CZRM;
    	var activityType4=ascBjUsmsConstantControl.TYPE_GYF_ROOM_REQUEST_RM;
    	var activityType5=ascBjUsmsConstantControl.TYPE_GYF_ROOM_REQUEST_CZRM;
    	
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.addParameter('activityType', "activity_log.activity_type in ('"+activityType1+"','"+activityType2+"','"+activityType3+"','"+activityType4+"','"+activityType5+"')");
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('actyType', "activity_log_hactivity_log.activity_type in('"+activityType1+"','"+activityType2+"','"+activityType3+"','"+activityType4+"','"+activityType5+"')");
        
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
});

function selectNextTab(){
    var grid = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
    var activityType = record.getValue('activity_log.activity_type');
    var requestType = record.getValue('activity_log.prob_type');
    var step = record.getValue('activity_log_step_waiting.step');
    View.getWindow('parent').View.setTitle(requestType + "-" + step.substring(step.length - 2));
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
    tabs.step=step;
    tabs.activityType=activityType;
    
    //select next tab and reload the tab view
    var nextTabName = 'approveRequestTab';
    tabs.findTab(nextTabName).show(true);
    tabs.findTab(nextTabName).loadView();
    tabs.selectTab(nextTabName);
//    tabs.selectTab(nextTabName,restriction,false,true,false);
}

function refeshGrid(){
    var grid = View.panels.get('ascBjUsmsProcAsgnReviewReqSelectTabGrid');
    var console = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabConsole');
    var from_date = console.getFieldValue('activity_log.date_requested.from');
    var to_date = console.getFieldValue('activity_log.date_requested.to');
    var restriction = new Ab.view.Restriction();
    if (valueExistsNotEmpty(to_date)) {
        restriction.addClause('activity_log_hactivity_log.date_requested', to_date, '&lt;=');
    }
    if (valueExistsNotEmpty(from_date)) {
        restriction.addClause('activity_log_hactivity_log.date_requested', from_date, '&gt;=');
    }
    grid.refresh(restriction);
}
