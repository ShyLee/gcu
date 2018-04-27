/**
 * @author Keven.xi
 */
var abScRptRmtypesAreabyRmcat = View.createController('abScRptRmtypesAreabyRmcatController', {
	
	rm_cat:"",
	
	afterViewLoad: function(){
		this.abScRptRmtypeAreabyRmcat_rmcatSumGrid.buildPostFooterRows = addTotalRowForCat;
		this.abScRptRmtypeAreabyRmcat_rmtypeSumGrid.buildPostFooterRows = addTotalRowForType;
		this.abScRptRmtypeAreabyRmcat_rmcatSumGrid.sortEnabled = false;
		this.abScRptRmtypeAreabyRmcat_rmtypeSumGrid.sortEnabled = false;
	},
	/**
	 * 
	 */
	abScRptRmtypeAreabyRmcat_rmtypeSumGrid_afterRefresh:function(){
		var title = String.format(getMessage('secondPanelTitle'),this.rm_cat );
		this.abScRptRmtypeAreabyRmcat_rmtypeSumGrid.setTitle(title);
	}
	
});

/**
 * event handler when click the Show Chart Button
 * @param {Object} ob
 */
function onShowRoomsSumInPieChart(){
	var dialogConfig = {
			width: 600,
			height: 350,
			closeButton: true
		};
		
	var selectedRmCat = abScRptRmtypesAreabyRmcat.rm_cat;
	var chartPanel = View.panels.get("abScRptRmtypeAreabyRmcatChartPie");
    //chartPanel.addParameter("rmcatRes", selectedRmCat);
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rmtype.rm_cat",selectedRmCat,"=");
    chartPanel.refresh(restriction);   
    chartPanel.show(true);
    chartPanel.showInWindow(dialogConfig);
     
    var title = String.format(getMessage('chartPanelTitle'),selectedRmCat);
    chartPanel.setTitle(title);
}

function onRefreshSecondReport(){
	var rmcatPanel = View.panels.get("abScRptRmtypeAreabyRmcat_rmcatSumGrid");
	abScRptRmtypesAreabyRmcat.rm_cat = rmcatPanel.rows[rmcatPanel.selectedRowIndex]["rmcat.rm_cat"];
	var rmtypePanel = View.panels.get("abScRptRmtypeAreabyRmcat_rmtypeSumGrid");
	rmtypePanel.addParameter("rmcatRes",abScRptRmtypesAreabyRmcat.rm_cat);
	rmtypePanel.refresh();
}


/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRowForCat(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
	var totalProportion = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['rmcat.area'];
		if(row['rmcat.area.raw']){
			fntstdCountValue = row['rmcat.area.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['rmcat.area_jianzhu'];	
		if(row['rmcat.area_jianzhu.raw']){
			fntstdPriceValue = row['rmcat.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalAreaJianZhu += parseFloat(fntstdPriceValue);
		}
		
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	totalProportion = calPercentAreaJianzhu(this,totalAreaJianZhu);
	totalProportion  = totalProportion.toFixed(2);
	
	var ds = this.getDataSource();
	
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
    // column 2: total area
    addColumn(gridRow, 1, ds.formatValue('rm.total_area_shiyong', totalAreaShiyong, true));
    // column 3: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('rm.total_area_jianzhu', totalAreaJianZhu, true));
	// column 4: total proportion
    addColumn(gridRow, 1, ds.formatValue('rm.percent_area', totalProportion, true));
}

/**
 * Calculate the percent of the jianzhu area of per rmcat
 * @param {Object} panel
 * @param {Object} totleArea
 */
function calPercentAreaJianzhu(panel,totleArea){
	
	var totalProportion = 0.0;
	
	for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
        var rmcatProportion = 0.0;
		
		var rmcatAreaJianzhuValue = row['rmcat.area_jianzhu'];	
		if(row['rmcat.area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['rmcat.area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
		
		var rowEl = Ext.get(row.row.dom).dom;
		rowEl.cells[3].innerHTML = rmcatProportion.toFixed(2) + '%';
		
		totalProportion += parseFloat(rmcatProportion);
    }
	
	return totalProportion;
}


/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRowForType(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalProportion = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['rmtype.area'];
		if(row['rmtype.area.raw']){
			fntstdCountValue = row['rmtype.area.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
    }
	
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalProportion = calPercentAreaShiYong(this,totalAreaShiyong);
	totalProportion  = totalProportion.toFixed(2);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty
    addColumn(gridRow, 1);
	// column 3: total area
    addColumn(gridRow, 1, ds.formatValue('rmtype.area', totalAreaShiyong, true));
    // column 4: empty
    addColumn(gridRow, 1);
	// column 5: total proportion
    addColumn(gridRow, 1, ds.formatValue('rmtype.percent_area', totalProportion, true));
}
/**
 * Calculate the percent of the jianzhu area of per rmtype
 * @param {Object} panel
 * @param {Object} totleArea
 */
function calPercentAreaShiYong(panel,totleArea){
	
	var totalProportion = 0.0;
	
	for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
        var rmtypeProportion = 0.0;
		
		var rmtypeAreaShiYong = row['rmtype.area'];	
		if(row['rmtype.area.raw']){
			rmtypeAreaShiYong = row['rmtype.area.raw'];
		}
		if (!isNaN(parseFloat(rmtypeAreaShiYong)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmtypeProportion = parseFloat(rmtypeAreaShiYong)*100.0/parseFloat(totleArea);
			}
		}
		
		var rowEl = Ext.get(row.row.dom).dom;
		rowEl.cells[4].innerHTML = rmtypeProportion.toFixed(2) + '%';
		
		totalProportion += parseFloat(rmtypeProportion);
    }
	
	return totalProportion;
}
/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
 */
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
}
