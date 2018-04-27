/**
 * @author Keven.xi
 */


View.createController('ascBjUsmsOverallRmMainController', {
	
	siteId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;		
		
		this.ascBjUsmsOverallRmMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallRmMain_rmcat1SumGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallRmMain_rmcat2SumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsOverallRmMain_rmcat1SumGrid.sortEnabled = false;
		this.ascBjUsmsOverallRmMain_rmcat2SumGrid.sortEnabled = false;
		
		this.ascBjUsmsOverallRmMain_rmcat2SumGrid.buildPostFooterRows = addTotalRowForNoServ;
		this.ascBjUsmsOverallRmMain_rmcat1SumGrid.buildPostFooterRows = addTotalRowForHasServ;
	},
	
	afterTabChange:function(tabPanel,selectedTabName,  newTabName){
		this.schMainRmCatSumTabs.curSelectedTabName = selectedTabName;
		
		if(selectedTabName == 'yiFenTan'){
			calTotalJianzhuArea(this.ascBjUsmsOverallRmMain_rmcat2SumGrid,selectedTabName);
			this.ascBjUsmsOverallRmMain_rmcat2SumGrid.buildPostFooterRows = addTotalRowForNoServ;
	 	} else{
			calTotalJianzhuArea(this.ascBjUsmsOverallRmMain_rmcat1SumGrid,selectedTabName);
			this.ascBjUsmsOverallRmMain_rmcat1SumGrid.buildPostFooterRows = addTotalRowForHasServ;
	 	}
		
	},
	
	afterInitialDataFetch: function(){
		this.schMainRmCatSumTabs.addEventListener('afterTabChange',this.afterTabChange.createDelegate(this));
		calTotalJianzhuArea(this.ascBjUsmsOverallRmMain_rmcat1SumGrid);
	}
	
});

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function calTotalJianzhuArea(panel,tabName){
	
	var totalAreaJianZhu = 0.0;
	var totalProportion = 0.0;
    for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
		
		var fntstdPriceValue = row['rmcat.total_area_jianzhu'];	
		if(row['rmcat.total_area_jianzhu.raw']){
			fntstdPriceValue = row['rmcat.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalAreaJianZhu += parseFloat(fntstdPriceValue);
		}
		
    }
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	var hasServ = (tabName == 'yiFenTan') ? 0 : 1;
	calPercentAreaJianzhu(panel,totalAreaJianZhu,hasServ);
}

/**
 * Calculate the percent of the jianzhu area of per rmcat
 * @param {Object} panel
 * @param {Object} totleArea
 */
function calPercentAreaJianzhu(panel,totleArea,hasServ){
	var headerRow=null;
	if(panel.headerRows.length>0){
		headerRow=panel.headerRows[0];
	}else{
		return;
	}
	 
	var cellIndex =5;
	if (hasServ == 1) cellIndex =6;
	
	if (!headerRow.cells[cellIndex]) {
		var new_th = document.createElement('th');
		headerRow.appendChild(new_th);
	}
	
	for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
        var rmcatProportion = 0.0;
		
		var rmcatAreaJianzhuValue = row['rmcat.total_area_jianzhu'];	
		if(row['rmcat.total_area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['rmcat.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
//		var rowEl = Ext.get(row.row.dom).dom;
//		addColumn(rowEl,1);
//		
//		headerRow.cells[cellIndex].innerHTML='占比';
//		rowEl.cells[cellIndex].innerHTML = rmcatProportion.toFixed(2) + '%';
		panel.gridRows.items[i].cells.items[cellIndex].dom.innerHTML =rmcatProportion.toFixed(2) + '%';
		
    }
	
}

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRowForHasServ(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	
    var totalRoomCount = 0.0;
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
	var totalZhanBi = 0.0;
	
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
    	//room count
		var rmTypeRoomCount = row['rmcat.total_count_rm'];
		if(row['rmcat.total_count_rm.raw']){
			rmTypeRoomCount = row['rmcat.total_count_rm.raw'];
		}
		if (!isNaN(parseInt(rmTypeRoomCount))) {
			totalRoomCount += parseInt(rmTypeRoomCount);
		}
        //shiyong area
		var blAreaShiyong = row['rmcat.total_area_shiyong'];
		if(row['rmcat.total_area_shiyong.raw']){
			blAreaShiyong = row['rmcat.total_area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(blAreaShiyong))) {
			totalAreaShiyong += parseFloat(blAreaShiyong);
		}
		
		//jianzhu area
		var blAreaJianZhu = row['rmcat.total_area_jianzhu'];	
		if(row['rmcat.total_area_jianzhu.raw']){
			blAreaJianZhu = row['rmcat.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(blAreaJianZhu))) {
			totalAreaJianZhu += parseFloat(blAreaJianZhu);
		}
    }
	
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	//totalZhanBi = calPercentAreaJianzhu(this,totalAreaJianZhu);
	//totalZhanBi  = totalProportion.toFixed(2);
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty	
    addColumn(gridRow, 1);
    // column 3: total area of Structure
    addColumn(gridRow, 1); 
	// column 4: total Room Count
    addColumn(gridRow, 1,totalRoomCount);
	// column 5: total jianzhu area
    addColumn(gridRow, 1, totalAreaJianZhu);
   // column 6: total shiyong area
    addColumn(gridRow, 1, totalAreaShiyong);
	// column 7: percent
    addColumn(gridRow, 1,"100%");
}

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRowForNoServ(parentElement){
    if (this.rows.length < 2) {
        return;
    }
    
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
	var totalZhanBi = 0.0;
	
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
        //shiyong area
		var blAreaShiyong = row['rmcat.total_area_shiyong'];
		if(row['rmcat.total_area_shiyong.raw']){
			blAreaShiyong = row['rmcat.total_area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(blAreaShiyong))) {
			totalAreaShiyong += parseFloat(blAreaShiyong);
		}
		
		//jianzhu area
		var blAreaJianZhu = row['rmcat.total_area_jianzhu'];	
		if(row['rmcat.total_area_jianzhu.raw']){
			blAreaJianZhu = row['rmcat.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(blAreaJianZhu))) {
			totalAreaJianZhu += parseFloat(blAreaJianZhu);
		}
    }
	
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	//totalZhanBi = calPercentAreaJianzhu(this,totalAreaJianZhu);
	//totalZhanBi  = totalProportion.toFixed(2);
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty	
    addColumn(gridRow, 1);
	// column 3: empty	
    addColumn(gridRow, 1);
	// column 4: total manage_area
    addColumn(gridRow, 1, totalAreaJianZhu);
   // column 5: total manage_area
    addColumn(gridRow, 1, totalAreaShiyong);
	// column 6: percent
    addColumn(gridRow, 1,"100%");
}


