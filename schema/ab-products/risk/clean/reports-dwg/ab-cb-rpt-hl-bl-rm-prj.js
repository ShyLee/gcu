/**
 * overwrite function to make add project on node restriction
 * @param {Object} parentNode
 * @param {Object} level
 */
Ab.tree.TreeControl.prototype._createRestrictionForLevel = function(parentNode, level) {
    var restriction = this.createRestrictionForLevel(parentNode, level);
	
	if (!restriction) {
		restriction = new Ab.view.Restriction();
		// add the tree restriction to parameter list if not null.
		if (this.restriction && this.restriction.clauses != undefined && this.restriction.clauses.length > 0) {
			restriction.addClauses(this.restriction, true);
		}
		
		// add the tree level's restriction to parameter list if not null.
		var levelRest = this.getRestrictionForLevel(level);
		if (levelRest && levelRest.clauses != undefined && levelRest.clauses.length > 0) {
			restriction.addClauses(levelRest, true);
		}
		
		// add the parent node's restriction to parameter list. it should always contain something
		if (!parentNode.isRoot()){
			if(this.type=='hierTree' || this.type=='selectValueHierTree'){
				restriction.addClauses(parentNode.restriction, true);
		    } else {
		    	if (this._panelsData[level].useParentRestriction==true) {
					restriction.addClauses(parentNode.restriction, true);
				}
			}
		}
		// bldg level, we must add project
		if(level == 2 && parentNode.parent.data['city.city_id'] != undefined){
			restriction.addClause('bl.city_id', parentNode.parent.data['city.city_id']);
		}
		//floor level, we must add project and site
		if(level == 3 && parentNode.parent.data['site.site_id'] != undefined && parentNode.parent.parent.data['city.city_id'] != undefined){
			restriction.addClause('rm.site_id', parentNode.parent.data['site.site_id']);
			restriction.addClause('rm.city_id', parentNode.parent.parent.data['city.city_id']);
		}
	}
	
	return restriction;
}

var abCbRptHlBlRmPrjController = View.createController('abCbRptHlBlRmPrjCtrl',{
	blId: null,
	map: null,
	filterController: null,
	
	// true if floor selected, false if building selected
	showDrawing: false,

	// drawing name for highlighting the assets
	currentDwgName: null,
	
    afterViewLoad: function(){
    	var controller = this;

    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "site";
    	this.filterController.paginatedReportName = "ab-cb-rpt-hl-bl-rm-prj-pgrp.axvw";

    	//specify a handler for when drawing is fully loaded; to be able to manually set highlights after load
        this.abCbRptHlBlRmPrj_drawingPanel.addEventListener('ondwgload', onDwgLoaded);
        
        /*
         * Specify a handler after resize of the drawing (drag of the layout region bar),
         * to hide/show the drawing panel
         */
        this.abCbRptHlBlRmPrj_drawingPanel.addEventListener('afterResize', function(){
        	if (!controller.showDrawing){
        		controller.abCbRptHlBlRmPrj_drawingPanel.parentElement.style.height ="0px";
    		}
        });
		
		// set message parameter for esHighRmHazWastProjectTree panel
		this.abCbRptHlBlRmPrj_projectTree.addParameter('noDrawing',getMessage('noDrawing'));
		
		// highlight in the displayed drawing, a room selected from a grid
		this.abCbRptHlBlRmPrj_gridRep.addEventListener('onMultipleSelectionChange', function(row) {
			var dwgPanel = View.panels.get('abCbRptHlBlRmPrj_drawingPanel');
			var items = [row.row];
			// red if the row is selected or if there is another selected item for this item's room
			var color = ((row.row.isSelected() || existsSelectedItemInSameRoom(controller.abCbRptHlBlRmPrj_gridRep, row.row)) ? 0xFF0000 : null);
			setDwgHighlight(dwgPanel, items, color, controller.currentDwgName);
	    });
		
		this.createMap();
    },
    
    createMap:function(){
    	//create map object it there is a valid ESRI license
    	if(hasValidArcGisMapLicense()){
			this.map = new Ab.flash.Map(
				'abCbRptHlBlRmPrj_htmlMap', //html panel
				'abCbRptHlBlRmPrj_objMap', //div id
				'abCbRptHlBlRmPrj_dsBuilding', //Data Source
				true
			);
		}
    },
    
	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
		restriction =  restriction.replace(/activity_log\./g, "a.");
        this.abCbRptHlBlRmPrj_projectTree.addParameter('consoleRestriction', restriction);
		this.abCbRptHlBlRmPrj_projectTree.addParameter('consoleRestrictionForCount', restriction.replace(/a\./g, "al."));
        this.abCbRptHlBlRmPrj_projectTree.refresh();
        this.showPanels(false, false, false, false);
	},

	/**
	 * show/ hide panels
	 * @param {boolean} showBlDet
	 * @param {boolean} showDrawing
	 * @param {boolean} showRep
	 * @param {boolean} showMap
	 */
    showPanels: function(showBlDet, showDrawing, showRep, showMap){
    	this.showDrawing = showDrawing;

    	this.abCbRptHlBlRmPrj_blDetailsPanel.show(showBlDet);   
		if (valueExists(FABridge.abDrawing)) {
        	showDwgToolbar.defer(200, this, [showDrawing, this.abCbRptHlBlRmPrj_drawingPanel]);
        	this.abCbRptHlBlRmPrj_drawingPanel.show(showDrawing);
       	}
        this.abCbRptHlBlRmPrj_gridRep.show(showRep);
        this.abCbRptHlBlRmPrj_htmlMap.show(showMap);
    },
	
	/**
	 * geocode a building
	 */
    abCbRptHlBlRmPrj_htmlMap_onGeocode: function(){
        var geoCodeTool = new Ab.flash.Geocoder(this.map);
 		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', this.blId, '=');
        geoCodeTool.geoCode('abCbRptHlBlRmPrj_dsGeoBuilding', restriction, 'bl', 'bl.bl_id', ['bl.lat', 'bl.lon'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], true);
		// refresh the tree after geocoding
		var tree = this.abCbRptHlBlRmPrj_projectTree;
		geoCodeTool.callbackMethod = function(){tree.refresh();};
    }
});

/**
 * show building details for selected building 
 */
function abCbRptHlBlRmPrj_showBlDetails(node){
    //get project id and bl id 
	var currentNode = View.panels.get('abCbRptHlBlRmPrj_projectTree').lastNodeClicked;
    var projectId = currentNode.getAncestor().getAncestor().data['city.city_id'];
	var blId = node.restriction.clauses[0].value;

    var controller = View.controllers.get('abCbRptHlBlRmPrjCtrl');
    controller.blId = blId;

	//refresh assessments items panel
    var node_rest = new Ab.view.Restriction();
	node_rest.addClause('activity_log.bl_id', blId, '=');
	node_rest.addClause('activity_log.project_id', projectId, '=');
	
	controller.abCbRptHlBlRmPrj_gridRep.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlBlRmPrj_gridRep.refresh(node_rest);
    
    //hide selection checkboxes
    controller.abCbRptHlBlRmPrj_gridRep.showColumn("multipleSelectionColumn", false);
    controller.abCbRptHlBlRmPrj_gridRep.update();
    
	// load ESRI map or building details
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', controller.blId, '=');
	if (controller.map) {
		controller.showPanels(false, false, true, true);
		controller.map.refresh.defer(500, controller.map, [restriction]);
	} else {
        controller.showPanels(true, false, true, false);
    	controller.abCbRptHlBlRmPrj_blDetailsPanel.refresh(restriction);
    }
}

/**
 *  show details for selected floor
 * @param {Object} node
 */
function abCbRptHlBlRmPrj_showGrid(node){
    var controller = View.controllers.get('abCbRptHlBlRmPrjCtrl');
    controller.showPanels(false, true, true, false);
    var currentNode = View.panels.get('abCbRptHlBlRmPrj_projectTree').lastNodeClicked;
    
    //set restrictions and refresh for abCbRptHlBlRmPrj_gridRep panel
    var projectId = currentNode.data['rm.city_id'];
    
    var node_rest = new Ab.view.Restriction();
	node_rest.addClauses(node.restriction);
    node_rest.removeClause('rm.city_id');
    node_rest.removeClause('rm.rm_id');
	node_rest.addClause('activity_log.project_id', projectId, '=', true); 
    
	controller.abCbRptHlBlRmPrj_gridRep.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlBlRmPrj_gridRep.refresh(node_rest);
    
    //show selection checkboxes
    controller.abCbRptHlBlRmPrj_gridRep.showColumn("multipleSelectionColumn", true);
    controller.abCbRptHlBlRmPrj_gridRep.update();
    refreshDrawingPanel.defer(200, this);
}

function refreshDrawingPanel(){
	//set restrictions and refresh for abCbRptHlBlRmPrj_drawingPanel
    var drawingPanel = View.panels.get('abCbRptHlBlRmPrj_drawingPanel');
    var currentNode = View.panels.get('abCbRptHlBlRmPrj_projectTree').lastNodeClicked;
    var controller = View.controllers.get('abCbRptHlBlRmPrjCtrl');
    var blId = currentNode.data['rm.bl_id'];
    var flId = currentNode.data['rm.fl_id'];
    controller.currentDwgName = currentNode.data['rm.raw_dwgname'];
    if (valueExistsNotEmpty(controller.currentDwgName)) {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, controller.currentDwgName);
        drawingPanel.addDrawing(dcl);
    }else{
    	drawingPanel.clear();
    }
}

function afterMapLoad_JS(panelId, mapId){
	// create the marker property to specify building markers for the map
	var markerProperty = new Ab.flash.ArcGISMarkerProperty(
		'abCbRptHlBlRmPrj_dsBuilding', 
		['bl.lat', 'bl.lon'], 
		['bl.bl_id'], 
		['bl.address']);
	mapControl.updateDataSourceMarkerPropertyPair('abCbRptHlBlRmPrj_dsBuilding', markerProperty);
	
	// show in map the selected building
	var controller = View.controllers.get("abCbRptHlBlRmPrjCtrl");
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', controller.blId, '=');
	mapControl.refresh(restriction);
}


/**
 * highlight rooms on drawing
 */
function onDwgLoaded(){
	var dwgPanel = View.panels.get('abCbRptHlBlRmPrj_drawingPanel');
	var recsToHighlight = View.panels.get('abCbRptHlBlRmPrj_gridRep').gridRows.items;
	setDwgHighlight(dwgPanel, recsToHighlight, null, abCbRptHlBlRmPrjController.currentDwgName);
}
