
var programMapLocTabsController = View.createController('programMapLocTabsController', {
	

	// use for tab forward
	nextTabArr : new Array({
		panelName : 'regulationGrid',
		field : new Array([ "regloc.regulation", "regloc.regulation" ])
	}, {

		panelName : 'programGrid',
		field : new Array([ "regloc.regulation", "regloc.regulation" ],
				[ "regloc.reg_program", "regloc.reg_program" ])

	}),    

	afterInitialDataFetch : function() {
		View.usedInMapView = true;
		this.refreshTabs(View.restriction);
	},
	
	refreshTabs: function(restriction) {
		var tabs = this.sbfDetailTabs;
        //get restriction from the view object and refresh all tabs
		for(var i=0; i<tabs.tabs.length;i++){
			tabs.tabs[i].restriction = restriction;
			tabs.tabs[i].refresh();
		}
	},
	
	/**
	 * This blank function is used to avoid error in shared js file ab-comp-rpt-regloc-common.js.
	 */
	setOthersTabRefreshObj: function(restriction) {}
	
});


