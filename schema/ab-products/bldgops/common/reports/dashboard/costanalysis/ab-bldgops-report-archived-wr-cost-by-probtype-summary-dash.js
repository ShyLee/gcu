var abBldgopsReportArchivedWrCostByProbtypeSumaryDashController = View.createController('abBldgopsReportArchivedWrCostByProbtypeSumaryDashController', {
	afterViewLoad: function() {
		var panel=this.abBldgopsReportArchivedWrCostByProbtypeCrosstable;
		var mainController = getDashMainController("dashCostAnalysisMainController");
		panel.addParameter('monthStart', mainController.dateStart);
		panel.addParameter('monthEnd', mainController.dateEnd);
		var res = View.getOpenerView().controllers.get("abBldgopsReportArchivedWrCostByProbtypeDashController").otherRes;
		panel.addParameter('otherRes', res);
		panel.refresh();      
		panel.show(true); 
    }
})