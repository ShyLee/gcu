var abBldgMangementTabCtrl = View.createController('abBldgMangementTab', {
	isValidGisLicense : true,
	afterInitialDataFetch : function() {
		this.isValidGisLicense = hasValidArcGisMapLicense();
		this.tabsBldgManagement.addEventListener('afterTabChange', afterTabChange);
		this.tabsBldgManagement.disableTab('msdsTab');
	}
})

function afterTabChange(tabPanel, selectedTabName) {
	if (abBldgMangementTabCtrl.isValidGisLicense) {
		var mapController = View.controllers.get('mapCtrl');
		if (selectedTabName == 'gisMapTab') {
			mapController.showLegend();
		} else if (selectedTabName == 'locTab') {
			mapController.hideLegend();
		}
	}
}