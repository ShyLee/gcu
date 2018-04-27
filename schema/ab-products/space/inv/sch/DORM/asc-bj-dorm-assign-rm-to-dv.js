var controller = View.createController('abAsgnDvToRmController', {
	afterInitialDataFetch:function(){
		this.tabs = View.getControlsByType(self, 'tabs')[0];
		//获取当前年份
//		var currentDate = ASDM_getCurrentDate_Client();
//		var currentYearMonth=ASDM_getYearMonthOfDate(currentDate);
//		var year=currentYearMonth.substring(0,4);
		var year=ASDM_getMaxStuInYear();
		this.consolePanel.setFieldValue("sc_student.stu_in_year",year);
	},
	consolePanel_onShow:function(){
		
		var dvId=this.consolePanel.getFieldValue("sc_student.dv_id");
		var dvName=this.consolePanel.getFieldValue("dv.dv_name");
		var inYear=this.consolePanel.getFieldValue("sc_student.stu_in_year");
		var blId=this.consolePanel.getFieldValue("sc_student.bl_id");
		var blName=this.consolePanel.getFieldValue("bl.name");
		 
		if(dvId==""){
			View.showMessage("请选择一个学院！");
			return;
		}
		this.tabs.dvId=dvId;
		this.tabs.dvName=dvName;
		this.tabs.inYear=inYear;
		this.tabs.blId=blId;
		
		var nextTabName = 'assignRm_male_tab';
	    this.tabs.selectTab(nextTabName,[],true,true,false);
	},
	filterClear:function(){
		this.consolePanel.setFieldValue("sc_student.dv_id","");
		this.consolePanel.setFieldValue("dv.dv_name","");
		this.consolePanel.setFieldValue("sc_student.bl_id","");
		this.consolePanel.setFieldValue("bl.name","");
	},
	allDvAssignRmPanel_onViewAll:function(){
		this.allDvAssignPanel.addParameter('dvName',"1=1");
		this.allDvAssignPanel.refresh();
		this.allDvAssignPanel.showInWindow({
			x:150,
			y:100,
			width: 900,
			height: 500
		});
	},
	consolePanel_onViewDv:function(){
		var dvName=this.consolePanel.getFieldValue("dv.dv_name");
		if(dvName!=""){
			this.allDvAssignPanel.addParameter('dvName',"sc_dv_year_stu_rm.dv_name like '%"+dvName+"%'");
		}else{
			View.showMessage("请选择一个学院！");
			return;
		}
		this.allDvAssignPanel.refresh();
		this.allDvAssignPanel.setTitle("【"+dvName+"】宿舍分配信息列表");
		this.allDvAssignPanel.showInWindow({
			x:150,
			y:200,
			width: 900,
			height: 300
		});
	},
	consolePanel_onViewAllDvNull:function(){
		this.allDvUnassignPanel.refresh();
		this.allDvUnassignPanel.showInWindow({
			x:150,
			y:100,
			width: 800,
			height: 500
		});
	},
	consolePanel_onViewAllDv:function(){
		this.allDvAssignRmPanel.refresh();
		this.allDvAssignRmPanel.showInWindow({
			x:150,
			y:100,
			width: 1000,
			height: 500
		});
	},
	allDvAssignRmPanel_onAllReturn:function(){
		var selectKeys=this.allDvAssignRmPanel.getPrimaryKeysForSelectedRows();
		if(selectKeys.length>0){
			  var controller = this;
	  		  var confirmMessage="确定要收回选中的房间？";
	  		  View.confirm(confirmMessage, function(button){
		            if (button == 'yes') {
		            	try {
		            		for(var i=0;i<selectKeys.length;i++){
		            			var blId =selectKeys[i]['rm.bl_id'];
		            			var flId =selectKeys[i]['rm.fl_id'];
		            			var rmId =selectKeys[i]['rm.rm_id'];
		            			var restriction = new Ab.view.Restriction();
		            			restriction.addClause("rm.bl_id", blId,"=");
		            			restriction.addClause("rm.fl_id", flId,"=");
		            			restriction.addClause("rm.rm_id", rmId,"=");
		            			var account=View.dataSources.get("rm_ds2");
		            			var record=account.getRecord(restriction);
		            			record.setValue("rm.dv_id","");
		            			record.setValue("rm.stu_in_year","");
		            			account.saveRecord(record);
		            		}
		            		controller.allDvAssignRmPanel.refresh();
		            	}catch(e){
		            		 View.showMessage(e.message);
		                	 return;
		                 }
		            }
		      });
		}else{
			View.showMessage("请选择需要退回的房间！");
			return;
		}
	},
	/*导报表*/
	allDvUnassignPanel_onExportReport:function(){
//		alert(1);
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
	        width: 470,
	        height: 200,
	        xmlName: "gcu-dorm-empty",
	        closeButton: false
	    });
	},
	allDvAssignRmPanel_onRuZhuInfo:function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
	        width: 470,
	        height: 200,
	        xmlName: "gcu-dorm-stu-num",
	        closeButton: false
	    });
	},
	allDvAssignRmPanel_onDormInfo:function(){
//		alert(1);
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
	        width: 470,
	        height: 200,
	        xmlName: "gcu-dorm-statistic",
	        closeButton: false
	    });
	}
});
function changeDvName(){
	var dvName=controller.consolePanel.getFieldValue("dv.dv_name");
	if(dvName==""){
		controller.consolePanel.setFieldValue("sc_student.dv_id","");
	}
}
function changeBlName(){
	var blName=controller.consolePanel.getFieldValue("bl.name");
	if(blName==""){
		controller.consolePanel.setFieldValue("sc_student.bl_id","");
	}
}