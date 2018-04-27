var controller = View.createController('scenarioCtrl',{
	afterViewLoad:function(){
		
	},
	bill_form_onNew: function(){
		var restriction = this.bill_form.restriction;
		var billType = $('bill_form_bill.bill_type_id').value;
		$('bill_line_form_bill_line.bill_type_id').value = billType;
		$('bill_line_form_bill_line.bill_type_id').disabled = true;
	}
});
function rejectBill(context){
	$('bill.status').value = 'Rejected';
}


function checkServiceGap(){
	var controller = this;
	var billId = $('bill_form_bill.bill_id').value;
	var vnId = $('bill_form_bill.vn_id').value;
	var vnAcId = $('bill_form_bill.vn_ac_id').value;
	var date_service_start = $('bill_form_bill.date_service_start').value;
	if(date_service_start.length == 9 ){
		date_service_start = 0 + date_service_start;
	}
	var start_time_period = $('bill_form_bill.time_period').value;

	var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-checkServiceGap', billId, vnId, vnAcId, date_service_start, start_time_period);
	if (result.code == 'executed') {
		if(result.value == false){
			var msg = getMessage('msg_service_gap');
			View.confirm(msg, function(button) {
				if (button == 'yes') {
					controller.operDataType = 'BILL';
					return true;
					//controller.commonSave('bill_AbEnergyDefBills_ds','bill_AbEnergyDefBills');
				}
			});
		}else{
			return true;
		}
	}
}

function rollUp(){
	var billId = $('bill_line_form_bill_line.bill_id').value;
	var vnId = $('bill_line_form_bill_line.vn_id').value;
	var billLineId = $('bill_line_form_bill_line.bill_line_id').value;
	var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-addNewBillLineItem', billId, vnId, billLineId);
	if (result.code == 'executed' && result.value == true) {
		return true;
	}

	else{
		View.showMessage(getMessage("msg_roll_up").replace('{0}', billId));
	}
}

/**
 * Print Bill
 * Print Paginated Report of Bill and its lines
 */
 
function printBill(){
		//a paginated view name 
		var reportViewName = "ab-energy-bill-print.axvw";
		var panel = View.getControl('', 'bill_form');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		restriction.addClause('bill.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		var anotherRestriction = new Ab.view.Restriction();
		anotherRestriction.addClause('bill_line.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		anotherRestriction.addClause('bill_line.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		//paired dataSourceId with Restriction objects
		var passedRestrictions = {'ds_bill': restriction, 'ds_bill_line': anotherRestriction};
		
		//parameters
		var parameters = null;
		
		//passing restrictions
		View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);	
	}
	

