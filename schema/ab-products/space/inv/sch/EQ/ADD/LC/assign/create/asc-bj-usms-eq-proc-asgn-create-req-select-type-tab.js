
var ascBjUsmsProcAsgnCreateReqSelectTypeTabController = View.createController("ascBjUsmsProcAsgnCreateReqSelectTypeTabController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid.addParameter('activityType', 'SD -设备报增');
        this.ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid.refresh();
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter('activityType', "SD -设备报增");
		this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh();
    },
    ascBjUsmsProcAsgnReviewReqSelectTabGrid_viewDetails_onClick: function(row){
    
    	var activity_log_id= row.getFieldValue('activity_log_hactivity_log.activity_log_id') ;
    	  var restriction = new Ab.view.Restriction();
    	  restriction.addClause("activity_log_step_waiting.activity_log_id", activity_log_id, '=');
    	  var panel =  View.panels.get('ascBjUsmsProcAsgnColumnReport');
    	    panel.addParameter('stepRes', "资产处设备科管理员初审");
		   	panel.refresh(restriction);
		   	panel.show(true);
		   	panel.showInWindow({
		    	        width: 400,
		    	        height: 300
		    	    });
   	
    },    
   
    ascBjUsmsProcAsgnReviewReqSelectTabGrid_afterRefresh: function(){
    	
    	var grid = this.ascBjUsmsProcAsgnReviewReqSelectTabGrid;
    	
    	for(var i=0;i<grid.gridRows.length;i++)
    		{   var ds = this.ascBjUsmsProcAsgnColumnReportJudgeDS;
	    		var row = grid.gridRows.items[i];
	    		var status= row.getFieldValue('activity_log_hactivity_log.status') ;
	    		var activity_log_id= row.getFieldValue('activity_log_hactivity_log.activity_log_id') ;
	    		if(status=='APPROVED'){
	    			 document.getElementById('ascBjUsmsProcAsgnReviewReqSelectTabGrid_row'+i+'_viewDetails').disabled = false;
	    		}else{
	    			 document.getElementById('ascBjUsmsProcAsgnReviewReqSelectTabGrid_row'+i+'_viewDetails').disabled = true; 
	    		}	  	     
    		}
	}
});

function selectNextTab(requestType){
    View.getWindow('parent').View.setTitle(requestType + "-申请");
	
    //set the globle request type to tabs object
    var tabs = ascBjUsmsProcAsgnCreateReqSelectTypeTabController.tabs;
    tabs.requestType = requestType;
    
    //select next tab and reload the tab view
    var nextTabName = 'basicInputTab';
    var nextTab = tabs.findTab(nextTabName);
    nextTab.loadView();
    tabs.selectTab(nextTabName);
}

