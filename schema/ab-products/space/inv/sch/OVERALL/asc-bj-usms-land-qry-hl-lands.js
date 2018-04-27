
var ascBjUsmsHlLandController = View.createController('ascBjUsmsHlLand', {

    blId: "",
    land_title: "",
    lastLoadedDwgname: "",
    afterViewLoad:function(){
    	 this.land_drawing_panel.setLiteDisplay=this.setDrawingTitle;

    },
    setDrawingTitle:function(){	
    },
    landGrid_land_code_onClick: function(row){
        this.showParcelland(row);
    },
    landGrid_parcelland_address_onClick: function(row){
        this.showParcelland(row);  
    },
    landGrid_area_land_onClick: function(row){
        this.showParcelland(row);
    },
    showParcelland: function(row){
        var record = row.getRecord();
        var dwgName = record.getValue("sc_parcelland.dwgname");
        var land_code = record.getValue("sc_parcelland.land_code");
        var parcelland_address=record.getValue("sc_parcelland.parcelland_address");
        this.ds_drawing_landHighlight.addParameter('land_code', "land_code ='"+land_code+"'");
        if(!dwgName==null){
        	if (dwgName == this.lastLoadedDwgname) {
                this.land_drawing_panel.clearHighlights();
                this.land_drawing_panel.applyDS('highlight');
                
            }
            else {
                var dcl = new Ab.drawing.DwgCtrlLoc('', '', '', dwgName);
                this.land_drawing_panel.addDrawing(dcl, null);
                this.lastLoadedDwgname = dwgName;
            }
        }else{
        	View.alert("宗地照片不存在!");
        }
        this.land_drawing_panel.setTitle("宗地：" + parcelland_address);
    }
    
});

function showLandPhoto(){
    var gridPanel = View.panels.get("landGrid");
    var selectedIndex = gridPanel.selectedRowIndex;
    if (selectedIndex == -1) {
        selectedIndex = 0;
    }
    var selectedRec = gridPanel.gridRows.items[selectedIndex].getRecord();
    var parcelland_address = selectedRec.getValue("sc_parcelland.parcelland_address");
    parcellandControl.land_title = parcelland_address;
    var restriction = new Ab.view.Restriction();
    restriction.addClause('sc_parcelland.parcelland_address', parcelland_address, '=');
    var photoPanel = View.panels.get("landPhoto");
    photoPanel.refresh(restriction);
    var land_photo = photoPanel.getFieldValue('sc_parcelland.land_photo').toLowerCase();
    if (valueExistsNotEmpty(land_photo)) {
        photoPanel.showImageDoc('land_photo', 'sc_parcelland.parcelland_address', 'sc_parcelland.land_photo');
        photoPanel.fields.get('land_photo').dom.alt = "";
    }
    else {
        photoPanel.fields.get('land_photo').dom.src = null;
        photoPanel.fields.get('land_photo').dom.alt = "宗地照片不存在！";
    }
    photoPanel.setTitle("宗地：" + parcelland_address);
}
