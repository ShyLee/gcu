var projStatProjsBudConsoleController = View.createController('projStatProjsBudConsole',{	
	afterInitialDataFetch: function() {
		var currentYear = new Date().getFullYear();
		var year = currentYear - 10;
		if($('year')){
			for (var i = 0; i < 20 ;i++) {
				var option = new Option(year, year);
				$('year').options.add(option);
				year++;
			}
		}
		
		var openerController = View.getOpenerView().controllers.get('projStatProjs');
		this.projStatProjsBudConsole_console.setFieldValue('project.date_start', openerController.fromDate);
		this.projStatProjsBudConsole_console.setFieldValue('project.date_end', openerController.toDate);
		$('groupBy').value = openerController.groupBy;
	},
	
	projStatProjsBudConsole_console_onClear: function() {
		this.projStatProjsBudConsole_console.clear();
		$('groupBy').value = 'year';
		$('year').value = 'All';
	},
    
	projStatProjsBudConsole_console_onShow: function() {
		var openerController = View.getOpenerView().controllers.get('projStatProjs');
		var groupBy = $('groupBy').value;
		
		var fromDate = this.projStatProjsBudConsole_console.getFieldValue('project.date_start');
		var toDate = this.projStatProjsBudConsole_console.getFieldValue('project.date_end');
		var minDate = openerController.getIsoDateForRestriction('invoice.min_date', openerController.consoleRestriction + " AND " + openerController.statusRestriction);
		if (fromDate == "") {
			fromDate = minDate;
			this.projStatProjsBudConsole_console.setFieldValue('project.date_start', fromDate);
		}
		if (toDate == "") {
			toDate = openerController.getIsoDateForRestriction('invoice.max_date', openerController.consoleRestriction + " AND " + openerController.statusRestriction);
			this.projStatProjsBudConsole_console.setFieldValue('project.date_end', toDate);
		}
		
		openerController.groupBy = groupBy;
		openerController.fromDate = fromDate;
		openerController.toDate = toDate;
		openerController.minDate = minDate;
		openerController.refreshChartData(openerController.getChart(), openerController.consoleRestriction + " AND " + openerController.statusRestriction, fromDate, toDate, minDate, groupBy);
		View.closeThisDialog();
	}
});

function yearListener() {
	var controller = View.controllers.get('projStatProjsBudConsole');
	var year = $('year').value;
	if (year == 'All') {
		controller.projStatProjsBudConsole_console.setFieldValue('project.date_start', '');
		controller.projStatProjsBudConsole_console.setFieldValue('project.date_end', '');
	}
	else {
		controller.projStatProjsBudConsole_console.setFieldValue('project.date_start', year + '-01-01');
		controller.projStatProjsBudConsole_console.setFieldValue('project.date_end', year + '-12-31');
	}
	
}

function dateListener() {
	$('year').value = 'All';
}
