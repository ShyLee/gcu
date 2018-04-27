/**
 * @author MuLiang
 */
var parcellandControl = View.createController('ascBjUsmsOverallParcellandWholeController', {
	
	blId:"",
	land_title :"",
	
	ascBjUsmsOverallParcellandBlMain_blGrid_showBlInfo_onClick: function(row){
		this.blId = row.record['bl.bl_id'];
		View.openDialog('asc-bj-usms-bl-pracelland-summary-info.axvw', null, false, {
            width: 800,
            height: 600,
            closeButton: false,
			openBlId:this.blId 
        });
    },
    ascBjUsmsOverallBlWhole_blGrid_showBlList_onClick: function(row){
    	var parcelland_address = row.record['sc_parcelland.land_code'];
    	var panel = View.panels.get('ascBjUsmsOverallParcellandBlMain_blGrid');
    	panel.addParameter('parcellandAddressRes', parcelland_address);
		panel.refresh();
		//panel.show(true);
		panel.showInWindow({
			width: 1300,
			height: 700,
			closeButton: false
		});
    },
    landPhoto_afterRefresh: function(){
        var landCode = this.landPhoto.getFieldValue('sc_parcelland.land_code');
           var addr=View.project.projectGraphicsFolder + '/land/' + landCode+'.jpg';
           jQuery.ajax({
              url: addr,
              success: function(){
              jQuery("#land_photo").attr("src",addr);
              },
              error:function(e){
              jQuery("#land_photo").removeAttr("src");
              jQuery("#land_photo").attr("display","none");
              }});
       },

	ascBjUsmsOverallBlWhole_blGrid_afterRefresh: function(){
        var grid = View.panels.get('ascBjUsmsOverallBlWhole_blGrid');
        var dataRows = grid.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            dataRow.cells['1'].innerHTML = r + 1;
        }
    },
	afterInitialDataFetch: function()
	{
		if (this.ascBjUsmsOverallBlWhole_blGrid.gridRows.length >0){
			showLandPhoto();
		}
		
	},
	
	ascBjUsmsOverallBlWhole_blGrid_onFixedExportland: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
			width: 470,
			height: 200,
			xmlName: "land",
			closeButton: false
		});
	},
	 
	　　ascBjUsmsOverallBlWhole_blGrid_onFixedExportcaizheng: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
			width: 470,
			height: 200,
			xmlName: "caizheng",
			closeButton: false
		});
	}	
	
});

function showLandPhoto(){
	var gridPanel  = View.panels.get("ascBjUsmsOverallBlWhole_blGrid");
	var selectedIndex = gridPanel.selectedRowIndex;
	if(selectedIndex == -1)
	{
		selectedIndex = 0;
	}
	var selectedRec = gridPanel.gridRows.items[selectedIndex].getRecord();
	var parcelland_address = selectedRec.getValue("sc_parcelland.land_code");
	parcellandControl.land_title = parcelland_address;
	var restriction = new Ab.view.Restriction();
    restriction.addClause('sc_parcelland.land_code', parcelland_address, '=');
	var photoPanel =  View.panels.get("landPhoto");
	photoPanel.refresh(restriction);
	
}

