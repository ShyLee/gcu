var helpdeskSearchGridController = View.createController('searchGrid', {
	
	searchWorkFlowRule : "AbBldgOpsHelpDesk-searchServiceRequests",
	
	viewWorkRequestDetails : "ab-helpdesk-manager-search-workrequest.axvw",
	
	displayFields : ["activity_log_hactivity_log.activity_log_id","activity_log_hactivity_log.wr_id",
		"activity_log_hactivity_log.wo_id","activity_log_hactivity_log.status", "activity_log_hactivity_log.activity_type", 
		"activity_log_hactivity_log.prob_type", "activity_log_hactivity_log.requestor",
		"activity_log_hactivity_log.date_requested","activity_log_hactivity_log.description"],
		
	highlightBySubstitute: false,
 	   	
	arrayContains: function(arr, el) {
		for (var index in arr) {
			if (arr[index] == el) return true;
		}
		return false;
	},	   
    
    selectRow: function(row) {    	    	 
   		 
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("activity_log_hactivity_log.activity_log_id", row['activity_log_hactivity_log.activity_log_id'], '=');
    	
    	  // apply restriction to the tabbed view and select the second page
        var tabPanel = View.getView('parent').panels.get('tabs');
        var detailsTab = tabPanel.findTab('details'); 
        
        detailsTab.restriction = restriction;        
        detailsTab.refresh(restriction);        
        // reload the view
        detailsTab.loadView();      
         
        tabPanel.selectTab('details');         
    },
  
	
    afterInitialDataFetch : function() {  
    	try {         	
	         var columns=[];         
	         var column = null;
	         
	         var tabPanel = View.getView('parent').panels.get('tabs');
	          // get results tab
	         var resultsTab = tabPanel.findTab('results');         
	             
	         var filter = {  };          
	         
	         if (resultsTab.restriction != null) {
		         var clauses = resultsTab.restriction.clauses;  
		         
		         for (var i=0; i<clauses.length; i++) {
		         	var name = clauses[i].name.replace("wr.", "").replace("activity_log.",""); 	         			
		         	if (clauses[i].op == '&gt;='){
		         		filter[name+".from"] = clauses[i].value;
		         	} else if (clauses[i].op == '&lt;='){
		         		filter[name+".to"] = clauses[i].value;
		         	} else {
		         		filter[name] = clauses[i].value;
		         	}
		         }             
	         } 
			var result;
	        try {	 
				 result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-searchServiceRequests', filter);
			   } 
   			catch (e) {
			Workflow.handleError(e);
 			}
	        if (result.code == 'executed') {
	         	var records = result.data; 
	         	// add a select button to service requests (left most column)
			    var selectButton = new Ab.grid.Column("select", getMessage("select"), 'button');
			    selectButton.text = getMessage("select");
			    selectButton.defaultActionHandler = this.selectRow;     
			    columns.push(selectButton);
			     
			     // define columns
			    for(var i=0;i<this.resultGridDS.fieldDefs.items.length;i++){
			    	var fieldDef = this.resultGridDS.fieldDefs.items[i];
			           	
			    	if (this.arrayContains(this.displayFields, fieldDef.id)) {
			     		var title = fieldDef.title;
			     		if(fieldDef.id == 'activity_log_hactivity_log.activity_log_id'){
			     			title = getMessage('request_id');
			     		} else if(fieldDef.id == 'activity_log_hactivity_log.activity_type'){
			     			title = getMessage('request_type');
			     		}
			        	
			        	if(fieldDef.isDate){
			        		column = new Ab.grid.Column(fieldDef.id, title, 'date');
			        	} else if(fieldDef.isTime){
			        		column = new Ab.grid.Column(fieldDef.id, title, 'time');
			        	} else {
			        		column = new Ab.grid.Column(fieldDef.id, title, 'text');
			        		//make description column wider
			        		if(fieldDef.id == 'activity_log_hactivity_log.description'){
			        			column.width = '50%'
			        		}
			        	}         		
			     		columns.push(column);
			     	}
			    } 
			
			    var rows = []; 
			    
				//changed by Guo Jiangtao 2010-07-26 to fix KB3028350   
                var localizedRecords = this.getLocalizedRecords(result.dataSet.records);
                for (var i = 0; i < localizedRecords.length; i++) {
                    var record = localizedRecords[i].values;
                    rows.push(record);
                }          
			   	  
			    var configObj = new Ab.view.ConfigObject();
			    configObj['rows'] = rows; // row data values
			    configObj['columns'] = columns;
			      
			    // create new Grid component instance   
			    var grid = new Ab.grid.ReportGrid('searchGrid', configObj);
				//Guo added 2009-07-14 to solve KB3023517
				grid.sortEnabled = false;
				grid.build(); 
			   	
				//	 kb#3038415: for none result show proper information in grid
				if (result.dataSet.records.length == 0) {
						grid.hasNoRecords = true;
						grid.buildMoreRecordsFooterRow(grid.tableFootElement, grid.getLocalizedString(Ab.grid.ReportGrid.z_NO_RECORDS_TO_DISPLAY));
				}

				if(parseInt(View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']) != 0){
					this.highlightBySubstitute = true;
				} else {
					this.highlightBySubstitute = false;	
				}
			    // after build color the grid for escalation values
			    this.searchGridColor(grid.gridRows,rows,this.highlightBySubstitute);
			 
			 	//add color legend
			    var instructions = getMessage("legend");
			    instructions +="<br /><span style='background-color:#FC6'>"+getMessage("escalatedResponse")+"</span>";
			    instructions +="<br /><span style='background-color:#F66'>"+getMessage("escalatedCompletion")+"</span>";
			    if(this.highlightBySubstitute){
			    	instructions +="<br/><span style='background-color:"+View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor']+"'>"+getMessage("substituteLegend")+"</span>"
			    }
                grid.show();
			    grid.setInstructions(instructions);
                
                // fix KB3030760 - set record limit to 100 to improve the performance(Guo 2011/4/12)
                if (result.dataSet.hasMoreRecords) {
                    grid.hasMoreRecords = true;
                    grid.buildMoreRecordsFooterRow(grid.tableFootElement, grid.getLocalizedString(Ab.grid.ReportGrid.z_NOT_ALL_RECORDS_CAN_BE_SHOWN));
                } 
	        } else {
		       	 	Workflow.handleError(result);
		    }
			
		    
	    } catch (e) {
	    		Workflow.handleError(e);
		}   
    },    
    

	/**
	 * Called after the request grid is refreshed to display color codes in grid cells.
	 */
	searchGridColor: function(gridRows,rows,highlightBySubstitute) {
		var i =0;
    	gridRows.each(function(row) {    		
    		var color = '#FFF';
    		if (rows[i]['activity_log_hactivity_log.escalated_response'] > 0) {
    			color = '#FC6';
    		}
    		if (rows[i]['activity_log_hactivity_log.escalated_completion'] > 0) {
    			color = '#F66';
    		}
    		if(highlightBySubstitute){
    			if(rows[i]['activity_log_hactivity_log.manager'] != View.user.employee.id){
                	color = View.activityParameters['AbBldgOpsHelpDesk-SubstituteRecordColor'];
                }
    		}
            
            
            Ext.get(row.dom).setStyle('background-color', color);
            i++;     
		});	 
    } ,
	
    /**
     * get localized records.
     */
    getLocalizedRecords: function(records){
        var localizedRecords = [];
        for (var i = 0; i < records.length; i++) {
            localizedRecords.push(this.resultGridDS.processInboundRecord(records[i]));
        }
        
        for (var j = 0; j < localizedRecords.length; j++) {
            localizedRecords[j].values = this.formatValues(localizedRecords[j].values);
        }
        return localizedRecords;
    },
    
    /**
     * format values to localized string.
     */
    formatValues: function(values){
        var formattedValues = {};
        for (var name in values) {
            var value = values[name];
            var formattedValue = value;
            if (valueExistsNotEmpty(value) && this.arrayContains(this.displayFields, name)) {
                var fieldDef = this.resultGridDS.fieldDefs.get(name);
                if (fieldDef) {
                    formattedValue = fieldDef.formatValue(value, true, true);
                }
            }
            formattedValues[name] = formattedValue;
        }
        return formattedValues;
    }

});

