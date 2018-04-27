var isLoaded = false;

/**
 * override default map coordinates. the flash control calls this function, if
 * available, after the map object loads
 */
function afterMapLoad_JS(panelId, mapId) {
	// this changeExtent statement is optional. Be default, map will show
	// northeast USA. User calls this function if need to show different extent
	// when the map is loaded.
	//
	// parameters:
	// xmin Bottom-left X-coordinate of an extent envelope.
	// ymin Bottom-left Y-coordinate of an extent envelope.
	// xmax Top-right X-coordinate of an extent envelope.
	// ymax Top-right Y-coordinate of an extent envelope.
	//	
	mapControl.map.changeExtent(-17080656.88, -8161028.80, 18141525.75, 15320426.29);
	mapControl.map.setMapLevel(2);
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
		'option_msds_num' : 'msds_num',
		'option_max_radius' : 'max_radius',
		'option_total_mass' : 'total_mass',
		'option_total_volume' : 'total_volume',
		'option_tierII_hazard_count' : 'tierII_hazard_count',
		'option_highest_tierII_hazard_present' : 'highest_tierII_hazard_present'
	},

	// the selected color by option
	colorSelected : 'option_msds_num',

	// the selected sized by option
	sizeSelected : 'option_msds_num',

	// restriction for bl datasource
	blRestriction : '1=1',

	afterViewLoad : function() {
		// initialize the map control after the view load
		this.initializeMap();

		this.createDropdowList();

		if (this.htmlMap.actions.get('htmlMap_showAsDialog')) {
			this.htmlMap.actions.get('htmlMap_showAsDialog').show(false);
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

		options.dom.options[0] = new Option(getMessage('option_msds_num'), 'option_msds_num');
		options.dom.options[1] = new Option(getMessage('option_max_radius'), 'option_max_radius');
		options.dom.options[2] = new Option(getMessage('option_total_mass'), 'option_total_mass');
		options.dom.options[3] = new Option(getMessage('option_total_volume'), 'option_total_volume');
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

		options.dom.options[0] = new Option(getMessage('option_msds_num'), 'option_msds_num');
		options.dom.options[1] = new Option(getMessage('option_max_radius'), 'option_max_radius');
		options.dom.options[2] = new Option(getMessage('option_total_mass'), 'option_total_mass');
		options.dom.options[3] = new Option(getMessage('option_total_volume'), 'option_total_volume');
		options.dom.options[4] = new Option(getMessage('option_tierII_hazard_count'), 'option_tierII_hazard_count');
		options.dom.options[5] = new Option(getMessage('option_highest_tierII_hazard_present'), 'option_highest_tierII_hazard_present');
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
	showSelectedBuildings : function(items) {
		if (!this.isValidLicense) {
			return;
		}
		this.items = items;
		if (items.length > 0) {
			this.blRestriction = new Ab.view.Restriction();
			this.blRestriction.addClause("bl.bl_id", this.items, "IN");
		} else {
			this.map.clear();
			return;
		}

		this.map.dataSourceId = 'dsBuilding';
		this.records = this.dsBuilding.getRecords(this.blRestriction);
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
		if (this.colorSelected != 'option_highest_tierII_hazard_present') {
			this.map.buildThematicLegend(this.markerProperty);
		}
		this.map.updateDataSourceMarkerPropertyPair(this.map.dataSourceId, this.markerProperty);
		var restriction = this.blRestriction;
		this.map.refresh(restriction);
	},

	/**
	 * get marker property according the color by and size by option
	 */
	getMarkerProperty : function() {
		var tableName = 'bl';
		// create marker property to specify building markers		
		if (this.sizeSelected == 'option_max_radius') {
			var markerProperty = new Ab.flash.ArcGISRadiusMarkerProperty('dsBuilding', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.site_id', 'bl.bl_id', 'bl.name', 'bl.msds_num',
				'bl.highest_tierII_txt', 'bl.max_radius_txt'], 'bl.max_radius_txt');
			markerProperty.setSymbolType('circle');
			this.map.bFillSymbolEnabled = true;
			
		} else {
			var markerProperty = new Ab.flash.ArcGISThematicColorSizeBucketMarkerProperty('dsBuilding', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.site_id', 'bl.bl_id', 'bl.name', 'bl.msds_num',
                'bl.highest_tierII_txt', 'bl.max_radius']);
			markerProperty.setSymbolType('diamond');
			this.map.bFillSymbolEnabled = false;
			
			// add size buckets to the property
			var sizeField = tableName + '.' + this.highlightColumns[this.sizeSelected];
			markerProperty.sizeField = sizeField;
			var buckets = this.getBuckets(sizeField);
			markerProperty.sizeBuckets = [{
				limit : buckets[0],
				symbolSize : 20
			}, {
				limit : buckets[1],
				symbolSize : 35
			}, {
				limit : buckets[2],
				symbolSize : 45
			}, {
				limit : buckets[3],
				symbolSize : 55
			}];
		}

		var colorsBuckets;
		var colors;
		var colorField;
		// add color thematic in the property
		colors = [[0, 255, 67, 1], [113, 210, 67, 1], [255, 247, 0, 1], [255, 122, 17, 0], [255, 0, 0, 0.75]];
		colorField = tableName + '.' + this.highlightColumns[this.colorSelected];
		colorsBuckets = this.getBuckets(colorField);
		if (this.colorSelected == 'option_highest_tierII_hazard_present') {
			colors = [[255, 0, 0, 0.75], [255, 255, 0, 1], [0, 255, 0, 1], [221, 221, 221, 1], [0, 255, 0, 1]];
			colorsBuckets = [150.0000, 250.0000, 350.0000, 450.0000];
		}

		if (this.sizeSelected != 'option_max_radius') {
			markerProperty.colors = colors;
		}

		markerProperty.setThematic(colorField, colorsBuckets);

		return markerProperty;
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
		if (records && records.length > 0) {
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
					buckets[i] = parseInt(val.toFixed(5).toString());
				}
			} else {
				buckets[0] = parseInt(minVal.toString());
			}
		}
		return buckets;
	},

	/**
	 * disable actions from this view
	 */
	disableControl : function() {
		var tabs = View.panels.get('tabsBldgManagement');
		tabs.hideTab('gisMapTab');
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
	var attributes = eval("(" + attributes + ")");
	View.getOpenerView().siteId = attributes.values['bl.site_id'];
	View.getOpenerView().blId = title
	View.getOpenerView().openDialog('ab-msds-rpt-drawing.axvw', null, false, null, null, 1200, 600);
}
