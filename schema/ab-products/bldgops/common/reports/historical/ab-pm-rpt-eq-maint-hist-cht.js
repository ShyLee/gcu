
var showChartController = View.createController('showChart', {
    afterViewLoad: function() {
	var openerController = View.getOpenerView().controllers.get('viewPMWorkHist');
	var panel1=this.totalCost_Pie_chart_by_eq;
	var panel2=this.totalCost_Pie_chartby_eqstd;
	var panel3=this.totalCost_Pie_chartby_problemType;
	var restriction= openerController.consoleParam;
	 if(openerController.dateStart!=''){
	 	restriction=restriction+" AND hwr.date_completed >= ${sql.date('"+openerController.dateStart+"')}";
	 }
	  if(openerController.dateEnd!=''){
	 	restriction=restriction+" AND hwr.date_completed <=${sql.date('"+openerController.dateEnd+"')}";
	 }
		panel1.addParameter('parentRestriction', restriction);
	    panel1.refresh();
		panel2.addParameter('parentRestriction', restriction);
	    panel2.refresh();
		panel3.addParameter('parentRestriction', restriction);
	    panel3.refresh();
		
    }
})

function showDetail(obj){
    var openerController = View.getOpenerView().controllers.get('viewPMWorkHist');
    var dateStart = openerController.dateStart;
    var dateEnd = openerController.dateEnd;
    var restriction = obj.restriction;
    if (dateStart) {
        restriction.addClause('hwr.date_completed', dateStart, '&gt;=');
    }
    if (dateEnd) {
        restriction.addClause('hwr.date_completed', dateEnd, '&lt;=');
    }
    var detailPanel = View.panels.get('eq_main_hwr_detail');
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}
