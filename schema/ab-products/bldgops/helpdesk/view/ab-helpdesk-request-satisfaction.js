var abHpdRVsatisfactionController =  View.createController("abHpdRVsatisfactionController",{

	/**
	 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-satisfaction.axvw' target='main'>ab-helpdesk-request-satisfaction.axvw</a>
	 */
	
	/**
	* Saves Satisfaction Rating and Comments<br />
	* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#saveSatisfaction(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveSatisfaction</a><br />
	* @param {String} form current form
	*/
	reviewPanel_onSave: function(){
		
		var record = ABHDC_getDataRecord2(this.reviewPanel);
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-saveSatisfaction', record);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if(result.code == 'executed'){
		  	top.window.location.parameters["refresh_from_ab_helpdesk_request_view_cancelRequest"] = true;
			var openView = View.getOpenerView();
			openView.closeDialog();
			openView.parentTab.loadView();
	  } else {
			Workflow.handleError(result);
		}
	}
});	
	
