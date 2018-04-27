/**
 * 
 * in the chart panel, show the used area stack grouping by room category and floor
 * 
 * 
 * @author Keven.xi
 * @date  2010-07-27
 * 
 */
View.createController('ascBjUsmsBlTypeChtStackController', {
	
    /**
     * After the panel is created but before the initial data fetch: 
     * add custom event listener to the panel's afterGetData event.
     */
    afterViewLoad: function() {
//    	var openController = View.getOpenerView().controllers.get("buildingAbstractController");
//由于调整 建筑物摘要信息 【建筑房产信息】界面,以上代码换为   	
    	var openController = this.view.parameters["openController"];	
    	var curNode=openController.curBLNode;
    	displayStack(curNode);
    	/*1.注释掉crossTable*/
        /*this.abScShowRmcatStackCrossPanel.addEventListener('afterGetData', this.abScShowRmcatStackCrossPanel_afterGetData, this);*/
    },

	
    abScShowRmcatStackCrossPanel_afterGetData: function(panel, dataSet) {
        // replace default column sub-total values with those found in the data set
        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            var columnSubtotal = dataSet.columnSubtotals[c];
            if (columnValue == 'SERV'){
				//dataSet.columnValues[c].n = getMessage("noUnit");
				dataSet.columnValues[c].l = getMessage("serv");
				break;
			}
        }
		
		for (var r = 0; r < dataSet.records.length; r++) {
			var record = dataSet.records[r];
			var rm_cat = record.getValue("rm.rm_cat");
			if (rm_cat == "SERV"){
				var index = record.getValue("rm.fl_id") + ".SERV";
				dataSet.recordIndex[index] = r;
			}
        }
		
		//for fix USMS-33
		 var tempColumnSubtotals = dataSet.columnSubtotals; 
		 dataSet.columnSubtotals = [];
	    for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            for (var m = 0; m < tempColumnSubtotals.length; m++) {
	            if(columnValue==tempColumnSubtotals[m].getValue('rmcat.rmcat_name')){
	            	dataSet.columnSubtotals.push(tempColumnSubtotals[m]);
	            }
	         }
        }
    },
	/*
	abSpShowDpStack_dpChart_afterRefresh:function(){
		var data1 = this.abSpShowDpStack_dpChart.data.toString();
		data1.replace(/N\/A/g,getMessage("noUnit"));
		this.abSpShowDpStack_dpChart.data = eval("("+data1+")");
	}
	*/
    
  
	
});
function displayStack(currentNode){
    var blId = currentNode.data['bl.bl_id'];
    var blName = currentNode.data['bl.name'];
	
	if (hasRmInTheBl(blId)) {
		var rmcatChart = View.panels.get('abSpShowRmcatStack_Chart');
		rmcatChart.addParameter('blIdRes', blId);
		rmcatChart.refresh();
		title = String.format(getMessage('rptPanelTitle'), blName);
		setPanelTitle('abSpShowRmcatStack_Chart', title);
		/*2.注释掉crossTable*/
		/*var crossPanel = View.panels.get('abScShowRmcatStackCrossPanel');
		crossPanel.addParameter('blIdRes', blId);
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

