/**
 * @author Keven.xi
 */

View.createController('ascBjUsmsOverallBlMainYxzController', {
	
	siteId:"",
	blId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;
		this.ascBjUsmsOverallBlMain_siteBasicGrid.addParameter('siteIdRes',this.siteId);
		this.ascBjUsmsOverallBlMain_blGrid.addParameter('siteIdRes',this.siteId);
	},
	
	ascBjUsmsOverallBlMain_blGrid_showBlInfo_onClick: function(row){
		this.blId = row.record['sc_bl_xz.bl_id'];
		View.openDialog('asc-bj-usms-bl-pracelland-summary-info.axvw', null, false, {
            width: 1024,
            height: 768,
            closeButton: false,
			openBlId:this.blId
        });
    },
	ascBjUsmsOverallBlMain_blGrid_showRmCat_onClick: function(row){
		  
		var blId = row.record['sc_bl_xz.bl_id'];
		var panel = View.panels.get('ascBjUsmsOverallBlWhole_grid_scHisRmCatBl');
            panel.addParameter("blIdRes",blId);
            panel.refresh();
        panel.showInWindow({
	        width: 750,
	        height: 600
	    });
    }
	
	
});

