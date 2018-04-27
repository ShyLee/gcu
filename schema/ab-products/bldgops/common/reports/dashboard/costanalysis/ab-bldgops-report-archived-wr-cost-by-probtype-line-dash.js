var abBldgopsReportArchivedWrCostByProbtypeDashController = View.createController('abBldgopsReportArchivedWrCostByProbtypeDashController', {
	otherRes: null,
	dateStart:"2002-01-01",
	dateEnd:"2010-01-01",
	tabGroup:2,
	afterViewLoad: function() {
		//Register current controller to top-level view's controller
		var parentDashController = getDashMainController("dashCostAnalysisMainController");
		if(!parentDashController){
			this.abBldgopsReportArchivedWrCostByProbtypeLineChart.show(false);			
		}
		else if (!parentDashController.getSubControllerById(this.id)){
			parentDashController.registerSubViewController(this);
			if(parentDashController.selTab==2){
				this.refreshChart(null);
			}
			else {
				this.abBldgopsReportArchivedWrCostByProbtypeLineChart.show(false);
			}
		}
		else{
			this.refreshChartPanel();
		}
    },

	refreshChart: function(res){
		this.setLocalSqlParameters(res); 
		this.refreshChartPanel(); 
	},

	refreshChartPanel: function(){
		var panel=this.abBldgopsReportArchivedWrCostByProbtypeLineChart;
		var c = this;

		if(!this.otherRes){
			c = getDashMainController("dashCostAnalysisMainController").getSubControllerById(this.id);
		}
		panel.addParameter('monthStart',c.dateStart);
		panel.addParameter('monthEnd', c.dateEnd);
		panel.addParameter('parentRestriction', c.otherRes);
		panel.refresh();
		panel.show(true);
	},
	
	setLocalSqlParameters: function(res){
		var topLevelController = getDashMainController("dashCostAnalysisMainController");
		var restriction=topLevelController.treeRes.replace(/rm./g, "wrhwr.");
		if(res){
			restriction = restriction + res;
		}
		if(topLevelController.eqStd){
			restriction = restriction + " AND "+ getMultiSelectFieldRestriction(['eq.eq_std'], topLevelController.eqStd);
		}

		if(topLevelController.probType){
			restriction +=" AND wrhwr.prob_type like '%"+ topLevelController.probType +"%' ";
		}
		this.dateStart = topLevelController.dateStart;
		this.dateEnd = topLevelController.dateEnd;

		this.otherRes = restriction;
	}
})

function onCostByProbTypeLineClick(obj){
	var res= " wrhwr.status IN ('Com','Clo')  ";

	var month = obj.selectedChartData['wrhwr.month'];
	res += " AND ${sql.yearMonthOf('wrhwr.date_completed')}='" + month + "' ";

	var probType = obj.selectedChartData['wrhwr.prob_type'];
	res += " AND wrhwr.prob_type='" + probType + "' ";	

	if(abBldgopsReportArchivedWrCostByProbtypeDashController.otherRes){
		res += " AND "+abBldgopsReportArchivedWrCostByProbtypeDashController.otherRes;	
	}

    View.openDialog("ab-ondemand-report-cost-details.axvw", res.replace(/wrhwr./g, "wr."));
}

