var editLeaseController = View.createController('editLease', {
    itemId: null,
	item:null,
	itemType:null,
    refreshPanels: new Array(),
	afterInitialDataFetch: function(){
		if(this.editLease.getFieldValue('ls.lease_sublease')!='SUBLEASE'){
			this.editLease.enableField('ls.ls_parent_id' ,false);
		}
	},
	
	editLease_afterRefresh: function(){
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.editLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.editLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title"));
    	}
	},
	
    editLease_onSave: function(){
        if (!validateData(this.dsEditLease, this.editLease)) {
            return;
        }
        var record = this.editLease.getRecord();
        record.setValue('ls.description', this.editLease.getFieldValue('ls.description'));
        record.setValue('ls.date_start', this.editLease.getFieldValue('ls.date_start'));
        record.setValue('ls.date_move', this.editLease.getFieldValue('ls.date_move'));
        record.setValue('ls.date_end', this.editLease.getFieldValue('ls.date_end'));
        record.setValue('ls.lease_sublease', this.editLease.getFieldValue('ls.lease_sublease'));
		record.setValue('ls.area_negotiated', this.editLease.getFieldValue('ls.area_negotiated'));
        record.setValue('ls.automatic_renewal', this.editLease.getFieldValue('ls.automatic_renewal'));
        record.setValue('ls.comments', this.editLease.getFieldValue('ls.comments'));
        record.setValue('ls.signed', this.editLease.getFieldValue('ls.signed'));
        record.setValue('ls.ld_name', this.editLease.getFieldValue('ls.ld_name'));
        record.setValue('ls.ld_contact', this.editLease.getFieldValue('ls.ld_contact'));
        record.setValue('ls.tn_name', this.editLease.getFieldValue('ls.tn_name'));
        record.setValue('ls.tn_contact', this.editLease.getFieldValue('ls.tn_contact'));
        record.setValue('ls.amount_security', this.editLease.getFieldValue('ls.amount_security'));
        record.setValue('ls.qty_occupancy', this.editLease.getFieldValue('ls.qty_occupancy'));
        record.setValue('ls.floors', this.editLease.getFieldValue('ls.floors'));
		record.setValue('ls.ac_id', this.editLease.getFieldValue('ls.ac_id'));
        record.setValue('ls.space_use', this.editLease.getFieldValue('ls.space_use'));
        record.setValue('ls.lease_type', this.editLease.getFieldValue('ls.lease_type'));
        record.setValue('ls.vat_exclude', this.editLease.getFieldValue('ls.vat_exclude'));
        record.setValue('ls.cost_index', this.editLease.getFieldValue('ls.cost_index'));
        
		
		
		if (this.editLease.getFieldValue('ls.lease_sublease') == 'SUBLEASE' && this.editLease.getFieldValue('ls.ls_parent_id').length > 0) {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('ls.ls_id', this.editLease.getFieldValue('ls.ls_parent_id'), '=');
			var records = this.dsEditLease.getRecords(restriction);
			if(records.length > 0){
				this.dsEditLease.saveRecord(record);
                for (var i = 0; i < this.refreshPanels.length; i++) {
                    View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
                }
                View.closeThisDialog();
			}else{
				View.showMessage(getMessage('error_leaseid'));
			}
        }
        else {
            this.dsEditLease.saveRecord(record);
            for (var i = 0; i < this.refreshPanels.length; i++) {
                View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
            }
            View.closeThisDialog();
        }
    },
    editLease_onCancel: function(){
        View.closeThisDialog();
    }
})

function validateData(dataSource, form){
    /*
     * check 'ls.amount_security', numeric , format money
     */
    if (parseFloat(form.getFieldValue('ls.amount_security')) != form.getFieldValue('ls.amount_security')) {
        View.showMessage(getMessage('error_amount_security_invalid'));
        return false;
    }
    /*
     * check 'ls.qty_occupancy' integer
     */
    if (parseInt(form.getFieldValue('ls.qty_occupancy')) != form.getFieldValue('ls.qty_occupancy')) {
        View.showMessage(getMessage('error_qty_occupancy_invalid'));
        return false;
    }
	// get the string value from field stard date
	var date_start = form.getFieldValue('ls.date_start').split("-");
	//create Date object
	var dateStart = new Date(date_start[0],date_start[1],date_start[2]);
	
	// get the string value from field move date
	var date_move = form.getFieldValue('ls.date_move').split("-");
	//create Date object
	var dateMove = new Date(date_move[0],date_move[1],date_move[2]);
	
	// get the string value from field end date
	var date_end = form.getFieldValue('ls.date_end').split("-");
	//create Date object
	var dateEnd = new Date(date_end[0],date_end[1],date_end[2]);
	
	if (dateMove < dateStart) {
		View.showMessage(getMessage('error_date_move_before_date_start'));
		return false;
	}
	if (dateEnd < dateStart) {
			View.showMessage(getMessage('error_date_end_before_date_start'));
			return false;
	}
    return true;
}
function selectParentLease() {
    var itemType = '';
	if(editLeaseController.itemType == 'BUILDING'){
		itemType = 'ls.bl_id'
	}else{
		itemType = 'ls.pr_id'
	}
	
	Ab.view.View.selectValue(
        'editLease', 'Parent Lease', ['ls.ls_parent_id'], 'ls', ['ls.ls_id'],
        [itemType,'ls.ls_id'],
        'ls.use_as_template = 0 AND ls.ls_id != \''+this.editLeaseController.itemId+'\' and '+itemType+' = \''+this.editLeaseController.item+'\' AND ls.lease_sublease !=  \'SUBLEASE\'', 'afterSelectParentLease', false, false, '', 1000, 500);
}

function afterSelectParentLease(fieldName, selectedValue, previousValue) {
    // the selected value can be copied to the form field
    return true;
}
function setParentLease(){
	if(editLeaseController.editLease.getFieldValue('ls.lease_sublease')=='SUBLEASE'){
		editLeaseController.editLease.enableField('ls.ls_parent_id' ,true);
	}else {
		editLeaseController.editLease.enableField('ls.ls_parent_id' ,false);
	}
}
