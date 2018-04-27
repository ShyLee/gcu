/**
  * @author Keven.xi
 */
View.createController('ascBjUsmsOverallDeptOccuDashWholeController', {
	
	siteId:"",
	totalUseableAreaSum:0,
	totalJianZhuAreaSum:0,
	CountEmSum:0,
	CountEmAdjustSum:0,
	AreaAvgEmSum:0,
	CountStudentSum:0,
	
	afterViewLoad:function(){
		
		this.ascBjUsmsOverallDeptOccuDashWholeTeachChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashWholeMangeChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsOverallDeptOccuDashWhole_teachDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashWhole_manageDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
	
	},
	ascBjUsmsDashRmStatbyDpWhole_siteBasicGrid_onShowSiteImage:function(){
		View.openDialog('asc-bj-usms-overall-site-image.axvw', null, false, {width:550, height:600, closeButton:false,siteId:this.siteId});
	},
});
