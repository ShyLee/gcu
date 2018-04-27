
/**
 * It is used for ab-rr-room-viewallrecurring.axvw.
 * Load the data from parent panel, and display in grid.
 * 
 */
var roomViewAllRecurringController = View.createController("roomViewAllRecurringController", {

    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        onStart();
    }
});

/**
 * onStart is called after all system_form_onload finction
 * retreive data from registry and load it into UI control
 */
function onStart() {
    var openerController = View.getOpenerView().controllers.get("confirmRoomReservController");
    var columns = initColumns();
    var rows = openerController.rows;
    
	var localFormatRows = rows;
	
	// localization data format. 
	for (var i = 0; i < rows.length; i++) {
		// Date format
		localFormatRows[i].col1 = ABRV_ISODate2UserDate(rows[i].col1);		
		
		// Time format
		localFormatRows[i].col7 = ABRV_convert12H(rows[i].col7);
		localFormatRows[i].col8 = ABRV_convert12H(rows[i].col8);
	}
	
    var panel = View.getControl('', 'rm_report');
    if (panel == null) {
        View.showMessage(getMessage("errNotFound"));
        return;
    }
    
    var configObj = new Ab.view.ConfigObject();
    configObj['rows'] = localFormatRows; 
    configObj['columns'] = columns;
    
    var grid = new Ab.grid.ReportGrid('rm_report_grid', configObj);
    grid.sortEnabled = false;
    if (rows.length == 0) {
        grid.hasNoRecords = true;
    }
	
    grid.build();
}


/**
 * Return array of column OBJECTS to be passed to reloadRows
 */
function initColumns() {
    var columns = new Array();
    
    columns.push(new Ab.grid.Column('col1', getMessage("DateStart"), 'date'));
    columns.push(new Ab.grid.Column('col2', getMessage("BuildingCode"), 'text'));
    columns.push(new Ab.grid.Column('col3', getMessage("FloorCode"), 'text'));
    columns.push(new Ab.grid.Column('col4', getMessage("RoomCode"), 'text'));
    columns.push(new Ab.grid.Column('col5', getMessage("ConfigCode"), 'text'));
    columns.push(new Ab.grid.Column('col6', getMessage("RoomArrangementType"), 'text'));
    columns.push(new Ab.grid.Column('col7', getMessage("TimeStart"), 'time'));
    columns.push(new Ab.grid.Column('col8', getMessage("TimeEnd"), 'time'));
    
    return columns;
}
