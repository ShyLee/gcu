/**
 * @author Keven.xi
 */
var ascBjUsmsDashRmStatbyDpWholeController=View.createController('ascBjUsmsDashRmStatbyDpWholeController', {
	
	siteId:"",
	totalUseableAreaSum:0,
	totalJianZhuAreaSum:0,
	CountEmSum:0,
	CountEmAdjustSum:0,
	AreaAvgEmSum:0,
	CountStudentSum:0,
	
	afterInitialFetch:function(){
		this.ascBjUsmsDashRmStatbyDpWholeTeachChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsDashRmStatbyDpWholeMangeChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGridHidden.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsDashRmStatbyDpWhole_manageDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		//restriction : Main Campus
		this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		this.ascBjUsmsDashRmStatbyDpWhole_siteBasicGrid.addParameter('siteIdRes',this.siteId);
//		this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGrid.addEventListener("afterGetData", calculateAvgEmArea);
		
		this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGrid.buildPreHeaderRows = addTotalRowForData;
		
		this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGrid.sortEnabled = false;
	},
	
	ascBjUsmsDashRmStatbyDpWhole_siteBasicGrid_onShowSiteImage:function(){
		View.openDialog('asc-bj-usms-overall-site-image.axvw', null, false, {width:550, height:600, closeButton:false,siteId:this.siteId});
		
	},
	/**
	 * 计算教学科研类单位的人均面积（总使用面积/修正后的人数）
	 */
		addTotalRow:function(){
		var rows=this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGridHidden.rows;
		for(var i=0;i<rows.length;i++){
			var jxky=this.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGridHidden.gridRows.get(i);
			var totalUseableArea=jxky.getFieldValue("dv.area_rm");
			var totalJianZhuArea=jxky.getFieldValue("dv.area_jianzhu");
			var CountEm=jxky.getFieldValue("dv.count_em");
			var CountEmAdjust=jxky.getFieldValue("dv.count_em_adjust");
			var CountStudent=jxky.getFieldValue("dv.count_student");
			
			this.totalUseableAreaSum=this.totalUseableAreaSum+parseFloat(totalUseableArea);
			this.totalJianZhuAreaSum=this.totalJianZhuAreaSum+parseFloat(totalJianZhuArea);
			this.CountEmSum=this.CountEmSum+parseInt(CountEm);
			this.CountEmAdjustSum=this.CountEmAdjustSum+parseInt(CountEmAdjust);
			this.CountStudentSum=this.CountStudentSum+parseInt(CountStudent);

		}
		var a=this.totalUseableAreaSum;
		var b=this.totalJianZhuAreaSum.toFixed(2);
		var c=this.CountEmSum;
		var d=this.CountEmAdjustSum;
		//计算教学科研类单位的人均面积（总使用面积/修正后的人数）
		if(this.CountEmAdjustSum!=0){
			this.AreaAvgEmSum=this.totalUseableAreaSum/this.CountEmAdjustSum
		}else{
			this.AreaAvgEmSum=0.00;
		}
		
	},
	ascBjUsmsDashRmStatbyDpWhole_buSummaryGrid_afterRefresh:function(){
		
		var len = this.ascBjUsmsDashRmStatbyDpWhole_buSummaryGrid.rows.length;
		for (var i=0; i< len;i++){
			var row = this.ascBjUsmsDashRmStatbyDpWhole_buSummaryGrid.rows[i];
			if (row["bu.bu_class.raw"] == ascBjUsmsConstantControl.BU_CLASS_GGZY){
				var rowEl = Ext.get(row.row.dom).dom;
				rowEl.cells[1].innerHTML = "0";
				break;
			}
		}
	}
	
	
});

function showDvListByBu(){
	var dvListGrid = View.panels.get('ascBjUsmsDashRmStatbyBuWhole_dvGrid');
	var buListGrid = View.panels.get('ascBjUsmsDashRmStatbyDpWhole_buSummaryGrid');
	var selectedIndex = buListGrid.selectedRowIndex;
	var selectedRec = buListGrid.gridRows.items[selectedIndex].getRecord();
	var buId = selectedRec.getValue("bu.bu_id");
	var restriction = new Ab.view.Restriction();
	restriction.addClause('dv.bu_id', buId, '=');
    dvListGrid.refresh(restriction);
    dvListGrid.showInWindow({
        width: 800,
        height: 600
    });
	
}

function calculateAvgEmArea(reportGrid,data){
	if(data.records.length == 0){
		return;
	}
	var dataSource = reportGrid.getDataSource();
	var mainTableName = dataSource.mainTableName;
	var record = data.records[0];
	var totals = data.totals;
	dataSource.fieldDefs.each(function(fieldDef){
		if(fieldDef.showTotals){
			var id = valueExists(fieldDef.fullName) ? fieldDef.fullName : fieldDef.id;
			if(valueExists(fieldDef.currencyField)){
				fieldDef.currency = record[fieldDef.currencyField];
			}
			var name = id;
			if (name.indexOf('.') != -1) {
				name = name.substring(name.indexOf('.') + 1);
			}
			var totalsName = mainTableName + '.sum_' + name;
			if(valueExists( data.totals[totalsName])){
				var neutralValue =  data.totals[totalsName].n;
				var localizedValue = dataSource.formatValue(id, neutralValue, true);
				 data.totals[totalsName].l = localizedValue;
			}
		}
	});
	
}


/**
 * 添加总计
 */
function addTotalRowForData(parentElement){
    if (this.rows.length < 2) {
        return;
    }
    ascBjUsmsDashRmStatbyDpWholeController.addTotalRow();
    ascBjUsmsDashRmStatbyDpWholeController.ascBjUsmsDashRmStatbyDpWhole_teachDvSumGridHidden.show(false);
    var gridRow = document.createElement('tr');
    var parentElement;
    parentElement.appendChild(gridRow);
    addColumn(gridRow, 1,"合计:");
    addColumn(gridRow, 1,ascBjUsmsDashRmStatbyDpWholeController.totalUseableAreaSum.toFixed(2));
    addColumn(gridRow, 1, ascBjUsmsDashRmStatbyDpWholeController.totalJianZhuAreaSum.toFixed(2));
    addColumn(gridRow, 1, ascBjUsmsDashRmStatbyDpWholeController.CountEmSum);
    addColumn(gridRow, 1, ascBjUsmsDashRmStatbyDpWholeController.CountEmAdjustSum.toFixed(0));
    addColumn(gridRow, 1, ascBjUsmsDashRmStatbyDpWholeController.AreaAvgEmSum.toFixed(2));
    addColumn(gridRow, 1,ascBjUsmsDashRmStatbyDpWholeController.CountStudentSum);
}

/**
 * 这个方法在asc-bj-usms-overall-common.js中
 */
//function addColumn(gridRow, count, text){
//    for (var i = 0; i < count; i++) {
//        var gridCell = document.createElement('th');
//        if (text) {
//            gridCell.innerHTML = text;
//            gridCell.style.textAlign = 'right';
//            gridCell.style.color = 'blue';
//        }
//        gridRow.appendChild(gridCell);
//    }
//}


    
