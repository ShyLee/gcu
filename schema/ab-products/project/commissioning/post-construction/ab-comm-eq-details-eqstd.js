var commEqDetailsEqstdController = View.createController('commEqDetailsEqstd', {
	commEqDetailsEqstd_eqDetails_afterRefresh : function() {
		showPhoto('commEqDetailsEqstd_eqDetails', 'eqstd.doc_graphic', 'eqstd.eq_std');
	},
	
	commEqDetailsEqstd_eqDetails_onEditEqstd : function() {
		var eq_std = this.commEqDetailsEqstd_eqDetails.getFieldValue('eqstd.eq_std');
		if (eq_std == "") {
			this.commEqDetailsEqstd_eqstdEdit.refresh(null, true);
			this.commEqDetailsEqstd_eqstdEdit.showInWindow({
				newRecord:true
			});
		}
		else {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('eqstd.eq_std', eq_std);
			this.commEqDetailsEqstd_eqstdEdit.refresh(restriction);
			this.commEqDetailsEqstd_eqstdEdit.showInWindow({
			});	
			showPhoto('commEqDetailsEqstd_eqstdEdit', 'eqstd.doc_graphic', 'eqstd.eq_std');
		}
	},
	
	commEqDetailsEqstd_eqstdEdit_onSave : function() {
		this.commEqDetailsEqstd_eqstdEdit.save();
		var eq_std = this.commEqDetailsEqstd_eqstdEdit.getFieldValue('eqstd.eq_std');
		var record = this.commEqDetailsEqstd_eqDs.getRecord(this.commEqDetailsEqstd_eqDetails.restriction);
		record.setValue('eq.eq_std', eq_std);
		this.commEqDetailsEqstd_eqDs.saveRecord(record);
		this.commEqDetailsEqstd_eqDetails.refresh();
		this.commEqDetailsEqstd_eqstdEdit.closeWindow();
		showPhoto('commEqDetailsEqstd_eqDetails', 'eqstd.doc_graphic', 'eqstd.eq_std');
		
		View.getOpenerView().panels.get('commEqDetailsForm').refresh();
		refreshParentView();
	}
});

function commEqDetailsEqstd_eqstdEdit_onSelectExisting(fieldName, newValue, oldValue) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('eqstd.eq_std', newValue);
	View.panels.get('commEqDetailsEqstd_eqstdEdit').refresh(restriction, false);
	showPhoto('commEqDetailsEqstd_eqstdEdit', 'eqstd.doc_graphic', 'eqstd.eq_std');
}

function showPhoto(formPanelId, fieldId, pkId){	
	var panel = View.panels.get(formPanelId);
	
	if(valueExistsNotEmpty(panel.getFieldValue(fieldId))){
		panel.showImageDoc('image_field', pkId, fieldId);
	}else{
		panel.fields.get('image_field').dom.src = null;
	}	
}