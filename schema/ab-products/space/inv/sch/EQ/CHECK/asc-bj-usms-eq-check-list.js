var controller=View.createController('checkListForm',{
	mainId: "",
	eqsDone: "",
	chooseType: "",
	afterInitialDataFetch: function(){
		//判断eq_check_main取出”未完成“项 的Id
		var eqCheckMainDs=View.dataSources.get('ascBjUsmsEqCheckMainDs');
		var eqCheckMainRes=new Ab.view.Restriction();
		eqCheckMainRes.addClause('eq_check_main.is_done','0','=');
		var eqCheckMainRecord=eqCheckMainDs.getRecord(eqCheckMainRes);
		if(eqCheckMainRecord.isNew){
			View.panels.get('formPanel').show(false);
			View.panels.get('eqListPanel').show(false);
			View.panels.get('lossEqList').show(false);
			View.panels.get('dvAuditOption').show(false);
			View.panels.get('AddReasonPanel').show(false);
			View.alert('清查已结束或还未开始,不能执行盘亏申请操作');
		}else{
			
			//将目前正在执行的eq_check_main中的ID取出，并根据此ID取出eq_check_res中的记录，组成筛选条件
			var checkMainId=eqCheckMainRecord.getValue('eq_check_main.check_main_id');
			this.mainId=checkMainId;
			//如果本单位已经提交清查申请完毕，则此页面不能打开
			var checkReportDs=View.dataSources.get('ascBjUsmsEqCheckReportDs');
			var checkReportViewRes=new Ab.view.Restriction();
			checkReportViewRes.addClause('eq_check_report.check_main_id',this.mainId,'=');
			var  dvId=View.user.employee.organization.divisionId;
			checkReportViewRes.addClause('eq_check_report.dv_id',dvId,'=');
			var checkReportRecord=checkReportDs.getRecord(checkReportViewRes);
			if(!checkReportRecord.isNew){
				View.panels.get('formPanel').show(false);
				View.panels.get('eqListPanel').show(false);
				View.panels.get('lossEqList').show(false);
				View.panels.get('dvAuditOption').show(false);
				View.panels.get('AddReasonPanel').show(false);
				View.alert('本单位已经提交了盘亏申请，不可重复添加');
				return;
			}
			
			var eqCheckResDs=View.dataSources.get('ascBjUsmsEqCheckResDs');
			
			var sRes=new Ab.view.Restriction();
			sRes.addClause('eq_check_res.flds_name','price_from','=');
			sRes.addClause('eq_check_res.check_main_id',checkMainId,'=');
			var priceFrom=eqCheckResDs.getRecord(sRes).getValue('eq_check_res.flds_res');
			
			var sRes2=new Ab.view.Restriction();
			sRes2.addClause('eq_check_res.flds_name','price_to','=');
			sRes2.addClause('eq_check_res.check_main_id',checkMainId,'=');
			var priceTo=eqCheckResDs.getRecord(sRes2).getValue('eq_check_res.flds_res');
			
			var sRes3=new Ab.view.Restriction();
			sRes3.addClause('eq_check_res.flds_name','date_from','=');
			sRes3.addClause('eq_check_res.check_main_id',checkMainId,'=');
			var dateFrom=eqCheckResDs.getRecord(sRes3).getValue('eq_check_res.flds_res');
			
			var sRes4=new Ab.view.Restriction();
			sRes4.addClause('eq_check_res.flds_name','date_to','=');
			sRes4.addClause('eq_check_res.check_main_id',checkMainId,'=');
			var dateTo=eqCheckResDs.getRecord(sRes4).getValue('eq_check_res.flds_res');
			
			var sRes5=new Ab.view.Restriction();
			sRes5.addClause('eq_check_res.flds_name','csi_id','=');
			sRes5.addClause('eq_check_res.check_main_id',checkMainId,'=');
			var CsiList=eqCheckResDs.getRecord(sRes5).getValue('eq_check_res.flds_res');
			
			//根据以上数据组成筛选条件筛选eq表
			var eqRes=new Ab.view.Restriction();
			if(valueExistsNotEmpty(dateFrom)){
				eqRes.addClause('eq.date_purchased',dateFrom, "&gt;=",")AND(");
			}
			
			if(valueExistsNotEmpty(dateTo)){
				eqRes.addClause('eq.date_purchased',dateTo, "&lt;=",")AND(");
			}
			if(valueExistsNotEmpty(priceFrom)){
				eqRes.addClause('eq.price',priceFrom, "&gt;=",")AND(");
			}
			if(valueExistsNotEmpty(priceTo)){
				eqRes.addClause('eq.price',priceTo, "&lt;=",")AND(");
			}
			if(valueExistsNotEmpty(CsiList)){
				//将分类编码列表进行转化
				var csiDoneArray=new Array();//转化去零后的数组
				var csiArray=CsiList.split(',');
				for(var i=0;i<csiArray.length-1;i++){
					var csiDes=csiArray[i];
					//去零操作
					var doneString="";
					for(var j=0;j<csiDes.length;j=j+2){
						
						var s=csiDes.substring(j,j+2);
						if(s!='00'){
							doneString=doneString+s;
						}else{
							break;
						}
					}
					csiDoneArray.push(doneString);
				}
				for(var k=0;k<csiDoneArray.length;k++){
					var csi_s=csiDoneArray[k]+'%';
					if(k==0){
						eqRes.addClause('eq.csi_id',csi_s, "LIKE",")AND(");
					}else{
						eqRes.addClause('eq.csi_id',csi_s, "LIKE","OR");
					}
					
				}
			}
			
			//给设备列表添加筛选条件
			//var ds=View.dataSources.get('ascBjUsmsEqDs');
			//ds.restriction=eqRes;
			this.eqListPanel.refresh(eqRes);
		}
		
		
		//从eq_check_res表中获取截取条件对eq列表进行过滤
		
		
		var dvId=View.user.employee.organization.divisionId;
		this.formPanel.setFieldValue('eq_check_report.dv_id',dvId);
		this.formPanel.setFieldValue('eq_check_report.check_person','');
		
		var gridRows=this.eqListPanel.gridRows;
		for(var i=0;i<gridRows.length;i++){
			gridRows.get(i).actions.items[0].setTitle("确认丢失");
		}
	},
	
	eqListPanel_afterRefresh: function(){
		var eqlistPanel=this.eqListPanel;
			//View.panels.get('eqlistPanel');
		//将保存的Eq列表进行拆解
		if(valueExistsNotEmpty(this.eqsDone)){
			var eqs=this.eqsDone.split(",");
			
			var gridRows=eqlistPanel.gridRows;
			for(var i=0;i<eqs.length-1;i++){
				for(var k=0;k<gridRows.length;k++){
					var eqId=gridRows.get(k).getRecord().getValue('eq.eq_id');
					if(eqId==eqs[i]){
						gridRows.get(k).cells.items[0].dom.innerHTML="<span style='color:red'><b>盘亏</b></span>";
					}
				}
			}
		}
	},
	
	lossEqList_afterRefresh: function(){
		var sumPrice=0;
		var gridRows=this.lossEqList.gridRows;
		if(gridRows.length>0){
			//当盘亏列表中有数据时，将价格进行累加
			for(var i=0;i<gridRows.length;i++){
				var rowRecord=gridRows.get(i).getRecord();
				var price=parseInt(rowRecord.getValue('eq.price'));
				sumPrice=sumPrice+price;
				
			}
			//将盘亏总额填入对应字段中
			$('pkSumTxt').value=sumPrice;
			var b=1;
		}else{
			View.alert("没有盘亏设备,请选择盘亏设备");
		}
		
	},
	
	lossEqList_btnAddReason_onClick: function(){
		this.AddReasonPanel.showInWindow({
			width: 500,
			height: 150,
			closeButton: false 
		});
		$('btnAdd').value="确定";
		controller.chooseType="0";
		$('lossRadio1').checked=true;
	},
	
	formPanel_onBtnDoPK: function(){
		//先检查字段填写是否合格
		var checkDate=this.formPanel.getFieldValue('eq_check_report.check_date');
		var checkEm=this.formPanel.getFieldValue('eq_check_report.check_person');
		var storemanOption=this.dvAuditOption.getFieldValue('eq_check_report.storeman_option');
		var dvLeaderOption=this.dvAuditOption.getFieldValue('eq_check_report.dvleader_option');
		if(!valueExistsNotEmpty(checkDate)){
			View.alert("清查时间不能为空");
			return;
		}
		if(!valueExistsNotEmpty(checkEm)){
			View.alert("清查人员不能为空");
			return;
		}
		if(!valueExistsNotEmpty(storemanOption)){
			View.alert("保管人意见不能为空");
			return;
		}
		if(!valueExistsNotEmpty(dvLeaderOption)){
			View.alert("部门领导意见不能为空");
			return;
		}
		
		//检查设备项的清查原因是否都已填写
		var isNotEmpty=true;
		var gridRows=this.lossEqList.gridRows;
		for(var i=0;i<gridRows.length;i++){
			var reason=gridRows.get(i).cells.items[1].dom.innerHTML;
			if(!valueExistsNotEmpty(reason)){
				isNotEmpty=false;
				break;
			}
		}
		if(!isNotEmpty){
			View.alert("请选择设备盘亏原因");
			return;
		}
		
		//当所有项检查合格以后，执行盘亏操作
		//1.先存eq_check_report表
		var record = new Ab.data.Record();
		record.isNew = true;
		var dvId=View.user.employee.organization.divisionId;
	    record.setValue('eq_check_report.dv_id',dvId);
	    record.setValue('eq_check_report.check_main_id',this.mainId);
	    record.setValue('eq_check_report.storeman_option',storemanOption);
	    record.setValue('eq_check_report.dvleader_option',dvLeaderOption);
	    var checkSum=$('pkSumTxt').value;
	    record.setValue('eq_check_report.check_sum',checkSum);
	    record.setValue('eq_check_report.check_date',checkDate);
	    record.setValue('eq_check_report.check_person',checkEm);
	    var eqCheckReportDs=View.dataSources.get('ascBjUsmsEqCheckReportDs');
	    try{
	    	eqCheckReportDs.saveRecord(record);
	    }catch(e){
	    	for(var p in e){
	    		document.writeln(e[p]);
	    	}
	    }
	    
	    var eqCheckReportId=eqCheckReportDs.getRecord().getValue('eq_check_report.check_report_id');
	    
	    //根据主表ID存附表
	    var eqCheckRecord = new Ab.data.Record();
	    eqCheckRecord.isNew = true;
	    eqCheckRecord.setValue('eq_check.check_report_id',eqCheckReportId);
	    eqCheckRecord.setValue('eq_check.dv_id',dvId);
		var gridRows=this.lossEqList.gridRows;
		for(var i=0;i<gridRows.length;i++){
			var rowRecord=gridRows.get(i).getRecord();
			var eqId=rowRecord.getValue('eq.eq_id');
			var price=rowRecord.getValue('eq.price');
			var lossOption='0';
			var lossOptionValue=gridRows.get(i).cells.items[1].dom.innerHTML;
			if(lossOptionValue=="丢失"){
				lossOption='0';
			}
			if(lossOptionValue=="捐赠"){
				lossOption='1';
			}
			if(lossOptionValue=="出售"){
				lossOption='2';
			}
			if(lossOptionValue=="报废"){
				lossOption='3';
			}
			if(lossOptionValue=="补手续"){
				lossOption='4';
			}
			eqCheckRecord.setValue('eq_check.check_main_id',this.mainId);
			eqCheckRecord.setValue('eq_check.eq_id',eqId);
			eqCheckRecord.setValue('eq_check.price',price);
			eqCheckRecord.setValue('eq_check.loss_option',lossOption);
			
			var eqCheckDs=View.dataSources.get('ascBjUsmsEqCheckDs');
			try{
				eqCheckDs.saveRecord(eqCheckRecord);
			}catch(e){
				for(var p in e){
					document.writeln(e[p]);
				}	
			}
		}
		
		
		//执行保存后的操作（清空数据、隐藏panel）
		this.formPanel.setFieldValue('eq_check_report.check_person','');
		
		View.panels.get('formPanel').show(false);
		View.panels.get('eqListPanel').show(false);
		View.panels.get('lossEqList').show(false);
		View.panels.get('dvAuditOption').show(false);
		View.panels.get('AddReasonPanel').show(false);
		View.alert("盘亏操作已完成,请等待审批结果!");
		return;
	}
});

function showTypePanel(){
	var eqListPanel=View.panels.get('eqListPanel');
	var rowIndex=eqListPanel.selectedRowIndex;
	var rows=eqListPanel.gridRows;
	for(var i=0;i<rows.length;i++){
		var row=rows.get(i);
		if(i==rowIndex){
			//获取button的title,根据title确定清查结果中显示的字符串	
			var resultCell=row.cells.items[0];
			var innerHtml=resultCell.dom.innerHTML;
			
			var eqId=row.getRecord().getValue('eq.eq_id');
			var eqsDone=controller.eqsDone.split(",");
			
			if(valueExistsNotEmpty(innerHtml))
			{
				resultCell.dom.innerHTML="";
				//将eqs中的此条eq记录去掉
				for(var k=0;k<eqsDone.length-1;k++){
					if(eqsDone[k]==eqId){
						var eqs="";
						for(var j=0;j<eqsDone.length-1;j++){
							if(k!=j){
								eqs=eqs+eqsDone[j]+",";
							}
						}
						controller.eqsDone=eqs;
					}
				}
			}else{
				resultCell.dom.innerHTML="<span style='color:red'><b>盘亏</b></span>";
				//在全局变量中加入此ID,条件是全局变量中没有此ID
				var isExis=false;
				for(var k=0;k<eqsDone.length;k++){
					if(eqsDone[k]==eqId){
						isExis=true;//全局变量中有相同的项存在
					}
				}
				if(!isExis){
					controller.eqsDone=controller.eqsDone+eqId+",";
				}
			}
		}
	
	}
}

//点击按钮将盘亏设备加入清单
function toAddLossEq(){
	var eqList="";
	if(valueExistsNotEmpty(controller.eqsDone)){
		var eqs=controller.eqsDone.split(",");
		for(var i=0;i<eqs.length-1;i++){
			if(i==(eqs.length-2)){
				eqList=eqList+"'"+eqs[i]+"'";
			}else{
				eqList=eqList+"'"+eqs[i]+"',";
			}
		}
		View.panels.get('dvAuditOption').show();
		View.panels.get('dvAuditOption').clear();
		var eqListRes=new Ab.view.Restriction();
		eqListRes.addClause('eq.eq_id',eqs,'IN');
		var lossEqList=View.panels.get('lossEqList');
		lossEqList.refresh(eqListRes);
		
		
	}
}

function chooseReson(){
	var lossEqListPanel=View.panels.get('lossEqList');
	var selectIndex=lossEqListPanel.selectedRowIndex;
	var value=controller.chooseType;
	var reason="";
	if(valueExistsNotEmpty(value)){
		if(value=="0"){
			reason="丢失";
		}
		if(value=="1"){
			reason="捐赠";
		}
		if(value=="2"){
			reason="出售";
		}
		if(value=="3"){
			reason="报废";
		}
		if(value=="4"){
			reason="补手续";
		}
		//将原因填入grid对应行中
		lossEqListPanel.gridRows.get(selectIndex).cells.items[1].dom.innerHTML=reason;	
	}
	View.panels.get('AddReasonPanel').closeWindow();
}

function choose(value){
	controller.chooseType=value;
}