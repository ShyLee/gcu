/**
 * @author Keven.xi
 */
var  ascBjUsmsDsbZzfController = View.createController('ascBjUsmsDsbZzfController', {
    blId: "",
    //----------------event handle--------------------
    afterViewLoad: function(){
		
		this.ascBjUsmsDashZzzWholeStatCrossTablePanle.addEventListener('afterGetData', this.ascBjUsmsDashZzzWholeStatCrossTablePanle_afterGetData, this);
        this.ascBjUsmsDashZzzWholeStatBlListPanel.addParameter('rmtype', "周转房");
        this.ascBjUsmsDashZzzWholeStatRmListPanel.addParameter('rmtype', "周转房");
        this.ascBjUsmsDashZzzWholeStatCrossTablePanle.addParameter('rmTypeRes', "周转房");
        
        
        document.getElementById("zhouzhuangfangfangzu").value = getMessage("zhouzhuangfangfangzu");
        document.getElementById("teacherRmSubsidy").value = getMessage("jiaogongzhufangbutie");
        document.getElementById("rmDueReminders").value = getMessage("zhouzhuangfangdaoqitixing");
        document.getElementById("currentMonthReport").value = getMessage("currentMonthReport");
        document.getElementById("chaxunkongzhifang").value = getMessage("chaxunkongzhifang");
        
    },
    afterInitialDataFetch: function(){
        var dataRows = this.ascBjUsmsDashZzzWholeStatBlListPanel.getDataRows();
        if (dataRows.length > 0) {
            this.blId = document.getElementById("ascBjUsmsDashZzzWholeStatBlListPanel_row0_bl.bl_id").innerHTML;
            var restriction = new Ab.view.Restriction();
            restriction.addClause("rm.bl_id", this.blId, "=");
            this.ascBjUsmsDashZzzWholeStatRmListPanel.refresh(restriction);
        }
    },
	
	ascBjUsmsDashZzzWholeStatCrossTablePanle_afterGetData:function(panel, dataSet){
		
        var grid = View.panels.get("crossTalbeGrid");
        var rec = new Ab.data.Record();
        grid.columns[0].name = "";
        grid.columns[1].name = "";
        grid.columns[2].name = dataSet.rowValues[0].l;
        grid.columns[3].name = dataSet.rowValues[1].l;
        grid.columns[4].name = dataSet.columnValues[0].l;
        grid.columns[5].name = dataSet.columnValues[1].l;
        grid.columns[6].name = dataSet.columnValues[2].l;
        grid.columns[7].name = dataSet.columnValues[3].l;
        rec.setValue("rm.row_title","周转房总套数：");
        rec.setValue("rm.rm_sum",dataSet.totals[0].getLocalizedValue("rm.rm_count_summary"));
        rec.setValue("rm.rm_sum_in",dataSet.rowSubtotals[0].getLocalizedValue("rm.rm_count_summary"));
        rec.setValue("rm.rm_sum_out",dataSet.rowSubtotals[1].getLocalizedValue("rm.rm_count_summary"));
        rec.setValue("rm.rm_1", dataSet.columnSubtotals[0].getLocalizedValue("rm.rm_count_summary"));
        rec.setValue("rm.rm_2", dataSet.columnSubtotals[1].getLocalizedValue("rm.rm_count_summary"));
        rec.setValue("rm.rm_3", dataSet.columnSubtotals[2].getLocalizedValue("rm.rm_count_summary"));
        rec.setValue("rm.rm_4", dataSet.columnSubtotals[3].getLocalizedValue("rm.rm_count_summary"));
        grid.addGridRow(rec);
        rec.setValue("rm.row_title","建筑物栋数：");
        rec.setValue("rm.rm_sum",dataSet.totals[0].getLocalizedValue("bl.bl_count_summary"));
        rec.setValue("rm.rm_sum_in",dataSet.rowSubtotals[0].getLocalizedValue("bl.bl_count_summary"));
        rec.setValue("rm.rm_sum_out",dataSet.rowSubtotals[1].getLocalizedValue("bl.bl_count_summary"));
        rec.setValue("rm.rm_1", "");
        rec.setValue("rm.rm_2", "");
        rec.setValue("rm.rm_3", "");
        rec.setValue("rm.rm_4", "");
        grid.addGridRow(rec);
        rec.setValue("rm.row_title","使用面积：");
        rec.setValue("rm.rm_sum",dataSet.totals[0].getLocalizedValue("rm.area_rm_summary"));
        rec.setValue("rm.rm_sum_in",dataSet.rowSubtotals[0].getLocalizedValue("rm.area_rm_summary"));
        rec.setValue("rm.rm_sum_out",dataSet.rowSubtotals[1].getLocalizedValue("rm.area_rm_summary"));
        rec.setValue("rm.rm_1", dataSet.columnSubtotals[0].getLocalizedValue("rm.area_rm_summary"));
        rec.setValue("rm.rm_2", dataSet.columnSubtotals[1].getLocalizedValue("rm.area_rm_summary"));
        rec.setValue("rm.rm_3", dataSet.columnSubtotals[2].getLocalizedValue("rm.area_rm_summary"));
        rec.setValue("rm.rm_4", dataSet.columnSubtotals[3].getLocalizedValue("rm.area_rm_summary"));
        grid.addGridRow(rec);
        grid.sortEnabled = false;
        grid.update();
	},
    //房间号 连接 周转房房间详细信息
    ascBjUsmsDashZzzWholeStatRmListPanel_viewHouseInfo_onClick: function(row){
		
        View.openDialog('asc-bj-usms-zzf-vw-house-detail-info-dialog.axvw', null, false, {
            width: 1000,
            height: 500,
			blId:row.record['rm.bl_id'],
			flId:row.record['rm.fl_id'],
			rmId:row.record['rm.rm_id'],
            closeButton: false
        });
        
    },
    //单击console上的过滤按钮执行此方法
    requestPanel_onShow: function(){
        var restriction = new Ab.view.Restriction();
        var consolePanel = this.requestPanel;
        var blId = consolePanel.getFieldValue("bl.bl_id");
        var location = consolePanel.getFieldValue("bl.location");
        if (valueExistsNotEmpty(blId)) {
            restriction.addClause("bl.bl_id", blId + '%', "LIKE");
        }
        if (valueExistsNotEmpty(location)) {
            restriction.addClause("bl.location", location, "=");
        }
        this.ascBjUsmsDashZzzWholeStatRmListPanel.show(false);
        this.ascBjUsmsDashZzzWholeStatBlListPanel.refresh(restriction);
        
    },
    //建筑物名称 连接 建筑物房产信息摘要
    ascBjUsmsDashZzzWholeStatBlListPanel_fangchanxixin_onClick: function(row){
        var blId = row.record['bl.bl_id'];
        
        View.openDialog('asc-bj-usms-bl-summary-info.axvw', null, false, {
            width: 1000,
            height: 500,
            closeButton: false,
            openBlId: blId
        
        });
    },
    ascBjUsmsDashZzzWholeStatRmListPanel_afterRefresh: function(){
        this.ascBjUsmsDashZzzWholeStatRmListPanel.setTitle(this.blId);
    }
    
    
});

function onClickZhuhuName(ob){
	    var gridpanel = View.panels.get('ascBjUsmsDashZzzWholeStatRmListPanel');
	    var selectedIndex = gridpanel.selectedRowIndex;
		var selectedRec = gridpanel.gridRows.items[selectedIndex].getRecord();
	    var cardId = selectedRec.getValue("rm.card_id");
		var emId = selectedRec.getValue("rm.em_id");
		var emName = selectedRec.getValue("rm.em_name");
        View.openDialog('asc-bj-usms-zzf-vw-house-by-em.axvw', null, false, {
            width: 900,
            height: 800,
            closeButton: false,
            emId: emId,
            emName: emName,
            cardId: cardId
        });	
}

function onClickZZFBl(ob){
	ascBjUsmsDsbZzfController.blId = ob.getRestriction()["bl.bl_id"];
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.bl_id",ascBjUsmsDsbZzfController.blId,"=");
	var zzfRmListGrid = View.panels.get('ascBjUsmsDashZzzWholeStatRmListPanel');
	zzfRmListGrid.refresh(restriction);
	
}
function viewAllEmptyRm(){
    View.openDialog('asc-bj-usms-zzf-search-vacant.axvw', null, false, {
        width: 1000,
        height: 500,
        closeButton: false
    
    });
    
}

//周转房房租
function zhouzhuangfangfangzu(){


    View.openDialog('asc-bj-usms-zzf-rpt-rent-revenue.axvw', null, false, {
        width: 1000,
        height: 500,
        closeButton: false
    
    });
}

//教工住房补贴
function teacherRmSubsidy(){


    View.openDialog('asc-bj-usms-zzf-rpt-em-subsidy.axvw', null, false, {
        width: 1000,
        height: 500,
        closeButton: false
    
    });
}


//周转房到期提醒
function rmDueReminders(){


    View.openDialog('asc-bj-usms-zzf-alert-board.axvw', null, false, {
        width: 1000,
        height: 500,
        closeButton: false
    
    });
}


//当月报盘表
function currentMonthReport(){

    View.openDialog('asc-bj-usms-zzf-rpt-rent-offer.axvw', null, false, {
        width: 1000,
        height: 500,
        closeButton: false
    
    });
}

