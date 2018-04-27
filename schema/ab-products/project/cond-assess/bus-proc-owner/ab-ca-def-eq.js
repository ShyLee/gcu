/**
 * @author Ioan Draghici
 * 06/10/2009
 * 
 * @TODO : 
 */

var caDefEqController = View.createController('caDefEq',{
	// curent selected Equipment
	crtRow: null,
	// crt restriction for detail tabs
	restriction: null,
	// new record for details tab
	isNew: true,
	// filter console restriction
	consoleRestriction: null,
	
	afterInitialDataFetch: function(){
		this.refreshTabs();
	},
	/**
	 * restrict list to user selection
	 */
	caDefEqFilterPanel_onShow: function(){
		this.consoleRestriction = this.caDefEqFilterPanel.getRecord().toRestriction();
		this.eqListPanel.refresh(this.consoleRestriction);
		this.crtRow = null;
		this.restriction = null;
		this.isNew = true;
		this.refreshTabs();
	},
	/**
	 * refresh details tabs
	 */
	refreshTabs: function(){
		this.eqDetailTabs.selectTab("detailTab_1", this.restriction, this.isNew, false, false);
		this.eq_detail_1.refresh(this.restriction, this.isNew);
		this.eq_detail_2.refresh(this.restriction, this.isNew);
		this.eq_detail_3.refresh(this.restriction, this.isNew);
		this.eq_detail_4.refresh(this.restriction, this.isNew);
		this.eq_detail_5.refresh(this.restriction, this.isNew);
	},
	/**
	 * set details tabs to new record
	 */
	eqListPanel_onNew: function(){
		this.crtRow = null;
		this.restriction = new Ab.view.Restriction();
		this.isNew = true;
		this.refreshTabs();
	},
	/**
	 * set details to previous selection
	 */
	caDefEq_onCancel: function(){
		this.refreshTabs();
	},
	/**
	 * delete selcted row and refresh panel
	 */
	caDefEq_onDelete: function(){
		if(!this.crtRow){
			return;
		}
        var dataSource = this.ds_eqDetails;
        var record = this.eq_detail_1.getRecord();
		var primaryFieldValue = record.getValue("eq.eq_id");
		var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
				controller.crtRow = null; 
				controller.restriction = null; 
				controller.isNew = true; 
				controller.eqListPanel.refresh(controller.consoleRestriction); 
				controller.refreshTabs();             
            }
        })
	},
	caDefEq_onSave: function(){
		/*
		 * 06/16/2010 IOAN 
		 * KB 3027994 try to use core validation for form fields
		 */
		if(!this.eq_detail_1.canSave()){
			this.eqDetailTabs.selectTab("detailTab_1");
			return;
		}else if(!this.eq_detail_2.canSave()){
			this.eqDetailTabs.selectTab("detailTab_2");
			return;
		}else if(!this.eq_detail_3.canSave()){
			this.eqDetailTabs.selectTab("detailTab_3");
			return;
		}else if(!this.eq_detail_4.canSave()){
			this.eqDetailTabs.selectTab("detailTab_4");
			return;
		}else if(!this.eq_detail_5.canSave()){
			this.eqDetailTabs.selectTab("detailTab_5");
			return;
		}
		
		var dataSource = this.ds_eqDetails;
		var record = this.eq_detail_1.getRecord();
		var formPanel = null;
		var fieldKey = "";
		var fieldValue = "";
		for(var i = 0; i < 5; i++){
			formPanel = View.panels.get('eq_detail_'+(i+1));
			for(var j=0;j< formPanel.fields.length;j++){
				fieldKey = formPanel.fields.keys[j];
				fieldValue = formPanel.getFieldValue(fieldKey);
				if(valueExistsNotEmpty(fieldValue)){
					record.setValue(fieldKey, fieldValue);
				}
			}
		}
		if(!this.validateBlAndSite(record)){
			return;
		}
		var selectedFormPanel = View.panels.get(this.eqDetailTabs.getSelectedTabName().replace('detailTab', 'eq_detail'));
		var primaryFieldValue = record.getValue("eq.eq_id");
		try{
			dataSource.saveRecord(record);
			this.eqListPanel.refresh(this.consoleRestriction); 
			var message = getMessage('formSaved');
			var restriction  = new Ab.view.Restriction();
			restriction.addClause("eq.eq_id", primaryFieldValue, '=');
			this.restriction = restriction;
			this.isNew = false;
			this.eq_detail_1.refresh(this.restriction, this.isNew);
			selectedFormPanel.displayTemporaryMessage(message);
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
	},

	/**
	 * validate building code against site code
	 */
	validateBlAndSite: function(record){
		var bl_id = record.getValue('eq.bl_id');
		var site_id = record.getValue('eq.site_id');
		if(valueExistsNotEmpty(bl_id) && valueExistsNotEmpty(site_id)){
			var parameters = {
				tableName: 'bl',
		        fieldNames: toJSON(['bl.bl_id', 'bl.site_id']),
		        restriction: toJSON(new Ab.view.Restriction({'bl.bl_id':bl_id, 'bl.site_id':site_id}))
			};
		    try {
		        var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
		        if (result.data.records.length == 0){
					View.showMessage(getMessage('no_match_bl_site'));
					return false;
				}
		    } catch (e) {
		        Workflow.handleError(e);
				return false;
		    }
		}
		return true;
	}
})

/**
 * show details for selected row
 * @param {Object} row
 */
function showDetails(row){
	caDefEqController.crtRow = row;
	caDefEqController.restriction = row.row.getRecord().toRestriction();
	caDefEqController.isNew = false;
	caDefEqController.refreshTabs();
}
