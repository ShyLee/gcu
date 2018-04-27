var projStatPkgActController = View.createController('projStatPkgAct', {
	project_id: '',
	
	projStatPkgActGrid_onUpdateActions : function() {
		var records = this.projStatPkgActGrid.getSelectedRecords();
		if (records.length < 1) {
			View.showMessage(getMessage('noRecords'));
			return;
		}
		var updateParameters = {};
		updateParameters.records = records;
        
        View.openDialog('ab-proj-stat-pkg-act-up.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            updateParameters: updateParameters
        });
	},
	
	projStatPkgActGrid_onAddNew: function() {
		View.openDialog('ab-proj-stat-pkg-act-add.axvw', this.projStatPkgActGrid.restriction, true);
	}
});