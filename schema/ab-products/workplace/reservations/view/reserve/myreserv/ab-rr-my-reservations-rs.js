/**
 * The controller for the sub tab of resource reservations in my reservations view
 * @author Keven xi
 * 2009-11-11
 */
var myResourceReservController = View.createController("myResourceReservController", {
    mainTabs: null,
	GeneralInfo:null,
	refreshCount:0,
	
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        this.mainTabs = View.getControl('', 'createEditResevationTabs');
		this.refreshCount++;
    },
    
    resReserveReport_afterRefresh: function(){
		if (this.refreshCount > 0) {
			this.onStartRs();
		}
    },
    /**
     * In the third tabbed report we have one button Edit for every reserve_rs record, we must
     * get the information about which buttons must be disabled and which not.
     */
    onStartRs: function(){
        //If rows exist in the reserve report
        if (this.resReserveReport.rows.length > 0) {
            //request status codes for all displayed reservations
            var res_pk_list = ABRV_getRecordsForAllRows("resReserveReport");
            
            //Invokes searchReservationsAdditionalInfo WFR
            var objectsToSave = [View.user];
            var jsonExpression = toJSON(objectsToSave);
            
            var jsonUser = jsonExpression;
            var res_type = "resource";
            
			try{
				var results = Workflow.callMethod("AbWorkplaceReservations-room-searchReservationsAdditionalInfo", res_type, jsonUser, res_pk_list);
				this.setSearchReservationsAdditionalInfo(results);
			}catch(e){
				Workflow.handleError(e);
			}
        }
    },
    /**
     *
     * @param {Object} result
     */
    setSearchReservationsAdditionalInfo: function(result){
    
        if (result.code == 'executed') {
            //If message is Not Null then we have to process the status list codes as follows:
            if (result.message != "OK") 
                View.showMessage(result.message);
            
            this.GeneralInfo = eval("(" + result.jsonExpression + ")");
            this.resetResourceRowsButtons();
            
        }
        else { //If message is Null show an alert with the error information to the user 
            View.showMessage(result.message);
        }
    },
    /**
     * reset the buuton enable after grid refresh
     */
    resetResourceRowsButtons: function(){
		var generalInfo = this.GeneralInfo;
		if (generalInfo == null) return;
        var rows = this.resReserveReport.gridRows;
        var rowCount = rows.getCount();
        for (var i = 0; i < rowCount; i++) {
            var row = rows.get(i);
            //If canBeEdited[i]==0: disable the Edit button for this reservation in the reserve_rs records results list
            //Else: enable the Edit button for this reservation in the reserve_rs records results list
            var canEdit = (generalInfo[0][i].canBeEdited == 'yes');
            var editButton = row.actions.get('edit');
            editButton.forceDisable(!canEdit);
        }
    },
    /**
     * This function is called when the button Edit is clicked.
     * @param {Object} row
     */
    resReserveReport_edit_onClick: function(row){
        ABRV_editNewReservation(row, 'resource');
    },
    /**
     * Guo added 2008-08-14 to solve KB3018885
     * @param {Object} row
     */
    resReserveReport_viewComments_onClick: function(row){
        var rowPKs = this.resReserveReport.getPrimaryKeysForRow(row.record);
        ABRV_viewComments('reserve_rs', rowPKs);
    }
})


