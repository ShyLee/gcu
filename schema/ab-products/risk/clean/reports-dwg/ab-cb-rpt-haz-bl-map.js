var abCbRptHazBlMapController = View.createController('abCbRptHazBlMapCtrl',{
	blId: null,
	filterController: null,
	map: null,
	bldgsRestriction: null,
	
    afterViewLoad: function(){
    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "proj";
		
		// hide DOC button on the console
		if (this.abCbRptCommonFilter_console.getEl('abCbRptCommonFilter_paginatedReport')) {
			this.abCbRptCommonFilter_console.showElement('abCbRptCommonFilter_paginatedReport', false);
		}
		
		this.createMap();
		
    },
    
    createMap:function(){
    	//create map object it there is a valid ESRI license
    	if(hasValidArcGisMapLicense()){
			this.map = new Ab.flash.ThematicColorSizeMap(
				'abCbRptHlHaz_htmlMap', //html panel
				'abCbRptHlHaz_objMap', //div id
				'abCbRptHazBlMap_dsBldgs', //Data Source
				true				
			);
			// add the mouse click event handler 
			this.map.addMouseClickEventHandler(this.showBuildingDetails);
		}	
		
    },
    
	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
        this.abCbRptHazBlMap_gridBldgs.addParameter('consoleRestriction', restriction);
        this.abCbRptHazBlMap_gridBldgs.refresh();
        
        this.abCbRptHlHaz_htmlMap.show(false);
        this.abCbRptHazBlMap_gridRep.show(false);
	},
	
	abCbRptHazBlMap_gridBldgs_onShowBuildings: function(){
		this.bldgsRestriction = new Ab.view.Restriction();
		var blIds = this.abCbRptHazBlMap_gridBldgs.getFieldValuesForSelectedRows('bl.bl_id');
		if (blIds.length == 0) {
			View.showMessage(getMessage("selectOneBldg"));
			return;
		}

		this.bldgsRestriction.addClause('activity_log.bl_id', blIds, "IN", "AND");

		// refresh map
		if (this.map) {
			this.abCbRptHlHaz_htmlMap.show(true);
			this.map.refresh.defer(500, this.map, [this.bldgsRestriction]);
		} else {
			this.abCbRptHlHaz_htmlMap.show(false);
		}
		
		// refresh assessments grid
		this.abCbRptHazBlMap_gridRep.show(true);
		this.abCbRptHazBlMap_gridRep.addParameter("consoleRestriction", this.filterController.restriction ? this.filterController.restriction : "1=1");
		this.abCbRptHazBlMap_gridRep.refresh(this.bldgsRestriction);
	},
	
	showBuildingDetails: function(title, attributes) {
		View.controllers.get('abCbRptHazBlMapCtrl').blId = title;
	    View.openDialog('ab-cb-rpt-haz-bl-map-drilldown.axvw');
	}
	
});

function onPaginatedDocReport(commandObject, pagRepName){
	//printable restriction from filter parameters
	var printableRestriction = View.controllers.get('abCbRptHazBlMapCtrl').filterController.printableRestriction;
	
	printableRestriction = addBuildingsRestriction(printableRestriction);
	
	var parameters = [];
	
	var restriction = "1=1";
	
	if(View.controllers.get('abCbRptHazBlMapCtrl').filterController.restriction){
		restriction  =  "" + View.controllers.get('abCbRptHazBlMapCtrl').filterController.restriction;
	}
	
	var buildingsPanel = View.panels.get('abCbRptHazBlMap_gridBldgs');
    
    if(buildingsPanel){
        var selectedBlIds = getKeysForSelectedRows(buildingsPanel, 'bl.bl_id');
        
		if(selectedBlIds.length > 0){
			restriction += " AND activity_log.bl_id IN ('" + selectedBlIds.join("','") +"')";
		}
    }
	
	var parameters = {
		'consoleRestriction':restriction,
		'printRestriction': true, 
        'printableRestriction': printableRestriction
    };
	
	View.openPaginatedReportDialog(pagRepName, null, parameters);
}

function addBuildingsRestriction(printableRestriction){
    var buildingsPanel = View.panels.get('abCbRptHazBlMap_gridBldgs');
        
    if(buildingsPanel){
            var selectedBlIds = getKeysForSelectedRows(buildingsPanel, 'bl.bl_id');
            if(selectedBlIds.length == 0)
                return;
            
            //put selected buildings in printable restriction and replace all ones if necesary
            var blValue = getMapValue(printableRestriction, getMessage("buildings"));
            if(blValue){
            	printableRestriction = setMapValue(printableRestriction, getMessage("buildings"), selectedBlIds.join(", "));
            }else{
            	printableRestriction.push({'title': getMessage("buildings"), 'value': selectedBlIds.join(", ")});
            }
    } 
    return printableRestriction;
}

/**
 * Obtain a map({title,value}) value by title.
 * @param map
 * @param title
 * @returns map value for the specified title.
 */
function getMapValue(map, title){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			return map[i].value;
		}
	}
}

/**
 * Replace a map({title,value}) value.
 * @param map
 * @param title
 * @param newVal
 * @returns map after replacement
 */
function setMapValue(map, title, newVal){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			map[i].value = newVal;
			return map;
		}
	}
	return map;
}

function afterMapLoad_JS(panelId, mapId){
	// create the marker property to specify building markers for the map
	var colorBuckets = [1, 2];
	var sizeBuckets = [];
	sizeBuckets.push({limit:5,symbolSize:10});
	sizeBuckets.push({limit:10,symbolSize:20});
	sizeBuckets.push({limit:50,symbolSize:30});
	sizeBuckets.push({limit:100,symbolSize:40});		
	
	var markerProperty = new Ab.flash.ArcGISThematicColorSizeBucketMarkerProperty(
		'abCbRptHazBlMap_dsBldgs', 
		['bl.lat', 'bl.lon'], 
		['bl.bl_id'],
		['bl.address'],
		'bl.contains_hazard', // color field
		colorBuckets,	// color buckets				
		'bl.count_hazard_rooms', // size field
		sizeBuckets			// size buckets
	);

	markerProperty.colors = [[0, 255, 0, 1], [255, 247, 0, 1], [255, 0, 0, 1]];
	markerProperty.setThematic('bl.contains_hazard', colorBuckets); 
 	
	mapControl.updateDataSourceMarkerPropertyPair('abCbRptHazBlMap_dsBldgs', markerProperty);

	// show in map the selected buildings
	var controller = View.controllers.get('abCbRptHazBlMapCtrl');
	mapControl.refresh(controller.bldgsRestriction);
}
