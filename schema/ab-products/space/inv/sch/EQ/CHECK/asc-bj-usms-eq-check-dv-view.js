var controller=View.createController('CheckApprovedForm',{
	checkMainIDet: "",
	dvId: "",
	afterInitialDataFetch: function(){
		this.consoleForm.clear();
	},
	consoleForm_onBtnShow: function(){
		var checkYear=this.consoleForm.getFieldValue('eq_check_main.option1');
		if(valueExistsNotEmpty(checkYear)){
			var checkYearInt=parseInt(checkYear);
			if(isNaN(checkYearInt)){
				View.alert('输入不符合4位数字的格式 !');
				return;
			}else{
				var CheckYearTxt=checkYearInt.toString();
				if(CheckYearTxt.length!=4){
					View.alert('输入不符合4位数字的格式 !');
					return;
				}
				
				var checkMainRes=new Ab.view.Restriction();
				var checkYearNext=(checkYearInt+1);
				var checkYearNextText=checkYearNext.toString();
				checkMainRes.addClause('eq_check_main.check_date_start',checkYear+'-01-01','&gt;=');
				checkMainRes.addClause('eq_check_main.check_date_start',checkYearNextText+'-01-01','&lt;');
				this.eqCheckMainPanel.refresh(checkMainRes);
			}
		}
		this.eqCheckReportPanel.show(false);
		this.eqCheckPanel.show(false);
	},
	consoleForm_onBtnClear: function(){
		this.consoleForm.clear();
		this.eqCheckMainPanel.restriction=null;
		this.eqCheckMainPanel.refresh("");
	}
});

function showCheckReportPanel(value){
	var checkMainId=value.restriction['eq_check_main.check_main_id'];
	
	//如果选择的任务项的状态为已完成，那么将批准和关闭按钮隐藏
	var res=new Ab.view.Restriction();
	res.addClause('eq_check_main.check_main_id',checkMainId,'=');
	var mainDsReocrd=View.dataSources.get('ascBjUsmsEqCheckMainDs').getRecord(res);
	var isDone=mainDsReocrd.getValue('eq_check_main.is_done');
	var eqCheckPanel=View.panels.get('eqCheckPanel');
	controller.checkMainIDet=checkMainId;
	var checkMainRes=new Ab.view.Restriction();
	checkMainRes.addClause('eq_check_report.check_main_id',checkMainId,'=');
	//View.panels.get('eqCheckPanel').show(false);
	View.panels.get('eqCheckReportPanel').show(true);
	View.panels.get('eqCheckPanel').show(false);
	View.panels.get('eqCheckReportPanel').refresh(checkMainRes);
}

function eqCheckReportMethod(value){
	var ReportPanel=View.panels.get('eqCheckReportPanel');
	var selectedIndex=ReportPanel.selectedRowIndex;
	var rowRecord=ReportPanel.gridRows.get(selectedIndex).getRecord();
	var mainId=rowRecord.getValue('eq_check_report.check_main_id');
	var dvId=rowRecord.getValue('eq_check_report.dv_id');
	controller.dvId=dvId;
	var checkReportRes=new Ab.view.Restriction();
	checkReportRes.addClause('eq_check.check_main_id',mainId,'=');
	checkReportRes.addClause('eq_check.dv_id',dvId,'=');
	
	View.panels.get('eqCheckPanel').show(true);

	View.panels.get('eqCheckPanel').refresh(checkReportRes);
	
}