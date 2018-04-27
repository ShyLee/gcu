/**
 * @author Keven.xi
 */


var abScHlRmByCatAndType = View.createController('abScHlRmByCatAndTypeController', {
	blId:"",
	flId:"",
	blName:"",
	
    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abScHlRmByRmcatRmtype_DrawingPanel.appendInstruction("default", "", "");
        this.abScHlRmByRmcatRmtype_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abScHlRmByRmcatRmtype_TypeSumGrid.show(true);
//        this.abScHlRmByRmcatRmtype_SiteTree.addParameter('sitetIdSql', "");
//        this.abScHlRmByRmcatRmtype_SiteTree.addParameter('blId', "IS NOT NULL");
        this.abScHlRmByRmcatRmtype_SiteTree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    abScHlRmByRmcatRmtype_TypeSumGrid_afterRefresh: function(){
		var title = String.format(getMessage('crossPanelTitle'), this.blName+"-"+this.flId);
	 	this.abScHlRmByRmcatRmtype_TypeSumGrid.setTitle(title);
		
        resetColorFieldValue('abScHlRmByRmcatRmtype_TypeSumGrid', 'abScHlRmByRmcatRmtype_DrawingPanel', 'rmtype.rm_type', 'rmtype.hpattern_acad', 'abScHlRmByRmcatRmtype_TypeSumGrid_legend');
    },
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        var treePanel = View.panels.get("abScHlRmByRmcatRmtype_SiteTree");
        var siteId = consolePanel.getFieldValue('property.site_id');
        if (siteId) {
            treePanel.addParameter('siteId', " like'" + siteId + "%'");
        }
        else {
            treePanel.addParameter('siteId', "IS NOT NULL");
        }
        
        var propertyId = consolePanel.getFieldValue('bl.pr_id');
        if (propertyId) {
            treePanel.addParameter('prId', " like'" + propertyId + "%'");
        }
        else {
            treePanel.addParameter('prId', " IS NOT NULL ");
        }
		
        var buildingId = consolePanel.getFieldValue('bl.bl_id');
        if (buildingId) {
            treePanel.addParameter('blId', " like '" + buildingId + "%'");
        }
        else {
            treePanel.addParameter('blId', "IS NOT NULL");
        }
        
        var bl_use = consolePanel.getFieldValue('bl.use1');
		if (bl_use) {
			treePanel.addParameter('blUseFor',
					" = '" + bl_use + "'");
		} else {
			treePanel.addParameter('blUseFor', "IS NOT NULL");
		}
       
        
        treePanel.refresh();
        //this.curTreeNode = null;
    }
    
    
});

/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abScHlRmByRmcatRmtype_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.parent.parent.data['site.name'];
	var title = String.format(getMessage('treeTitle'), siteName);
	setPanelTitle('abScHlRmByRmcatRmtype_SiteTree', title);
	
    var blId = currentNode.data['fl.bl_id'];
    var blName = currentNode.data['fl.name'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname']
	
	abScHlRmByCatAndType.blId = blId;
	abScHlRmByCatAndType.flId = flId;
	abScHlRmByCatAndType.blName = blName;
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    var drawingPanel = View.panels.get('abScHlRmByRmcatRmtype_DrawingPanel');
    title =  blName + "-" + flId;
    displayFloor(drawingPanel, currentNode, title);
    
    var typeSumGrid = View.panels.get('abScHlRmByRmcatRmtype_TypeSumGrid');
    typeSumGrid.show(true);
    typeSumGrid.refresh(restriction);
}

/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
        View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 500,
            height: 350,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
        });
        
        var drawingPanel = View.panels.get('abScHlRmByRmcatRmtype_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScHlRmByRmcatRmtype_SiteTree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var prId = treeNode.data['property.pr_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + prId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var buildingId = treeNode.data['bl.bl_id'];
		var buildingName = treeNode.data['bl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
	
	 if (treeNode.level.levelIndex == 3) {
        var floorId = treeNode.data['fl.fl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

/**
 * display floor drawing for highlight report
 * @param {Object} drawingPanel
 * @param {Object} res
 * @param {String} title
 */
function displayFloor(drawingPanel, currentNode, title){
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname'];
	
    //if the seleted floor is same as the current drawing panel, just reset the highlight
    if (drawingPanel.lastLoadedBldgFloor == dwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}
/**
 * reset color field of the sumary grid
 * @param {string} gridPanelId
 * @param {string} drawingPanelId
 * @param {string} filedName
 * @param {string} hpFieldName
 * @param {string} colorfieldName
 */
function resetColorFieldValue(gridPanelId, drawingPanelId, filedName, hpFieldName, colorfieldName){
    var panel = View.panels.get(gridPanelId);
    var rows = panel.rows;
    var opacity = View.panels.get(drawingPanelId).getFillOpacity();
    
    for (var i = 0; i < rows.length; i++) {
        var val = rows[i][filedName];
        var color = '#FFFFFF';
        var hpval = rows[i][hpFieldName];
        if (hpval.length) 
            color = gAcadColorMgr.getRGBFromPattern(hpval, true);
        
        var cellEl = Ext.get(rows[i].row.cells.get(colorfieldName).dom);
        
        if (!hpval.length)
        	cellEl.setStyle('background-color', color);
        
        cellEl.setOpacity(opacity);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var siteId = parentNode.data['site.site_id'];
		if (!siteId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
        }
		var prId = parentNode.data['property.pr_id'];
		if (level == 2) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.pr_id', prId, '=', 'AND', true);
        }
    }
    return restriction;
}
