var controller=View.createController('EqSumForm',{
	afterInitialDataFetch: function(){
		this.chartPie_chart.addParameter('5070', '1950-1970年设备');
		this.chartPie_chart.addParameter('7090', '1970-1990年设备');
		this.chartPie_chart.addParameter('902010', '1990-2010年设备');
		this.chartPie_chart.addParameter('2010after', '2010年以后的设备');
		this.chartPie_chart.refresh();
	
	}
	
});

