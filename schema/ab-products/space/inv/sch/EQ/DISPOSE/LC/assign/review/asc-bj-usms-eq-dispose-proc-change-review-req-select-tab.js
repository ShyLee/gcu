
var ascBjUsmsProcAsgnApproveReqSelectTabController = View.createController("ascBjUsmsProcAsgnApproveReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.addParameter('activityType', "SD -设备报增");
        this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.addParameter('probType', "设备管理");
       
        
        if (this.tabs.selectTabConsoleRestriction) {
            this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh(this.tabs.selectTabConsoleRestriction);
            var selectTabConsoleRecord = this.tabs.selectTabConsoleRecord;
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.prob_type', selectTabConsoleRecord['activity_log.prob_type']);
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.from', selectTabConsoleRecord['activity_log.date_requested.from']);
            this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.setFieldValue('activity_log.date_requested.to', selectTabConsoleRecord['activity_log.date_requested.to']);
        }
        else {
            this.ascBjUsmsProcAsgnApproveReqSelectTabGrid.refresh();
            
        }
    }
});

function selectNextTab(){
    var grid = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
    var requestType = record.getValue('activity_log.prob_type');
    var stepType = record.getValue('activity_log_step_waiting.step');
    View.getWindow('parent').View.setTitle("报增-申请查看");
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
    var nextTabName = 'requestDetailsTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}
