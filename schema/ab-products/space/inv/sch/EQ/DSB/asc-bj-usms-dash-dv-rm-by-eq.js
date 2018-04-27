/**
 * @author Huangmuliang
 */
var controller = View.createController('aschlRmByDpController', {
	dvId:"",
	
    //----------------event handle--------------------
    afterViewLoad: function(){
    	var countPeopleGrid=this.abScSearchRmLayoutByDvCountPeopleGrid;
    	
		var res=this.view.restriction;
		if (valueExistsNotEmpty(res)) {
			if (valueExistsNotEmpty(res['dv.dv_id'])) {
				this.dvId = res['dv.dv_id'];
			}
			else {
				this.dvId = res.findClause('dv.dv_id').value;
			}
		}else{
			this.dvId = AUSC_getEmployeeDivisionIdByEmId(View.user.name).organization.divisionId;
		}
    
    	var dvId=this.dvId;
    	countPeopleGrid.addParameter('dvID', dvId);
		var titleForDv = String.format(getMessage('drawingPanelTitle1'),this.dvId );
        this.abSpHlRmByDp_DrawingPanel.appendInstruction("addDrawing", "", titleForDv);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
        this.abSpHlRmByDp_DrawingPanel.addEventListener('ondwgload', setDrawingTitle);
        
        this.abSpHlRmByDp_flGrid.addEventListener('onMultipleSelectionChange', function(row){
        var flGrid= View.panels.get('abSpHlRmByDp_flGrid');
        var dawingPanel=View.panels.get('abSpHlRmByDp_DrawingPanel');
        	//
            var rowIndex=row.index;
            var rows=flGrid.gridRows;
            for(var i=0;i<rows.length;i++){
            	var Gridrow=rows.get(i);
            	
            	if(i!=rowIndex){
            		if(Gridrow.isSelected()){
            			Gridrow.select(false);
                	}
            	}
            	
            }
            var blId=row['rm.bl_id'];
        	var flId=row['rm.fl_id'];
        	var dwgName=row['rm.dwgname'];
        	var highlightResc = "";
        	if (dvId) {
                highlightResc += " AND rm.dv_id = '" + dvId + "'";
            }
            else {
                highlightResc += " AND rm.dv_id IS NOT NULL";
            }
        	if(row){ 
                View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDv', highlightResc);
              
                var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
                dawingPanel.clear();
                dawingPanel.addDrawing(dcl);
        	}
        	dawingPanel.setTitle("按使用单位高亮房间：["+blId+"]["+flId+"]");
        	blSelectForDraw(dvId,blId,flId);
        	
        	//隐藏按房间找设备和人员的panel
        	View.panels.get('eqEmListPanel').show(false);
        	View.panels.get('emByRmListPanel').show(false);
        	
        });           
    	
    	
    	
    },
    afterInitialDataFetch: function(){
        this.abSpHlRmByDp_flGrid.enableSelectAll(false);
		this.onShowDpGrid();
		var dvId=this.dvId;
		var highlightResc = "";
		if (dvId) {
            highlightResc += " AND rm.dv_id = '" + dvId + "'";
        }
        else {
            highlightResc += " AND rm.dv_id IS NOT NULL";
        }
		var grid = View.panels.get("abSpHlRmByDp_flGrid");
		if(grid.rows[0]){
			grid.rows[0].row.select();
			View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(grid.rows[0], null);
			
            
            View.dataSources.get('ds_ab-sp-hl-rm-by-dp_drawing_rmHighlight').addParameter('rmDv', highlightResc);
           
            View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(grid.rows[0], null);
    	}
		
		var blrow=grid.rows[0];
		var blId=blrow['rm.bl_id'];
		var flId=blrow['rm.fl_id'];
		
		this.abSpHlRmByDp_DrawingPanel.setTitle("按使用单位高亮房间：["+blId+"]["+flId+"]");
		
		//默认显示第一个楼层的所有设备
		var eqByDvRes=new Ab.view.Restriction();
		eqByDvRes.addClause('eq.dv_id',this.dvId,'=');
		eqByDvRes.addClause('eq.bl_id',blId,'=');
		eqByDvRes.addClause('eq.fl_id',flId,'=');
		this.abScSearchRmLayoutByBuGridReport.refresh(eqByDvRes);
		this.abScSearchRmLayoutByBuGridReport.setTitle("["+blId+"]["+flId+"]所有设备列表");
    },
    
    onShowDpGrid: function(){
        blId = "";
        var dvRes = " IS NOT NULL";
        var blRes = " IS NOT NULL";
        if (dvId) {
            dvRes = " = '" + dvId + "'";
        }
        if (blId) {
            blRes = " = '" + blId + "'";
        }
        
        this.abSpHlRmByDp_flGrid.addParameter('dvRes', dvRes);
        this.abSpHlRmByDp_flGrid.addParameter('blRes', blRes);
        this.abSpHlRmByDp_flGrid.refresh();
    },
    
    abScSearchRmLayoutByBuGridReport_viewUser_onClick: function(row){
        viewUser(row);
    },
   
    abScSearchRmLayoutByDvCountPeopleGrid_onEdit: function(){
        var controller = this;
		
		var grid = View.getControl('self', "abScSearchRmLayoutByDvCountPeopleGrid");
	   
        View.openDialog('asc-bj-usms-data-edit-org-dialog.axvw', '', false, {
			width:600, 
			height:500,
			closeButton:false,
			maxsize:false,
			callback: function() {
                grid.refresh();
            }
		});
        
    }
});

var dvId;
var blId;



/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
	
	
	 if (selected) {
//		View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
//            width: 500,
//            height: 350,
//            closeButton: false,
//			blId:pk[0],
//			flId:pk[1],
//			rmId:pk[2]
//        });
//		
//		var drawingPanel = View.panels.get('abSpHlRmByDp_DrawingPanel');
//        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
		 var dvId=controller.dvId;
		 var blId=pk[0];
		 var flId=pk[1];
		 var rmId=pk[2];
		 
		 var eqRes=new Ab.view.Restriction();
		 eqRes.addClause('eq.dv_id',dvId,'=');
		 eqRes.addClause('eq.bl_id',blId,'=');
		 eqRes.addClause('eq.fl_id',flId,'=');
		 eqRes.addClause('eq.rm_id',rmId,'=');
		 
		 var eqEmListPanel=View.panels.get('eqEmListPanel');
		 eqEmListPanel.refresh(eqRes);
		 eqEmListPanel.setTitle("["+blId+"]["+flId+"]["+rmId+"]房间设备列表");
		 var emRes=new Ab.view.Restriction();
		 emRes.addClause('em.dv_id',dvId,'=');
		 emRes.addClause('em.bl_id',blId,'=');
		 emRes.addClause('em.fl_id',flId,'=');
		 emRes.addClause('em.rm_id',rmId,'=');
		 
		 var emByRmListPanel=View.panels.get('emByRmListPanel');
		 emByRmListPanel.refresh(eqRes);
		 emByRmListPanel.setTitle("["+blId+"]["+flId+"]["+rmId+"]房间人员列表");
        
    }
	
}

/**
 * set drawing panel title
 */
function setDrawingTitle(){
    if (dvId) {
		var title = String.format(getMessage('drawingPanelTitle1'),dvId );
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("addDrawing", '', title);
    }
    else {
        View.panels.get('abSpHlRmByDp_DrawingPanel').processInstruction("default", '');
    }
}

function viewUser(row){
    var blId = row.record['rm.bl_id'];
    var flId = row.record['rm.fl_id'];
    var rmId = row.record['rm.rm_id'];
    var restriction = new Ab.view.Restriction();
    restriction.addClause('em.bl_id', blId, '=');
    restriction.addClause('em.fl_id', flId, '=');
    restriction.addClause('em.rm_id', rmId, '=');
    
    var detailPanel = View.panels.get('abScSearchRmLayoutByBuGridReportShow');
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}


function viewBuilding(row){
    var buId = row.record['dv.bu_id'];
    var dvId = row.record['dv.dv_id'];
    
    View.openDialog('asc-bj-usms-hl-rm-by-dp.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
        dvId: dvId
    });
    
    
}

/**
* add total row if there are more lines
* @param {Object} parentElement
*/
function addTotalRowForBu(parentElement){
   if (this.rows.length < 2) {
       return;
   }
	
	var totalAreaShiyong = 0.0;
	var totalCountRm = 0;
   for (var i = 0; i < this.rows.length; i++) {
       var row = this.rows[i];
       
		var areaShiyong = row['rm.area_shiyong'];
		if(row['rm.area_shiyong.raw']){
			areaShiyong = row['rm.area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(areaShiyong))) {
			totalAreaShiyong += parseFloat(areaShiyong);
		}
		
		
		
		var countRm = row['rm.count_rm'];
		if (!isNaN(parseInt(countRm))){
			totalCountRm += parseInt(countRm);
		}
   }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);

	var ds = this.getDataSource();
	
	
   // create new grid row and cells containing statistics
   var gridRow = document.createElement('tr');
   parentElement.appendChild(gridRow);
   // column 1: 'Total' title
   addColumn(gridRow, 1, '');
	// column 2: total area
   addColumn(gridRow, 1, '合计');
   // column 3: total area of Structure
   addColumn(gridRow, 1, ds.formatValue('rm.count_rm', totalCountRm, false));
   // column 4: 'Total' title
   addColumn(gridRow, 1,ds.formatValue('rm.area_shiyong', totalAreaShiyong+"", false));
	
}

function blSelectForDraw(dvId,blId,flId){
	var abScSearchRmLayoutByBuGridReport=View.panels.get('abScSearchRmLayoutByBuGridReport');
	var eqByDvRes=new Ab.view.Restriction();
	eqByDvRes.addClause('eq.dv_id',dvId,'=');
	eqByDvRes.addClause('eq.bl_id',blId,'=');
	eqByDvRes.addClause('eq.fl_id',flId,'=');
	abScSearchRmLayoutByBuGridReport.refresh(eqByDvRes);
	abScSearchRmLayoutByBuGridReport.setTitle("["+blId+"]["+flId+"]所有设备列表");
}
