
/**
 * JavaScript for loading miniConsole from JSON objects
 */
var resourceViewAllRecurringController = View.createController("resourceViewAllRecurringController",{
		
	/**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        onStart();
    }
});

/**
 * user_form_onload is called after all system_form_onload finction
 * retreive data from registry and load it into UI control
 */
function onStart(){
    var opener = View.getOpenerView().controllers.get("confirmResReservController");
    var columns = initializeColumnObjects();
	var rows = opener.rows;
	
	if (!valueExists(rows)) {
		rows = new Array();
	}
	           
    for (var i = 0; i < rows.length; i++) {
        rows[i].col3 = ABRV_convert12H(left(rows[i].col3, 5));
        rows[i].col4 = ABRV_convert12H(left(rows[i].col4, 5));
        rows[i].col1 = ABRV_ISODate2UserDate(rows[i].col1);
    }
    
    // find the control to be modified
    var grid = View.getControl('', 'rs_report');
    if (grid == null) {
        View.showMessage(getMessage("errNotFound"));
        return;
    }
    var configObj = new Ab.view.ConfigObject();
    configObj['rows'] = rows; 
    configObj['columns'] = columns;
    
    var grid = new Ab.grid.ReportGrid('rs_report_grid', configObj);
    grid.sortEnabled = false;
    if (rows.length == 0) {
        grid.hasNoRecords = true;
    }
	
    grid.build();
}


/**
 * Return array of column OBJECTS to be passed to reloadRows
 */
function initializeColumnObjects(){
    var columnArray = new Array();
    
    columnArray.push(new Ab.grid.Column('col1', getMessage("DateStart"), 'text'));
    columnArray.push(new Ab.grid.Column('col2', getMessage("Resource"), 'text'));
    columnArray.push(new Ab.grid.Column('col3', getMessage("TimeStart"), 'text'));
    columnArray.push(new Ab.grid.Column('col4', getMessage("TimeEnd"), 'text'));
    columnArray.push(new Ab.grid.Column('col5', getMessage("Quantity"), 'text'));
    return columnArray;
}


function left(str, n){
    if (n <= 0) 
        return "";
    else 
        if (n > String(str).length) 
            return str;
        else 
            return String(str).substring(0, n);
}

