/**
 * in the chart panel, show the used area stack grouping by division and floor
 * 
 * 
 * @author Keven.xi
 * @date  2010-07-27
 * 
 */

var abScDvStackSiteControl = View.createController('abScDvStackSiteControl', {
    
    //----------------event handle--------------------
    afterViewLoad: function(){
//    	var openController = View.getOpenerView().controllers.get("buildingAbstractController");
//由于调整 建筑物摘要信息 【建筑房产信息】界面以上代码换为   	
    	var openController = this.view.parameters["openController"];
    	var curNode=openController.curBLNode;
    	displayStack(curNode);
    	/*注释掉crossTable*/
		/*this.abScShowDvStackCrossPanel.addEventListener('afterGetData', this.abScShowDvStackCrossPanel_afterGetData, this);*/
    },
	/**
	 * fix USMS-33
	 * @param {Object} panel
	 * @param {Object} dataSet
	 */
	abScShowDvStackCrossPanel_afterGetData: function(panel, dataSet) {  
		//for fix USMS-33
		 var tempColumnSubtotals = dataSet.columnSubtotals; 
		 dataSet.columnSubtotals = [];
	    for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            for (var m = 0; m < tempColumnSubtotals.length; m++) {
	            if(columnValue==tempColumnSubtotals[m].getValue('dv.dv_name')){
	            	dataSet.columnSubtotals.push(tempColumnSubtotals[m]);
	            }
	         }
	        
        }
    }
})

function displayStack(currentNode){
    var siteName = currentNode.parent.parent.data['site.name'];
    var blId = currentNode.data['bl.bl_id'];
    var blName= currentNode.data['bl.name'];
	
	// 
	if (hasRmInTheBl(blId)) {
		var dpChart = View.panels.get('abSpShowDpStack_dpChart');
		dpChart.addParameter('blIdRes', blId);
		dpChart.refresh();
		
		title = String.format(getMessage('rptPanelTitle'), blName);
		setPanelTitle('abSpShowDpStack_dpChart', title);
		/*注释掉了crossTable*/
		/*var crossPanel = View.panels.get('abScShowDvStackCrossPanel');
		crossPanel.addParameter('blIdRes', "'" + blId + "'");
		crossPanel.refresh();*/
	}else{
		View.showMessage("建筑物<"+blName+">没有房间数据,不能生成空间叠堆图");
	}
}
/**
 * check whether the building has room record
 * @param {Object} blId
 */
function hasRmInTheBl(blId){
	var ds = View.dataSources.get("abScDvStack_check_rmDS");
	ds.addParameter('blId',blId);
	var records = ds.getRecords();
	if (records.length == 0){
		return false;
	}else{
		return true;
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

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'abScDvStackSite_tree') {
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