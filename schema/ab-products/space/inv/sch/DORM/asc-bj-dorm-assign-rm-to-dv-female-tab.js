var controller = View.createController('abSpAsgnRmDpToRm_Control', {
	dvId:"",
	dvName:"",
    afterViewLoad: function(){
    	this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("default", "", getMessage('selectDv'));
        
        // set event handler for clicking room on the drawing 
        this.abSpAsgnDvDpToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        this.dvInfoPanel.restriction=null;
        
    },
    afterInitialDataFetch:function(){
    	this.onStart();
    },
    helpPanel_afterRefresh:function(){
    	this.enablePanelActions(false);
    	this.onStart();
    },
    onStart:function(){
    	this.dvId=this.tabs.dvId;
    	this.dvName=this.tabs.dvName;
    	this.inYear=this.tabs.inYear;
		var blId=this.tabs.blId;
		
		if(blId!=undefined && blId!=""){
			this.abSpAsgnDvDpToRm_blTree.addParameter('blId',"bl.bl_id='"+blId+"'");
			this.abSpAsgnDvDpToRm_blTree.refresh();
		}else{
			this.abSpAsgnDvDpToRm_blTree.addParameter('blId',"1=1");
			this.abSpAsgnDvDpToRm_blTree.refresh();
		}
		if(this.dvId!=undefined && this.dvId!=""){
			this.dvInfoPanel.addParameter('dvId',this.dvId);
			this.dvInfoPanel.addParameter('stuInYear',this.inYear);
			this.dvInfoPanel.restriction=null;
			this.dvInfoPanel.refresh();
			
			this.abSpAsgnDvDpToRm_drawingPanel.setTitle("分配女生宿舍给-"+this.dvName);
			this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("default", "", "分配女生宿舍给-"+this.dvName);
			
//			this.abSpAsgnDvDpToRm_drawingPanel.clear();
			resetAssignmentCtrls();//清除没有完成分配的数据，保证再次点击图纸时去掉 ，转换楼层信息丢失提示
			this.enablePanelActions(false);
			this.abSpAsgnRmcatToRm_legendGrid.show(false);
			this.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
		}
    },
    abSpAsgnDvDpToRm_drawingPanel_onShowDwgView:function(){
    	if (this.abSpAsgnDvDpToRm_drawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abSpAsgnDvDpToRm_drawingPanel.getRecValues(0);
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
    verifyRmCapacity:function(){
    	var a=this.dvInfoPanel;
    	var cout_stu=this.dvInfoPanel.getFieldValue("sc_student.count_stu");
    	var count_assign=this.dvInfoPanel.getFieldValue("sc_student.count_assign");
    	var count_unassign=this.dvInfoPanel.getFieldValue("sc_student.count_unassign");
     	var count_limit=Math.round(parseFloat(cout_stu)*1.03);
    	if(count_limit<=parseFloat(count_assign)){
    		return true;
    	}else{
    		return false;
    	}
    },
    dvInfoPanel_afterRefresh:function(){
    	this.dvInfoPanel.setTitle(this.dvName+"("+this.inYear+"年入学)");
    },
    /**
     * 批量收回分配给学院的房间
     */
    abSpAsgnDvDpToRm_drawingPanel_onReverseAll:function(){
    	if (this.abSpAsgnDvDpToRm_drawingPanel.dwgLoaded){
    	  var recValue = this.abSpAsgnDvDpToRm_drawingPanel.getRecValues(0);
  		  var blId = recValue["rm.bl_id"];
  		  var flId = recValue["rm.fl_id"];
  		  
  		  var controller = this;
  		  var confirmMessage="确定要收回【"+this.blName+"-"+flId+"】的全部房间？";
  		  View.confirm(confirmMessage, function(button){
	            if (button == 'yes') {
	            	try {
	            		var parameters = {
	            				tableName: 'rm',
	            				fieldNames: toJSON(['rm.rm_id']),
	            				restriction: "rm.bl_id ='" + blId + "' and fl_id='"+flId+"'"
	            		};
	            		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	            		var records=result.data.records;
	            		var grid=controller.abSpAsgnDvDpToRm_dpAssignGrid;
	            		for(var i=0;i<records.length;i++){
	            			var rmId =records[i]['rm.rm_id'];
	            			var restriction = new Ab.view.Restriction();
	            			restriction.addClause("rm.bl_id", blId,"=");
	            			restriction.addClause("rm.fl_id", flId,"=");
	            			restriction.addClause("rm.rm_id", rmId,"=");
	            			var account=View.dataSources.get("ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmLabel");
	            			var record=account.getRecord(restriction);
	            			record.setValue("rm.dv_id","");
	            			record.setValue("rm.stu_in_year","");
	            			account.saveRecord(record);
	            		}
	            		controller.abSpAsgnDvDpToRm_drawingPanel.refresh();
	            		controller.dvInfoPanel.refresh();
	            	}catch(e){
	            		 View.showMessage(e.message);
	                	 return;
	                 }
	            }
	      });
     	
    	}else{
 		   View.showMessage("请点击选择需要分配的图纸！");
			return;
	   }
    },
    /**
     * 批量分配房间给学院
     */
    abSpAsgnDvDpToRm_drawingPanel_onAssignAll:function(){
	  if (this.abSpAsgnDvDpToRm_drawingPanel.dwgLoaded){
			var dvId=this.dvId;
			var dvName=this.dvName;
			if(dvId=="" || dvId==undefined){
				View.showMessage("请选择一个学院！");
				return;
			}else if(this.inYear=="" || this.inYear==undefined){
				View.showMessage("请选择一个入学年份！");
				return;
			}else if(this.verifyRmCapacity()){
				View.showMessage("已分配足够的宿舍给学院—"+dvName+"！");
				return;
			}else{
				var recValue = this.abSpAsgnDvDpToRm_drawingPanel.getRecValues(0);
				var blId = recValue["rm.bl_id"];
				var flId = recValue["rm.fl_id"];
				
				var controller = this;
				var confirmMessage="确定要把建筑物【"+this.blName+"-"+flId+"】的全部房间分配给-"+this.dvName+"的"+this.inYear+"级吗?";
				View.confirm(confirmMessage, function(button){
			            if (button == 'yes') {
			            	try {
			            		var parameters = {
			            				tableName: 'rm',
			            				fieldNames: toJSON(['rm.cap_em','rm.rm_id','rm.feormale']),
			            				restriction: "rm.bl_id ='" + blId + "' and fl_id='"+flId+"' and rm.rm_cat='301'"
			            		};
			            		var cap_em="";
			            		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			            		var records=result.data.records;
			            		var grid=controller.abSpAsgnDvDpToRm_dpAssignGrid;
			            		for(var k=0;k<records.length;k++){
			            			
			            			var rmId =records[k]['rm.rm_id'];
			            			var pk=[];
			            			pk.push(blId);
			            			pk.push(flId);
			            			pk.push(rmId);
			            			var selected=true;
			            			
			            			ASDM_drawingRoomClickHandler(pk, selected, grid,'dv.dv_name', controller.dvName, 'rm.dv_id', controller.dvId,'rm.stu_in_year', controller.inYear);
			            		}
			            		saveAllChanges();
			            		controller.abSpAsgnDvDpToRm_dpAssignGrid.show(false);
			            	}catch(e){
			            		 View.showMessage(e.message);
			                	 return;
			                 }
			            }
			      });
			}
	   }else{
		   View.showMessage("请点击选择需要分配的图纸！");
			return;
	   }
    },
	enablePanelActions: function(enabled) {
		this.abSpAsgnDvDpToRm_drawingPanel.actions.get('reverseAll').enable(enabled);
        this.abSpAsgnDvDpToRm_drawingPanel.actions.get('assignAll').enable(enabled);
	}
});
function onBlTreeClick(ob){
	var currentNode = View.panels.get('abSpAsgnDvDpToRm_blTree').lastNodeClicked;
	var blId=currentNode.data["bl.bl_id"];
	var blName=currentNode.data["bl.name"];
	var thisController = this;
    var dialog=View.openDialog("asc-bj-dorm-view-bl-dv-rm-info.axvw",null,false,{
    	width: 800,
        height: 1000,
        closeButton: false,
    	blId:blId,
    	blName:blName,
    	feormale:"2"
    });
}
/**
 * event handler when click tree node of floor level for the tree abSpAsgnDvDpToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	controller.onclickedFlObj=ob;
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_blTree').lastNodeClicked;
    var blName=currentNode.parent.data["bl.name"];
	controller.blName=blName;
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnDvDpToRm_dpAssignGrid');
    setSelectability(ob.restriction);
    ASDM_flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.setToAssign("dv.dv_id", controller.dvId);
    drawingPanel.isLoadedDrawing = true;
    
    controller.enablePanelActions(true);
}
/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected){
	var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
	
	var selected=true;
	var dvId=controller.dvId;
	var dvName=controller.dvName;
	if(dvId=="" || dvId==undefined){
		View.showMessage("请选择一个学院！");
		return;
	}else if(controller.inYear=="" || controller.inYear==undefined){
		View.showMessage("请选择一个入学年份！");
		return;
	}else if(controller.verifyRmCapacity()){
		View.showMessage("已分配足够的宿舍给学院—"+dvName+"！");
		return;
	}else{
		ASDM_drawingRoomClickHandler(pk, selected, grid,'dv.dv_name', dvName, 'rm.dv_id', dvId,'rm.stu_in_year', controller.inYear);
	}
}
/**
 * event handler when click button 'save'.
 */
function saveAllChanges(){
	var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
	if(grid.rows.length>0){
		var dsChanges = View.dataSources.get("ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmLabel");
		var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
		ASDM_saveChange1(drawingPanel, grid, dsChanges, ['rm.dv_id', 'rm.dp_id'], false,controller.inYear);
		drawingPanel.processInstruction("ondwgload", '');
		grid.show(false);
		var dvInfoPanel = View.panels.get("dvInfoPanel");
		dvInfoPanel.refresh();
	}
}
/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){
	var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
	if(grid.rows.length>0){
		var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
		ASDM_resetAssignment(drawingPanel, grid);
		drawingPanel.processInstruction("ondwgload", '');
	}
}

/**
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(restriction){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel')
    var rmRecords = View.dataSources.get('ds_ab-sp-rm_occupiable').getRecords(restriction);
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var supercat = record.getValue('rmcat.supercat');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var opts_selectable = new DwgOpts();
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        
        //kb:3030349,by comments (JIANBING 2012-08-09 11:16)1. In view ab-sp-asgn-dv-dp-to-rm.axvw, 
        //I am not able to assign dv-dp to service area. User should be able to assign dv-dp to sevice area. 
        
        if (supercat == 'VERT') {
            drawingPanel.setSelectability.defer(1000, this, [opts_selectable, false]);
        }else{
        	drawingPanel.setSelectability.defer(1000, this, [opts_selectable, true]);
        }
    }
}
