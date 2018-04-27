var controller=View.createController('addRequestForm',{	
	budgetId: "",
	budgetItemId: "",//budgetItemId
	perPrice: 0,//预算单价
	totalCount: 0,//预算总数量
	totalCost: 0,//预算总额
	totalPrice: 0,//目前报增总额
	budgetType:'',//预算类型
	afterInitialDataFetch: function(){
		var myDate = new Date();
		var year=myDate.getFullYear();
		this.budgetPanel.addParameter('para_year', year);
		this.budgetPanel.refresh();
		
	},
	saveBudgetType: function(value){
		var selectRowIndex=this.budgetPanel.selectedRowIndex;
		var budgetRowRecord=this.budgetPanel.gridRows.get(selectRowIndex).getRecord();
		var bugetType=budgetRowRecord.getValue('eq_budget.type');
		this.budgetType=bugetType;
		this.budgetItemPanel.refresh();
	},
	budgetItemPanel_afterRefresh: function(){
		var rows=this.budgetItemPanel.gridRows;
		var length=rows.length;
		for(var i=0;i<length;i++){
			var row=rows.items[i];
			var record=row.getRecord();
			var budgetItemId=record.getValue("eq_budget_item.budget_item_id");
			//根据budgetItemId找到add_eq中的相关项的总价，当数目大于等于eq_budget_item中的总值时，“报增”按钮置灰
			var Fcount=parseFloat(record.getValue("eq_budget_item.total_cost"));//eq_budget_item中的count数值
			Zcount=Fcount*parseFloat(1.2);
			var addEqCountByBudgetItemDs=View.dataSources.get("caculaItemCountDs");
			var res=new Ab.view.Restriction();
			res.addClause("add_eq.budget_item_id",budgetItemId,'=');
			var addEqRecord=addEqCountByBudgetItemDs.getRecord(res);
			var addEqCount=0;
			if(!addEqRecord.isNew){
				addEqCount+=parseFloat(addEqRecord.getValue("add_eq.addEqcount"));
			}

			if(addEqCount>=Zcount){
				row.actions.get("btnAddEq").forceDisable(true);
			}else{
				row.actions.get("btnAddEq").forceDisable(false);
			}
		}
	},
	BaoZengDetialformPanel_afterRefresh: function(){
		//当初次加载时，将经手人姓名和名称填上
		var emDs=View.dataSources.get('ascBjUsmsEmDs');
		var emId=View.user.employee.id;
		var emRes=new Ab.view.Restriction();
		emRes.addClause('em.em_id',emId,'=');
		var emName=emDs.getRecord(emRes).getValue('em.name');
		this.BaoZengDetialformPanel.setFieldValue('add_eq.handing_em',emId);
		this.BaoZengDetialformPanel.setFieldValue('add_eq.handing_em_name',emName);
		var isBudget=this.budgetType;
		this.BaoZengDetialformPanel.setFieldValue('add_eq.is_budget',isBudget);
		
		var user = this.view.user;
		if(user.role == "UNV DV EQ MOWN ADMIN" || user.role == "UNV DV EQ OWN ADMIN"){
			//this.BaoZengDetialformPanel.getFieldElement('dp.dp_name').disabled = false;
			this.BaoZengDetialformPanel.showField('dp.dp_name', true);
		}else{
			//this.BaoZengDetialformPanel.getFieldElement('dp.dp_name').disabled = true;
			this.BaoZengDetialformPanel.showField('dp.dp_name', false);
		}	
//		if(!this.BaoZengDetialformPanel.newRecord){
//			var countOfAddEqList=0;
//			this.BaoZengDetialformPanel.enableField('add_eq.csi_id');
//			this.BaoZengDetialformPanel.enableField('add_eq.eq_name');
//			//当报增详细项初始加载后，如果add_eq_list的总数量>=add_eq中的报增数量，则不能添加报增设备项
//			var addEqGoupDs=View.dataSources.get("ascBjUsmsEqSnGroupDs");
//			var addEqId=this.BaoZengDetialformPanel.getFieldValue("add_eq.add_eq_id");
//			var res=new Ab.view.Restriction();
//			res.addClause('add_eq_list.add_eq_id',addEqId,'=');
//			var record=addEqGoupDs.getRecord(res);
//			//当record中无数值时
//			if(record.isNew){
//				countOfAddEqList=0;
//			}else{
//				
//				countOfAddEqList=parseInt(record.getValue("add_eq_list.countNum"));
//			}
//			var countOfAddEq=0;//Add_eq表中的报增项数量值
//			var addEqCount=this.BaoZengDetialformPanel.getFieldValue("add_eq.total_cost");
//			if(addEqCount==""||addEqCount==null){
//				countOfAddEq=0;
//			}else{
//				countOfAddEq=parseInt(addEqCount);
//			}
//			if(countOfAddEqList>=countOfAddEq){
//				//this.BaoZengDetialformPanel.actions.get('btnAddSN').forceDisable(true);
//				//btnAddSN.enable(false);
//			}else{
//				//this.BaoZengDetialformPanel.actions.get('btnAddSN').forceDisable(false);
//			}
//		}
	},
	BaoZengDetialformPanel_beforeSave: function(){
		var canSave=true;
		var message="";
		getCount();
		var baozengDetailPanel=this.BaoZengDetialformPanel;
		var budgetDs=View.dataSources.get("caculaCountDs");
		
		var budgetItemId=this.BaoZengDetialformPanel.getFieldValue("add_eq.budget_item_id");
		var res=new Ab.view.Restriction();
		var eqName=baozengDetailPanel.getFieldValue("add_eq.eq_name");
		var eqStd=baozengDetailPanel.getFieldValue("add_eq.eq_std");
		var eqType=baozengDetailPanel.getFieldValue("add_eq.eq_type");
		if(eqName.indexOf("'")>=0||eqStd.indexOf("'")>=0||eqType.indexOf("'")>=0){
			canSave=false;
			View.alert("表单字段中不能包含单引号!");
		}
		if (this.BaoZengDetialformPanel.newRecord) {
			try {
				var primaryKey= createPrimaryKey("add_eq", "add_eq_id","");
				this.BaoZengDetialformPanel.setFieldValue("add_eq.add_eq_id", primaryKey);	
			}catch (e) {
				canSave=false;
				View.alert("主键生成失败，请重新操作");
			}
			
			res.addClause("add_eq.budget_item_id",budgetItemId,'=');
			//检查目前单价、数量、总金额等是否超出范围，否则不予保存	
		}else{
			var addEqId=View.panels.get('BaoZengDetialformPanel').getFieldValue("add_eq.add_eq_id");
			res.addClause("add_eq.budget_item_id",budgetItemId,'=');
			res.addClause("add_eq.add_eq_id",addEqId,'!=');
		}
		
		var record=budgetDs.getRecord(res);
		var alreadyCost=parseFloat(record.getValue("add_eq.tot_cost"));
		if(isNaN(alreadyCost)){
			alreadyCost=0;
		}
		var maxCount=controller.totalCount;//最大数量
		var maxCost=controller.totalCost;//最大总额
		maxCost=maxCost*1.8;
		var maxPrice=controller.perPrice;//最大单价
		var requestCount=parseInt(this.BaoZengDetialformPanel.getFieldValue("add_eq.count"));
		var requestCost=parseFloat(this.BaoZengDetialformPanel.getFieldValue("add_eq.total_price"));
		var requestPrice=parseFloat(this.BaoZengDetialformPanel.getFieldValue("add_eq.price"))
		
	   if((alreadyCost+requestCost)>maxCost){
			canSave=false;
			var shengCost=parseFloat(maxCost-alreadyCost);
			message="报增超出预算额度,保存失败";
			View.alert(message);
		}
		return canSave;
	},
//	/**
//	 * 点击"显示"按钮时的操作
//	 */
//	consolePanel_onBtnShow: function(){
//		this.budgetItemPanel.show(false);
//		this.EqBaoZengPanel.show(false);
//		this.BaoZengDetialformPanel.show(false);
//		var BudgetRes=new Ab.view.Restriction();
//		
//		var name=this.consolePanel.getFieldValue('eq_budget.name');//预算项ID
//		var id=this.consolePanel.getFieldValue('eq_budget.budget_id');//预算编码
//		var fisiaYear=this.consolePanel.getFieldValue('eq_budget.fiscal_year');//财政年
//		
//		if(valueExistsNotEmpty(id)){
//			BudgetRes.addClause('eq_budget.budget_id',id,'=');
//		}
//		if(valueExistsNotEmpty(name)){
//			BudgetRes.addClause('eq_budget.name','%'+name+'%','LIKE');
//		}
//		
//		BudgetRes.addClause('eq_budget.fiscal_year','2013','=');
//
//
//		this.budgetPanel.refresh(BudgetRes);
//		
//		this.budgetItemPanel.show(false);
//		this.EqBaoZengPanel.show(false);
//		this.BaoZengDetialformPanel.show(false);
//	},
//	consolePanel_onBtnShow: function(){
//		this.consolePanel.clear();
//		this.budgetPanel.restriction=null;
//		this.budgetPanel.refresh();
//	},
	/**
	 * 点击BaoZengDetialformPanel上的"Delete"时进行的删除操作
	 */
	BaoZengDetialformPanel_onFormPanelDelete: function(){
		var isDelete=this.BaoZengDetialformPanel.deleteRecord();
		if(isDelete=true){
			this.EqBaoZengPanel.refresh();
		}
		this.budgetItemPanel.refresh();
		this.BaoZengDetialformPanel.show(false);
	},
	//提交报增请求
	
	submitAddRequest: function(){
		//获取报增单号，如果没有报增单，则不能提交
		var addEqId=this.BaoZengDetialformPanel.getFieldValue('add_eq.add_eq_id');
		if(!valueExistsNotEmpty(addEqId)){
			View.alert('此报增单没有保存,请保存后操作 !');
			return;
		}
		//先判断此报增单是否已申请，如果已申请，则不能执行提交操作
		var addEqDs=View.dataSources.get('ascBjUsmsEqAddDefDs');
		var addEqRes=new Ab.view.Restriction();
		addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
		var addEqRecord=addEqDs.getRecord(addEqRes);
		var addEqStatus=addEqRecord.getValue('add_eq.status');
		if(addEqStatus!='0'){
			View.alert('此报增单已提交,不可重复提交 !');
			return;
		}
		View.confirm('是否确定提交此报增单?',function(button){
			if(button=='yes'){
				var record=getActivityLogRecord(addEqId);
				var isDone=submitRequest(record);
				if(isDone==false){
					View.alert('报增单提交程序出错,提交失败,请尝试重新提交 !');
					return;
				}else{
					//将报增单的状态改为“已申请”
					addEqRecord.setValue('add_eq.status','1');
					addEqDs.saveRecord(addEqRecord);
					View.panels.get('BaoZengDetialformPanel').refresh();
					View.panels.get('EqBaoZengPanel').refresh();
					//置灰按钮
					disablePanel()
					View.alert('报增单提交成功,请等待审核结果 !');
				}
			}
		});
	}
});

/**
 * 当点击“报增”按钮的时候，将数据传送到报增单详细中去
 * @param row
 * @param action
 * @returns
 */

function transRecordValue(value){
	var eqBZPanel=View.panels.get("BaoZengDetialformPanel");
	var eqBaoZengPanel=View.panels.get('EqBaoZengPanel');
	eqBaoZengPanel.show(true);
	eqBaoZengPanel.refresh(value.restriction);
	var budgetItemId=value.restriction['eq_budget_item.budget_item_id'];
	var budgetItemDs=View.dataSources.get('ascBjUsmsEqBudgetItemDs');
	var rowRecord=budgetItemDs.getRecord(value.restriction);
	
	eqBZPanel.setFieldValue("add_eq.budget_id",rowRecord.getValue("eq_budget_item.budget_id"));
	controller.budgetId=rowRecord.getValue("eq_budget_item.budget_id");
	eqBZPanel.setFieldValue("add_eq.budget_item_id",rowRecord.getValue("eq_budget_item.budget_item_id"));
	controller.budgetItemId=rowRecord.getValue("eq_budget_item.budget_item_id");
	var csiId=rowRecord.getValue("eq_budget_item.csi_id");
	var eqName=rowRecord.getValue("eq_budget_item.eq_name");
	if(valueExistsNotEmpty(csiId)){
		eqBZPanel.setFieldValue("add_eq.csi_id",csiId);
	}else{
		//根据设备名称检索设备
		var csiDs=View.dataSources.get('ascBjUsmsCsiDs');
		var csiRes=new Ab.view.Restriction();
		csiRes.addClause('csi.description',eqName,'=');
		var csiRecord=csiDs.getRecord(csiRes);
		if(csiRecord.isNew){
			eqBZPanel.setFieldValue("add_eq.csi_id",'');
		}else{
			eqBZPanel.setFieldValue("add_eq.csi_id",csiRecord.getValue('csi.csi_id'));
		}
	}
	eqBZPanel.setFieldValue("add_eq.eq_name",eqName);
	eqBZPanel.setFieldValue("add_eq.brand",rowRecord.getValue("eq_budget_item.brand"));
	eqBZPanel.setFieldValue("add_eq.eq_std",rowRecord.getValue("eq_budget_item.eq_std"));
	eqBZPanel.setFieldValue("add_eq.use",rowRecord.getValue("eq_budget_item.use"));
	eqBZPanel.setFieldValue("add_eq.ctry_id",'');
	eqBZPanel.setFieldValue("add_eq.ctry_name",'');
	var totCost=parseFloat(rowRecord.getValue("eq_budget_item.total_cost"));
	eqBZPanel.setFieldValue("add_eq.total_price",totCost);
	controller.totalCost=totCost;
	eqBZPanel.setFieldValue("add_eq.units",rowRecord.getValue("eq_budget_item.units"));
	eqBZPanel.setFieldValue("add_eq.count",rowRecord.getValue("eq_budget_item.count"));
	controller.totalCount=parseInt(rowRecord.getValue("eq_budget_item.count"));
	
	eqBZPanel.setFieldValue("add_eq.price",rowRecord.getValue("eq_budget_item.price"));
	
	var price=rowRecord.getValue("eq_budget_item.price.raw");
	controller.perPrice=parseFloat(rowRecord.getValue("eq_budget_item.price"));
	
//	var requestEm=View.user.employee.id;
//	var requestDv=ASEQ_getUserDvId(requestEm);
//	eqBZPanel.setFieldValue('add_eq.dv_id',requestDv);
	var requestDv=rowRecord.getValue("eq_budget_item.dv_id");
	var dvName = ASEQ_getDvName(requestDv);
	eqBZPanel.setFieldValue('dv.dv_name',dvName);
	eqBZPanel.setFieldValue("add_eq.dv_id",requestDv);
	
	var requestDp=rowRecord.getValue("eq_budget_item.dp_id");
	if(requestDp!=""){
		var dpName = ASEQ_getDpName(requestDp);
		eqBZPanel.setFieldValue('dp.dp_name',dpName);
		eqBZPanel.setFieldValue("add_eq.dp_id",requestDp);
	}
}

function addControllNum(){
	var budgetItemPanel=View.panels.get('budgetItemPanel');
	var selectRowIndex=budgetItemPanel.selectedRowIndex;
	var selectRowRecord=budgetItemPanel.gridRows.get(selectRowIndex).getRecord();
	var budgetItemId=selectRowRecord.getValue('eq_budget_item.budget_item_id');
	var totCost=selectRowRecord.getValue('eq_budget_item.total_cost');
	var totalCount=selectRowRecord.getValue('eq_budget_item.count');
	var price=selectRowRecord.getValue('eq_budget_item.price');
	controller.budgetItemId=budgetItemId;
	controller.totalCost=parseFloat(totCost);
	controller.totalCount=parseInt(totalCount);
	controller.perPrice=parseFloat(price);
}
/**
 * 当挑选事项编码后，从而从budget_item中挑选出已经存在的值并添加到相应的控件中
 */
function afterSelectItemId(fieldName, selectedValue,priviewValue){
	//因为前面的selectValue中传来的field为两个，所以此方法就会执行两次，所以需要进行条件判断
	if(fieldName=='add_eq.budget_item_id'){
		var res=new Ab.view.Restriction();
		res.addClause('eq_budget_item.budget_item_id',selectedValue,'=');
		var dataSource=View.dataSources.get('ascBjUsmsEqBudgetItemDs');
		var record=dataSource.getRecord(res);
		//获取record中的值
		var csiId=record.getValue('eq_budget_item.csi_id');
		var eqName=record.getValue('eq_budget_item.eq_name');
		var brand=record.getValue('eq_budget_item.brand');
		var std=record.getValue('eq_budget_item.eq_std');
		var use=record.getValue('eq_budget_item.use');
		//将取出的值给form中相应的元素赋值
		var form=View.panels.get('BaoZengDetialformPanel');
		form.setFieldValue('add_eq.csi_id',csiId);
		form.setFieldValue('add_eq.eq_name',eqName);
		form.setFieldValue('add_eq.brand',brand);
		form.setFieldValue('add_eq.eq_std',std);
		form.setFieldValue('add_eq.use',use);
	}
}

/**
 * 根据count 和 price自动计算总价
 */
function getCount(){
	var form=View.panels.get('BaoZengDetialformPanel');
	var count=form.getFieldValue('add_eq.count');
	var price=form.getFieldValue('add_eq.price');
	if(!valueExistsNotEmpty(count)){
		count=0;
	}
	if(!valueExistsNotEmpty(price)){
		price=0;
	}
	var countP=parseInt(count);
	var priceP=parseFloat(price);
	var sum=parseFloat(countP*priceP).toFixed(2);
	form.setFieldValue('add_eq.total_price',sum);
}


function showPanelMethod(value){
	View.panels.get('BaoZengDetialformPanel').newRecord=false;
	View.panels.get('BaoZengDetialformPanel').show(true);
	View.panels.get('BaoZengDetialformPanel').refresh(value.restriction);
	
	//如果此报增单已申请或是审核通过，则不能编辑相应信息
	var addEqRecord=View.dataSources.get('ascBjUsmsEqAddDefDs').getRecord(value.restriction);
	var status=addEqRecord.getValue('add_eq.status');
	
	var addEqDetailPanel=View.panels.get('BaoZengDetialformPanel');
	if(status=='0'){
		//保存按钮隐藏，添加新暴增项按钮隐藏
		addEqDetailPanel.actions.get('btnRequest').forceDisable(false);
		addEqDetailPanel.actions.get('formPanelSave').forceDisable(false);
		addEqDetailPanel.actions.get('formPanelSave').forceDisable(false);
		addEqDetailPanel.actions.get('formPanelDelete').forceDisable(false);
		addEqDetailPanel.actions.get('formPanelDelete').enable(true);
		addEqDetailPanel.actions.get('formPanelClear').forceDisable(false);
		
	}else{
		addEqDetailPanel.actions.get('btnRequest').forceDisable(true);
		addEqDetailPanel.actions.get('formPanelSave').forceDisable(true);
		addEqDetailPanel.actions.get('formPanelSave').forceDisable(true);
		addEqDetailPanel.actions.get('formPanelDelete').forceDisable(true);
		addEqDetailPanel.actions.get('formPanelClear').forceDisable(true);
	}
}

function afterSaveReocrd(){
	var budgetItemId=controller.budgetItemId;
	var budgetRes=new Ab.view.Restriction();
	budgetRes.addClause('add_eq.budget_item_id',budgetItemId,'=');
	View.panels.get('EqBaoZengPanel').refresh(budgetRes);
	var budgetId=controller.budgetId;
	var budgetItemRes=new Ab.view.Restriction();
	budgetItemRes.addClause('eq_budget_item.budget_id',budgetId,'=');
	View.panels.get('budgetItemPanel').refresh();
}

function getActivityLogRecord(addEqId){

	var BaoZengDetialformPanel=View.panels.get('BaoZengDetialformPanel');
	var requestor=View.user.employee.id;
	var dv_id=BaoZengDetialformPanel.getFieldValue("add_eq.dv_id");
	var dp_id=BaoZengDetialformPanel.getFieldValue("add_eq.dp_id");
	
	var record = {};
		
	record['activity_log.activity_log_id'] = '0';
	record['activity_log.activity_type'] = ascBjUsmsConstantControl.TYPE_EQ_ADD;
	record['activity_log.prob_type'] = ascBjUsmsConstantControl.PB_EQ_REQUEST;
	record['activity_log.requestor'] = requestor;
	//record['activity_log.date_required'] = check_date;
	record['activity_log.dv_id'] = dv_id;
	record['activity_log.dp_id'] = dp_id;
	record['activity_log.add_eq_id'] = addEqId;
	return record;
}

function submitRequest(record){
	try {
		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
		return true;
	}catch (e) {
        Workflow.handleError(e);
        return false;
    }
}
//选择商家界面
function showSelectVnPanel(){
	var vnSelectPanel=View.panels.get('vnselectPanel');
	vnSelectPanel.showInWindow({
        width: 800,
        height: 600,
        closeButton: false
    });
	vnSelectPanel.refresh();
}

//新增商家界面
function afterSaveVn(){
	View.panels.get('vnselectPanel').refresh();
	View.panels.get('detailsPanel').closeWindow();
}

//选择商家后填入相应的字段
function selectVnAsValue(value){
	var vnId=value.restriction['vn.vn_id'];
	View.panels.get('BaoZengDetialformPanel').setFieldValue('add_eq.vn_id',vnId);
	View.panels.get('vnselectPanel').closeWindow();
}

function disablePanel(){
	var addEqDetailPanel=View.panels.get('BaoZengDetialformPanel');
	addEqDetailPanel.actions.get('btnRequest').forceDisable(true);
	addEqDetailPanel.actions.get('formPanelSave').forceDisable(true);
	addEqDetailPanel.actions.get('formPanelSave').forceDisable(true);
	addEqDetailPanel.actions.get('formPanelDelete').forceDisable(true);
	addEqDetailPanel.actions.get('formPanelClear').forceDisable(true);
}