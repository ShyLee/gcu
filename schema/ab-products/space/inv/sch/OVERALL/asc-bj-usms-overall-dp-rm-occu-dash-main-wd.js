/**
 * @author Keven.xi
 */


View.createController('ascBjUsmsOverallDeptOccuDashMainController', {
	
	siteId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;		
		
		this.ascBjUsmsOverallDeptOccuDashMainTeachChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashMainTeachChtPie.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsOverallDeptOccuDashMainMangeChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsOverallDeptOccuDashMainMangeChtPie.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsOverallDeptOccuDashMain_teachDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsOverallDeptOccuDashMain_teachDvSumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsOverallDeptOccuDashMain_manageDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsOverallDeptOccuDashMain_manageDvSumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsOverallDeptOccuDashMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
	}
	
	
	
});
