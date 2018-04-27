var controller=View.createController('CheckApprovedForm',{
	checkMainIDet: "",
	dvId: "",
	dpId: "",
	roleName:"",
	afterViewLoad:function(){
		var user = this.view.user;
		var restriction=new Ab.view.Restriction();
		var roleName=user.role;
		this.roleName=roleName;
		if(roleName == "UNV EQ ADMIN"){
			this.eqCheckMainPanel.addParameter('isDone', "5");
		}
		if(roleName == "UNV EQ HEAD"){
			this.eqCheckMainPanel.addParameter('isDone', "3");
		}
	},
	afterInitialDataFetch: function(){
		this.consoleForm.clear();
		var btnCloseDv=this.eqCheckPanel.actions.get('btnCloseDv').button.text;
		//this.eqCheckPanel.actions.get('btnCloseDv').button.text="此部门审核完毕";
		var b=1;

	},
	//当清查列表中无设备项时,审核通过该单位
	eqCheckPanel_onBtnCloseDv: function(){
		View.confirm('确定要完成此单位清查吗?',function(button){
			if(button=='yes'){
				var eqCheckPanel=View.panels.get('eqCheckPanel');
				var checkPassListPanel=View.panels.get('checkPassListPanel');
				var gridRows=eqCheckPanel.gridRows;
				
				var eqAttachCheckPanel=View.panels.get('eqAttachCheckPanel');
				var checkAttachPassListPanel=View.panels.get('checkAttachPassListPanel');
				var gridAttachRows=eqAttachCheckPanel.gridRows;
				
				var checkMainId=controller.checkMainIDet;
				var dvId=controller.dvId;
				var dpId=controller.dpId;
				
				var checkReportDs=View.dataSources.get('ascBjUsmsEqCheckReportDs');
				var checkReportRes=new Ab.view.Restriction();
				checkReportRes.addClause('eq_check_report.dv_id',dvId,'=');
				if(dpId!=""){
					checkReportRes.addClause('eq_check_report.dp_id',dpId,'=');
				}else{
					checkReportRes.addClause('eq_check_report.dp_id','','IS NULL');
				}
				checkReportRes.addClause('eq_check_report.check_main_id',checkMainId,'=');
				var checkReportRecord=checkReportDs.getRecord(checkReportRes);
				
				//取出审批通过数和审批驳回数存入数据库中
				//审批通过数
				var passCountDs=View.dataSources.get('ascBjUsmsEqCheckLossCountDs');
				var passCountRes=new Ab.view.Restriction();
				passCountRes.addClause('eq_check.check_main_id',checkMainId,'=');
				passCountRes.addClause('eq_check.dv_id',dvId,'=');
				if(dpId!=""){
					passCountRes.addClause('eq_check.dp_id',dpId,'=');
				}else{
					passCountRes.addClause('eq_check.dp_id','','IS NULL');
				}
				if(controller.roleName == "UNV EQ ADMIN"){
					passCountRes.addClause('eq_check.approved','1');
				}
				if(controller.roleName == "UNV EQ HEAD"){
					passCountRes.addClause('eq_check.approved','3');
				}
				var psssCountRecord=passCountDs.getRecord(passCountRes);
				var passCount=parseInt(psssCountRecord.getValue('eq_check.count'));
				if(isNaN(passCount)){
					passCount=0;
				}
				//审批驳回数
				var rejectCountRes=new Ab.view.Restriction();
				rejectCountRes.addClause('eq_check.check_main_id',checkMainId,'=');
				rejectCountRes.addClause('eq_check.dv_id',dvId,'=');
				if(dpId!=""){
					rejectCountRes.addClause('eq_check.dp_id',dpId,'=');
				}else{
					rejectCountRes.addClause('eq_check.dp_id','','IS NULL');
				}
				rejectCountRes.addClause('eq_check.approved','2');
				var rejectCountRecord=passCountDs.getRecord(rejectCountRes);
				var rejectCount=parseInt(rejectCountRecord.getValue('eq_check.count'));
				if(isNaN(rejectCount)){
					rejectCount=0;
				}
				//审批通过总价格
				var sumPriceDs=View.dataSources.get('ascBjUsmsEqCheckLossSumPriceDs');
				var sumPriceRes=new Ab.view.Restriction();
				sumPriceRes.addClause('eq_check.check_main_id',checkMainId,'=');
				sumPriceRes.addClause('eq_check.dv_id',dvId,'=');
				if(dpId!=""){
					sumPriceRes.addClause('eq_check.dp_id',dpId,'=');
				}else{
					sumPriceRes.addClause('eq_check.dp_id','','IS NULL');
				}
				if(controller.roleName == "UNV EQ ADMIN"){
					sumPriceRes.addClause('eq_check.approved','1');
				}
				if(controller.roleName == "UNV EQ HEAD"){
					sumPriceRes.addClause('eq_check.approved','3');
				}
				var sumPriceRecord=sumPriceDs.getRecord(sumPriceRes);
				var sumPrice=parseInt(sumPriceRecord.getValue('eq_check.sum_price'));
				if(isNaN(sumPrice)){
					sumPrice=0;
				}
				// zhangyan add 设备附件通过总数
				var passAttachCountDs=View.dataSources.get('ascBjUsmsEqAttachCheckLossCountDs');
				var passAttachCountRes=new Ab.view.Restriction();
				passAttachCountRes.addClause('eq_check_attach.check_main_id',checkMainId,'=');
				passAttachCountRes.addClause('eq_check_attach.dv_id',dvId,'=');
				if(dpId!=""){
					passAttachCountRes.addClause('eq_check_attach.dp_id',dpId,'=');
				}else{
					passAttachCountRes.addClause('eq_check_attach.dp_id','','IS NULL');
				}
				
				if(controller.roleName == "UNV EQ ADMIN"){
					passAttachCountRes.addClause('eq_check_attach.approved','1');
				}
				if(controller.roleName == "UNV EQ HEAD"){
					passAttachCountRes.addClause('eq_check_attach.approved','3');
				}
				var passAttachCountRecord=passAttachCountDs.getRecord(passAttachCountRes);
				var passAttachCount=parseInt(passAttachCountRecord.getValue('eq_check_attach.count'));
				if(isNaN(passAttachCount)){
					passAttachCount=0;
				}
				//附件驳回数
				var rejectAttachCountRes=new Ab.view.Restriction();
				rejectAttachCountRes.addClause('eq_check_attach.check_main_id',checkMainId,'=');
				rejectAttachCountRes.addClause('eq_check_attach.dv_id',dvId,'=');
				if(dpId!=""){
					rejectAttachCountRes.addClause('eq_check_attach.dp_id',dpId,'=');
				}else{
					rejectAttachCountRes.addClause('eq_check_attach.dp_id','','IS NULL');
				}
				rejectAttachCountRes.addClause('eq_check_attach.approved','2');
				var rejectAttachCountRecord=passAttachCountDs.getRecord(rejectAttachCountRes);
				var rejectAttachCount=parseInt(rejectAttachCountRecord.getValue('eq_check_attach.count'));
				if(isNaN(rejectAttachCount)){
					rejectAttachCount=0;
				}
				//附件通过总价格
				var sumAttachPriceDs=View.dataSources.get('ascBjUsmsEqAttachCheckLossSumPriceDs');
				var sumAttachPriceRes=new Ab.view.Restriction();
				sumAttachPriceRes.addClause('eq_check_attach.check_main_id',checkMainId,'=');
				sumAttachPriceRes.addClause('eq_check_attach.dv_id',dvId,'=');
				if(dpId!=""){
					sumAttachPriceRes.addClause('eq_check_attach.dp_id',dpId,'=');
				}else{
					sumAttachPriceRes.addClause('eq_check_attach.dp_id','','IS NULL');
				}
				if(controller.roleName == "UNV EQ ADMIN"){
					sumAttachPriceRes.addClause('eq_check_attach.approved','1');
				}
				if(controller.roleName == "UNV EQ HEAD"){
					sumAttachPriceRes.addClause('eq_check_attach.approved','3');
				}
				var sumAttachPriceRecord=sumAttachPriceDs.getRecord(sumAttachPriceRes);
				var sumAttachPrice=parseInt(sumAttachPriceRecord.getValue('eq_check_attach.sum_price'));
				if(isNaN(sumAttachPrice)){
					sumAttachPrice=0;
				}
				if(gridRows.length==0 && gridAttachRows.length==0){
					//更改当前单位的审核状态为“审核通过”
					if(!checkReportRecord.isNew){
						if(controller.roleName == "UNV EQ ADMIN"){
							checkReportRecord.setValue('eq_check_report.audit_status','2');
						}
						if(controller.roleName == "UNV EQ HEAD"){
							checkReportRecord.setValue('eq_check_report.audit_status','4');
						}
					}
				}else{
					var eqCheckDs=View.dataSources.get('ascBjUsmsEqCheckDs');
					var rejectRes=new Ab.view.Restriction();
					rejectRes.addClause('eq_check.check_main_id',checkMainId,'=');
					rejectRes.addClause('eq_check.dv_id',dvId,'=');
					if(dpId!=""){
						rejectRes.addClause('eq_check.dp_id',dpId,'=');
					}else{
						rejectRes.addClause('eq_check.dp_id','','IS NULL');
					}
					
					if(controller.roleName == "UNV EQ ADMIN"){
						rejectRes.addClause('eq_check.approved','0','=');
					}
					if(controller.roleName == "UNV EQ HEAD"){
						rejectRes.addClause('eq_check.approved','1','=');
					}
					var rejectRecord=eqCheckDs.getRecord(rejectRes);
					
					var eqAttachCheckDs=View.dataSources.get('eq_check_attach_ds');
					var rejectAttachRes=new Ab.view.Restriction();
					rejectAttachRes.addClause('eq_check_attach.check_main_id',checkMainId,'=');
					rejectAttachRes.addClause('eq_check_attach.dv_id',dvId,'=');
					if(dpId!=""){
						rejectAttachRes.addClause('eq_check_attach.dp_id',dpId,'=');
					}else{
						rejectAttachRes.addClause('eq_check_attach.dp_id','','IS NULL');
					}
					if(controller.roleName == "UNV EQ ADMIN"){
						rejectAttachRes.addClause('eq_check_attach.approved','0','=');
					}
					if(controller.roleName == "UNV EQ HEAD"){
						rejectAttachRes.addClause('eq_check_attach.approved','1','=');
					}
					var rejectAttachRecord=eqAttachCheckDs.getRecord(rejectAttachRes);
					
					
					if(!rejectRecord.isNew){
						View.alert("此单位设备中存在未审核项,请先审核完毕! ");
						return;
					}else if(!rejectAttachRecord.isNew){
						View.alert("此单位设备附件中存在未审核项,请先审核完毕! ");
						return;
					}else{
						//更改eq_check_report操作设置状态为驳回
						if(!checkReportRecord.isNew){
							checkReportRecord.setValue('eq_check_report.audit_status','3');
						}
					}
				}
				checkReportRecord.setValue('eq_check_report.pass_count',passCount);
				checkReportRecord.setValue('eq_check_report.reject_count',rejectCount);
				checkReportRecord.setValue('eq_check_report.check_sum',sumPrice);
				
				checkReportRecord.setValue('eq_check_report.pass_count_attach',passAttachCount);
				checkReportRecord.setValue('eq_check_report.reject_count_attach',rejectAttachCount);
				checkReportRecord.setValue('eq_check_report.check_sum_attach',sumAttachPrice);
				
				checkReportDs.saveRecord(checkReportRecord);
				View.panels.get('eqCheckReportPanel').refresh();
			}
		});
		
	},
	//通过审批操作
	checkOptionPanel_onBtnApprovePass: function(){
		var controller=this;
		View.confirm('确定要执行此操作吗?',function(button){
			if(button=='yes'){
				var eqCheckPanel=View.panels.get('eqCheckPanel');
				var checkMainId=controller.checkMainIDet;
				var dvId=controller.dvId;
				var dpId=controller.dpId;
				var selectIndex=eqCheckPanel.selectedRowIndex;
				var rowRecord=eqCheckPanel.gridRows.get(selectIndex).getRecord();
				var checkId=rowRecord.getValue('eq_check.check_id');
				var eqId=rowRecord.getValue('eq_check.eq_id');
				
				//将清查表中设备状态更改为：审核通过
				var checkDs=View.dataSources.get('ascBjUsmsEqCheckDs');
				var checkRes=new Ab.view.Restriction();
				checkRes.addClause('eq_check.check_id',checkId,'=');
				var checkRecord=checkDs.getRecord(checkRes);
				
				var checkOptionPanel=View.panels.get('checkOptionPanel');
				checkRecord.setValue('eq_check.option1',checkOptionPanel.getFieldValue("eq_check.option1"));
				checkRecord.setValue('eq_check.option_approve',checkOptionPanel.getFieldValue("eq_check.option_approve"));
				
				//approved 0;未审核;1;初审通过;2;审核未通过;3;已批准
				if(!checkRecord.isNew){
					if(controller.roleName == "UNV EQ ADMIN"){
						checkRecord.setValue('eq_check.approved','1');
					}
					if(controller.roleName == "UNV EQ HEAD"){
						checkRecord.setValue('eq_check.approved','3');
					}
				}
				checkDs.saveRecord(checkRecord);
				View.panels.get('eqCheckPanel').refresh();
				View.panels.get('checkPassListPanel').refresh();
				View.panels.get('checkOptionPanel').closeWindow();
			}
		});
	},
	//设备审批驳回操作
	checkOptionPanel_onBtnApproveReject: function(){
		View.confirm('确定要执行驳回操作吗?',function(button){
			if(button=='yes'){
				View.panels.get('checkOptionPanel').save();
				var eqCheckPanel=View.panels.get('eqCheckPanel');
				var checkMainId=controller.checkMainIDet;
				var dvId=controller.dvId;
				var dpId=controller.dpId;
				var selectIndex=eqCheckPanel.selectedRowIndex;
				var rowRecord=eqCheckPanel.gridRows.get(selectIndex).getRecord();
				var checkId=rowRecord.getValue('eq_check.check_id');
			
				var checkOptionPanel=View.panels.get('checkOptionPanel');
				rowRecord.setValue('eq_check.option1',checkOptionPanel.getFieldValue("eq_check.option1"));
				rowRecord.setValue('eq_check.option_approve',checkOptionPanel.getFieldValue("eq_check.option_approve"));
				
				//更改check表中的设备状态为：3 驳回
				var checkDs=View.dataSources.get('ascBjUsmsEqCheckDs');
				rowRecord.setValue('eq_check.approved','2');//更改状态为：驳回 
				checkDs.saveRecord(rowRecord);
				View.panels.get('eqCheckPanel').refresh();
				
				View.panels.get('checkOptionPanel').closeWindow();
			}
		});
	},
	/**
	 * zhangyan add 设备附件
	 * 通过审批操作
	 */
	checkAttachOptionPanel_onBtnApprovePass: function(){
		var controller=this;
		View.confirm('确定要执行此操作吗?',function(button){
			if(button=='yes'){
				var eqCheckPanel=View.panels.get('eqAttachCheckPanel');
				var checkMainId=controller.checkMainIDet;
				var dvId=controller.dvId;
				var dpId=controller.dpId;
				var selectIndex=eqCheckPanel.selectedRowIndex;
				var rowRecord=eqCheckPanel.gridRows.get(selectIndex).getRecord();
				var checkId=rowRecord.getValue('eq_check_attach.check_id');
				var eqId=rowRecord.getValue('eq_check_attach.eq_id');
				var eqAttachId=rowRecord.getValue('eq_check_attach.eq_attach_id');
				
				//将清查表中设备状态更改为：审核通过
				var checkDs=View.dataSources.get('eq_check_attach_ds');
				var checkRes=new Ab.view.Restriction();
				checkRes.addClause('eq_check_attach.check_id',checkId,'=');
				var checkRecord=checkDs.getRecord(checkRes);
				
				var checkAttachOptionPanel=View.panels.get('checkAttachOptionPanel');
				checkRecord.setValue('eq_check_attach.option1',checkAttachOptionPanel.getFieldValue("eq_check_attach.option1"));
				checkRecord.setValue('eq_check_attach.option_approve',checkAttachOptionPanel.getFieldValue("eq_check_attach.option_approve"));
				
				if(!checkRecord.isNew){
					if(controller.roleName == "UNV EQ ADMIN"){
						checkRecord.setValue('eq_check_attach.approved','1');
					}
					if(controller.roleName == "UNV EQ HEAD"){
						checkRecord.setValue('eq_check_attach.approved','3');
					}
					
				}
				checkDs.saveRecord(checkRecord);
				View.panels.get('eqAttachCheckPanel').refresh();
				View.panels.get('checkAttachPassListPanel').refresh();
				View.panels.get('checkAttachOptionPanel').closeWindow();
			}
		});
	},
	/**
	 * zhangyan add 设备附件
	 * 设备审批驳回操作
	 */
	checkAttachOptionPanel_onBtnApproveReject: function(){
		View.confirm('确定要执行驳回操作吗?',function(button){
			if(button=='yes'){
				View.panels.get('checkAttachOptionPanel').save();
				var eqCheckPanel=View.panels.get('eqAttachCheckPanel');
				var checkMainId=controller.checkMainIDet;
				var dvId=controller.dvId;
				var dpId=controller.dpId;
				var selectIndex=eqCheckPanel.selectedRowIndex;
				var rowRecord=eqCheckPanel.gridRows.get(selectIndex).getRecord();
				var checkId=rowRecord.getValue('eq_check_attach.check_id');
				
				var checkAttachOptionPanel=View.panels.get('checkAttachOptionPanel');
				rowRecord.setValue('eq_check_attach.option1',checkAttachOptionPanel.getFieldValue("eq_check_attach.option1"));
				rowRecord.setValue('eq_check_attach.option_approve',checkAttachOptionPanel.getFieldValue("eq_check_attach.option_approve"));
				
				//更改check表中的设备状态为：3 驳回
				var checkDs=View.dataSources.get('eq_check_attach_ds');
				rowRecord.setValue('eq_check_attach.approved','2');//更改状态为：驳回 
				checkDs.saveRecord(rowRecord);
				View.panels.get('eqAttachCheckPanel').refresh();
				View.panels.get('checkAttachOptionPanel').closeWindow();
			}
		});
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
	},
	eqCheckReportPanel_onBtnClose: function(){
		//关闭此次清查，如果有学院尚未审核，则不能关闭
		
		var gridRows=this.eqCheckReportPanel.gridRows;
		var isDone=true;
		for(var i=0;i<gridRows.length;i++){
			var rowRecord=gridRows.get(i).getRecord();
			var auditStatus=rowRecord.getValue('eq_check_report.audit_status');
			if(auditStatus=='1'){
				isDone=false;
				break;
			}
			if(auditStatus=='0'){
				View.alert('目前存在部门未提交清查报告,暂不可完成清查!');
				return;
			}
			if(this.roleName == "UNV EQ HEAD"){
				if(auditStatus=='2'){
					View.alert('目前存在部门未提交清查报告,暂不可完成清查!');
					return;
				}
			}
		}
		var canClose=false;
		if(isDone==false){
			View.alert("目前存在部门未审核情况,请将各部门提交的设备审核完毕 !");
			return;
		}else{
			var controller=this;
			View.confirm("确定要完成此次清查吗?",function(button){
				if(button=='yes'){
					canClose=true;
					//执行关闭清查操作
					var ascBjUsmsEqCheckMainDs=View.dataSources.get('ascBjUsmsEqCheckMainDs');
					var checkMainDefId=controller.checkMainIDet;
					var checkMainRes=new Ab.view.Restriction();
					checkMainRes.addClause('eq_check_main.check_main_id',checkMainDefId,'=');
					if(controller.roleName == "UNV EQ ADMIN"){
						ascBjUsmsEqCheckMainDs.addParameter('isDone', "5");
					}
					if(controller.roleName == "UNV EQ HEAD"){
						ascBjUsmsEqCheckMainDs.addParameter('isDone', "3");
					}
					checkMainRecord=ascBjUsmsEqCheckMainDs.getRecord(checkMainRes);
					//zhangyan add  需要增加科长审核
					//is_done 0;未发布;1;正在清查中;4;已扫描完成;5;已盘亏;3;初审完成;2;已完成;
					if(controller.roleName == "UNV EQ ADMIN"){
						checkMainRecord.setValue('eq_check_main.is_done','3');
					}
					if(controller.roleName == "UNV EQ HEAD"){
						checkMainRecord.setValue('eq_check_main.is_done','2');
					}
					ascBjUsmsEqCheckMainDs.saveRecord(checkMainRecord);
					View.panels.get('eqCheckMainPanel').refresh();
					View.panels.get('eqCheckReportPanel').show(false);
					View.panels.get('eqCheckPanel').show(false);
					
					View.panels.get('checkPassListPanel').show(false);
					View.panels.get('checkAttachPassListPanel').show(false);
					View.alert('此次清查已成功完成！');
				}
			});
		}		
	},
	showEqCard: function(){
		var selectIndex=this.checkPassListPanel.selectedRowIndex;
		var RowRecord=this.checkPassListPanel.gridRows.get(selectIndex).getRecord();
		var eq_id = RowRecord.getValue("eq_check.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
	},
	alertEqCard: function(){
		var selectIndex=this.eqCheckPanel.selectedRowIndex;
		var RowRecord=this.eqCheckPanel.gridRows.get(selectIndex).getRecord();
		var eq_id = RowRecord.getValue("eq_check.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
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
	var eqCheckReportPanel=View.panels.get('eqCheckReportPanel');
	if(isDone=='2'){
//		eqCheckPanel.actions.get('btnDone').show(false);
		eqCheckReportPanel.actions.get('btnClose').show(false);
		//将
	}else{
//		eqCheckPanel.actions.get('btnDone').show(true);	
		eqCheckReportPanel.actions.get('btnClose').show(true);	
	}
	controller.checkMainIDet=checkMainId;
	var checkMainRes=new Ab.view.Restriction();
	checkMainRes.addClause('eq_check_report.check_main_id',checkMainId,'=');
	//View.panels.get('eqCheckPanel').show(false);
	View.panels.get('eqCheckReportPanel').show(true);
	View.panels.get('eqCheckPanel').show(false);
	View.panels.get('eqAttachCheckPanel').show(false);
	View.panels.get('eqCheckReportPanel').refresh(checkMainRes);
	View.panels.get('checkPassListPanel').show(false);
	View.panels.get('checkAttachPassListPanel').show(false);
}

function eqCheckReportMethod(value){
	
	View.panels.get('needApproveTabs').selectTab('eqTab');
	View.panels.get('approveTabs').selectTab('eqApprove');
	var ReportPanel=View.panels.get('eqCheckReportPanel');
	var selectedIndex=ReportPanel.selectedRowIndex;
	var rowRecord=ReportPanel.gridRows.get(selectedIndex).getRecord();
	var eqCheckPanel=View.panels.get('eqCheckPanel');
	var eqCheckReportPanel=View.panels.get('eqCheckReportPanel');
	var checkPassListPanel=View.panels.get('checkPassListPanel');
	
	var eqAttachCheckPanel=View.panels.get('eqAttachCheckPanel');
	var checkAttachPassListPanel=View.panels.get('checkAttachPassListPanel');
	
	//如果rowRecord中的audit_status为“已审核”则隐藏审批和关闭
	var auditStatus=rowRecord.getValue('eq_check_report.audit_status');
	//当状态为"未提交"时，不显示右边两个panel,并且弹出提示信息
	
	if(auditStatus=='0'){
		eqCheckPanel.show(false);
		checkPassListPanel.show(false);
		
		eqAttachCheckPanel.show(false);
		checkAttachPassListPanel.show(false);
		View.alert('此单位尚未提交报告，无法查看 ! ');
		return;
	}
	var mainId=rowRecord.getValue('eq_check_report.check_main_id');
	var dvId=rowRecord.getValue('eq_check_report.dv_id');
	var dpId=rowRecord.getValue('eq_check_report.dp_id');
	controller.dvId=dvId;
	controller.dpId=dpId;
	
	//只显示各个学院 “未审核”和“审核未通过”的设备
	var checkReportRes=new Ab.view.Restriction();
	checkReportRes.addClause('eq_check.check_main_id',mainId,'=',')AND(');
	checkReportRes.addClause('eq_check.dv_id',dvId,'=',')AND(');
	if(dpId!=""){
		checkReportRes.addClause('eq_check.dp_id',dpId,'=');
	}else{
		checkReportRes.addClause('eq_check.dp_id','','IS NULL');
	}
//	checkReportRes.addClause('eq_check.approved','0','=',')AND(');
//	checkReportRes.addClause('eq_check.approved','2','=','OR');
	
	//只显示各个学院 “审核通过”的设备
	var passRes=new Ab.view.Restriction();
	passRes.addClause('eq_check.check_main_id',mainId,'=');
	passRes.addClause('eq_check.dv_id',dvId,'=');
	if(dpId!=""){
		passRes.addClause('eq_check.dp_id',dpId,'=');
	}else{
		passRes.addClause('eq_check.dp_id','','IS NULL');
	}
//	passRes.addClause('eq_check.approved','1','=');
	
	//zhangyan add 显示设备附件信息
	var checkAttachReportRes=new Ab.view.Restriction();
	checkAttachReportRes.addClause('eq_check_attach.check_main_id',mainId,'=',')AND(');
	checkAttachReportRes.addClause('eq_check_attach.dv_id',dvId,'=',')AND(');
	if(dpId!=""){
		checkAttachReportRes.addClause('eq_check_attach.dp_id',dpId,'=');
	}else{
		checkAttachReportRes.addClause('eq_check_attach.dp_id','','IS NULL');
	}
//	checkAttachReportRes.addClause('eq_check_attach.approved','0','=',')AND(');
//	checkAttachReportRes.addClause('eq_check_attach.approved','2','=','OR');
	
	//只显示各个学院 “审核通过”的设备
	var passAttachRes=new Ab.view.Restriction();
	passAttachRes.addClause('eq_check_attach.check_main_id',mainId,'=');
	passAttachRes.addClause('eq_check_attach.dv_id',dvId,'=');
	if(dpId!=""){
		passAttachRes.addClause('eq_check_attach.dp_id',dpId,'=');
	}else{
		passAttachRes.addClause('eq_check_attach.dp_id','','IS NULL');
	}
//	passAttachRes.addClause('eq_check_attach.approved','1','=');
	
	if(controller.roleName == "UNV EQ ADMIN"){
		checkReportRes.addClause('eq_check.approved','0','=',')AND(');
		checkReportRes.addClause('eq_check.approved','2','=','OR');
		
		passRes.addClause('eq_check.approved','1','=');
		
		checkAttachReportRes.addClause('eq_check_attach.approved','0','=',')AND(');
		checkAttachReportRes.addClause('eq_check_attach.approved','2','=','OR');
		
		passAttachRes.addClause('eq_check_attach.approved','1','=');
	}
	if(controller.roleName == "UNV EQ HEAD"){
		checkReportRes.addClause('eq_check.approved','1','=',')AND(');
		checkReportRes.addClause('eq_check.approved','2','=','OR');
		
		passRes.addClause('eq_check.approved','3','=');
		
		checkAttachReportRes.addClause('eq_check_attach.approved','1','=',')AND(');
		checkAttachReportRes.addClause('eq_check_attach.approved','2','=','OR');
		
		passAttachRes.addClause('eq_check_attach.approved','3','=');
	}
	eqCheckPanel.refresh(checkReportRes);
	checkPassListPanel.refresh(passRes);
	eqAttachCheckPanel.refresh(checkAttachReportRes);
	checkAttachPassListPanel.refresh(passAttachRes);
}

function viewDocuments(value){
	var eqCheckPanel=View.panels.get('eqCheckPanel');
	var selectIndex=eqCheckPanel.selectedRowIndex;
	var rowsRecord=eqCheckPanel.gridRows.get(selectIndex).getRecord();
	var checkId=rowsRecord.getValue('eq_check.check_id');
	
	var checkOptionPanel=View.panels.get('checkOptionPanel');
	
	var approvedOption=rowsRecord.getValue('eq_check.approved');
	checkOptionPanel.show(true);
    checkOptionPanel.showInWindow({
    	x:250,
    	y:300,
        width: 650,
        height: 350
    });
	
    var checkRes=new Ab.view.Restriction();
    checkRes.addClause('eq_check.check_id',checkId,'=');
    checkOptionPanel.refresh(checkRes);
    //eq_check.approved 0;未审核;1;初审通过;2;审核未通过;3;已批准
    if(approvedOption=='0'){
		checkOptionPanel.actions.get('btnApprovePass').enable(true);
		checkOptionPanel.actions.get('btnApproveReject').enable(true);
	}
	if(approvedOption=='2'){
		checkOptionPanel.actions.get('btnApprovePass').enable(true);
		checkOptionPanel.actions.get('btnApproveReject').enable(false);
	}   
	if(controller.roleName == "UNV EQ ADMIN"){
		if(approvedOption=='1'){
			checkOptionPanel.actions.get('btnApprovePass').enable(false);
			checkOptionPanel.actions.get('btnApproveReject').enable(false);
		}
		checkOptionPanel.showField('eq_check.option_approve', false);
	}
	if(controller.roleName == "UNV EQ HEAD"){
		if(approvedOption=='1'){
			checkOptionPanel.actions.get('btnApprovePass').enable(true);
			checkOptionPanel.actions.get('btnApproveReject').enable(true);
		}
		checkOptionPanel.enableField('eq_check.option1', false);
		checkOptionPanel.showField('eq_check.option_approve', true);
	}
}
/**
 * zhangyan add 设备附件
 * @param value
 */
function viewAttachDocuments(value){
	var eqCheckPanel=View.panels.get('eqAttachCheckPanel');
	var selectIndex=eqCheckPanel.selectedRowIndex;
	var rowsRecord=eqCheckPanel.gridRows.get(selectIndex).getRecord();
	var checkId=rowsRecord.getValue('eq_check_attach.check_id');
	
	var checkOptionPanel=View.panels.get('checkAttachOptionPanel');
	
	var approvedOption=rowsRecord.getValue('eq_check_attach.approved');
	checkOptionPanel.show(true);
	checkOptionPanel.showInWindow({
		x:250,
		y:300,
		width: 700,
		height: 400
	});
	
	var checkRes=new Ab.view.Restriction();
	checkRes.addClause('eq_check_attach.check_id',checkId,'=');
	checkOptionPanel.refresh(checkRes);
	if(approvedOption=='0'){
		checkOptionPanel.actions.get('btnApprovePass').enable(true);
		checkOptionPanel.actions.get('btnApproveReject').enable(true);
	}
	if(approvedOption=='2'){
		checkOptionPanel.actions.get('btnApprovePass').enable(true);
		checkOptionPanel.actions.get('btnApproveReject').enable(false);
	}   
	if(controller.roleName == "UNV EQ ADMIN"){
		if(approvedOption=='1'){
			checkOptionPanel.actions.get('btnApprovePass').enable(false);
			checkOptionPanel.actions.get('btnApproveReject').enable(false);
		}
		checkOptionPanel.showField('eq_check_attach.option_approve', false);
	}
	if(controller.roleName == "UNV EQ HEAD"){
		if(approvedOption=='1'){
			checkOptionPanel.actions.get('btnApprovePass').enable(true);
			checkOptionPanel.actions.get('btnApproveReject').enable(true);
		}
		checkOptionPanel.enableField('eq_check_attach.option1', false);
		checkOptionPanel.showField('eq_check_attach.option_approve', true);
	}
}
function viewDocumentsAlready(){
	var checkPassListPanel=View.panels.get('checkPassListPanel');
	var selectIndex=checkPassListPanel.selectedRowIndex;
	var rowRecord=checkPassListPanel.gridRows.get(selectIndex).getRecord();
	var checkId=rowRecord.getValue('eq_check.check_id');
	
	var checkOptionPanel=View.panels.get('checkOptionPanel');
	checkOptionPanel.show(true);
    checkOptionPanel.showInWindow({
    	x:250,
    	y:300,
        width: 650,
        height: 350
    });
    
    var checkRes=new Ab.view.Restriction();
    checkRes.addClause('eq_check.check_id',checkId,'=');
    checkOptionPanel.refresh(checkRes);
	checkOptionPanel.actions.get('btnApprovePass').show(false);
	checkOptionPanel.actions.get('btnApproveReject').show(false);
//	checkOptionPanel.actions.get('btnApprovePass').enable(false);
//	checkOptionPanel.actions.get('btnApproveReject').enable(false);
}
/**
 * zhangyan add 设备附件
 */
function viewAttachDocumentsAlready(){
	var checkPassListPanel=View.panels.get('checkAttachPassListPanel');
	var selectIndex=checkPassListPanel.selectedRowIndex;
	var rowRecord=checkPassListPanel.gridRows.get(selectIndex).getRecord();
	var checkId=rowRecord.getValue('eq_check_attach.check_id');
	
	var checkOptionPanel=View.panels.get('checkAttachOptionPanel');
	checkOptionPanel.show(true);
	checkOptionPanel.showInWindow({
		x:250,
		y:300,
		width: 700,
		height: 400
	});
	
	var checkRes=new Ab.view.Restriction();
	checkRes.addClause('eq_check_attach.check_id',checkId,'=');
	checkOptionPanel.refresh(checkRes);
	checkOptionPanel.actions.get('btnApprovePass').show(false);
//	checkOptionPanel.actions.get('btnApprovePass').enable(false);
	checkOptionPanel.actions.get('btnApproveReject').enable(false);
}

function getActivityLogRecord(check_id){

	var ReportPanel=View.panels.get('eqCheckReportPanel');
	var selectedIndex=ReportPanel.selectedRowIndex;
	var row=ReportPanel.gridRows.get(selectedIndex);
	
	var requestor = row.getFieldValue("eq_check_report.check_person");
	var dv_id = row.getFieldValue("eq_check_report.dv_id");
	var check_date = row.getFieldValue("eq_check_report.check_date");
	
	
	var temp_month = check_date.getMonth()+ 1;
	var month = temp_month<10?"0"+temp_month:temp_month;
	var temp_day = ""+check_date.getDate();
	var day	= temp_day<10?"0"+temp_day:temp_day;
	var year  = ""+check_date.getFullYear();
	check_date = year + "-" + month + "-" + day;
	
	var record = {};
		
	record['activity_log.activity_log_id'] = '0';
	record['activity_log.activity_type'] = 'SD -设备清查';
	record['activity_log.prob_type'] = '设备管理';
	record['activity_log.requestor'] = requestor;
	record['activity_log.date_required'] = check_date;
	record['activity_log.dv_id'] = dv_id;
	record['activity_log.check_id'] = check_id;
	return record;
}

function submitRequest(record){
	try {
		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
			return true;
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
}
