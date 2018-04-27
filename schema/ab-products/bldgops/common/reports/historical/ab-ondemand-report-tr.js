var abondemandrpttrController = View.createController("abondemandrpttrController", {
    //parentType:'ac','bl','dvdp','eqstd','proptype','tr'
    parentType: 'tr',
    restriction: '',
    isCalYear: true,
    yearValue: '',
    afterInitialDataFetch: function(){
        var recs = View.dataSources.get("dsYears").getRecords();
        var yearSelect = $('selectYear');
        populateYearSelectLists(recs, yearSelect);
    },
    
    /**
     * Add filter button function
     */
    requestConsole_onFilter: function(){
        this.restriction = '1=1';
        var yearSelect = $('selectYear');
        if (yearSelect != "") {
            this.restriction +=   generateCostRes(this).replace(/wrhwr.date_completed/g, "hwr.date_completed");
        }
        this.reportPanel.refresh(this.restriction);
    },
    
    requestConsole_onClear: function(){
        this.requestConsole.clear();
        var curYear = new Date().getFullYear();
        setDefaultValueForHtmlField(['selectYear'], [curYear]);
    }
});

function onClickItem(obj){
	onArchievedWrCrossTableClick(obj,View.controllers.get("abondemandrpttrController").restriction);
}