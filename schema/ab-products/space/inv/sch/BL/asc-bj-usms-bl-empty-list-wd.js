/**
 * @author Keven.xi
 */
var abScVwVacantAreabyBl = View.createController('abScVwVacantAreabyBlController', {

    blId: "",
    c_kongzhifang: "空置房",
    blName:"",
    //c_xuexiao :"学校",
	
    afterViewLoad: function(){
//        this.abScVwVacantAreaRptPanel.buildPostFooterRows = addTotalRow;

//        this.abScVwVacantArea_SiteTree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    
    sbfFilterPanel_onClear: function(){
        this.sbfFilterPanel.clear();
    },
    /**
     * set panel title
     */
    abScVwVacantAreaRptPanel_afterRefresh: function(){
        var title = String.format(getMessage('rptPanelTitle'), this.blName);
        this.abScVwVacantAreaRptPanel.setTitle(title);
    },
    
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.abScVwVacantAreaRptPanel.show(false);
    },
	
    refreshTreeview: function(){
    	 var consolePanel = this.sbfFilterPanel;
         
         var siteId = consolePanel.getFieldValue('property.site_id');
         if (siteId) {
             this.abScVwVacantArea_SiteTree.addParameter('siteId', " like'" + siteId + "%'");
         }
         else {
             this.abScVwVacantArea_SiteTree.addParameter('siteId', " IS NOT NULL ");
         }
         
         var propertyId = consolePanel.getFieldValue('bl.pr_id');
         if (propertyId) {
             this.abScVwVacantArea_SiteTree.addParameter('prId', " like'" + propertyId + "%'");
         }
         else {
             this.abScVwVacantArea_SiteTree.addParameter('prId', " IS NOT NULL ");
         }
 		
         var buildingId = consolePanel.getFieldValue('bl.bl_id');
         if (buildingId) {
             this.abScVwVacantArea_SiteTree.addParameter('blId', " like '" + buildingId + "%'");
         }
         else {
             this.abScVwVacantArea_SiteTree.addParameter('blId', "IS NOT NULL");
         }
         
         var bl_use = consolePanel.getFieldValue('bl.use1');
 		if (bl_use) {
 			 this.abScVwVacantArea_SiteTree.addParameter('blUseFor'," = '" + bl_use + "'");
 		} else {
 			 this.abScVwVacantArea_SiteTree.addParameter('blUseFor', "IS NOT NULL");
 		}
 		
         this.abScVwVacantArea_SiteTree.refresh();
    }
    
});

function onSiteTreeClick(ob){
    abScVwVacantAreabyBl.blId = "";
	var currentNode = View.panels.get('abScVwVacantArea_SiteTree').lastNodeClicked;
    var siteName = currentNode.data['site.site_id'];
    var title = String.format(getMessage('treeTitle'), siteName);
    setPanelTitle('abScVwVacantArea_SiteTree', title);
    var siteId = currentNode.data['site.site_id'];
    
    var facultySumGrid = View.panels.get('abScVwVacantAreaRptPanel');
    facultySumGrid.addParameter("locRes", "bl.site_id='" + siteId + "'");
//    facultySumGrid.addParameter("rmcatRes", abScVwVacantAreabyBl.c_kongzhifang);
    facultySumGrid.refresh();
}

function onPrTreeClick(ob){
	abScVwVacantAreabyBl.blId = "";
	var currentNode = View.panels.get('abScVwVacantArea_SiteTree').lastNodeClicked;
    var siteName = currentNode.parent.data['site.site_id'];
    var title = String.format(getMessage('treeTitle'), siteName);
    setPanelTitle('abScVwVacantArea_SiteTree', title);
    var prId = currentNode.data['pr.bl_id'];
    
    var facultySumGrid = View.panels.get('abScVwVacantAreaRptPanel');
    facultySumGrid.addParameter("locRes", "bl.pr_id='" + prId + "'");
//    facultySumGrid.addParameter("rmcatRes", abScVwVacantAreabyBl.c_kongzhifang);
    facultySumGrid.refresh();
}
/**
 * event handler when click the floor level of the tree
 * @param {Object} ob
 */
function onBlTreeClick(ob){
    var currentNode = View.panels.get('abScVwVacantArea_SiteTree').lastNodeClicked;
    var siteName = currentNode.parent.parent.data['site.site_id'];
    var title = String.format(getMessage('treeTitle'), siteName);
    setPanelTitle('abScVwVacantArea_SiteTree', title);
    var blId = currentNode.data['bl.bl_id'];
    var blName= currentNode.data['bl.name'];
    abScVwVacantAreabyBl.blId = blId;
    abScVwVacantAreabyBl.blName= blName;
    
    var facultySumGrid = View.panels.get('abScVwVacantAreaRptPanel');
    facultySumGrid.addParameter("locRes", "rm.bl_id='" + blId + "'");
//    facultySumGrid.addParameter("rmcatRes", abScVwVacantAreabyBl.c_kongzhifang);
    facultySumGrid.refresh();
}


function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScVwVacantArea_SiteTree') {
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
    
    
}

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2 || this.rows.length > 100) {
        return;
    }
    var totalCount = this.rows.length;
    var totalArea = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
        var fntstdPriceValue = row['rm.area'];
        if (row['rm.area.raw']) {
            fntstdPriceValue = row['rm.area.raw'];
        }
        if (!isNaN(parseFloat(fntstdPriceValue))) {
            totalArea += parseFloat(fntstdPriceValue);
        }
    }
    totalArea = totalArea.toFixed(2);
    
    var ds = this.getDataSource();
    
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1, getMessage('total'));
    // column 2: 
    addColumn(gridRow, 1, ds.formatValue('rm.bl_id', totalCount, true));
    // column 3: 
    addColumn(gridRow, 1, ds.formatValue('rm.area', totalArea, true));
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 1: empty	
    addColumn(gridRow, 1);
	// column 1: empty	
    addColumn(gridRow, 1);
}

/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 1) {
            var siteId = parentNode.data['site.site_id'];
            if (!siteId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
            }
        }
        if (level == 2) {
            var propertyId = parentNode.data['property.pr_id'];
            if (!propertyId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('bl.pr_id', '', 'IS NULL', 'AND', true);
            }
        }
    }
    return restriction;
}

