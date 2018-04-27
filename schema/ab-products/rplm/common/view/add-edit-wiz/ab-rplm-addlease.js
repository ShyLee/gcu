var addNewLeaseController = View.createController('addNewLease', {
    itemId: null,
    itemType: null,
	item: null,
    refreshPanels: new Array(),
    afterViewLoad: function(){
        this.inherit();
        this.newLease.newRecord = true;
    },
    newLease_afterRefresh: function(){
    	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.newLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.newLease.setFieldLabel("ls.amount_security",getMessage("amount_security_title"));
    	}
    },
    
    newLease_onSave: function(){
        if (!validateData(this.dsNewLease, this.newLease)) {
            return;
        }
        var record = new Ab.data.Record({
            'ls.ls_id': this.newLease.getFieldValue('ls.ls_id'),
            'ls.bl_id': (this.itemType == "BUILDING") ? this.itemId : null,
            'ls.pr_id': (this.itemType != "BUILDING") ? this.itemId : null,
            'ls.description': this.newLease.getFieldValue('ls.description'),
            'ls.date_start': this.newLease.getFieldValue('ls.date_start'),
            'ls.date_move': this.newLease.getFieldValue('ls.date_move'),
            'ls.date_end': this.newLease.getFieldValue('ls.date_end'),
            'ls.lease_sublease': this.newLease.getFieldValue('ls.lease_sublease'),
			'ls.area_negotiated': this.newLease.getFieldValue('ls.area_negotiated'),
            'ls.automatic_renewal': this.newLease.getFieldValue('ls.automatic_renewal'),
            'ls.comments': this.newLease.getFieldValue('ls.comments'),
            'ls.signed': this.newLease.getFieldValue('ls.signed'),
            'ls.ld_name': this.newLease.getFieldValue('ls.ld_name'),
            'ls.ld_contact': this.newLease.getFieldValue('ls.ld_contact'),
            'ls.tn_name': this.newLease.getFieldValue('ls.tn_name'),
            'ls.tn_contact': this.newLease.getFieldValue('ls.tn_contact'),
            'ls.amount_security': this.newLease.getFieldValue('ls.amount_security'),
            'ls.qty_occupancy': this.newLease.getFieldValue('ls.qty_occupancy'),
            'ls.floors': this.newLease.getFieldValue('ls.floors'),
            'ls.landlord_tenant': this.newLease.getFieldValue('ls.landlord_tenant'),
            'ls.ls_parent_id': this.newLease.getFieldValue('ls.ls_parent_id'),
			'ls.ac_id': this.newLease.getFieldValue('ls.ac_id'),
            'ls.space_use': this.newLease.getFieldValue('ls.space_use'),
            'ls.lease_type': this.newLease.getFieldValue('ls.lease_type'),
            'ls.vat_exclude': this.newLease.getFieldValue('ls.vat_exclude'),
            'ls.cost_index': this.newLease.getFieldValue('ls.cost_index')
        }, true);
        if (this.newLease.getFieldValue('ls.lease_sublease') == 'SUBLEASE' && this.newLease.getFieldValue('ls.ls_parent_id').length > 0) {
            var records = this.dsNewLease.getRecords();
            var existLease = false;
            for (i = 0; i < records.length; i++) {
                if (this.newLease.getFieldValue('ls.ls_parent_id') == records[i].getValue('ls.ls_id')) {
                    this.dsNewLease.saveRecord(record);
                    existLease = true;
                    for (var i = 0; i < this.refreshPanels.length; i++) {
                        View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
                    }
                    View.closeThisDialog();
                    break;
                }
            }
            if (!existLease) 
                View.showMessage(getMessage('error_leaseid'));
            
        }
        else {
            this.dsNewLease.saveRecord(record);
            for (var i = 0; i < this.refreshPanels.length; i++) {
                View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
            }
            View.closeThisDialog();
        }
    },
    newLease_onCancel: function(){
        View.closeThisDialog();
    }
})

function validateData(dataSource, form){
    /*
     * check lease code (ls.id)
     */
    if (form.getFieldValue('ls.ls_id') == null ||
    form.getFieldValue('ls.ls_id') == '') {
        View.showMessage(getMessage('error_leaseid_empty'));
        return false;
    }
    if (dataSource.getRecords('ls.ls_id = \'' + form.getFieldValue('ls.ls_id') + '\'').length > 0) {
        View.showMessage(getMessage('error_leaseid_exist'));
        return false;
    }
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
	if(addNewLeaseController.itemType == 'BUILDING'){
		itemType = 'ls.bl_id'
	}else{
		itemType = 'ls.pr_id'
	}
	Ab.view.View.selectValue(
        'newLease', 'Parent Lease', ['ls.ls_parent_id'], 'ls', ['ls.ls_id'],
        [itemType,'ls.ls_id'],
		'ls.use_as_template = 0 and '+itemType +'= \''+this.addNewLeaseController.itemId+ '\' AND ls.lease_sublease !=  \'SUBLEASE\'', 'afterSelectParentLease', false, false, '', 1000, 500);
}

function afterSelectParentLease(fieldName, selectedValue, previousValue) {
    // the selected value can be copied to the form field
    return true;
}
