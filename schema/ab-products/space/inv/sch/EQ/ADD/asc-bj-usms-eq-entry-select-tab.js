
var ascBjUsmsProcAsgnAsgnReqSelectTabController = View.createController("ascBjUsmsProcAsgnAsgnReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
    	View.getWindow('parent').View.setTitle("设备入库-入库请求列表");
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.addParameter('activityType', "SD -设备报增");
        this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.addParameter('probType', "设备管理");
        this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.addParameter('status', "APPROVED");
        this.ascBjUsmsProcAsgnComletedListPanel.addParameter('activityType', "SD -设备报增");
        this.ascBjUsmsProcAsgnComletedListPanel.addParameter('probType', "设备管理");
        this.ascBjUsmsProcAsgnComletedListPanel.addParameter('status', "APPROVED");
        this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.refresh();
        this.ascBjUsmsProcAsgnComletedListPanel.refresh();
    },
    
    ascBjUsmsProcAsgnApproveReqSelectTabConsole_onFilter: function(){
    	var dateBegin=this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.getFieldValue('activity_log.date_requested.from');
    	var dateEnd=this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.getFieldValue('activity_log.date_requested.to');
    	var dateRes=new Ab.view.Restriction();
    	if(valueExistsNotEmpty(dateBegin)){
    		dateRes.addClause('activity_log.date_requested',dateBegin,'&gt;=');
    	}
    	if(valueExistsNotEmpty(dateEnd)){
    		dateRes.addClause('activity_log.date_requested',dateEnd,'&lt;=');
    	}
    	this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.refresh(dateRes);
    },
    ascBjUsmsProcAsgnApproveReqSelectTabConsole_onClear: function(){
    	this.ascBjUsmsProcAsgnApproveReqSelectTabConsole.clear();
    	this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.restriction=null;
    	this.ascBjUsmsProcAsgnAsgnReqSelectTabGrid.refresh("");
    }
});

function selectNextTab(){
    var grid = View.panels.get('ascBjUsmsProcAsgnAsgnReqSelectTabGrid');
    var index = grid.selectedRowIndex;
    var record = grid.gridRows.get(index).getRecord();
    var activityLogId = record.getValue('activity_log.activity_log_id');
    var requestType = record.getValue('activity_log.prob_type');
    //var stepType = record.getValue('activity_log_step_waiting.step');
    //View.getWindow('parent').View.setTitle(requestType + "-" + stepType.substring(stepType.length - 2));
    View.getWindow('parent').View.setTitle("设备入库-报增单详细信息");
    var restriction = new Ab.view.Restriction();
    restriction.addClause('activity_log.activity_log_id', activityLogId, '=');
    
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcAsgnAsgnReqSelectTabController.tabs;
    tabs.approveTabrestriction = restriction;
    tabs.selectTabConsoleRestriction = View.panels.get('ascBjUsmsProcAsgnAsgnReqSelectTabGrid').restriction;
    var consolePanel = View.panels.get('ascBjUsmsProcAsgnApproveReqSelectTabConsole');
    var selectTabConsoleRecord = {};
    selectTabConsoleRecord['activity_log.prob_type'] = consolePanel.getFieldValue('activity_log.prob_type');
    selectTabConsoleRecord['activity_log.date_requested.from'] = consolePanel.getFieldValue('activity_log.date_requested.from');
    selectTabConsoleRecord['activity_log.date_requested.to'] = consolePanel.getFieldValue('activity_log.date_requested.to');
    tabs.selectTabConsoleRecord = selectTabConsoleRecord;
    
    //select next tab and reload the tab view
    var nextTabName = 'detailsTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}