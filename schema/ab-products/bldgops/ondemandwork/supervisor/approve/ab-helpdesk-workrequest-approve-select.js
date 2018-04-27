var abHpdWorkReqApproveSlktControllert = View.createController("abHpdWorkReqApproveSlktControllert",{
	
	probType : '' ,
	requestDateFrom: '',
	requestDateTo: '',
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.setRequestConsole();
	},
	
	requestConsole_beforeRefresh: function(){
		
	},
	
	requestConsole_afterRefresh: function(){
		this.setRequestConsole();
		
		//refresh the table after any processing in the ab-helpdesk-request-dispatch.axvw.
		var ifRefresh = top.window.location.parameters["refresh_from_ab_helpdesk_workrequest_approve_edit"]; 
		if( valueExists(ifRefresh)&& ifRefresh == true){
			top.window.location.parameters["refresh_from_ab_helpdesk_workrequest_approve_edit"] = false;
			this.requestConsole_onFilter();
		}
	},
	
	setRequestConsole: function(){
  		this.requestConsole.setFieldValue("wr.prob_type",this.probType);
		this.requestConsole.setFieldValue("wr.date_requested.from",this.requestDateFrom);
  		this.requestConsole.setFieldValue("wr.date_requested.to",this.requestDateTo);
  	}, 
  	
	requestConsole_onFilter: function(){
		var restriction = this.getRestriction();
		this.saveRequestConsoleParameters();
	    this.requestReportGrid.refresh(restriction);
    },

	requestConsole_onClear: function(){
		this.requestConsole.setFieldValue("wr.prob_type",'');
		this.requestConsole.setFieldValue("wr.date_requested.from",'');	
		this.requestConsole.setFieldValue("wr.date_requested.to",'');
		
		this.probType = '';
		this.requestDateFrom = '';
		this.requestDateTo = '';
		
		this.requestConsole_onFilter();
    },
    
 	saveRequestConsoleParameters: function(){
 		//save the current parameters for refresh later.
		var requestDateFrom = this.requestConsole.getFieldElement("wr.date_requested.from").value;
		var requestDateTo = this.requestConsole.getFieldElement("wr.date_requested.to").value;
		
		this.requestDateFrom = requestDateFrom;
		this.requestDateTo = requestDateTo;
		this.probType = this.requestConsole.getFieldValue("wr.prob_type");
	},
 	 	
 	getRestriction: function(){
 		var dateRequestedFrom = this.requestConsole.getFieldElement("wr.date_requested.from").value;
		var dateRequestedTo = this.requestConsole.getFieldElement("wr.date_requested.to").value;
		
		// validate the date range 
		if (dateRequestedFrom!='' && dateRequestedTo!='') {
			if (compareLocalizedDates(dateRequestedTo,dateRequestedFrom)){
				// display the error message defined in AXVW as message element
				alert(getMessage('error_date_range'));
				return;
			}
		}	
		
		
		// prepare the grid report restriction from the console values
		var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
	   
		restriction.removeClause('wr.date_requested.from');
		restriction.removeClause('wr.date_requested.to');
		 
		if (dateRequestedFrom != '') {
			restriction.addClause('wr.date_requested', dateRequestedFrom, '&gt;=');
		}
		if (dateRequestedTo != '') {
			restriction.addClause('wr.date_requested', dateRequestedTo, '&lt;=');
		}
		//alert(toJSON(restriction));
		return restriction;
	},
	requestReportGrid_afterRefresh: function(){
		highlightBySubstitute(this.requestReportGrid, 'wr_step_waiting.user_name', View.user.name);	
	}
});