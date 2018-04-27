/**
 * @author Kevenxi
 */
View.createController('abEmContactsxblController', {
	
	/**
	 * generate paginated report for user selection
	 */
	abEmContactsxbl_report_contact_onPaginatedReport: function(){
		if (this.abEmContactsxbl_report_contact.rows.length > 0) {
			var restriction = new Ab.view.Restriction();
			var selectedBuildingRow = this.abEmContactsxbl_grid_bl.rows[this.abEmContactsxbl_grid_bl.selectedRowIndex];
			restriction.addClause("bl.bl_id", selectedBuildingRow["bl.bl_id"], "=");
			View.openPaginatedReportDialog('ab-em-contactsxbl-pgrp.axvw', {'ds_ab-em-contactsxbl-pgrp_grid_bl':restriction}, null);
		}else{
			View.showMessage(getMessage("noRecords"));
		}
	}
});

function onClickBuilding(){
    var blGrid = View.panels.get("abEmContactsxbl_grid_bl");
    var selectedRow = blGrid.rows[blGrid.selectedRowIndex];
    var bl_id = selectedRow["bl.bl_id"];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("contact.bl_id", bl_id, "=");
	
	var contactGrid = View.panels.get("abEmContactsxbl_report_contact");
    contactGrid.refresh(restriction);
}
