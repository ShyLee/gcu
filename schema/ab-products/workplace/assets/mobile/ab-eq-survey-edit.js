
function onEditSurveyTask() {
	//refresh panel
	View.getOpenerView().panels.get('eqSurveyTasksGrid_grid').refresh();

	//close dialog
	View.getOpenerView().closeDialog();
}
