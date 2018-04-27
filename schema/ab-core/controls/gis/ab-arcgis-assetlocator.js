/*
*   This class defines the Locate Asset tool
*   It is used to define asset locations by clicking on the map 
*/
Ab.arcgis.AssetLocator = Base.extend({
	
	// the Ab.arcgis.ArcGISMap associated with thie tool
	mapControl: null,             
	
	// the data record from datasource
	dataRecord: null,
	
	// has control been initialized
	controlInitialized: false,
	
	// map click handler handle
	dojoMapClickHandle: null,
	
	//the information needed for location --- records, geometry, etc. 
	dataSourceName: null,
	restriction: null,
	pkField: null,
	geometryFields: null,
	infoFields: null,
	
	// graphics layer and symbol
	locateGraphicsLayer: null,
	locateSimpleMarkerSymbol: null,
	
	// infoWindow title and content
	infoTemplate: null,
	infoWindowTitle: null,
	infoWindowContent: null,
	
	// asset location
	assetMapPoint: null,
	
	/*
	*  The constructor.
	*  @param mapParam. The Ab.arcgis.ArcGISMap associated with thie tool
	*/
	constructor: function(mapParam) {
		this.mapControl = mapParam;
	},
	
	/**
	*  This function gets the record for the asset that will be located, processes it, and initiates the locate operation.
	*        @param dataSourceName. The dataSource to get records.
	*        @param restriction. The restriction needed when get dataRecords from dataSource.
	*        @param pkField.  The primary key field for tableName.
	*        @param geometryFields.  The geometryFields for tableName.
	*  @param infoFields.  The fields to display in the infoWindow.
	*/      
	initLocate: function() {
		// create symbol
		locateSimpleLineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0,1]), 1);
		locateSimpleMarkerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 15, 
			locateSimpleLineSymbol, new dojo.Color([255,215,0,0.75]));
		infoTemplate = new esri.InfoTemplate();

		// add event listeners to graphics layer
		dojo.connect(mapControl.map.graphics, "onMouseOver", mapControl.graphicsMouseOverHandler);
		dojo.connect(mapControl.map.graphics, "onMouseOut", mapControl.graphicsMouseOutHandler);
		controlInitialized = true;	
	},
	
	startLocate: function(dataSourceName, restriction, pkField, geometryFields, infoFields) {             
		// initialized?
		if (!(this.controlInitialized)) {
			this.initLocate();
		}
		
		// hide info window
		mapControl.map.infoWindow.hide();
		
		// get params
		this.dataSourceName = dataSourceName;
		this.restriction = restriction;
		this.pkField = pkField;
		this.geometryFields = geometryFields;
		this.infoFields = infoFields;
		
		// get the data record from the datasource
		this.dataRecord = this.mapControl.getDataSourceRecords(this.dataSourceName, this.restriction);
		
		// get geometry (lon,lat) from record
		// what values could this come back with? NULL? 
		var lon = this.dataRecord[0].getValue(this.geometryFields[0]);
		var lat = this.dataRecord[0].getValue(this.geometryFields[1]);
		
		// create info window title + content
		infoWindowTitle = this.dataRecord[0].getValue(this.pkField);
		infoWindowContent = '';
		for (var j = 0; j < infoFields.length; j++) {
			var fieldId = infoFields[j];
			var fieldTitle = mapControl.getFieldTitle(dataSourceName, fieldId);
			
			//var localizedValue = dataSourceName.formatValue(fieldId, value, true);
			var nonlocalizedValue = this.dataRecord[0].getValue(fieldId);
			
			infoWindowContent += "<b>" + fieldTitle + ":</b> " + nonlocalizedValue;
			if( j != infoFields.length - 1 ) {
				infoWindowContent += "<br />";
			}
		}
	
		infoTemplate.setTitle(infoWindowTitle);
		infoTemplate.setContent(infoWindowContent);
		
		// if geometry exists
		if (!!lon && !!lat) {
			assetMapPoint = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));                                                
		}
		// if no geometry exists - use current map location
		else {
			var yCoord = (mapControl.map.extent.ymax + mapControl.map.extent.ymin ) / 2;
			var xCoord = (mapControl.map.extent.xmax + mapControl.map.extent.xmin ) / 2;
			assetMapPoint = new esri.geometry.Point( xCoord, yCoord, mapControl.map.spatialReference );
		}

		var graphic = new esri.Graphic( assetMapPoint, locateSimpleMarkerSymbol );
		graphic.geometry = assetMapPoint;
		graphic.symbol = locateSimpleMarkerSymbol;
		graphic.id = "locateGraphic";
		graphic.infoTemplate = infoTemplate;                                   
			
		// remove locate assset graphic
		this.clearLocateGraphics();
		mapControl.map.graphics.add(graphic);
			
		// show info window
		mapControl.map.infoWindow.setTitle( infoWindowTitle );
		mapControl.map.infoWindow.setContent( infoWindowContent ) ;
		mapControl.map.infoWindow.show( assetMapPoint );
		
		// add mouse move handler and tooltip (TODO)
		dojoMapClickHandle = dojo.connect(mapControl.map, "onClick", this.map_onClickHandler);
	},
	
	finishLocate: function() {
		// remove map click handler
		dojo.disconnect( dojoMapClickHandle );
		
		// remove locate assset graphic
		this.clearLocateGraphics();
		
		// prepare asset coordinates
		var assetMapPointLL = esri.geometry.webMercatorToGeographic( assetMapPoint );
		var lon = assetMapPointLL.x.toFixed(6);
		var lat = assetMapPointLL.y.toFixed(6);
		var assetCoords = [lon, lat];
		
		// save current map extent
		mapController.assetMapExtent = mapController.mapControl.map.extent;                          
		
		// show info window
		mapControl.map.infoWindow.setTitle( infoWindowTitle );
		mapControl.map.infoWindow.setContent( infoWindowContent ) ;
		mapControl.map.infoWindow.show( assetMapPoint );
		
		// return asset coordinates
		return assetCoords;
	},
	
	cancelLocate: function() {
		// remove map click handler
		dojo.disconnect( dojoMapClickHandle );
		
		// remove locate assset graphic
		this.clearLocateGraphics();
		
		// hide info window
		mapControl.map.infoWindow.hide();    
	},
	
	map_onClickHandler: function(evt) {
		// get mapPoint
		assetMapPoint = evt.mapPoint;
		
		// create graphic
		var graphic = new esri.Graphic( assetMapPoint, locateSimpleMarkerSymbol );
		graphic.geometry = assetMapPoint;
		graphic.symbol = locateSimpleMarkerSymbol;
		graphic.id = "locateGraphic";
		graphic.infoTemplate = infoTemplate;                                   
		
		// remove existing / add new assset graphic
		mapController.locateAssetTool.clearLocateGraphics();
		mapControl.map.graphics.add(graphic);
	},
	
	clearLocateGraphics: function() {
		dojo.forEach(mapControl.map.graphics.graphics, function(g) {
			if( g && g.id === "locateGraphic" ) {
				mapControl.map.graphics.remove(g);
			}
		}, mapControl);
	}	
});
