/**
 * @author Lei
 */
var locEmpController = View.createController('locEmp', {
	  
	afterViewLoad: function(){
	  	this.locateEmployee_cadPanel.appendInstruction("default", "", '');
        this.locateEmployee_cadPanel.appendInstruction("addDrawing", "", '');
		this.locateEmployee_cadPanel.addEventListener('onclick', onClickDrawingHandler);
	  },
		
    afterInitialDataFetch: function(){
    	showRmOfEm(true);
    },
	
    emFilterPanel_onShow: function(){ 
        var restriction = new Ab.view.Restriction();
        var name = this.emFilterPanel.getFieldValue("em.name");
        var dvId = this.emFilterPanel.getFieldValue("em.dv_id");
		var zhicId = this.emFilterPanel.getFieldValue("em.zhic_id");
        if (dvId) {
            restriction.addClause("em.dv_id", dvId + '%', "LIKE");
        }
        if (name) {
            restriction.addClause("em.name", name + '%', "LIKE");
        }
		if (zhicId) {
            restriction.addClause("em.zhic_id", zhicId + '%', "LIKE");
        }
        this.locateEmployee_employees.refresh(restriction);
        showRmOfEm(true);
    },
    /*CAD全屏显示功能*/
    locateEmployee_cadPanel_onShowDwgView:function(){
		   if (this.locateEmployee_cadPanel.dwgLoaded)
		   {
		   	  var recValue = this.locateEmployee_cadPanel.getRecValues(0);
			  var blId = recValue["rm.bl_id"];
			  var flId = recValue["rm.fl_id"];
		   	  var dwgName = recValue["rm.dwgname"];
			  	View.openDialog('asc-bj-usms-show-fl-dwg.axvw', null, false, {
			  		maximize:true,
			  		closeButton: false,
			  		blId: blId,
			  		flId: flId,
			  		dwgName: dwgName
			  	});
		   }
	},
	locateEmployee_employees_onXiangxi:function(row){
		showRmOfEm(false);
		var emId = row.record["em.em_id"];
		View.openDialog('asc-bj-usms-dp-em-info-em-details.axvw', null, false, {
	       width: 750,
	       height: 600,
	       closeButton: false,
	       emId:emId
		});
	}
});
function showRmOfEm(afterShow){
    var grid = View.panels.get('locateEmployee_employees');
    var emphoto = View.panels.get('emphoto');
    
    var selectedIndex=0;
    if(afterShow){
    	selectedIndex=0;
    }else{
    	selectedIndex=grid.selectedRowIndex;
    }
    var selectedRow = grid.rows[selectedIndex];
    
    var blId = selectedRow["em.bl_id"];
    var flId = selectedRow["em.fl_id"];
    var dwgName = selectedRow["rm.dwgname"]
    var emId = selectedRow["em.em_id"];
	var dvId = selectedRow["em.dv_id"];
    
    var locateEmployee = View.panels.get('locateEmployee_cadPanel');
    var ds = View.dataSources.get('ds_ab-sp-loc-em_drawing_rmHighlight');
    
    if (emId) {
        ds.addParameter('emId', "='" + emId + "'");
    }
    else {
        ds.addParameter('emId', 'IS NOT NULL');
    }
    if (dvId) {
        ds.addParameter('dvId', "='" + dvId + "'");
    }
    else {
        ds.addParameter('dvId', 'IS NOT NULL');
    }
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    setDrawingTitle(locateEmployee, blId + '-' + flId);
    if(!afterShow){
    	locateEmployee.clear();
    }
    locateEmployee.addDrawing(dcl);
    
	var emRmPanel = View.panels.get('emRmInfoPanel');
	emRmPanel.addParameter("emId",emId);
	emRmPanel.refresh();
}

/**
 * set drawing panel title
 */
function setDrawingTitle(console, title){
    if (title) {
        console.processInstruction("addDrawing", '', title);
    }
    else {
        console.processInstruction("default", '');
    }
}

/**
 * event handler when click room in the drawing panel
 * @param {Object} pk
 * @param {boolean} selected
 */
function onClickDrawingHandler(pk, selected){
    if (selected) {
		View.openDialog('asc-bj-usms-bl-rm-em-eq-info.axvw', null, false, {
            width: 900,
            height: 500,
            closeButton: false,
			blId:pk[0],
			flId:pk[1],
			rmId:pk[2]
        });
		setDrawingTitle(locateEmployee, pk[0] + '-' + pk[1]);
    }
}
