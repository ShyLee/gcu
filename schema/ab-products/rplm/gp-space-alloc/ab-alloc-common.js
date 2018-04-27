var allocCommonController = View.createController('allocCommon',{

	allocGroupConsole_onAddYear : function() {
		addPeriod("YEAR",1,'allocGroupConsole','gp.date_start','gp.date_start');
		localRestoreSelection();
	},

	allocGroupConsole_onSubtractYear : function() {
		addPeriod("YEAR",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		localRestoreSelection();
	},

	allocGroupConsole_onAddMonth : function() {
		addPeriod("MONTH",1,'allocGroupConsole','gp.date_start','gp.date_start');
		localRestoreSelection();
	},

	allocGroupConsole_onSubtractMonth : function() {
		addPeriod("MONTH",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		localRestoreSelection();
	},

	chartPanel_onAddYear : function() {
		addPeriod("YEAR",1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocStackController.restoreSelection();
	},

	chartPanel_onSubtractYear : function() {
		addPeriod("YEAR",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocStackController.restoreSelection();
	},

	chartPanel_onAddMonth : function() {
		addPeriod("MONTH",1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocStackController.restoreSelection();
	},

	chartPanel_onSubtractMonth : function() {
		addPeriod("MONTH",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocStackController.restoreSelection();
	},

	dvCostPieChart_onAddYear : function() {
		addPeriod("YEAR",1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocCostPieController.restoreSelection();
	},

	dvCostPieChart_onSubtractYear : function() {
		addPeriod("YEAR",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocCostPieController.restoreSelection();
	},

	dvCostPieChart_onAddMonth : function() {
		addPeriod("MONTH",1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocCostPieController.restoreSelection();
	},

	dvCostPieChart_onSubtractMonth : function() {
		addPeriod("MONTH",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocCostPieController.restoreSelection();
	},

	dpAnalysis_onAddYear : function() {
		addPeriod("YEAR",1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocDpDvController.restoreSelection();
	},

	dpAnalysis_onSubtractYear : function() {
		addPeriod("YEAR",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocDpDvController.restoreSelection();
	},

	dpAnalysis_onAddMonth : function() {
		addPeriod("MONTH",1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocDpDvController.restoreSelection();
	},

	dpAnalysis_onSubtractMonth : function() {
		addPeriod("MONTH",-1,'allocGroupConsole','gp.date_start','gp.date_start');
		allocDpDvController.restoreSelection();
	},

	allocCostConsole_onAddYear : function() {
		addPeriod("YEAR",1,'allocCostConsole','cost_tran_recur.date_start','cost_tran_recur.date_start');
		allocListCostController.restoreSelection();
	},

	allocCostConsole_onSubtractYear : function() {
		addPeriod("YEAR",-1,'allocCostConsole','cost_tran_recur.date_start','cost_tran_recur.date_start');
		allocListCostController.restoreSelection();
	},

	allocCostConsole_onAddMonth : function() {
		addPeriod("MONTH",1,'allocCostConsole','cost_tran_recur.date_start','cost_tran_recur.date_start');
		allocListCostController.restoreSelection();
	},

	allocCostConsole_onSubtractMonth : function() {
		addPeriod("MONTH",-1,'allocCostConsole','cost_tran_recur.date_start','cost_tran_recur.date_start');
		allocListCostController.restoreSelection();
	},

	recalculateCostsSingle: function() {
		var reviewDate = this.allocGroupConsole.getFieldValue('gp.date_start');

		if ((reviewDate!="") && (document.getElementById("autoCalculateCosts").checked)) {
			calculateCostsSingle(this.tabs.wizard.getBl());
		}
	},

	recalculateCostsAll: function() {
		var reviewDate = this.allocGroupConsole.getFieldValue('gp.date_start');

		if ((reviewDate!="") && (document.getElementById("autoCalculateCosts").checked)) {
			calculateCostsAll();
		}
	},

	getConsoleRestriction: function() {
		var restriction = "";
		var title = "";

		var bl_id = this.tabs.wizard.getBl();
		var fl_id = this.tabs.wizard.getFl();
		var dateReport = this.allocGroupConsole.getFieldValue('gp.date_start');
		var portfolio_scenario_id = this.allocGroupConsole.getFieldValue('gp.portfolio_scenario_id');

		if (bl_id != "") {
			title = trim(title + " " + getMessage('buildingTitle') + " " + bl_id);
			restriction = addRestriction(restriction," gp.bl_id ='" + bl_id + "'");
		}
		if (fl_id != "") {
			title = trim(title + " " + getMessage('floorTitle') + " " + fl_id);
			restriction = addRestriction(restriction," gp.fl_id ='" + fl_id + "'");
		}
		if (portfolio_scenario_id != "") {
			title = trim(title + " " + getMessage('portfolioScenarioTitle') + " " + portfolio_scenario_id);
			restriction = addRestriction(restriction," gp.portfolio_scenario_id ='" + portfolio_scenario_id + "'");
		}
		if (dateReport != "") {
			title = trim(title + " " + getMessage('reviewDateTitle') + " " + dateReport);
			restriction=addRestriction(restriction,getDateRestriction(dateReport));
        }

		var restArray = new Array();
		restArray["restriction"]=restriction;
		restArray["title"]=title;
		return restArray;
	}
});

// Initiated from clicking in the Department Analysis report

function onClickBuDvDpEvent(obj){
    var groupGrid = View.panels.get('gpGrid');

    if (obj.restriction.clauses.length > 0) {
        groupGrid.addParameter('BuDvDp', "='" + obj.restriction.clauses[0].value + "'");
    }
    else {
        groupGrid.addParameter('BuDvDp', "is not null");
    }

	// Get the restriction that applies to the view.
	var restArray = allocDpDvController.getConsoleRestriction();
    
	groupGrid.refresh(restArray["restriction"]);

    groupGrid.show(true);

    groupGrid.showInWindow({
        width: 600,
        height: 400
    });
}

// Function to calculate costs for all buildings based on a date and a portfolio scenario

function calculateCostsAll() {

	if (!checkConsoleFields()) {
		return;
	}

	var console = View.panels.get('allocGroupConsole');
	var date_report = console.getFieldValue('gp.date_start');
	var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');
	var bl_id = console.getFieldValue('gp.bl_id');
	var site_id = console.getFieldValue('gp.site_id');

	if (bl_id != "") {
		calculateCostsSingle(bl_id);
		return;
	}

	View.openProgressBar("Updating...");

	try {
		var result =  Workflow.callMethod(
			'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-updateGroupAllocationCostsAll',date_report,portfolio_scenario_id,site_id);
		View.closeProgressBar();

    } catch (e) {
		View.closeProgressBar();
		Workflow.handleError(e);
	}
}

// Function to calculate costs on a single building

function calculateCostsSingle(bl_id) {

	if (bl_id == '') {
		View.showMessage(getMessage('error_bl_id'));
		return;
	}

	var console = View.panels.get('allocGroupConsole');
	var date_report = console.getFieldValue('gp.date_start');
	var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');

	if (date_report == '') {
		View.showMessage(getMessage('error_date_report'));
		return;
	}

	if (portfolio_scenario_id == '') {
		View.showMessage(getMessage('error_portfolio_scenario_id'));
		return;
	}

	var arrayDate = [];
	arrayDate = date_report.split("-");
	var year = arrayDate[0];

	var dateStart = year + '-01-01';
	var dateEnd = year + '-12-31';

	var projectionType = 'bl';
	var calculationPeriod = 'YEAR';
	var calculationType = 'EXPENSE';
	var isFromRecurring = true;
	var isFromScheduled = false;
	var isFromActualCosts = false;
	var recurringCostRestriction = "bl_id = '" + bl_id + "'";
	var scheduledCostRestriction = '';
	var actualCostsRestriction = '';
	
	View.openProgressBar("Updating...");

	try {
		var result = Workflow.callMethod('AbCommonResources-CostService-getCashFlowProjection',
			projectionType, dateStart, dateEnd, calculationPeriod, calculationType,
			false, isFromActualCosts, isFromScheduled, isFromRecurring,
			recurringCostRestriction, scheduledCostRestriction, actualCostsRestriction, {});

	} catch (e) {

		Workflow.handleError(e);
		return;
	}
	
	if (result.dataSet.records.length == 0) {

		View.closeProgressBar();
		View.showMessage(getMessage('noRecurringCosts'));
		return;

	}

	var bl_annual_cost = - result.dataSet.records[0].values['cost_tran_recur.amount_income'];

	try {
		var result =  Workflow.callMethod(
			'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-updateGroupAllocationCosts',bl_id,date_report,portfolio_scenario_id,bl_annual_cost);
		View.closeProgressBar();
		
	} catch (e) {
		View.closeProgressBar();
		Workflow.handleError(e);
	}
}

// Function to set the current date on the allocGroupConsole

function setCurrentDate () {
	var console = View.panels.get('allocGroupConsole');
	var record = console.getRecord();

	if (console.getFieldValue('gp.date_start') == '') {
		record.setValue('gp.date_start', new Date());
		console.onModelUpdate();
	}
}

// Function to set the default scenario on the allocGroupConsole to Baseline

function setPortfolioScenario () {
	var console = View.panels.get('allocGroupConsole');
	var record = console.getRecord();
	var portfolio_scenario_id = record.getValue('gp.portfolio_scenario_id');
	if (console.getFieldValue('gp.portfolio_scenario_id') == '') {
		record.setValue('gp.portfolio_scenario_id', "Baseline");
		console.onModelUpdate();
	}
}

// Function to set the restriction for the start and end dates

function getDateRestriction (dateReport){
	var restriction = " gp.date_start <= #Date%" + dateReport +  "% AND gp.date_end >= #Date%" +  dateReport + "%";
	return restriction;
}

// Function to add a certain period to a date field in the allocGroupConsole

function addPeriod (periodType,num,consoleName,dateToAddField,dateToUpdateField) {
	var console = View.panels.get(consoleName);
	var record = console.getRecord();

	var date_start = record.getValue(dateToAddField);

	if (console.getFieldValue(dateToAddField) != '') {

		if (periodType == "MONTH") {
			date_start = date_start.add(Date.MONTH, num);
		} else if (periodType == "YEAR") {
			date_start = date_start.add(Date.YEAR, num);
		}

		record.setValue(dateToUpdateField, date_start);

		console.onModelUpdate();
	}
}

// Function to check if the date and portfolio scenario are filled in

function checkConsoleFields() {
	var console = View.panels.get('allocGroupConsole');
	var date_report = console.getFieldValue('gp.date_start');
	var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');

	if (date_report == "") {
		View.showMessage(getMessage('error_date_report'));
		return false;
	}

	if (portfolio_scenario_id == "") {
		View.showMessage(getMessage('error_portfolio_scenario_id'));
		return false;
	}

	return true;
}

// Function to check if the date and portfolio scenario are filled in

function checkChartConsoleFields() {
	var console = View.panels.get('allocGroupConsole');
	var date_start = console.getFieldValue('gp.date_start');
	var date_end = console.getFieldValue('gp.date_end');
	var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');

	if (date_start == "") {
		View.showMessage(getMessage('error_from_date'));
		return false;
	}
	if (date_end == "") {
		View.showMessage(getMessage('error_to_date'));
		return false;
	}
	if (portfolio_scenario_id == "") {
		View.showMessage(getMessage('error_portfolio_scenario_id'));
		return false;
	}

	return true;
}

function addRestriction(restriction,restPart) {
	if (restriction != "") {
		restriction = restriction + " AND " + restPart;
	} else {
		restriction = restPart;
	}
	return restriction;
}


function asFloat(s) {
	var val = parseFloat(String(s).replace(/,/g, ""));
	if(isNaN(val)) val = 0;
	return val;
}


function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

