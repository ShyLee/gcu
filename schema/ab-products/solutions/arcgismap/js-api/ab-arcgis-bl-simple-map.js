View.createController('showMap', {
	
	//the Ab.arcgis.ArcGISMap
	map: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	
    	//create map
    	//
    	//parameters:
    	//panelId. The panel which holds the div.
     	//divId. The div which holds the map.
    	//configObject. The configObject for the panel.
    	//
    	this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
    	
    	//prepare blMarkerProperty
    	//Ab.arcgis.ArcGISMarkerProperty defines common properties for a group of markers 
    	//for each datasource, need to create a corresponding Ab.arcgis.ArcGISMarkerProperty
    	//
		//parameters: 
		//dataSourceNameParam. The dataSource associated with these markers
     	//geometryFieldsParam. The geometryFields which define the geometry of markers. lat, lon.
     	//infoWindowTitleFieldParam. The data field which defines infoWindow Title.
     	//infoWindowAttributeParam.  The data Fields which define attributes for infoWindow 
     	//
     	//infoWindow will be shown as tooltip for mouseOver event
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    	
    	//add datasource-Ab.arcgis.ArcGISMarkerPropert pair to map
    	//in order to draw markers for certain datasource
  		//the corresponding datasource-Ab.arcgis.ArcGISMarkerPropert pair has to be added to the map.
    	this.map.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
    	
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('bl.state_id', 'PA', "=", "OR");
    	
    	//refresh and draw the map
    	//the restriction passed through the refresh() will only be applied to the first pair added through
    	//map.updateDataSourceMarkerPropertyPair
    	this.map.refresh(restriction);
 			
    },
    
    afterInitialDataFetch: function() {
       	//apply <css url="http://serverapi.arcgisonline.com/jsapi/arcgis/2.8/js/dojo/dijit/themes/claro/claro.css" />
    	//to panel
      	var reportTargetPanel = document.getElementById("mapPanel");
		reportTargetPanel.className = 'claro';
		// make meta moveable/draggable
		var metaMoveable = dojo.dnd.Moveable(dojo.byId('meta'));
		// wire up meta close button
		dojo.connect(dojo.byId('metaCloseButton'), 'click', function() {
			dojo.destroy(dojo.byId('meta'));
		});
  	}
});



