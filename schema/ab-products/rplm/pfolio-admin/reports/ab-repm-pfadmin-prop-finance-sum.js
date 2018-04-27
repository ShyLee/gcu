var abRepmPfadminPropFinanceSumController = View.createController('abRepmPfadminPropFinanceSumCtrl', {
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
	
	// VAT selection
	displayVAT: {
		type: '',
		isHidden: false
	},
	
	//UOM conversion fator
	areaConvFact: null,
	
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: ''
	},
	
	isMcAndVatEnabled: false,
	
	/*
	 * VPA restriction for current user.
	 * Contains current VPA restriction in both format sql string and Ab.view.restriction object.
	 */
	vpaRestriction: null,

	afterViewLoad: function(){
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayVAT.isHidden = false;
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        }

		//initialize area conversion factor
		this.areaConvFact = 1;
		if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]=="1"){
			// UOM Changes
			if(View.user.displayUnits != View.project.units){
				//not 1/parseFloat(View.user.areaUnits.conversionFactor) because this parameter will be used for a cost/area 
				this.areaConvFact = parseFloat(View.user.areaUnits.conversionFactor);
			}
		}
		
		// get VPA restriction for logged user
		this.vpaRestriction = getVpaRestriction(this.view.user.name);
		copyDefaultSettings(this.defaultFilter);
		setFilterLabels();
	},
	
	afterInitialDataFetch: function(){
		// set filter default values
		setFilter(copyObject(this.displayVAT), copyObject(this.displayCurrency));
		//showFilter(true);
		enableDate();
		// set overviewPanelId variable defined in filter
		overviewPanelId = 'abRepmPfadminPropFinanceSum_gridPanel';
	},
	
	abRepmPfadminPropFinanceSum_gridPanel_afterRefresh: function(){
		if(valueExistsNotEmpty(this.displayVAT.type)){
			var overviewTitle = getMessage("title_report")+ ' - '  + getMessage("title_" + this.displayVAT.type);
			this.abRepmPfadminPropFinanceSum_gridPanel.setTitle(overviewTitle);
		}
	},
	
	abRepmPfadminPropFinanceSumDetails_gridPanel_beforeRefresh: function(){
		this.abRepmPfadminPropFinanceSumDetails_gridPanel.addParameter('owned', getMessage('owned'));
		this.abRepmPfadminPropFinanceSumDetails_gridPanel.addParameter('leased', getMessage('leased'));
		this.abRepmPfadminPropFinanceSumDetails_gridPanel.addParameter('neither', getMessage('neither'));
	},
	abRepmPfadminPropFinanceSum_gridPanel_onDetails: function(row){
		var restriction = new Ab.view.Restriction({"property.ctry_id": row.getFieldValue("property.ctry_id")});
		var exchangeRate = 1;
		if(this.isMcAndVatEnabled && this.displayCurrency.type != 'budget'){
			// KB 3035042  we must use exchange rate type Budget to convert budget costs
			//exchangeRate = "${sql.exchangeRateFromBudget('" + this.displayCurrency.code + "','"+ this.displayCurrency.exchangeRateType +"')}";
			exchangeRate = "${sql.exchangeRateFromBudget('" + this.displayCurrency.code + "','Budget')}";
		}
		var currencyCode = this.displayCurrency.code;
		this.abRepmPfadminPropFinanceSumDetails_gridPanel.getDataSource().fieldDefs.each(function(fieldDef){
			if(valueExists(fieldDef.currency)){
				fieldDef.currency = currencyCode;
			}
		});

		this.abRepmPfadminPropFinanceSumDetails_gridPanel.addParameter("area_conversion_factor", this.areaConvFact);
		this.abRepmPfadminPropFinanceSumDetails_gridPanel.refresh(restriction);
		if (valueExistsNotEmpty(msgOverviewNote)){
			this.abRepmPfadminPropFinanceSumDetails_gridPanel.setInstructions(msgOverviewNote);
		}
		
		this.abRepmPfadminPropFinanceSum_tabs.enableTab("abRepmPfadminPropFinanceSum_tabDetails", true);
		this.abRepmPfadminPropFinanceSum_tabs.selectTab("abRepmPfadminPropFinanceSum_tabDetails");
	}
})

/**
 * Apply filter restriction to overview panel
 * 
 * @param {Object} crtFilter - current filter settings
 * @param {Object} printableRestriction - current printable restriction
 * @param {String} displayVAT - current VAT Option
 * @param {Object} displayCurrency - current Multi currency settings
 */
function onApplyFilter(crtFilter, printableRestriction, displayVAT, displayCurrency){
	if(crtFilter == undefined){
		crtFilter = readFilter();
	}

	// we need to run  AbCommonResources-CostService-summarizePropertyCosts job
	var controller = View.controllers.get('abRepmPfadminPropFinanceSumCtrl');
	controller.printableRestriction = printableRestriction;
	var overviewPanel = View.panels.get('abRepmPfadminPropFinanceSum_gridPanel');
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
	
	// get console restriction for overview panel
	var isSqlStringRestriction = true;
	getRestrictionForOverview(controller, crtFilter, false, true, isSqlStringRestriction);
	// MC and VAT variables
	controller.displayVAT = displayVAT;
	controller.displayCurrency = displayCurrency;
	
	var currencyVatParams = {
			"vat": displayVAT.type,
			"type": displayCurrency.type,
			"code": displayCurrency.code,
			"rateType": displayCurrency.exchangeRateType
	};
	
	var reportDataSource = View.dataSources.get('abRepmPfadminPropFinanceSum_ds_report');

	try {
		var jobId = Workflow.startJob('AbCommonResources-CostService-summarizePropertyCosts', dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts, isFromRecurringCosts, isActiveRecurringCosts, currencyVatParams);
	    View.openJobProgressBar(getMessage('msg_summarize_costs'), jobId, '', function(status) {
	    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
	    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
	    		return true;
	    	}

	    	for(param in controller.parameters){
				overviewPanel.addParameter(param, controller.parameters[param]);
				reportDataSource.addParameter(param, controller.parameters[param]);
			}
			overviewPanel.addParameter("user_name", View.user.name);
			// set currency
			overviewPanel.getDataSource().fieldDefs.each(function(fieldDef){
				if(valueExists(fieldDef.currency)){
					fieldDef.currency = displayCurrency.code;
				}
			});
			
			for (var i = 0; i < overviewPanel.fieldDefs.length; i++) {
				if (valueExists(overviewPanel.fieldDefs[i].currency) || overviewPanel.fieldDefs[i].id == 'ls.vf_net_income') {
					overviewPanel.fieldDefs[i].currency = displayCurrency.code;
					overviewPanel.config.fieldDefs[i].currency = displayCurrency.code;
				}
				
			}
			//set area conversion factor
			overviewPanel.addParameter("area_conversion_factor", controller.areaConvFact);
			
			var displayUnit = "";
			if(View.activityParameters["AbCommonResources-ConvertAreasLengthsToUserUnits"]==1){
				displayUnit = " " + View.user.areaUnits.title;
			}
			var columns = overviewPanel.columns;
			var fieldDefs = overviewPanel.fieldDefs;
			for(var index in columns){
				if(columns[index].id=="property.vf_area_bl_gross_int"){
					columns[index].name = getMessage("vf_area_bl_gross_int_title") + displayUnit;
				}
			}
			for(var index in fieldDefs){
				if(fieldDefs[index].id=="property.vf_area_bl_gross_int"){
					fieldDefs[index].title = getMessage("vf_area_bl_gross_int_title") + displayUnit;
				}
			}

			if(isSqlStringRestriction){
				overviewPanel.addParameter("filter_restriction", controller.restriction);
				overviewPanel.refresh();
			}else{
				overviewPanel.refresh(controller.restriction);
			}
			if (valueExistsNotEmpty(msgOverviewNote)){
				overviewPanel.setInstructions(msgOverviewNote);
			}
			
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * create paginated report from overview panel
 */
function onDocX(){
	var controller = View.controllers.get('abRepmPfadminPropFinanceSumCtrl');
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
		fileName: 'ab-repm-pfadmin-prop-finance-sum-rpt',
		callerView: 'ab-repm-pfadmin-prop-finance-sum.axvw',
		dataSource: 'abRepmPfadminPropFinanceSum_ds_grid',
		printableRestriction: controller.printableRestriction,
		files:[]
	};
	var consoleRestr = 	controller.restriction;
	var parameters = controller.parameters;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('property.pr_id', '', 'IS NOT NULL', ')AND(', false);
	var rptFileCfg = new RptFileConfig(
		'ab-repm-pfadmin-prop-finance-sum-details-rpt.axvw',
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
