View.createController('showMap', {
	map: null,
	isValidLicense: false,
	afterViewLoad: function () {
		var configObject = new Ab.view.ConfigObject();
		var browser = navigator.appName;
		var b_version = navigator.appVersion;
		var version = parseFloat(b_version);
		if ((browser.indexOf('Microsoft') > -1) && (b_version.indexOf('MSIE 8.0') > -1)){
			View.showMessage(getMessage('msg_ie_eight'));
			return;
		}		
		this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
		this.setLabel();
    	var menuObj = Ext.get('layersMenu'); 
	    menuObj.on('click', this.showLayerMenu, this, null);   		
	},
	setLabel: function () {
		var milesLabel = getMessage('miles');
		var kmLabel = getMessage('km');
		var setRadius = getMessage('set_radius');
		$('miles_label').innerHTML = milesLabel;
		$('km_label').innerHTML = kmLabel;
		$('set_radius').innerHTML = setRadius;
	},
	afterInitialDataFetch: function () {
		var reportTargetPanel = document.getElementById("mapPanel");
		reportTargetPanel.className = 'claro';
		initializeMap();
	},
	showLayerMenu: function(e, item){
		if( this.layerMenu == null ) {
			var menuItems = [];
			this.map.buildAvailableLayerList();
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
		//switch the map layer based on the passed in layer name.
		View.controllers.get('showMap').map.switchMapLayer(item.text);
	},	
	bl_list_onGeoCode: function(context, confirm){
		var controller = this;
		var geoCodeIt =  function(context, controller){
			var geoCodeTool = new Ab.arcgis.Geocoder(controller.map);
			var restriction = new Ab.view.Restriction();
			restriction.addClause('bl.bl_id', context.record['bl.bl_id'], '=');
			geoCodeTool.callbackMethod = function() {
				var ctrlr = this.View.controllers.items[0];
				ctrlr.bl_list.refresh();
				ctrlr.bl_form.refresh();
				var context = new Array();
				context.record = ctrlr.bl_form.record.values;
				ctrlr.mapIt(context);				
			};			
			geoCodeTool.geoCode('bl_ds', restriction, 'bl', 'bl.bl_id', ['bl.lat', 'bl.lon'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], true);
		};	
		if(confirm == true){
			var confirmMessage = getMessage("messageConfirmGeoCode");
			View.confirm(confirmMessage, function(button){
				if (button == 'yes') {				
					geoCodeIt(context, controller);
				}
			});
		} else{
			geoCodeIt(context, controller);
		}
	},
	bl_list_onMapit: function (context) {
		if (this.map.mapInited) {
			var lat = context.record["bl.lat"];
			var lon = context.record["bl.lon"];		
			if(lat == '' || lon == ''){			
				this.bl_list_onGeoCode(context, true);
			} else			{
				this.mapIt(context);
			}
		} else {
			View.showMessage(getMessage('invalidLic'));
		}
	},
	bl_form_onAbVnAcEdit_save: function () {
		var blRecord = this.bl_form.record;
		var weatherSourceId = blRecord.values['bl.weather_source_id'];
		var weatherStationId = blRecord.values['bl.weather_station_id'];		
		this.changeHighlightedStationGraphic(weatherSourceId, weatherStationId);
	},
	changeHighlightedStationGraphic: function(highlightWeatherSourceId, highlightWeatherStationId) {
		var stationGraphics = this.map.map.graphics.graphics;
		var thisGraphic = new esri.Graphic();
		var normalStationOutline = new dojo.Color(([0, 0, 0]), 1); 
		var highlightedStationOutline = new dojo.Color(([255, 0, 0]), 1); 
		
		for (var j = 0; stationGraphics.length > j; j++) {
			thisGraphic = stationGraphics[j];
			if (thisGraphic.attributes != undefined) {
				if (thisGraphic.attributes.weather_station_id != undefined) {
					//if the graphic's weather source and station IDs match the building's weather source and station ID, highlight the graphic 
					if (thisGraphic.attributes.weather_station_id.n == highlightWeatherStationId && thisGraphic.attributes.weather_source_id.n == highlightWeatherSourceId) {					
						thisGraphic.symbol.outline.setColor(highlightedStationOutline);
						thisGraphic.symbol.outline.setWidth(1.5);
						thisGraphic.setSymbol(thisGraphic.symbol);
					}
					//else if another graphic has the highlighted station outline width, set symbol to normal color and size outline  
					else if (thisGraphic.symbol.outline.width == 1.5) {					
						thisGraphic.symbol.outline.setColor(normalStationOutline);
						thisGraphic.symbol.outline.setWidth(1);
						thisGraphic.setSymbol(thisGraphic.symbol);
					}
				}
			}
		}		
		this.map.map.graphics.refresh();		
	},
	mapIt: function(context){
		try {
			this.map.map.graphics.clear();
			var lat = context.record["bl.lat"];
			var lon = context.record["bl.lon"];
			var bl_id = context.record["bl.bl_id"];
			var bl_weather_station_id = context.record["bl.weather_station_id"]
			var bl_weather_source_id = context.record["bl.weather_source_id"]
			
			if(lat.split(',').length>1){
				lat=lat.replace(/\,/g, ".");
			}
			if(lon.split(',').length>1){
				lon=lon.replace(/\,/g, ".");
			}
			var params = {
				title: bl_id,
				lat: lat,
				lon: lon,
				type: 'bl',
				body: '',
				weather_source_id: '',
				weather_station_id: ''
			};
			this.plotStations(params);
			var distance = $('distance').value;
			//is it a number?
			(isNaN(parseInt(distance))) ? distance = "15" : distance = distance;
			//is it in km?
			var isKm = $('km').checked;
			(isKm) ? distance *= 0.625 : distance = distance;
			
			if(lat == '' || lon == ''){
				return;
			}
			
			var result = Workflow.callMethod('AbRiskEnergyManagement-RetrieveWeatherStations-getWeatherStationsNearBy', lat, lon, distance);
			if (result.code == 'executed') {
				var records = result.data.records;
				for (var i = 0; records.length > i; i++) {
					var record = records[i];
					var weather_station_id = record['weather_station.weather_station_id'];
					var weather_source_id = record['weather_station.weather_source_id'];
					var lat = record['weather_station.lat'];
					var lon = record['weather_station.lon'];
					var elev = record['weather_station.elevation'];
					var content = '<div style="float: left;">' + '<b>Weather Station: </b>' + weather_station_id.l + '<br/>' + '<b>Weather Source: </b>' + weather_source_id.l + '<br/>' + '<b>Elevation: </b>' + elev.l + '<br/>' + '<b>Latitude: </b>' + lat.l + '<br/>' + '<b>Longitude: </b>' + lon.l + '<br/><br/>' + '<button type="button" onClick="assignWS(&quot;' + weather_station_id.l + '&quot;, &quot;' + weather_source_id.l + '&quot;)" > Select this station </div>' + '<br/>';
					if (weather_station_id.n == bl_weather_station_id && weather_source_id.n == bl_weather_source_id) {
						var paramType = 'assignedStation';
					}
					else {
						var paramType = 'station';
					};
					var params = {
						title: weather_station_id.n,
						lat: lat.n,
						lon: lon.n,
						type: paramType,
						body: content,
						weather_source_id: weather_source_id,
						weather_station_id: weather_station_id
					};					
					this.plotStations(params);
				}
			}
			this.setExtent();
		} catch (e) {
			Workflow.handleError(e);
		}	
	},
	setExtent: function () {
		var points = new esri.geometry.Multipoint(this.map.map.spatialReference);
		var graphics = this.map.map.graphics.graphics;
		for (var j = 0; graphics.length > j; j++) {
			var graphic = graphics[j];
			var x = graphic.geometry.x;
			var y = graphic.geometry.y;
			
			var point = new esri.geometry.Point(x, y, new esri.SpatialReference({
				wkid: 4326
			}));
			points.addPoint(point);
		}
		/*
		 * 04/20/2011 KB 3031120 When is only one point 
		 * extent don't function corectly
		 */
		if(points.points.length > 1){
			this.map.map.setExtent(points.getExtent().expand(3));
		}else if(points.points.length == 1){
			var point = points.getPoint(0);
			this.map.map.centerAndZoom(point, this.map.map.getNumLevels()-2);			
		}
		
	},
	plotStations: function (params) {
		var lat = params.lat;
		var lon = params.lon;
		var title = params.title;
		var body = params.body;
		var title = params.title;		
		var weather_source_id = params.weather_source_id;
		var weather_station_id = params.weather_station_id;
		var attrsJSON = {
			"title": "Weather Station",
			"desc": body,
			"bl_id": "bl_id"
		};
		var attrs = {
			title: attrsJSON.title,
			desc: attrsJSON.desc,
			bl_id: attrsJSON.bl_id,
			weather_source_id: weather_source_id,
			weather_station_id: weather_station_id
		};
		var infoTemplate = new esri.InfoTemplate("${title}", "${desc}", "${bl_id}");
		var bldgPt = new esri.geometry.Point(lon, lat, new esri.SpatialReference({
			wkid: 4326
		}));
  	 	// convert geometry from lat/lon to Web Mercator coordinate system          	  
		bldgPt = esri.geometry.geographicToWebMercator(bldgPt);

		if (params.type == 'bl') {
			var title = new esri.symbol.TextSymbol(title).setColor(
			new dojo.Color([255, 255, 0, 0.9])).setAlign(esri.symbol.Font.ALIGN_MIDDLE).setAngle(0).setFont(
			new esri.symbol.Font("9pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
			title.setOffset(-10, 10);
			var marker = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 17, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 1), new dojo.Color([255, 0, 0, 0.9]));
			var bldgGraphic = new esri.Graphic(bldgPt, marker);
			var titleGraphic = new esri.Graphic(bldgPt, title);
		} else if (params.type == 'assignedStation') {
			var marker = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 16, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1.5), new dojo.Color([255, 255, 0, 0.9]));
			var bldgGraphic = new esri.Graphic(bldgPt, marker, attrs, infoTemplate);
		}
		else {
			var marker = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 16, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 1), new dojo.Color([255, 255, 0, 0.9]));
			var bldgGraphic = new esri.Graphic(bldgPt, marker, attrs, infoTemplate);
		}
		this.map.map.graphics.add(bldgGraphic);
		if (!(titleGraphic === undefined)) {
			this.map.map.graphics.add(titleGraphic);
		}
	},
	assignWS: function (wsi, wsoi) {
		var wsi_fld = document.getElementById('bl_form_bl.weather_station_id');
		var wsoi_fld = document.getElementById('bl_form_bl.weather_source_id');
		wsi_fld.value = wsi;
		wsoi_fld.value = wsoi; /*this.bl_form.save();*/
	}
})

function assignWS(wsi, wsoi) {
	this.View.controllers.items[0].assignWS(wsi, wsoi);
	this.mapControl.map.infoWindow.hide();
}

function initializeMap(){
	var mapController = this.View.controllers.items[0];
	mapController.isValidLicense = hasValidArcGisMapLicense();
	/*if (!mapController.isValidLicense) {
		disableControl();
		View.showMessage(getMessage('invalidLic'));
		return;
	}
	else if (mapController.isValidLicense) {
		var configObject = new Ab.view.ConfigObject();
		mapController.map = new Ab.arcgis.ArcGISMap('htmlMap', 'objMap', configObject);
		if (!mapController.map.mapInited) {
			setTimeout('configMap()', 500);
			return;
		}
		else {
			configMap();
		}
	}*/
}