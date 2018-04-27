var controller = View.createController('calculateVatBal', {

	regexYear: /\d{4}/,
	fromYear: null,
	toYear: null,
	analyzeCostFor: null,
	fromDate: null,
	toDate: null,
	projectionType:null,
	calculationPeriod: null,
	calculationType: null,
	isFromRecurring: null,
	isFromScheduled: null,
	isFromActualCosts: null,
	groupByCostCategory: false,
	ctry_id: null,
	regn_id: null,
	state_id: null,
	city_id: null,
	site_id: null,
	pr_id: null,
	bl_id: null,
	cost_cat_id_ex: null,
	cost_cat_id_sh: null,
	WF_result: null,
	restriction:null,
	detailsRestriction: null,
	currentRowsForSummation: new Ext.util.MixedCollection(),
	summaryRowsAdded: 0,
	assetKeyLocation: null,
	excludeCostCat_title:'',
	showCostCat_title:'',
	m_costCat:'',
	rowRestriction:null,
	isActiveRecurringCost: 1,
	// chart variables
	chartDataAxisLabel: '',
	chartGoupingAxisLabel: '',
	chartData: [],
	
	// VAT selection
	displayVAT: {
		type: '',
		isHidden: true
	},
	
	// currency selection
	displayCurrency: {
		type: '',
		code: '',
		exchangeRateType: ''
	},
	
	isMcAndVatEnabled: false,
	
    afterViewLoad: function() {
        this.inherit();
		// initialize vat variables
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			// hide VAT button
			var action = this.console.actions.get("selectVAT");
			if(action){
				action.forceHidden(true);
			}

			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'vat';
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        	
        	this.console.displayVAT = this.displayVAT;
        	this.console.displayCurrency = this.displayCurrency;
        }else{
        	//disable console actions
        	this.console.actions.each(function(action) {
        	    action.enable(false);
        	}); 
        	//hide tabs
        	controller.tabsVatBal.showTab('tabVatBal', false);
        	controller.tabsVatBal.showTab('tabVatBalDetails', false);
        	//show message to inform that VAT&MC need to be enabled in order to use VAT Amount Balance view
        	View.showMessage(getMessage('error_mc_and_vat_disabled'));
        }
		this.setLabel();

        var recs = View.dataSources.get("dsYearsVatBal").getRecords();
        var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
        this.populateYearSelectLists(recs, fromyear_select, false);
        this.populateYearSelectLists(recs, toyear_select, true);
		// remove click event from second dimension header
		this.reportVatBal.getColumnHtml = getColumnHtmlWithoutClick;

    },
    
    setLabel: function(){
    	this.excludeCostCat_title = getMessage('exclude_cost_cat_of').replace('{0}', ' ');
    	this.showCostCat_title = getMessage('show_cost_cat_of').replace('{0}', ' ');
		
		setButtonLabels(new Array('addCostCategory_ex','clearCostCategory_ex'), new Array('add','clear'));
		setButtonLabels(new Array('addCostCategory_sh','clearCostCategory_sh'), new Array('add','clear'));

		$('exclude_cost_cat_of_label').innerHTML = '&#160;' + getMessage('exclude_cost_cat_of').replace('{0}', '<br/>');
		$('show_cost_cat_of_label').innerHTML = '&#160;' + getMessage('show_cost_cat_of').replace('{0}', '<br/>');
		this.console.setFieldLabel('analyze_costs_for', this.console.getFieldLabelElement('analyze_costs_for').innerHTML.replace('{0}', '<br/>'));
		this.console.setFieldLabel('from_year_to_year', this.console.getFieldLabelElement('from_year_to_year').innerHTML.replace('{0}', '<br/>'));
		
		// wrap the labels
		this.console.getFieldLabelElement('show_cost_associated_with').style.whiteSpace = 'normal';
		this.console.getFieldLabelElement('analyze_cost_from').style.whiteSpace = 'normal';
		this.console.getFieldLabelElement('show_cost_types_of').style.whiteSpace = 'normal';
		this.console.getFieldLabelElement('group_results_by').style.whiteSpace = 'normal';
    },
    
	console_onFilter : function() {
		var regex = /,/g;
		var recurrCostRestriction = this.getConsoleRestriction();
		var cost_radio = document.getElementsByName("costSource");
		
		this.restriction = recurrCostRestriction;
		this.groupByCostCategory = false;
		
		if(this.fromYear>this.toYear){
        	View.showMessage(getMessage('year_mess'));
       		return;
        }
       	if ( !cost_radio[0].checked && !cost_radio[1].checked && !cost_radio[2].checked){
        	View.showMessage(getMessage('cost_mess'));
       		return;
        	}
			
			
		var schedCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran_sched");
		var actualCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran");
		var dateStart = this.fromDate;
		var dateEnd = this.toDate;

		schedCostRestriction = schedCostRestriction.replace(/date_start/g,"date_trans_created");
		schedCostRestriction = schedCostRestriction.replace(/date_end/g,"date_due");
		actualCostRestriction = actualCostRestriction.replace(/date_start/g,"date_trans_created");
		actualCostRestriction = actualCostRestriction.replace(/date_end/g,"date_due");
		
		// we need to add active restriction for recurring costs
		if(this.isActiveRecurringCost != -1){
			recurrCostRestriction += " AND cost_tran_recur.status_active = " + this.isActiveRecurringCost;
		}
		
		var objFilter =  this.console;
		if(valueExists(objFilter.displayVAT)){
			this.displayVAT = objFilter.displayVAT;
		}
		if(valueExists(objFilter.displayCurrency)){
			this.displayCurrency = objFilter.displayCurrency;
		}

		var panel = this.reportVatBal;
		panel.show(false);
		// we must reset chart custom data
        this.chartData = [];
		
        
        
		this.calculateVatBal(this, panel, dateStart, dateEnd, recurrCostRestriction, schedCostRestriction, actualCostRestriction); 
		
		var panelTitle = getMessage("reportVatBal_title");
		panel.setTitle(panelTitle);
		
		// select first tab and disable the other two tabs
		controller.tabsVatBal.selectTab('tabVatBal');
		controller.tabsVatBal.enableTab('tabVatBalDetails', false);
		
	},
	
	calculateVatBal: function(controller, panel, dateStart, dateEnd, recurringCostRestriction, scheduledCostRestriction, actualCostRestriction){
		
		var currencyConf = {
				"vat": this.displayVAT.type,
				"type": this.displayCurrency.type,
				"code": this.displayCurrency.code,
				"rateType": this.displayCurrency.exchangeRateType
		};
		
		try {
			var jobId = Workflow.startJob('AbCommonResources-CostService-getCashFlowProjection', 
						controller.projectionType, dateStart, dateEnd, controller.calculationPeriod, controller.calculationType, controller.groupByCostCategory, 
						controller.isFromActualCosts, controller.isFromScheduled, controller.isFromRecurring, recurringCostRestriction, scheduledCostRestriction, actualCostRestriction, currencyConf);
		    View.openJobProgressBar(getMessage('searchMessage'), jobId, '', function(status) {
		    	
		    	if (valueExists(status.jobProperties.updateLegacyCosts) && status.jobProperties.updateLegacyCosts == "true") {
		    		View.showMessage(status.jobProperties.updateLegacyCostsMessage);
		    		return true;
		    	}

		    	panel.show();
				setCurrencyCodeForFields(panel, currencyConf['code']);
				controller.updateDataSetDimensions(status.dataSet, controller.groupByCostCategory);
				controller.updateColumnHeadings(panel, status.dataSet);
				controller.stripMinusSignFromValues(panel, status.dataSet, controller.calculationType);
				panel.setDataSet(status.dataSet);
				controller.getAssetKeyLocationFromProjectionType();
				controller.updateDimensionHeadings(panel, controller.projectionType, controller.calculationPeriod, controller.calculationType, status.dataSet);
				controller.appendRollups(panel, controller.calculationPeriod);
				controller.WF_result = status.dataSet;
		    });
			
		} catch (e) {
  			Workflow.handleError(e);
		}
		
	},

	//XXX: XLS report
	reportVatBal_onReport : function() {
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
 	
		var regex = /,/g;
		var recurrCostRestriction = this.getConsoleRestriction();
		var cost_radio = document.getElementsByName("costSource");
		
		this.restriction = recurrCostRestriction;
		this.groupByCostCategory = false;
		
		if(this.fromYear>this.toYear){
        	View.showMessage(getMessage('year_mess'));
       		return;
        }
       	if ( !cost_radio[0].checked && !cost_radio[1].checked && !cost_radio[2].checked){
        	View.showMessage(getMessage('cost_mess'));
       		return;
        	}
			
			
		var schedCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran_sched");
		var actualCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran");
		var dateStart = this.fromDate;
		var dateEnd = this.toDate;

		schedCostRestriction = schedCostRestriction.replace(/date_start/g,"date_trans_created");
		schedCostRestriction = schedCostRestriction.replace(/date_end/g,"date_due");
		actualCostRestriction = actualCostRestriction.replace(/date_start/g,"date_trans_created");
		actualCostRestriction = actualCostRestriction.replace(/date_end/g,"date_due");

		// we need to add active restriction for recurring costs
		if(this.isActiveRecurringCost != -1){
			recurrCostRestriction += " AND cost_tran_recur.status_active = " + this.isActiveRecurringCost;
		}

		var currencyConf = {
				"vat": this.displayVAT.type,
				"type": this.displayCurrency.type,
				"code": this.displayCurrency.code,
				"rateType": this.displayCurrency.exchangeRateType
		};
		
		try {

			var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-getCashFlowProjectionXLSReport', 
					this.reportVatBal.viewDef.viewName + '.axvw',
					this.reportVatBal.title,
					this.reportVatBal.groupByFields,
					this.reportVatBal.calculatedFields,										
					this.projectionType, dateStart, dateEnd, this.calculationPeriod, this.calculationType, this.groupByCostCategory, 
					this.isFromActualCosts, this.isFromScheduled, this.isFromRecurring, recurrCostRestriction, schedCostRestriction, actualCostRestriction, currencyConf);
			
			var jobStatus = Workflow.getJobStatus(jobId);
			//XXX: finished or failed
			while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
		    	jobStatus = Workflow.getJobStatus(jobId);
		    }

		    if (jobStatus.jobFinished) {
				var url  = jobStatus.jobFile.url;
				if (valueExistsNotEmpty(url)) {			
					window.location = url;
				}
		    }
		    View.closeProgressBar();
		} catch (e) {
			View.closeProgressBar();
  			Workflow.handleError(e);
		}

	},
	reportVatBalDetails_onReport : function() {
		if(this.rowRestriction){
			View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		 	
			var controller = View.controllers.get('calculateVatBal');
			controller.groupByCostCategory = true;
			var recurrCostRestriction = controller.restriction;
			recurrCostRestriction += "AND cost_tran_recur."+ controller.assetKeyLocation + " = '"+ this.rowRestriction.value  +"'";
			
			
			var schedCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran_sched");
			var actualCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran");
			var dateStart = controller.fromDate;
			var dateEnd = controller.toDate;

			schedCostRestriction = schedCostRestriction.replace(/date_start/g,"date_trans_created");
			schedCostRestriction = schedCostRestriction.replace(/date_end/g,"date_due");
			actualCostRestriction = actualCostRestriction.replace(/date_start/g,"date_trans_created");
			actualCostRestriction = actualCostRestriction.replace(/date_end/g,"date_due");

			// we need to add active restriction for recurring costs
			if(this.isActiveRecurringCost != -1){
				recurrCostRestriction += " AND cost_tran_recur.status_active = " + this.isActiveRecurringCost;
			}

			var currencyConf = {
					"vat": this.displayVAT.type,
					"type": this.displayCurrency.type,
					"code": this.displayCurrency.code,
					"rateType": this.displayCurrency.exchangeRateType
			};

			try {

				var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-getCashFlowProjectionXLSReport', 
						this.reportVatBal.viewDef.viewName + '.axvw',
						this.reportVatBal.title,
						this.reportVatBal.groupByFields,
						this.reportVatBal.calculatedFields,										
						this.projectionType, dateStart, dateEnd, this.calculationPeriod, this.calculationType, this.groupByCostCategory, 
						this.isFromActualCosts, this.isFromScheduled, this.isFromRecurring, recurrCostRestriction, schedCostRestriction, actualCostRestriction, currencyConf);
				
				var jobStatus = Workflow.getJobStatus(jobId);
				//XXX: finished or failed
				while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
			    	jobStatus = Workflow.getJobStatus(jobId);
			    }

			    if (jobStatus.jobFinished) {
					var url  = jobStatus.jobFile.url;
					if (valueExistsNotEmpty(url)) {			
						window.location = url;
					}
			    }
			    View.closeProgressBar();
			} catch (e) {
				View.closeProgressBar();
	  			Workflow.handleError(e);
			}
			
		}
	},
	getConsoleRestriction: function() { 
		var restriction = "";
		var costAsocWith= "";
		var projectionTypeRadioValue= "";
        var record = this.console.getRecord();
		var analyzeBy = {
			"pr": " cost_tran_recur.pr_id",
			"bl": " cost_tran_recur.bl_id",
			"ac": " cost_tran_recur.ac_id",
			"lsBl": " cost_tran_recur.ls_id",
			"lsProp": " cost_tran_recur.ls_id",
			"lsAll": " cost_tran_recur.ls_id"
		};
        //var analyzeBy = new Array(" cost_tran_recur.ls_id"," cost_tran_recur.ac_id"," cost_tran_recur.bl_id"," cost_tran_recur.pr_id");
        var radioAnalyzeCost = document.getElementsByName("costBy");
        var ctry_id = getConsoleFieldValue(this.console, "bl.ctry_id");
        var regn_id = getConsoleFieldValue(this.console, "bl.regn_id");
        var state_id = getConsoleFieldValue(this.console, "bl.state_id");
        var city_id = getConsoleFieldValue(this.console, "bl.city_id");
        var site_id = getConsoleFieldValue(this.console, "bl.site_id");
        var pr_id = getConsoleFieldValue(this.console, "property.pr_id");
        var bl_id = getConsoleFieldValue(this.console, "bl.bl_id");
        var blGeoRestriction="";
        var prGeoRestriction="";
        var bl_ls_JOIN="";
        var pr_ls_JOIN="";
        
        this.isFromRecurring = $('costSourceRecurring').checked;
        this.isFromScheduled = $('costSourceScheduled').checked;
        this.isFromActualCosts = $('costSourceActual').checked;
        
        var calculationTypeRadio = document.getElementsByName("calculationType");
        for(var i = 0; i < calculationTypeRadio.length; i++) {
        	if (calculationTypeRadio[i].checked) this.calculationType = calculationTypeRadio[i].value;
        }
        
        var calculationPeriodRadio = document.getElementsByName("calculationPeriod");
        for(var i = 0; i < calculationPeriodRadio.length; i++) {
        	if (calculationPeriodRadio[i].checked) this.calculationPeriod = calculationPeriodRadio[i].value;
        }

        var projectionTypeRadio = document.getElementsByName("projectionType");
        for(var i = 0; i < projectionTypeRadio.length; i++) {
        	if (projectionTypeRadio[i].checked){
        		projectionTypeRadioValue = projectionTypeRadio[i].value;
        		costAsocWith = analyzeBy[projectionTypeRadioValue];
        		restriction = " "+ costAsocWith+" IS NOT NULL ";
        		if(projectionTypeRadioValue == 'lsBl' || projectionTypeRadioValue == 'lsProp' || projectionTypeRadioValue == 'lsAll'){
        			this.projectionType = 'ls';
        		}else{
        			this.projectionType = projectionTypeRadioValue;
        		}
        	}
        }
		

        if ( (valueExistsNotEmpty(pr_id) || valueExistsNotEmpty(bl_id) || valueExistsNotEmpty(ctry_id) || valueExistsNotEmpty(regn_id) || valueExistsNotEmpty(state_id) || valueExistsNotEmpty(city_id) || valueExistsNotEmpty(site_id)) || costAsocWith != ' cost_tran_recur.ac_id' ) {
		
			switch (costAsocWith)
				{
					case ' cost_tran_recur.ls_id': 
							bl_ls_JOIN=" (SELECT ls.ls_id FROM ls,bl WHERE bl.bl_id=ls.bl_id AND ${sql.getVpaRestrictionForTable('bl')} ";
							pr_ls_JOIN="  SELECT ls.ls_id FROM ls,property WHERE property.pr_id=ls.pr_id AND ${sql.getVpaRestrictionForTable('property')} ";

							if (valueExistsNotEmpty(bl_id)) {
								blGeoRestriction = " AND bl.bl_id in " + toSQLRestrString(bl_id);
    						}  
    						if (valueExistsNotEmpty(pr_id)) {
								prGeoRestriction += " AND property.pr_id in " + toSQLRestrString(pr_id);
								blGeoRestriction += " AND bl.pr_id in " + toSQLRestrString(pr_id);
								}
							if (valueExistsNotEmpty(ctry_id)) {
								blGeoRestriction += " AND bl.ctry_id in " + toSQLRestrString(ctry_id);
								prGeoRestriction += " AND property.ctry_id in " + toSQLRestrString(ctry_id);
    						}
    						if (valueExistsNotEmpty(regn_id)) {
								blGeoRestriction += " AND bl.regn_id in " + toSQLRestrString(regn_id);
								prGeoRestriction += " AND property.regn_id in " + toSQLRestrString(regn_id);
    						}
    						if (valueExistsNotEmpty(state_id)) {
								blGeoRestriction += " AND bl.state_id in " + toSQLRestrString(state_id);
								prGeoRestriction += " AND property.state_id in " + toSQLRestrString(state_id);
    						}
    						if (valueExistsNotEmpty(city_id)) {
								blGeoRestriction += " AND bl.city_id in " + toSQLRestrString(city_id);
								prGeoRestriction += " AND property.city_id in " + toSQLRestrString(city_id);
    						}
    						if (valueExistsNotEmpty(site_id)) {
								blGeoRestriction += " AND bl.site_id in " + toSQLRestrString(site_id);
								prGeoRestriction += " AND property.site_id in " + toSQLRestrString(site_id);
    						}
    						restriction += " AND cost_tran_recur.ls_id IN ";
    						if(projectionTypeRadioValue == 'lsBl'){
    							restriction += bl_ls_JOIN + blGeoRestriction;	
    						}else if(projectionTypeRadioValue == 'lsProp'){
    							restriction += "( " + pr_ls_JOIN + prGeoRestriction;
    						}else{
    							restriction += bl_ls_JOIN + blGeoRestriction +" UNION "+ pr_ls_JOIN + prGeoRestriction;
    						}
    	   					restriction += ") ";
							break;
					case ' cost_tran_recur.bl_id': 
							restriction += " AND EXISTS(SELECT * FROM bl WHERE bl.bl_id=cost_tran_recur.bl_id AND ${sql.getVpaRestrictionForTable('bl')} ";

							if (valueExistsNotEmpty(ctry_id)) {
    							restriction += "AND bl.ctry_id in " + toSQLRestrString(ctry_id);
    						}
    						if (valueExistsNotEmpty(regn_id)) {
    							restriction += "AND bl.regn_id in " + toSQLRestrString(regn_id);
    						}
    						if (valueExistsNotEmpty(state_id)) {
    							restriction += "AND bl.state_id in " + toSQLRestrString(state_id);
    						}
    						if (valueExistsNotEmpty(city_id)) {
    							restriction += "AND bl.city_id in " + toSQLRestrString(city_id);
    						}
    						if (valueExistsNotEmpty(site_id)) {
    						restriction += "AND bl.site_id in " + toSQLRestrString(site_id);
    						}
    	   					if (valueExistsNotEmpty(bl_id)) {
								restriction += " AND bl.bl_id in " + toSQLRestrString(bl_id);
							}
							if (valueExistsNotEmpty(pr_id)) {
								restriction += " AND bl.pr_id in " + toSQLRestrString(pr_id);
							}
							restriction += ") ";
							break;
					case ' cost_tran_recur.pr_id': 
							restriction += " AND EXISTS(SELECT * FROM property WHERE property.pr_id=cost_tran_recur.pr_id AND ${sql.getVpaRestrictionForTable('property')} ";

							if (valueExistsNotEmpty(ctry_id)) {
    							restriction += "AND property.ctry_id in " + toSQLRestrString(ctry_id);
    						}
    						if (valueExistsNotEmpty(regn_id)) {
    							restriction += "AND property.regn_id in " + toSQLRestrString(regn_id);
    						}
    						if (valueExistsNotEmpty(state_id)) {
    							restriction += "AND property.state_id in " + toSQLRestrString(state_id);
    						}
    						if (valueExistsNotEmpty(city_id)) {
    							restriction += "AND property.city_id in " + toSQLRestrString(city_id);
    						}
    						if (valueExistsNotEmpty(site_id)) {
    							restriction += "AND property.site_id in " + toSQLRestrString(site_id);
    						}
					    	if (valueExistsNotEmpty(pr_id)) {
					    		restriction += " AND property.pr_id in " + toSQLRestrString(pr_id);
							}
							restriction += ") ";
							break;
				}

    	}
		var check_show_cat = document.getElementById("cost_cat_id_sh_check").checked;
		var check_exculde_cat = document.getElementById("cost_cat_id_ex_check").checked;
		var cost_cat_id_storage_ex = trim($('cost_cat_id_storage_ex').value);
		var cost_cat_id_storage_sh = trim($('cost_cat_id_storage_sh').value);

		if (cost_cat_id_storage_ex != "" && check_exculde_cat) {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage_ex.replace(regex, "','");
			restriction += "AND cost_tran_recur.cost_cat_id NOT IN ('" + cost_cat_id + "') ";
		}
		if (cost_cat_id_storage_sh != "" && check_show_cat) {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage_sh.replace(regex, "','");
			restriction += "AND cost_tran_recur.cost_cat_id IN ('" + cost_cat_id + "') ";
		}
		
		var objAnalyzeCostFor = document.getElementsByName("analyzeCostFor");
        for(var i = 0; i < objAnalyzeCostFor.length; i++) {
        	if (objAnalyzeCostFor[i].checked) this.analyzeCostFor = objAnalyzeCostFor[i].value;
        }
		this.fromYear = $('console_cost.year').value;
        this.toYear = $('console_cost.toyear').value;
		
		this.setStartEndDate();
		
		restriction += " AND NOT EXISTS(SELECT ls_id FROM ls WHERE ls.ls_id = cost_tran_recur.ls_id AND ls.use_as_template = 1)";
		
		return restriction;	
	},
	
	setStartEndDate: function(){
		if(this.analyzeCostFor === 'calendar'){
			this.fromDate = this.fromYear + '-01-01';
			this.toDate = this.toYear + '-12-31';
		}else if(this.analyzeCostFor === 'fiscal'){
			var fromFiscalYear = new Date();
			var toFiscalYear = new Date();
			fromFiscalYear.setYear(this.fromYear);
			toFiscalYear.setYear(this.toYear);
			
			var fiscalYearDay = 1;
			var fiscalYearMonth = 1;
			var params = {
				tableName: 'afm_scmpref',
				fieldNames: toJSON(['afm_scmpref.fiscalyear_startday', 'afm_scmpref.fiscalyear_startmonth', 'afm_scmpref.afm_scmpref']),
				restriction: toJSON({
					'afm_scmpref.afm_scmpref': 0
				})
			};
			try {
				var result = Workflow.call('AbCommonResources-getDataRecords', params);
				var record = result.dataSet.records[0];
				fiscalYearDay = record.getValue('afm_scmpref.fiscalyear_startday');
				fiscalYearMonth = record.getValue('afm_scmpref.fiscalyear_startmonth');
//				fromFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(fiscalYearDay));
//				toFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(fiscalYearDay));
				fromFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(1));
				toFiscalYear.setMonth(parseInt(fiscalYearMonth)-1, parseInt(1));
				toFiscalYear = toFiscalYear.add(Date.YEAR, 1);
				
				var ds = View.dataSources.get('dsConsoleVatBal');
				this.fromDate = ds.formatValue('bl.date_bl', fromFiscalYear, false);
				this.toDate = ds.formatValue('bl.date_bl', toFiscalYear, false);
				
			} catch (e) {
				Workflow.handleError(e);
			}
			
		}
	},
	
	console_onClear : function() {
		this.console.clear();
		document.getElementById('projectionTypeLs').checked = true;
		document.getElementById('costSourceRecurring').checked = true;
		document.getElementById('costSourceActual').checked = false;
		document.getElementById('costSourceScheduled').checked = false;
		document.getElementById('calculationTypeNetIncome').checked = true;
		document.getElementById('calculationPeriodMonth').checked = true;
		document.getElementById('cost_cat_id_ex_check').checked = false;
		document.getElementById('cost_cat_id_sh_check').checked = false;
		document.getElementById('analyzeCostForCalendar').checked = true;
		enableGeo();
		var fromyear_select = $('console_cost.year');
        var toyear_select = $('console_cost.toyear');
		var optionIndexCurrentYear = this.getOptionIndex(fromyear_select, this.getSystemYear())
        fromyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
		fromyear_select.value = this.getSystemYear();
        optionIndexCurrentYear = this.getOptionIndex(toyear_select, this.getSystemYear())
        toyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        toyear_select.value = this.getSystemYear();
        resetMcAndVatVariables(this, this.console);
	},

	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},

    /**
     * Sets multiple selected items in the grid from specified list of names.
     * @param {grid} Grid panel with multiple selection enabled.
     * @param {fieldName} Name of the field used in the list. 
     * @param {values} Comma-separated list of values.
     */
    setSelectedItems: function (grid, fieldName, values) {
        // prepare the values map for fast indexing
        var valuesMap = {};
        var valuesArray = values.split(',');
        for (var i = 0; i < valuesArray.length; i++) {
            var value = valuesArray[i];
            valuesMap[value] = value;
        }
        // select rows
        grid.gridRows.each(function(row) {
            var value = row.getRecord().getValue(fieldName);
            // if we have this value in the list, select the row
            if (valueExists(valuesMap[value])) {
                row.select();
            }
        });        
    },
	
	getSelectedItems: function(grid, fieldName) {
        var values = '';
        grid.gridRows.each(function(row) {
            if (row.isSelected()) {
                var value = row.getRecord().getValue(fieldName);
                if (values != '') {
                    values += ',';
                }
                values += value;
            }
        });        
        return values;
    },

    addCostCategory: function(costCat,title_label) {
        // select cost categories in the grid
		this.formSelectValueMultiple_grid.refresh();
		var values = $(costCat).value;
		this.m_costCat = costCat;
        this.setSelectedItems(this.formSelectValueMultiple_grid, 'cost_cat.cost_cat_id', values);
        this.formSelectValueMultiple_grid.setTitle(title_label);

        this.formSelectValueMultiple_grid.showInWindow({
            width: 600,
            height: 400
        });
    },
	
    formSelectValueMultiple_grid_onAddSelected: function() {
        // get selected cost categories from the grid
        var values = this.getSelectedItems(this.formSelectValueMultiple_grid, 'cost_cat.cost_cat_id');
        $(this.m_costCat).value = values;
        
        this.formSelectValueMultiple_grid.closeWindow();
    },


	clearCostCategory: function(costCat) {
		$(costCat).value = '';
	},

	updateCostCatStorage: function(newCostCatId, costCat) {
		var cost_cat_id_storage = $(costCat).value;
		if (cost_cat_id_storage == '') {
			cost_cat_id_storage += newCostCatId;
		}
		else {
			cost_cat_id_storage += ',' + newCostCatId;
		}
		$(costCat).value = cost_cat_id_storage;
	},

    getCostValues: function(panel, dateStartRestriction, rowMap, fieldName) {
    	if(!valueExistsNotEmpty(fieldName)){
    		fieldName = "amount_income";
    	}
		var dateStart = null;
		var assetKey = null;
		var costValues = 0.0;
		for (var r = 0, row; row = panel.dataSet.records[r]; r++) {
			dateStart = row.values['cost_tran_recur.date_start'];

			if (dateStartRestriction === dateStart) {
				if (rowMap != null) {
					assetKey = row.values['cost_tran_recur.'+this.assetKeyLocation];
					if (rowMap.contains(assetKey)) {
						costValues += parseFloat(row.values['cost_tran_recur.'+fieldName]);
					}
				}
				else {
					costValues += parseFloat(row.values['cost_tran_recur.'+fieldName]);
				}
			}
		}
		costValues = costValues.toFixed(2);
		return costValues;
	},
	
	getAssetKeyLocationFromProjectionType: function() {
		switch (this.projectionType) {
		case 'ls': 
			this.assetKeyLocation = 'ls_id';
			break;
		case 'bl': 
			this.assetKeyLocation = 'bl_id';
			break;
		case 'ac': 
			this.assetKeyLocation = 'ac_id';
			break;
		case 'pr': 
			this.assetKeyLocation = 'pr_id';
			break;
		}
	},
	
	appendRollups: function(panel, calculationPeriod) {
		var parentElement = panel.parentElement.firstChild.lastChild;

		var rowCount = panel.dataSet.records.length;
		var rowElement = document.createElement('tr');
		rowElement.className = (rowCount % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
		
		var cellElement = document.createElement('td');
		cellElement.className = 'text';
		cellElement.appendChild(document.createTextNode(''));
        rowElement.appendChild(cellElement);

		cellElement = document.createElement('td');
		cellElement.className = 'AbMdx_TotalCellHeader';
		
		switch (calculationPeriod) {
			case 'MONTH': 
			{
				cellElement.appendChild(document.createTextNode(getMessage('monthly_totals')));
				this.chartDataAxisLabel = getMessage('monthly_totals')
				this.chartGoupingAxisLabel = getMessage('calculationPeriod_month');
				break;
			}
			case 'QUARTER': 
			{
				cellElement.appendChild(document.createTextNode(getMessage('quarterly_totals')));
				this.chartDataAxisLabel = getMessage('quarterly_totals')
				this.chartGoupingAxisLabel = getMessage('calculationPeriod_quarter');
				break;
			}
			case 'YEAR': 
			{
				cellElement.appendChild(document.createTextNode(getMessage('yearly_totals')));
				this.chartDataAxisLabel = getMessage('yearly_totals')
				this.chartGoupingAxisLabel = getMessage('calculationPeriod_year');
				break;
			}
		}
        
        rowElement.appendChild(cellElement);
        var dateStart = null;
        var dateStartLabel = null;
        var ds = panel.getDataSource();
        var columnCount = panel.dataSet.columnValues.length;
		for (var c = 0; c < columnCount; c++) {
			cellElement = document.createElement('td');
			cellElement.className = 'AbMdx_SubTotalRowData';
			cellElement.style.fontWeight = 'bold';
			dateStart = panel.dataSet.columnValues[c].n;
			dateStartLabel = panel.dataSet.columnValues[c].l;
			
			var costValues = this.getCostValues(panel, dateStart, null);
			if(panel.id === 'reportVatBal'){
				// prepare data set for chart
				var crtValue = costValues;
				var crtRecord = {'cost_tran_recur.date_start': dateStartLabel,
						'cost_tran_recur.net_amount_income': crtValue
					};
				this.chartData.push(crtRecord);
			}
			costValues = ds.formatValue('cost_tran_recur.amount_income', costValues+ '', true);
			cellElement.appendChild(document.createTextNode(costValues));
			rowElement.appendChild(cellElement);
		}
		
		parentElement.appendChild(rowElement);
	},

	updateDimensionHeadings: function(panel, projectionType, calculationPeriod, calculationType, dataSet) {
		
		if(panel.id == 'reportVatBalDetails'){
			panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('CostCategory');
		}else if(panel.id == 'reportVatBal') {
			switch (projectionType) {
				case 'ls': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('leaseCode');
					break;
				case 'bl': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('buildingCode');
					break;
				case 'ac': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('accountCode');
					break;
				case 'pr': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('propertyCode');
					break;
				}
		}

		switch (calculationPeriod) {
			case 'MONTH': 
				panel.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_month');
				break;
			case 'QUARTER': 
				panel.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_quarter');
				break;
			case 'YEAR': 
				panel.parentElement.childNodes[0].firstChild.childNodes[0].childNodes[1].innerHTML = getMessage('calculationPeriod_year');
				break;
		}

		
		for (var i = 0; i < dataSet.rowValues.length; i++) {
			switch (calculationType) {
			case 'NETINCOME': 
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = getMessage('measure_netincome');
				break;
			case 'INCOME': 
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = getMessage('measure_income');
				break;
			case 'EXPENSE': 
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = getMessage('measure_expenses');
				break;
			}
			
		}
		
    },

	updateColumnHeadings: function(panel, dataSet) {
		switch (this.calculationPeriod) {
  			case 'MONTH': 
  				this.getMonthColumnHeadings(panel, dataSet);
  				break;
  			case 'QUARTER': 
  				this.getQuarterColumnHeadings(panel, dataSet);
  				break;
  			case 'YEAR': 
  				this.getYearColumnHeadings(panel, dataSet);
  				break;
  		}
    },

	getYearColumnHeadings: function(panel, dataSet) {
		var year = null;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			year = dataSet.columnValues[c].n.match(regexYear)[0];
			dataSet.columnValues[c].l = year;
		}
    },
    
	getQuarterColumnHeadings: function(panel, dataSet) {
		var quarters = getQuarters(this.fromDate, this.toDate);
		var month = null;
		var year = null;
		var regexMonth = /\d{2}/g;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			month = dataSet.columnValues[c].n.match(regexMonth)[2];
			month = dataSet.columnValues[c].n.match(regexMonth)[2];
			if (!valueExistsNotEmpty(year) || (c % 4 == 0)){
				year = dataSet.columnValues[c].n.match(regexYear)[0];
			}
			var quarter = getMessage('quarter' + quarters.get(parseInt(month)).quarter);

			dataSet.columnValues[c].l = quarter + '/' + year;
		}
    },
    
	getMonthColumnHeadings: function(panel, dataSet) {
		var month = null;
		var year = null;
		var regexMonth = /\d{2}/g;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			month = dataSet.columnValues[c].n.match(regexMonth)[2];
			year = dataSet.columnValues[c].n.match(regexYear)[0];
			dataSet.columnValues[c].l = month + '/' + year;
		}
    },

    populateYearSelectLists: function(recs, year_select, is_to_year) {
    	year_select.innerHTML = '';
        for (var i = 0; i < recs.length; i++) {
            var year = recs[i].values['afm_cal_dates.year'];
            
            var option = document.createElement('option');
            option.value = year;
            option.appendChild(document.createTextNode(year));
            year_select.appendChild(option);
        }
        var optionIndexCurrentYear = null;
        if (is_to_year) {
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear();
        }
        else {
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear();
        }
        
    },

    stripMinusSignFromValues: function(panel, dataSet, calculationType) {
		var regex = /-/g;
		var localizedAmount = null;
		var amount = null;
		
		if (calculationType != "EXPENSE") {
			return 0;
		}
		
		for (var c = 0; c < dataSet.records.length; c++) {
			localizedAmount = dataSet.records[c].localizedValues['cost_tran_recur.amount_income'].replace(regex, '');
			dataSet.records[c].localizedValues['cost_tran_recur.amount_income'] = localizedAmount;
			amount = dataSet.records[c].values['cost_tran_recur.amount_income'].replace(regex, '');
			dataSet.records[c].values['cost_tran_recur.amount_income'] = amount;
		}
    },
    
    getOptionIndex: function(select, value) {
		if(!select.options) return -1;
		for(var oNum = 0; oNum != select.options.length; oNum++) {
			if(select.options[oNum].value == value) return oNum;
		}
		return -1;
	},
	updateDataSetDimensions: function(dataSet, update){
		if(update){
			dataSet.type = "1d";
			for (var r = 0; r < dataSet.rowValues.length; r++) {
	            var rowTitle = dataSet.rowValues[r].l;
				var rowValue = dataSet.rowValues[r].n;
				var separatorIndex = rowTitle.indexOf('|');
				if (separatorIndex >= 0) {
				    var secondTitle	= rowTitle.slice(separatorIndex + 1);
					dataSet.rowValues[r].l = secondTitle;
				}
			}
		}
	},
	getAssetKeyLabel: function(projectionType){
		switch (projectionType) {
			case 'ls': 
				return getMessage('leaseCode');
			case 'bl': 
				return getMessage('buildingCode');
			case 'ac': 
				return getMessage('accountCode');
			case 'pr': 
				return getMessage('propertyCode');
			}
	},
	/*
	 * Open chart in pop-up
	 */
	reportVatBal_onChart: function(){
		var chartTitle = getMessage("chartTitle") + " " + getMessage("projectionType_"+this.projectionType);
		var curencyCode = this.isMcAndVatEnabled?this.displayCurrency.code:"";
		
		View.openDialog('ab-rplm-cost-mgmt-vat-bal-chart.axvw', null, false, {
			width: 800, 
		    height: 600, 
		    closeButton: true,
		    dataAxisLabel: this.chartDataAxisLabel,
		    groupingAxisLabel: this.chartGoupingAxisLabel,
		    dataSet: this.chartData,
		    panelTitle: chartTitle,
		    currencyCode: curencyCode
		});
		
	}
});

function user_addCostCategory_ex() {
	var controller = View.controllers.get('calculateVatBal');
	controller.addCostCategory('cost_cat_id_storage_ex',controller.excludeCostCat_title);
}

function user_addCostCategory_sh() {
	var controller = View.controllers.get('calculateVatBal');
	controller.addCostCategory('cost_cat_id_storage_sh',controller.showCostCat_title);
}

function user_clearCostCategory_ex() {
	var controller = View.controllers.get('calculateVatBal');
	controller.clearCostCategory('cost_cat_id_storage_ex');
}

function user_clearCostCategory_sh() {
	var controller = View.controllers.get('calculateVatBal');
	controller.clearCostCategory('cost_cat_id_storage_sh');
}

function changeYear(amount, fieldId) {
	var controller = View.controllers.get('calculateVatBal');
	controller.changeYear(amount, fieldId);
}
function disableGeo(){
	this.controller.console.setFieldValue('bl.ctry_id', '');
	this.controller.console.setFieldValue('bl.regn_id', '');
	this.controller.console.setFieldValue('bl.city_id', '');
	this.controller.console.setFieldValue('bl.state_id', '');
	this.controller.console.setFieldValue('bl.site_id', '');
	this.controller.console.setFieldValue('bl.bl_id', '');
	this.controller.console.setFieldValue('property.pr_id', '');
    this.controller.console.enableField('bl.ctry_id', false);
    this.controller.console.enableField('bl.regn_id', false);
    this.controller.console.enableField('bl.city_id', false);
    this.controller.console.enableField('bl.site_id', false);
    this.controller.console.enableField('bl.state_id', false);
    this.controller.console.enableField('bl.bl_id', false);
    this.controller.console.enableField('property.pr_id', false);
}
function enableGeo(){
    var radioProperty = document.getElementById("projectionTypeProperty");
    this.controller.console.enableField('bl.ctry_id', true);
    this.controller.console.enableField('bl.regn_id', true);
    this.controller.console.enableField('bl.city_id', true);
    this.controller.console.enableField('bl.site_id', true);
    this.controller.console.enableField('bl.state_id', true);
    this.controller.console.enableField('property.pr_id', true);
    if(radioProperty.checked){
    	this.controller.console.enableField('bl.bl_id', false);
		this.controller.console.setFieldValue('bl.bl_id', '');
    }else{
    	this.controller.console.enableField('bl.bl_id', true);
    }
}
function check_exclude(){
	if(document.getElementById("cost_cat_id_ex_check").checked){
		document.getElementById("cost_cat_id_sh_check").checked = false;
	}
}
function check_show(){
	if(document.getElementById("cost_cat_id_sh_check").checked){
		document.getElementById("cost_cat_id_ex_check").checked = false;
	}
}	

function onClickVatBal(event){
	var controller = View.controllers.get('calculateVatBal');
	controller.rowRestriction = event.restriction.findClause('cost_tran_recur.ls_id');
	if(controller.rowRestriction){
		controller.groupByCostCategory = true;
		var recurrCostRestriction = controller.restriction;
		recurrCostRestriction += "AND cost_tran_recur."+ controller.assetKeyLocation + " = '"+ controller.rowRestriction.value  +"'";
		
		controller.detailsRestriction = recurrCostRestriction;
		
		var schedCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran_sched");
		var actualCostRestriction = recurrCostRestriction.replace(/cost_tran_recur/g,"cost_tran");
		var dateStart = controller.fromDate;
		var dateEnd = controller.toDate;

		schedCostRestriction = schedCostRestriction.replace(/date_start/g,"date_trans_created");
		schedCostRestriction = schedCostRestriction.replace(/date_end/g,"date_due");
		actualCostRestriction = actualCostRestriction.replace(/date_start/g,"date_trans_created");
		actualCostRestriction = actualCostRestriction.replace(/date_end/g,"date_due");

		// we need to add active restriction for recurring costs
		if(controller.isActiveRecurringCost != -1){
			recurrCostRestriction += " AND cost_tran_recur.status_active = " + controller.isActiveRecurringCost;
		}

		var panel = View.panels.get('reportVatBalDetails');
		panel.show(false);
		controller.calculateVatBal(controller, panel, dateStart, dateEnd, recurrCostRestriction, schedCostRestriction, actualCostRestriction); 	
		// select first tab and disable the other two tabs
		controller.tabsVatBal.enableTab('tabVatBalDetails', true);
		controller.tabsVatBal.selectTab('tabVatBalDetails');
		
		panel.setTitle(getMessage("reportVatBalDetails_title")+" "+controller.getAssetKeyLabel(controller.projectionType)+": "+ controller.rowRestriction.value);
	}
}

function onClickVatBalDetails(event){
	var controller = View.controllers.get('calculateVatBal');
	var rowRestriction = controller.rowRestriction;
	var eventRestriction = event.restriction.findClause('cost_tran_recur.ls_id');
	if(rowRestriction && !eventRestriction){
		event.restriction.addClause('cost_tran_recur.ls_id', rowRestriction.value, '=');
	}
	
	View.openDialog('ab-rplm-cost-mgmt-vat-bal-details.axvw', null, true, {
            width: 1000,
            height: 400,
            closeButton: false,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('vatBalCtrlDetails');
                dialogController.setVatBalParameters( View.controllers.get('calculateVatBal').WF_result,
                										View.controllers.get('calculateVatBal').projectionType,
                										View.controllers.get('calculateVatBal').isFromRecurring,
                										View.controllers.get('calculateVatBal').isFromScheduled,
                										View.controllers.get('calculateVatBal').isFromActualCosts,event,
                										View.controllers.get('calculateVatBal').detailsRestriction,
                										View.controllers.get('calculateVatBal').calculationPeriod, 
                										View.controllers.get('calculateVatBal').isMcAndVatEnabled, 
                										View.controllers.get('calculateVatBal').displayVAT, 
                										View.controllers.get('calculateVatBal').displayCurrency);
            }});
	
}

function setButtonLabels(arrButtons, arrLabels){
	var maxLabelIndex = -1;
	var maxLabelLength = -1;
	var maxWidth = 0;
	for(var i=0; i < arrLabels.length; i++){
		var crtText = getMessage(arrLabels[i]);
		if(crtText.length > maxLabelLength){
			maxLabelLength = crtText.length;
			maxLabelIndex = i;
		}
	}
	// set label for maxLabelIndex
	var objButton = document.getElementById(arrButtons[maxLabelIndex]);
	objButton.value = getMessage(arrLabels[maxLabelIndex]);
	maxWidth = objButton.clientWidth;
	for(var i =0;i < arrButtons.length; i++){
		var crtObj = document.getElementById(arrButtons[i]);
		crtObj.value = getMessage(arrLabels[i]);
		crtObj.style.width = maxWidth+10;
	}
}

/**
 * Returns column cell HTML for specified column index and cell value without click event.
 * ONLY FOR reportVatBal tpo Remove Click event from second dimension header
 * @param {Object} c
 * @param {Object} cellValue
 */
function getColumnHtmlWithoutClick(c, cellValue){
	return this.getItemHtml(this.id + '_column_c' + c, cellValue, false);
}

