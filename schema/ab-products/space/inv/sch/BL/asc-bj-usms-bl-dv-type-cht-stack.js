/**
 * in the chart panel, show the used area stack grouping by division and floor
 *
 *
 * @author Keven.xi
 * @date  2010-07-27
 *
 */
var abScStackByDvTypeController = View.createController('abScStackByDvTypeController', {

    isStackByDv: true,
    blId :null,
    blName:null,
	
    afterViewLoad: function(){
		this.getParentViewParameter();
		
        this.abScShowRmcatStackCrossPanel.addEventListener('afterGetData', this.abScShowRmcatStackCrossPanel_afterGetData, this);
		this.abScShowDvStackCrossPanel.addEventListener('afterGetData', this.abScShowDvStackCrossPanel_afterGetData, this);
        setBtnValue();
        onStackByDv();
		if (valueExists(this.blId)) {
			showStackChtPanel(this.blId,this.blName);
		}
    },
    
    abScShowRmcatStackCrossPanel_afterGetData: function(panel, dataSet){
        // replace default column sub-total values with those found in the data set
        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            var columnSubtotal = dataSet.columnSubtotals[c];
            if (columnValue == 'SERV') {
                //dataSet.columnValues[c].n = getMessage("noUnit");
                dataSet.columnValues[c].l = getMessage("serv");
                break;
            }
        }
        
        for (var r = 0; r < dataSet.records.length; r++) {
            var record = dataSet.records[r];
            var rm_cat = record.getValue("rm.rm_cat");
            if (rm_cat == "Serv") {
                var index = record.getValue("rm.fl_id") + ".Serv";
                dataSet.recordIndex[index] = r;
            }
        }
		
		//for fix USMS-33
		 var tempColumnSubtotals = dataSet.columnSubtotals; 
		 dataSet.columnSubtotals = [];
	    for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            for (var m = 0; m < tempColumnSubtotals.length; m++) {
	            if(columnValue==tempColumnSubtotals[m].getValue('rmcat.name')){
	            	dataSet.columnSubtotals.push(tempColumnSubtotals[m]);
	            }
	         }
        }
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
    },
	
	getParentViewParameter:function(){
		if (valueExists(this.view.parameters)){
			if (!this.blId) {
				this.blId = this.view.parameters['blId'];
				this.blName=this.view.parameters['blName'];
			}
				
		}
	}
    
});

function setBtnValue(){
    var btnDvStack = document.getElementById("btnStackByDv");
    var btnRmcatStack = document.getElementById("btnStackByRmcat");
    
    btnDvStack.value = "按使用单位叠堆";
    btnRmcatStack.value = "按房屋类别叠堆";
}

function onClickBlNode(){

    var currentNode = View.panels.get("abScDvStackSite_tree").lastNodeClicked;
    var siteName = currentNode.parent.data['site.name'];
    var title = String.format(getMessage('treeTitle'), siteName);
    setPanelTitle('abScDvStackSite_tree', title);
    
    var blId = currentNode.data['bl.bl_id'];
    var blName = currentNode.data['bl.name'];
    
	showStackChtPanel(blId,blName);
    
}

function showStackChtPanel(blId,blName){
	var title = "";
    if (hasRmInTheBl(blId)) {
    
        var dpChart = View.panels.get('abSpShowDpStack_dpChart');
        dpChart.addParameter('blIdRes', blId);
        dpChart.refresh();
        
        title = String.format(getMessage('dvStackPanelTitle'),blName);
        setPanelTitle('abSpShowDpStack_dpChart', title);
        
        var crossPanelDv = View.panels.get('abScShowDvStackCrossPanel');
        crossPanelDv.addParameter('blIdRes', "'" + blId + "'");
        crossPanelDv.refresh();
        
        
        var rmcatChart = View.panels.get('abSpShowRmcatStack_Chart');
        rmcatChart.addParameter('blIdRes', blId);
        rmcatChart.refresh();
        title = String.format(getMessage('rmcatStackPanelTitle'), blName);
        setPanelTitle('abSpShowRmcatStack_Chart', title);
        
        var crossPanelRmcat = View.panels.get('abScShowRmcatStackCrossPanel');
        crossPanelRmcat.addParameter('blIdRes', blId);
        crossPanelRmcat.refresh();
        
        if (abScStackByDvTypeController.isStackByDv) {
            onStackByDv();
        }
        else {
            onStackByRmcat();
        }
        
    }
    else {
        View.showMessage("建筑物<" + blName + ">没有房间数据,不能生成空间叠堆图");
    }
}
/**
 * check whether the building has room record
 * @param {Object} blId
 */
function hasRmInTheBl(blId){
    var ds = View.dataSources.get("abScDvStack_check_rmDS");
    ds.addParameter('blId', blId);
    var records = ds.getRecords();
    if (records.length == 0) {
        return false;
    }
    else {
        return true;
    }
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
        var buildingId = treeNode.data['bl.bl_id'];
        var buildingName = treeNode.data['bl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingName+ "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function onStackByDv(){
    View.panels.get('abSpShowDpStack_dpChart').show(true);
    View.panels.get('abScShowDvStackCrossPanel').show(true);
    
    View.panels.get('abSpShowRmcatStack_Chart').show(false);
    View.panels.get('abScShowRmcatStackCrossPanel').show(false);
    
    abScStackByDvTypeController.isStackByDv = true;
    setBtnEnabled(abScStackByDvTypeController.isStackByDv);
}

function onStackByRmcat(){
    View.panels.get('abSpShowRmcatStack_Chart').show(true);
    View.panels.get('abScShowRmcatStackCrossPanel').show(true);
    
    View.panels.get('abSpShowDpStack_dpChart').show(false);
    View.panels.get('abScShowDvStackCrossPanel').show(false);
    
    abScStackByDvTypeController.isStackByDv = false;
    setBtnEnabled(abScStackByDvTypeController.isStackByDv);
    
}

/**
 *
 * @param {Object} stackByDv -- boolean
 */
function setBtnEnabled(stackByDv){
    var btnDvStack = document.getElementById("btnStackByDv");
    var btnRmcatStack = document.getElementById("btnStackByRmcat");
    btnDvStack.disabled = stackByDv;
    btnRmcatStack.disabled = !stackByDv;
}


function showFlRmLayoutByRmcat(ob){
    var restriction = ob.getRestriction();
    var str_bl_fl = restriction.clauses[0].value;
    var bl_fl = str_bl_fl.split('-');
    var buildingId = bl_fl[0];
    var floorId = bl_fl[1];
    View.openDialog("asc-bj-usms-bl-highlight-type-info.axvw", null, false, {
        width: 1000,
        height: 700,
        blId: buildingId,
        flId: floorId,
        closeButton: false
    });
    
}

function showFlRmLayoutByDp(ob){
    var restriction = ob.getRestriction();
    var str_bl_fl = restriction.clauses[0].value;
    var bl_fl = str_bl_fl.split('-');
    var buildingId = bl_fl[0];
    var floorId = bl_fl[1];
    View.openDialog("asc-bj-usms-bl-highlight-dp-info.axvw", null, false, {
        width: 1000,
        height: 700,
        blId: buildingId,
        flId: floorId,
        closeButton: false
    });
}
