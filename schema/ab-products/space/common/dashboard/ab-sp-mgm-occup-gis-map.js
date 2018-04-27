function afterMapLoad_JS(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.lon', '0', "!=", "OR");
	mapControl.refresh(restriction);
}

var gisController = View.createController('gisController', {

	// flash map controll
	map : null,

	// flag of is valid license of gis
	isValidLicense : false,
	resFromShowFunction:'',
	afterViewLoad: function(){
		//add footer to gridCaHighRmLSRep panel
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		
		if(dashCostAnalysisMainController.gisController==''){
			
		dashCostAnalysisMainController.gisController=this;
		this.initializeMap();
		gisController.hideMapPanel.defer(500);
		}else{
			
			
			this.map = new Ab.flash.Map(
					'mapPanel', 
					'map',
					'bl_ds',
					false,
					{'color' : '0xfff000', 'size': 1000}	
				);
				
				var blMarkerProperty = new Ab.flash.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
				var thematicBuckets = ['bl.use1'];	
				blMarkerProperty.setThematic('bl.use1', thematicBuckets); 	
				this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);	
				
				this.addMakers.defer(1000);
		
		}
	},
	
	hideMapPanel:function(){
		gisController.mapPanel.show(false);
	},

	
	/**
	 * initialize map object
	 */
	initializeMap : function() {
		this.isValidLicense = hasValidArcGisMapLicense();
		if (!this.isValidLicense) {
		
			return;
		} 
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		this.map = new Ab.flash.Map(
				'mapPanel', 
				'map',
				'bl_ds',
				false,
				{'color' : '0xfff000', 'size': 1000}	
			);
			
			var blMarkerProperty = new Ab.flash.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
			var thematicBuckets = ['bl.use1'];	
			blMarkerProperty.setThematic('bl.use1', thematicBuckets); 		
			this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);	
	
	},

	/**
	 * Show selected buildings on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	showSelectedBuildings : function(res) {
		
		gisController.resFromShowFunction='';
		gisController.resFromShowFunction=res;
		gisController.mapPanel.show(true);
		gisController.deferAddMarkers.defer(1000);
		
	},
	
	/**
	 * For show button defer function to show gis
	 */
	deferAddMarkers:function(){
		
		this.isValidLicense = hasValidArcGisMapLicense();
		if (!gisController.isValidLicense) {
		
			return;
		} 
		gisController.createMarkers(gisController.resFromShowFunction);
	},

	/**
	 * show markers on map
	 */
	createMarkers : function(res) {
			
			var blMarkerProperty = new Ab.flash.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
			var thematicBuckets = ['bl.use1'];	
			blMarkerProperty.setThematic('bl.use1', thematicBuckets);
			
			gisController.map.refresh(res);
			
			
	},
	/**
	 * For maximize defer function
	 */
	addMakers:function(){
		gisController.map.clear();  
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		var res=dashCostAnalysisMainController.treeRes+" AND "+dashCostAnalysisMainController.blIdRes+" AND "+dashCostAnalysisMainController.siteIdRes;
		gisController.createMarkers(res);
	}
	
	
});


