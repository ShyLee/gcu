var controller = View.createController('calculateLeaseCosts', {

	regexYear: /\d{4}/,
	fromYear: null,
	toYear: null,
	projectionType: 'ls',
	calculationPeriod: 'YEAR',
	calculationType: 'INCOME',
	isFromRecurring: true,
	isFromScheduled: false,
	isFromActualCosts: false,
	ctry_id: null,
	regn_id: null,
	state_id: null,
	city_id: null,
	site_id: null,
	pr_id: null,
	bl_id: null,
	cost_cat_id_ex: '',
	cost_cat_id_sh: null,
	// VAT selection
	displayVAT: {
		type: '',
		isHidden: false
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
			this.isMcAndVatEnabled = true;
        	this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'budget';
        	this.displayCurrency.code = View.project.budgetCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Budget';
        	
        	this.console.displayVAT = this.displayVAT;
        	this.console.displayCurrency = this.displayCurrency;
        }
		
		setButtonLabels(new Array('addCostCategory', 'clearCostCategory'), new Array('add', 'clear'));

        var recs = View.dataSources.get("yearsDs").getRecords();
        var fromyear_select = $('console_ls.year');
        var toyear_select = $('console_ls.toyear');
        this.populateYearSelectLists(recs, fromyear_select, false);
        this.populateYearSelectLists(recs, toyear_select, true);
	},
    
	console_onFilter : function() {
	    this.initializingParameters();
		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';
		var objFilter =  this.console;
		if(valueExists(objFilter.displayVAT)){
			this.displayVAT = objFilter.displayVAT;
		}
		if(valueExists(objFilter.displayCurrency)){
			this.displayCurrency = objFilter.displayCurrency;
		}
		
		var currencyConf = {
				"vat": this.displayVAT.type,
				"type": this.displayCurrency.type,
				"code": this.displayCurrency.code,
				"rateType": this.displayCurrency.exchangeRateType
		};
		
			
		try {
			var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-calculateCashFlowProjection', 
					this.projectionType, 
					dateStart, 
					dateEnd, 
					this.calculationPeriod, 
					this.calculationType, 
					this.isFromActualCosts, 
					this.isFromScheduled, 
					this.isFromRecurring, 
					this.ctry_id, this.regn_id, this.state_id, this.city_id, this.site_id, 
					this.pr_id, this.bl_id, this.cost_cat_id_ex, this.cost_cat_id_sh, currencyConf);
			var controller = this;
		    View.openJobProgressBar(getMessage('searchMessage'), jobId, '', function(status) {
				controller.report.show();
				setCurrencyCodeForFields(controller.report, currencyConf['code']);
				controller.stripDaysFromColumnHeadings(controller.report, status.dataSet);
				controller.report.setDataSet(status.dataSet);
				controller.appendRollups(controller.report);
				controller.WF_result = status.dataSet;
				var panelTitle = getMessage("title_report") + getCostTypeMessage(controller.displayVAT.type, controller.isMcAndVatEnabled);
				controller.report.setTitle(panelTitle);
		    });
			
		} catch (e) {
  			Workflow.handleError(e);
		}
	},
	initializingParameters:function(){
        this.fromYear = $('console_ls.year').value;
        this.toYear = $('console_ls.toyear').value;

		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';

		this.ctry_id = toSQLRestrStringNULL(getConsoleFieldValue(this.console, 'bl.ctry_id'));
      	this.regn_id = toSQLRestrStringNULL(getConsoleFieldValue(this.console, 'bl.regn_id'));
      	this.state_id = toSQLRestrStringNULL(getConsoleFieldValue(this.console, 'bl.state_id'));
      	this.city_id = toSQLRestrStringNULL(getConsoleFieldValue(this.console, 'bl.city_id'));
      	this.site_id = toSQLRestrStringNULL(getConsoleFieldValue(this.console, 'bl.site_id'));
      	this.pr_id = toSQLRestrStringNULL(getConsoleFieldValue(this.console, 'ls.pr_id'));
      	this.bl_id = toSQLRestrStringNULL(getConsoleFieldValue(this.console, 'ls.bl_id'));
        
        var cost_cat_id_storage = trim($('cost_cat_id_storage').value);
		if (cost_cat_id_storage != "") {
			cost_cat_id_storage = "'"+cost_cat_id_storage+"'";
			var regex = /,/g;
			this.cost_cat_id_sh = cost_cat_id_storage.replace(regex, "','");
		}

	},
	//XXX: XLS report
	report_onReport : function() {
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
 	
		/* KB 3028838 Use the restriction from the last click on Show button
		 * this.initializingParameters();
		 */ 
		var dateStart = this.fromYear + '-01-01';
		var dateEnd = this.toYear + '-12-31';
		var isMonthFormat = false;
		var stripMinus = false;
		var currencyConf = {
				"vat": this.displayVAT.type,
				"type": this.displayCurrency.type,
				"code": this.displayCurrency.code,
				"rateType": this.displayCurrency.exchangeRateType
		};
		try {
			var jobId = Workflow.startJob('AbRPLMLeaseAdministration-calculateCashFlowProjection-calculateCashFlowProjectionXLSReport', 
					isMonthFormat,
					stripMinus,
					this.report.viewDef.viewName + '.axvw',
					this.report.title,
					this.report.groupByFields,
					this.report.calculatedFields,										
					this.projectionType, 
					dateStart, 
					dateEnd, 
					this.calculationPeriod, 
					this.calculationType, 
					this.isFromActualCosts, 
					this.isFromScheduled, 
					this.isFromRecurring, 
					this.ctry_id, this.regn_id, this.state_id, this.city_id, this.site_id, 
					this.pr_id, this.bl_id, this.cost_cat_id_ex, this.cost_cat_id_sh, currencyConf);
			
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
	console_onClear : function() {
		this.console.clear();
		$('cost_cat_id_storage').value = '';
		this.cost_cat_id_sh = '';
		var year_select = $('console_ls.year');
		var toyear_select = $('console_ls.toyear');
		var optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear())
        year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        year_select.value = this.getSystemYear();
        optionIndexCurrentYear = this.getOptionIndex(toyear_select, this.getSystemYear()+10)
        toyear_select.options[optionIndexCurrentYear].setAttribute('selected', true);
        toyear_select.value = this.getSystemYear()+10;
        resetMcAndVatVariables(this, this.console);
	},

	getConsoleRestriction: function() { 
		var restriction = "";
        var ctry_id = getConsoleFieldValue(this.console, 'bl.ctry_id');
        var regn_id = getConsoleFieldValue(this.console, 'bl.regn_id');
        var state_id = getConsoleFieldValue(this.console, 'bl.state_id');
        var city_id = getConsoleFieldValue(this.console, 'bl.city_id');
        var site_id = getConsoleFieldValue(this.console, 'bl.site_id');
        var pr_id = getConsoleFieldValue(this.console, 'ls.pr_id');
        var bl_id = getConsoleFieldValue(this.console, 'ls.bl_id');

    	if (valueExistsNotEmpty(ctry_id) || valueExistsNotEmpty(regn_id) || valueExistsNotEmpty(state_id)
    			|| valueExistsNotEmpty(city_id) || valueExistsNotEmpty(site_id)) {
        	if (valueExistsNotEmpty(ctry_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.ctry_id ELSE property.ctry_id END) in " + toSQLRestrString(ctry_id);
    		}
    		if (valueExistsNotEmpty(regn_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.regn_id ELSE property.regn_id END) in " + toSQLRestrString(regn_id);
    		}
    		if (valueExistsNotEmpty(state_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.state_id ELSE property.state_id END) in " + toSQLRestrString(state_id);
    		}
    		if (valueExistsNotEmpty(city_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.city_id ELSE property.city_id END) in " + toSQLRestrString(city_id);
    		}
    		if (valueExistsNotEmpty(site_id)) {
    			restriction += "AND (CASE WHEN ls.bl_id IS NOT NULL THEN bl.site_id ELSE property.site_id END) in " + toSQLRestrString(site_id);
    		}
    	}

    	if (valueExistsNotEmpty(pr_id)) {
			restriction += "AND ls.pr_id in " + toSQLRestrString(pr_id);
		}
    	if (valueExistsNotEmpty(bl_id)) {
			restriction += "AND ls.bl_id in " + toSQLRestrString(bl_id);
		}
        
        restriction += ") ";

		var cost_cat_id_storage = trim($('cost_cat_id_storage').value);
		if (cost_cat_id_storage != "") {
			var regex = /,/g;
			var cost_cat_id = cost_cat_id_storage.replace(regex, "','");
			restriction += "AND cost_cat_id IN ('" + cost_cat_id + "') ";
		}
		
		restriction += "AND cost_tran_recur.status_active = 1 ";
		// this part of the restriction is only for the details report
		restriction += "AND cost_tran_recur.amount_income IS NOT NULL ";
		restriction += "AND cost_tran_recur.amount_income > 0 ";

		return restriction;	
	},

	getSystemYear: function() { 
		var systemDate = new Date();
		var x = systemDate.getYear();
		systemYear = x % 100;
		systemYear += (systemYear < 38) ? 2000 : 1900;
		return systemYear;	
	},

	addCostCategory: function() {
		var title = getMessage('costCat');
		Ab.view.View.selectValue(
		        '', title, ['ls.cost_cat_id'], 'cost_cat', ['cost_cat.cost_cat_id'], ['cost_cat.cost_cat_id','cost_cat.cost_class_id'], null, 
		        function(fieldName, newValue, oldValue) {
		        	var calculateLeaseNetIncomeController = this.View.controllers.get('calculateLeaseCosts');
		        	calculateLeaseNetIncomeController.updateCostCatStorage(newValue);
	                return false;
	            }, false, false, '',null,null,null,null,"[{'fieldName': 'cost_cat.cost_cat_id', 'sortOrder': 1}]");
	},

	clearCostCategory: function() {
		$('cost_cat_id_storage').value = '';
		this.cost_cat_id_sh = '';
	},

	updateCostCatStorage: function(newCostCatId) {
		var cost_cat_id_storage = $('cost_cat_id_storage').value;
		if (cost_cat_id_storage == '') {
			cost_cat_id_storage += newCostCatId;
		}
		else {
			cost_cat_id_storage += ',' + newCostCatId;
		}
		$('cost_cat_id_storage').value = cost_cat_id_storage;
	},

	getCostValues: function(dateStartRestriction) {
		var dateStart = null;
		var costValues = 0.0;
		for (var r = 0, row; row = this.report.dataSet.records[r]; r++) {
			dateStart = row.values['cost_tran_recur.date_start'];
			if (dateStart == dateStartRestriction) {
				costValues += parseFloat(row.values['cost_tran_recur.amount_income']);
			}
		}
		costValues = costValues.toFixed(2);
		costValues = this.reportDs.formatValue('cost_tran_recur.amount_income', costValues, true);
		return costValues;
	},

	appendRollups: function(panel) {
		var parentElement = panel.parentElement.firstChild.lastChild;

		var rowCount = panel.dataSet.records.length;
		var rowElement = document.createElement('tr');
		rowElement.className = (rowCount % 2 == 0) ? 'dataRow' : 'dataRow odd' ;
		
		var cellElement = document.createElement('td');
		cellElement.className = 'text';
		cellElement.className = 'AbMdx_DimensionRowHeader';
		cellElement.appendChild(document.createTextNode(''));
        rowElement.appendChild(cellElement);
        
		cellElement = document.createElement('td');
		cellElement.className = 'AbMdx_DimensionRowHeader';
        cellElement.appendChild(document.createTextNode(getMessage('yearly_totals')));
        rowElement.appendChild(cellElement);

		var dateStart = null;
        var columnCount = panel.dataSet.columnValues.length;
		for (var c = 0; c < columnCount; c++) {
			cellElement = document.createElement('td');
			cellElement.className = 'AbMdx_MeasureCellData';
			cellElement.style.fontWeight = 'bold';
			dateStart = panel.dataSet.columnValues[c].n;
			var costValues = this.getCostValues(dateStart);
			cellElement.appendChild(document.createTextNode(costValues));
			rowElement.appendChild(cellElement);
		}
		
		parentElement.appendChild(rowElement);
	},

	stripDaysFromColumnHeadings: function(panel, dataSet) {
		var year = null;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
			year = dataSet.columnValues[c].n.match(this.regexYear)[0];
			dataSet.columnValues[c].l = year;
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
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear()+10);
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear()+10;
        }
        else {
        	optionIndexCurrentYear = this.getOptionIndex(year_select, this.getSystemYear());
        	year_select.options[optionIndexCurrentYear].setAttribute('selected', true);
            year_select.value = this.getSystemYear();
        }
        
    },
    
    getOptionIndex: function(select, value) {
		if(!select.options) return -1;
		for(var oNum = 0; oNum != select.options.length; oNum++) {
			if(select.options[oNum].value == value) return oNum;
		}
		return -1;
	}
});

function user_form_addCostCategory() {
	var controller = View.controllers.get('calculateLeaseCosts');
	controller.addCostCategory();
}

function user_form_clearCostCategory() {
	var controller = View.controllers.get('calculateLeaseCosts');
	controller.clearCostCategory();
}

function user_form_changeYear(amount, fieldId) {
	var controller = View.controllers.get('calculateLeaseCosts');
	controller.changeYear(amount, fieldId);
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
