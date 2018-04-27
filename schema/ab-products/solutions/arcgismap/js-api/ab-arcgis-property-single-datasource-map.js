View.createController('showMap', {
	
	//the Ab.arcgis.ArcGISMap
	map: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
    },
  
  	afterInitialDataFetch: function() {

      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';
  	},

    pr_list_onShowProperties: function(rows) {   
    
    	var selectedRows = this.pr_list.getSelectedRows(rows);  
    	
    	var prMarkerProperty = this.map.getMarkerPropertyByDataSource('pr_ds');
    	
		if( prMarkerProperty == null ){
    		var infoWindowFields = ['property.area_manual', 'property.value_market', 'property.value_book'];
    		prMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('pr_ds', ['property.lat', 'property.lon'],'property.pr_id',infoWindowFields);
    		
    		//set symbol type for marker
    		//the avaible types are: 'circle', 'cross', 'diamond', 'square', 'x'
    		//'circle' is the default 
    		prMarkerProperty.setSymbolType('diamond');
    	}
 
		// disable marker labels
		prMarkerProperty.showLabels = false;
			
    	//get the restriction based on the selected rows
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('property.pr_id', selectedRows[i]['property.pr_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('property.pr_id', 'null', "=", "OR");
    	}
    	
    	//set restriction for prMarkerProperty
    	prMarkerProperty.setRestriction(restriction);
    	
    	//add DataSourceMarkerPropertyPair to map
    	this.map.updateDataSourceMarkerPropertyPair('pr_ds', prMarkerProperty);
    	
    	//draw map
    	this.map.refresh();
  	} 
})

