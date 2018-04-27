/**
 * The controller for the sub tab of reservations in my reservations view
 * @author Keven xi
 * 2009-11-11
 */
var myReservInfoController = View.createController("myReservInfoController", {

    mainTabs: null,
    detailstabs: null,
    globalParameters: null,
	GeneralInfo:null,
    refreshCount:0,
	
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        this.mainTabs = View.getControl('', 'createEditResevationTabs');
        this.detailstabs = View.getControl('', 'viewReservationTabs');
        this.globalParameters = View.getOpenerView().controllers.get(0);
		this.refreshCount++;
    },
    /**
     *
     */
    infoReport_afterRefresh: function(){
		if (this.refreshCount > 0) {
			this.onStartInfo();
		}
    },
    /**
     *
     */
    onStartInfo: function(){
        if (this.infoReport.rows.length > 0) {
            //Request status codes for all displayed reservations
            var res_pk_list = ABRV_getRecordsForAllRows("infoReport");
			
            //we have three buttons Edit, Cancel and Copy for every reserve record, 
            //we must get the information about which buttons must be disabled 
            //and which not. Do it as follows:
            var objectsToSave = [View.user];
            var jsonExpression = toJSON(objectsToSave);
            
            //    'res_pk_list': res_pk_list,
            var jsonUser = jsonExpression;
            var res_type = 'reserve';
            //Invokes searchReservationsAdditionalInfo WFR
			try{
				var results = Workflow.callMethod("AbWorkplaceReservations-room-searchReservationsAdditionalInfo", res_type, jsonUser, res_pk_list);
				this.setSearchReservationsAdditionalInfo(results)
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
            if (result.message != "OK") {
				View.showMessage(result.message);
			}
				
			//If message is Not Null then we have to process the two status list codes as follows:	
			this.GeneralInfo = eval("(" + result.jsonExpression + ")");	
            this.resetInfoRowsButtons();
        }
        else { //If message is Null show an alert with the error information to the user
            View.showMessage(result.message);
        }
    },
    /**
     * reset the buuton enable after grid refresh
     */
    resetInfoRowsButtons: function(){
        var generalInfo = this.GeneralInfo;
		if (generalInfo == null) return;
        var rows = this.infoReport.gridRows;
        var rowCount = rows.getCount();
        for (var i = 0; i < rowCount; i++) {
            var row = rows.get(i);
            //edit button
            var canEdit = (generalInfo[0][i].canBeEdited == 'yes');
            var editButton = row.actions.get('edit');
            editButton.forceDisable(!canEdit);
            
            //cancel button
            var canCancel = (generalInfo[1][i].canBeCancelled == 'yes');
            var cancelButton = row.actions.get('cancelReserv');
            cancelButton.forceDisable(!canCancel);
            
            //cancel Rescurring button
            var canCancelRecurrent = (generalInfo[2][i].canBeRecurrentCancelled == 'yes');
            var cancelRecurrentButton = row.actions.get('cancelRecurReserv');
            cancelRecurrentButton.forceDisable(!canCancelRecurrent);
            
            //copy button
            var canCopy = (generalInfo[3][i].canBeCopied == 'yes');
            var copyButton = row.actions.get('copy');
            copyButton.forceDisable(!canCopy);
        }
    },
    /**
     * This function is called when the button Edit is clicked.
     * @param {Object} row
     */
    infoReport_edit_onClick: function(row){
        //kb#3036184: set this global variable so that the user's information ill update to Select Room Console in Room Reservation 'roomReservation'
        this.globalParameters.user = View.user;
        ABRV_editNewReservation(row, 'reserve');
    },
    /**
     *This function is called when the button Cancel is clicked.
     * @param {Object} row
     */
    infoReport_cancelReserv_onClick: function(row){
        //Get as parameter the reservation identifier the user has selected to cancel 
        var reservationRecord = ABRV_getPKRecordForSelectedRow('infoReport',row);
        var user = ABRV_getUserInfo();
        var objectsToSave = [user];
        var jsonExpression = toJSON(objectsToSave);
        
        
        var single = "yes";
        var res_id = reservationRecord;
        var jsonUser = jsonExpression;
        
		var controller = this;
		var message = getMessage('cancelCurrent');
		View.confirm(message,function(button){
            if (button == 'yes') {
				//Invokes cancelReservation WFR
				try{
					var results = Workflow.callMethod("AbWorkplaceReservations-room-cancelReservation", res_id, jsonUser, single);
					controller.setCancelReservation(results);
				}catch(e){
					Workflow.handleError(e);
				}
			}
        });
    },
    /**
     * This function is called when the button Cancel recurrent is clicked.
     * @param {Object} row
     */
    infoReport_cancelRecurReserv_onClick: function(row){
        //Get as parameter the reservation identifier the user has selected to cancel 
        var reservationRecord = ABRV_getPKRecordForSelectedRow('infoReport',row);
        var user = ABRV_getUserInfo();
        var objectsToSave = [user];
        var jsonExpression = toJSON(objectsToSave);
        
        var single = "no";
        var res_id = reservationRecord;
        var jsonUser = jsonExpression;

		var controller = this;
		var message = getMessage('cancelRecurrent');
		View.confirm(message,function(button){
            if (button == 'yes') {
				try{
					var results = Workflow.callMethod("AbWorkplaceReservations-room-cancelReservation", res_id, jsonUser, single);
					controller.setCancelReservation(results);
				}catch(e){
					Workflow.handleError(e);
				}
			}
        });
    },
    /**
     * This function is called when the button Copy is clicked.
     * @param {Object} row
     */
    infoReport_copy_onClick: function(row){
        var reservationRecord = ABRV_getPKRecordForSelectedRow('infoReport',row);
        
        this.globalParameters.user = View.user;
        this.globalParameters.reservation = null;
        this.globalParameters.roomReservation = null;
        this.globalParameters.resourcesReservations = null;
        this.globalParameters.roomConflicts = [];
        this.globalParameters.resourceConflicts = [];
        
        this.detailstabs.reservationRecord = reservationRecord;
		
		//solved kb3025112, use openDialog command in view 
        /*
        //It presents a pop-up window with a calendar date field only
		var view = this.getTargetView();
        view.openDialog('ab-rr-room-copy-reservation.axvw', null, false, {
			width:500, 
			height:400,
			maxsize:false});
		*/	
			
    },
    /**
     * Guo added 2008-08-14 to solve KB3018885
     * @param {Object} row
     */
    infoReport_viewComments_onClick: function(row){
        var rowPKs = this.infoReport.getPrimaryKeysForRow(row.record);
        ABRV_viewComments('reserve', rowPKs);
    },
    
    
    /**
     *
     * @param {Object} result
     */
    setCancelReservation: function(result){
        if (result.code == "executed") {
            if ((result.message != "OK")) {
				alert(result.message);
			}
            
            //re-get the information about which buttons must be disabled 
            //and which not
			this.detailstabs.selectTab("info-reservations");
        }
        else {
            View.showMessage(result.message);
        }
    }
})


