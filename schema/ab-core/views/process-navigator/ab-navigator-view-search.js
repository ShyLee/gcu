// ab-navigator-view-search.js

var viewSearchController = View.createController('viewSearchController', {

	afterLayout: function () {
		var searchPanel = View.getControl('','taskSearchReportGrid');
		var parameterText = View.parameters.searchText;
		var taskTitleColumn = parameterText.substr(0, parameterText.indexOf(";"));
		var searchString = parameterText.substr(parameterText.indexOf(";") + 1);
		
		searchPanel.addParameter('taskTitleColumn', taskTitleColumn);
		searchPanel.addParameter('searchString', searchString);
	}
});

/**
 * Open the dialog's selected task in the opener window's viewContent panel
 * Close the dialog
 */
function openTaskInViewContent() {
	var searchPanel = View.getControl('','taskSearchReportGrid');
	var row = searchPanel.rows[searchPanel.selectedRowIndex];
	var viewFile = row['afm_ptasks.task_file'];

	var openerView = View.getOpenerWindow().View;
	if (openerView != null) {
		var targetPanel = openerView.panels.get('viewContent');
		targetPanel.loadView(viewFile);
		openerView.closeDialog();
	}
}
