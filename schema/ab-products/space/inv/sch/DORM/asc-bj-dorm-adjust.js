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
		this.inherit();
 	 	this.campusTabs.addEventListener('afterTabChange',this.campusTabs_afterTabChange.createDelegate(this));	
// 	 	this.tabs = View.getControlsByType(self, 'tabs')[0];
//		//获取当前年份
//		var currentDate = ASDM_getCurrentDate_Client();
//		var currentYearMonth=ASDM_getYearMonthOfDate(currentDate);
//		var year=currentYearMonth.substring(0,4);
//		this.ConsoleForm.setFieldValue("sc_student.stu_in_year",year);
 	 	var user = this.view.user;
 	 	if(user.role=="UNV STU ADMIN"){
 	 		this.ConsoleForm.actions.get('changelist').enable(true);
 	 	}else{
 	 		this.ConsoleForm.actions.get('changelist').enable(false);
 	 	}
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
		var restriction = new Ab.view.Restriction();
    	restriction.addClause("sc_student.stay_status" , "0", "!=");
    	this.studentChangeList.refresh(restriction);
    	this.studentChangeList.setTitle("学生变动情况表");
    	
    	this.studentChangeList.showInWindow({
    		x:250,
    		y:200,
            width: 900,
            height: 500
        });
	},
	changeStuInfo:function(){
		var panel = this.studentChangeList;
		var selectedIndex = panel.selectedRowIndex;
		var stu_no = panel.rows[selectedIndex]["sc_student.stu_no"];
		var stay_status = panel.rows[selectedIndex]["sc_student.stay_status"];
		var dv_name = panel.rows[selectedIndex]["dv.dv_name"];
		var dv_id_new = panel.rows[selectedIndex]["sc_student.dv_id_new"];
		var dv_id_old = panel.rows[selectedIndex]["sc_student.dv_id_old"];
		var dv_name_new = panel.rows[selectedIndex]["sc_student.dv_name_new"];
		var bl_id = panel.rows[selectedIndex]["sc_student.bl_id"];
		var fl_id = panel.rows[selectedIndex]["sc_student.fl_id"];
		var rm_id = panel.rows[selectedIndex]["sc_student.rm_id"];
		var pro_name = panel.rows[selectedIndex]["sc_stu_profession.pro_name"];
		var pro_id_new = panel.rows[selectedIndex]["sc_student.pro_id_new"];
		var pro_id_old = panel.rows[selectedIndex]["sc_student.pro_id_old"];
		var pro_name_new = panel.rows[selectedIndex]["sc_student.pro_name_new"];
		if(stay_status=="有变更"){
				try {
					Workflow.callMethod(
						'AbSpaceRoomInventoryBAR-HousePKValueHander-updateStuInfo', stu_no,dv_id_new,dv_name_new,pro_id_new,pro_name_new,bl_id,fl_id,rm_id);
					View.showMessage("变更成功");
				} catch (e) {
					View.showMessage("工作流失败");
		    		Workflow.handleError(e);
				}
			
		}else{
			View.showMessage("处理已完成");
			return;
		}
		this.studentChangeList.refresh();
	},
	ConsoleForm_onShowTree: function(){
		this.tabs = View.getControlsByType(self, 'tabs')[0];
        var stuinYear=this.ConsoleForm.getFieldValue("sc_student.stu_in_year");
        var blId=this.ConsoleForm.getFieldValue("sc_student.bl_id");
        var blName=this.ConsoleForm.getFieldValue("bl.name");
        var stuNo=this.ConsoleForm.getFieldValue("sc_student.stu_no");
        var stuName=this.ConsoleForm.getFieldValue("sc_student.stu_name");
    	var dvname=this.ConsoleForm.getFieldValue("dv.dv_name");
        //this.tabs.dvId=dvId; //this.tabs.A 可以再任何一个tab中取到变量A的值
        this.tabs.stuinYear=stuinYear;
        this.tabs.stuNo=stuNo;
        this.tabs.stuName=stuName;
        this.tabs.blName=blName;
        this.tabs.dvname=dvname;
        var nextTabName ='male_tab'; //定义一个变量，'assignRm_male_tab'是指<tab/>中的name值
        this.tabs.selectTab(nextTabName,null,false,true,false); //显示刷新tab界面
    },
    ConsoleForm_onClear:function(){
    	this.tabs = View.getControlsByType(self, 'tabs')[0];
    	var stuinYear=this.ConsoleForm.setFieldValue("sc_student.stu_in_year","");
    	var dvname=this.ConsoleForm.setFieldValue("dv.dv_name","");
    	var blName=this.ConsoleForm.setFieldValue("bl.name","");
    	var stuNo=this.ConsoleForm.setFieldValue("sc_student.stu_no","");
    	var stuName=this.ConsoleForm.setFieldValue("sc_student.stu_name","");
        this.tabs.stuinYear=stuinYear;
        this.tabs.stuNo=stuNo;
        this.tabs.stuName=stuName;
        this.tabs.blName=blName;
        this.tabs.dvname=dvname;
		var nextTabName ='male_tab';
		this.tabs.selectTab(nextTabName,null,false,true,false); 
	},
});

function createSubCampusTab(level, subCampusTitle,siteId){
    // create Tab object
    var tab = new Ab.tabs.Tab({
        name: "subcampus_tab_" + level,
        title: subCampusTitle,
        fileName: 'asc-bj-usms-overall-bl-main-wd.axvw',
        selected: false,
        enabled: true,
        hidden: false,
        useParentRestriction: false,
        isDynamic: false,
        useFrame: true,
        createTabPanel: createSubCampusTabPanel
    });
    
    tab.siteId = siteId;
    ascBjUsmsOverallBl.campusTabs.addTab(tab);
    tab.createTabPanel();
}

function createSubCampusTabPanel(){
    // create managed iframe
    this.frame = new Ext.ux.ManagedIFrame({
        autoCreate: {
            width: '100%',
            height: '100%'
        }
    });
    this.frame.setStyle('border', 'none');
    
    //this.loadView();
    
    // create Ext.Panel with the iframe as content
    var tabPanel = this.parentPanel.tabPanel.add({
        id: this.name,
        title: this.title,
        contentEl: this.frame,
        autoWidth: true,
        autoHeight: true,
        border: false,
        closable: false
    });
    this.tabPanel = tabPanel;
    this.id = this.name;
}
/**
 * 获取当前客户端年月日 
 * @returns {String} yyyy-MM-dd
 */
function ASDM_getCurrentDate_Client(){
    var returnedDate = "";
    var curDate = new Date();
    var temp_month = curDate.getMonth() + 1;
    var month = temp_month < 10 ? "0" + temp_month : temp_month;
    var temp_day = "" + curDate.getDate();
    var day = temp_day < 10 ? "0" + temp_day : temp_day;
    var year = "" + curDate.getFullYear();
    returnedDate = year + "-" + month+"-"+day;
    return returnedDate;
}
/**
 *格式化日期，转化成6位字串，yyyyMM
 *@param {String} dateString --从页面getFieldValue()获取的日期字符串
 */
function ASDM_getYearMonthOfDate(dateString){
    var yearMonth = "";
    if (valueExists(dateString)) {
        var year = dateString.split("-")[0];//获取年
        var month = dateString.split("-")[1];//获取月
        yearMonth = year + month;
    }
    return yearMonth;
}