var cfAvailRptController = View.createController('cfAvailRptController', {
	otherRes: '',
	fieldsArraysForRestriction: new Array(['wr.supervisor'], ['wr.work_team_id'], ['wr.tr_id', ,'cf.tr_id']),
	clickedDate: '',
	dateField: 'wrcf.date_assigned',

	afterInitialDataFetch:function(){
		var currentDate = getCurrentDate();
		this.abBldgopsReportCfAvailConsole.setFieldValue("wrcf.date_assigned.from", currentDate);
		this.abBldgopsReportCfAvailConsole.setFieldValue("wrcf.date_assigned.to", fixedFromDate_toToDate(currentDate,13));
	},
	/**
	 * Search by console
	 */
    abBldgopsReportCfAvailConsole_onFilter: function(){
		var console = this.abBldgopsReportCfAvailConsole;
		var crossTable = this.abBldgopsReportCfAvailReport;
		//Call two common method to generate restriction string from console fields and given destination restrcition fields
		this.otherRes = getRestrictionStrFromConsole( console, this.fieldsArraysForRestriction);
 		var dateRes =  getRestrictionStrOfDateRange( console, "wrcf.date_assigned");
		var cfRes="";
		if(console.getFieldValue("wr.work_team_id")){
			cfRes =  getMultiSelectFieldRestriction(["cf.work_team_id"], console.getFieldValue("wr.work_team_id")); 
		}
		else {
			cfRes = " 1=1 ";
		}
        crossTable.addParameter('otherRes', this.otherRes);
        crossTable.addParameter('dateRes',   " 1=1 " + dateRes.replace(/wrcf.date_assigned/g, "afm_cal_dates.cal_date") );
        crossTable.addParameter('cfRes',  cfRes);
        crossTable.refresh();
        crossTable.show(true);
		this.otherRes = this.otherRes + dateRes;
    },
	/**
	 * Clear restriction of console
	 */
    abBldgopsReportCfAvailConsole_onClear: function(){
		clearConsole(this,this.abBldgopsReportCfAvailConsole);
        this.abBldgopsReportCfAvailReport.show(false);
    },

    showChart: function(dateValue){
		this.clickedDate =dateValue;
        View.openDialog('ab-bldgops-report-cf-avail-cht.axvw', null, false, {width:800, height:800});
    }
})

function onReportClick(obj){
	onAvailabilityCrossTableClick(obj, cfAvailRptController, View.panels.get('abBldgopsReportCfAvailGrid'),  "wrcf.cf_id", "wrcf.date_assigned",true);
}
