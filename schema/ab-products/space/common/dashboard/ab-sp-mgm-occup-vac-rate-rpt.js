var vacancyChartController = View.createController('vacancyChartController', {
	afterViewLoad: function(){
		//add footer to gridCaHighRmLSRep panel
		var dashCostAnalysisMainController=View.getOpenerView().controllers.get('dashCostAnalysisMainController');
		
		if(dashCostAnalysisMainController.vacancyChartController==''){
			dashCostAnalysisMainController.vacancyChartController=this;
			dashCostAnalysisMainController.vacancyChartController.vacancyChart.show(false);
			this.vacancyChart.addParameter('dateRange', "${sql.date('"+currentDate+"')}");
		}
		
		var currdate = new Date();
		var currentDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, 0));
		var lastYearDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, -1));
		var lastTwoDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, -2));
		vacancyChartController.vacancyChart.addParameter('dateRange', "${sql.date('"+currentDate+"')},${sql.date('"+lastYearDate+"')},${sql.date('"+lastTwoDate+"')}");

		if(dashCostAnalysisMainController.blId==''){
			vacancyChartController.vacancyChart.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+dashCostAnalysisMainController.siteIdRes);
		}else{
			vacancyChartController.vacancyChart.addParameter('blId', dashCostAnalysisMainController.treeRes+" AND "+getMultiSelectFieldRestriction(['rm.bl_id'], dashCostAnalysisMainController.blId)+" AND "+dashCostAnalysisMainController.siteIdRes);
		}
		
		if(dashCostAnalysisMainController.groupLevel=="bl_id is not null"){
			vacancyChartController.vacancyChart.addParameter('groupby', "bl.bl_id");
		}else if(dashCostAnalysisMainController.groupLevel=="bl.bl_id"){
			vacancyChartController.vacancyChart.addParameter('groupby', 'rm.bl_id');
		}
		else if(dashCostAnalysisMainController.groupLevel=="fl.fl_id"){
			vacancyChartController.vacancyChart.addParameter('groupby', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
		}else{
			vacancyChartController.vacancyChart.addParameter('groupby', dashCostAnalysisMainController.groupLevel);
		}
		vacancyChartController.vacancyChart.addParameter('dvdpForRmParam',dashCostAnalysisMainController.dvdpForRmRes);
		vacancyChartController.vacancyChart.addParameter('dvdpParam',dashCostAnalysisMainController.dvdpRes);
		
	}
	
	})
	
/**
 * Get format date
 * @param date
 * @returns {String}
 */
function getIsoFormatDate(date){
	var month = date.getMonth() + 1;
	if (month < 10) 
		month = "0" + month; // bug error fixed
	var day = date.getDate();
	if (day < 10) 
		day = "0" + day; // bug error fixed
	// not valid before 1970
	return date.getFullYear() + "-" + month + "-" + day;
}
