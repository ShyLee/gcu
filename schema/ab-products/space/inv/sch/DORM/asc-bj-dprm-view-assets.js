var controller = View.createController('abSpAsgnEmToRm_Controller', {
	dvName:null,
	stuNo:null,
	stuName:null,
	titleName:"",
    afterViewLoad: function(){
		 this.BlTree.addParameter('rmCatRestriction', "rm.rm_cat='301'");
		 this.abSpAsgnEmToRm_drawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
	     this.abSpAsgnEmToRm_drawingPanel.addEventListener('onclick', onDwgPanelClicked);
    },
    ConsoleForm_onShowTree: function(){
    	var dvName = this.ConsoleForm.getFieldValue('dv.dv_name');
        var blName = this.ConsoleForm.getFieldValue('bl.name');
		if(blName != "")
			var blName2="bl.name='" + blName + "'";
			this.BlTree.addParameter("blName",blName2);
		if(dvName!=""){
			var dvName2="dv.dv_name='" + dvName + "'";
			this.BlTree.addParameter("dvName",dvName2);
		}
		this.BlTree.refresh();
    },
	ConsoleForm_onClear:function(){
    	this.ConsoleForm.clear();
    	var dvName = this.ConsoleForm.getFieldValue('dv.dv_name');
        var blName = this.ConsoleForm.getFieldValue('bl.name');
		var restriction = new Ab.view.Restriction();
		if(blName==""){
			this.BlTree.addParameter("blName","1=1");
			this.BlTree.refresh();
		}
		if(dvName==""){
			this.BlTree.addParameter("dvName","1=1");
			this.BlTree.refresh();
		}
	}, 
	//------------------------全屏显示CAD图纸滴-------------------------   
    abSpAsgnEmToRm_drawingPanel_onShowDwgView:function(){
    	if (this.abSpAsgnEmToRm_drawingPanel.dwgLoaded)
		   {
		   	  var recValue = this.abSpAsgnEmToRm_drawingPanel.getRecValues(0);
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
	blStuPanel_afterRefresh:function(){
		if(this.titleName!=""){
			this.blStuPanel.setTitle(this.titleName);
		}
	}
});
function onTreeSiteClick(){
	 var blStuPanel = View.panels.get('blStuPanel');
	 blStuPanel.refresh([],false);
	 blStuPanel.setTitle("广州学院-学生入住信息列表");
	 controller.titleName="广州学院-学生入住信息列表";
	 blStuPanel.showInWindow({
		 x: 100,
		 y: 150,
         width: 900,
         height: 600
     });
}
function onTreeBlClick(ob){
	 var blStuPanel = View.panels.get('blStuPanel');
	 var currentNode = View.panels.get('BlTree').lastNodeClicked;
	 var blId = currentNode.data['bl.bl_id'];
	 var blName = currentNode.data['bl.name'];
	 var restriction = new Ab.view.Restriction();
     restriction.addClause("rm.bl_id", blId, "=");
	 blStuPanel.refresh(restriction);
	 controller.titleName=blName+"-学生入住信息列表";
	 blStuPanel.setTitle(blName+"-学生入住信息列表");
	 blStuPanel.showInWindow({
		 x: 100,
		 y: 150,
         width: 900,
         height: 600
     });
}

function onTreeClick(ob){
    var cp = View.getControl('', 'abSpAsgnEmToRm_drawingPanel');
    var currentNode = View.panels.get('BlTree').lastNodeClicked;
    var blId = currentNode.parent.data['bl.bl_id'];
    var flId = currentNode.data['fl.fl_id'];
    var dwgName = currentNode.data['fl.dwgname'];
    var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
    cp.isLoadedDrawing = true;
    cp.clearAssignCache(true);
    cp.addDrawing(dcl);
}
//------------------------点击CAD图纸滴-------------------------  
function onDwgPanelClicked(pk){
	//------------------------弹出dialog滴-------------------------  	
 	  var blId = pk[0];
 	  var flId = pk[1];
 	  var rmId = pk[2];
   	  View.openDialog('asc-bj-dorm-view-assets-information.axvw', null, false, {
          width: 930,
          height: 600,
  		  closeButton: false,
  		  blId: blId,
  		  flId: flId,
  		  rmId: rmId
   	  });
}