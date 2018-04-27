var gapMonthlyCtr = View.createController('gapMonthly', {

	afterInitialDataFetch: function() {
		setCurrentDate();
		addPeriod("YEAR",5,'allocGroupConsole','gp.date_start','gp.date_end');
		setPortfolioScenario();
		this.setParameters();
	},

	setParameters: function(){

		if (!checkChartConsoleFields()) {
			return;
		}

		var console = View.panels.get('allocGroupConsole');
		var date_start = console.getFieldValue('gp.date_start');
		var date_end = console.getFieldValue('gp.date_end');
		var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');
		var bl_id = console.getFieldValue('gp.bl_id');
		var site_id = console.getFieldValue('bl.site_id');

		var arrayDate = [];

		arrayDate = date_start.split("-");
		var monthStart = arrayDate[0] + '-' + arrayDate[1];

		arrayDate = date_end.split("-");
		var monthEnd = arrayDate[0] + '-' + arrayDate[1];

        this.chart.addParameter('monthStart', monthStart);
        this.chart.addParameter('monthEnd', monthEnd);
        this.chart.addParameter('portfolio_scenario_id', portfolio_scenario_id);

		if (bl_id != "") {
			blRest = "bl_id = '" + bl_id + "'";
		} else {
			blRest = "bl_id IS NOT NULL";
		}
		if (site_id != "") {
			blRest = blRest + " AND bl_id IN (SELECT bl_id FROM bl WHERE site_id='" + site_id + "')"
		}
		this.chart.addParameter("blRest", blRest);

		this.restoreSelection();
    },

	allocGroupConsole_onFilter : function() {
		this.setParameters();
	},
    
	restoreSelection: function(){
		var restArray = this.getConsoleRestriction();

		try {
			this.chart.refresh();
		} catch (e) {
			Workflow.handleError(e);
		}

		this.allocGroupConsole.setTitle(restArray["title"]);
	},

	getConsoleRestriction: function() {
		var restriction = "";
		var title = "";

		var console = View.panels.get('allocGroupConsole');
		var dateFrom = console.getFieldValue('gp.date_start');
		var dateTo = console.getFieldValue('gp.date_end');
		var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');
		var bl_id = console.getFieldValue('gp.bl_id');
		var site_id = console.getFieldValue('bl.site_id');

		if (site_id != "") {
			title = trim(title + " " + getMessage('siteTitle') + " " + site_id);
		}
		if (bl_id != "") {
			title = trim(title + " " + getMessage('blTitle') + " " + bl_id);
		}
		if (portfolio_scenario_id != "") {
			title = trim(title + " " + getMessage('portfolioScenarioTitle') + " " + portfolio_scenario_id);
		}
		if (dateFrom != "") {
			title = trim(title + " " + getMessage('fromDateTitle') + " " + dateFrom);
        }
		if (dateTo != "") {
			title = trim(title + " " + getMessage('toDateTitle') + " " + dateTo);
        }

		var restArray = new Array();
		restArray["restriction"]=restriction;
		restArray["title"]=title;
		return restArray;
	}
});