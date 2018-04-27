var gridContactsController = View.createController('gridContacts', {
	row:null,
	itemId:null,
	itemType:null,
	leaseId:null,
	refreshPanels: new Array(),
	refreshTree:null,
	gridContacts_onSave: function(){
		if(this.row == null){
			View.showMessage(getMessage('error_no_contact_selected'));
			return;
		}
        var restriction = new Ab.view.Restriction();
        restriction.addClause('contact.contact_id', this.row.record['contact.contact_id']);
		var contactParameters = {
			tableName:'contact',
			fieldNames: toJSON(['contact_id','address1','address2','bl_id','city_id','company','contact_type','county_id','ctry_id','email','fax','honorific','image_file','ls_id','name_first','name_last','notes','option1','option2','pager','phone','pin','pr_id','regn_id','state_id','status','tax_auth_type','zip','cellular_number']),
			restriction: toJSON(restriction)
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', contactParameters);
		if (result.code == 'executed') {
			var record = result.dataSet.records[0];
			switch(this.itemType){
				case 'BUILDING':{
					record.setValue('contact.bl_id', this.itemId);
					break;
				}
				case 'LAND':{
					record.setValue('contact.pr_id', this.itemId);
					break;
				}
				case 'STRUCTURE':{
					record.setValue('contact.pr_id', this.itemId);
					break;
				}
				case 'LEASE':{
					record.setValue('contact.ls_id', this.leaseId);
					break;
				}
			}
			this.dsContacts.saveRecord(record);
		}else{
			Workflow.handleError(result);
		}
		for(var i=0;i<this.refreshPanels.length;i++){
			View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
		}
		if(this.refreshTree){
			View.getOpenerView().controllers.get('portfAdminContacts').buildTree();
		}
		View.closeThisDialog();
	},
	gridContacts_onClose: function(){
		View.closeThisDialog();
	}
	
})

function selectLine(context){
	gridContactsController.row = this.row;
}
