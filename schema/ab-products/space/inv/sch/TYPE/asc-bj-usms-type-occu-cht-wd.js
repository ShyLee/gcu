/**
 * @author Keven.xi
 */
var controller = View.createController('abScRmtypeChartPiebyRmcatController', {
	
	afterViewLoad:function(){
		this.abScRmtypebyRmcat_rmcatSumGrid.buildPostFooterRows = addTotalRow;
		this.abScRmtypebyRmcat_rmcatSumGrid.sortEnabled = false;
	},
	
	afterInitialDataFetch: function(){
		this.refreshTypeGrid();
	},
	
	refreshTypeGrid:function(){
		//class room
		//教室
		this.abScRmtypebyRmcat_type1SumGrid.addParameter("rmcatRes","教室");
		this.abScRmtypebyRmcatChartPie_rmtype1.addParameter("rmcatRes","教室");
		this.abScRmtypebyRmcat_type1SumGrid.refresh();
		this.abScRmtypebyRmcatChartPie_rmtype1.refresh();
		
		//lab room
		//实验室
		this.abScRmtypebyRmcat_type2SumGrid.addParameter("rmcatRes","实验室、实习场所");
		this.abScRmtypebyRmcatChartPie_rmtype2.addParameter("rmcatRes","实验室、实习场所");
		this.abScRmtypebyRmcat_type2SumGrid.refresh();
		this.abScRmtypebyRmcatChartPie_rmtype2.refresh();
		
		//faculty administration room
		//教学单位办公用房
		this.abScRmtypebyRmcat_type3SumGrid.addParameter("rmcatRes","教学单位办公用房");
		this.abScRmtypebyRmcatChartPie_rmtype3.addParameter("rmcatRes","教学单位办公用房");
		this.abScRmtypebyRmcat_type3SumGrid.refresh();
		this.abScRmtypebyRmcatChartPie_rmtype3.refresh();
		
		//university administration room
		//机关单位办公用房
		this.abScRmtypebyRmcat_type4SumGrid.addParameter("rmcatRes","机关单位办公用房");
		this.abScRmtypebyRmcatChartPie_rmtype4.addParameter("rmcatRes","机关单位办公用房");
		this.abScRmtypebyRmcat_type4SumGrid.refresh();
		this.abScRmtypebyRmcatChartPie_rmtype4.refresh();
		
		
	}
	
});

/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
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
    // column 2: total furniture standard count
    addColumn(gridRow, 1, ds.formatValue('rmcat.area', totalAreaShiyong, true));
    // column 3: total furniture standard price
    addColumn(gridRow, 1, ds.formatValue('rmcat.area_jianzhu', totalAreaJianZhu, true));
	// column 4: 
    addColumn(gridRow, 1);
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


