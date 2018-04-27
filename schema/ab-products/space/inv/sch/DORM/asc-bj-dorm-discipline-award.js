var checkoutAwardController=View.createController('checkoutAwardController', {
	
	currentNode:null,
	treeView:null,
	selectedTab:"studentDisp",
	tabs:null,
	stuNo:"",
	rmLight:false,//用来判断是 针对学生个人 还是 宿舍
	afterViewLoad:function(){
    },
    afterInitialDataFetch:function(){
    	this.treeView = View.panels.get('stuSchTreePanel');
    	this.tabs = View.panels.get('stuDispInfoTabs');
    	this.tabs.addEventListener('afterTabChange', this.tabs_afterTabChange.createDelegate(this));
    	
    	this.stuAwardFormPanel.refresh([],true);
    	this.stuDispFormPanel.refresh([],true);
    	this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.mark','2');
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.mark','1');
	},
	tabs_afterTabChange:function(tabPanel,selectedTabName){
		var awardPanel = this.stuAwardFormPanel;
		var dispPanel = this.stuDispFormPanel;
		this.selectedTab = selectedTabName;
		if(this.selectedTab=='studentAward'){
			if(this.stuNo!=""){
				var res = new Ab.view.Restriction();
		    	res.addClause('sc_stu_disp_log.stu_no',this.stuNo,'=');
		    	this.setAwardFieldValue(this.stuNo,this.stuName,this.stuSexNum,this.stuInYear,this.dvId,this.dvName,this.proId,this.proName,this.blId,this.blName,this.flId,this.rmId,res);
			}else{
				awardPanel.refresh([],true);
				awardPanel.setFieldValue('sc_stu_disp_log.mark','2');
				this.stuAwardGridPanel.show(false);
			}
		}
		if(this.selectedTab=='studentDisp'){
			if(this.stuNo!=""){
				var res = new Ab.view.Restriction();
		    	res.addClause('sc_stu_disp_log.stu_no',this.stuNo,'=');
		    	this.setDispFieldValue(this.stuNo,this.stuName,this.stuSexNum,this.stuInYear,this.dvId,this.dvName,this.proId,this.proName,this.blId,this.blName,this.flId,this.rmId,res);
			}else{
				dispPanel.refresh([],true);
				this.stuDispGridPanel.show(false);
			}
		}
	},
	onBlTreeClick:function(){
		var currentNode = View.panels.get('stuSchTreePanel').lastNodeClicked;
    	var blId = currentNode.data["bl.bl_id"];
    	var restriction =new Ab.view.Restriction();
    	restriction.addClause("sc_student.bl_id",blId,"=");
    	this.stuGridPanel.refresh(restriction);
	},
	onFlTreeClick:function(){
    	var currentNode = View.panels.get('stuSchTreePanel').lastNodeClicked;
    	var blId = currentNode.data["fl.bl_id"];
    	var flId = currentNode.data["fl.fl_id"];
    	var restriction =new Ab.view.Restriction();
    	restriction.addClause("sc_student.bl_id",blId,"=");
    	restriction.addClause("sc_student.fl_id",flId,"=");
    	this.stuGridPanel.refresh(restriction);
	},
    onRmTreeClick:function(){
    	var nextPanel = this.stuGridPanel;
    	this.currentNode = View.panels.get('stuSchTreePanel').lastNodeClicked;
    	var blId = this.currentNode.data["rm.bl_id"];
    	var flId = this.currentNode.data["rm.fl_id"];
    	var rmId = this.currentNode.data["rm.rm_id"];
    	
    	var blName = this.currentNode.data["bl.name"];
    	var dvId = this.currentNode.data["rm.dv_id"];
    	var dvName = this.currentNode.data["dv.dv_name"];
    	var stuYear = this.currentNode.data["rm.stu_in_year"];
    	
    	var restriction =new Ab.view.Restriction();
    	restriction.addClause("sc_student.bl_id",blId,"=");
    	restriction.addClause("sc_student.fl_id",flId,"=");
    	restriction.addClause("sc_student.rm_id",rmId,"=");
    	nextPanel.refresh(restriction);
    	
    	this.res =new Ab.view.Restriction();
    	this.res.addClause("sc_stu_disp_log.bl_id",blId,"=");
    	this.res.addClause("sc_stu_disp_log.fl_id",flId,"=");
    	this.res.addClause("sc_stu_disp_log.rm_id",rmId,"=");
    	this.res.addClause("sc_stu_disp_log.stu_no",'', 'IS NULL', 'AND', true);
    	 
    	var tabs = View.panels.get("stuDispInfoTabs");
    	tabs.findTab("studentAward").show(false);
    	//不熄灯是针对宿舍的
    	if(this.selectedTab=='studentDisp'){
    		this.rmLight=true;
    		this.showDispFieldValue(false);
    		this.setBlDispFieldValue(stuYear,dvId,dvName,blId,blName,flId,rmId,this.res);
    	}
    	this.stuDispGridPanel.refresh();
    	this.stuDispGridPanel.setTitle("宿舍历史违纪信息");
    },
    refreshForm:function(){
    	this.stuDispFormPanel.refresh([],true);
    	this.stuDispGridPanel.refresh([],true);
    	this.stuAwardFormPanel.refresh([],true);
    	this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.mark','2');
    	this.stuAwardGridPanel.refresh([],true);
    },
    showStudentInfo:function(){
    	this.rmLight=false;
    	this.showDispFieldValue(true);
    	var tabs = View.panels.get("stuDispInfoTabs");
    	tabs.findTab("studentAward").show(true);
		
    	var selectedIndex=this.stuGridPanel.selectedRowIndex;
    	var stuNo = this.stuGridPanel.rows[selectedIndex]["sc_student.stu_no"];
    	this.stuNo=stuNo;
    	var res = new Ab.view.Restriction();
    	res.addClause('sc_stu_disp_log.stu_no',stuNo,'=');
    	
    	this.stuName = this.stuGridPanel.rows[selectedIndex]["sc_student.stu_name"];
    	var stuSex = this.stuGridPanel.rows[selectedIndex]["sc_student.stu_sex"];
    	this.stuSexNum = '0';
    	if(stuSex=="男"){
    		this.stuSexNum = '1';
    	}else if(stuSex=="女"){
    		this.stuSexNum ='2';
    	}
    	this.stuInYear = this.stuGridPanel.rows[selectedIndex]["sc_student.stu_in_year"];
    	this.dvId = this.stuGridPanel.rows[selectedIndex]["sc_student.dv_id"];
    	this.dvName = this.stuGridPanel.rows[selectedIndex]["dv.dv_name"];
    	this.proId = this.stuGridPanel.rows[selectedIndex]["sc_student.pro_id"];
    	this.proName = this.stuGridPanel.rows[selectedIndex]["sc_stu_profession.pro_name"];
    	this.blId = this.stuGridPanel.rows[selectedIndex]["sc_student.bl_id"];
    	this.blName = this.stuGridPanel.rows[selectedIndex]["bl.name"];
    	this.flId = this.stuGridPanel.rows[selectedIndex]["sc_student.fl_id"];
    	this.rmId = this.stuGridPanel.rows[selectedIndex]["sc_student.rm_id"];
    	if(this.selectedTab=="studentAward"){
    		this.setAwardFieldValue(this.stuNo,this.stuName,this.stuSexNum,this.stuInYear,this.dvId,this.dvName,this.proId,this.proName,this.blId,this.blName,this.flId,this.rmId,res);
    	}else if(this.selectedTab=="studentDisp"){
    		this.setDispFieldValue(this.stuNo,this.stuName,this.stuSexNum,this.stuInYear,this.dvId,this.dvName,this.proId,this.proName,this.blId,this.blName,this.flId,this.rmId,res);
    	}
    },
    showDispFieldValue:function(trueOrFalse){
		this.stuDispFormPanel.showField("sc_stu_disp_log.stu_no",trueOrFalse);
		this.stuDispFormPanel.showField("sc_stu_disp_log.stu_name",trueOrFalse);
		this.stuDispFormPanel.showField("sc_stu_disp_log.stu_sex",trueOrFalse);
		this.stuDispFormPanel.showField("sc_stu_profession.pro_name",trueOrFalse);
    },
    setBlDispFieldValue:function(stuYear,dvId,dvName,blId,blName,flId,rmId,res){
    	this.stuDispFormPanel.refresh([],true);
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.stu_in_year',stuYear);
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.dv_id',dvId);
    	this.stuDispFormPanel.setFieldValue('dv.dv_name',dvName);
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.mark','1');
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.bl_id',blId);
    	this.stuDispFormPanel.setFieldValue('bl.name',blName);
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.fl_id',flId);
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.rm_id',rmId);
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.disp_main_value','日常违纪');
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.disp_main','1');
    	this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.disp_detail','不熄灯');
    	this.stuDispGridPanel.refresh(res);
    },
    setDispFieldValue:function(stuNo,stuName,stuSexNum,stuInYear,dvId,dvName,proId,proName,blId,blName,flId,rmId,res){
		this.stuDispFormPanel.refresh([],true);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.stu_no',stuNo);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.stu_name',stuName);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.stu_sex',stuSexNum);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.stu_in_year',stuInYear);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.dv_id',dvId);
		this.stuDispFormPanel.setFieldValue('dv.dv_name',dvName);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.pro_id',proId);
		this.stuDispFormPanel.setFieldValue('sc_stu_profession.pro_name',proName);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.mark','1');
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.bl_id',blId);
		this.stuDispFormPanel.setFieldValue('bl.name',blName);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.fl_id',flId);
		this.stuDispFormPanel.setFieldValue('sc_stu_disp_log.rm_id',rmId);
		this.stuDispGridPanel.refresh(res);
    },
    setAwardFieldValue:function(stuNo,stuName,stuSexNum,stuInYear,dvId,dvName,proId,proName,blId,blName,flId,rmId,res){
  		this.stuAwardFormPanel.refresh([],true);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.stu_no',stuNo);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.stu_name',stuName);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.stu_sex',stuSexNum);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.stu_in_year',stuInYear);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.dv_id',dvId);
		this.stuAwardFormPanel.setFieldValue('dv.dv_name',dvName);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.pro_id',proId);
		this.stuAwardFormPanel.setFieldValue('sc_stu_profession.pro_name',proName);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.mark','2');
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.bl_id',blId);
		this.stuAwardFormPanel.setFieldValue('bl.name',blName);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.fl_id',flId);
		this.stuAwardFormPanel.setFieldValue('sc_stu_disp_log.rm_id',rmId);
		this.stuAwardGridPanel.refresh(res);
    },
    saveNewData:function(){
    	var awardPanel = this.stuAwardGridPanel;
    	var dispPanel = this.stuDispGridPanel;
    	if(this.selectedTab=="studentAward"){
    		this.panel = this.stuAwardFormPanel;
    	}else if(this.selectedTab=="studentDisp"){
    		this.panel = this.stuDispFormPanel;
    	}
    	var dispMain = this.panel.getFieldValue("sc_stu_disp_log.disp_main");
    	if(dispMain==""){
    		View.showMessage("请填写类型");
    		return;
    	}
    	var dispDetail = this.panel.getFieldValue("sc_stu_disp_log.disp_detail");
    	if(dispDetail==""){
    		View.showMessage("请填写明细");
    		return;
    	}
    	var dateDisp = this.panel.getFieldValue("sc_stu_disp_log.date_disp");
    	if(dateDisp==""){
    		View.showMessage("请填写日期");
    		return;
    	}
    	if(this.rmLight){
    		var dvName = this.panel.getFieldValue("dv.dv_name");
    		if(dvName==""){
    			View.showMessage("请检查该房间是分配给哪一个学院的？");
        		return;
    		}
    		var stuYear = this.panel.getFieldValue("sc_stu_disp_log.stu_in_year");
    		if(stuYear==""){
    			View.showMessage("请检查该房间是分配给【"+dvName+"】哪一个年级的？");
    			return;
    		}
    		var record=new Ab.data.Record();
    		var account = View.dataSources.get("sc_stu_disp_log_ds");
    		record.setValue("sc_stu_disp_log.stu_in_year",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.stu_in_year"));
    		record.setValue("sc_stu_disp_log.bl_id",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.bl_id"));
    		record.setValue("sc_stu_disp_log.fl_id",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.fl_id"));
    		record.setValue("sc_stu_disp_log.rm_id",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.rm_id"));
    		record.setValue("sc_stu_disp_log.dv_id",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.dv_id"));
    		record.setValue("sc_stu_disp_log.mark",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.mark"));
    		record.setValue("sc_stu_disp_log.disp_main",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.disp_main"));
    		record.setValue("sc_stu_disp_log.disp_detail",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.disp_detail"));
    		record.setValue("sc_stu_disp_log.date_disp",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.date_disp"));
    		record.setValue("sc_stu_disp_log.comments",this.stuDispFormPanel.getFieldValue("sc_stu_disp_log.comments"));
    		account.saveRecord(record);
    		this.stuDispGridPanel.refresh(this.res);
    		
    	}else{
    		var restriction = new Ab.view.Restriction();
    		var stuNo = this.panel.getFieldValue("sc_stu_disp_log.stu_no");
    		if(stuNo==""){
    			View.showMessage("请填写学号");
    			return ;
    		}
    		var mark = this.panel.getFieldValue("sc_stu_disp_log.mark");
    		
    		var comments = this.panel.getFieldValue("sc_stu_disp_log.comments");
    		restriction.addClause("sc_stu_disp_log.stu_no",stuNo,"=");
    		try{
    			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-DispStudentHandler-insertDispNewData',stuNo,mark,dispMain,dispDetail,dateDisp,comments);
    			if (result.code == 'executed') {
    				awardPanel.refresh();
    				dispPanel.refresh();
    			}
    		}catch(e){
    			Workflow.handleError(e);
    			return;
    		}
    	}
    },
    stuDispImport:function(){
		var controller = this;
		View.openDialog('asc-bj-dorm-stu-award-import.axvw',null, false, {
			width: 800,
			height: 400,
			closeButton: false
		});
	},
    stuDispConsole_onShow:function(){
    	var panel = this.stuDispConsole;
    	var stuNo = panel.getFieldValue('sc_student.stu_no');
    	var stuName = panel.getFieldValue('sc_student.stu_name');
    	var dvId= panel.getFieldValue('sc_student.dv_id');
    	var restriction = new Ab.view.Restriction();
    	var res = new Ab.view.Restriction();
    	restriction.addClause('1=1');
    	res.addClause('1=1');
    	if(stuNo!=""){
    	restriction.addClause('sc_stu_disp_log.stu_no',stuNo,'=');
    	res.addClause('sc_student.stu_no',stuNo,'=');
    	}
    	if(stuName!=""){
    	restriction.addClause('sc_stu_disp_log.stu_name',stuName,'=');
    	res.addClause('sc_student.stu_name',stuName,'=');
    	}
    	if(dvId!=""){
    	restriction.addClause('sc_stu_disp_log.dv_id',dvId,'=');
    	res.addClause('sc_student.dv_id',dvId,'=');
    	}    	
    	this.stuGridPanel.refresh(res);
    	if(this.selectedTab=="studentAward"){
    		this.panel = this.stuAwardFormPanel;
    		this.panel.refresh(restriction);
    	}else if(this.selectedTab=="studentDisp"){
    		this.panel = this.stuDispFormPanel;
    		this.panel.refresh(restriction);
    	}
    },
    stuDispDownload: function(){
		var src=View.project.projectGraphicsFolder + '/model/DispStudent.xls';
		window.open(src);
	},
	lightDispDownload: function(){
		var src=View.project.projectGraphicsFolder + '/model/DispStudent_light.xls';
		window.open(src);
	},
	stuAwardGridPanel_onDelete: function(){
		var grid = this.stuAwardGridPanel;
		var selectedRecordList = grid.getSelectedRecords();
		if (selectedRecordList.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		stuDataSource = this.stu_award_DS;
		View.confirm('确定删除奖励记录？', function(button, text){
			if (button == 'yes') {
				for (var i = 0; i < selectedRecordList.length; i++) {
					var record = selectedRecordList[i];
					stuDataSource.deleteRecord(record);
				}
			}
			grid.refresh();
		});
	},
	stuDispGridPanel_onDelete: function(){
		var grid = this.stuDispGridPanel;
		var selectedRecordList = grid.getSelectedRecords();
		if (selectedRecordList.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		stuDataSource = this.stu_disp_DS;
		View.confirm('确定删除 违纪记录？', function(button, text){
			if (button == 'yes') {
				for (var i = 0; i < selectedRecordList.length; i++) {
					var record = selectedRecordList[i];
					stuDataSource.deleteRecord(record);
				}
			}
			grid.refresh();
		});
	}
});




