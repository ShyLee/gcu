var abProbTypeEditCtrl = View.createController('abProbTypeEditCtrl',{
	abProbtypeEdit_detailsPanel_beforeSave: function(){
		this.abProbtypeEdit_detailsPanel.setFieldValue("probtype.hierarchy_ids", this.abProbtypeEdit_detailsPanel.getFieldValue("probtype.prob_type") + '|');
	}
})
