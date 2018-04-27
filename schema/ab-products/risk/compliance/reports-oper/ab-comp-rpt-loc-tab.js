
var abReportLocController = View.createController('abReportLocController', {
	
	afterInitialDataFetch: function(){
		//if this view is opened as popup, get the restriction from parent view 
		var openerView = View.getOpenerView().getOpenerView();
		if(openerView && openerView.popUpRestriction){
			//hide DOC button when open as pop up 
			this.regLocGrid.actions.get('exportDOCX').show(false);
			
			this.regLocGrid.addParameter('regRequireRes', openerView.popUpRestriction);
		}
	},

	regLocGrid_onView: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var location_id = record.getValue("regloc.location_id");
		if (valueExistsNotEmpty(location_id)) {
			restriction.addClause('regloc.location_id', location_id, '=');
		}	
		var panel=this.regLocForm;
		panel.refresh(restriction);
		panel.show(true);
		this.regLocForm.showInWindow({
			width: 800,
			height: 500
		});
		

    	this.mainController=View.getOpenerView().controllers.get(0);
    	if(this.mainController){
    		var firstTabTable = this.mainController.firstTabTable;
    		if(firstTabTable == 'regulation'){
    			this.regLocForm.setTitle(getMessage("formTitleRegulation"));
    		}else if(firstTabTable == 'regprogram'){
    			this.regLocForm.setTitle(getMessage("formTitleProgram"));
    		}else if(firstTabTable == 'regrequirement'){
    			this.regLocForm.setTitle(getMessage("formTitleRequirement"));
    		}
    	}
		
		},
	
	/**
	* Event Handler of action "Doc"
	*/
	regLocGrid_onExportDOCX: function(){
		var	parameters = {};
		parameters.selectRes = this.regLocGrid.restriction?this.regLocGrid.restriction:"1=1";
		
    this.mainController=View.getOpenerView().controllers.get(0);
  	if(this.mainController){
  		var firstTabTable = this.mainController.firstTabTable;
  		if(!valueExistsNotEmpty(firstTabTable) || firstTabTable == 'regulation'){
		    View.openPaginatedReportDialog("ab-comp-reg-loc-paginate-rpt.axvw" ,null, parameters);
  		}else if(firstTabTable == 'regprogram'){
		    View.openPaginatedReportDialog("ab-comp-prog-loc-paginate-rpt.axvw" ,null, parameters);
  		}else if(firstTabTable == 'regrequirement'){
		    View.openPaginatedReportDialog("ab-comp-req-loc-paginate-rpt.axvw" ,null, parameters);
  		}
  	}
	}
	
	
});

