var eqHisByEqstdCrossController = View.createController('eqHisByEqstdCrossController', {

	afterViewLoad: function() {
		var panel=this.crosstablePanel;
		var mainController = getDashMainController("dashCostAnalysisMainController");
		panel.addParameter('monthStart', mainController.dateStart);
		panel.addParameter('monthEnd', mainController.dateEnd);
		var res = View.getOpenerView().controllers.get("eqHisLineController").res;
		panel.addParameter('otherRes', res);
		panel.refresh();      
		this.crosstablePanel.show(true);
	}
})
