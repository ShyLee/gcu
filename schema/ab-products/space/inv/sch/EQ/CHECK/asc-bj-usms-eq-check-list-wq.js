var checkListFormController=View.createController('checkListFormController',{
	check_main_id: null,
	progressControl:null,
	afterViewLoad:function(){
		$('select1').outerHTML = '<select id="select1" onchange="checkListFormController.eqCheckStatus(this)">'
			+ '<option value="-1">全部</option>'
			+ '<option value="0">需报亏设备</option>'
			+ '<option value="1">在库设备</option></select>';
		
		
		$('select2').outerHTML = '<select id="select2" onchange="checkListFormController.eqAttachCheckStatus(this)">'
			+ '<option value="-1">全部</option>'
			+ '<option value="0">需报亏设备</option>'
			+ '<option value="1">在库设备</option></select>';
	},
	eqCheckMainPanel_check_name_onClick: function(row){
		var check_main_id = row.getFieldValue("eq_check_main.check_main_id");
		this.check_main_id_onClick(check_main_id);
		this.check_main_id = check_main_id;
	},
	
	afterInitialDataFetch: function(){
		//界面打开后 自动加载第一条数据
		if(this.eqCheckMainPanel.rows.length>0){
			var check_main_id = this.eqCheckMainPanel.rows[0]["eq_check_main.check_main_id"];
			this.check_main_id_onClick(check_main_id);
			this.check_main_id = check_main_id;
		}
	},
	eqCheckStatus:function(obj){
		var value= $('select1').options[$('select1').selectedIndex].value
		var res = new Ab.view.Restriction();
		if(value == '1'){
			res.addClause("eq.check_status",value,'=');
			this.eqListPanel.refresh(res);
			return;
		}else if(value == '0'){
			res.addClause("eq.check_status",value,'=')
			this.eqListPanel.refresh(res);
			return;
		}else{
			this.eqListPanel.refresh("1=1");
		}
		
		
	},
	eqAttachCheckStatus:function(obj){
		var value= $('select2').options[$('select2').selectedIndex].value
		var res = new Ab.view.Restriction();
		if(value == '1'){
			res.addClause("eq_attach.check_status",value,'=');
			this.eqAttachPanel.refresh(res);
			return;
		}else if(value == '0'){
			res.addClause("eq_attach.check_status",value,'=')
			this.eqAttachPanel.refresh(res);
			return;
		}else{
			this.eqAttachPanel.refresh("1=1");
		}
	},
	eqAttachPanel_onExportTaskData:function(){
		try {			
			var jobId = Workflow.startJob('AbSystemAdministration-EqInventoryPlan-exportEqInventoryCheckList',"asc-bj-usms-eq-check-list-wq.axvw", "eq_attach_ds","attach");
			var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
            View.openDialog(url);
		} catch (e) {
			Workflow.handleError(e);
		}	
	},
	eqAttachPanel_onImportTaskData:function(){
		  View.openDialog("asc-bj-usms-eq-import.axvw","eq_attch",null,{width:500,height:200});
	},
	eqListPanel_onImportTaskData:function(){
		  View.openDialog("asc-bj-usms-eq-import.axvw","eq",null,{width:500,height:200});
	},
	eqListPanel_onExportTaskData:function(){
		try {			
			var jobId = Workflow.startJob('AbSystemAdministration-EqInventoryPlan-exportEqInventoryCheckList',"asc-bj-usms-eq-check-list-wq.axvw", "ascBjUsmsEqDs","eq");
			var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
            View.openDialog(url);
		} catch (e) {
			Workflow.handleError(e);
		}	
	},

	check_main_id_onClick: function(check_main_id){
		//如果清查已完成，则无法进行报失等操作
		this.eqAndAttachTabs.selectTab("eqTab");
		this.eqAndAttachLoseTabs.selectTab("eqLoseTab");
		
		var res = new Ab.view.Restriction();
		var res2 = new Ab.view.Restriction();
		var resAttach = new Ab.view.Restriction();
		res.addClause('eq_check_report.check_main_id',check_main_id,'=');
		res2.addClause('eq_check.check_main_id',check_main_id,'=');
		
		resAttach.addClause('eq_check_attach.check_main_id',check_main_id,'=');
		
		var res4 = new Ab.view.Restriction();
		res4.addClause('eq_check_main.check_main_id',check_main_id,'=');
		
		//此处添加刷新设备表的筛选项
		var res3 = this.getCheckRestriction(check_main_id,"eq");
		this.eqListPanel.refresh(res3);
		this.mainPanel.refresh(res4);
		
		//zhangyan add 设备附件的筛选项 根据界面中显示的设备 筛选出对应设备的附件信息	
		//yangzhiwu add 附件的筛选在页面加载的时候已经做了，限制条件为dv，dp，
		//如果清查所有的设备，则附件不需要额外的限制；反之继续过滤
		
		/*var array=[];
		var eqRecords=this.ascBjUsmsEqDs.getRecords(res3);
		for(var i=0;i<eqRecords.length;i++){
			var eqId=eqRecords[i].values["eq.eq_id"];
			array.push(eqId);
		}*/
		var res5 = this.getCheckRestriction(check_main_id,"eq_attach");
		//res5.addClause('eq_attach.eq_id',array,'in');
		this.eqAttachPanel.addParameter('eqId', res5);
		this.eqAttachPanel.refresh();
		
		//显示check_report表 疑问：如果不存在checkReport的时候是如何刷新的，是不是要先保存下获取到ReportId
		var record = this.ascBjUsmsEqCheckReportDs.getRecord(res);
//		var dv_id = View.user.employee.organization.divisionId;
		
		if(record.isNew){
			//如果尚未进行清查，则生成清查报告。
			record.setValue("eq_check_report.check_main_id",check_main_id);
//			record.setValue("eq_check_report.dv_id",dv_id);
			this.ascBjUsmsEqCheckReportDs.saveRecord(record);
			this.eqCheckReportPanel.refresh(res);
		}else{
			//如果已进行清查，则刷新
			this.eqCheckReportPanel.refresh(res);
		}
		var emId=View.user.employee.id;
		var emName=getNameById(emId);
		
		this.eqCheckReportPanel.setFieldValue("eq_check_report.check_person",emId);
		this.eqCheckReportPanel.setFieldValue("eq_check_report.check_person_name",emName);
		
		//刷新报失表
		this.lossEqList.refresh(res2);
		
		//zhangyan add 同时刷新设备附件报亏表
		this.lossEqAttachList.refresh(resAttach);
		
		this.count_loss_eq();
		//this.sum_loss_eq_price();
		
		//如果清查已完成，则无法进行报失等操作
		var mainStatus = this.mainPanel.getFieldValue("eq_check_main.is_done");
		var status = this.eqCheckReportPanel.getFieldValue("eq_check_report.audit_status");
		if(status == 1 ||status == 2||mainStatus==2){
			//已提交或审批通过状态不可编辑
//			if(status == 1){View.alert("审批进行中，不可编辑。");
//			}
//			if(status == 2){View.alert("审批已通过，不可编辑。");
//			}
//			if(mainStatus==2){View.alert("审批已完成，不可编辑。");
//			}
			this.disableEdit();	
			this.disableAttachEdit();	
			return;	
		}
		if(status == 0 ||status == 3){
			//未提交或驳回状态可以编辑
			this.enableEdit();
			this.enableAttachEdit();
			//如果是部分驳回状态，需要禁用掉已批准的报失
			return;
		}
	},
	
	getCheckRestriction: function(check_main_id,flag){
		//获取过滤条件
		var res = new Ab.view.Restriction();
		res.addClause('eq_check_res.check_main_id',check_main_id,'=');
		var records = this.ascBjUsmsEqCheckResDs.getRecords(res);

		//生成过滤条件
		var restriction = new Ab.view.Restriction();
		var str="eq_attach.eq_id in(select eq_id from eq where 1=1 ";
		if(flag=="eq"){
			for(var i = 0;i<records.length;i++ ){
				var flds_name = records[i].getValue("eq_check_res.flds_name");
				var flds_res = records[i].getValue("eq_check_res.flds_res");
					
				if(flds_name == 'dv_id'){
					var dvField=flds_res.split("-");
					restriction.addClause('eq.dv_id',dvField[0],'=',')AND(');
				}
				if(flds_name == 'dp_id'){
					var dpField=flds_res.split("-");
					restriction.addClause('eq.dp_id',dpField[0],'=',')AND(');
				}
				if(flds_name == 'eq_warehouse'){
					var warehouse;
		    		if(flds_res=="设备"){
		    			warehouse="1";
		    		}else if(flds_res=="行政"){
		    			warehouse="2";
		    		}else if(flds_res=="易耗品"){
		    			warehouse="3";
		    		}else if(flds_res=="软件"){
		    			warehouse="4";
		    		}else if(flds_res=="工程"){
		    			warehouse="5";
		    		}else if(flds_res=="其他"){
		    			warehouse="6";
		    		}else if(flds_res=="图书"){
		    			warehouse="7";
		    		}
					restriction.addClause('eq.eq_warehouse',warehouse,'=',')AND(');
				}
				if(flds_name == 'is_label'){
					var label;
		    		if(flds_res=="无"){
		    			label="0";
		    		}else if(flds_res=="有"){
		    			label="1";
		    		}
					restriction.addClause('eq.is_label',label,'=',')AND(');
				}
				if(flds_name == 'bl_id'){
					restriction.addClause('eq.bl_id',flds_res,'=',')AND(');
				}
				if(flds_name == 'fl_id'){
					restriction.addClause('eq.fl_id',flds_res,'=',')AND(');
				}
				if(flds_name == 'rm_id'){
					restriction.addClause('eq.rm_id',flds_res,'=',')AND(');
				}
					if(flds_name == 'date_from'){
						restriction.addClause('eq.date_purchased',flds_res,'>=',')AND(');
					}
					if(flds_name == 'date_to'){
						restriction.addClause('eq.date_purchased',flds_res,'<=',')AND(');
					}
					if(flds_name == 'csi_id' && flds_res != '0,'){
						var csi_list = flds_res.split(",");
						for(var j = 0;j<csi_list.length-1;j++){
						
							var csi= csi_list[j];	
							for(var k=0;k<5;k++){
								csi = csi.replace(/(00)\b/gi,"");
							}
							if(j == 0){
								restriction.addClause('eq.csi_id',csi+'%','like',')AND(');
							}else{
								restriction.addClause('eq.csi_id',csi+'%','like','OR');
							}
						}
						
					}
					if(flds_name == 'price_from'){
						restriction.addClause('eq.price',flds_res,'>=',')AND(');
					}
					if(flds_name == 'price_to'){
						restriction.addClause('eq.price',flds_res,'<=',')AND(');
					}
			}
			return restriction;
		}else{
			for(var i = 0;i<records.length;i++ ){
				var flds_name = records[i].getValue("eq_check_res.flds_name");
				var flds_res = records[i].getValue("eq_check_res.flds_res");
					
				if(flds_name == 'dv_id'){
					var dvField=flds_res.split("-");
					str=str+" and eq.dv_id='"+dvField[0]+"'";
				}
				if(flds_name == 'dp_id'){
					var dpField=flds_res.split("-");
					str=str+" and eq.dp_id='"+dpField[0]+"'";
				}
				if(flds_name == 'eq_warehouse'){
					var warehouse;
		    		if(flds_res=="设备"){
		    			warehouse="1";
		    		}else if(flds_res=="行政"){
		    			warehouse="2";
		    		}else if(flds_res=="易耗品"){
		    			warehouse="3";
		    		}else if(flds_res=="软件"){
		    			warehouse="4";
		    		}else if(flds_res=="工程"){
		    			warehouse="5";
		    		}else if(flds_res=="其他"){
		    			warehouse="6";
		    		}else if(flds_res=="图书"){
		    			warehouse="7";
		    		}
		    		str=str+" and eq.eq_warehouse='"+warehouse+"'";
				}
				if(flds_name == 'is_label'){
					var label;
		    		if(flds_res=="无"){
		    			label="0";
		    		}else if(flds_res=="有"){
		    			label="1";
		    		}
		    		str=str+" and eq.is_label='"+label+"'";
				}
				if(flds_name == 'bl_id'){
					str=str+" and eq.bl_id='"+flds_res+"'";
				}
				if(flds_name == 'fl_id'){
					str=str+" and eq.fl_id='"+flds_res+"'";
				}
				if(flds_name == 'rm_id'){
					str=str+" and eq.rm_id='"+flds_res+"'";
				}
					if(flds_name == 'date_from'){
						str=str+" and eq.date_purchased>="+flds_res;
					}
					if(flds_name == 'date_to'){
						str=str+" and eq.date_purchased<="+flds_res;
					}
					if(flds_name == 'csi_id' && flds_res != '0,'){
						var csi_list = flds_res.split(",");
						for(var j = 0;j<csi_list.length-1;j++){
						
							var csi= csi_list[j];	
							for(var k=0;k<5;k++){
								csi = csi.replace(/(00)\b/gi,"");
							}
							if(j == 0){
								str=str+" and eq.csi_id like '%"+csi+"%'";
							}else{
								str=str+" and eq.csi_id like '%"+csi+"%'";
							}
						}
						
					}
					if(flds_name == 'price_from'){
						str=str+" and eq.price>="+flds_res;
					}
					if(flds_name == 'price_to'){
						str=str+" and eq.price<="+flds_res;
					}
							
			}
			str=str+")";
			return str;
		}		
		
	},
	
	//将已添加到报亏列表的设备置为已报亏
	changeEqCheckStatus: function(){
		var grid = this.eqListPanel.gridRows;
		var grid2 = this.lossEqList.gridRows;
		this.eqAndAttachLoseTabs.selectTab("eqLoseTab");
		for(var i=0;i<grid.length;i++){
			//如果lossEqList表存在则显示为已报亏
			var eq_id1 = grid.items[i].getFieldValue("eq.eq_id");
			var flag = true;
			for(var k=0;k<grid2.length;k++){
				var eq_id2 = grid2.items[k].getFieldValue("eq_check.eq_id");
				if(eq_id1 == eq_id2){
					flag = false;
				}
			}
			if(flag){
				grid.items[i].actions.items[0].setTitle("报亏");
				grid.items[i].actions.items[0].enable(true);
			}else{
				grid.items[i].actions.items[0].setTitle("已报亏");
				grid.items[i].actions.items[0].enable(false);
			}
			
		}
	},
	/**
	 * zhangyan add 
	 * 将已添加到报亏列表的设备附件置为已报亏
	 * 
	 */
	changeEqAttachCheckStatus: function(){
		var grid = this.eqAttachPanel.gridRows;
		var grid2 = this.lossEqAttachList.gridRows;
		this.eqAndAttachLoseTabs.selectTab("eqAttachLoseTab");
		for(var i=0;i<grid.length;i++){
			//如果lossEqList表存在则显示为已报亏
			var eq_id1 = grid.items[i].getFieldValue("eq_attach.eq_attach_id");
			var flag = true;
			for(var k=0;k<grid2.length;k++){
				var eq_id2 = grid2.items[k].getFieldValue("eq_check_attach.eq_attach_id");
				if(eq_id1 == eq_id2){
					flag = false;
				}
			}
			if(flag){
				grid.items[i].actions.items[0].setTitle("报亏");
				grid.items[i].actions.items[0].enable(true);
			}else{
				grid.items[i].actions.items[0].setTitle("已报亏");
				grid.items[i].actions.items[0].enable(false);
			}
			
		}
	},
	//允许报亏操作
	enableEdit: function(){
		var grid = this.eqListPanel.gridRows;
		var grid2 = this.lossEqList.gridRows;
		for(var i=0;i<grid.length;i++){
			//如果lossEqList表存在则显示为已报亏
			var eq_id1 = grid.get(i).getFieldValue("eq.eq_id");
			var flag = true;
			for(var k=0;k<grid2.length;k++){
				var eq_id2 = grid2.get(k).getFieldValue("eq_check.eq_id");
				if(eq_id1 == eq_id2){
					flag = false;
				}
			}
			if(flag){
				grid.get(i).actions.get('LossEq').setTitle("报亏");
				grid.get(i).actions.get('LossEq').enable(true);
			}else{
				grid.get(i).actions.get('LossEq').setTitle("已报亏");
				grid.get(i).actions.get('LossEq').enable(false);
			}
			
		}
		for(var j=0;j<grid2.length;j++){
			//如果是部分驳回状态，需要禁用掉已批准的报失
			var approved = grid2.get(j).getFieldValue("eq_check.approved");
			if(approved == 1){
				grid2.get(j).actions.get('delete').enable(false);
				grid2.get(j).actions.get('addReason').enable(false);
			}else{
				grid2.get(j).actions.get('delete').enable(true);
				grid2.get(j).actions.get('addReason').enable(true);
			}
			
		}
		this.eqCheckReportPanel.enableAction("save",true);
		this.eqCheckReportPanel.enableAction("finish",true);
		this.eqCheckReportPanel.enableField("eq_check_report.check_date",true);
		this.eqCheckReportPanel.enableField("eq_check_report.check_person",true);
		this.eqCheckReportPanel.enableField("eq_check_report.check_person_name",true);
		this.eqCheckReportPanel.enableField("eq_check_report.storeman_option",true);
		this.eqCheckReportPanel.enableField("eq_check_report.dvleader_option",true);

	},
	//禁止报亏操作
	disableEdit: function(){
		var grid = this.eqListPanel.gridRows;
		for(var i=0;i<grid.length;i++){
			grid.get(i).actions.get('LossEq').enable(false);
		}
		var grid2 = this.lossEqList.gridRows;
		for(var j=0;j<grid2.length;j++){
			grid2.get(j).actions.get('delete').enable(false);
			grid2.get(j).actions.get('addReason').enable(false);
		}
		this.eqCheckReportPanel.enableAction("save",false);
		this.eqCheckReportPanel.enableAction("finish",false);
		this.eqCheckReportPanel.enableField("eq_check_report.check_date",false);
		this.eqCheckReportPanel.enableField("eq_check_report.check_person",false);
		this.eqCheckReportPanel.enableField("eq_check_report.check_person_name",false);
		this.eqCheckReportPanel.enableField("eq_check_report.storeman_option",false);
		this.eqCheckReportPanel.enableField("eq_check_report.dvleader_option",false);
	},
	/**
	 * zhangyan add 
	 * 允许设备附件报亏操作
	 * 
	 */
	enableAttachEdit: function(){
		var grid = this.eqAttachPanel.gridRows;
		var grid2 = this.lossEqAttachList.gridRows;
		for(var i=0;i<grid.length;i++){
			//如果lossEqList表存在则显示为已报亏
			var eq_id1 = grid.get(i).getFieldValue("eq_attach.eq_attach_id");
			var flag = true;
			for(var k=0;k<grid2.length;k++){
				var eq_id2 = grid2.get(k).getFieldValue("eq_check_attach.eq_attach_id");
				if(eq_id1 == eq_id2){
					flag = false;
				}
			}
			if(flag){
				grid.get(i).actions.get('LossEqAttach').setTitle("报亏");
				grid.get(i).actions.get('LossEqAttach').enable(true);
			}else{
				grid.get(i).actions.get('LossEqAttach').setTitle("已报亏");
				grid.get(i).actions.get('LossEqAttach').enable(false);
			}
			
		}
		for(var j=0;j<grid2.length;j++){
			//如果是部分驳回状态，需要禁用掉已批准的报失
			var approved = grid2.get(j).getFieldValue("eq_check_attach.approved");
			if(approved == 1){
				grid2.get(j).actions.get('delete').enable(false);
				grid2.get(j).actions.get('addReason').enable(false);
			}else{
				grid2.get(j).actions.get('delete').enable(true);
				grid2.get(j).actions.get('addReason').enable(true);
			}
			
		}
//		this.eqCheckReportPanel.enableAction("save",true);
//		this.eqCheckReportPanel.enableAction("finish",true);
//		this.eqCheckReportPanel.enableField("eq_check_report.check_date",true);
//		this.eqCheckReportPanel.enableField("eq_check_report.check_person",true);
//		this.eqCheckReportPanel.enableField("eq_check_report.check_person_name",true);
//		this.eqCheckReportPanel.enableField("eq_check_report.storeman_option",true);
//		this.eqCheckReportPanel.enableField("eq_check_report.dvleader_option",true);
		
	},
	/**
	 * zhangyan add
	 * 禁止设备附件报亏操作
	 * 
	 */
	disableAttachEdit: function(){
		var grid = this.eqAttachPanel.gridRows;
		for(var i=0;i<grid.length;i++){
			grid.get(i).actions.get('LossEqAttach').enable(false);
		}
		var grid2 = this.lossEqAttachList.gridRows;
		for(var j=0;j<grid2.length;j++){
			grid2.get(j).actions.get('delete').enable(false);
			grid2.get(j).actions.get('addReason').enable(false);
		}
//		this.eqCheckReportPanel.enableAction("save",false);
//		this.eqCheckReportPanel.enableAction("finish",false);
//		this.eqCheckReportPanel.enableField("eq_check_report.check_date",false);
//		this.eqCheckReportPanel.enableField("eq_check_report.check_person",false);
//		this.eqCheckReportPanel.enableField("eq_check_report.check_person_name",false);
//		this.eqCheckReportPanel.enableField("eq_check_report.storeman_option",false);
//		this.eqCheckReportPanel.enableField("eq_check_report.dvleader_option",false);
	},
	
	//统计丢失设备金额
	/*
	sum_loss_eq_price: function(){
		var grid = this.lossEqList.gridRows;
		var sum_price = 0;
		for(var i= 0 ;i<grid.length;i++){
			var price = parseFloat(grid.items[i].getFieldValue("eq_check.price"));
			if(!isNaN(price)){
				sum_price = sum_price+price;
			}
		}
		this.eqCheckReportPanel.setFieldValue("eq_check_report.check_sum",sum_price);
	},*/
	
	//统计丢失设备数
	
	count_loss_eq: function(){
		this.eqCheckReportPanel.setFieldValue("eq_check_report.loss_count",this.lossEqList.gridRows.length);
		this.eqCheckReportPanel.setFieldValue("eq_check_report.loss_count_attach",this.lossEqAttachList.gridRows.length);
	},
	
	//报失设备
	eqListPanel_onLossEq: function(row){
		//检查当前点击的项目是否已经报亏过
		var eq_id = row.getFieldValue("eq.eq_id");
		var res = new Ab.view.Restriction();
		res.addClause('eq_check.eq_id',eq_id,'=');
		//筛选条件还要是本次报亏不重复，以前报亏过的可以重新报亏。
		if(valueExistsNotEmpty(this.check_main_id)){
			res.addClause('eq_check.check_main_id',this.check_main_id,'=');
		}		
		var record = this.ascBjUsmsEqCheckDs.getRecord(res);
		if(record.isNew){
			//设备尚未报失
			record.setValue("eq_check.eq_id",row.getFieldValue("eq.eq_id"));
			record.setValue("eq_check.eq_name",row.getFieldValue("eq.eq_name"));
			record.setValue("eq_check.price",row.getFieldValue("eq.price"));
			record.setValue("eq_check.dv_id",row.getFieldValue("eq.dv_id"));
			record.setValue("eq_check.dp_id",row.getFieldValue("eq.dp_id"));
			record.setValue("eq_check.loss_option",'');
			
			record.setValue("eq_check.check_main_id",this.eqCheckReportPanel.getFieldValue("eq_check_report.check_main_id"));
			
		}else{
			//设备已报失
			View.alert("设备已报亏！");
			return;
			//是否标红
		}
		this.ascBjUsmsEqCheckDs.saveRecord(record);
		this.lossEqList.refresh();
		
		this.count_loss_eq();
		this.changeEqCheckStatus();
		//this.sum_loss_eq_price();
	},
	/** 
	 * zhangyan add
	 * 设备附件报亏
	 */
	eqAttachPanel_onLossEqAttach: function(row){
		//检查当前点击的项目是否已经报亏过
		var eq_attach_id = row.getFieldValue("eq_attach.eq_attach_id");
		var res = new Ab.view.Restriction();
		res.addClause('eq_check_attach.eq_attach_id',eq_attach_id,'=');
		//筛选条件还要是本次报亏不重复，以前报亏过的可以重新报亏。
		if(valueExistsNotEmpty(this.check_main_id)){
			res.addClause('eq_check_attach.check_main_id',this.check_main_id,'=');
		}		
		var record = this.eq_check_attach_ds.getRecord(res);
		if(record.isNew){
			//设备尚未报亏
			record.setValue("eq_check_attach.eq_id",row.getFieldValue("eq_attach.eq_id"));
			record.setValue("eq_check_attach.eq_attach_id",row.getFieldValue("eq_attach.eq_attach_id"));
			record.setValue("eq_check_attach.eq_attach_name",row.getFieldValue("eq_attach.eq_attach_name"));
			record.setValue("eq_check_attach.price",row.getFieldValue("eq_attach.price"));
			record.setValue("eq_check_attach.dv_id",row.getFieldValue("eq_attach.dv_id"));
			record.setValue("eq_check_attach.dp_id",row.getFieldValue("eq_attach.dp_id"));
			record.setValue("eq_check_attach.loss_option",'');
			
			record.setValue("eq_check_attach.check_main_id",this.check_main_id);
		}else{
			//设备已报失
			View.alert("设备已报亏！");
			return;
		}
		this.eq_check_attach_ds.saveRecord(record);
		this.lossEqAttachList.refresh();
		
		this.count_loss_eq();
		this.changeEqAttachCheckStatus();
	},
	eqCheckReportPanel_onSave: function(){
		this.eqCheckReportPanel.save();
	},
	eqCheckReportPanel_onFinish: function(){
		//完成盘亏，上报待审
		//完成盘亏后禁止进行报亏操作。
		//check_report状态变更成待审状态。（提交），如审批未通过，则变成待提交状态（未提交）
		//check_main状态变更成已盘亏。（提交），如审批未通过，则变成待提交状态（未提交）
		//无上报文件，要提示是否确认提交
		//检查是否有未选择报失原因的条目
		/*
		var res = new Ab.view.Restriction();
		res.addClause('eq_check.loss_option','','IS NULL');
		var record = this.ascBjUsmsEqCheckDs.getRecord(res);
		if(!record.isNew){
			View.showMessage("请为所有盘亏设备填写报失原因！");
			return;
		}
		*/
		//当此清查任务下有审核未通过的项时，禁止提交
		var checkDs=View.dataSources.get('ascBjUsmsEqCheckDs');
		var checkMainId=this.mainPanel.getFieldValue('eq_check_main.check_main_id');
		var checkRes=new Ab.view.Restriction();
		checkRes.addClause('eq_check.check_main_id',checkMainId,'=');
		checkRes.addClause('eq_check.approved','2','=');
		var checkRecord=checkDs.getRecord(checkRes);
		
		//zhangyan add 如果附件设备没有审核未通过时，禁止提交 ？？？？
		
		if(!checkRecord.isNew){
			View.alert('此任务下存在审核未通过的设备,请重新为该设备填写补充资料后提交 !');
			return;
		}
		var confirmString = "提交清查将无法修改提交内容，确定提交？";
		
		var res2 = new Ab.view.Restriction();
		res2.addClause('eq_check.loss_option',4,'=');
		var record2 = this.ascBjUsmsEqCheckDs.getRecord(res2);
		if(!record2.isNew){
		//有缺乏文档
			View.showMessage("部分报亏资料不完整，请补充资料后提交！");
			return;
		}else{
		//无缺乏文档
			var finish = confirm(confirmString);
			if(finish){
				this.eqCheckReportPanel.setFieldValue("eq_check_report.audit_status",'1')
				this.eqCheckReportPanel.save();
				this.disableEdit();
				this.disableAttachEdit();
			}
		}
		var dsEqCheckMain = View.dataSources.get("ascBjUsmsEqCheckMainDs");
		var res=new Ab.view.Restriction();
    	res.addClause('eq_check_main.check_main_id',checkMainId,'=');
    	var record=dsEqCheckMain.getRecord(res);
    	record.setValue("eq_check_main.is_done", "5");
    	dsEqCheckMain.saveRecord(record);
		this.eqCheckMainPanel.refresh();
	},
	
	//取消盘亏选中设备
	lossEqList_onDelete: function(row){
		this.eqAndAttachTabs.selectTab("eqTab");
		this.ascBjUsmsEqCheckDs.deleteRecord(row.getRecord());
		this.lossEqList.refresh();
		this.count_loss_eq();
		this.changeEqCheckStatus();
		//this.sum_loss_eq_price();
	},
	/**
	 * zhangyan add
	 * 取消盘亏选中的设备附件
	 * 
	 */
	lossEqAttachList_onDelete: function(row){
		this.eqAndAttachTabs.selectTab("eqAttachTab");
		this.eq_check_attach_ds.deleteRecord(row.getRecord());
		this.lossEqAttachList.refresh();
		this.count_loss_eq();
		this.changeEqAttachCheckStatus();
	},
	
	//为选中设备添加盘亏原因
	lossEqList_onAddReason: function(row){
		var res = new Ab.view.Restriction();
		var check_id = row.getFieldValue("eq_check.check_id");
		res.addClause('eq_check.check_id',check_id,'=');
		this.reasonPanel.refresh(res);
		this.reasonPanel.showInWindow({
			x:200,
			y:300,
        	width: 800,
        	height: 400
        });
	},
	//保存盘亏原因
	reasonPanel_onSave: function(){
		var loss_option = this.reasonPanel.getFieldValue("eq_check.loss_option");
		var check_doc  = this.reasonPanel.getFieldValue("eq_check.check_doc");
		this.reasonPanel.setFieldValue("eq_check.approved",'0');
		
		if(loss_option == 4){
			View.showMessage("请选择一个报亏原因！");
			return;
		}
		if(!valueExistsNotEmpty(check_doc)){
			var confirmString = "盘查原因资料不完整，将无法通过审批，确定保存？";
			var finish = confirm(confirmString);
			if(finish){
				this.reasonPanel.save();
			}else{
				return;
			}
		}else{
			this.reasonPanel.save();
			this.reasonPanel.closeWindow();			
		}
		this.lossEqList.refresh();
		var grid2 = this.lossEqList.gridRows;
		for(var j=0;j<grid2.length;j++){
			//如果是部分驳回状态，需要禁用掉已批准的报失
			var approved = grid2.items[j].getFieldValue("eq_check.approved");
			if(approved == 1){
				grid2.items[j].actions.items[0].enable(false);
				grid2.items[j].actions.items[1].enable(false);
			}else{
				grid2.items[j].actions.items[0].enable(true);
				grid2.items[j].actions.items[1].enable(true);
			}
		}
	},
	/**
	 * zhangyan add 设备附件
	 * 为选中设备附件添加盘亏原因
	 */
	lossEqAttachList_onAddReason: function(row){
		var res = new Ab.view.Restriction();
		var check_id = row.getFieldValue("eq_check_attach.check_id");
		res.addClause('eq_check_attach.check_id',check_id,'=');
		this.reasonAttachPanel.refresh(res);
		this.reasonAttachPanel.showInWindow({
			x:200,
			y:300,
			width: 800,
			height: 400
		});
	},
	/**
	 * zhangyan add 设备附件
	 * 保存盘亏原因
	 */
	reasonAttachPanel_onSave: function(){
		var loss_option = this.reasonAttachPanel.getFieldValue("eq_check_attach.loss_option");
		var check_doc  = this.reasonAttachPanel.getFieldValue("eq_check_attach.check_doc");
		this.reasonAttachPanel.setFieldValue("eq_check_attach.approved",'0');
		
		if(loss_option == 4){
			View.showMessage("请选择一个报亏原因！");
			return;
		}
		if(!valueExistsNotEmpty(check_doc)){
			var confirmString = "盘查原因资料不完整，将无法通过审批，确定保存？";
			var finish = confirm(confirmString);
			if(finish){
				this.reasonAttachPanel.save();
			}else{
				return;
			}
		}else{
			this.reasonAttachPanel.save();
			this.reasonAttachPanel.closeWindow();			
		}
		this.eqAttachPanel.refresh();
		var grid2 = this.eqAttachPanel.gridRows;
		for(var j=0;j<grid2.length;j++){
			//如果是部分驳回状态，需要禁用掉已批准的报失
			var approved = grid2.items[j].getFieldValue("eq_check_attach.approved");
			if(approved == 1){
				grid2.items[j].actions.items[0].enable(false);
				grid2.items[j].actions.items[1].enable(false);
			}else{
				grid2.items[j].actions.items[0].enable(true);
				grid2.items[j].actions.items[1].enable(true);
			}
		}
	},
	//点击修正设备位置和领用人信息
	eqListPanel_eq_name_onClick: function(row){
		var res = new Ab.view.Restriction();
		var eq_id = row.getFieldValue("eq.eq_id");
		res.addClause('eq.eq_id',eq_id,'=');
		this.eqEditPanel.refresh(res);
		this.eqEditPanel.showInWindow({
        	width: 800,
        	height: 400
        });
        this.check_report_status();
	},
	
	//保存位置和领用人信息
	eqEditPanel_onSave: function(){
		this.eqEditPanel.save()
		this.eqEditPanel.closeWindow();
		this.eqListPanel.refresh();
		this.check_report_status();
	},
	check_report_status: function(){
		var mainStatus = this.mainPanel.getFieldValue("eq_check_main.is_done");
		var status = this.eqCheckReportPanel.getFieldValue("eq_check_report.audit_status");
		if(status == 1 ||status == 2||mainStatus==2){
			//已提交或审批通过状态不可编辑
			this.disableEdit();	
			return;	
		}
		if(status == 0 ||status == 3){
			//未提交或驳回状态可以编辑
			this.enableEdit();
			//如果是部分驳回状态，需要禁用掉已批准的报失
//			this.eqListPanel.isCollapsed = true;
			return;
		}
		
	},
	eqListPanel_eq_id_onClick: function(row){
		var eq_id = row.getFieldValue("eq.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
        this.check_report_status();
	},
	lossEqList_eq_id_onClick: function(row){
		var eq_id = row.getFieldValue("eq_check.eq_id");
		View.openDialog("asc-bj-usms-eq-card.axvw", null, false, {
        	width: 600,
        	height: 400,
        	eq_id: eq_id
        });
        this.check_report_status();
	},
	eqListPanel_afterRefresh: function(){
		 this.check_report_status();
	},
	lossEqList_afterRefresh: function(){
		 this.check_report_status();
	}
	
});
function getNameById(emId){
	var ascBjUsmsEmDs=View.dataSources.get('ascBjUsmsEmDs');
	var res=new Ab.view.Restriction();
	res.addClause('em.em_id',emId,'=');
	var record=ascBjUsmsEmDs.getRecord(res);
	var name=record.getValue('em.name');
	return name;
}