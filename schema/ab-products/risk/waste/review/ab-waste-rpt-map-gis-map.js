var isLoaded = false;

/**
 * override default map coordinates.  the flash control calls this function, if available, after the map object loads
 */
function afterMapLoad_JS(panelId, mapId){
    //this changeExtent statement is optional. Be default, map will show northeast USA.  User calls this function if need to show different extent when the map is loaded.
    //
    //parameters: 
    //xmin Bottom-left X-coordinate of an extent envelope.
    //ymin Bottom-left Y-coordinate of an extent envelope.
    //xmax                 Top-right X-coordinate of an extent envelope.
    //ymax                 Top-right Y-coordinate of an extent envelope.
    //	
	mapControl.map.changeExtent(-17080656.88, -8161028.80, 18141525.75, 15320426.29);
	mapControl.map.setMapLevel(2);
	removeShowAsDialogButton();
}

function removeShowAsDialogButton(){
	if(mapController.htmlMap.actions.get('htmlMap_showAsDialog')){
		mapController.htmlMap.actions.get('htmlMap_showAsDialog').show(false);
	}
}


var mapController = View.createController('mapCtrl', {

	// flash map controll
	map : null,

	// selected building ids
	items : new Array(),

	// building records
	records : null,

	// flag of is valid license of gis
	isValidLicense : false,

	// maker property of the map control
	markerProperty : null,

	// html option and datasource field relation
	highlightColumns : {
		'option_solid_waste_generated' : 'total_solid_generated',
		'option_liquid_waste_generated' : 'total_liquid_generated',
		'option_gas_waste_generate' : 'total_gas_generated',
		'option_solid_waste_accumulated' : 'total_solid_accumulated',
		'option_liquid_waste_accumulated' : 'total_liquid_accumulated',
		'option_gas_waste_accumulated' : 'total_gas_accumulated',
		'option_solid_mass_waste_stored' : 'total_solid_stored',
		'option_liquid_volume_waste_stored' : 'total_liquid_stored',
		'option_gas_volume_waste_stored' : 'total_gas_stored',
		'option_solid_mass_waste_disposed' : 'total_solid_disposed',
		'option_liquid_volume_waste_disposed' : 'total_liquid_disposed',
		'option_gas_volume_waste_disposed' : 'total_gas_disposed',
		'option_stored_status': 'hazardous_waste_storage_level'
	},

	// the selected color by option
	colorSelected : 'option_none',

	// the selected sized by option
	sizeSelected : 'option_none',

	// restriction for bl datasource
	blRestricition : '1=1',

	// restriction for storageLocation datasource
	storageLocationRestricition : '1=1',

	afterViewLoad : function() {
		// initialize the map control after the view load
		this.initializeMap();
		
		this.createDropdowList();
	},
	
	afterInitialDataFetch: function(){
		var siteFieldDefs = this.dsBuilding.fieldDefs;
		var storageLocaitonFieldDefs = this.dsStorageLocation.fieldDefs;
		var unitDS = this.unitDS;
		var units = unitDS.getRecords("bill_unit.bill_type_id = 'REPORTS MASS'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id')
			siteFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('solid')!=-1){
					fieldDef.title = fieldDef.title + '('+unit+')';
				}
			});
			
			storageLocaitonFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('solid')!=-1){
					fieldDef.title = fieldDef.title + '('+unit+')';
				}
			});
		}
		
		units = unitDS.getRecords("bill_unit.bill_type_id = 'REPORTS VOLUME-LIQUID'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id')
			siteFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('liquid')!=-1){
					fieldDef.title = fieldDef.title + '('+unit+')';
				}
			});
			
			storageLocaitonFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('liquid')!=-1){
					fieldDef.title = fieldDef.title + '('+unit+')';
				}
			});
		}
		
		units = unitDS.getRecords("bill_unit.bill_type_id = 'REPORTS VOLUME-GAS'");
		if(units.length>0){
			var unit = units[0].getValue('bill_unit.bill_unit_id')
			siteFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('gas')!=-1){
					fieldDef.title = fieldDef.title + '('+unit+')';
				}
			});
			
			storageLocaitonFieldDefs.each(function(fieldDef) {
				if(fieldDef.fullName.indexOf('gas')!=-1){
					fieldDef.title = fieldDef.title + '('+unit+')';
				}
			});
		}
		
	},
	
	createDropdowList : function() {
		// incude border highlight option to the drawing panel
		var mapPanelTitleNode = document.getElementById('htmlMap_title').parentNode.parentNode;
		var cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerSize'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('makerSize') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerSize_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'makerSize_options'
		}, true);

		options.dom.options[0] = new Option('', 'option_none');
		options.dom.options[1] = new Option(getMessage('option_solid_waste_generated'), 'option_solid_waste_generated');
		options.dom.options[2] = new Option(getMessage('option_liquid_waste_generated'), 'option_liquid_waste_generated');
		options.dom.options[3] = new Option(getMessage('option_gas_waste_generate'), 'option_gas_waste_generate');
		options.dom.options[4] = new Option(getMessage('option_solid_waste_accumulated'), 'option_solid_waste_accumulated');
		options.dom.options[5] = new Option(getMessage('option_liquid_waste_accumulated'), 'option_liquid_waste_accumulated');
		options.dom.options[6] = new Option(getMessage('option_gas_waste_accumulated'), 'option_gas_waste_accumulated');
		options.dom.options[7] = new Option(getMessage('option_solid_mass_waste_stored'), 'option_solid_mass_waste_stored');
		options.dom.options[8] = new Option(getMessage('option_liquid_volume_waste_stored'), 'option_liquid_volume_waste_stored');
		options.dom.options[9] = new Option(getMessage('option_gas_volume_waste_stored'), 'option_gas_volume_waste_stored');
		options.dom.options[10] = new Option(getMessage('option_solid_mass_waste_disposed'), 'option_solid_mass_waste_disposed');
		options.dom.options[11] = new Option(getMessage('option_liquid_volume_waste_disposed'), 'option_liquid_volume_waste_disposed');
		options.dom.options[12] = new Option(getMessage('option_gas_volume_waste_disposed'), 'option_gas_volume_waste_disposed');
		options.on('change', this.applyMarkerSize, this, {
			delay : 100,
			single : false
		});

		var cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerColor'
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage('makerColor') + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(mapPanelTitleNode, {
			tag : 'td',
			id : 'makerColor_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : 'makerColor_options'
		}, true);

		options.dom.options[0] = new Option(getMessage(''), 'option_none');
		options.dom.options[1] = new Option(getMessage('option_solid_waste_generated'), 'option_solid_waste_generated');
		options.dom.options[2] = new Option(getMessage('option_liquid_waste_generated'), 'option_liquid_waste_generated');
		options.dom.options[3] = new Option(getMessage('option_gas_waste_generate'), 'option_gas_waste_generate');
		options.dom.options[4] = new Option(getMessage('option_solid_waste_accumulated'), 'option_solid_waste_accumulated');
		options.dom.options[5] = new Option(getMessage('option_liquid_waste_accumulated'), 'option_liquid_waste_accumulated');
		options.dom.options[6] = new Option(getMessage('option_gas_waste_accumulated'), 'option_gas_waste_accumulated');
		options.dom.options[7] = new Option(getMessage('option_solid_mass_waste_stored'), 'option_solid_mass_waste_stored');
		options.dom.options[8] = new Option(getMessage('option_liquid_volume_waste_stored'), 'option_liquid_volume_waste_stored');
		options.dom.options[9] = new Option(getMessage('option_gas_volume_waste_stored'), 'option_gas_volume_waste_stored');
		options.dom.options[10] = new Option(getMessage('option_solid_mass_waste_disposed'), 'option_solid_mass_waste_disposed');
		options.dom.options[11] = new Option(getMessage('option_liquid_volume_waste_disposed'), 'option_liquid_volume_waste_disposed');
		options.dom.options[12] = new Option(getMessage('option_gas_volume_waste_disposed'), 'option_gas_volume_waste_disposed');
		options.dom.options[13] = new Option(getMessage('option_stored_status'), 'option_stored_status');
		
		options.on('change', this.applyMarkerColor, this, {
			delay : 100,
			single : false
		});
	},


	/**
	 * initialize map object
	 */
	initializeMap : function() {
		this.isValidLicense = hasValidArcGisMapLicense();
		if (!this.isValidLicense) {
			this.disableControl();
			return;
		} else if (this.isValidLicense) {
			this.map = new Ab.flash.ThematicColorSizeMap('htmlMap', 'objMap', 'dsBuilding', true);
			this.map.addMouseClickEventHandler(onClickMarker);
		}
	},

	/**
	 * Show selected buildings on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	showSelectedBuildings : function(items, withMessage, consoleRestriction) {
		if (!this.isValidLicense) {
			return;
		}
		if (withMessage) {
			//View.showMessage(getMessage('not_geocoded'));
		}
		this.items = items;
		if (items.length > 0) {
			this.blRestricition = 'site.site_id IN (' + items.toString() + ')' ;
		} else {
			this.map.clear();
			return;
		}

		this.map.dataSourceId = 'dsBuilding';
		this.dsBuilding.addParameter('consoleRestriction',consoleRestriction);
		this.records = this.dsBuilding.getRecords(this.blRestricition);
		this.createMarkers();
	},

	/**
	 * Show selected storage location on map.
	 * 
	 * @param {Array}
	 *            items - selected building id's
	 */
	showSelectedStorageLocation : function(items, withMessage, consoleRestriction) {
		if (!this.isValidLicense) {
			return;
		}
		if (withMessage) {
			//View.showMessage(getMessage('not_geocoded'));
		}
		this.items = items;
		if (items.length > 0) {
			this.storageLocationRestricition = 'waste_areas.storage_location IN (' + items.toString() + ') ' ;
		} else {
			this.map.clear();
			return;
		}
		this.map.dataSourceId = 'dsStorageLocation';
		this.dsStorageLocation.addParameter('consoleRestriction',consoleRestriction);
		this.records = this.dsStorageLocation.getRecords(this.storageLocationRestricition);
		this.createMarkers();
	},
	
	/**
	 * apply marker size option.
	 */
	applyMarkerSize : function(e, option) {
		this.sizeSelected = option.value;
		if (mapController.items.length > 0) {
			this.createMarkers();
		} else {
			View.showMessage(getMessage('error_noselection'));
		}
	},

	/**
	 * apply marker color option.
	 */
	applyMarkerColor : function(e, option) {
		this.colorSelected = option.value;
		if (mapController.items.length > 0) {
			this.createMarkers();
		} else {
			View.showMessage(getMessage('error_noselection'));
		}
	},

	/**
	 * show markers on map
	 */
	createMarkers : function() {
		this.map.thematicLegend = null;
		// remove legend DOM element if exists
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.remove();
		}
		// create the marker property to specify building markers
		this.markerProperty = this.getMarkerProperty();
		if (this.colorSelected != 'option_none' && this.colorSelected != 'option_stored_status' ) {		
			this.map.buildThematicLegend(this.markerProperty);
		}
		this.map.updateDataSourceMarkerPropertyPair(this.map.dataSourceId, this.markerProperty);
		var restriction = this.blRestricition;
		if (this.map.dataSourceId != 'dsBuilding') {
			restriction = this.storageLocationRestricition;
		}
		this.map.refresh(restriction);
	},

	/**
	 * get marker property according the color by and size by option
	 */
	getMarkerProperty : function() {
		var tableName = 'site';
		// create default marker property to specify building markers
		var markerProperty = new Ab.flash.ArcGISThematicColorSizeBucketMarkerProperty('dsBuilding', ['site.lat', 'site.lon'], ['site.site_id'], ['site.total_solid_generated', 'site.total_liquid_generated',
			'site.total_gas_generated', 'site.total_solid_accumulated', 'site.total_liquid_accumulated',
			'site.total_gas_accumulated', 'site.total_solid_stored', 'site.total_liquid_stored', 'site.total_gas_stored', 'site.total_solid_disposed', 'site.total_liquid_disposed', 'site.total_gas_disposed']);

		if (this.map.dataSourceId != 'dsBuilding') {
			tableName = 'waste_areas';
			markerProperty = new Ab.flash.ArcGISThematicColorSizeBucketMarkerProperty('dsStorageLocation', ['waste_areas.lat', 'waste_areas.lon'], ['waste_areas.storage_location'], [
				'waste_areas.total_solid_generated', 'waste_areas.total_liquid_generated', 'waste_areas.total_gas_generated', 
				'waste_areas.total_solid_accumulated', 'waste_areas.total_liquid_accumulated', 'waste_areas.total_gas_accumulated','waste_areas.total_solid_stored', 'waste_areas.total_liquid_stored',
				'waste_areas.total_gas_stored', 'waste_areas.total_solid_disposed', 'waste_areas.total_liquid_disposed', 'waste_areas.total_gas_disposed']);

		}
		
		// add size buckets to the property
		if (this.sizeSelected != 'option_none') {
			var sizeField = tableName + '.' + this.highlightColumns[this.sizeSelected];
			markerProperty.sizeField = sizeField;
			var buckets = this.getBuckets(sizeField);
			markerProperty.sizeBuckets = [{
				limit : buckets[0],
				symbolSize : 15
			}, {
				limit : buckets[1],
				symbolSize : 30
			}, {
				limit : buckets[2],
				symbolSize : 40
			}, {
				limit : buckets[3],
				symbolSize : 50
			}];
		} else {
			if (this.colorSelected != 'option_none') {			
				markerProperty.sizeField = tableName + '.' + this.highlightColumns[this.colorSelected];
				// set defaut size buckets to the property
				markerProperty.sizeBuckets = [{
					limit : 0,
					symbolSize : 15
				}, {
					limit : 1,
					symbolSize : 15
				}, {
					limit : 2,
					symbolSize : 15
				}, {
					limit : 3,
					symbolSize : 15
				}];
			}
		}
		
		var colorsBuckets;
		var colors;
		var colorField;
		// add color thematic in the property
		if (this.colorSelected != 'option_none') {			
			colors = [[0, 255, 67, 1], [113, 210, 67, 1], [255, 247, 0, 1], [255, 122, 17, 0], [255, 0, 0, 0.75]];
			colorField = tableName + '.' + this.highlightColumns[this.colorSelected];
			colorsBuckets = this.getBuckets(colorField);
			if(this.colorSelected == 'option_stored_status'){
				colors = [[255, 0, 0, 0.75], [255, 255, 0, 1], [0, 255, 0, 1],[221, 221, 221, 1],[0, 255, 0, 1]];
				colorsBuckets = [150.0000,250.0000,350.0000,450.0000];
			}
		}else{
			if (this.sizeSelected != 'option_none') {
				colorField = markerProperty.sizeField;
				colorsBuckets = this.getBuckets(colorField);
				colors = [[255,0,0,0.75], [255,0,0,0.75], [255,0,0,0.75] , [255,0,0,0.75], [255,0,0,0.75]];
			}
		}
		
		if(colorField){
			markerProperty.colors = colors;
			markerProperty.setThematic(colorField, colorsBuckets);
		}
		
		return markerProperty
	},

	/**
	 * get buckets by field
	 * 
	 * @param {field}
	 *            field name
	 */
	getBuckets : function(field) {
		var buckets = [0];
		var records = this.records;
		if(records && records.length>0){
			var minVal = Number.MAX_VALUE;
			var maxVal = (-1) * Number.MAX_VALUE;
			for ( var i = 0; i < records.length; i++) {
				var record = records[i];
				var value = parseFloat(record.getValue(field));
				minVal = Math.min(minVal, value);
				maxVal = Math.max(maxVal, value);
			}
			var buckets = new Array();
			if (minVal != maxVal) {
				for ( var i = 0; i < 4; i++) {
					var val = new Number(minVal + ((maxVal - minVal) / 5) * (i + 1));
					buckets[i] = parseFloat(val.toFixed(5).toString());
				}
			} else {
				buckets[0] = parseFloat(minVal.toString());
			}
		}
		return buckets;
	},

	/**
	 * disable actions from this view
	 */
	disableControl : function() {
		var tabs = View.panels.get('tabsBldgManagement');
		tabs.hideTab('tabsBldgManagement_0');
	},

	/**
	 * hide legend when tab is changed
	 */
	hideLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(false);
		}
	},
	/**
	 * show legend when tab is selected
	 */
	showLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(true);
		}
	}
});

/**
 * onClickMarker open a report for selected item
 */
function onClickMarker(title, attributes) {
	var selected_item = title;
	View.openDialog('ab-waste-rpt-map-bl-loc-details.axvw', null, true, {
		width : 1280,
		height : 600,
		bl_id:"",
		site_id:"",
		closeButton : true,
		afterInitialDataFetch : function(dialogView) {
			var dialogController = dialogView.controllers.get('blDetail');
			if (dialogView.getOpenerView().controllers.get('mapCtrl').map.dataSourceId != 'dsBuilding') {
				dialogController.site_id = '';
				dialogController.storeageLocation = selected_item;
			}else{
				dialogController.site_id = selected_item;
				dialogController.storeageLocation = '';
			}
		}
	});
}
