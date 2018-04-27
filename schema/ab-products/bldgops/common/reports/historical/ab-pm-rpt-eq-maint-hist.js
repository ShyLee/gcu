/**
 * @author lei
 */
var viewPMWorkHistController = View.createController('viewPMWorkHist', {
    dateStart: '',
    dateEnd: '',
    showRestriction: null,
    equipID: "",
    totalRecord: null,
	consoleParam:'',
	fieldArray : new Array(['hwr.site_id'], ['hwr.bl_id'],['hwr.dv_id'], ['hwr.dp_id'], ['eq.eq_std']),
	
    afterInitialDataFetch: function(){
        var curDate = getCurrentDate();
        this.filterEqMaintainedPanel.setFieldValue("hwr.date_completed.to", curDate);
        this.filterEqMaintainedPanel_onSearch();
    },
	/**
	 * clear
	 */
	filterEqMaintainedPanel_onClear: function(){
	 	this.filterEqMaintainedPanel.clear();
		var curDate = getCurrentDate();
        this.filterEqMaintainedPanel.setFieldValue("hwr.date_completed.to", curDate);
	 },
    /**
     * action search
     *
     */
	filterEqMaintainedPanel_onSearch: function(){
		this.eqGrid.show(true);
		this.consoleParam=' AND 1=1 ';
        var console = this.filterEqMaintainedPanel;
        this.showRestriction = new Ab.view.Restriction();
        var filterHwrDs = View.dataSources.get('ds_ab-pm-rpt-eq-maint-hist_filter_hwr');
        var groupHwrEqDs = View.dataSources.get('ds_ab-pm-rpt-eq-maint-hist_group_hwr');
		
        // hwr.date_completed value range
        var dateTodoFrom = console.getFieldValue('hwr.date_completed.from');
        //parse date 
        dateTodoFrom = filterHwrDs.parseValue('hwr.date_completed.from', dateTodoFrom, true);
        this.dateStart = dateTodoFrom;
        if (dateTodoFrom != '') {
            this.showRestriction.addClause('hwr.date_completed', dateTodoFrom, '&gt;=');
        }
        var dateTodoTo = console.getFieldValue('hwr.date_completed.to');
        dateTodoTo = filterHwrDs.parseValue('hwr.date_completed.to', dateTodoTo, true);
        this.dateEnd = dateTodoTo;
        if (dateTodoTo != '') {
            this.showRestriction.addClause('hwr.date_completed', dateTodoTo, '&lt;=');
        }
        var parameters = {
            recordLimit: 0
        };
        var recs = groupHwrEqDs.getRecords(this.showRestriction, parameters);
        var equipID = "";
        var subQueryWhere = "";
        if (recs != null) {
            for (var i = 0; i < recs.length; i++) {
                equipID = recs[i].getValue("hwr.eq_id");
                subQueryWhere += " OR eq.eq_id='" + equipID + "'";
            }
        }
		
		this.eqGrid.addParameter('eqIDSets', subQueryWhere);
        // apply restriction to the grid   
		this.consoleParam = " AND "+ getRestrictionStrFromConsole(console, this.fieldArray).replace(/hwr./g, "eq.");
		this.eqGrid.addParameter('consoleParam', this.consoleParam);
        this.eqGrid.refresh();
    },
    
    eqGrid_afterRefresh: function(){
        var restriction = new Ab.view.Restriction();
        restriction.addClause("hwr.wr_id", "-1", "=");
        this.historyReport.refresh(restriction);
        var showChartAction = this.eqGrid.actions.get('showChart');
		var showLineAction = this.eqGrid.actions.get('showLine');
        if (this.eqGrid.rows.length == 0) {
            showChartAction.show(false);
			showLineAction.show(false);
        }
        else {
            showChartAction.show(true);
			showLineAction.show(true);
        }
    },
    
    historyReport_afterRefresh: function(){
        var hwrReport = this.historyReport;
        if (hwrReport.rows.length == 0) {
            //set title of manager panel 
            var title = getMessage("managePanelTitle");
            setPanelTitle('historyReport', title);
            return;
        }
		//kb#3038880: comment below line and remove function addCurrencySignForMoneyColumn to NOT Display  both currency symbols.
		//this.addCurrencySignForMoneyColumn();
        this.addStatisticInfo();
    },
    
    addStatisticInfo: function(){
        var hwrReport = this.historyReport;
        var totalRecord = this.totalRecord;
        
        var totalRow = new Object();
        totalRow['hwr.date_requested'] = getMessage('totalForEq') + this.equipID;
        totalRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.sum_cost_total']);
        totalRow['hwr.act_labor_hours'] = totalRecord.localizedValues['hwr.sum_act_labor_hours'];
        totalRow['hwr.down_time'] = totalRecord.localizedValues['hwr.sum_down_time'];
        totalRow['isStatisticRow'] = true;
        
        var countRow = new Object();
        countRow['hwr.date_requested'] = getMessage('countForEq') + this.equipID;
        countRow['hwr.cost_total'] = totalRecord.localizedValues['hwr.count_cost_total'];
        countRow['isStatisticRow'] = true;
        
        var avgRow = new Object();
        avgRow['hwr.date_requested'] = getMessage('avgForEq') + this.equipID;
        avgRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.avg_cost_total']);
        avgRow['isStatisticRow'] = true;
        
        var minRow = new Object();
        minRow['hwr.date_requested'] = getMessage('minForEq') + this.equipID;
        minRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.min_cost_total']);
        minRow['isStatisticRow'] = true;
        
        var maxRow = new Object();
        maxRow['hwr.date_requested'] = getMessage('maxForEq') + this.equipID;
        maxRow['hwr.cost_total'] = insertCurrencySign(totalRecord.localizedValues['hwr.max_cost_total']);
        maxRow['isStatisticRow'] = true;
        
        hwrReport.addRow(totalRow);
        hwrReport.addRow(countRow);
        hwrReport.addRow(avgRow);
        hwrReport.addRow(minRow);
        hwrReport.addRow(maxRow);
        
        hwrReport.build();
        this.setStatisticRowStyle();
    },
    
    setStatisticRowStyle: function(){
        var rows = this.historyReport.rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['isStatisticRow']) {
                Ext.get(rows[i].row.dom).setStyle('color', '#4040f0');
                Ext.get(rows[i].row.dom).setStyle('font-weight', 'bold');
            }
        }
    }
    
})

function onSelectEquipment(){
	View.panels.get('historyReport').show(true);
    //1 get data when click any text in eqGrid
    var grid = View.panels.get('eqGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var equipID = selectedRow["eq.eq_id"];
    //set title of manager panel 
    var title = getMessage("managePanelTitle") + " " + equipID;
    setPanelTitle('historyReport', title);
    
    //2 refresh the hwr report
    var controller = View.controllers.get('viewPMWorkHist');
    controller.equipID = equipID;
    var searchRestric = controller.showRestriction;
    var restriction = new Ab.view.Restriction();
    restriction.addClause("hwr.eq_id", equipID, "=");
    for (var i = 0; i < searchRestric.clauses.length; i++) {
        var clause = searchRestric.clauses[i];
        restriction.addClause(clause.name, clause.value, clause.op, false);
    }
    controller.totalRecord = View.dataSources.get('ds_ab-pm-rpt-eq-maint-hist_stat_hwr').getRecord(restriction);
    
    var hwrReport = View.panels.get('historyReport');
    hwrReport.refresh(restriction);
}

function showChart(){
    
    View.openDialog('ab-pm-rpt-eq-maint-hist-cht.axvw');
}

function showLine(){

    View.openDialog('ab-pm-rpt-eq-maint-hist-chline.axvw');
}
