/**
 * @author Keven.xi
 */
var ascBjUsmsOverallBl = View.createController('ascBjUsmsOverallBlController', {
	
	tabSelected:"",
	siteCount:0,
	campusTabs:null,
	
	afterViewLoad: function(){
		this.campusTabs = View.getControl('', 'campusTabs');
	},
	afterInitialDataFetch: function() {
		this.tabs = View.getControlsByType(self, 'tabs')[0];
		this.inherit();
 	 	this.campusTabs.addEventListener('afterTabChange',this.campusTabs_afterTabChange.createDelegate(this));	
		//获取当前年份
//		var currentDate = ASDM_getCurrentDate_Client();
//		var currentYearMonth=ASDM_getYearMonthOfDate(currentDate);
//		var year=currentYearMonth.substring(0,4);
 	 	var year=ASDM_getMaxStuInYear();
		this.ConsoleForm.setFieldValue("sc_student.stu_in_year",year);
		this.ConsoleForm_onShowTree();
	},
		
	campusTabs_afterTabChange:function(tabPanel,selectedTabName, newTabName){
		this.campusTabs.curSelectedTabName = selectedTabName;
		
		for  (var i=0; i < this.siteCount; i++){
			if(selectedTabName == 'subcampus_tab_'+i){
				var siteId = this.campusTabs.findTab(selectedTabName).siteId;
				this.campusTabs.currentSiteId = siteId;
	 		}
		}
	},
	ConsoleForm_onChangelist:function(){
		var user = this.view.user;
		var dv_id = user.employee.organization.divisionId;
		var dsDv = View.dataSources.get("dv_ds");
		var res=new Ab.view.Restriction();
		res.addClause('dv.dv_id',dv_id,'=');
		var record=dsDv.getRecord(res);
		var dv_name=record.getValue("dv.dv_name");
		
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("sc_student.dv_name_old" , dv_name, "=","or");
    	restriction.addClause("sc_student.dv_name_new" , dv_name, "=","or");
    	this.studentChangeList.refresh(restriction);
    	this.studentChangeList.setTitle("学生变动情况表");
    	
    	this.studentChangeList.showInWindow({
    		x:250,
    		y:200,
            width: 900,
            height: 500
        });
	},
	ConsoleForm_onShowTree: function(){
		this.tabs = View.getControlsByType(self, 'tabs')[0];
        var stuinYear=this.ConsoleForm.getFieldValue("sc_student.stu_in_year");
        var blId=this.ConsoleForm.getFieldValue("sc_student.bl_id");
        var blName=this.ConsoleForm.getFieldValue("bl.name");
        var stuNo=this.ConsoleForm.getFieldValue("sc_student.stu_no");
        var stuName=this.ConsoleForm.getFieldValue("sc_student.stu_name");
        //this.tabs.dvId=dvId; //this.tabs.A 可以再任何一个tab中取到变量A的值
        
        this.tabs.stuinYear=stuinYear;
        this.tabs.stuNo=stuNo;
        this.tabs.stuName=stuName;
        this.tabs.blName=blName;
        var nextTabName ='male_tab'; //定义一个变量，'assignRm_male_tab'是指<tab/>中的name值
        this.tabs.selectTab(nextTabName,null,false,true,false); //显示刷新tab界面
    },
    ConsoleForm_onClear:function(){
    	this.tabs = View.getControlsByType(self, 'tabs')[0];
//      this.tabs = View.getControlsByType(self, 'tabs')[0];//定义一个tabs，可以在各个tab之间进行传值，self参数是指当前所在js是tabs
    	var stuinYear=this.ConsoleForm.setFieldValue("sc_student.stu_in_year","");
    	var blName=this.ConsoleForm.setFieldValue("bl.name","");
    	var stuNo=this.ConsoleForm.setFieldValue("sc_student.stu_no","");
    	var stuName=this.ConsoleForm.setFieldValue("sc_student.stu_name","");
        this.tabs.stuinYear=stuinYear;
        this.tabs.stuNo=stuNo;
        this.tabs.stuName=stuName;
        this.tabs.blName=blName;
		var nextTabName ='male_tab';
		this.tabs.selectTab(nextTabName,null,false,true,false); 
	},
	ConsoleForm_onAllocated:function(){
		var controller=this;
   	    View.openDialog('asc-bj-dorm-assign-allocated.axvw', null, false, {
            width: 900,
            height: 600,
  		    closeButton: false,
			afterViewLoad:function(dialogView){
				var dialogController=dialogView.controllers.get("controller");
				dialogController.onSave=ascBjUsmsOverallBl.GridForm_onSubmitChanges.createDelegate(controller);
				}
   	    });
	},
	GridForm_onSubmitChanges:function(){
		this.campusTabs.refresh();
	},
});