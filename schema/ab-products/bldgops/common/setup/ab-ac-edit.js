var abAcEditCtrl = View.createController('abAcEditCtrl',{
	abAcEdit_detailsPanel_beforeSave: function(){
		this.abAcEdit_detailsPanel.setFieldValue("ac.hierarchy_ids", this.abAcEdit_detailsPanel.getFieldValue("ac.ac_id") + '|');
	}
})
