var activitytypeEditController = View.createController('activitytypeEdit', {

	activitytypeEditForm_afterRefresh : function() {
		//if (View.taskInfo.activityId == 'AbBldgOpsHelpDesk') this.activitytypeEditForm.setInstructions('USMS');
		if (this.activitytypeEditForm.newRecord) {
			this.activitytypeEditForm.setFieldValue('activitytype.activity_type', 'SD -');
		}
	}
});

