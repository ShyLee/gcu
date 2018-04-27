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
	
	
	blId:null,
	
	afterInitialDataFetch: function(){
		if (this.view.parameters){
        	this.blId = this.view.parameters['blId'];
        	//this.blId=this.view.parameters['openBlId'];
        	
        	if (hasRmInTheBl(this.blId)) {
        		var rmcatChart = View.panels.get('abSpShowRmcatStack_Chart');
        		rmcatChart.addParameter('blIdRes', this.blId);
        		rmcatChart.refresh();
        		//title = String.format(getMessage('rptPanelTitle'), blId);
        		setPanelTitle('abSpShowRmcatStack_Chart', this.blId);
        		
        		var crossPanel = View.panels.get('abScShowRmcatStackCrossPanel');
        		crossPanel.addParameter('blIdRes', this.blId);
        		crossPanel.refresh();
        	}else{
        		View.showMessage("建筑物<"+this.blId+">没有房间数据,不能生成空间叠堆图");
        	}
        	
//        	if (this.openBlId) {
//				refreshBlBaseInfo();
//	    	}
		}
		
    },
    /**
     * After the panel is created but before the initial data fetch: 
     * add custom event listener to the panel's afterGetData event.
     */
    afterViewLoad: function() {
        this.abScShowRmcatStackCrossPanel.addEventListener('afterGetData', this.abScShowRmcatStackCrossPanel_afterGetData, this);
    },
    
    /**
     * Custom afterGetData listener, called by the cross-tab panel after it gets the data from 
     * the server, but before the data is used to build the cross-table. 
     * @param {Object} panel   The calling cross-table panel.
     * @param {Object} dataSet The data set received from the server - can be modified here.
     */
	
    abScShowRmcatStackCrossPanel_afterGetData: function(panel, dataSet) {
        // replace default column sub-total values with those found in the data set
        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            var columnSubtotal = dataSet.columnSubtotals[c];
            if (columnValue == 'SERV'){
				dataSet.columnValues[c].l = getMessage("serv");
				break;
			}
        }
		
		for (var r = 0; r < dataSet.records.length; r++) {
			var record = dataSet.records[r];
			var rm_cat = record.getValue("rm.rm_cat");
			if (rm_cat == "Serv"){
				var index = record.getValue("rm.fl_id") + ".Serv";
				dataSet.recordIndex[index] = r;
			}
        }
    }

	
});


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
