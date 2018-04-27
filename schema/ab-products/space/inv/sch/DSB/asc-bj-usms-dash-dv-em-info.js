/**
 * @author wangq
 */
var locEmpController = View.createController('locEmp', {
    afterViewLoad: function(){
        this.locateEmployee_cadPanel.appendInstruction("default", "", '');
        this.locateEmployee_cadPanel.appendInstruction("addDrawing", "", '');
        this.locateEmployee_cadPanel.addEventListener('onclick', onClickDrawingHandler);
        
    },
    
    afterInitialDataFetch: function(){
    	this.showRmCad();
    },
    
    consolePanel_onRefresh: function(){
    	var res = this.consolePanel.getFieldRestriction();
    	this.locateEmployee_employees.refresh(res);//刷新列表
    },
    emphoto_afterRefresh: function(){
        var emphoto = View.panels.get('emphoto');
        //var em_photo = emphoto.getFieldValue('em.image_file').toLowerCase();
        var em_photo = emphoto.getFieldValue('em.em_id');
        //var em_id = emphoto.getFieldValue('em.em_id');
        var em_photoImg = Ext.get('em_photo');   
        if (!em_photo) {
            return;
        }
        if (valueExistsNotEmpty(em_photo)) {
            em_photoImg.setVisible(true);
			em_photoImg.dom.src = View.project.projectGraphicsFolder + '/em/' + em_photo+'.jpg';
			em_photoImg.dom.alt = "";
        }
        else {
       		bl_photoImg.setVisible(false);
			bl_photoImg.dom.src = null;
			bl_photoImg.dom.alt = getMessage('noImage');
        }
    },

    showRmCad: function(){
    	var rowIndex = this.locateEmployee_employees.selectedRowIndex;
    	if(rowIndex <0){
    		rowIndex = 0;
    	}
    	var selectedRow = this.locateEmployee_employees.rows[rowIndex];
    	var blId = selectedRow["em.bl_id"];
    	var flId = selectedRow["em.fl_id"];
    	var dwgName = selectedRow["rm.dwgname"]
    	var emId = selectedRow["em.em_id"];
    	var dvId = selectedRow["em.dv_id"];
    	
    	var ds = View.dataSources.get("ds_ab-sp-loc-em_drawing_rmHighlight");
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
    	
    	var locateEmployee = this.locateEmployee_cadPanel;
    	setDrawingTitle(locateEmployee, blId + '-' + flId);
    	//如果是未画图，则不清除
    	if(locateEmployee.initialized){
    //		locateEmployee.clear();
    	}else{
    //		locateEmployee.initialDataFetch();
    	}
    	
    	//
    	if(valueExistsNotEmpty(blId)){
    		if(valueExistsNotEmpty(dwgName)){
    			var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    			locateEmployee.addDrawing(dcl);
			}else{
				//提示无FLASH文件
    			View.showMessage("无法找到对应的图示文件");
			}
    	}else{
    		//提示未分配房间
    		View.showMessage("该员工尚未分配房间"); 	
    	}
    	//刷新页面
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('em.em_id', emId, '=');
    	this.emphoto.refresh(restriction);
    	this.empBaseInfo.refresh(restriction);
    	this.empDetails.refresh(restriction);
    	this.emRmInfoPanel.refresh(restriction);
    	
    	var emRmPanel = View.panels.get('emRmInfoPanel');
    	emRmPanel.addParameter("emId",emId);
    	emRmPanel.refresh(restriction);
    }

});
function showRmOfEm(){
    locEmpController.showRmCad();   
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
            width: 500,
            height: 350,
            closeButton: false,
            blId: pk[0],
            flId: pk[1],
            rmId: pk[2]
        });
        
        setDrawingTitle(locateEmployee, pk[0] + '-' + pk[1]);
    }
}
