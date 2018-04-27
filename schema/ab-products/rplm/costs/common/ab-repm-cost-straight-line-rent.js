var abStraightLineRentController = View.createController('abStraightLineRentController', {
	isGgroupByCostCategory: false,
	//time range limits
	timeRangeFrom: null,
	timeRangeTo: null,
	
	timeRangeSpan: null,
	
	timeRangeType: null,
	
	showCostsFor: null,
	
	showCostsFrom: ["cost_tran_recur"],
	
	showCostTypeOf: 'EXPENSE',
	
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
	
	// start /end dates 
	startDate: null,
	endDate: null,
	
	// geo fields selection
	ctryId: null,
	regnId: null,
	stateId: null,
	cityId: null,
	siteId: null,
	prId: null,
	blId: null,
	
	leaseCode: null,
	
	afterViewLoad: function(){
		// MC & VAT 
		if (View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"] == 1) {
			this.isMcAndVatEnabled = true;
			this.displayVAT.type = 'total';
			this.displayVAT.isHidden = false;
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = this.view.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';
        	this.abStraightLineRentFilter_form.displayVAT = this.displayVAT;
        	this.abStraightLineRentFilter_form.displayCurrency = this.displayCurrency;
		} else {
			this.isMcAndVatEnabled = false;
		}
		// set filter defaults
		this.timeRangeFrom = new Date().getFullYear();
		this.timeRangeTo = new Date().getFullYear();
		this.showCostsFor = "ls";
		this.showCostsFrom.push("cost_tran_recur");
		this.showCostTypeOf = "EXPENSE";
		this.timeRangeSpan = "MONTH";
		this.timeRangeType = "calendar";
		// populate time range limits dropdowns
		this.populateTimeRangeLimits();
		
	},
	
	afterInitialDataFetch: function(){
		this.setFilterValues();
		
	},
	
	/**
	 * onFilter event handler.
	 */
	abStraightLineRentFilter_form_onFilter: function(){
		this.isGgroupByCostCategory =  false;
		if (this.validateFilter()) {
			// read filter values
			this.readFilter();
			this.calculateDateRange();
			// prepare WFR parameters
			var multipleValueSeparator = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
			var geographicalParam = {
					"ctry_id" : (isArray(this.ctryId)? this.ctryId.join(multipleValueSeparator):this.ctryId),
					"regn_id" : (isArray(this.regnId)? this.regnId.join(multipleValueSeparator):this.regnId),
					"state_id" : (isArray(this.stateId)? this.stateId.join(multipleValueSeparator):this.stateId),
					"city_id" : (isArray(this.cityId)? this.cityId.join(multipleValueSeparator):this.cityId),
					"site_id" : (isArray(this.siteId)? this.siteId.join(multipleValueSeparator):this.siteId),
					"pr_id" : (isArray(this.prId)? this.prId.join(multipleValueSeparator):this.prId),
					"bl_id" : (isArray(this.blId)? this.blId.join(multipleValueSeparator):this.blId),
					"multipleValueSeparator": multipleValueSeparator
			};
			
			var reportParam = {
				"showCostFor": this.showCostsFor,
				"showCostFrom": this.showCostsFrom.join(multipleValueSeparator) + multipleValueSeparator,
				"showCostTypeOf": this.showCostTypeOf,
				"timeRangeType": this.timeRangeType,
				"timeRangeSpan": this.timeRangeSpan,
				"multipleValueSeparator": multipleValueSeparator
			};
			var multiCurrencyParam = {
				"vat": this.displayVAT.type,	
				"type": (this.displayCurrency.type == "budget"?this.displayCurrency.type:"payment"),
				"code": this.displayCurrency.code,
				"exchangeRateType": this.displayCurrency.exchangeRateType
			};
			var dataSource = this.abStraightLineRentFilter_ds;
			var dateStart = dataSource.formatValue('bl.date_bl', this.startDate, false);
			var dateEnd = dataSource.formatValue('bl.date_bl', this.endDate, false);
			var controller = this;
			// refresh report panel
			this.getReportDataSet(controller, controller.abStraightLineRentOverviewReport, dateStart, dateEnd, reportParam, geographicalParam, multiCurrencyParam, function(){
				var panelTitle = getMessage("report_title") + getVatTypeMessage(controller.displayVAT.type, controller.isMcAndVatEnabled);
				controller.abStraightLineRentOverviewReport.setTitle(panelTitle);
				
				// select first tab and disable the other two tabs
				controller.abStraightLineRentTabs.selectTab('abStraightLineRentOverviewTab');
				controller.abStraightLineRentTabs.enableTab('abStraightLineRentDetailsTab', false);
			});
		}
	},
	
	// refresh report
	getReportDataSet: function(controller, panel, dateStart, dateEnd, reportParam, geographicalParam, multiCurrencyParam, callback){
		try {
			/*
			* Job parameters: final Date dateFrom, final Date dateTo,
        	*			final Map<String, String> reportReqParam, final Map<String, String> geoReqParam,
        	*			final Map<String, String> currencyReqParam
			*/
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getStraightLineRentProjection', dateStart, dateEnd, reportParam, geographicalParam, multiCurrencyParam);
			View.openJobProgressBar(getMessage('jobStatusCalculating'), jobId, '', function(status) {
				panel.show();
				setCurrencyCodeForFields(panel, multiCurrencyParam['code']);
				controller.updateDataSetDimensions(status.dataSet, controller.isGgroupByCostCategory);
				controller.updateColumnHeadings(panel, status.dataSet);
				//controller.stripMinusSignFromValues(panel, status.dataSet, controller.showCostTypeOf);
				panel.setDataSet(status.dataSet);
				controller.getAssetKeyLocationFromProjectionType();
				controller.updateDimensionHeadings(panel, controller.showCostsFor, controller.timeRangeSpan, controller.showCostTypeOf, status.dataSet);
				controller.appendRollups(panel, controller.timeRangeSpan);
				controller.WF_result = status.dataSet;
				// if callback is defined 
				if (callback) {
					callback.call();
				}
		    });
			
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	// Show straight line rent details for lease
	showDetailsForLease: function(leaseCode){
		// send previous filter restriction, all filter changes are ignored when show details
		this.leaseCode = leaseCode;
		this.isGgroupByCostCategory =  true;
		// prepare WFR parameters
		var multipleValueSeparator = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
		var geographicalParam = {
				"ctry_id" : (isArray(this.ctryId)? this.ctryId.join(multipleValueSeparator):this.ctryId),
				"regn_id" : (isArray(this.regnId)? this.regnId.join(multipleValueSeparator):this.regnId),
				"state_id" : (isArray(this.stateId)? this.stateId.join(multipleValueSeparator):this.stateId),
				"city_id" : (isArray(this.cityId)? this.cityId.join(multipleValueSeparator):this.cityId),
				"site_id" : (isArray(this.siteId)? this.siteId.join(multipleValueSeparator):this.siteId),
				"pr_id" : (isArray(this.prId)? this.prId.join(multipleValueSeparator):this.prId),
				"bl_id" : (isArray(this.blId)? this.blId.join(multipleValueSeparator):this.blId),
				"multipleValueSeparator": multipleValueSeparator
		};
		
		var reportParam = {
			"showCostFor": this.showCostsFor,
			"showCostFrom": this.showCostsFrom.join(multipleValueSeparator) + multipleValueSeparator,
			"showCostTypeOf": this.showCostTypeOf,
			"timeRangeType": this.timeRangeType,
			"timeRangeSpan": this.timeRangeSpan,
			"multipleValueSeparator": multipleValueSeparator
		};
		var multiCurrencyParam = {
			"vat": this.displayVAT.type,	
			"type": (this.displayCurrency.type == "budget"?this.displayCurrency.type:"payment"),
			"code": this.displayCurrency.code,
			"exchangeRateType": this.displayCurrency.exchangeRateType
		};
		var dataSource = this.abStraightLineRentFilter_ds;
		var dateStart = dataSource.formatValue('bl.date_bl', this.startDate, false);
		var dateEnd = dataSource.formatValue('bl.date_bl', this.endDate, false);
		var controller = this;
		var panel = this.abStraightLineRentDetailsReport;
		
		try {
			panel.show(false);
			/*
			* Job parameters: final leaseCode, final Date dateFrom, final Date dateTo,
        	*			final Map<String, String> reportReqParam, final Map<String, String> geoReqParam,
        	*			final Map<String, String> currencyReqParam
			*/
			var jobId = Workflow.startJob('AbCommonResources-CostReportingService-getStraightLineRentDetailsProjection', this.leaseCode, dateStart, dateEnd, reportParam, geographicalParam, multiCurrencyParam);
			View.openJobProgressBar(getMessage('jobStatusCalculating'), jobId, '', function(status) {
				panel.show();
				setCurrencyCodeForFields(panel, multiCurrencyParam['code']);
				controller.updateDataSetDimensions(status.dataSet,  controller.isGgroupByCostCategory);
				controller.updateColumnHeadings(panel, status.dataSet);
				//controller.stripMinusSignFromValues(panel, status.dataSet, controller.showCostTypeOf);
				panel.setDataSet(status.dataSet);
				controller.getAssetKeyLocationFromProjectionType();
				controller.updateDimensionHeadings(panel, controller.showCostsFor, controller.timeRangeSpan, controller.showCostTypeOf, status.dataSet);
				//controller.appendRollups(panel, controller.timeRangeSpan);
				controller.WF_result = status.dataSet;
				
				// select first tab and disable the other two tabs
				controller.abStraightLineRentTabs.enableTab('abStraightLineRentDetailsTab', true);
				controller.abStraightLineRentTabs.selectTab('abStraightLineRentDetailsTab');
				
				panel.setTitle(getMessage("reportDetails_title").replace("{0}", getVatTypeMessage(controller.displayVAT.type, controller.isMcAndVatEnabled))+" "+ controller.leaseCode);
			});
			
		} catch (e) {
			Workflow.handleError(e);
		}

	},
	
	/**
	 * Validate filter selection
	 */
	validateFilter: function(){
		this.timeRangeFrom = $("selTimeRangeFrom").value;
		this.timeRangeTo = $("selTimeRangeTo").value;
		if (parseInt(this.timeRangeFrom) > parseInt(this.timeRangeTo)) {
			View.showMessage(getMessage("errInvalidTimeRange"));
			return false;
		}
//		this.showCostsFrom = getCheckBoxValues("chkShowCostsFrom");
//		if (this.showCostsFrom.length == 0) {
//			View.showMessage(getMessage("errNoValueShowCostFrom"));
//			return false;
//		}
		return true;
	},
	
	/**
	 * Read current filter settings.
	 */
	readFilter: function(){
		this.showCostsFor = "ls";//getRadioButtonValue("radShowCostFor");
		this.showCostsFrom = ["cost_tran_recur", "cost_tran_sched", "cost_tran"]; // getCheckBoxValues("chkShowCostsFrom");
		this.showCostTypeOf = "EXPENSE";//getRadioButtonValue("radShowCostTypeOf");
		
		this.timeRangeSpan = getRadioButtonValue("radTimeRangeSpan");
		this.timeRangeType = getRadioButtonValue("radTimeRangeType");
		this.timeRangeFrom = $("selTimeRangeFrom").value;
		this.timeRangeTo = $("selTimeRangeTo").value;
		
		this.ctryId = this.getFieldValue(this.abStraightLineRentFilter_form, "bl.ctry_id");
		this.regnId = this.getFieldValue(this.abStraightLineRentFilter_form, "bl.regn_id");
		this.stateId = this.getFieldValue(this.abStraightLineRentFilter_form, "bl.state_id");
		this.cityId = this.getFieldValue(this.abStraightLineRentFilter_form, "bl.city_id");
		this.siteId = this.getFieldValue(this.abStraightLineRentFilter_form, "bl.site_id");
		this.prId = this.getFieldValue(this.abStraightLineRentFilter_form, "bl.pr_id");
		this.blId = this.getFieldValue(this.abStraightLineRentFilter_form, "bl.bl_id");
		
		if (this.isMcAndVatEnabled) {
			this.displayVAT.type = this.abStraightLineRentFilter_form.displayVAT.type;
			this.displayCurrency.type = this.abStraightLineRentFilter_form.displayCurrency.type;
			this.displayCurrency.code = this.abStraightLineRentFilter_form.displayCurrency.code;
			this.displayCurrency.exchangeRateType = this.abStraightLineRentFilter_form.displayCurrency.exchangeRateType;
		}
		
	},
	/**
	 * Read filter standard fields.
	 */
	getFieldValue: function(console, field){
		var value = null;
		if (console.hasFieldMultipleValues(field)) {
			value = console.getFieldMultipleValues(field)
		} else {
			value = console.getFieldValue(field);
		}
		return value;
	},
	
	/**
	 * Calculate time range dates.
	 */
	calculateDateRange: function() {
		var noOfYears = parseInt(this.timeRangeTo) - parseInt(this.timeRangeFrom) + 1;
		var month = 0;
		var day = 1;
		if (this.timeRangeType == 'fiscal') {
			var dsAfmScmPref = this.view.dataSources.get("abAfmScmPref_ds"); 
			var record = dsAfmScmPref.getRecord();
			month = parseInt(record.getValue("afm_scmpref.fiscalyear_startmonth")) - 1;
			day = parseInt(record.getValue("afm_scmpref.fiscalyear_startday"));
		} 
		this.startDate = new Date(this.timeRangeFrom, month, day, 0, 0, 0, 0);
		// calculate end date minus one day 
		this.endDate = this.startDate.add(Date.YEAR, noOfYears).add(Date.DAY, -1);
	},
	
	/**
	 * onClear event handler.
	 */
	abStraightLineRentFilter_form_onClear: function(){
		this.abStraightLineRentFilter_form.clear();
		
		// set filter defaults
		this.timeRangeFrom = new Date().getFullYear();
		this.timeRangeTo = new Date().getFullYear();
		this.showCostsFor = "ls";
		this.showCostsFrom.push("cost_tran_recur");
		this.showCostTypeOf = "NETINCOME";
		this.timeRangeSpan = "MONTH";
		this.timeRangeType = "calendar";
		
		if (this.isMcAndVatEnabled) {
			this.displayVAT.type = 'total';
        	this.displayCurrency.type = 'user';
        	this.displayCurrency.code = this.view.user.userCurrency.code;
        	this.displayCurrency.exchangeRateType = 'Payment';
        	this.abStraightLineRentFilter_form.displayVAT = this.displayVAT;
        	this.abStraightLineRentFilter_form.displayCurrency = this.displayCurrency;
		}
		
		this.setFilterValues();
	},
	
	/**
	 * Filter values.
	 */
	setFilterValues: function(){
		this.setFieldValue("radShowCostFor", this.showCostsFor, true);
		this.setFieldValue("chkShowCostsFrom", this.showCostsFrom, true);
		this.setFieldValue("radShowCostTypeOf", this.showCostTypeOf, true);
		this.setFieldValue("radTimeRangeSpan", this.timeRangeSpan , true);
		this.setFieldValue("radTimeRangeType", this.timeRangeType, true);
		var objYearFrom = document.getElementById("selTimeRangeFrom");
		if (objYearFrom && objYearFrom.options.length > 0) {
			objYearFrom.value = this.timeRangeFrom;
		}
		var objYearTo = document.getElementById("selTimeRangeTo");
		if (objYearTo && objYearTo.options.length > 0) {
			objYearTo.value = this.timeRangeTo;
		}
		this.onChangeShowCostsFor(this.showCostsFor);
	},
	
	/**
	 * Set filter field value.
	 */
	setFieldValue: function(fieldId, value, custom){
		if (valueExistsNotEmpty(value)) {
			if (custom) {
				if (isArray(value)) {
					// is checkbox
					setCheckBoxValues(fieldId, value);
				}else{
					// is radio button
					setRadioButtonValue(fieldId, value);
				}
			} else {
				var strValue = '';
				if(isArray(value)){
					strValue = value.join(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
				}else if (valueExistsNotEmpty(value)){
					strValue = value;
				}
				this.abStraightLineRentFilter_form.setFieldValue(fieldId, strValue);
			}
		}
	},
	
	/**
	 * Populate time range select elements.
	 */
	populateTimeRangeLimits: function(){
		var afmYearDs = this.view.dataSources.get("abAfmCalDateYear_ds");
		var records = afmYearDs.getRecords();
		populateDropDown("selTimeRangeFrom", records, "afm_cal_dates.year", this.timeRangeFrom);
		populateDropDown("selTimeRangeTo", records, "afm_cal_dates.year", this.timeRangeTo);
	},
	
	/**
	 * On change ShowCostsFrom handler.
	 * Enable/disable console fields 
	 */
	onChangeShowCostsFor: function(value){
		this.abStraightLineRentFilter_form.enableField("bl.ctry_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.regn_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.state_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.city_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.site_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.pr_id", (value != "ac"));
		this.abStraightLineRentFilter_form.enableField("bl.bl_id", (value != "ac" && value != 'pr' && value != 'lsPr'));
		if (value == 'ac') {
			this.abStraightLineRentFilter_form.setFieldValue("bl.ctry_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.regn_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.state_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.city_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.site_id", "");
			this.abStraightLineRentFilter_form.setFieldValue("bl.pr_id", "");
		}
		if (value == "ac" || value == 'pr' || value == 'lsPr') {
			this.abStraightLineRentFilter_form.setFieldValue("bl.bl_id", "");
		}
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
					dataSet.rowValues[r].l = getMessage("cost_type_"+secondTitle);
				}
			}
		}
	},

	updateColumnHeadings: function(panel, dataSet) {
		switch (this.timeRangeSpan) {
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
		var dataSource = this.abStraightLineRentFilter_ds;
		var dateStart = dataSource.formatValue('bl.date_bl', this.startDate, false);
		var dateEnd = dataSource.formatValue('bl.date_bl', this.endDate, false);
		
		var quarters = getQuarters(dateStart, dateEnd);
		var month = null;
		var year = null;
		var regexMonth = /\d{2}/g;
		var regexYear = /\d{4}/;
		for (var c = 0; c < dataSet.columnValues.length; c++) {
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
    
    stripMinusSignFromValues: function(panel, dataSet, calculationType) {
		var regex = /-/g;
		var localizedAmount = null;
		var amount = null;
		
		if (calculationType != "EXPENSE") {
			return 0;
		}
		
		for (var c = 0; c < dataSet.records.length; c++) {
			var lsId = dataSet.records[c].values['cost_tran_recur.ls_id'];
			if (lsId.indexOf('|b_li_credit') == -1 && lsId.indexOf('|e_differential_rent') == -1 && lsId.indexOf('|f_differential_rent_cumul') == -1 ) {
				localizedAmount = dataSet.records[c].localizedValues['cost_tran_recur.amount_income'].replace(regex, '');
				dataSet.records[c].localizedValues['cost_tran_recur.amount_income'] = localizedAmount;
				amount = dataSet.records[c].values['cost_tran_recur.amount_income'].replace(regex, '');
				dataSet.records[c].values['cost_tran_recur.amount_income'] = amount;
			}
		}
    },
    
	getAssetKeyLocationFromProjectionType: function() {
		switch (this.showCostsFor) {
		case 'lsBl': 
			this.assetKeyLocation = 'ls_id';
			break;
		case 'lsPr': 
			this.assetKeyLocation = 'ls_id';
			break;
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
	
	
	updateDimensionHeadings: function(panel, projectionType, calculationPeriod, calculationType, dataSet) {
		
		if(panel.id == 'abStraightLineRentDetailsReport'){
			panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = '';
		}else if(panel.id == 'abStraightLineRentOverviewReport') {
			switch (projectionType) {
				case 'lsBl': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('leaseCode');
					break;
				case 'lsPr': 
					panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[0].innerHTML = getMessage('leaseCode');
					break;
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
			
			// remove link element from columns header
			for (var i = 0; i < dataSet.columnValues.length; i++) {
				panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[i+2].innerHTML = dataSet.columnValues[i].l;
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

		var measureTitle = getMessage('measure_sl_rent');
		if (panel.id == 'abStraightLineRentDetailsReport'){
			panel.parentElement.childNodes[0].firstChild.childNodes[1].childNodes[1].style.display = "none";
			measureTitle = "";
		}
		
		for (var i = 0; i < dataSet.rowValues.length; i++) {
			if (panel.id == 'abStraightLineRentDetailsReport') {
				panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].style.display = "none";
			}else{
				switch (calculationType) {
				case 'NETINCOME': 
					panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = measureTitle;
					break;
				case 'INCOME': 
					panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = measureTitle;
					break;
				case 'EXPENSE': 
					panel.parentElement.childNodes[0].firstChild.childNodes[i+2].childNodes[1].innerHTML = measureTitle;
					break;
				}
			}
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
			if(panel.id === 'reportCashFlow'){
				// prepare data set for chart
				var crtValue = costValues;
				var positiveValue = 0.0;
				var negativeValue = 0.0;
				if (crtValue >= 0.0){
					positiveValue = crtValue;
				}else{
					negativeValue = crtValue;
				}
				/*
				var crtRecord = {'cost_tran_recur.date_start': dateStartLabel,
						'cost_tran_recur.positive_amount_income': positiveValue,
						'cost_tran_recur.negative_amount_income': negativeValue
					};
				*/
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

    getCostValues: function(panel, dateStartRestriction, rowMap) {
		var dateStart = null;
		var assetKey = null;
		var costValues = 0.0;
		for (var r = 0, row; row = panel.dataSet.records[r]; r++) {
			dateStart = row.values['cost_tran_recur.date_start'];

			if (dateStartRestriction === dateStart) {
				if (rowMap != null) {
					assetKey = row.values['cost_tran_recur.'+this.assetKeyLocation];
					if (rowMap.contains(assetKey)) {
						costValues += parseFloat(row.values['cost_tran_recur.amount_income']);
					}
				}
				else {
					costValues += parseFloat(row.values['cost_tran_recur.amount_income']);
				}
			}
		}
		costValues = costValues.toFixed(2);
		return costValues;
	}
});

/**
 * On click handler
 * @param context
 */
function onClickOverview(context){
	var restriction = context.restriction;
	if (restriction) {
		var clause = restriction.findClause('cost_tran_recur.ls_id');
		var leaseCode = clause.value;
		var controller = View.controllers.get("abStraightLineRentController");
		controller.showDetailsForLease(leaseCode);
	}
}


/**
 * Set checkbox values.
 * @param elemName element NAME, must be the same for entire checkbox collection
 * @param values selected values
 */
function setCheckBoxValues(elemName, values){
	var elCollection = document.getElementsByName(elemName);
	for (var i = 0; i < elCollection.length; i++) {
		var objElem = elCollection[i];
		objElem.checked = (values.indexOf(objElem.value) != -1);
	}
}

/**
 * Get checkbox values.
 * @param elemName element NAME, must be the same for entire checkbox collection
 * @returns selected values
 */
function getCheckBoxValues(elemName){
	var values = [];
	var objElements = document.getElementsByName(elemName);
	for (var i = 0; i < objElements.length; i++) {
		var objElem = objElements[i];
		if (objElem.checked) {
			values.push(objElem.value);
		}
	}
	return values;
}

/**
 * Set radio button value.
 * @param elemId radio button name
 * @param value selected value
 */
function setRadioButtonValue(elemId, value){
	var objElem = document.getElementsByName(elemId);
	if (objElem) {
		for (var i = 0; i < objElem.length; i++) {
			if (objElem[i].value === value) {
				objElem[i].checked = true;
				break;
			}
		}
	}
}

/**
 * Get radio button selected value.
 * @param elemId element id
 * @returns selected value
 */
function getRadioButtonValue(elemId){
	var objElem = document.getElementsByName(elemId);
	var value = null;
	if (objElem) {
		for (var i = 0; i < objElem.length; i++) {
			if (objElem[i].checked) {
				value = objElem[i].value;
				break;
			}
		}
	}
	return value;
}

/**
 * Populate drop dopwn list from records collection.
 * @param elemId select element id
 * @param records  records collection
 * @param fieldId record field name
 * @param selectedValue selected value
 */
function populateDropDown(elemId, records, fieldId, selectedValue){
	var objSelectElem = document.getElementById(elemId);
	if (objSelectElem) {
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			var value = record.getValue(fieldId);
			var option = document.createElement("option");
			option.value = value;
			option.text = value;
			objSelectElem.options.add(option);
		}
		if (valueExistsNotEmpty(selectedValue)) {
			objSelectElem.value = selectedValue;
		}
	}
}

function isArray(object){
	if(object instanceof Array){
		return true;
	}
	
	if(typeof object !== 'object'){
		return false;
	}
	
	if(getObjectType(object) === "array"){
		return true;
	}
}

function getObjectType(obj){
	if (obj === null || typeof obj === 'undefined') {
        return String (obj);
    }
    return Object.prototype.toString.call(obj)
        .replace(/\[object ([a-zA-Z]+)\]/, '$1').toLowerCase();
}


/**
 * Set selected currency to datasource field definition.
 */
function setCurrencyCodeForFields(panel, currencyCode){
	var dataSource = panel.getDataSource();
	dataSource.fieldDefs.each(function(fieldDef){
		if(valueExists(fieldDef.currency)){
			fieldDef.currency = currencyCode;
		}
	});
}

function getQuarters(startDate, endDate){
	var result  = new Ext.util.MixedCollection();
	var regexMonth = /\d{2}/g;
	var startMonth = startDate.match(regexMonth)[2];
	var counter = parseInt(startMonth);
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 3; j++){
			result.add(counter, {quarter: i+1});
			counter = (counter + 1 == 13 ? 1: counter + 1);
		}
	}
	return result;
}

/**
 * Get cost type label.
 * 
 * @param vatType selected vat tpe
 * @param isMcAndVatEnabled
 * @returns {String}
 */
function getVatTypeMessage(vatType, isMcAndVatEnabled){
	if(isMcAndVatEnabled){
		return " - " + getMessage("vatType_"+ vatType);
	}else{
		return "";
	}
}

