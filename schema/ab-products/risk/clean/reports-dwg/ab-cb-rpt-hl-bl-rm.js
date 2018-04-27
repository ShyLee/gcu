/**
 * overwrite function to make add city, site etc. on node restriction
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
		// regn level, we must add ctry
		if(level == 2
				&& parentNode.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.ctry_id', parentNode.parent.data['ctry.ctry_id']);
		}
		// state level, we must add ctry and regn
		if(level == 3
				&& parentNode.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.regn_id', parentNode.parent.data['regn.regn_id']);
			restriction.addClause('bl.ctry_id', parentNode.parent.parent.data['ctry.ctry_id']);
		}
		// city level, we must add ctry, regn and state
		if(level == 4
				&& parentNode.parent.data['state.state_id'] != undefined
				&& parentNode.parent.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.state_id', parentNode.parent.data['state.state_id']);
			restriction.addClause('bl.regn_id', parentNode.parent.parent.data['regn.regn_id']);
			restriction.addClause('bl.ctry_id', parentNode.parent.parent.parent.data['ctry.ctry_id']);
		}
		// bldg level, we must add ctry, regn, state and city
		if(level == 5
				&& parentNode.parent.data['city.city_id'] != undefined
				&& parentNode.parent.parent.data['state.state_id'] != undefined
				&& parentNode.parent.parent.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.city_id', parentNode.parent.data['city.city_id']);
			restriction.addClause('bl.state_id', parentNode.parent.parent.data['state.state_id']);
			restriction.addClause('bl.regn_id', parentNode.parent.parent.parent.data['regn.regn_id']);
			restriction.addClause('bl.ctry_id', parentNode.parent.parent.parent.parent.data['ctry.ctry_id']);
		}
		// floor level, we must add ctry, regn, state, city and site
		if(level == 6
				&& parentNode.parent.data['site.site_id'] != undefined
				&& parentNode.parent.parent.data['city.city_id'] != undefined
				&& parentNode.parent.parent.parent.data['state.state_id'] != undefined
				&& parentNode.parent.parent.parent.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.parent.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('rm.site_id', parentNode.parent.data['site.site_id']);
			restriction.addClause('rm.city_id', parentNode.parent.parent.data['city.city_id']);
			restriction.addClause('rm.state_id', parentNode.parent.parent.parent.data['state.state_id']);
			restriction.addClause('rm.regn_id', parentNode.parent.parent.parent.parent.data['regn.regn_id']);
			restriction.addClause('rm.ctry_id', parentNode.parent.parent.parent.parent.parent.data['ctry.ctry_id']);
		}
	}
	
	return restriction;
}

var abCbRptHlBlRmController = View.createController('abCbRptHlBlRmCtrl',{
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
    	this.filterController.visibleFields = "proj";

    	//specify a handler for when drawing is fully loaded; to be able to manually set highlights after load
        this.abCbRptHlBlRm_drawingPanel.addEventListener('ondwgload', onDwgLoaded);
        
        /*
         * specify a handler after resize of the drawing (drag of the layout region bar),
         * to hide/show the drawing panel
         */
        this.abCbRptHlBlRm_drawingPanel.addEventListener('afterResize', function(){
        	if (!controller.showDrawing){
        		controller.abCbRptHlBlRm_drawingPanel.parentElement.style.height ="0px";
    		}
        });
		
		// set message parameter for abCbRptHlBlRm_ctryTree panel
		this.abCbRptHlBlRm_ctryTree.addParameter('noDrawing',getMessage('noDrawing'));
		
		// highlight in the displayed drawing, a room selected from a grid
		this.abCbRptHlBlRm_gridRep.addEventListener('onMultipleSelectionChange', function(row) {
			var dwgPanel = View.panels.get('abCbRptHlBlRm_drawingPanel');
			var items = [row.row];
			// red if the row is selected or if there is another selected item for this item's room
			var color = ((row.row.isSelected() || existsSelectedItemInSameRoom(controller.abCbRptHlBlRm_gridRep, row.row)) ? 0xFF0000 : null);
			setDwgHighlight(dwgPanel, items, color, controller.currentDwgName);
	    });
		
		this.createMap();
    },
    
    createMap:function(){
    	//create map object it there is a valid ESRI license
    	if(hasValidArcGisMapLicense()){
			this.map = new Ab.flash.Map(
				'abCbRptHlBlRm_htmlMap', //html panel
				'abCbRptHlBlRm_objMap', //div id
				'abCbRptHlBlRm_dsBuilding', //Data Source
				true
			);
		}
    },
    
	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
        this.abCbRptHlBlRm_ctryTree.addParameter('consoleRestriction', restriction);
        this.abCbRptHlBlRm_ctryTree.refresh();
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
    	
        this.abCbRptHlBlRm_blDetailsPanel.show(showBlDet);   
		if (valueExists(FABridge.abDrawing)) {
        	showDwgToolbar.defer(200, this, [showDrawing, this.abCbRptHlBlRm_drawingPanel]);
        	this.abCbRptHlBlRm_drawingPanel.show(showDrawing);
       	}
        this.abCbRptHlBlRm_gridRep.show(showRep);
        this.abCbRptHlBlRm_htmlMap.show(showMap);
    },
	
	/**
	 * geocode a building
	 */
    abCbRptHlBlRm_htmlMap_onGeocode: function(){
        var geoCodeTool = new Ab.flash.Geocoder(this.map);
 		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', this.blId, '=');
        geoCodeTool.geoCode('abCbRptHlBlRm_dsGeoBuilding', restriction, 'bl', 'bl.bl_id', ['bl.lat', 'bl.lon'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], true);
		// refresh the tree after geocoding
		var tree = this.abCbRptHlBlRm_ctryTree;
		geoCodeTool.callbackMethod = function(){tree.refresh();};
    }
});

/**
 * show building details for selected building 
 */
function abCbRptHlBlRm_showBlDetails(node){
    //get bl id 
	var currentNode = View.panels.get('abCbRptHlBlRm_ctryTree').lastNodeClicked;
	var blId = node.restriction.clauses[0].value;

    var controller = View.controllers.get('abCbRptHlBlRmCtrl');
    controller.blId = blId;

	//refresh assessments items panel
    var node_rest = new Ab.view.Restriction();
	node_rest.addClause('activity_log.bl_id', blId, '=');
	
	controller.abCbRptHlBlRm_gridRep.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlBlRm_gridRep.refresh(node_rest);
    
    //hide selection checkboxes
	controller.abCbRptHlBlRm_gridRep.showColumn("multipleSelectionColumn", false);
    controller.abCbRptHlBlRm_gridRep.update();
    
	// load ESRI map or building details
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', controller.blId, '=');
	if (controller.map) {
		controller.showPanels(false, false, true, true);
		controller.map.refresh.defer(500, controller.map, [restriction]);
    }
    else {
        controller.showPanels(true, false, true, false);
    	controller.abCbRptHlBlRm_blDetailsPanel.refresh(restriction);
    }
}

/**
 *  show details for selected floor
 * @param {Object} node
 */
function abCbRptHlBlRm_showGrid(node){
    var controller = View.controllers.get('abCbRptHlBlRmCtrl');
    controller.showPanels(false, true, true, false);
    var currentNode = View.panels.get('abCbRptHlBlRm_ctryTree').lastNodeClicked;
    
    //set restrictions and refresh for abCbRptHlBlRm_gridRep panel
    var cityId = currentNode.data['rm.city_id'];
    
    var node_rest = new Ab.view.Restriction();
	node_rest.addClauses(node.restriction);
    node_rest.removeClause('rm.city_id');
    node_rest.removeClause('rm.rm_id');
	node_rest.addClause('bl.city_id', cityId, '=', true); 
    
	controller.abCbRptHlBlRm_gridRep.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlBlRm_gridRep.refresh(node_rest);
    
    //show selection checkboxes
    controller.abCbRptHlBlRm_gridRep.showColumn("multipleSelectionColumn", true);
    controller.abCbRptHlBlRm_gridRep.update();
    
    refreshDrawingPanel.defer(200, this);
}

function refreshDrawingPanel(){
	//set restrictions and refresh for abCbRptHlBlRm_drawingPanel
    var drawingPanel = View.panels.get('abCbRptHlBlRm_drawingPanel');
    var currentNode = View.panels.get('abCbRptHlBlRm_ctryTree').lastNodeClicked;
    var controller = View.controllers.get('abCbRptHlBlRmCtrl');
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
		'abCbRptHlBlRm_dsBuilding', 
		['bl.lat', 'bl.lon'], 
		['bl.bl_id'], 
		['bl.address']);
	mapControl.updateDataSourceMarkerPropertyPair('abCbRptHlBlRm_dsBuilding', markerProperty);
	
	// show in map the selected building
	var controller = View.controllers.get("abCbRptHlBlRmCtrl");
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', controller.blId, '=');
	mapControl.refresh(restriction);
}

/**
 * highlight rooms on drawing
 */
function onDwgLoaded(){
	var dwgPanel = View.panels.get('abCbRptHlBlRm_drawingPanel');
	var recsToHighlight = View.panels.get('abCbRptHlBlRm_gridRep').gridRows.items;
	setDwgHighlight(dwgPanel, recsToHighlight, null, abCbRptHlBlRmController.currentDwgName);
}
