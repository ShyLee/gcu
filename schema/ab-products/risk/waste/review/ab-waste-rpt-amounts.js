/**
 * @author Song
 */
var abWasteRptAmountsController = View.createController('abWasteRptAmountsController', {
	/**
	 *  console restriction
	 */
	restriction: null,
	/**
	 *  console original restriction 
	 */
	originalRes: null,
	/**
	 * html selected field
	 */
	selectedGroupBy: null,
	/**
	 * afterInitialDataFetch
	 * call abWasteRptAmountsConsole_onShow to show related Pie and Line Chart with datas according console default parameters
	 */
	afterInitialDataFetch: function(){
		resetStatusOption('abWasteRptAmountsConsole');
		var groupByOfRadios = document.getElementsByName("groupBy");
		groupByOfRadios[0].checked = true;
		var timeLine = document.getElementsByName("timeLine");
		timeLine[0].checked = true;
		this.setPanelShowFalse();
		this.setDataSourceParameters();
		  
//		  Kb 3031472
//		  this.abWasteRptAmountsConsole_onShow();
	},
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(
			['waste_out.site_id',,'waste_out.site_id'], 
			['waste_out.bl_id',,'waste_out.bl_id'], 
			['waste_profiles.waste_category',,'waste_profiles.waste_category'], 
			['waste_out.waste_profile',,'waste_out.waste_profile'], 
			['waste_profiles.waste_type',,'waste_profiles.waste_type'], 
			['waste_out.waste_disposition',,'waste_out.waste_disposition'], 
			['waste_dispositions.disposition_type',,'waste_dispositions.disposition_type'], 
			['waste_out.status',,'waste_out.status']
	),
	/**
	 * Show grid by console restriction
	 */
	abWasteRptAmountsConsole_onShow: function(){
		var res = addDispositionTypeRestriction(this.getOriginalConsoleRestriction(), 'abWasteRptAmountsConsole');
		this.originalRes = this.getOriginalConsoleRestriction();
		this.restriction = res;
		var groupByOfRadios = document.getElementsByName("groupBy");
		var timeLine = document.getElementsByName("timeLine");
		this.selectedGroupBy = groupByOfRadios;
		this.setPanelShowFalse();
		if (timeLine&&groupByOfRadios) {
			if (timeLine[0].checked) {
				if (groupByOfRadios[0].checked) {
					this.reSetPanel(this.abWasteRptAmountsSiteChart,this.abWasteRptAmountsSiteYearRightChart,res);
				}else if(groupByOfRadios[1].checked){
					this.reSetPanel(this.abWasteRptAmountsBlChart,this.abWasteRptAmountsBlYearRightChart,res);
				}else if(groupByOfRadios[2].checked){
					this.reSetPanel(this.abWasteRptAmountsWasteProfileChart,this.abWasteRptAmountsWasteProfileYearRightChart,res);
				}else {
					this.reSetPanel(this.abWasteRptAmountsWasteTypeChart,this.abWasteRptAmountsWasteTypeYearRightChart,res);
				}
			}else {
				if (groupByOfRadios[0].checked) {
					this.reSetPanel(this.abWasteRptAmountsSiteChart,this.abWasteRptAmountsSiteMonthRightChart,res);
				}else if(groupByOfRadios[1].checked){
					this.reSetPanel(this.abWasteRptAmountsBlChart,this.abWasteRptAmountsBlMonthRightChart,res);
				}else if(groupByOfRadios[2].checked){
					this.reSetPanel(this.abWasteRptAmountsWasteProfileChart,this.abWasteRptAmountsWasteProfileMonthRightChart,res);
				}else {
					this.reSetPanel(this.abWasteRptAmountsWasteTypeChart,this.abWasteRptAmountsWasteTypeMonthRightChart,res);
				}
			}
		}
		
	},
	/**
	 * private method
	 */
	reSetPanel: function(leftChart,rightChart,res){
		//due to lots of chart change in one page change group by and click show doesn't work in IE,initialDataFetch is necessary
		leftChart.initialDataFetch();
		leftChart.show(true);
		leftChart.refresh(res);
		rightChart.initialDataFetch();
		rightChart.addParameter('consoleRestriction',res);
		rightChart.show(true);
		rightChart.refresh(res);
	},
	/**
	 * private method
	 */
	setPanelShowFalse: function(){
		var sequentialPanelKeys = new Array();
		View.panels.each(function(panel) {
			sequentialPanelKeys.push(panel.id);
        });
		for ( var i = 0; i < sequentialPanelKeys.length; i++) {
			if (sequentialPanelKeys[i].indexOf("Chart")!=-1) {
				View.panels.get(sequentialPanelKeys[i]).show(false);
			}
		}
	},
	/**
	 * original restriction
	 */
	getOriginalConsoleRestriction: function(){
		var console = this.abWasteRptAmountsConsole;
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		var dateFrom=console.getFieldValue("date_start.from");
		var dateTo=console.getFieldValue("date_start.to");

		if(valueExistsNotEmpty(dateFrom)){
			restriction+=" AND waste_out.date_start >=${sql.date(\'" + dateFrom + "\')}";
		}
		if(valueExistsNotEmpty(dateTo)){
			restriction+=" AND waste_out.date_start <=${sql.date(\'" + dateTo + "\')}";
		}
		if (document.getElementById("is_recyclable").checked) {
			restriction+=" AND waste_profiles.is_recyclable = 1 ";
		} else {
			//uncheck means all the condition contain
			//restriction+=" AND waste_profiles.is_recyclable = 0 ";
		}
		Ext.select('input[name="radioUnits"]:checked').each(function(val){
			var val = val.dom.value;
			if (valueExistsNotEmpty(val)) {
				restriction+=" AND waste_out.units_type = '"+val+"'";
			}
		});
		return restriction;
	},
	setDataSourceParameters: function(){
		this.abWasteRptAmountsSiteChart.addParameter("groupByField", "wo.site_id");
		this.abWasteRptAmountsSiteChart.addParameter('noDate',getMessage('noDate'));
		this.abWasteRptAmountsBlChart.addParameter("groupByField", "wo.bl_id");
		this.abWasteRptAmountsBlChart.addParameter('noDate',getMessage('noDate'));
		this.abWasteRptAmountsWasteProfileChart.addParameter("groupByField", "wo.waste_profile");
		this.abWasteRptAmountsWasteProfileChart.addParameter('noDate',getMessage('noDate'));
		this.abWasteRptAmountsWasteTypeChart.addParameter("groupByField", "wp.waste_type");
		this.abWasteRptAmountsWasteTypeChart.addParameter('noDate',getMessage('noDate'));
		
		var yearRestriction = "(case when waste_out.date_start is null then '" + getMessage('noDate') + "' else ${sql.yearOf('waste_out.date_start')} end) = ${parameters['summaryValueForThisGroup']} and ${parameters['consoleRestriction']}";
		this.abWasteRptAmountsSiteYearRightChart.addParameter('composedRestriction',yearRestriction);
		this.abWasteRptAmountsSiteYearRightChart.addParameter('groupByField','wo.site_id');
		this.abWasteRptAmountsBlYearRightChart.addParameter('composedRestriction',yearRestriction);
		this.abWasteRptAmountsBlYearRightChart.addParameter('groupByField','wo.bl_id');
		this.abWasteRptAmountsWasteProfileYearRightChart.addParameter('composedRestriction',yearRestriction);
		this.abWasteRptAmountsWasteProfileYearRightChart.addParameter('groupByField','wo.waste_profile');
		this.abWasteRptAmountsWasteTypeYearRightChart.addParameter('composedRestriction',yearRestriction);
		this.abWasteRptAmountsWasteTypeYearRightChart.addParameter('groupByField','wp.waste_type');
		
		var monthRestriction = "(case when waste_out.date_start is null then '" + getMessage('noDate') + "' else ${sql.yearMonthOf('waste_out.date_start')} end) = ${parameters['summaryValueForThisGroup']} and ${parameters['consoleRestriction']}";
		this.abWasteRptAmountsSiteMonthRightChart.addParameter('composedRestriction',monthRestriction);
		this.abWasteRptAmountsSiteMonthRightChart.addParameter('groupByField','wo.site_id');
		this.abWasteRptAmountsBlMonthRightChart.addParameter('composedRestriction',monthRestriction);
		this.abWasteRptAmountsBlMonthRightChart.addParameter('groupByField','wo.bl_id');
		this.abWasteRptAmountsWasteProfileMonthRightChart.addParameter('composedRestriction',monthRestriction);
		this.abWasteRptAmountsWasteProfileMonthRightChart.addParameter('groupByField','wo.waste_profile');
		this.abWasteRptAmountsWasteTypeMonthRightChart.addParameter('composedRestriction',monthRestriction);
		this.abWasteRptAmountsWasteTypeMonthRightChart.addParameter('groupByField','wp.waste_type');
	}
});
/**
 * This function is called when  user clicks on the chart
 */
function displayChartSelectedItem(chartItem) {
	var clause = chartItem.restriction.clauses[0];
	
	//replace waste_out.vf_waste_out_group_by_field with waste_out.site_id or waste_out.bl_id or waste_out.waste_profile or waste_out.waste_type
	var groupByFieldId = chartItem.chart.parameters["groupByField"];
	groupByFieldId = groupByFieldId.replace("wo.", "waste_out.").replace("wp.", "waste_out.");
	
	if(clause.name == "waste_out.vf_waste_out_group_by_field"){
		clause.name = groupByFieldId;
	}
	
	if (clause) {
		var res = "";
		var ctrl = View.controllers.get('abWasteRptAmountsController');
		var date_end="";
		if (clause.name=='waste_out.year') {
			date_end = "${sql.yearOf('waste_out.date_start')}";
			getPartRes(ctrl,res,chartItem,clause,date_end);
		}else if(clause.name=='waste_out.month') {
			date_end = "${sql.yearMonthOf('waste_out.date_start')}";
			getPartRes(ctrl,res,chartItem,clause,date_end);
		}else {
			if (clause.value=="") {
				   View.openDialog('ab-waste-rpt-amounts-drilldown.axvw', clause.name +" is null  and "+ctrl.restriction);
			} else {
				 if(clause.name=='waste_profiles.waste_type') {
						View.openDialog('ab-waste-rpt-amounts-drilldown.axvw', clause.name +" = '" + getWasteType(clause.value) + "'" +" and "+ctrl.restriction);
				 }else {
					 View.openDialog('ab-waste-rpt-amounts-drilldown.axvw', clause.name +" = '" + clause.value + "'" +" and "+ctrl.restriction);
				}
		   }
		}
	} else {
		View.openDialog('ab-waste-rpt-amounts-drilldown.axvw',ctrl.restriction);
	}	
}
/**
 * private method
 */
function getPartRes(ctrl,res,chartItem,clause,date_end){
	if(valueExistsNotEmpty(chartItem.selectedChartData['waste_out.vf_waste_out_group_by_field'])){
		var groupByFieldId = chartItem.chart.parameters["groupByField"];
		groupByFieldId = groupByFieldId.replace("wo.", "waste_out.").replace("wp.", "waste_out.");
		chartItem.selectedChartData[groupByFieldId] = chartItem.selectedChartData['waste_out.vf_waste_out_group_by_field'];
		delete chartItem.selectedChartData['waste_out.vf_waste_out_group_by_field'];
	}	
	
	var nullVal = "N/A";
	if (ctrl.selectedGroupBy[0].checked) {
		if (chartItem.selectedChartData['waste_out.site_id']==nullVal) {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.site_id is null";
		} else {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.site_id = '" + chartItem.selectedChartData['waste_out.site_id']+ "'";
		}
	}else if (ctrl.selectedGroupBy[1].checked) {
		if (chartItem.selectedChartData['waste_out.bl_id']==nullVal) {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.bl_id is null ";
		} else {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.bl_id = '" + chartItem.selectedChartData['waste_out.bl_id']+ "'";
		}
	}else if (ctrl.selectedGroupBy[2].checked) {
		if (chartItem.selectedChartData['waste_out.waste_profile']==nullVal) {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.waste_profile is null ";
		} else {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.waste_profile = '" + chartItem.selectedChartData['waste_out.waste_profile']+ "'";
		}
	}else {
		var wasteType = chartItem.selectedChartData['waste_out.waste_type'];
//		wasteType = getWasteType(wasteType);
		if (wasteType==nullVal) {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.waste_type is null";
		} else {
			res=" "+date_end +" = '" + clause.value + "' and waste_out.waste_type = '" + wasteType+ "'";
		}
	}
	View.openDialog('ab-waste-rpt-amounts-drilldown.axvw', res+" and "+ctrl.restriction);
}
/**
 * private method 
 * get waste type from obj
 * wasteType string name
 * @returns
 */
function getWasteType(wasteType){
	var typeObj = {'Hazardous':'H','Residual/Non-Hazardous':'R','Municipal':'M'};
	return typeObj[wasteType];	
}
