var abBldgMangementTabCtrl = View.createController('abBldgMangementTab', {
	isValidGisLicense : true,
	afterInitialDataFetch : function() {
		this.isValidGisLicense = hasValidArcGisMapLicense();
		this.tabsBldgManagement.addEventListener('afterTabChange', afterTabChange);
	}
})

function afterTabChange(tabPanel, selectedTabName) {
	if (abBldgMangementTabCtrl.isValidGisLicense) {
		var mapController = View.controllers.get('mapCtrl');
		if (selectedTabName == 'tabsBldgManagement_0') {
			mapController.showLegend();
		} else if (selectedTabName == 'tabsBldgManagement_1') {
			mapController.hideLegend();
		} else if (selectedTabName == 'tabsBldgManagement_2') {
			mapController.hideLegend();
		}
	}
}