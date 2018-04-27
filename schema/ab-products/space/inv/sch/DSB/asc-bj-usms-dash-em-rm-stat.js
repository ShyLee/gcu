

View.createController('ascBjUsmsDashStatController', {
	
	
	afterViewLoad:function(){
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('fujiaoshouRes',"副教授");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('jiangshiRes',"讲师");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('zhujiaoRes',"助教");
		this.ascBjUsmsEmRmStat_emSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
        
		this.ascBjUsmsDashEmRmStatCht_Hign6.addParameter('jiaoshouRes',"副教授");
		this.ascBjUsmsDashEmRmStatCht_Hign6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDsshEmRmStatGrid_High6.addParameter('jiaoshouRes',"副教授");
		this.ascBjUsmsDsshEmRmStatGrid_High6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDashEmRmStatCht_Lower6.addParameter('jiaoshouRes',"副教授");
		this.ascBjUsmsDashEmRmStatCht_Lower6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDashEmRmStatGrid_Lower6.addParameter('jiaoshouRes',"副教授");
		this.ascBjUsmsDashEmRmStatGrid_Lower6.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('danrenjianRes',"单人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('shuangrenjianRes',"双人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('sanrenjianRes',"三人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('duorenjianRes',"多人间");
		this.ascBjUsmsDashEmRmStatJiaoShouCht.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		
		this.emCrossPanel.addParameter('jiaoshouRes',"教授");
		this.emCrossPanel.addParameter('danrenjianRes',"单人间");
		this.emCrossPanel.addParameter('shuangrenjianRes',"双人间");
		this.emCrossPanel.addParameter('sanrenjianRes',"三人间");
		this.emCrossPanel.addParameter('duorenjianRes',"多人间");
		this.emCrossPanel.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
				
	},
	ascBjUsmsEmRmStat_emSumGrid_afterRefresh:function(){
		var rec=this.ds_whole_school.getRecords();
		var blankRow=new Object();
		blankRow["em.zhic_id"] = '';
        blankRow["em.count_em"] ='';
        blankRow["em.count_rm"] =  '';
        blankRow["em.total_area_shiyong"] = '';
        blankRow["em.avg_area_shiyong"] =  '';
	    blankRow["em.avg_occu_rm"] = '';
	    var gridRow = document.createElement('tr');
		var totalRow = new Object();
        totalRow["em.zhic_id"] = '全校教职工';
        totalRow["em.count_em"] = rec[0].getValue("em.count_em");
        totalRow["em.count_rm"] =  rec[0].getValue("em.count_rm");
        totalRow["em.total_area_shiyong"] =  rec[0].getValue("em.total_area_shiyong");
        totalRow["em.avg_area_shiyong"] =  rec[0].getValue("em.avg_area_shiyong");
	    totalRow["em.avg_occu_rm"] =  rec[0].getValue("em.avg_occu_rm");
		this.ascBjUsmsEmRmStat_emSumGrid.addRow(gridRow);
	
        this.ascBjUsmsEmRmStat_emSumGrid.addRow(totalRow);
        this.ascBjUsmsEmRmStat_emSumGrid.reloadGrid();
		
		jQuery(this.ascBjUsmsEmRmStat_emSumGrid.getEl().dom).find("td").css( "height", 15);
        //Ext.get(rows[rows.length - 1].row.dom).setStyle('color', '#4040f0');
        //Ext.get(rows[rows.length - 1].row.dom).setStyle('font-weight', 'bold');
	},
	ascBjUsmsDashEmRmStatCrossRpt_afterGetData:function(){
		//this.ascBjUsmsDashEmRmStatCrossRpt.calculatedFields[0].showTotals = false;
		//this.ascBjUsmsDashEmRmStatCrossRpt.calculatedFields[1].showTotals = false;
		//this.ascBjUsmsDashEmRmStatCrossRpt.calculatedFields[2].showTotals = false;
	}
	
});
function showTeacherUseRmDetail(row){
    var rmcatSumGridPanel = View.panels.get('ascBjUsmsEmRmStat_emSumGrid');
    var selectRow = rmcatSumGridPanel.rows[rmcatSumGridPanel.selectedRowIndex];
    var rmcat = selectRow['em.zhic_id'];
    var restriction = new Ab.view.Restriction();
    if (valueExistsNotEmpty(rmcat)) {
		if(rmcat=='全校教职工'){
				  	  restriction.addClause('em.zhic_id', '','is not null');	
		}else{
	  restriction.addClause('em.zhic_id', rmcat, '=');
		}
      
    }
    View.openDialog('asc-bj-usms-dash-em-rm-stat-teach-dialog.axvw', restriction, true, {
        width: 800,
        height: 800,
        zhic_id:rmcat,
        closeButton: false
    });
   
  
   }



