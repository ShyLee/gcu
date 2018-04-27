/**
 * @author Keven.xi
 */
var DvRoomControlller=View.createController('DvRoomControlller',{

    siteId: "",
    blId: "",
    
    ascBjUsmsOverallBlWhole_blGrid_showBlInfo_onClick: function(row){
        this.blId = row.record['sc_bl_xz.bl_id'];
        //alert(this.blId);
        //asc-bj-usms-bl-pracelland-summary-info.axvw
        //替换前  View.openDialog('asc-bj-usms-bl-yxz-summary-info-wd.axvw', null, false, {
        View.openDialog('asc-bj-usms-bl-pracelland-summary-info.axvw', null, false, {
            width: 1024,
            height: 768,
            closeButton: false,
            openBlId: this.blId
        });
    },
    
    ascBjUsmsOverallBlWhole_blGrid_showRmCat_onClick: function(row){
    
        var blId = row.record['sc_bl_xz.bl_id'];
        var panel = View.panels.get('ascBjUsmsOverallBlWhole_grid_scHisRmCatBl');
        panel.addParameter("blIdRes", blId);
        panel.refresh();
        panel.showInWindow({
            width: 750,
            height: 600
        });
    },
    ascBjUsmsOverallBlWhole_blGrid_onDcbbb: function()
    {
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false,
		{
            width: 470,
            height: 200,
            xmlName: "FixedAssetsDispose",
            parameters: {
            	
            },
            closeButton: false
        });
    }
});