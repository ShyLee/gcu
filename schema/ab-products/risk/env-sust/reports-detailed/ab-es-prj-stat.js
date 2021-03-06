/**
 * Ioan Draghici
 * 08/13/2009 - modified to use summary report
 * TO DO: split grouping column in individual columns
 */
var condAssessPrjStatController = View.createController('ESPrjStatCtrl',{
	selectedProjectIds: [],
	restriction: null,
	drillDownContext: null,
	afterViewLoad:function(){
		var managerProcess = [{activityId : 'AbRiskES', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));

		this.setLabels();
		this.consoleEsFilter_onClear();
		this.gridEsPrjStatByLocDetails.afterCreateDataRows = function(parentElement, columns){
				afterCreateDataRows_removeWorkRequest(parentElement, columns, isUserProcess, this);
			}
		this.gridEsPrjStatByLocDetails.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsProjStatByLoc.enableTab('tabDetails', false);
	},

	/**
	 * set console to default
	 */
	consoleEsFilter_onClear:function(){
		this.consoleEsFilter.clear();
		$('groupBy_regn_id').checked = true;
	},
	/**
	 * set radio button labels
	 */
	setLabels: function(){
		$('groupBy_regn_id_Span').innerHTML = getMessage('groupBy_regn_id_Label');
		$('groupBy_site_id_Span').innerHTML = getMessage('groupBy_site_id_Label');
		$('groupBy_bl_id_Span').innerHTML = getMessage('groupBy_bl_id_Label');
		$('groupBy_fl_id_Span').innerHTML = getMessage('groupBy_fl_id_Label');
		$('groupBy_rm_id_Span').innerHTML = getMessage('groupBy_rm_id_Label');
	},
	/**
	 * show paginated report
	 */
	consoleEsFilter_onPaginatedReport: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.projectsPanel, 'project.project_id');
		if(selectedProjectIds.length == 0){
			View.showMessage(getMessage('err_no_project'));
		}else{
			
			var projRest = new Ab.view.Restriction();
			projRest.addClause('activity_log.project_id', selectedProjectIds, 'IN');
			
			//prepare a custom printable restrictions - paired title and value (localized)
			var printableRestrictions = [];
			
			printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': selectedProjectIds.join()});
			var site_id = this.consoleEsFilter.getFieldValue('activity_log.site_id');
			if(	site_id){
				printableRestrictions.push({'title': getMessage('siteId'), 'value': site_id});
			}
			var bl_id = this.consoleEsFilter.getFieldValue('activity_log.bl_id');
			if(bl_id){
				printableRestrictions.push({'title': getMessage('blId'), 'value': bl_id});
			}
			var fl_id = this.consoleEsFilter.getFieldValue('activity_log.fl_id');
			if(fl_id){
				printableRestrictions.push({'title': getMessage('flId'), 'value': fl_id});
			}
			var csi_id = this.consoleEsFilter.getFieldValue('csi.csi_id');
			if(csi_id){
				printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
			}
			var date_from = this.consoleEsFilter.getFieldValue('activity_log.date_assessed');
        	if(date_from){
				printableRestrictions.push({'title': getMessage('dateFrom'), 'value': date_from});
			}
			var date_to = this.consoleEsFilter.getFieldValue('activity_log.date_required');
			if(date_to){
				printableRestrictions.push({'title': getMessage('dateTo'), 'value': date_to});
			}			

			// apply printable restrictions  to the report
	    	var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions};
			
			View.openPaginatedReportDialog('ab-es-prj-stat-prnt.axvw', {'ds_EsByPrj_owner':projRest,'ds_EsByPrj_data':this.getConsoleRestriction()},parameters);
		}		

	},
	
	/**
	 * filter action
	 */
	consoleEsFilter_onFilter:function(){
		this.setRestriction();
		
		if(this.restriction == null) {
			View.showMessage(getMessage('noProjectSelected'));
       		return;
		}

		var locationId = this.getGroupingFlds();
		this.repEsPrjStatByLoc.addParameter('locationId', locationId);
		this.repEsPrjStatByLoc.refresh(this.restriction);
	},
	repEsPrjStatByLoc_afterRefresh: function(){
		this.tabsProjStatByLoc.selectTab('tabReport');
		this.tabsProjStatByLoc.enableTab('tabDetails', false);
	},
	/**
	 * parse restriction object to sql string
	 * @param {Object} abRestriction
	 */
	toSQLString: function(abRestriction){
		var result = "";
		for(var i=0;i < abRestriction.clauses.length;i++){
			var objClause = abRestriction.clauses[i];
			var field = objClause.name;
			var op = objClause.op;
			var relOp = objClause.relOp;
			var value = objClause.value;
			result += " " + field;
			if(op == 'IN'){
				result += " " + op +" ('"+ value.join("','") +"') ";
			}else{
				if (field == "activity_log.date_assessed") {
					result += " "+ (op.replace('&gt;', '>')).replace('&lt;', '<') +" ${sql.date('"+value+"')} ";
				}
				else {
					result += " " + op + " '" + value + "' ";
				}
			}
			if(i < abRestriction.clauses.length -1){
				result += relOp;
			}
		}
		return (result);
	},
	/**
	 * TO DO HERE split grouping column in individual columns
	 * @param {Object} panel
	 * @param {Object} dataSet
	 */
	repEsPrjStatByLoc_afterGetData: function(panel, dataSet){
		//panel.groupByFields[0].hidden = true;
	},
	
	/**
	 * Sets the controller's attribute 'restriction'
	 * according to the selected projects and the filter console selections
	 */
	setRestriction: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.projectsPanel, 'project.project_id');
		if(selectedProjectIds.length == 0)
       		return;

		this.restriction = this.getConsoleRestriction();
		this.restriction.addClause('activity_log.project_id', selectedProjectIds, 'IN');
	},
	
	/**
	 * Returns a Restriction object according to the filter console selections
	 */
	getConsoleRestriction: function() {
		var restriction = new Ab.view.Restriction();
        var record = this.consoleEsFilter.getRecord();
        var site_id = record.getValue('activity_log.site_id');
        var bl_id = record.getValue('activity_log.bl_id');
        var fl_id = record.getValue('activity_log.fl_id');
        var csi_id = record.getValue('csi.csi_id');
        var date_from = this.consoleEsFilter.getFieldValue('activity_log.date_assessed');
        var date_to = this.consoleEsFilter.getFieldValue('activity_log.date_required');

		if (valueExistsNotEmpty(site_id)) {
			restriction.addClause("activity_log.site_id", site_id, '=');
		}
		
		if (valueExistsNotEmpty(bl_id)) {
			restriction.addClause("activity_log.bl_id", bl_id, '=');
		}
		
		if (valueExistsNotEmpty(fl_id)) {
			restriction.addClause("activity_log.fl_id", fl_id, '=');
		}
		
		if (valueExistsNotEmpty(csi_id)) {
			restriction.addClause("activity_log.csi_id", csi_id, '=');
		}
		
		if (valueExistsNotEmpty(date_from)) {
			restriction.addClause("activity_log.date_assessed", date_from, '>=');
		}
		/*
		 * 06/09/2010 IOAN KB 3027916
		 */
		if (valueExistsNotEmpty(date_to)) {
			restriction.addClause("activity_log.date_assessed", date_to, '<=');
		}

		return restriction;
	},
	
	
	/**
	 * get grouping fields based on user selection
	 */
	getGroupingFlds: function(){
		var ds = this.dsEsPrjStatByLoc;
		var fldObj = ds.fieldDefs.get('activity_log.location_id');
		var radioObj = document.getElementsByName('radioGroupBy');
		var value = '';
		for(var i=0;i<radioObj.length;i++){
			if(radioObj[i].checked){
				value = radioObj[i].value;
				break;
			}
		}
		switch(value){
			case 'regn_id':
				fldObj.title = getMessage('regn_idTitle');
				return ("calc_regn_id");
			case 'site_id':
				fldObj.title = getMessage('regn_idTitle')+" / "+getMessage('site_idTitle');
				return ("calc_regn_id${sql.concat}' / '${sql.concat}activity_log.site_id");
			case 'bl_id':
				fldObj.title = getMessage('regn_idTitle')+" / "+getMessage('site_idTitle')+" / "+getMessage('bl_idTitle');
				return ("calc_regn_id${sql.concat}' / '${sql.concat}activity_log.site_id${sql.concat}' / '${sql.concat}activity_log.bl_id");
			case 'fl_id':
				fldObj.title = getMessage('regn_idTitle')+" / "+getMessage('site_idTitle')+" / "+getMessage('bl_idTitle')+" / "+getMessage('fl_idTitle');
				return ("calc_regn_id${sql.concat}' / '${sql.concat}activity_log.site_id${sql.concat}' / '${sql.concat}activity_log.bl_id${sql.concat}' / '${sql.concat}activity_log.fl_id");
			case 'rm_id':
				fldObj.title = getMessage('regn_idTitle')+" / "+getMessage('site_idTitle')+" / "+getMessage('bl_idTitle')+" / "+getMessage('fl_idTitle')+" / "+getMessage('rm_idTitle');
				return ("calc_regn_id${sql.concat}' / '${sql.concat}activity_log.site_id${sql.concat}' / '${sql.concat}activity_log.bl_id${sql.concat}' / '${sql.concat}activity_log.fl_id${sql.concat}' / '${sql.concat}activity_log.rm_id");
		}
	},
	/**
	 * show sleected project details
	 */
	projectsPanel_onShowProjects:function(){
		showProjectDetails(this.projectsPanel ,'project.project_id');
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	gridEsPrjStatByLocDetails_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			controller.consoleEsFilter_onFilter();
			repEsPrjStatByLoc_onClickItem(controller.drillDownContext);
		});
	},
	gridEsPrjStatByLocDetails_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				controller.consoleEsFilter_onFilter();
				repEsPrjStatByLoc_onClickItem(controller.drillDownContext);
			})){
			return;
		}
	}
});

function setRestrictionToXLS(){
	var controller = View.controllers.get('ESPrjStatCtrl');
	controller.setRestriction();
	
	if(controller.restriction == null) {
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	
	var restriction = new Ab.view.Restriction();
	addClausesToRestriction(restriction, controller.restriction);
	
	controller.gridEsPrjStatByLocDetails.restriction = restriction;
}

/**
 * Opens Assessments drill down on click event
 * @param {Object} context The clicked line restriction
 */
function repEsPrjStatByLoc_onClickItem(context) {
	var controller = View.controllers.get("ESPrjStatCtrl");
	controller.drillDownContext = context;
	
	var restriction = "";
	/*
	 * 05/12/2010 IOAN fixed issue with calculated field clause
	 */
 	if (context.restriction.clauses) {
		var clause = context.restriction.findClause("activity_log.location_id");
		if(clause){
			restriction = controller.getGroupingFlds() + " " + clause.op ;
			if(clause.value != ""){
				restriction += " '" + clause.value + "'";
			}
		}
	}

	var consoleRestriction = controller.toSQLString(controller.restriction);
	consoleRestriction = consoleRestriction.replace(/calc_regn_id/, "(CASE WHEN activity_log.bl_id IS NULL THEN site.regn_id ELSE bl.regn_id END)");
	var locationId = controller.getGroupingFlds();
	locationId = locationId.replace(/calc_regn_id/, "(CASE WHEN activity_log.bl_id IS NULL THEN site.regn_id ELSE bl.regn_id END)");
	restriction = restriction.replace(/calc_regn_id/, "(CASE WHEN activity_log.bl_id IS NULL THEN site.regn_id ELSE bl.regn_id END)");

	var detailsPanel = View.panels.get('gridEsPrjStatByLocDetails');
	detailsPanel.addParameter('consoleRestriction', consoleRestriction); 
	detailsPanel.addParameter('locationId', locationId); 
	detailsPanel.refresh(restriction);

	var objTabs = View.panels.get('tabsProjStatByLoc');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';

}
