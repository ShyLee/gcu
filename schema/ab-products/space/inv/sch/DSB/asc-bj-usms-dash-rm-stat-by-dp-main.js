/**
 * @author Keven.xi
 */


View.createController('ascBjUsmsDashRmStatbyDpMainController', {
	
	siteId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;		
		//var currentTab = View.getOpenerView().panels.get("campusTabs").finaTab(this.mainTabs.curSelectedTabName);
		//this.siteId = currentTab.siteId;
		
		this.ascBjUsmsDashRmStatbyDpMainTeachChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsDashRmStatbyDpMainTeachChtPie.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsDashRmStatbyDpMainMangeChtPie.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsDashRmStatbyDpMainMangeChtPie.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsDashRmStatbyDpMain_teachDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.ascBjUsmsDashRmStatbyDpMain_teachDvSumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsDashRmStatbyDpMain_manageDvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		this.ascBjUsmsDashRmStatbyDpMain_manageDvSumGrid.addParameter('siteIdRes',this.siteId);
		//restriction : Main Campus
		this.ascBjUsmsDashRmStatbyDpMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
	},
	
	ascBjUsmsDashRmStatbyDpMain_siteBasicGrid_onShowSiteImage:function(){
		View.openDialog('asc-bj-usms-overall-site-image.axvw', null, false, {width:550, height:600, closeButton:false,siteId:this.siteId});
		
	}
	
	
	
});
