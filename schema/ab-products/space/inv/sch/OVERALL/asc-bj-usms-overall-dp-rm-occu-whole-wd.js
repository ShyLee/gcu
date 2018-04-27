/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsOverallDeptOccuWholeController', {
	
	afterViewLoad:function(){
		this.ascBjUsmsOverallDeptOccuWhole_dvGrid.addParameter('xuexiaoBuDv', "学校");
		this.ascBjUsmsOverallDeptOccuWhole_dvGrid.addParameter('wuDv', "无");
	},
	
	ascBjUsmsOverallDeptOccuWhole_dvGrid_afterRefresh:function(){
		this.setStyle();
		this.getTotalRow();
	},
	
	setStyle:function(){
		var rows = this.ascBjUsmsOverallDeptOccuWhole_dvGrid.rows;
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			for (var j=7;j<10;j++){
				row.row.cells.items[j].dom.bgColor = '#fff5d1';
			}
		}
	},
	
	ascBjUsmsOverallDeptOccuWhole_siteBasicGrid_onFixedReport:function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"dpReport",closeButton:false});
		//View.openDialog('asc-bj-usms-overall-rpt-dp-rm-stat.axvw', null, false, {width:470, height:200, closeButton:false});
	},
	
	getTotalRow:function(){
		var totalAreaJianzhu = this.ascBjUsmsOverallDeptOccuWhole_dvGrid.totals.getValue('dv.sum_area_jianzhu');
		var totalAreaShiyong = this.ascBjUsmsOverallDeptOccuWhole_dvGrid.totals.getValue('dv.sum_area_rm');
		
		document.getElementById("area_jianzhu").innerHTML= ""+totalAreaJianzhu;
        document.getElementById("area_shiyong").innerHTML = ""+totalAreaShiyong;
	}
	
});


