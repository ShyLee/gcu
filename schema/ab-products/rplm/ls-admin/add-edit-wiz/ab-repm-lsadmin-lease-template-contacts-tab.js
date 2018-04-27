/*
 * This method is called by the tree control for each new tree node created from the data.
 *
 * For nodes with index level == 0 set the 'contact_type' value as a restriction
 */
function afterGeneratingTreeNode(treeNode){

    if (treeNode.level.levelIndex == 0) {
        
		var contactType = (treeNode.data['contact.contact_type.raw'])?treeNode.data['contact.contact_type.raw']:treeNode.data['contact.contact_type'];
		treeNode.restriction.addClause('contact.contact_type', contactType);
    }
    
}

//controller definition
var rplmContactsController = View.createController('rplmContacts', {
	
	afterViewLoad:function(){
		View.getOpenerView().controllers.get('abRplmLsAdminAddEditLeaseTemplate_ctrl').contactsTree = this.abRplmLeaseTemplateContactsTab_contactTypeTree;
	},

    //event listener for 'Delete' action from 'formContactDetails' panel
    formContactDetails_onDelete: function(){
        var dataSource = this.dsContactDetails;
        var controller = this;
        var record = this.formContactDetails.getRecord();
        View.confirm(getMessage('confirm_delete_contact'), function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    controller.formContactDetails.show(false);
                    controller.abRplmLeaseTemplateContactsTab_contactTypeTree.refresh();
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
            }
        })
    }
    
})



//event listener for 'Save' action from 'formAddEditContact' panel
function saveContact(){
    
	var controller = rplmContactsController;
	var isNewRecord = controller.formAddEditContact.newRecord;
	if (controller.formAddEditContact.save()) {
        if (isNewRecord) {
            controller.formContactDetails.show(false);
        }else{
			controller.formContactDetails.refresh();
		}
		controller.abRplmLeaseTemplateContactsTab_contactTypeTree.refresh();
		controller.abRplmLeaseTemplateContactsTab_contactTypeTree.expand();
    }
    
}

/**
 * Copy to Contact the location fields of the selected Company
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectCompany(fieldName, selectedValue, previousValue){
	var panel = View.panels.get("formAddEditContact");
	
	if(!panel.newRecord)
		return;
	
	var dsCompany = View.dataSources.get("abRplmLeaseTemplateContactsTab_dsCompany");
	var companyRecord = dsCompany.getRecord(new Ab.view.Restriction({"company.company": selectedValue}));
	
	if(panel.getFieldValue("contact.address1") == "")
		panel.setFieldValue("contact.address1", companyRecord.getValue("company.address1"));
	
	if(panel.getFieldValue("contact.address2") == "")
		panel.setFieldValue("contact.address2", companyRecord.getValue("company.address2"));
	
	if(panel.getFieldValue("contact.city_id") == "")
		panel.setFieldValue("contact.city_id", companyRecord.getValue("company.city_id"));
	
	if(panel.getFieldValue("contact.ctry_id") == "")
		panel.setFieldValue("contact.ctry_id", companyRecord.getValue("company.ctry_id"));
	
	if(panel.getFieldValue("contact.regn_id") == "")
		panel.setFieldValue("contact.regn_id", companyRecord.getValue("company.regn_id"));
	
	if(panel.getFieldValue("contact.state_id") == "")
		panel.setFieldValue("contact.state_id", companyRecord.getValue("company.state_id"));
	
	if(panel.getFieldValue("contact.zip") == "")
		panel.setFieldValue("contact.zip", companyRecord.getValue("company.zip"));
}
