/**
 * This example uses Google Map JavaScript API.
 * Please note that the Google Apps API is limited to development-use only and is free only for public-facing sites.  
 * Please refer to the Google Maps documentation for more information.
 *  
 **/
 
Ab.namespace('gmap');

//this is the map control itself.
var mapControl = null;

Ab.gmap.Map = Ab.view.Component.extend({
	
	//the Google Map
	map: null,
	
	// the panel that holds the div to the map
	panelId: '',
	
	//the div which holds the map
	divId: '',
	
	//the div which holds the map
	dataSourceId: '',
	
	//the graphic mouse click call back function passed in 
	mouseClickHandler: null,
	mouseClickEnabled: false,
	
	//the font of the text symbol
	textSymbolFont: 'BOLDER',
	
	//the color of the text symbol
	textSymbolColor: [255,215,0,1],
	
	constructor: function(panelId, divId, dataSourceId) {
		mapControl = this;		
		this.divId = divId;	
		this.panelId = panelId;
		this.dataSourceId = dataSourceId;
		this.map = new GMap2(document.getElementById(this.divId));  
		this.map.setCenter(new GLatLng(0,-50), 2);   
		
		// hide shadow on tooltip
		this.map.getPane(G_MAP_FLOAT_SHADOW_PANE).style.display = "none";     		      	
	},

  /*
  *  Show address
  *  @param string containing address
  */ 	
	showAddress: function(address) {
		var geocoder = new GClientGeocoder(); 
		var map = this.map;
		map.clearOverlays();
		geocoder.getLatLng(     
			address,     
			function(point) {       
				if (!point) {         
					alert(address + " not found");       
				} else {         
					map.setCenter(point, 15);         
					var marker = new GMarker(point);         
					map.addOverlay(marker); 
					var infoText = document.createTextNode(address);
					var infoDiv = document.createElement("div");
					infoDiv.appendChild(infoText);
					infoDiv.style.fontSize = '12px';       
					marker.openInfoWindow(infoDiv);       
				}
			}
		)
	},

  /*
  *  Show markers
  *  @param records json array of records
  *  @param pkeyIDs array of pkeyIDs
  *  @param infoFlds array of infofield ids
  *  @param titles array of field titles
  *  @param latitudeID	field name of latitutde
  *  @param longitudeID field name of longitude
  */ 
	showMarkers: function(records, pkeyIDs, infoFlds, titles, latitudeID, longitudeID) {	
		if (GBrowserIsCompatible()) {		
			// switch to 2D
			this.switchMapLayer(G_NORMAL_MAP);
			
			this.map.clearOverlays();			    	
			var points = [];
			this.map.setCenter(new GLatLng(0,0),0);
			var bounds = new GLatLngBounds(); 
			
			// use event closures to control each marker's infowindow
			function createMarker(point, pkeyIDs, record) {
				var pkeys = getRecordValuesFromIDs(pkeyIDs, record, '-', [], false);
				var details = getRecordValuesFromIDs(infoFlds, record, '<br/>', titles, true);	
				var gMarkerOptions = new Object();
				gMarkerOptions.title = pkeys;
				var marker = new GMarker(point, gMarkerOptions);
				
				GEvent.addListener(marker,"mouseover", function() {
					var iWindowDiv = document.createElement("div");
					var pkeyText = document.createTextNode(pkeys);
					var pkeyDiv = document.createElement("div");
					pkeyDiv.style.fontWeight = 'bold';
					pkeyDiv.innerHTML = '<br/>';					
					pkeyDiv.appendChild(pkeyText);
					pkeyDiv.innerHTML += '<hr/>';
					pkeyDiv.style.fontSize = '12px';
					//pkeyDiv.style.background = '#E6E6E6';
					pkeyDiv.style.width = '300px';
																			
					var infoDiv = document.createElement("div");
					infoDiv.style.width = '300px';
					infoDiv.innerHTML =  details;
					infoDiv.style.fontSize = '10px'; 
					
					iWindowDiv.appendChild(pkeyDiv);					
					iWindowDiv.appendChild(infoDiv);
					marker.openInfoWindowHtml(iWindowDiv);
				});
				
				GEvent.addListener(marker, "click", mapControl.graphicsMouseClickHandler);	
				/*
				GEvent.addListener(marker, "mouseout", function() { 
					marker.closeInfoWindow();
				});
				*/
				/*
				GEvent.addListener(marker, "click", function() { 					
					onClickMarker(record[pkeyIDs[0]], record);
				});
				*/								
				return marker;
			}
							
			for(var i=0; i<records.length; i++){
				var record = records[i].values;
				var point = new GLatLng(record[latitudeID], record[longitudeID]);
				points.push(point);
				bounds.extend(point);				
				this.map.addOverlay(createMarker(point, pkeyIDs, record));			     
    	}
    	
    	// re-calculate centerpoint and zoom level for map according to markers
    	var polygon = new GPolygon(points);
    	this.map.setZoom(this.map.getBoundsZoomLevel(bounds) -1);
    	this.map.setCenter(polygon.getBounds().getCenter());
    }
  },

  /*
  *  Pass the custom marker click function out to this call back function	
  */  
  graphicsMouseClickHandler: function(evt) {  	
  	if( mapControl.mouseClickEnabled ) {
  		var marker = this;
  		var attributes = this.getPoint();
  		var title = this.getTitle();
  		mapControl.mouseClickHandler(title, attributes);
  	}
	},

  /*
  *  Switch map layer
  *  @param  valid options are:
  *  			G_NORMAL_MAP displays the default road map view.
  *				G_SATELLITE_MAP displays Google Earth satellite images. *
  *				G_HYBRID_MAP displays a mixture of normal and satellite views.*
  *				G_DEFAULT_MAP_TYPES contains an array of the above three types, useful for iterative processing.
  *				G_PHYSICAL_MAP displays a physical map based on terrain information. 
  */	   
  switchMapLayer: function(layer) {
  	this.map.setMapType(layer);
  }, 	

  /*
  *  Enable information window	
  */
  showInfoWindow: function() {
  	this.map.enableInfoWindow();	
  },
  
  /*
  *  Enable information window	
  */
  showDefaultUI: function() {
  	this.map.setUIToDefault();
  },
             
  /*
  *  define the graphic mouse click event call back function
  *  @param {handler} Required.  The call back function name. 	
  */
  addMouseClickEventHandler: function(handler) {
  	this.mouseClickHandler = handler;
  	this.mouseClickEnabled = true;
  },
  
  afterLayout: function() {
	  if (Ext.isIE) {
	      this.syncHeight.defer(500, this);
	  } else {
		  this.syncHeight();
	  }
  },
	 
  syncHeight: function() {
	  var panelEl = Ext.get(this.panelId);
	  var layoutEl = Ext.get(panelEl).parent().parent().parent();
	        var panelHeight = layoutEl.getHeight();
	        
	        var mapEl = Ext.get(this.divId);
	        if (Ext.isIE) {
	            mapEl.setHeight(panelHeight - 46);
	        } else {
	         mapEl.setHeight(panelHeight - 28);
	        }
  }  
});

function getRecordValuesFromIDs(ids, record, delimiter, titles, bShowHeading){
	var str = "";
	for(var i=0; i<ids.length; i++){
		if(bShowHeading == true){
			str += '<i>' + titles[i] + ':&nbsp;&nbsp;&nbsp;&nbsp;</i>';
		}
		str += record[ids[i]] + delimiter;
	} 
	str = str.substring(0, str.length-1); 
	return str;
}

