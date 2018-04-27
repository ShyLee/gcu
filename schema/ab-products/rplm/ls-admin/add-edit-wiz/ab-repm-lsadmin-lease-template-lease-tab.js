var abRplmLsAdminLeaseTemplateLeaseTab_ctrl = View.createController('abRplmLsAdminLeaseTemplateLeaseTab_ctrl', {

	
	//enable/disable ls_parent_id field if lease_sublease has SUBLEASE/(LEASE or N/A) value
    setParentLease: function(){
        if (this.abRplmLsAdminLeaseTemplateLeaseTab_form.getFieldValue('ls.lease_sublease') == 'SUBLEASE') {
            this.abRplmLsAdminLeaseTemplateLeaseTab_form.enableField('ls.ls_parent_id', true);
        }
        else {
            this.abRplmLsAdminLeaseTemplateLeaseTab_form.enableField('ls.ls_parent_id', false);
        }
    }
    
});

function abRplmLsAdminLeaseTemplateLeaseTab_form_afterRefresh(){
	abRplmLsAdminLeaseTemplateLeaseTab_ctrl.setParentLease();
	
	if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
		abRplmLsAdminLeaseTemplateLeaseTab_ctrl.abRplmLsAdminLeaseTemplateLeaseTab_form.setFieldLabel("ls.amount_security",getMessage("amount_security_title") + ", " + View.user.userCurrency.description);
	}else{
		abRplmLsAdminLeaseTemplateLeaseTab_ctrl.abRplmLsAdminLeaseTemplateLeaseTab_form.setFieldLabel("ls.amount_security",getMessage("amount_security_title"));
	}
}


function selectParentLease() {
   
	Ab.view.View.selectValue(
        'abRplmLsAdminLeaseTemplateLeaseTab_form', 'Parent Lease', ['ls.ls_parent_id'], 'ls', ['ls.ls_id'],
        ['ls.ls_id'],
        'ls.use_as_template = 0  AND ls.lease_sublease !=  \'SUBLEASE\'', '', false, false, '', 300, 500);
}