function setRestriction(){
    var console = View.getControl('', "bill_upd_sel_bill_console");
    
    // get the date range values in ISO format
    var dateDueFrom = console.getFieldValue('bill.date_due.from');
    var dateDueTo = console.getFieldValue('bill.date_due.to');
    var dateIssuedFrom = console.getFieldValue('bill.date_issued.from');
    var dateIssuedTo = console.getFieldValue('bill.date_issued.to');    
    
    // validate the date range 
    if (dateDueFrom != '' && dateDueTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (!compareLocalizedDates($('bill.date_due.from').value, $('bill.date_due.to').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }
    
    // validate the date range 
    if (dateIssuedFrom != '' && dateIssuedTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (!compareLocalizedDates($('bill.date_issued.from').value, $('bill.date_issued.to').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }    
    
    var billFrom = console.getFieldValue('bill.bill_id.from');
    var billTo = console.getFieldValue('bill.bill_id.to');
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction(console.getFieldValues());
    
    if ($("bill.bill_type_id").value == "") {
        restriction.removeClause('bill.bill_type_id');
    }
    if (dateDueFrom != '') {
        restriction.removeClause('bill.date_due.from');
        restriction.addClause('bill.date_due', dateDueFrom, '&gt;=');
    }
    if (dateDueTo != '') {
        restriction.removeClause('bill.date_due.to');
        restriction.addClause('bill.date_due', dateDueTo, '&lt;=');
    }
    if (dateIssuedFrom != '') {
        restriction.removeClause('bill.date_issued.from');
        restriction.addClause('bill.date_issued', dateIssuedFrom, '&gt;=');
    }
    if (dateIssuedTo != '') {
        restriction.removeClause('bill.date_issued.to');
        restriction.addClause('bill.date_issued', dateIssuedFrom, '&lt;=');
    }    
    if (billFrom != '') {
        restriction.removeClause('bill.bill_id.from');
        restriction.addClause('bill.bill_id', billFrom, '&gt;=');
    }
    if (billTo != '') {
        restriction.removeClause('bill.bill_id.to');
        restriction.addClause('bill.bill_id', billTo, '&lt;=');
    }
    var panelBill = View.getControl('', 'bill_report');
    panelBill.refresh(restriction);
}

/**
 * Clears previously created restriction.
 */
/*function clearRestriction(){
    var console = View.getControl('', "bill_upd_sel_bill_console");
    console.setFieldValue("bill.date_due.from", "");
    console.setFieldValue("bill.date_due.to", "");
    console.setFieldValue("bill.date_issued.from", "");
    console.setFieldValue("bill.date_issued.to", "");    
    console.setFieldValue("bill.bill_id.from", "");
    console.setFieldValue("bill.bill_id.to", "");
    console.setFieldValue("bill.bl_id", "");
    console.setFieldValue("bill.bill_type_id", "");
    console.setFieldValue("bill.vn_id", "");
}*/
function clearRestriction(){
    var console = View.getControl('', "bill_upd_sel_bill_console");
    console.clear();
}


function audit(context){
	var restriction = context.restriction;
	var billId = restriction['bill.bill_id'];
	var vnId = restriction['bill.vn_id'];
	
	try{ 
		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-calculateVarianceValues', billId, vnId);
		
	} catch (e){
		Workflow.handleError(e);
		return false;

	}	
	
}

function approveArchive() {
	var grid = View.getControl('', "bill_report");
	var records = grid.getSelectedRecords();
	if (records.length == 0) {
		View.showMessage(getMessage('noRecordSelected'));
		return;
	}
	else{
		View.openProgressBar('Please wait...')
		for (var i = 0; i < records.length; i++) {
			var record = records[i].values;
			var billId = record['bill.bill_id'];
			var vnId = record['bill.vn_id'];
			var VnAcId = record['bill.vn_ac_id'];
			var timePeriod = record['bill.time_period'];	
			var dateSvcStart = record['bill.date_service_start'];
			dateSvcStart = dateSvcStart.format("m/d/y");

			try{
				var billCount;
				var result0 = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-getBillLineCount', billId, vnId);
				if(result0.code == 'executed') {
					billCount = result0.value;
					if(billCount < 1){
						View.showMessage(getMessage("msg_error_no_line"));
						break;
						return;						
					}					
				}					
				//Step 6 starts here
				var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-calculateVarianceValues', billId, vnId)
				if (!result.value) {
					View.closeProgressBar();
					View.showMessage(getMessage('calculateVarianceValues'));
					break;
					return;
				}
				//Step 6 ends here
				
				var result1 = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-checkArchiveServiceGap', billId, vnId, VnAcId, dateSvcStart, timePeriod);
				if (!result1.value) {
					View.closeProgressBar();
					View.showMessage(getMessage('checkArchiveServiceGap'));
					break;
					return;
				}
				
				var result2 = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-approveBill', billId, vnId);
				if (!result2.value) {
					View.closeProgressBar();
					View.showMessage(getMessage('approveBill'));
					break;
					return;
				}
				
				var result3 = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-archiveBill', billId, vnId);
				if(result3.value){
					grid.refresh();
				}else{
					View.closeProgressBar();
					View.showMessage(getMessage('archiveBill'));
					break;
					return;
				}				
			} catch (e) {
				View.closeProgressBar();
				Workflow.handleError(e);
				break;
				return;				
			}		
		}
		View.closeProgressBar();
	}
}


