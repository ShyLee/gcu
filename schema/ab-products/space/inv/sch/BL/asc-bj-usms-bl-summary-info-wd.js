

var buildingAbstractController = View.createController('buildingAbstractController', {

    blId: "",
    blName: "",
    curNode:"",
    curBLNode:"",
    openerTitle:"",
    openBlId: null,
    
    /**
     * Initializes the view.
     */
    afterViewLoad: function(){
    
        this.site_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    afterInitialDataFetch: function(){
        if (this.view.parameters) {
            this.openBlId = this.view.parameters['openBlId'];
            
            if (this.openBlId) {
                this.onClickBlNode();
            }
        }
    	jQuery("table").find("#ext-gen63").css("color","#fff").css("backgroundColor","#537ac0");
    	this.abScBlInfoTabs.enableTab('buldingBasicInfo',false);
        this.abScBlInfoTabs.enableTab('fcAssetInfo',false);
    },
    sbfFilterPanel_onShow: function(){
    
        this.refreshTreeview();
        
        this.abScBlInfoTabs.enableTab('buldingBasicInfo',false);
        this.abScBlInfoTabs.enableTab('fcAssetInfo',false);
    },
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var propertyId = consolePanel.getFieldValue('bl.pr_id');
        if (propertyId) {
            this.site_tree.addParameter('prId', " like'" + propertyId + "%'");
        }
        else {
            this.site_tree.addParameter('prId', " IS NOT NULL ");
        }
        
        var buildingId = consolePanel.getFieldValue('bl.bl_id');
        if (buildingId) {
            this.site_tree.addParameter('blId', " like '" + buildingId + "%'");
        }
        else {
            this.site_tree.addParameter('blId', "IS NOT NULL");
        }
        
        var bl_use = consolePanel.getFieldValue('bl.use1');
        if (bl_use) {
            this.site_tree.addParameter('blUseFor', " = '" + bl_use + "'");
        }
        else {
            this.site_tree.addParameter('blUseFor', "IS NOT NULL");
        }
        
        var siteId = consolePanel.getFieldValue('bl.old_bl_name');
        if (siteId) {
            this.site_tree.addParameter('oldBlName', "bl.old_bl_name like '" + siteId + "%'");
        }
        else {
            this.site_tree.addParameter('oldBlName', " 1=1 ");
        }
        this.site_tree.refresh();
    },
    onClickBlNode: function (){
        var currentNode = this.site_tree.lastNodeClicked;
        buildingAbstractController.curBLNode=currentNode;
        var blId = "";
        if (currentNode) {
            var siteName = currentNode.parent.parent.data['site.name'];
            var title = String.format(getMessage('treeTitle'), siteName);
            setPanelTitle('site_tree', title);
            
            blId = currentNode.data['bl.bl_id'];
            blName = currentNode.data['bl.name'];
        }
        
        if (this.openBlId) {
            blId = this.openBlId;
        }
        
        
        this.blId = blId;
        this.blName = blName;
//        this.showDistinctPhoto(blId);
       
        //在tab之间共享变量
        this.abScBlInfoTabs.blId = blId;
        this.abScBlInfoTabs.blName = blName;
        this.abScBlInfoTabs.openController = this;
        
        var nextTabName = 'fcAssetInfo';
        var nextTab = this.abScBlInfoTabs.findTab(nextTabName);
        nextTab.loadView();
//        this.abScBlInfoTabs.selectTab(nextTabName);
        
        nextTabName = 'buldingBasicInfo';
        nextTab = this.abScBlInfoTabs.findTab(nextTabName);
        nextTab.loadView();
        this.abScBlInfoTabs.selectTab(nextTabName);
        
        this.abScBlInfoTabs.enableTab('buldingBasicInfo',true);
        this.abScBlInfoTabs.enableTab('fcAssetInfo',true);
        
    }
    
});


function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'site_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
            getMessage("noSite") +
            "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var prId = treeNode.data['property.pr_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
        prId +
        "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var buildingId = treeNode.data['bl.bl_id'];
        var buildingName = treeNode.data['bl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" +
        buildingName +
        "</span> ";
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




function onFlTreeClick(ob){
    var currentNode = View.panels.get('site_tree').lastNodeClicked;	
    buildingAbstractController.curBLNode=currentNode.parent;
    var blId = currentNode.data['fl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname']
    var blName = currentNode.data['fl.name']
    buildingAbstractController.curNode=currentNode;
    buildingAbstractController.openerTitle=blName + "-" + flId;
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", blId, "=");
    restriction.addClause("rm.fl_id", flId, "=");
    View.openDialog("asc-bj-usms-highlight-console-inline.axvw",restriction, false, {
        width: 1024,
        height: 768
    });	
    
}
