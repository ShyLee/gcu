/**
 * @author Keven.xi
 */
var abScRptRmbyBlRmcat = View.createController('abScRptRmbyBlRmcatController', {
	
	rm_cat:"",
	rmcat_name:"",
	bl_id:"",
	blName:"",
	
	afterViewLoad: function(){
		this.abScRptRmbyBlRmcat_rmcatSumGrid.buildPostFooterRows = addTotalRow;
		this.abScRptRmbyBlRmcat_rmcatSumGrid.sortEnabled = false;
		
	},
	
	/**
	 * 
	 */
	abScRptRmbyBlRmcat_blSumGrid_afterRefresh: function(){
		var title = String.format(getMessage('secondPanelTitle'),this.rmcat_name );
		this.abScRptRmbyBlRmcat_blSumGrid.setTitle(title);
		
//		this.rm_type = "";
//		var restriction = new Ab.view.Restriction();
//		restriction.addClause("rm.rm_type","-1","=");
//		this.abScRptRmbyBlRmcat_rmGrid.refresh(restriction);
		
	},
	
	abScRptRmbyBlRmtype_typeSumGrid_afterRefresh: function(){
		var title = "各类房屋类型汇总："+this.rmcat_name ;
		this.abScRptRmbyBlRmtype_typeSumGrid.setTitle(title);
	},
	
	abScRptRmbyBlRmcat_rmGrid_afterRefresh:function(){
		var title = String.format(getMessage('bottomPanelTitle'),this.blName);
		this.abScRptRmbyBlRmcat_rmGrid.setTitle(title);
	},
	abScRptRmbyBlRmcat_blSumGrid_viewBl_onClick: function(row){
        viewBuilding(row);
    }
	
});


function onRefreshSecondReport(){
	var rmcatPanel = View.panels.get("abScRptRmbyBlRmcat_rmcatSumGrid");
	var rmtypePanel = View.panels.get("abScRptRmbyBlRmtype_typeSumGrid");
	abScRptRmbyBlRmcat.rm_cat = rmcatPanel.rows[rmcatPanel.selectedRowIndex]["rmcat.rm_cat"];
	abScRptRmbyBlRmcat.rmcat_name = rmcatPanel.rows[rmcatPanel.selectedRowIndex]["rmcat.rmcat_name"];
	var blPanel = View.panels.get("abScRptRmbyBlRmcat_blSumGrid");
	blPanel.addParameter("rmcatRes",abScRptRmbyBlRmcat.rm_cat);
	rmtypePanel.addParameter("rmcatRes",abScRptRmbyBlRmcat.rm_cat);
	blPanel.refresh();
	rmtypePanel.refresh();
}

function onRefreshBottomReport(){
	var rmPanel = View.panels.get("abScRptRmbyBlRmcat_rmGrid");
	var blPanel = View.panels.get("abScRptRmbyBlRmcat_blSumGrid");
	abScRptRmbyBlRmcat.bl_id = blPanel.rows[blPanel.selectedRowIndex]["bl.bl_id"];
	abScRptRmbyBlRmcat.blName= blPanel.rows[blPanel.selectedRowIndex]["bl.name"];
	
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.rm_cat",abScRptRmbyBlRmcat.rm_cat,"=");
	restriction.addClause("rm.bl_id",abScRptRmbyBlRmcat.bl_id,"=");
	rmPanel.refresh(restriction);
	rmPanel.showInWindow({
        width: 900,
        height: 700
    });
	
}

function onRefreshTypeReport(){
	var rmPanel = View.panels.get("abScRptRmbyBlRmcat_rmGrid");
	var blPanel = View.panels.get("abScRptRmbyBlRmcat_blSumGrid");
	var rmTypePanel=View.panels.get('abScRptRmbyBlRmtype_typeSumGrid');
//	var rmType=rmTypePanel.rows[rmTypePanel.selectedRowIndex]["rmtype.rm_type"];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rmcat.rm_cat",abScRptRmbyBlRmcat.rm_cat,"=");
//	restriction.addClause("rmtype.rm_type",rmType,"=");
	rmPanel.refresh(restriction);
	rmPanel.showInWindow({
        width: 900,
        height: 700
    });
}
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
	
	calPercentAreaJianzhu(this,totalAreaJianZhu);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 2: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
    // column 3: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('rmcat.area_jianzhu', totalAreaJianZhu, true));
    // column 4: total area of shiyong
    addColumn(gridRow, 1, ds.formatValue('rmcat.area', totalAreaShiyong, true));
	// column 5: empty	
    addColumn(gridRow, 1);
}

/**
 * Calculate the percent of the jianzhu area of per rmcat
 * @param {Object} panel
 * @param {Object} totleArea
 */
function calPercentAreaJianzhu(panel,totleArea){
	
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
		rowEl.cells[4].innerHTML = rmcatProportion.toFixed(2)+'%';
    }
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

function viewBuilding(row){
	var blId=row.record["bl.bl_id"];
	var rmcat =row.record["rmcat.rm_cat"];
	var blName =row.record["bl.name"];
    View.openDialog('asc-bj-usms-type-rm-by-bl.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
        blId: blId,
		blName:blName,
		rmcat:rmcat
    });
    
    
}