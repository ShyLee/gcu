var bizHouseFeeStatisticsController = View.createController('bizHouseFeeStatisticsController',{
	afterInitialDataFetch:function(){
		var myDate = new Date();
		var year = myDate.getFullYear();
		
		$('year').value = year;
		
		this.feeGrid.addParameter('year',year);
		this.feeChart.addParameter('year',year);
		this.feeGrid.refresh();
		this.feeChart.refresh();
		this.feeGrid.appendTitle(year);
	},
	consolePanel_onShow : function(){
		var year = $('year').value;
	
		this.feeGrid.addParameter('year',year);
		this.feeChart.addParameter('year',year);
		this.feeGrid.refresh();
		this.feeChart.refresh();
		this.feeGrid.appendTitle(year);
	}
});
