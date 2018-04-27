/**@lei
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workorder-manage-select.axvw' target='main'>ab-helpdesk-workorder-manage-select.axvw</a>
 */
var abOdmdReqDispatchSlktControllert = View.createController("abHelpdeskWorkorderManageSelectControllert", {
    requestDateFrom: '',
    requestDateTo: '',
   // woRecords:{},
    
    requestConsole_afterRefresh: function(){
    
        this.setRequestConsole();
        
        var ifRefresh = '';
        //refresh the table after any processing in the ab-helpdesk-request-dispatch.axvw.
        ifRefresh = top.window.location.parameters["refresh_from_ab_helpdesk_request_dispatch_edit"];
        if (valueExists(ifRefresh) && ifRefresh == true) {
            top.window.location.parameters["refresh_from_ab_helpdesk_request_dispatch_edit"] = false;
            this.requestConsole_onFilter();
        }
        
    },
    /**refresh the view using of the clause that maybe saved on last time operate  
     */
    setRequestConsole: function(){
        this.requestConsole.setFieldValue("wo.date_created.from", this.requestDateFrom);
        this.requestConsole.setFieldValue("wo.date_created.to", this.requestDateTo);
        var restriction = this.getRestriction();
        this.requestReportGrid.refresh(restriction);
    },
    //getParamater()
    //fiter the view through the clause
    requestConsole_onFilter: function(){
        var restriction = this.getRestriction();
        this.saveRequestConsoleParameters();
        this.requestReportGrid.refresh(restriction);
    },
    //clear the filter
    requestConsole_onClear: function(){
    
        this.requestConsole.setFieldValue("wo.date_created.from", '');
        this.requestConsole.setFieldValue("wo.date_created.to", '');
        this.requestDateFrom = '';
        this.requestDateTo = '';
        
        this.requestConsole_onFilter();
    },
    
    //save the consoleParameters in the operation for  can keep the console clause in the next refresh
    saveRequestConsoleParameters: function(){
        //save the current parameters for refresh later.
        var requestDateFrom = this.requestConsole.getFieldElement("wo.date_created.from").value;
        var requestDateTo = this.requestConsole.getFieldElement("wo.date_created.to").value;
        
        this.requestDateFrom = requestDateFrom;
        this.requestDateTo = requestDateTo;
        
    },
    //get the restriction of  console
    
    getRestriction: function(){
        var dateRequestedFrom = this.requestConsole.getFieldElement("wo.date_created.from").value;
        var dateRequestedTo = this.requestConsole.getFieldElement("wo.date_created.to").value;
        
        // validate the date range 
        if (dateRequestedFrom != '' && dateRequestedTo != '') {
            if (compareLocalizedDates(dateRequestedTo, dateRequestedFrom)) {
                // display the error message defined in AXVW as message element
                return;
            }
        }
        
        
        // prepare the grid report restriction from the console values
        var restriction = new Ab.view.Restriction(this.requestConsole.getFieldValues());
        
        restriction.removeClause('wo.date_created.from');
        restriction.removeClause('wo.date_created.to');
        
        if (dateRequestedFrom != '') {
            restriction.addClause('wo.date_created', dateRequestedFrom, '&gt;=');
        }
        if (dateRequestedTo != '') {
            restriction.addClause('wo.date_created', dateRequestedTo, '&lt;=');
        }
        //alert(toJSON(restriction));
        return restriction;
    },
    requestReportGrid_afterRefresh: function(){
    	highlightWoBySubstitute(this.requestReportGrid,false);
	} 
})

