/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallRmtypeWholeController', {

	afterViewLoad:function(){
		
		this.ascBjUsmsOverallRmtypeWhole_blGrid.buildPostFooterRows = addTotalRowForBl;
	},
    ascBjUsmsOverallRmtypeWhole_blGrid_afterRefresh: function(){
        var selectedRows = new Array();
        var grid = View.panels.get('ascBjUsmsOverallRmtypeWhole_blGrid');
		calTotalJianzhuArea(grid);
        var dataRows = grid.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            dataRow.cells['0'].innerHTML = r + 1;
        }
    }
});


/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function calTotalJianzhuArea(panel){
	
	var totalAreaJianZhu = 0.0;
	var totalProportion = 0.0;
    for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
		
		var fntstdPriceValue = row['rmtype.total_area_jianzhu'];	
		if(row['rmtype.total_area_jianzhu.raw']){
			fntstdPriceValue = row['rmtype.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalAreaJianZhu += parseFloat(fntstdPriceValue);
		}
		
    }
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
	calPercentAreaJianzhu(panel,totalAreaJianZhu);
}

/**
 * Calculate the percent of the jianzhu area of per rmcat
 * @param {Object} panel
 * @param {Object} totleArea
 */
function calPercentAreaJianzhu(panel,totleArea){
	
	var headerRow =  panel.headerRows[0];
	if (!headerRow.cells[5]) {
		var new_th = document.createElement('th');
		headerRow.appendChild(new_th);
	}
	
	for (var i = 0; i < panel.rows.length; i++) {
        var row = panel.rows[i];
        var rmcatProportion = 0.0;
		
		var rmcatAreaJianzhuValue = row['rmtype.total_area_jianzhu'];	
		if(row['rmtype.total_area_jianzhu.raw']){
			rmcatAreaJianzhuValue = row['rmtype.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(rmcatAreaJianzhuValue)) && (!isNaN(parseFloat(totleArea)))) {
			if (parseFloat(totleArea) != 0){
				rmcatProportion = parseFloat(rmcatAreaJianzhuValue)*100.0/parseFloat(totleArea);
			}
		}
		var rowEl = Ext.get(row.row.dom).dom;
		addColumn(rowEl,1);
		
		headerRow.cells[3].innerHTML='占比';
		rowEl.cells[3].innerHTML = rmcatProportion.toFixed(2) + '%';
		
    }
	
}



/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRowForBl(parentElement){
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
		var rmTypeRoomCount = row['rmtype.count_rm'];
		if(row['rmtype.count_rm.raw']){
			rmTypeRoomCount = row['rmtype.count_rm.raw'];
		}
		if (!isNaN(parseInt(rmTypeRoomCount))) {
			totalRoomCount += parseInt(rmTypeRoomCount);
		}
        //shiyong area
		var blAreaShiyong = row['rmtype.total_area_shiyong'];
		if(row['rmtype.total_area_shiyong.raw']){
			blAreaShiyong = row['rmtype.total_area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(blAreaShiyong))) {
			totalAreaShiyong += parseFloat(blAreaShiyong);
		}
		
		//jianzhu area
		var blAreaJianZhu = row['rmtype.total_area_jianzhu'];	
		if(row['rmtype.total_area_jianzhu.raw']){
			blAreaJianZhu = row['rmtype.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(blAreaJianZhu))) {
			totalAreaJianZhu += parseFloat(blAreaJianZhu);
		}
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty	
//    addColumn(gridRow, 1);
    // column 3: total area of Structure
    addColumn(gridRow, 1,totalRoomCount); 
	// column 4: total shiyong area
    addColumn(gridRow, 1, totalAreaJianZhu);
	// column 5: total manage_area
    addColumn(gridRow, 1, totalAreaShiyong);
   // column 6: total manage_area
    addColumn(gridRow, 1);
}