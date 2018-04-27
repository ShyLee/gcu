/**
 * @author Keven.xi
 */

var abAscBjUsmsBlEmList = View.createController('abAscBjUsmsBlEmListController', {
     
	afterViewLoad: function(){
		    this.abScRptEmInv_SiteTree.addParameter('sitetIdSql', "");
	        this.abScRptEmInv_SiteTree.addParameter('blId', "IS NOT NULL");
	        this.abScRptEmInv_SiteTree.createRestrictionForLevel = createRestrictionForLevel;
	},
	 sbfFilterPanel_onShow: function(){
	        this.refreshTreeview();
	        this.abScRptEmInv_SumGrid.show(false);
	    },
	    refreshTreeview: function(){
	        var consolePanel = this.sbfFilterPanel;
	        var treePanel = View.panels.get("abScRptEmInv_SiteTree");
	        var siteId = consolePanel.getFieldValue('property.site_id');
	        if (siteId) {
	            treePanel.addParameter('siteId', " site.site_id like'" + siteId + "%'");
				treePanel.addParameter('siteOfNullPr', " site.site_id like'" + siteId + "%'");
	            treePanel.addParameter('siteOfNullBl', " site.site_id like'" + siteId + "%'");
	        }
	        else {
	            treePanel.addParameter('siteId', " 1=1 ");
				treePanel.addParameter('siteOfNullPr', " 1=1 ");
	            treePanel.addParameter('siteOfNullBl', " 1=1 ");
	        }
	        
	        var propertyId = consolePanel.getFieldValue('bl.pr_id');
	        if (propertyId) {
	            treePanel.addParameter('prId', " like'" + propertyId + "%'");
	            treePanel.addParameter('prOfNullBl', " property.pr_id like'" + propertyId + "%'");
	            treePanel.addParameter('siteOfNullPr', " 1=0 ");
	        }
	        else {
	            treePanel.addParameter('prId', " IS NOT NULL ");
	            treePanel.addParameter('prOfNullBl', " 1=1 ");
	        }
			
	        var buildingId = consolePanel.getFieldValue('bl.name');
	        if (buildingId) {
	            treePanel.addParameter('blId', " like '" + buildingId + "%'");
				treePanel.addParameter('siteOfNullPr', " 1=0 ");
	            treePanel.addParameter('prOfNullBl', "1=0");
	        }
	        else {
	            treePanel.addParameter('blId', "IS NOT NULL");
	        }
	        
	        treePanel.refresh();
	        this.curTreeNode = null;
	    }
 
	    
});
function onBlTreeClick(ob){
	var currentNode = View.panels.get('abScRptEmInv_SiteTree').lastNodeClicked;
	var siteName = currentNode.parent.parent.data['site.site_id'];
	var title = String.format(getMessage('treeTitle'),  currentNode.parent.parent.data['site.name']);
	setPanelTitle('abScRptEmInv_SiteTree', title);
	
    var blId = currentNode.data['bl.bl_id'];
	var blName = currentNode.data['bl.name'];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.bl_id", blId, "=");
	
	title = String.format(getMessage('rptPanelTitle'), blName);
    
    var facultySumGrid = View.panels.get('abScRptEmInv_SumGrid');
    facultySumGrid.refresh(restriction);
	facultySumGrid.setTitle(title);
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abScRptEmInv_SiteTree').lastNodeClicked;
	var  siteId = currentNode.parent.parent.parent.data['site.site_id'];
	var title = String.format(getMessage('treeTitle'), currentNode.parent.parent.parent.data['site.name']);
	setPanelTitle('abScRptEmInv_SiteTree', title);
	
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
	
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.bl_id", blId, "=");
    restriction.addClause("em.fl_id", flId, "=");
	
	title =currentNode.parent.data['bl.name'] + "-" + flId;
    
    var facultySumGrid = View.panels.get('abScRptEmInv_SumGrid');
    facultySumGrid.refresh(restriction);
	facultySumGrid.setTitle(title);
}


function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScRptEmInv_SiteTree') {
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
        var prName = treeNode.data['property.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + prId+" "+prName + "</span> ";
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

