/**
 * @author Kevenxi
 */
View.createController('abEmContactsController', {

	/**
	 * generate paginated report for user selection
	 */
	abEmContacts_report_contact_onPaginatedReport: function(){
		var treePanel = this.abEmContacts_tree_contact;
		if (treePanel.rows.length > 0) {
			if (treePanel.selectedRowIndex >= 0) {
				var contact_id = treePanel.rows[treePanel.selectedRowIndex]["contact.contact_id"];
				var restriction = new Ab.view.Restriction();
				restriction.addClause("contact.contact_id",contact_id,"=");
				View.openPaginatedReportDialog('ab-em-contacts-pgrp.axvw', {'ds_ab-em-contacts-pgrp_grid_contacts':restriction}, null);
			}
		}else{
			showMessage(getMessage("noRecords"));
		}
	}
    
});
