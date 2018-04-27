
var mapController = View.createController('showMap', {
	// Ab.arcgis.ArcGISMap control instance
	// the mapControl is equiv to the mapPanel
	mapControl: null, 
	
	// Ab.arcgis.LocateAssetTool instance
	locateAssetTool: null, 
	
	// asset record
	assetRecord: null,
	assetRowIndex: null,
	
	// asset grid
	selectedAssetRows: [],
	checkBoxAllSelected: false,
	
	// asset map extent
	assetMapExtent: null,
	
	// map click handler handle
	dojoMapZoomHandle: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
		this.locateAssetTool = new Ab.arcgis.AssetLocator(this.mapControl);		
		
		// disable controls until selection	
		mapController.toggleMapPanelControls(false);
				
		// overrides Grid.onChangeMultipleSelection
		this.assetPanel.addEventListener('onMultipleSelectionChange', function(row) {
			var selection = View.panels.get('assetPanel').getSelectedRows();
			if( selection[0] ){
				View.controllers.get('showMap').toggleAssetPanelControls(true);
			}
			else {
				View.controllers.get('showMap').toggleAssetPanelControls(false);
			}
		})
	},
			
	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");
      	var bodyElem = reportTargetPanel.parentNode;    
      	reportTargetPanel.className = 'claro';		
		
		//disable controls until selection
		mapController.toggleAssetPanelControls(false);
	},	
	
    prepareData: function(){
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('assetDS', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    	blMarkerProperty.showLabels = false;
		this.mapControl.updateDataSourceMarkerPropertyPair('assetDS', blMarkerProperty);
    },
	
	/**
	 * Creates a restriction based on selected rows.
	 */
	getRestriction: function(rows) {
    	var selectedRows = this.assetPanel.getSelectedRows(rows);  
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('bl.bl_id', 'null', "=", "OR");
    	}
    	return restriction;
	},
	
	assetPanel_onShowAssets: function(rows) {   

    	var blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('assetDS');
    	
    	if( blMarkerProperty == null ){
    		this.prepareData();
    		blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('assetDS');
    	}
    	blMarkerProperty.showLabels = false;
    	var restriction = this.getRestriction(rows);
		blMarkerProperty.setRestriction(restriction);
    	this.mapControl.updateDataSourceMarkerPropertyPair('assetDS', blMarkerProperty);
    	this.mapControl.refresh();
		
	}, 
	
	assetPanel_onGeocodeAssets: function(rows) {
  		//create Ab.arcgis.GeoCodeTool
  		//parameter is the Ab.arcgis.ArcGISMap
  		var geoCodeTool = new Ab.arcgis.Geocoder(this.mapControl);
  		
  		var restriction = this.getRestriction(rows);
  		
  		//geoCodeTool does geoCode work
  		//
  		//parameters:
     	//dataSourceName. The dataSource to get records.
     	//restriction. The restriction needed when get dataRecords from dataSource.
     	//tableName. The tableName in which the records's geometry information will be added.
     	//pkField.  The primary key field for tableName.
     	//geometryFields.  The geometryFields for tableName.
     	//addressFields.  	The fields whose value hold the actual address.
     	//replace.  Boolean.  Whether replace the existing geometry information.
     	
  		geoCodeTool.geoCode('assetDS',
		                    restriction,
							'bl', 
							'bl.bl_id', 
							['bl.lat', 'bl.lon'], 
							['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], 
							true);
	},

	assetPanel_afterRefresh : function() {
		var grid = this.assetPanel;
		var selectedRows = this.selectedAssetRows;
		for(var i=0; i < selectedRows.length; i++) {
			var index = selectedRows[i].row.getIndex();
			grid.selectRowChecked(index, true);
		}

		if(this.checkAllBoxSelected){
			var checkAllEl = Ext.get('assetPanel_checkAll');
			checkAllEl.dom.checked = true;
		}
		
		// re-select active asset row
		if (this.assetRowIndex) {
			grid.selectRow(assetRowIndex);
		}
		
		this.selectedAssetRows = [];
		this.checkAllBoxSelected = false;
	},
	
	startLocateAsset: function(row) {
		
		var restriction = new Ab.view.Restriction();
		if (row) {
			restriction.addClause('bl.bl_id', row['bl.bl_id'], "=", "OR");
			// save the record object
			assetRecord = row.row.getRecord();
			assetRowIndex = row.index;
		}
		
		// if there is a ds restriction, a refresh will cause the map to zoom to the extent 
		// of the current restriction... undesireable under most circumstances
		// re-zoom map to location asset  
		var lon = row['bl.lon'];
		var lat = row['bl.lat'];
		if (!!lon && !!lat) {
			var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));
			var mapLevel = mapControl.map.getLevel();
			if ( mapLevel > 17 ) {
				mapControl.map.centerAt( point );
			}
			else {
				mapControl.map.centerAndZoom( point, 17 );
			}
		}
		else
		{
			// geometry doesnt exist -- just stay where we are and let the user navigate the map
		}
		
		// END traditional marker property approach
		
		// enable/disable various controls
		mapController.toggleMapPanelControls(true);
		mapController.toggleAssetPanelControls(false);
		mapController.toggleCheckBoxControls(true);
		
		// perform location
		//
		// parameters:
		// dataSourceName - the dataSource to get records from
		// restriction - the restriction to apply to the datasource
		// pkField - the primary key field for the table
		// geometry fields - an array of geometry fields for the table
		// infoFields - an array of fields to display in the infoWindow
		// 
		
		mapController.locateAssetTool.startLocate(
			'assetDS',
			restriction,
			'bl.bl_id',
			['bl.lon', 'bl.lat'],
			['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']
		);	
	},

	mapPanel_onCancelLocateAsset: function() {
		mapController.toggleMapPanelControls(false);
		mapController.toggleCheckBoxControls(false);
		mapController.locateAssetTool.cancelLocate();
	},
	
	mapPanel_onFinishLocateAsset: function() {
		
		// get coords and save asset record
		var assetCoords = mapController.locateAssetTool.finishLocate();
		var lon = assetCoords[0];
		var lat = assetCoords[1];
		assetRecord.setValue('bl.lon', lon);
		assetRecord.setValue('bl.lat', lat);
		mapController.assetDS.saveRecord(assetRecord);
		
		mapController.selectedAssetRows = mapController.assetPanel.getSelectedRows();
		var checkAllEl = Ext.get('assetPanel_checkAll');
	    mapController.checkAllBoxSelected = checkAllEl.dom.checked;
		
		mapController.assetPanel.refresh();
		
		// disable/enable panel actions
		mapController.toggleMapPanelControls(false);
		mapController.toggleAssetPanelControls(true);
		mapController.toggleCheckBoxControls(false);

		// refresh map graphics in case assets are showing
		var restriction = mapController.getRestriction();
		mapController.mapControl.refresh(restriction);	
		
		// if restriction -- reset map extent
		// should this be in the core ??? 
		dojoMapZoomHandle = dojo.connect(mapController.mapControl.map, 'onZoomEnd', mapController.zoomToAssetMapExtent);
	},
	
	zoomToAssetMapExtent: function(extent, zoomFactor, anchor, level) {
		// remove map listener
		dojo.disconnect( dojoMapZoomHandle );
		
		if ( mapController.assetMapExtent ) {
			mapController.mapControl.map.setExtent( mapController.assetMapExtent );
			mapController.assetMapExtent = null;		
		}		
	},
	
	toggleAssetPanelControls: function(value) {
		this.assetPanel.actions.get('showAssets').forcedDisabled = false;
		this.assetPanel.actions.get('geocodeAssets').forcedDisabled = false;
		this.assetPanel.actions.get('showAssets').enable(value);
		this.assetPanel.actions.get('geocodeAssets').enable(value);
	},
	
	toggleMapPanelControls: function(value) {
		this.mapPanel.actions.get('cancelLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('finishLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('cancelLocateAsset').enable(value);
		this.mapPanel.actions.get('finishLocateAsset').enable(value);
	},
	
	toggleCheckBoxControls: function(value) {
		// get all inputs
		var inputs = Ext.query('input');
		// disable checkboxes only
		for(i=0; i < inputs.length; i++) {
			if (inputs[i].type == 'checkbox') {
				inputs[i].disabled = value;
			}
		}
	}
});
