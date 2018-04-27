var projStatProjsController = View.createController('projStatProjs',{	
	parameterList: new Array('approved', 'cancelled','issued','completed','closed'),
	consoleRestriction: " project.is_template = 0 ",
	statusRestriction: " project.status NOT IN ('Created','Approved-Cancelled') AND project.status NOT LIKE ('Requested%') ",
	fromDate:null,
	toDate:null,
	minDate:null,
	groupBy:'month',
	budgetFrom:'projects',
	
	afterViewLoad: function() {
		this.projStatProjs_budMnth.show(false);
    	this.projStatProjs_budQtr.show(false);
    	this.projStatProjs_budYr.show(false);
		for (i=0;i<this.parameterList.length;i++){
			var parameterName = this.parameterList[i];
			this.projStatProjs_summary.addParameter(parameterName, getMessage(parameterName + 'Summary'));
		}
	},
	
    afterInitialDataFetch: function(){  
    	this.projStatProjs_summary.actions.get('showMyProjs').show(true);
    	this.projStatProjs_summary.actions.get('showAllProjs').show(false);
    	
    	this.toDate = getToDate();
    	this.fromDate = getFromDate();
    	this.minDate = this.getIsoDateForRestriction('invoice.min_date', this.consoleRestriction + " AND " + this.statusRestriction);
    	this.refreshChartData(this.projStatProjs_budMnth, this.consoleRestriction + " AND " + this.statusRestriction, this.fromDate, this.toDate, this.minDate, this.groupBy);
    },
    
    refreshChartData : function(chart, consoleRestriction, fromDate, toDate, minDate, groupBy) {
    	this.projStatProjs_budMnth.show(false);
    	this.projStatProjs_budQtr.show(false);
    	this.projStatProjs_budYr.show(false);
		chart.addParameter("consoleRestriction", consoleRestriction);
		chart.addParameter("fromDate", fromDate);
		chart.addParameter("toDate", toDate);
		chart.addParameter("minDate", minDate);
		chart.addParameter("groupBy", groupBy);
		chart.addParameter("budgetFrom", 'projects');
		chart.refresh();
		chart.show(true);
	},
	
	getChart: function() {
		if (this.groupBy == 'year') return this.projStatProjs_budYr;
		else if (this.groupBy == 'quarter') return this.projStatProjs_budQtr;
		else return this.projStatProjs_budMnth;
	},
    
    projStatProjs_summary_afterRefresh: function() {
    	this.projStatProjs_projects.refresh();
    	this.refreshChartData(this.getChart(), this.statusRestriction + " AND " + this.consoleRestriction, this.fromDate, this.toDate, this.minDate, this.groupBy);
    },
    
    projStatProjs_summary_onShowMyProjs: function() {
    	var em_id = View.user.employee.id;
    	this.consoleRestriction = " project.is_template = 0 AND (EXISTS(SELECT 1 FROM projteam WHERE projteam.project_id = project.project_id AND projteam.member_id = '" + em_id + "') OR project.requestor = '" + em_id + "' OR project.dept_contact = '" + em_id + "' OR project.proj_mgr = '" + em_id + "') ";
    	this.statusRestriction = " project.status NOT IN ('Created','Approved-Cancelled') AND project.status NOT LIKE ('Requested%') "; // remove drill-down status selection
    	this.setProjectDatesForRestriction();

		this.projStatProjs_projects.addParameter('projectsRestriction', this.consoleRestriction);
		this.projStatProjs_projects.restriction = null; // remove drill-down status selection
		this.projStatProjs_projects.refresh();
    	this.projStatProjs_summary.addParameter('summRestriction', this.consoleRestriction);
    	this.projStatProjs_summary.refresh();
    	this.projStatProjs_summary.actions.get('showMyProjs').show(false);
    	this.projStatProjs_summary.actions.get('showAllProjs').show(true);
    },
    
    projStatProjs_summary_onShowAllProjs: function() {
    	this.consoleRestriction = " project.is_template = 0 ";
    	this.statusRestriction = " project.status NOT IN ('Created','Approved-Cancelled') AND project.status NOT LIKE ('Requested%') "; // remove drill-down status selection
    	this.setProjectDatesForRestriction();

		this.projStatProjs_projects.addParameter('projectsRestriction', this.consoleRestriction);
		this.projStatProjs_projects.restriction = null; // remove drill-down status selection
		this.projStatProjs_projects.refresh();
    	this.projStatProjs_summary.addParameter('summRestriction', this.consoleRestriction);
    	this.projStatProjs_summary.refresh();
    	this.projStatProjs_summary.actions.get('showMyProjs').show(true);
    	this.projStatProjs_summary.actions.get('showAllProjs').show(false);
    },
    
    /* adjust dates in chart to show data in restriction */
    setProjectDatesForRestriction: function() {
    	this.fromDate = this.getIsoDateForRestriction('invoice.min_date', this.consoleRestriction + " AND " + this.statusRestriction);
    	this.toDate = this.getIsoDateForRestriction('invoice.max_date', this.consoleRestriction + " AND " + this.statusRestriction);
    	
    	var fromDate = getDateObject(this.fromDate);
    	var toDate = getDateObject(this.toDate);
    	var datediff = (toDate - fromDate)/1000/60/60/24;
    	if (datediff > 365) this.groupBy = 'year'; 
    	else this.groupBy = 'month';
    	this.minDate = this.getIsoDateForRestriction('invoice.min_date', this.consoleRestriction + " AND " + this.statusRestriction);
    },
    
    openProjectDashboard: function(obj) {
    	var openerController = View.getOpenerView().controllers.get('projStat');
    	openerController.project_id = obj.restriction.clauses[0].value;
    	openerController.projStatTabs.showTab('projStatPkg', false);
    	openerController.projStatTabs.showTab('projStatDash', true);
    	openerController.projStatTabs.showTab('projStatTeam', true);
    	openerController.projStatTabs.showTab('projStatLogs', true);
    	openerController.projStatTabs.showTab('projStatDocs', true);
    	openerController.projStatTabs.setTabRestriction('projStatTeam', obj.restriction);
    	openerController.projStatTabs.setTabRestriction('projStatLogs', obj.restriction);
    	openerController.projStatTabs.setTabRestriction('projStatDocs', obj.restriction);
    	openerController.projStatTabs.selectTab('projStatDash', obj.restriction);
    },
    
    getIsoDateForRestriction : function(fieldName, restriction) {
		var date = new Date();
		var dateIso = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD");
		this.projStatProjs_dsMinMax.addParameter('consoleRestriction', restriction);
		var record = this.projStatProjs_dsMinMax.getRecord();
		var dateValue = record.getValue(fieldName);
		return valueExistsNotEmpty(dateValue)? FormattingDate(dateValue.getDate(), dateValue.getMonth() + 1, dateValue.getFullYear(), "YYYY-MM-DD") : dateIso;
	}
});

function showProjects(obj) {
	if (obj.restriction.clauses.length < 1) return;
	var value = obj.restriction.clauses[0].value;
	value = value.substring(0,2).trim();
	var restriction = "";
	switch(value)
	{
	case '1':
		restriction = " project.status IN ('Approved','Approved-In Design') ";
	  	break;
	case '2':
		restriction = " project.status IN ('Approved-Cancelled','Issued-Stopped') ";
		break;
	case '3':
		restriction = " project.status IN ('Issued-On Hold','Issued-In Process') ";
	  	break;
	case '4':
		restriction = " project.status LIKE 'Completed%' ";
	  	break;
	case '5':
		restriction = " project.status = 'Closed' ";
	  	break;
	}
	View.panels.get('projStatProjs_projects').refresh(restriction);
	var controller = View.controllers.get('projStatProjs');
	controller.statusRestriction = restriction + " AND project.status NOT IN ('Approved-Cancelled') ";
	controller.setProjectDatesForRestriction();
	controller.refreshChartData(controller.getChart(), controller.statusRestriction + " AND " + controller.consoleRestriction, controller.fromDate, controller.toDate, controller.minDate, controller.groupBy);
}

function getFromDate() {
	var oneYearAgo = new Date();
	oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);
	oneYearAgo.setDate(1);
	return FormattingDate(oneYearAgo.getDate(), oneYearAgo.getMonth() + 1, oneYearAgo.getFullYear(), "YYYY-MM-DD");
}

function getToDate() {
	var thisMonth = new Date();
	thisMonth.setMonth(thisMonth.getMonth() + 1);
	thisMonth.setDate(1);
	thisMonth.setDate(thisMonth.getDate() - 1);
	return FormattingDate(thisMonth.getDate(), thisMonth.getMonth() + 1, thisMonth.getFullYear(), "YYYY-MM-DD");
}

function openDetails(obj) {
	var controller = View.controllers.get('projStatProjs');	
	var parameters = {};
    parameters.dateRestriction = obj.restriction; 
    parameters.consoleRestriction = controller.consoleRestriction + " AND " + controller.statusRestriction;
    parameters.groupBy = controller.groupBy;
    parameters.toDate = controller.toDate;
	View.openDialog('ab-proj-stat-projs-bud-dtl.axvw', null, false, {
        width: 1200,
        height: 800,
        closeButton: true,
        drilldownParameters: parameters
    });
}

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0], tempArray[1]-1, tempArray[2]);
}
