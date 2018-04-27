/**
 * Override default map coordinates. the flash control calls this function, if
 * available, after the map object loads
 */
function afterMapLoad_JS(panelId, mapId) {
	mapControl.map.changeExtent(-17080656.88, -8161028.80, 18141525.75, 15320426.29);
	mapControl.map.setMapLevel(2);
}

//KB3037750 - use default separator to make the map work in localized version
function getDecimalSeparator_JS(){
	return '.';
}

function getGroupingSeparator_JS(){
	return ',';
}

var mapController = View.createController('mapCtrl', {

	// Flash map controll
	map : null,

	// Selected building ids
	items : new Array(),

	//Map records
	records : null,

	//Flag of is valid license of gis
	isValidLicense : false,

	//Marker property of the map control
	markerProperty : null,

	//The selected color by option
	colorField : 'option_none',

	//The selected sized by option
	sizeField : 'option_none',
	
	//The selected color by option
	colorMethod : 'option_average_value',
	
	//The selected min threshold option
	minThreshold : '0%',
	
	//The selected loction level option
	location : 'option_site',
	
	//The tree and console restriction
	treeConsoleRestriction: '1=1',
	
	// Html option and datasource field relation map
	optionFieldMap : {},
	
	// Restriction for bl datasource
	blRestriction : '1=1',
	
	//Main table of the dataSource
	mainTableName: '',

	/**
	 * initialize the map after the view load
	 */
	afterViewLoad : function() {
		// Initialize the map control after the view load
		this.initializeMap();

		//Create map panel drop down list
		this.createDropdowList();

		//Set panel instruction
		setInstructions(this.htmlMap);
		
		//Set the Maximize button click listener
		setMaximizeActionListener.defer(550);
	},

	/**
	 * Create the map panel drop down list.
	 */
	createDropdowList : function() {
		// incude border highlight option to the drawing panel
		var mapPanelTitleNode = document.getElementById('htmlMap_title').parentNode.parentNode;
		this.createOptions(mapPanelTitleNode, 'makerSize', this.markerSizeOptions);
		this.createOptions(mapPanelTitleNode, 'makerColor', this.markerColorOptions);
		this.createOptions(mapPanelTitleNode, 'makerColorMethod', ['option_average_value', 'option_highest_count', 'option_highest_value', 'option_lowest_value']);
		this.createOptions(mapPanelTitleNode, 'minThreshold', ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%']);
		this.createOptions(mapPanelTitleNode, 'location', ['option_country', 'option_region', 'option_state', 'option_city', 'option_county', 'option_site', 'option_property', 'option_building'],5);
		
		//if need locationFor, add it to the drop down list 
		if(this.locationFor){
			this.createOptions(mapPanelTitleNode, 'locationFor', ['option_programs','option_regulations']);
		}
		
		this.changeColorMethod();
		$('makerColorMethod_options').onchange = this.changeColorMethod;
		$('location_options').onchange = this.changeLocation;
	},
	
	createOptions : function(parent, id, list, defaultIndex) {
		// maker size option drop down
		var cell = Ext.DomHelper.append(parent, {
			tag : 'td',
			id : id
		});

		var tn = Ext.DomHelper.append(cell, '<p>' + getMessage(id) + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");

		cell = Ext.DomHelper.append(parent, {
			tag : 'td',
			id : id + '_options_td'
		});

		var options = Ext.DomHelper.append(cell, {
			tag : 'select',
			id : id + '_options'
		}, true);

		for ( var i = 0; i < list.length; i++) {
			options.dom.options[i] = new Option(getMessage(list[i]), list[i]);
		}
		
		if(defaultIndex){
			options.dom.selectedIndex = defaultIndex;
		}
	},
	
	/**
	 * change event handler for color method select options
	 */
	changeLocation : function(e, option) {
		var groupByFieldDef = mapController.dsBuilding.fieldDefs.get(mapController.mainTableName+'.groupField');
		var location = mapController.getOptionValue('location');
	    groupByFieldDef.title = getMessage(location);
	},
	
	/**
	 * change event handler for color method select options
	 */
	changeColorMethod : function(e, option) {
		var method = mapController.getOptionValue('makerColorMethod');
		if (method=='option_highest_value' || method =='option_lowest_value') {
			$('minThreshold_options').disabled = false;
		} else {
			$('minThreshold_options').disabled = true;
		}
	},
	
    getOptionValue : function(id){
		return $(id+"_options").value;
	},


	/**
	 * initialize map object
	 */
	initializeMap : function() {
		this.mainTableName = this.dsBuilding.mainTableName;
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
	refreshMap : function() {
		if (!this.isValidLicense) {
			return;
		}
		
		this.treeConsoleRestriction = this.getTreeConsoleRestriction();
		
		this.setParametersByOption();

		this.map.dataSourceId = 'dsBuilding';
		this.records = this.getMapData();
		this.map.clear();
		this.createMarkers();
	},
	
	/**
	 * Get tree and console restriction.
	 */
	getTreeConsoleRestriction : function() {
		return '1=1';
	},
	
	/**
	 * Set datasource parameters base on selected options group.
	 */
	setParametersByOption : function() {},
	
	/**
	 * Get map data.
	 */
	getMapData : function() {
		try{
			var result = null;
		 	var parameters = {
		 			recordLimit: 0
		 	};
		
		 	var records = this.dsBuilding.getRecords(null,parameters);
		 	this.afterGetMapData(records);
		 	return records;
		 	
	    } catch(e){
	 	   alert(toJSON(e));
		}
	},
	
	/**
	 * handle data after get map data.
	 */
	afterGetMapData : function(records) {
	},
	
	/**
	 * Get selected options group.
	 */
	getSeletedOptionsGroup : function() {
		this.sizeField = this.getOptionValue('makerSize');
		this.colorField = this.getOptionValue('makerColor');
		this.colorMethod = this.getOptionValue('makerColorMethod');
		this.minThreshold = this.getOptionValue('minThreshold');
		this.location = this.getOptionValue('location');
		if(this.locationFor){
			this.locationFor = this.getOptionValue('locationFor');
		}
	},
	
	getAverageField: function(fieldName, isRound) {
		var averageValuePattern = '';
		if(isRound){
			averageValuePattern = 'ROUND(avg([fieldName]),0) ';
		}else{
			averageValuePattern = ' avg([fieldName]) ';
		}
		
		return averageValuePattern.replaceAll('[fieldName]', fieldName);
	},
	
	getHighestCountFieldValue: function(fieldName) {
		var value = '';
		this.higestCountCalculationDS.addParameter('fieldName',fieldName);
		var record = this.higestCountCalculationDS.getRecord();
		if(record){
			value = record.getValue('regloc.calcField');
		}
		return value;
	},	

	getHighestOrLowestValueField: function(fieldName, isDesc) {
		var value = '';
		this.higestAndLowestValueCalculationDS.addParameter('fieldName',fieldName);
		if(isDesc){
			this.higestAndLowestValueCalculationDS.addParameter('desc','desc');
		}else{
			this.higestAndLowestValueCalculationDS.addParameter('desc','');
		}
		
		this.higestAndLowestValueCalculationDS.addParameter('minThreshold',this.minThreshold.replace('%',''));
		
		var record = this.higestAndLowestValueCalculationDS.getRecord();
		if(record){
			value = record.getValue('regloc.calcField');
		}
		return value;
	},	

	getMatricFieldValue: function(record,field1,field2) {
		
		var value = '';
		var matrix =    [[1,2,3,4,5,6,7,8,9],
	                     [1,2,3,4,5,6,7,8,9],
	                     [3,3,3,4,5,6,7,8,9],
	                     [4,4,4,4,5,6,7,8,9],
	                     [5,5,5,5,5,6,7,8,9],
	                     [6,6,6,6,6,6,7,8,9],
	                     [6,6,7,7,7,7,7,8,9],
	                     [6,6,7,7,8,8,8,8,9],
	                     [6,6,7,7,8,8,9,9,9]];
		
		var value1 =  this.stringToInteger(record.getValue(field1));
		var value2 =  this.stringToInteger(record.getValue(field2));

		if(valueExistsNotEmpty(value1) && valueExistsNotEmpty(value2)){

			if(field2 == 'regviolation.violationSeverity'){
				if(value1-1>-1 && value2-1>-1){
					value = matrix[value1-1][value2-1]
				}
				
			}else{
				if(value1-1>-1){
					value = matrix[value1-1][value2]
				}
			}
		}
		
		return value;
	},
	
	/**
	 * calculate field value by marker color method.
	 */
	calculationFieldValueByColorMethod : function(fieldName) {
		var value = '';
		if(this.colorMethod =='option_highest_count'){
			value = this.getHighestCountFieldValue(fieldName);
		}else if (this.colorMethod =='option_highest_value'){
			value = this.getHighestOrLowestValueField(fieldName, true);
		}else if (this.colorMethod =='option_lowest_value'){
			value = this.getHighestOrLowestValueField(fieldName, false);
		}
		
		return value;
	},
	
	/**
	 * onclick event handler for map show button
	 */
	htmlMap_onShow: function() {
		//Refresh the map from the tree
		var treeControllers = View.getOpenerView().panels.get('panel_row1col1').contentView.controllers.get('bldgTree');
		treeControllers.worldTree_onShowSelected();
	},

	/**
	 * Show markers on map
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
		this.map.updateDataSourceMarkerPropertyPair(this.map.dataSourceId, this.markerProperty);
		var restriction = this.blRestriction;
		this.map.refresh(restriction);
	},

	/**
	 * Get marker property according the color by and size by option
	 */
	getMarkerProperty : function() {
		// create marker property
		var markerProperty = new Ab.flash.ArcGISRadiusMarkerProperty('dsBuilding', [this.mainTableName+'.lat', this.mainTableName+'.lon'],
				[this.mainTableName+'.groupField'], this.inforWindowField);
		
		markerProperty.setSymbolType('circle');
		markerProperty.sizeField = this.mainTableName+'.sizeField';
		
		// Add size buckets to the property
		if(this.sizeField != 'option_none'){
			var buckets = this.getBuckets(markerProperty.sizeField);
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
		}else{
			markerProperty.sizeBuckets = [{
				limit : 1,
				symbolSize : 15
			}, {
				limit : 2,
				symbolSize : 15
			}];
		}
		
		//Bright Red-FF0000, Dark Red-C00000, Orange-FFC000, Yellow-FFFF00, Brown-996633, Purple-7030A0,
		//Light Blue-00B0F0, Blue-0000FF, Green-00FF00 
		var colors = [[0, 0, 0],
		              [255, 0, 0],
		              [192, 0, 0],
		              [255, 192, 0],
		              [255, 255, 0],
		              [153, 102, 51],
		              [112, 48, 160],
		              [0, 176, 240],
		              [0, 0, 255],
		              [0, 255, 0],
		              [0, 0, 0]
		              ];
		var colorsBuckets = [1,2,3,4,5,6,7,8,9];
		
		markerProperty.showThematicSymbol = true;
		markerProperty.thematicColors = colors;
		markerProperty.thematicField = this.mainTableName+".colorField";
		markerProperty.thematicBuckets = colorsBuckets;
		
		return markerProperty;
	},

	/**
	 * Get buckets by field
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
					buckets[i] = parseFloat(val.toFixed(5).toString());
				}
			} else {
				buckets[0] = parseFloat(minVal.toString());
			}
		}
		return buckets;
	},

	/**
	 * Disable actions from this view
	 */
	disableControl : function() {
		var tabs = View.panels.get('tabsBldgManagement');
		tabs.hideTab('gisMapTab');		
	},

	/**
	 * Hide legend when tab is changed
	 */
	hideLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(false);
		}
	},
	
	/**
	 * Show legend when tab is selected
	 */
	showLegend : function() {
		var legendDiv = Ext.get('legend_div');
		if (legendDiv != null) {
			legendDiv.setDisplayed(true);
		}
	},
	
	/**
	 * convert string to integer
	 */
	stringToInteger : function(value) {
		
		if(valueExistsNotEmpty(value)){
			value =  new Number(value).toFixed();
		}
		
		return value;
		
	}
});

/**
 * Set map panel instructions
 */
function setInstructions(panel) {
	//Bright Red-FF0000, Dark Red-C00000, Orange-FFC000, Yellow-FFFF00, Brown-996633, Purple-7030A0,
	//Light Blue-00B0F0, Blue-0000FF, Green-00FF00 
	var instructions = "<span>" + getMessage('colorLegend') + ":</span>";
	instructions += "<span style='color:#FF0000'>" + getMessage('color1') + ", </span>";
	instructions += "<span style='color:#C00000'>" + getMessage('color2') + ", </span>";
	instructions += "<span style='color:#FFC000'>" + getMessage('color3') + ", </span>";
	instructions += "<span style='color:#FFFF00'>" + getMessage('color4') + ", </span>";
	instructions += "<span style='color:#996633'>" + getMessage('color5') + ", </span>";
	instructions += "<span style='color:#7030A0'>" + getMessage('color6') + ", </span>";
	instructions += "<span style='color:#00B0F0'>" + getMessage('color7') + ", </span>";
	instructions += "<span style='color:#0000FF'>" + getMessage('color8') + ", </span>";
	instructions += "<span style='color:#00FF00'>" + getMessage('color9') + "</span>";
	panel.setInstructions(instructions);
}

/**
 * Extend String object to support replaceAll function
 */
String.prototype.replaceAll = function(search, replacement){
	var i = this.indexOf(search);
	var object = this;
	
	while (i > -1){
		object = object.replace(search, replacement); 
		i = object.indexOf(search);
	}
	return object;
}

/**
 * Overwrite String object to support replaceAll function
 */
Ab.flash.Map.prototype.getData =  function() {
	var records = [];
    for (var i = 0; i < mapController.records.length; i++) {
    	//excluding the null group by values
    	if(valueExistsNotEmpty(mapController.records[i].getValue('regloc.groupField')) 
    			|| valueExistsNotEmpty(mapController.records[i].getValue('regviolation.groupField'))){
    		records.push(mapController.records[i].values);
    	}
    }
	return records;
}

/**
 * Set maximized action listener
 */
function setMaximizeActionListener(){
	//Get element of the action
	var maximizeActionEl = View.panels.get('htmlMap').actions.get('htmlMap_showAsDialog').button.el;
	
	//add attribute isMaximized to show the map panel status
	maximizeActionEl.isMaximized = false;
	
	//Remove all default listeners
	maximizeActionEl.removeAllListeners();
	
	//Register the click event to maximized the map panel
	maximizeActionEl.on('click', maximizeMapPanel, maximizeActionEl);;
}

/**
 * Maximized the map panel
 */
function maximizeMapPanel(){
	//Get element of the action
	var maximizeAction = View.panels.get('htmlMap').actions.get('htmlMap_showAsDialog');
	var maximizeActionEl = View.panels.get('htmlMap').actions.get('htmlMap_showAsDialog').button.el;
	
	// remove previous tooltip
	var tooltipId =  maximizeActionEl.child('button:first').id;
	Ext.QuickTips.unregister(tooltipId);
	
	//Get the main layout and center layout
	var openerView = View.getOpenerView();
	var mainLayout = openerView.getLayoutManager('main');
	var centerLayout = openerView.getLayoutManager('nextCenter');
	
	//get the value of isMaximized in map panel
	var isMaximized = maximizeActionEl.isMaximized;
	
	if(isMaximized){
		
		//If map panel is maximized then expand the tree layout, otherwise,  collapse the tree layout
		mainLayout.expandRegion('west');
		centerLayout.expandRegion('north');
		
		//reset the tool tips
		Ext.QuickTips.register({
            target: tooltipId,
            text: getMessage('maximizedText')
        });
		
		
		//reset the value of isMaximized
		maximizeActionEl.isMaximized = false;
		
	}else{
		
		//If map panel is maximized then expand the console layout, otherwise,  collapse the console layout
		mainLayout.collapseRegion('west');
		centerLayout.collapseRegion('north');
		
		//reset the tool tips
		Ext.QuickTips.register({
            target: tooltipId,
            text: getMessage('restoreText')
        });
		
		//reset the value of isMaximized
		maximizeActionEl.isMaximized = true;
	}
}