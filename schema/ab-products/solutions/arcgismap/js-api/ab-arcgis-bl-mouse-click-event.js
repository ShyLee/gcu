View.createController('showMap', {
	
	//the Ab.arcgis.ArcGISMap
	map: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	
    	//create map
    	this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
    	
    	//this setMapExtent statement is optional. Be default, map will show USA.  User calls this function if need to show different extent when the map is loaded.
    	//
    	//parameters: 
    	//xmin 	Bottom-left X-coordinate of an extent envelope.
       	//ymin 	Bottom-left Y-coordinate of an extent envelope.
      	//xmax 	Top-right X-coordinate of an extent envelope.
    	//ymax 	Top-right Y-coordinate of an extent envelope.
    	//
    	var extent = new esri.geometry.Extent({"xmin":-87.13584773952124,"ymin":32.13584773952124,"xmax":-67.13584773952124,"ymax":45.13584773952124,"spatialReference":{"wkid":102100}});
    	this.map.setMapExtent(esri.geometry.geographicToWebMercator(extent));
      	 	
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    	this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
    	
    	//add the call back function to the graphic mouse click event 
    	this.map.addMouseClickEventHandler(this.showBuildingDetails);
    },
    
    mapPanel_onClearMap: function() {
    
    	//clear all markers and all saved datasource-Ab.arcgis.ArcGISMarkerPropert pairs
  		this.map.clear();
  	},
  	
  	/*
     *  The graphic mouse click event handler.  The parameters are the information from the tooltip.
     *	They are set up when create the Ab.arcgis.ArcGISMarkerProperty
     *  @param {title} The value of the tooltip's title.  e.g. the vaue of the 'bl.bl_id'
     *  @param {attributes} The key-value pairs of the tooltip's attributes
     *    			['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']
     */
  	showBuildingDetails: function(title,attributes) {
  	
  		var bl_id = title;
  		
  		//openDialog: function(url, restriction, newRecord, x, y, width, height) {
		var restriction = {
        	'bl.bl_id': bl_id
    	};
    
    	var allowCreateRecord = false;
    	var defaultDialogX = 20;
    	var defaultDialogY = 40;
    	var defaultDialogWidth = 800;
    	var defaultDialogHeight = 600; 
  		AFM.view.View.openDialog('ab-arcgis-bl-details-dialog.axvw', restriction, false, 20, 40, 800, 600);   	
  	},
  	
  	mapPanel_onShowMap: function() {
  	
  		var blMarkerProperty = this.map.getMarkerPropertyByDataSource('bl_ds');
  		
  		if( blMarkerProperty == null ){
  			blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    		this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
    	}
  	
  		var restriction = new Ab.view.Restriction();
    	restriction.addClause('bl.state_id', 'PA', "=", "OR");
  	
  		//refresh map
  		this.map.refresh(restriction);
  	},
    
    afterInitialDataFetch: function() {
    
    	//apply <css url="http://serverapi.arcgisonline.com/jsapi/arcgis/1.4/js/dojo/dijit/themes/tundra/tundra.css" />
    	//to panel
      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';
  	}
});



