/**
 * @author Huang Muliang
 */
var abScRptRmbyBlRmcat = View.createController('abScRptRmbyBlRmcatController', {
	
	rm_cat:"",
	bl_id:"",
	
	/**
	 * 
	 */
	abScRptRmbyBlRmcat_blSumGrid_afterRefresh:function(){
		var title = String.format(getMessage('secondPanelTitle'),this.rm_cat );
		this.abScRptRmbyBlRmcat_blSumGrid.setTitle(title);
		
		this.rm_type = "";
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.rm_type","-1","=");
		this.abScRptRmbyBlRmcat_rmGrid.refresh(restriction);
		
	},
	
	abScRptRmbyBlRmcat_rmGrid_afterRefresh:function(){
		var title = String.format(getMessage('bottomPanelTitle'),this.bl_id );
		this.abScRptRmbyBlRmcat_rmGrid.setTitle(title);
	}
	
});


function onRefreshBottomReport(){
	var rmPanel = View.panels.get("abScRptRmbyBlRmcat_rmGrid");
	var blPanel = View.panels.get("abScRptRmbyBlRmcat_blSumGrid");
	abScRptRmbyBlRmcat.bl_id = blPanel.rows[blPanel.selectedRowIndex]["bl.bl_id"];
	abScRptRmbyBlRmcat.rm_cat = blPanel.rows[blPanel.selectedRowIndex]["rm.rm_cat"];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rm.rm_cat",abScRptRmbyBlRmcat.rm_cat,"=");
	restriction.addClause("rm.bl_id",abScRptRmbyBlRmcat.bl_id,"=");
	rmPanel.refresh(restriction);
	
}


