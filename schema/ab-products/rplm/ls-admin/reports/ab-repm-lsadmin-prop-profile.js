var abRepmLsadminPropProfileController = View.createController('abRepmLsadminPropProfileCtrl', {
	// object with default filter settings for current view
	defaultFilter:{
		items:[
			{id:'cost_from', value: ['recurring', 'scheduled', 'cost']},
			{id:'cost_for', value: 'fiscal'},
			{id:'net_income', isVisible: false},
			{id:'date_start', value: new Date()},
			{id:'date_end', value: (new Date()).add(Date.DAY, 364)},
			{id:'ls_assoc', isVisible: false},
			{id:'bl.bl_id', isVisible: false},
			{id:'ls.ls_id', isVisible: false}
		]
	},
	
	// current restriction
	restriction: null,

	// current printable restriction
	printableRestriction: [],
	
	//current parameters
	parameters: null,
	
	afterViewLoad: function(){
		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter();
		//showFilter(true);
		enableDate();
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'abRepmLsadminPropProfile_gridPanel';
	},
	abRepmLsadminPropProfile_gridPanel_onDetails: function(row){
		var restriction = new Ab.view.Restriction({"property.pr_id": row.getFieldValue("property.pr_id")});
		
		this.abRepmLsadminPropProfileDetails_propPanel.refresh(restriction);
		this.abRepmLsadminPropProfileDetails_valuePanel.refresh(restriction);
		this.abRepmLsadminPropProfileDetails_areasPanel.refresh(restriction);
		this.abRepmLsadminPropProfileDetails_costsPanel.refresh(restriction);
		this.abRepmLsadminPropProfileDetails_bldgsPanel.refresh(restriction);
		
		this.abRepmLsadminPropProfile_tabs.enableTab("abRepmLsadminPropProfile_tabDetails", true);
		this.abRepmLsadminPropProfile_tabs.selectTab("abRepmLsadminPropProfile_tabDetails");
	}
})


function onApplyFilter(crtFilter, printableRestriction){
	if(crtFilter == undefined){
		crtFilter = readFilter();
	}

	// we need to run  AbCommonResources-CostService-summarizePropertyCosts job
	var controller = View.controllers.get('abRepmLsadminPropProfileCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmLsadminPropProfile_gridPanel');
	// job parameters
	var dateFrom = crtFilter.get('date_start').value;
	var dateTo = crtFilter.get('date_end').value;
	var period = "YEAR";
    var isFromCosts = false;
    var isFromScheduledCosts = false;
    var isFromRecurringCosts = false;
	var isActiveRecurringCosts = 1;
	var costFor = crtFilter.get('cost_for').value;
	if( costFor === 'fiscal' || costFor === 'calendar'){
		period = "YEAR";
	}else if( costFor === 'quarter1' || costFor === 'quarter2' || costFor === 'quarter3' || costFor === 'quarter4'){
		period = "QUARTER";
	}else if( costFor === 'month'){
		period = "MONTH";
	}else{
		period = "DATE_RANGE";
	}
	var costFrom = crtFilter.get('cost_from').value;
	for(var i=0; i< costFrom.length; i++){
		switch(costFrom[i]){
			case 'recurring': {isFromRecurringCosts = true; break;}
			case 'scheduled': {isFromScheduledCosts = true; break;}
			case 'cost': {isFromCosts = true; break;}
		}
	}
	
	getRestrictionForOverview(controller, crtFilter, false, true);
	
	try {
		var jobId = Workflow.startJob('AbCommonResources-CostService-summarizePropertyCosts', dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts, isFromRecurringCosts, isActiveRecurringCosts);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}

	    	for(param in controller.parameters){
				overviewPanel.addParameter(param, controller.parameters[param]);
			}
			overviewPanel.refresh(controller.restriction);
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}
/**
 * create paginated report from overview panel
 */
function onDocX(){
	var controller = View.controllers.get('abRepmLsadminPropProfileCtrl');
	/*
	 * KB 3029212 Ioan  don't export if there is no data available
	 */
	var objOverviewPanel = View.panels.get(overviewPanelId);
	if (objOverviewPanel.gridRows.length == 0) {
		View.showMessage(getMessage('msg_docx_nodata'));
		return;
	}
	var reportConfig = {
		title: getMessage('msg_report_title'),
		fileName: 'ab-repm-lsadmin-prop-profile-rpt',
		callerView: 'ab-repm-lsadmin-prop-profile.axvw',
		dataSource: 'abRepmLsadminPropProfile_ds_grid',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var consoleRestr = 	controller.restriction;
	var parameters = controller.parameters;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('property.pr_id', '', 'IS NOT NULL', ')AND(', false);
	var rptFileCfg = new RptFileConfig(
		'ab-repm-lsadmin-prop-profile-details-rpt.axvw',
		{permanent: consoleRestr, temporary: restriction, parameters: parameters},
		'property.pr_id',
		{parameters :[
				{name: 'prId', type: 'value', value: 'property.pr_id'},
				{name: 'owned', type: 'text', value: getMessage("owned")},
				{name: 'leased', type: 'text', value: getMessage("leased")},
				{name: 'neither', type: 'text', value: getMessage("neither")}]},
		null
	);
	reportConfig.files.push(rptFileCfg);
	
	onPaginatedReport(reportConfig);
}
