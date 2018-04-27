var checkoutDispController=View.createController('checkoutDispController', {
	stuYear:"",
	dispDetail:"",
	dateDispForm:"",
	dateDispTo:"",
	showTotal:function(){
		this.stuYear = this.consoleDispPanel.getFieldValue("sc_stu_disp_log.stu_in_year");
		this.dispDetail = this.consoleDispPanel.getFieldValue("sc_stu_disp_log.disp_detail");
		this.dateDispForm = this.consoleDispPanel.getFieldValue("sc_stu_disp_log.date_from");
		this.dateDispTo = this.consoleDispPanel.getFieldValue("sc_stu_disp_log.date_to");
		
		var totalPanel = this.gridTotalDispPanel;
		var res = new Ab.view.Restriction();
		if(this.stuYear!=""){
			totalPanel.addParameter('stuYear',"a.stu_in_year = '"+this.stuYear+"'");
		}else{
			totalPanel.addParameter('stuYear',"1=1");
		}
		
		if(this.dispDetail!=""){
			totalPanel.addParameter('dispDetail',"a.disp_detail = '"+this.dispDetail+"'");
		}else{
			totalPanel.addParameter('dispDetail',"1=1");
		}
		
		if(this.dateDispForm!=""){
			totalPanel.addParameter('dateDispForm',"a.date_disp >= to_date('"+this.dateDispForm+"', 'yyyy/MM/dd')");
		}else{
			totalPanel.addParameter('dateDispForm',"1=1");
		}
		
		if(this.dateDispTo!=""){
			totalPanel.addParameter('dateDispTo',"a.date_disp <= to_date('"+this.dateDispTo+"', 'yyyy/MM/dd')");
		}else{
			totalPanel.addParameter('dateDispTo',"1=1");
		}
		totalPanel.refresh();
	},
	gridTotalDispPanel_onDispStatistic:function(){
		var title="";
		var stuYear=this.stuYear;
		var dispDetail=this.dispDetail;
		var dateDispForm=this.dateDispForm;
		var dateDispTo=this.dateDispTo;
		View.openDialog('asc-bj-dorm-discipline-award-info-time.axvw', null, true, {
            width: 1000,
            height: 700,
            stuYear:stuYear,
            dispDetail:dispDetail,
            dateDispForm:dateDispForm,
            dateDispTo:dateDispTo,
            closeButton: false
        });
	},
	showAwardDetail:function(){
		var selectedIndex=this.gridTotalDispPanel.selectedRowIndex;
		var row=this.gridTotalDispPanel.rows[selectedIndex];
		var dvId=row["sc_stu_disp_log.dv_id"];
		
		var restriction = new Ab.view.Restriction();
		restriction=this.autoGetRestriction(dvId);
		restriction.addClause("sc_stu_disp_log.mark","2","=");
		this.gridInfoDispPanel.refresh(restriction);
	},
	showDispDetail:function(){
		var selectedIndex=this.gridTotalDispPanel.selectedRowIndex;
		var row=this.gridTotalDispPanel.rows[selectedIndex];
		var dvId=row["sc_stu_disp_log.dv_id"];
		
		var restriction = new Ab.view.Restriction();
		restriction=this.autoGetRestriction(dvId);
		restriction.addClause("sc_stu_disp_log.mark","1","=");
		this.gridInfoDispPanel.refresh(restriction);
	},
	showAllDetail:function(){
		var selectedIndex=this.gridTotalDispPanel.selectedRowIndex;
		var row=this.gridTotalDispPanel.rows[selectedIndex];
		var dvId=row["sc_stu_disp_log.dv_id"];
		var restriction = new Ab.view.Restriction();
		restriction=this.autoGetRestriction(dvId);
		this.gridInfoDispPanel.refresh(restriction);
	},
	autoGetRestriction:function(dvId){
		var restriction = new Ab.view.Restriction();
		if(dvId!=""){
			restriction.addClause("sc_stu_disp_log.dv_id",dvId,"=");
		}
		if(this.stuYear!=""){
			restriction.addClause("sc_stu_disp_log.stu_in_year",this.stuYear,"=");
		}
		
		if(this.dispDetail!=""){
			restriction.addClause("sc_stu_disp_log.disp_detail",this.dispDetail,"=");
		}
		if(this.dateDispForm!=""){
			restriction.addClause("sc_stu_disp_log.date_disp",this.dateDispForm,">=");
		}
		if(this.dateDispTo!=""){
			restriction.addClause("sc_stu_disp_log.date_disp",this.dateDispTo,"<=");
		}
		return restriction;
	},
	
	gridTotalDispPanel_onDispRecordStatistic:function(){
		var dateDispForm = this.consoleDispPanel.getFieldValue("sc_stu_disp_log.date_from");
		var dateDispTo = this.consoleDispPanel.getFieldValue("sc_stu_disp_log.date_to");
		if(dateDispForm==""){
			View.showMessage("请选择违纪时间范围,违纪时间从！");
			return;
		}
		if(dateDispTo==""){
			View.showMessage("请选择违纪时间范围，违纪时间到！");
			return;
		}
		
		var year1="";
		var year2="";
		var year3="";
		var year4="";
		var days="";
		var dateStart=new Date(dateDispForm);
		var dateEnd=new Date(dateDispTo);
		if(dateStart>dateEnd){
			View.showMessage("违纪时间范围有问题，请检查确定【违纪时间从】小于【违纪时间到】！");
			return;
		}
		days = (dateEnd.getTime() - dateStart.getTime())/(3600000 * 24) + 1;
		var dateStartValue=dateStart.format("m月d日");
		var dateEndValue=dateEnd.format("m月d日");
		
		var records=getStuYear();
		if(records.length==4){
			year1=records[0]["sc_stu_year.stu_in_year"];
			year2=records[1]["sc_stu_year.stu_in_year"];
			year3=records[2]["sc_stu_year.stu_in_year"];
			year4=records[3]["sc_stu_year.stu_in_year"];
		}
		if(year1=="" || year2=="" || year3=="" || year4==""){
			View.showMessage("在校年级有问题，请检查【定义年级】界面中在校年级是否是4个！");
			return;
		}
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "gcu-dorm-lateLight",
            parameters: {
            	'year1':year1,
            	'year2':year2,
            	'year3':year3,
            	'year4':year4,
                'dateStart':this.dateDispForm,
                'dateEnd':this.dateDispTo,
                'dateStartValue':dateStartValue,
                'dateEndValue':dateEndValue,
                'days':days
            },
            closeButton: false
        });
		
	},
	gridTotalDispPanel_onDormAndStu:function(){
//		alert(1);
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "gcu-dv-dorm-stu-num",
            closeButton: false
        });
		
	}
});
function getStuYear(){
	var parameters = {
			tableName: 'sc_stu_year',
			fieldNames: toJSON(['sc_stu_year.stu_in_year']),
			sortValues: toJSON([{'fieldName': 'sc_stu_year.stu_in_year', 'sortOrder':1}]),
	};

		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var records=[];
		if (result.data.records.length > 0) {
			records=result.data.records;
		}
		return records;
}
