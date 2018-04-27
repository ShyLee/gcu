var projStatProjsBudDtlController = View.createController('projStatProjsBudDtl', {
	
	afterInitialDataFetch:function() {
		var dateRestriction = View.parameters.drilldownParameters.dateRestriction;
		var consoleRestriction = View.parameters.drilldownParameters.consoleRestriction;
		var groupBy = View.parameters.drilldownParameters.groupBy;
		var toDate = View.parameters.drilldownParameters.toDate;
		
		var dateValue = dateRestriction.clauses[0].value;
		var groupClause = "";
		switch (groupBy) {
			case "week": 
				groupClause = "${sql.yearWeekOf";
				break;
			case "quarter": 
				groupClause = "${sql.yearQuarterOf";
				break;
			case "month": 
				groupClause = "${sql.yearMonthOf";
				break;
			default: groupClause = "${sql.yearOf";
		}

		var invDateRestriction = groupClause + "(\'invoice.date_sent\')} = \'" + dateValue + "\' ";
		invDateRestriction += " AND date_sent <= ${sql.date(\'" + toDate + "\')} ";

		this.projStatProjsBudDtl_invoices.addParameter('invoicesRestriction', consoleRestriction);
		this.projStatProjsBudDtl_invoices.addParameter('invDateRestriction', invDateRestriction);
		this.projStatProjsBudDtl_invoices.refresh();
		this.projStatProjsBudDtl_invoices.show(true);

		var projDateRestriction = " (" + groupClause + "(\'project.date_start\')} <= \'" + dateValue + "\' AND " + groupClause + "(\'project.date_end\')} >= \'" + dateValue + "\') ";
		projDateRestriction += " AND date_start <= ${sql.date(\'" + toDate + "\')} ";
		
		this.projStatProjsBudDtl_projects.addParameter('projectsRestriction', consoleRestriction);
		this.projStatProjsBudDtl_projects.addParameter('projDateRestriction', projDateRestriction);
		this.projStatProjsBudDtl_projects.refresh();
		this.projStatProjsBudDtl_projects.show(true);
		
		if (this.projStatProjsBudDtl_projects.rows.length < 1) this.projStatProjsBudDtlTabs.selectTab('projStatProjsBudDtl_tabInv');
	}

});
