var trAvailRptController = View.createController('trAvailRptController', {
	otherRes: ' 1=1 ',
	fieldsArraysForRestriction: new Array(['wr.supervisor'], ['wr.work_team_id']),
	clickedDate: '',
	dateField: 'wrtr.date_assigned',

	afterInitialDataFetch:function(){
		var currentDate = getCurrentDate();
		this.abBldgopsReportTrAvailConsole.setFieldValue("wrtr.date_assigned.from", currentDate);
		this.abBldgopsReportTrAvailConsole.setFieldValue("wrtr.date_assigned.to", fixedFromDate_toToDate(currentDate,13));
	},
	/**
	 * Search by console
	 */
    abBldgopsReportTrAvailConsole_onFilter: function(){
		var console = this.abBldgopsReportTrAvailConsole;
		var crossTable = this.abBldgopsReportTrAvailReport;
		//Call two common method to generate restriction string from console fields and given destination restrcition fields
		this.otherRes = getRestrictionStrFromConsole( console, this.fieldsArraysForRestriction); 		
		var dateRes =  getRestrictionStrOfDateRange( console, "wrtr.date_assigned");
		var trRes="";
		if(console.getFieldValue("wr.work_team_id")){
			trRes =  " exists ( select  1 from cf where cf.tr_id=tr.tr_id AND " + getMultiSelectFieldRestriction(["cf.work_team_id"],console.getFieldValue("wr.work_team_id")) +  ")"; 
		}
		else {
			trRes = " 1=1 ";
		}
        crossTable.addParameter('otherRes', this.otherRes);
        crossTable.addParameter('dateRes', " 1=1 " + dateRes.replace(/wrtr.date_assigned/g, "afm_cal_dates.cal_date"));
        crossTable.addParameter('trRes',  trRes);
        crossTable.refresh();
        crossTable.show(true);
		this.otherRes = this.otherRes + dateRes;
    },
	/**
	 * Clear restriction of console
	 */
    abBldgopsReportTrAvailConsole_onClear: function(){
		clearConsole(this,this.abBldgopsReportTrAvailConsole);
        this.abBldgopsReportTrAvailReport.show(false);
    },

    showChart: function(dateValue){
		this.clickedDate =dateValue;
        View.openDialog('ab-bldgops-report-tr-avail-cht.axvw', null, false, {width:800, height:800});
    }
})

function onReportClick(obj){
	onAvailabilityCrossTableClick(obj, View.controllers.get(0), View.panels.get('abBldgopsReportTrAvailGrid'),  "wrtr.tr_id", "wrtr.date_assigned",true);
}
