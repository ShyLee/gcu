function afterMapLoad_JS(){
	var controller = View.controllers.get("abRplmPfadminGpdGisCtrl");
	if (valueExistsNotEmpty(controller.layer)) {
		controller.map.map.switchMapLayer(controller.layer);
	}
	controller.map.refresh(controller.restriction);

}

var abRplmPfadminGpdGisCtrl = View.createController('abRplmPfadminGpdGisCtrl', {
	
	objFilter: null,

	map: null,
	
	layerMenu: null,
	
	restriction: null,
	
	hasValidGisLicense: false,
	
	layer: null,
	
	afterViewLoad: function(){ 
		this.hasValidGisLicense = hasValidArcGisMapLicense();
		if (this.hasValidGisLicense) {
			//create map
			this.map = new Ab.flash.Map(
				'mapPanel', 
				'map',
				'abRplmPfadminGpdGis_ds',
				true,
				{'color' : '0xfff000', 'size': 10}	
			);
			
			var blMarkerProperty = new Ab.flash.ArcGISMarkerProperty('abRplmPfadminGpdGis_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
			var thematicBuckets = ['bl.use1'];	
			blMarkerProperty.setThematic('bl.use1', thematicBuckets); 		
			this.map.updateDataSourceMarkerPropertyPair('abRplmPfadminGpdGis_ds', blMarkerProperty);		

			//layer menu
			var menuObj = Ext.get('layersMenu'); 
			menuObj.on('mouseup', this.showLayerMenu, this, null);   

			this.map.addMouseClickEventHandler(showBuildingDetails);
		}
	},
	
	afterInitialDataFetch: function(){
		// try to get restriction object from current view or from opener
		if (View.restriction != null){
			this.objFilter = View.restriction;
		} else if (View.getOpenerView().restriction != null){
			this.objFilter = View.getOpenerView().restriction;
		}
		
		var instructionLabel = '';
		// try to get instructionLabel object from filter controller
		if (View.controllers.get('ctrlGpdFilter') != null){
			instructionLabel = View.controllers.get('ctrlGpdFilter').instructionLabel;
		} else if (View.getOpenerView().controllers.get('ctrlGpdFilter') != null){
			instructionLabel = View.getOpenerView().controllers.get('ctrlGpdFilter').instructionLabel;
		}
		
		// display filter restriction as an instruction for maximized view
		if(valueExistsNotEmpty(View.parameters)){
			if(View.parameters.maximize){
				this.mapPanel.setInstructions(instructionLabel);
				this.abRplmPfadminGpdGis_report.setInstructions(instructionLabel);
			}
		}
		
		this.restriction = this.getSqlRestriction(this.objFilter);
		if (this.hasValidGisLicense) {
			if (this.map.map != null) {
				this.map.refresh(" bl.lat IS NOT NULL AND bl.lon IS NOT NULL AND " + this.restriction);
			}
		}else{
			this.abRplmPfadminGpdGisTabs.showTab('abRplmPfadminGpdGisTabs_map', false);
			this.abRplmPfadminGpdGisTabs.selectTab('abRplmPfadminGpdGisTabs_report');
		}
		this.abRplmPfadminGpdGis_report.refresh(this.restriction);
		
	},
	
	showLayerMenu: function(e, item){
		
		if( this.layerMenu == null ) {
			var menuItems = [];
			var availableLayers = this.map.getAvailableMapLayerList();
			
			for( var i = 0; i < availableLayers.length; i++ ) {
				menuItems.push({
					text: availableLayers[i],
					handler: this.switchMapLayer
				})     
			}
			
			this.layerMenu = new Ext.menu.Menu({items: menuItems});
		}
		
		this.layerMenu.showAt(e.getXY());
	},
	
	switchMapLayer: function(item) {
		var controller = View.controllers.get("abRplmPfadminGpdGisCtrl");
		controller.layer = item.text;
		controller.map.map.switchMapLayer(item.text);
		controller.map.refresh(this.restriction);
	},
	
	
	mapPanel_onShowMap: function(str, level) {
		
		var blMarkerProperty = new Ab.flash.ArcGISMarkerProperty('abRplmPfadminGpdGis_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);		
				
		if( blMarkerProperty == null ){
			blMarkerProperty = new Ab.flash.ArcGISMarkerProperty('abRplmPfadminGpdGis_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);		
			this.map.updateDataSourceMarkerPropertyPair('abRplmPfadminGpdGis_ds', blMarkerProperty);
		}

		var thematicBuckets = ['bl.use1'];	
		blMarkerProperty.setThematic('bl.use1', thematicBuckets); 	
		
		if(level > 1){
			this.map.showLabels=true;
		}
		if(level > 2){
			this.map.showLabels=true;
			this.map.labelTextFormatProperties={'color' : '0xfffeee', 'size': 14}
		}
		
		this.map.refresh('1=1 ' + str);

	},
		
		getSqlRestriction: function( objFilter ){
			var result = "";
			if (objFilter != null) {
				if (valueExists(objFilter.bu_id)) {
					// is organization
					if(valueExistsNotEmpty(objFilter.dp_id)){
						result += "AND rm.dp_id = '" + objFilter.dp_id + "' ";
					}
					if(valueExistsNotEmpty(objFilter.dv_id)){
						result += "AND rm.dv_id = '" + objFilter.dv_id + "' ";
					}
					if(valueExistsNotEmpty(objFilter.bu_id) && result.length == 0 ){
						result += "AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = rm.dv_id AND dv.bu_id = '" + objFilter.bu_id + "')";
					}
					if (result.length > 0 ) {
						result = "AND EXISTS(SELECT rm.bl_id FROM rm WHERE rm.bl_id = bl.bl_id " + result + ") ";
					}
				}else {
					// is location
					if (valueExistsNotEmpty(objFilter.site_id)) {
						result += "AND bl.site_id = '"+ objFilter.site_id +"' ";
					}
					if (valueExistsNotEmpty(objFilter.ctry_id)) {
						result += "AND bl.ctry_id = '"+ objFilter.ctry_id +"' ";
					}
					if (valueExistsNotEmpty(objFilter.geo_region_id) && result.length == 0 ) {
						result += "AND EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id = '" + objFilter.geo_region_id + "') ";
					}
				}
				
				if (valueExistsNotEmpty(objFilter.use1)) {
					result += "AND bl.use1 = '" + objFilter.use1 + "' ";
				}
				
				if (result.length == 0) {
					result = " 1 = 1 ";
				}else {
					if (result.indexOf("AND") == 0) {
						result = result.slice(3);
					}
				}
				
			} else {
				result = " 1 = 1 ";
			}
			return result;
		},
		
		abRplmPfadminGpdGis_report_detail_onClick: function(row){
			var blId = row.getFieldValue('bl.bl_id');
			this.openDetailsPopUp(blId);
		},
		
		openDetailsPopUp: function(blId){

			View.openDialog('ab-rplm-pfadmin-leases-and-suites-by-building-base-report.axvw',null, true, {
				width:1280,
				height:600, 
				closeButton:true,
					afterInitialDataFetch:function(dialogView){
						var dialogController = dialogView.controllers.get('repLeaseSuitesByBldgBase');
						dialogController.bl_id = blId;
						dialogController.initializeView();
					}
			});
			
		}
		
});

/**
 * Marker click event handler.
 * @param title
 * @param attributes
 */
function showBuildingDetails(title,attributes){
  	var controller = View.controllers.get("abRplmPfadminGpdGisCtrl");
	var blId = title;
	controller.openDetailsPopUp(blId);
}

