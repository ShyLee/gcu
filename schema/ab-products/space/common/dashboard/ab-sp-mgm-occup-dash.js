var dashCostAnalysisMainController = View.createController('dashCostAnalysisMainController', {
	treeController:'',

	occupAndCapController:'',
	keyTotalMetricController:'',
	areaByBlUsecController:'',
	areaPerSeatController:'',
	usableStackBarController:'',
	vacancyChartController:'',
	gisController:'',
	dvId:'',
	dpId:'',
	blId:'',
	siteId:'',
	dvdpRes:"'1'='1'",
	siteIdRes:"'1'='1'",
	blIdRes:"'1'='1'",
	treeRes:'bl_id is not null',
	groupLevel:'bl_id is not null',
	dvdpForRmRes:"'1'='1'",
	blIdForFlRes:"'1'='1'",

	afterViewLoad: function() {
		var controllerConsole=View.controllers.get('controllerConsole');
		controllerConsole.abHelpRequestTreeConsole.actions.get('filter').show(false);
		this.showOrHideConsole.defer(4000);
		
	},
	
	/**
	 * Show or hide console button
	 */
	showOrHideConsole:function(){
		var controllerConsole=View.controllers.get('controllerConsole');
		controllerConsole.abHelpRequestTreeConsole.actions.get('filter').show(true);
	},
	
	afterInitialDataFetch: function() {
		//add footer to gridCaHighRmLSRep panel
		this.treeController=View.controllers.get('treeController');
		View.controllers.get('treeController').dashCostAnalysisMainController=this;
		
	},
	
	/**
	 * Set console restriction.
	 */
	setConsoleRestriction:function(){

		this.dvdpRes="'1'='1'";
		this.dvdpForRmRes="'1'='1'";
		this.siteIdRes="'1'='1'";
		this.blIdRes="'1'='1'";
		this.blIdForFlRes="'1'='1'";
		if( this.dvId){
			this.dvdpRes =  this.dvdpRes + " AND "+ getMultiSelectFieldRestriction(['rmpct.dv_id'], this.dvId);
			this.dvdpForRmRes=this.dvdpForRmRes + " AND "+ getMultiSelectFieldRestriction(['rm.dv_id'], this.dvId);
		}
		if( this.dpId){
			this.dvdpRes =  this.dvdpRes + " AND "+ getMultiSelectFieldRestriction(['rmpct.dp_id'], this.dpId);
			this.dvdpForRmRes =  this.dvdpForRmRes + " AND "+ getMultiSelectFieldRestriction(['rm.dp_id'], this.dpId);
		}

		if(this.siteId){
			this.siteIdRes=this.siteIdRes+" AND "+getMultiSelectFieldRestriction(['bl.site_id'], this.siteId);
		}
		if(this.blId){
			this.blIdRes= this.blIdRes+" AND "+getMultiSelectFieldRestriction(['bl_id'], this.blId);
			this.blIdForFlRes= this.blIdForFlRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], this.blId);
			
		}

	},

	/**
	 * Refresh dash board.
	 */
	refreshDashboard:function(){
		//////////////////////////////////////////////////////
		var treeRes=this.treeRes;
		var groupLevel=this.groupLevel;
		//////////////////////////////////////////////////////

		this.refreshKeyTotalMetricForm(treeRes,groupLevel);
		///////////////////////////////////////////////////////
		this.refreshOccupancyAndCapicityStackedBar(treeRes,groupLevel);
		///////////////////////////////////////////////////////////
		this.refreshVacancyChart();


		///////////////////////////////////////////////////////////////////////////////

		this.refreshGis(treeRes);

		///////////////////////////////////////////////////

		this.refreshUsePie(treeRes);

		//////////////////////////////////////////////////////////

		this.refreshUsableStackBar(treeRes,groupLevel);
		
		//////////////////////////////////////////
		//////////////////////////////////////////////////////////////////
		this.refreshAreaPerSeatBar(treeRes,groupLevel);

	},

	/**
	 * Maximize the chart.
	 */
	 onMore:function(){
		 this.keyTotalMetricController.keyTotalMetricForm1.addParameter('blId', this.treeRes+" AND "+this.blIdForFlRes+" AND "+this.siteIdRes);
			
			this.keyTotalMetricController.keyTotalMetricForm1.addParameter('groupby', 'bl.bl_id');

			
			if(this.groupLevel=="bl_id is not null"){
				this.keyTotalMetricController.keyTotalMetricForm1.addParameter('groupby', "bl.bl_id");
			}else if(this.groupLevel=="bl.bl_id"){
				this.keyTotalMetricController.keyTotalMetricForm1.addParameter('groupby', 'bl.bl_id');
			}
			else if(this.groupLevel=="fl.fl_id"){
				this.keyTotalMetricController.keyTotalMetricForm1.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
			}else{
				this.keyTotalMetricController.keyTotalMetricForm1.addParameter('groupby', this.groupLevel);
			}
			
			this.keyTotalMetricController.keyTotalMetricForm1.show(true);
			this.keyTotalMetricController.keyTotalMetricForm1.refresh();
         
			this.keyTotalMetricController.keyTotalMetricForm1.showInWindow({
             width: 900,
             height: 600
         });
	 },
	
	
	refreshKeyTotalMetricForm:function(treeRes,groupLevel){
		this.keyTotalMetricController.keyTotalMetricForm.addParameter('blId', treeRes+" AND "+this.blIdForFlRes+" AND "+this.siteIdRes);
		
		this.keyTotalMetricController.keyTotalMetricForm.addParameter('groupby', 'bl.bl_id');

		
		if(groupLevel=="bl_id is not null"){
			this.keyTotalMetricController.keyTotalMetricForm.addParameter('groupby', "bl.bl_id");
		}else if(groupLevel=="bl.bl_id"){
			this.keyTotalMetricController.keyTotalMetricForm.addParameter('groupby', 'bl.bl_id');
		}
		else if(groupLevel=="fl.fl_id"){
			this.keyTotalMetricController.keyTotalMetricForm.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}else{
			this.keyTotalMetricController.keyTotalMetricForm.addParameter('groupby', groupLevel);
		}
		
		this.keyTotalMetricController.keyTotalMetricForm.show(true);
		this.keyTotalMetricController.keyTotalMetricForm.refresh();
	},

	refreshOccupancyAndCapicityStackedBar:function(treeRes,groupLevel){
		if(this.blId==''){
			this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('blId',treeRes+" AND "+this.siteIdRes);
		}else{
			this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('blId', treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], this.blId)+" AND "+this.siteIdRes);
		}
		
		this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('dvdpParam',this.dvdpRes );
		this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('dvdpForRmParam',this.dvdpForRmRes );
		if(groupLevel=="bl_id is not null"){
			this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('groupby', "bl.bl_id");

		}else if(groupLevel=="bl.bl_id"){
			this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('groupby', 'fl.bl_id');
		}
		else if(groupLevel=="fl.fl_id"){
			this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}else{
			this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('groupby', groupLevel);
		}

		this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('occupForAreatype', getMessage('occupForAreatype'));
		this.occupAndCapController.occupancyAndCapicityStackedBar.addParameter('maxOccupForAreatype', getMessage('maxOccupForAreatype'));
		this.occupAndCapController.occupancyAndCapicityStackedBar.show(true);
		this.occupAndCapController.refreshCustomColors();
		
		
	},

	refreshVacancyChart:function(){
		this.addParameterForVacancyChart(this);
		this.vacancyChartController.vacancyChart.show(true);
		this.vacancyChartController.vacancyChart.refresh();
	},
	
	

	refreshGis:function(treeRes){
		
		this.gisController.showSelectedBuildings(treeRes+" AND "+this.blIdRes+" AND "+this.siteIdRes);
	},
	refreshUsePie:function(treeRes){
		this.areaByBlUsecController.areaByBlUsePie.addParameter('blId', treeRes+" AND "+this.blIdRes+" AND "+this.siteIdRes);
		this.areaByBlUsecController.areaByBlUsePie.show(true);
		this.areaByBlUsecController.areaByBlUsePie.refresh();
	},

	refreshUsableStackBar:function(treeRes,groupLevel)
	{
		this.usableStackBarController.usableGrossStackedBar.addParameter('useableForAreatype', getMessage('useableForAreatype'));
		this.usableStackBarController.usableGrossStackedBar.addParameter('grossintForAreatype', getMessage('grossintForAreatype'));

		if(this.blId==''){
			this.usableStackBarController.usableGrossStackedBar.addParameter('blId', treeRes+" AND "+this.siteIdRes);
		}else{
			this.usableStackBarController.usableGrossStackedBar.addParameter('blId', treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], this.blId)+" AND "+this.siteIdRes);
		}


		if(groupLevel=="bl_id is not null"){
			this.usableStackBarController.usableGrossStackedBar.addParameter('groupby', "bl.bl_id");
		}else if(groupLevel=="bl.bl_id"){
			this.usableStackBarController.usableGrossStackedBar.addParameter('groupby', 'fl.bl_id');
		}
		else if(groupLevel=="fl.fl_id"){
			this.usableStackBarController.usableGrossStackedBar.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}else{
			this.usableStackBarController.usableGrossStackedBar.addParameter('groupby', groupLevel);
		}
		this.usableStackBarController.usableGrossStackedBar.show(true);
		this.usableStackBarController.refreshCustomColors();
		
	},
	
	refreshAreaPerSeatBar:function(treeRes,groupLevel)
	{	this.areaPerSeatController.areaPerSeatBar.addParameter('dvdpForRmParam',this.dvdpForRmRes );
		this.areaPerSeatController.areaPerSeatBar.addParameter('dvdpParam',this.dvdpRes);
		if(groupLevel=="bl_id is not null"){
			this.areaPerSeatController.areaPerSeatBar.addParameter('groupby', "bl.bl_id");
		}else if(groupLevel=="bl.bl_id"){
			this.areaPerSeatController.areaPerSeatBar.addParameter('groupby', 'fl.bl_id');
		}
		else if(groupLevel=="fl.fl_id"){
			this.areaPerSeatController.areaPerSeatBar.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}else{
			this.areaPerSeatController.areaPerSeatBar.addParameter('groupby', groupLevel);
		}

		if(this.blId==''){
			this.areaPerSeatController.areaPerSeatBar.addParameter('blId', treeRes+" AND "+this.siteIdRes);
		}else{
			this.areaPerSeatController.areaPerSeatBar.addParameter('blId', treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], this.blId)+" AND "+this.siteIdRes);
		}
		this.areaPerSeatController.areaPerSeatBar.show(true);
		this.areaPerSeatController.areaPerSeatBar.refresh();
	},
	

	 addParameterForVacancyChart:function(dashCostAnalysisMainController){
		    var treeRes=dashCostAnalysisMainController.treeRes;
		    var groupLevel=dashCostAnalysisMainController.groupLevel;
			var currdate = new Date();
			var currentDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, 0));
			var lastYearDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, -1));
			var lastTwoDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, -2));
			dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('dateRange', "${sql.date('"+currentDate+"')},${sql.date('"+lastYearDate+"')},${sql.date('"+lastTwoDate+"')}");

			if(dashCostAnalysisMainController.blId==''){
				dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('blId', treeRes+" AND "+dashCostAnalysisMainController.siteIdRes);
			}else{
				dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('blId', treeRes+" AND "+getMultiSelectFieldRestriction(['rm.bl_id'], dashCostAnalysisMainController.blId)+" AND "+dashCostAnalysisMainController.siteIdRes);
			}
			
			if(groupLevel=="bl_id is not null"){
				dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('groupby', "bl.bl_id");
			}else if(groupLevel=="bl.bl_id"){
				dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('groupby', 'rm.bl_id');
			}
			else if(groupLevel=="fl.fl_id"){
				dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('groupby', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
			}else{
				dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('groupby', groupLevel);
			}
			dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('dvdpForRmParam',dashCostAnalysisMainController.dvdpForRmRes);
			dashCostAnalysisMainController.vacancyChartController.vacancyChart.addParameter('dvdpParam',dashCostAnalysisMainController.dvdpRes);
			
		}
})


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
