/**
 * @author Keven.xi
 */
var ascBjUsmsOverallEmRmByZhicWhole =  View.createController('ascBjUsmsOverallEmRmByZhicWholeController', {
	
	
	siteId:"",
	zhicId:"",
	
	afterViewLoad:function(){
		this.ascBjUsmsOverallEmRmByZhicWhole_zhicGrid.addParameter("jiaoshouRes","教授");
		this.ascBjUsmsOverallEmRmByZhicWhole_zhicGrid.addParameter("fujiaoshouRes","副教授");
		this.ascBjUsmsOverallEmRmByZhicWhole_zhicGrid.addParameter("jiangshiRes","讲师");
		this.ascBjUsmsOverallEmRmByZhicWhole_zhicGrid.addParameter("zhujiaoRes","助教");
		
		//restriction : Main Campus
		//this.siteId = getMainCampus(); // common function in the asc-bj-usms-overall-common.js
		//this.ascBjUsmsOverallEmRmByZhicWhole_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallEmRmByZhicWhole_siteSumGrid.addParameter('jiaoshouRes',"教授");
        
	},
	
	ascBjUsmsOverallEmRmByZhicWhole_emGrid_afterRefresh:function(){
		var title =String.format(getMessage('secondGridTitle'),this.zhicId );
		this.ascBjUsmsOverallEmRmByZhicWhole_emGrid.setTitle(title);
	}
	
});

function onRefreshBottomReport(){
	var zhicGrid = View.panels.get("ascBjUsmsOverallEmRmByZhicWhole_zhicGrid");
	ascBjUsmsOverallEmRmByZhicWhole.zhicId = zhicGrid.rows[zhicGrid.selectedRowIndex]["sc_zhic.zhic_id"];
	var emGrid = View.panels.get("ascBjUsmsOverallEmRmByZhicWhole_emGrid");
	emGrid.addParameter("zhicRes",ascBjUsmsOverallEmRmByZhicWhole.zhicId);
	emGrid.refresh();
}

