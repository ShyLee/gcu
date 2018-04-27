/**
 * @author Keven.xi
 */

var ascBjUsmsOverallEmRmByZhicMain =  View.createController('ascBjUsmsOverallEmRmByZhicMainController', {
	
	
	siteId:"",
	zhicId:"",
	
	afterViewLoad:function(){
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;
		
		this.ascBjUsmsOverallEmRmByZhicMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallEmRmByZhicMain_siteSumGrid.addParameter('jiaoshouRes',"教授");
		this.ascBjUsmsOverallEmRmByZhicMain_siteSumGrid.addParameter('siteIdRes',this.siteId);
		
		this.ascBjUsmsOverallEmRmByZhicMain_zhicGrid.addParameter("jiaoshouRes","教授");
		this.ascBjUsmsOverallEmRmByZhicMain_zhicGrid.addParameter("fujiaoshouRes","副教授");
		this.ascBjUsmsOverallEmRmByZhicMain_zhicGrid.addParameter("jiangshiRes","讲师");
		this.ascBjUsmsOverallEmRmByZhicMain_zhicGrid.addParameter("zhujiaoRes","助教");
		this.ascBjUsmsOverallEmRmByZhicMain_zhicGrid.addParameter("siteIdRes",this.siteId);
	},
	
	ascBjUsmsOverallEmRmByZhicMain_emGrid_afterRefresh:function(){
		var title =String.format(getMessage('secondGridTitle'),this.zhicId );
		this.ascBjUsmsOverallEmRmByZhicMain_emGrid.setTitle(title);
	}
	
});

function onRefreshBottomReport(){
	var zhicGrid = View.panels.get("ascBjUsmsOverallEmRmByZhicMain_zhicGrid");
	ascBjUsmsOverallEmRmByZhicMain.zhicId = zhicGrid.rows[zhicGrid.selectedRowIndex]["sc_zhic.zhic_id"];
	var emGrid = View.panels.get("ascBjUsmsOverallEmRmByZhicMain_emGrid");
	emGrid.addParameter("zhicRes",ascBjUsmsOverallEmRmByZhicMain.zhicId);
	emGrid.addParameter("siteIdRes",ascBjUsmsOverallEmRmByZhicMain.siteId);
	emGrid.refresh();
}