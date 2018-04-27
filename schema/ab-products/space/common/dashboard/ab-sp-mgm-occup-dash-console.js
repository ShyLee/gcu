/**
 * @author: Lei
 */
var controllerConsole = View.createController('controllerConsole', {
	 /**
      * event handle when search button click.
      */
	abHelpRequestTreeConsole_onFilter: function(){
		this.setRestriction();
		var dashCostAnalysisMainController = View.controllers.get('dashCostAnalysisMainController');
		dashCostAnalysisMainController.refreshDashboard();
		
     },
     
	/**
	 * Clear console .
	 */
	abHelpRequestTreeConsole_onClear: function(){
	    this.abHelpRequestTreeConsole.clear();
	    this.setRestriction();
	   
	},
	
	/**
	 * Set console restriction  for chart .
	 */
	setRestriction:function(){
		var dashCostAnalysisMainController = View.controllers.get('dashCostAnalysisMainController');
		 dashCostAnalysisMainController.dvId =this.abHelpRequestTreeConsole.getFieldValue("rmpct.dv_id");
			dashCostAnalysisMainController.dpId =this.abHelpRequestTreeConsole.getFieldValue("rmpct.dp_id");
			dashCostAnalysisMainController.blId =this.abHelpRequestTreeConsole.getFieldValue("rmpct.bl_id");
			dashCostAnalysisMainController.siteId =this.abHelpRequestTreeConsole.getFieldValue("bl.site_id");
			dashCostAnalysisMainController.setConsoleRestriction();
	}
});