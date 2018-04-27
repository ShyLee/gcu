
var asgnCreateReqSelectTypeTabController = View.createController("asgnCreateSelectTypeTabController", {
    //main tab object , used here for store some globle varible
    tabs: null,
    
    afterInitialDataFetch: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid.addParameter("activityType",'SERVICE DESK - 房屋用途变更');
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.addParameter("activityType",'SERVICE DESK - 房屋用途变更');
        this.editGrid.addParameter("activityType",'SERVICE DESK - 房屋用途变更');
        
        this.ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid.refresh();
        this.ascBjUsmsProcAsgnReviewReqSelectTabGrid.refresh();
        this.editGrid.refresh();
        var a;

    },
    ascBjUsmsProcAsgnCreateReqSelectTypeTabGrid_select_onClick:function(row){
//    	 View.getWindow('parent').View.setTitle(requestType + "-申请");
    	    //set the globle request type to tabs object
    	var record = row.getRecord();
    	var activityTypeValue=record.getValue("activitytype.activity_type");
  	    var probTypeValue=record.getValue("activitytype.prob_type");
  		this. tabs.probTypeValue = probTypeValue;
  		this. tabs.requestType = activityTypeValue;
  		
  		var nextTabName = 'basicInputTab';
  		
  	    this.tabs.findTab(nextTabName).loadView();
    	this.tabs.selectTab(nextTabName);
    },
    
    selectNextTab: function(restriction){    	 
    	 this.tabs = View.getControlsByType(parent, 'tabs')[0];	 
         this.tabs.restriction = restriction;
         var nextTabName = 'basicInputTab';    		
         this.tabs.findTab(nextTabName);
         this.tabs.findTab(nextTabName).loadView();
      	 this.tabs.selectTab(nextTabName);
    },
    
    editGrid_delete_onClick: function(row){
    	this.editGrid.removeGridRow(row.getIndex());
    	this.editGrid.update();
    	
    	var activitylogid=row.getFieldValue("activity_log.activity_log_id");
    	var datasource=View.dataSources.get('tsRmTuChangeLogDS');
    	//删除ts_rm_tu_change_log表里的数据
		var rmRestriction = new Ab.view.Restriction();
		rmRestriction.addClause('ts_rm_tu_change_log.activity_log_id',activitylogid,'=');
		 var record=datasource.getRecord(rmRestriction);
		 datasource.deleteRecord(record);
		//删除activaty_log表里的数据
		 var editActivityLogDS=View.dataSources.get('editActivityLogDS');
		 var activityRestriction = new Ab.view.Restriction();
		 activityRestriction.addClause('activity_log.activity_log_id',activitylogid,'=');
		 var record2=datasource.getRecord(activityRestriction);
		 editActivityLogDS.deleteRecord(record2);
    },
    
    editGrid_edit_onClick: function(row){
        var record = row.getRecord();        
     	var activityTypeValue="SERVICE DESK - 房屋用途变更";
   	    var probTypeValue="房屋用途变更";
   		this. tabs.probTypeValue = probTypeValue;
   		this. tabs.requestType = activityTypeValue;
     	var activityLogId=record.getValue("activity_log.activity_log_id");   	  
        this.selectNextTab(activityLogId);
    
     	
    }
});
