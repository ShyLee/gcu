var contactDetailController = View.createController('contactDetailCtrl',{
	
	/**
	 * show paginated report
	 */
	repContactsFilterPanel_onPaginatedReport: function(){
		var restriction = this.repContactsFilterPanel.getRecord().toRestriction();
		View.openPaginatedReportDialog('ab-ca-cont-prnt.axvw', {'ds_Contacts_data':restriction});
	},	
	// hide contactDetailsPanel
	repContactsFilterPanel_onShow:function(){
		var console = View.panels.get('repContactsFilterPanel');
		var sqlFilter = "1 = 1";
		var contact_id = console.getFieldValue('contact.contact_id');
		if(contact_id){
			sqlFilter += " AND contact.contact_id LIKE '" + contact_id + "'";
		}
		var company = console.getFieldValue('contact.company');
		if(company){
			sqlFilter += " AND contact.company = '" + company + "'";
		}
		var contact_type = console.getFieldValue('contact.contact_type');
		if(contact_type){
			sqlFilter += " AND contact.contact_type = '" + contact_type + "'";
		}
		var status = console.getFieldValue('contact.status');
		if(status){
			sqlFilter += " AND contact.status = '" + status + "'";
		}
		var tree = View.panels.get('repContactsTreeLevel1');
		tree.addParameter('sqlFilter', sqlFilter);
		tree.refresh();
		this.contactDetailsPanel.show(false);
	}
});
