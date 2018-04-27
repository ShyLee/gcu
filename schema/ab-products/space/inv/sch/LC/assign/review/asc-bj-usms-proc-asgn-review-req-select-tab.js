
var ascBjUsmsProcAsgnReviewReqSelectTabController = View.createController("ascBjUsmsProcAsgnReviewReqSelectTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        var activityType1=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_RM;
        var activityType2=ascBjUsmsConstantControl.TYPE_ROOM_REQUEST_DV;
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('activityType', "activity_type in ('"+activityType1+"','"+activityType2+"')");
    },
    requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("activity_log.activity_type",'');
		this.requestConsole.setFieldValue("activity_log.date_requested.from",'');	
		this.requestConsole.setFieldValue("activity_log.date_requested.to",'');
		this.requestConsole.setFieldValue("activity_log.status",'');
		
		this.activityType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		this.status = '';
		
		this.requestConsole_onFilter();
    },
    saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("activity_log.date_requested.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("activity_log.date_requested.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.activityType = this.requestConsole.getFieldValue("activity_log.activity_type");
		this.status = this.requestConsole.getFieldValue("activity_log.status");
 	},
 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldElement("activity_log.date_requested.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("activity_log.date_requested.to").value;
		
		 // validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			// the compareLocalizedDates() function expects formatted (displayed) date values
			if (compareLocalizedDates(dateRequestedTo,dateRequestedFrom)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		try{
			var status = this.requestConsole.getFieldValue('activity_log.status');
			if (status != undefined){
				if (status == '--NULL--' || status == '') {	
					restriction.removeClause('activity_log.status');
				}
			}
		} catch(err){}
		
		restriction.removeClause('activity_log.date_requested.from');
		restriction.removeClause('activity_log.date_requested.to');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('activity_log.date_requested', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('activity_log.date_requested', dateRequestedTo, '&lt;=');
		}
		//alert(toJSON(restriction));
		return restriction;
	}
});

function selectNextTab(activityLogId){

    var restriction = "activity_log_id = " + activityLogId;
    
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcAsgnReviewReqSelectTabController.tabs;
    tabs.restriction = restriction;
    
    //select next tab and reload the tab view
    var nextTabName = 'requestDetailsTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}
