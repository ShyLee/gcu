var controller = View.createController('abSpAsgnEmToRm_Controller', {
	datecheckin:"",
	userRole:"",
    afterViewLoad: function(){
		 this.abSpAsgnEmToRm_blTree.addParameter('rmCatRestriction', "rm.rm_cat like '%学生宿舍%'");
        // 指定绘图控制指令
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectEm'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_emSelect", "onclick", getMessage('selectRm'));
        this.abSpAsgnEmToRm_drawingPanel.appendInstruction("abSpAsgnEmToRm_drawingPanel", "onclick", getMessage('selectAnotherEm'));
        this.abSpAsgnEmToRm_drawingPanel.addEventListener('onclick', onDwgPanelClicked);
        var ruleset = new DwgHighlightRuleSet();
        //KB3037147 - 变化突出显示颜色
        //Non-Occupiable
        ruleset.appendRule("rm.legend_level", "1", "ADADAD", "==");
        //Vacant
        ruleset.appendRule("rm.legend_level", "2", "33FF00", "==");
        //Available
        ruleset.appendRule("rm.legend_level", "3", "0000FF", "==");
        //At Capacity
        ruleset.appendRule("rm.legend_level", "4", "E7CB0A", "==");
        //Exceeds Capacity
        ruleset.appendRule("rm.legend_level", "5", "FF0000", "==");
        this.abSpAsgnEmToRm_drawingPanel.appendRuleSet("ds_ab-sp-asgn-em-to-rm_drawing_availRm", ruleset);
        this.abSpAsgnEmToRm_legendGrid.afterCreateCellContent = ASDM_setLegendLabel;
        this.abSpAsgnEmToRm_emSelect.addEventListener('onMultipleSelectionChange', ASDM_onEmSelectionChange);      
    },
    abSpAsgnEmToRm_filterConsole_onShowTree: function(){
        var stuNo = this.abSpAsgnEmToRm_filterConsole.getFieldValue('sc_stu_log.stu_no');
		var blId = this.abSpAsgnEmToRm_filterConsole.getFieldValue('bl.bl_id');
        var blTreeRes = new Ab.view.Restriction();
        var stuGridRes = new Ab.view.Restriction();
		if (valueExistsNotEmpty(stuNo)) {
			stuGridRes.addClause("sc_stu_log.stu_no", stuNo, "=");
		}
		if (valueExistsNotEmpty(stuName)) {
			stuGridRes.addClause("sc_stu_log.stu_name", stuName, "=");
		}
		if (valueExistsNotEmpty(blId)) {
			blTreeRes.addClause("bl.bl_id", blId, "=");
			this.abSpAsgnEmToRm_blTree.refresh(blTreeRes);
		}	
        this.abSpAsgnEmToRm_emSelect.refresh(stuGridRes);
        if (this.abSpAsgnEmToRm_drawingPanel.isLoadedDrawing) {
            this.abSpAsgnEmToRm_drawingPanel.clearAssignCache(true);
            this.abSpAsgnEmToRm_drawingPanel.processInstruction("ondwgload", "");
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
//------------------------弹出Panel滴-------------------------  	
	ondilog: function (){
		this.ruzhushijian.showInWindow({
            x: 325,
            y: 100,
            width: 520,
            height: 350,
            closeButton: false
        });
		this.ruzhushijian.refresh([],true);
		//判断用户角色
		
		if(this.userRole!="UNV STU ADMIN"){
			var sumPanel=View.panels.get('ruzhushijian');
			sumPanel.showField('sc_stu_log.is_key', false);
			
		}

		Ext.get("ruzhushijian_sc_stu_log.stu_tec").dom.readOnly=true;
		//获取当前日期
		var currentDate = ASDM_getCurrentDate_Client();
		this.ruzhushijian.setFieldValue("sc_stu_log.date_adjust",currentDate);
	},
    afterInitialDataFetch:function(){
        this.onStart();
      },
	ruzhushijian_onSave: function(){
		this.adjustCause=this.ruzhushijian.getFieldValue("sc_stu_log.adjust_cause");
		this.dateAdjust=this.ruzhushijian.getFieldValue("sc_stu_log.date_adjust");
		this.isKey=this.ruzhushijian.getFieldValue("sc_stu_log.is_key");
		this.comments=this.ruzhushijian.getFieldValue("sc_stu_log.comments");
		this.stu_tec=this.ruzhushijian.getFieldValue("sc_stu_log.stu_tec");
		if(this.dateAdjust==""){
			View.showMessage(getMessage('message4'));
			return;
		}
		if(this.adjustCause==""){
			View.showMessage(getMessage('message5'));
			return;
		}
		submitChanges();
    }, 
    helpPanel_afterRefresh:function(){
        this.onStart();
    },
	onStart:function(){
		this.tabs = View.getControlsByType(parent, 'tabs')[0]; //定义一个tabs，可以在各个tab之间进行传值，parent参数是指当前所在js是tab
//	    this.dvId=this.tabs.dvId; //获取tabs中的值
//	    this.dvName=this.tabs.dvName;
		var stuinYear=this.tabs.stuinYear;
		var blName=this.tabs.blName;
        var stuNo=this.tabs.stuNo;
        var stuName=this.tabs.stuName;
        var dvname=this.tabs.dvname;
    	var res = new Ab.view.Restriction();
    	if(stuName!="" && stuName!=undefined){
    		res.addClause('sc_student.stu_name',stuName, '=');
    	}
    	if(stuinYear!="" && stuinYear!=undefined){
    		res.addClause('sc_student.stu_in_year',stuinYear, '=');
    	}
    	if(stuNo!="" && stuNo!=undefined){
    		res.addClause('sc_student.stu_no',stuNo, '=');
    	}
    	if(dvname!="" && dvname!=undefined){
    		res.addClause('dv.dv_name',dvname, '=');
    	}
    	this.abSpAsgnEmToRm_emSelect.refresh(res);
	    if(blName!="" && blName!=undefined){
	    	this.abSpAsgnEmToRm_blTree.addParameter('blName',"bl.name='"+blName+"'");
	    	this.abSpAsgnEmToRm_blTree.refresh();
	    }else{
	    	this.abSpAsgnEmToRm_blTree.addParameter('blName',"1=1");
	    	this.abSpAsgnEmToRm_blTree.refresh();
	    }
	    
	    var role = View.user.role;
		this.userRole=role;
	},
    verifySelectedStudent: function(){
		if(this.abSpAsgnEmToRm_emSelect.getSelectedGridRows().length>0){
			return true;
		}else{
			return false;
		}
	},
	/**
	 * 查看剩余钥匙数
	 */
	ruzhushijian_onViewKeys:function(){
		var rows=this.abSpAsgnEmToRm_emAssigned.rows;
		var bl_id=rows[0]["sc_stu_log.bl_id"];
		var fl_id=rows[0]["sc_stu_log.fl_id"];
		var rm_id=rows[0]["sc_stu_log.rm_id"];
		var bfr=bl_id+fl_id+rm_id;	
		for(var i=1;i<rows.length;i++){
			var bl_id_next=rows[i]["sc_stu_log.bl_id"];
			var fl_id_next=rows[i]["sc_stu_log.fl_id"];
			var rm_id_next=rows[i]["sc_stu_log.rm_id"];
			if(bl_id==bl_id_next && fl_id==fl_id_next && rm_id==rm_id_next){
				
			}else{
				bfr=bfr+"','"+bl_id_next+fl_id_next+rm_id_next;
			}
		}
		this.rmKeysPanel.addParameter('blFlRm',"rm.bl_Id || rm.fl_id || rm.rm_id in ('"+bfr+"')");
		
		this.rmKeysPanel.refresh();
		this.rmKeysPanel.showInWindow({
			width:600,
			height:260
		})
	},
	ruzhushijian_onSelectEm:function(){
		this.selectEmPanel.addParameter("gangWei","gangwei_id='"+dormConstantControl.EM_GANGWEI_ID+"'");
		this.selectEmPanel.refresh();
		this.selectEmPanel.showInWindow({
            width: 600,
            height: 400
        });
	},
	selectEmPanel_onSure:function(){
    	var rows = this.selectEmPanel.getSelectedRows();
		if(rows.length == 0){
			alert("请选择辅导员！");
			return;
		}
		var emNameList=this.ruzhushijian.getFieldValue("sc_stu_log.stu_tec");;
		for(var i = 0; i < rows.length; i++){
			var emName=rows[i]['em.name'];
			if(emNameList==""){
				emNameList=emName;
			}else{
				emNameList=emNameList+","+emName;
			}
		}
		this.ruzhushijian.setFieldValue("sc_stu_log.stu_tec",emNameList);
		this.selectEmPanel.closeWindow();
    },
    ruzhushijian_onClearEm:function(){
		this.ruzhushijian.setFieldValue("sc_stu_log.stu_tec","");
    }
});
//==============================================Function==============================================//
var emAssigns = [];
/**
 * 点击onTreeClick出发abSpAsgnEmToRm_blTree
 */
function onTreeClick(ob){
	controller.onclickedFlObj=ob;
    var currentNode = View.panels.get('abSpAsgnEmToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnEmToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnEmToRm_emAssigned');
    ASDM_setSelectability(ob.restriction,'abSpAsgnEmToRm_drawingPanel','ds_ab-sp-rm_occupiable');
    ASDM_flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}
//------------------------点击CAD图纸滴-------------------------  
function onDwgPanelClicked(pk, selected, color){
	if(controller.verifySelectedStudent()){
		if (ASDM_checkCount(pk,"abSpAsgnEmToRm_emAssigned")) {
			View.confirm(getMessage('countOver'), function(button){
				if (button == 'yes') {
					ASDM_addAssignmentRows(pk,"ds_ab-sp-asgn-em-to-rm_rmCnt","abSpAsgnEmToRm_emAssigned",'abSpAsgnEmToRm_drawingPanel');
					View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
				}
			});
		}
		else {
			ASDM_addAssignmentRows(pk,"ds_ab-sp-asgn-em-to-rm_rmCnt","abSpAsgnEmToRm_emAssigned",'abSpAsgnEmToRm_drawingPanel');
			View.panels.get("abSpAsgnEmToRm_emSelect").setAllRowsSelected(false);
		}
		View.getControl('', 'abSpAsgnEmToRm_drawingPanel').processInstruction('abSpAsgnEmToRm_drawingPanel', 'onclick');
	}else{
		View.showMessage("请选择学生！");
		return;
	}
}
function submitChanges(){
	var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
	if (grid.rows.length < 1) {
		View.showMessage(getMessage('noEmSelected'));
		return;
	}
	View.openProgressBar(getMessage('saving'));
	doSubmitChanges.defer(500);
	doSubmitChanges();
}
/**
 * 保存配置.
 */
function doSubmitChanges(){
    var dsEmp = View.dataSources.get("ds_stuAssign");
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var dsStu = View.dataSources.get("stu_ds2");
    if(controller.userRole=="UNV DV STU ADMIN"){
    	var dsRm = View.dataSources.get("ds_ab-sp-rm_occupiable");
    }else{
    	var dsRm = View.dataSources.get("ds_ab-sp-rm_occupiable1");
    }    
    try {
        for (var i = 0; i < grid.gridRows.length; i++) {
            var row = grid.gridRows.items[i];
            var stuNo = row.getFieldValue("sc_stu_log.stu_no");
            var buildingId = row.getFieldValue("sc_stu_log.bl_id");
            var floorId = row.getFieldValue("sc_stu_log.fl_id");
            var roomId = row.getFieldValue("sc_stu_log.rm_id");
            var stuName = row.getFieldValue("sc_stu_log.stu_name");
            var dvId = row.getFieldValue("sc_stu_log.dv_id");
            var proId = row.getFieldValue("sc_stu_log.pro_id");
            var buildingIdCurrent = row.getFieldValue("sc_stu_log.bl_id_current");
            var floorIdCurrent = row.getFieldValue("sc_stu_log.fl_id_current");
            var roomIdCurrent = row.getFieldValue("sc_stu_log.rm_id_current");
            var stuInYear = row.getFieldValue("sc_stu_log.stu_in_year");
//            var stuSex = row.getFieldValue("sc_stu_log.stu_sex");
            var capEm = row.getFieldValue("sc_stu_log.cap_em");
            var adjustCause = controller.adjustCause;
            var dateAdjust = controller.dateAdjust;
            var is_key=controller.isKey;
            var comments = controller.comments;
            var mark1="入住";
            var mark2 ="退宿";
            var checkout_cause ="宿舍调整";
            //更新学生原先所居住的rm表的信息
			var restriction1 = new Ab.view.Restriction();
			restriction1.addClause("sc_student.stu_no", stuNo, "=");	       		
			var Record1=dsStu.getRecord(restriction1);
			var bl_id_last=Record1.getValue("sc_student.bl_id");
			var fl_id_last=Record1.getValue("sc_student.fl_id");
			var rm_id_last=Record1.getValue("sc_student.rm_id");
			var restriction2 = new Ab.view.Restriction();
			restriction2.addClause("rm.bl_id", bl_id_last, "=");
			restriction2.addClause("rm.fl_id", fl_id_last, "=");
			restriction2.addClause("rm.rm_id", rm_id_last, "=");
			var Record2=dsRm.getRecord(restriction2);
			if(Record2==""){
				View.showMessage("您当前操作的学生的所在房间不是本学院(单位)的，无法操作，请联系管理员");
				break;
			}
			var count_key_last=Record2.getValue("rm.count_key");
			var count_key_now=parseFloat(count_key_last)-1;
			Record2.setValue("rm.count_key", count_key_now);	
			dsRm.saveRecord(Record2);
//-------------------------------需要获取学生表中一些其他信息------------------------------------
	     	var rec3 = new Ab.view.Restriction();
			rec3.addClause("sc_student.stu_no", stuNo, "=");	       		
			var stuRecord=dsStu.getRecord(rec3);
			var stu_tec=stuRecord.getValue("sc_student.stu_tec");
			var stuSex=stuRecord.getValue("sc_student.stuSex");
//-------------------------------log日志添加退房信息------------------------------------------
            var rec = new Ab.data.Record();
            rec.isNew = true;
            rec.setValue("sc_stu_log.stu_no", stuNo);
            rec.setValue("sc_stu_log.stu_name", stuName);
            rec.setValue("sc_stu_log.stu_sex", stuSex);
            rec.setValue("sc_stu_log.stu_in_year", stuInYear);
            rec.setValue("sc_stu_log.bl_id", buildingIdCurrent);
            rec.setValue("sc_stu_log.fl_id", floorIdCurrent);
            rec.setValue("sc_stu_log.rm_id", roomIdCurrent);
            rec.setValue("sc_stu_log.cap_em", capEm);
            rec.setValue("sc_stu_log.dv_id", dvId);
            rec.setValue("sc_stu_log.pro_id", proId);
            rec.setValue("sc_stu_log.is_key", "3");
            rec.setValue("sc_stu_log.date_checkout",dateAdjust);
            rec.setValue("sc_stu_log.checkout_cause",checkout_cause);
            rec.setValue("sc_stu_log.comments",comments);
            rec.setValue("sc_stu_log.adjust_cause",adjustCause);
            rec.setValue("sc_stu_log.date_adjust",dateAdjust);
            rec.setValue("sc_stu_log.mark",mark2);
            rec.setValue("sc_stu_log.stu_tec",stu_tec);
            rec.oldValues = new Object();
            rec.oldValues["sc_stu_log.stu_no"] = stuNo;
            dsEmp.saveRecord(rec);
//-------------------------------新建一条log日志添加调整后的信息-----------------------------------
        	var rec2 = new Ab.data.Record();
        	rec2.isNew = true;
        	rec2.setValue("sc_stu_log.stu_no", stuNo);
        	rec2.setValue("sc_stu_log.stu_name", stuName);
        	rec2.setValue("sc_stu_log.stu_sex", stuSex);
        	rec2.setValue("sc_stu_log.stu_in_year", stuInYear);
        	rec2.setValue("sc_stu_log.bl_id", buildingId);
        	rec2.setValue("sc_stu_log.fl_id", floorId);
        	rec2.setValue("sc_stu_log.rm_id", roomId);
        	rec2.setValue("sc_stu_log.dv_id", dvId);
        	rec2.setValue("sc_stu_log.is_key", is_key);
        	rec2.setValue("sc_stu_log.pro_id", proId);
        	rec2.setValue("sc_stu_log.cap_em", capEm);
        	rec2.setValue("sc_stu_log.date_checkin", dateAdjust);
        	rec2.setValue("sc_stu_log.checkout_cause",checkout_cause);
        	rec2.setValue("sc_stu_log.comments", comments);
        	rec2.setValue("sc_stu_log.adjust_cause", adjustCause);
        	rec2.setValue("sc_stu_log.date_adjust", dateAdjust);
            rec2.setValue("sc_stu_log.mark",mark1);
            rec2.setValue("sc_stu_log.stu_tec",controller.stu_tec);
        	rec2.oldValues = new Object();
        	rec2.oldValues["sc_stu_log.stu_no"] = stuNo;
        	dsEmp.saveRecord(rec2);
//-------------------------------在学生表里保存调整后的信息-----------------------------------
//        	var rec3 = new Ab.view.Restriction();
//			rec3.addClause("sc_student.stu_no", stuNo, "=");	       		
//			var stuRecord=dsStu.getRecord(rec3);
			stuRecord.setValue("sc_student.bl_id", buildingId);
			stuRecord.setValue("sc_student.fl_id", floorId);
			stuRecord.setValue("sc_student.rm_id", roomId);
			stuRecord.setValue("sc_student.is_key", is_key);
			stuRecord.setValue("sc_student.date_checkin", dateAdjust);
			stuRecord.setValue("sc_student.stu_tec", controller.stu_tec);
			dsStu.saveRecord(stuRecord);
    		//更新学生现在所居住的rm表的信息
			var restriction = new Ab.view.Restriction();
			restriction.addClause("rm.bl_id", buildingId, "=");
			restriction.addClause("rm.fl_id", floorId, "=");
			restriction.addClause("rm.rm_id", roomId, "=");	       		
			var rmRecord=dsRm.getRecord(restriction);
			var current_key=rmRecord.getValue("rm.count_key");
			var current_unget_key=rmRecord.getValue("rm.count_unget_key");
			var current_untrn_key=rmRecord.getValue("rm.count_unrtn_key");
//			 0;未领取;1;领取;2;未退还;3;退还
			if(is_key=="1"){
				var count_key=parseFloat(current_key)+1;
				rmRecord.setValue("rm.count_key", count_key);
			}
//			else if(is_key=="3"){
//				var count_key=parseFloat(current_key)-1;
//				rmRecord.setValue("rm.count_key", count_key);
//			}else if(is_key=="0"){
//				var count_unget_key=parseFloat(current_unget_key)+1;
//				rmRecord.setValue("rm.count_unget_key", count_unget_key);							
//			}else if(is_key=="2"){
//				var count_unrtn_key=parseFloat(current_untrn_key)+1;
//				rmRecord.setValue("rm.count_unrtn_key", count_unrtn_key);	
//			}			
			dsRm.saveRecord(rmRecord);
    		 ASDM_setRoomEmpCnt(buildingId, floorId, roomId, 1,"ds_ab-sp-asgn-em-to-rm_rmCnt");
            if (buildingIdCurrent && floorIdCurrent && roomIdCurrent) {
            	 ASDM_setRoomEmpCnt(buildingId, floorId, roomId, 1,"ds_ab-sp-asgn-em-to-rm_rmCnt");
            }
        }
        grid.removeRows(0);
        grid.update();
        grid.show(false);
        View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
        View.panels.get("ruzhushijian").closeWindow();
        var cp = View.panels.get('abSpAsgnEmToRm_drawingPanel');
        cp.applyDS('labels');
        cp.applyDS('highlight');
        cp.clearAssignCache(true);
        View.closeProgressBar();
    } 
    catch (e) {
        View.closeProgressBar();
        Workflow.handleError(e);
        return;
    }
    View.panels.get("abSpAsgnEmToRm_emSelect").refresh();
    ASDM_resetAssignment(drawingPanel, grid);
}
/**
 * 从abspasgnemtorm_emassigned删除选定的员工分配。
 */
function removeEmpFromList(){
    var grid = View.panels.get("abSpAsgnEmToRm_emAssigned");
    var row = grid.rows[grid.selectedRowIndex];
    View.panels.get('abSpAsgnEmToRm_drawingPanel').unassign('sc_stu_log.stu_no', row['sc_stu_log.stu_no']);
    grid.removeGridRow(row.row.getIndex());
    grid.update();
}
