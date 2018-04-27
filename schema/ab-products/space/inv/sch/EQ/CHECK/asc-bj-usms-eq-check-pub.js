var controller=View.createController('checkForm',{
	checkMainId:"",
	afterInitialDataFetch: function(){
		$('btnAddCsi').value='增加';
		$('btnAddAllCsi').value='选择所有分类';
		$('btnRemoveCsi').value='清空所有';
		View.panels.get('EqCheckReportListByDvPanel').actions.get('exportXLS').setTitle('导出为Excel表格');
	},
	checkResFormPanel_onBtnAddRes: function(){
		this.checkPubPanel.show(true);
	    this.checkPubPanel.showInWindow({
	        width: 800,
	        height: 600
	    });
	},
	//关闭清查
	mainCheckFormPanel_onBtnClose: function(){
		var checkMainId=View.panels.get('mainCheckFormPanel').getFieldValue('eq_check_main.check_main_id');
		View.confirm('确定要强制关闭此次清查吗?',function(button){
			if(button=='yes'){
				
				var res=new Ab.view.Restriction();
				res.addClause('eq_check_main.check_main_id',checkMainId,'=');
				var checkMainDs=View.dataSources.get('ascBjUsmsEqCheckMainDs');
				var checkMainRecord=checkMainDs.getRecord(res);
				checkMainRecord.setValue('eq_check_main.is_done','2');
				checkMainDs.saveRecord(checkMainRecord);
				View.panels.get('mainCheckListFormPanel').refresh();
				View.alert('已成功关闭此次清查');
			}
		});
		
	},
	//清查归档
	mainCheckListFormPanel_onGuidang:function(){
		var d = new Date();
        var nowYear = d.getFullYear();
		var lastYear=nowYear-1;
		
		var hiStoryStu = View.dataSources.get("ascBjUsmsEqHistoryDs");
		var res=new Ab.view.Restriction();
		res.addClause('eq_history.year',lastYear,'=');
		var record1=hiStoryStu.getRecord(res);
		var eq_id=record1.getValue("eq_history.eq_id");
		if(valueExistsNotEmpty(eq_id)){
			View.showMessage(lastYear+"年清查任务已经归档,不可再次归档");
			return;
		}
		
		try {
	        result1 = Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-isGuiDang',lastYear);
	    }
	    catch (e) {
	        Workflow.handleError(e);
	        View.showMessage("操作失败，请联系管理员");
	    }
	    if(result1.code == 'executed'){
	    	if(result1.message=="1"){
				View.showMessage(lastYear+"年清查任务尚未全部完成，不可归档");
				return;
			}else{
				try {
			        result2 = Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-eqCheckGuiDang',lastYear);
			    }
			    catch (e) {
			        Workflow.handleError(e);
			        View.showMessage("操作失败，请联系管理员");
			    }
			    if(result2.code == 'executed'){
			    	View.showMessage(lastYear+"年清查任务归档完成");
			    }
			}
	    }
	    
	},
	//发布清查通知
	mainCheckFormPanel_onBtnApprove: function(){
		//将状态更改为‘未完成’
		var checkMainId=this.mainCheckFormPanel.getFieldValue('eq_check_main.check_main_id');
		var res=new Ab.view.Restriction();
		res.addClause('eq_check_main.check_main_id',checkMainId,'=');
		var checkMainDs=View.dataSources.get('ascBjUsmsEqCheckMainDs');
		
		//当清查批次中有未完成项时，不可执行发布清查操作
//		var ckRes=new Ab.view.Restriction();
//		ckRes.addClause('eq_check_main.is_done','1','=');
//		var ckRecord=checkMainDs.getRecord(ckRes);
//		if(!ckRecord.isNew){
//			View.alert('上次清查未结束,暂时不能发布新的清查 !');
//			return;
//		}
		
		var checkMainRecord=checkMainDs.getRecord(res);
		checkMainRecord.setValue('eq_check_main.is_done','1');
		//根据操作人的ID,得到name
		var emName="";
		var emId=View.user.employee.id;
		var emDs=View.dataSources.get('ascBjUsmsEmDs');
		var emRes=new Ab.view.Restriction();
		emRes.addClause('em.em_id',emId,'=');
		var emRecord=emDs.getRecord(emRes);
		if(!emRecord.isNew){
			emName=emRecord.getValue('em.name');
		}
		checkMainRecord.setValue('eq_check_main.pub_person',emName);
		//将与之对应的清查条件组成描述语句存入eq_check_main表中
		var resDescription="";
		var ResDs=View.dataSources.get('ascBjUsmsEqCheckResDs');
		var csiDs=View.dataSources.get('ascBjUsmsEqCsiDs');
		var ResCheck=new Ab.view.Restriction();
		ResCheck.addClause('eq_check_res.check_main_id',checkMainId,'=');
		var ResRecords=ResDs.getRecords(ResCheck);
		if(ResRecords.length==0){
			resDescription="清查全部设备";
		}else{
			//逐个取出其中的字段拼接成一个描述字段
			for(var i=0;i<ResRecords.length;i++){
				var record=ResRecords[i];
				var flds_name=record.getValue('eq_check_res.flds_name');
				var flds_res=record.getValue('eq_check_res.flds_res');
				if(flds_name=='dv_id'){
					resDescription=resDescription+'【设备所属单位】为【'+flds_res.toString()+'】;';
				}
				if(flds_name=='dp_id'){
					resDescription=resDescription+'【设备所属科室】为【'+flds_res.toString()+'】;';
				}
				if(flds_name=='eq_warehouse'){
					resDescription=resDescription+'【设备分库类型】为【'+flds_res.toString()+'】;';
				}
				if(flds_name=='is_label'){
					resDescription=resDescription+'【设备有无标签】为【'+flds_res.toString()+'】;';
				}
				if(flds_name=='bl_id'){
					resDescription=resDescription+'【设备所在建筑物】为【'+flds_res.toString()+'】;';
				}
				if(flds_name=='fl_id'){
					resDescription=resDescription+'【设备所在楼层】为【'+flds_res.toString()+'】;';
				}
				if(flds_name=='rm_id'){
					resDescription=resDescription+'【设备所在房间】为【'+flds_res.toString()+'】;';
				}
				if(flds_name=='date_from'){
					resDescription=resDescription+'【设备购置日期】大于等于【'+flds_res.toString()+'】;';
				}
				if(flds_name=='date_to'){
					resDescription=resDescription+'【设备购置日期】小于等于【'+flds_res.toString()+'】;';
				}
				if(flds_name=='csi_id'){
					var csiDescription=""
					var CsiList=flds_res;
					if(valueExistsNotEmpty(CsiList)){
						var csiArray=CsiList.split(',');
						for(var j=0;j<csiArray.length-1;j++){
							var csiDes=csiArray[j];
							//通过csiDes获取设备分类描述
							var csiRes=new Ab.view.Restriction();
							csiRes.addClause('csi.csi_id',csiDes,'=');
							var des=csiDs.getRecord(csiRes).getValue('csi.description');
							csiDescription+="'"+des+"' ";
						}
					}
					resDescription=resDescription+'【设备分类】包括【'+csiDescription+'】;';
				}
				if(flds_name=='price_from'){
					resDescription=resDescription+'【设备单价】大于等于【'+flds_res.toString()+'元】;'
				}
				if(flds_name=='price_to'){
					resDescription=resDescription+'【设备单价】小于等于【'+flds_res.toString()+'元】;'
				}
				
			}
		}
		checkMainRecord.setValue('eq_check_main.res_option',resDescription);
		
		View.confirm('发布之后此项将不可编辑，确定要发布吗?',function(button){
			if (button == 'yes') {
				checkMainDs.saveRecord(checkMainRecord);
				refreshMainForm();
				
				View.alert('清查通知发布成功');
				View.panels.get('mainCheckListFormPanel').refresh();
				disableButton();
			}
		});	
	},
	EqCheckReportListByDvPanel_onDownload:function(){
		var panel = this.EqCheckReportListByDvPanel;
		var selectedIndex = panel.selectedRowIndex;
		var dv_id = panel.rows[selectedIndex]["eq_check_report.dv_id"];
		var dp_id = panel.rows[selectedIndex]["eq_check_report.dp_id"];		
		try {			
			//var jobId = Workflow.startJob('AbSystemAdministration-EqInventoryPlan-exportEqInventoryCheckList',"asc-bj-usms-eq-check-list-wq.axvw", "eq_attach_ds","attach");
			var jobId = Workflow.startJob('AbSpaceRoomInventoryBAR-EqInventoryDownload-exportEqInventoryCheckList',"asc-bj-usms-eq-check-pub.axvw", dv_id,dp_id,this.checkMainId);
			//var jobId = Workflow.startJob('AbSystemAdministration-EqInventoryPlan-exportEqInventoryCheckList',checkMainId, dv_id,dp_id);
			var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
            View.openDialog(url);
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	mainCheckListFormPanel_afterRefresh: function(){
		//查询eq_check_main表，如果表中存在未发布的记录，则新的发布功能按钮失效置灰
//		var eqCheckMainDs=View.dataSources.get('ascBjUsmsEqCheckMainDs');
//		var res=new Ab.view.Restriction();
//		res.addClause('eq_check_main.is_done','0','=',"OR");
//		res.addClause('eq_check_main.is_done','1','=','OR');
//		var eqCheckMainRecord=eqCheckMainDs.getRecord(res);
//		if(!eqCheckMainRecord.isNew){
//			this.mainCheckListFormPanel.actions.get('btnAddNew').forceDisable(true);
//		}else{
//			this.mainCheckListFormPanel.actions.get('btnAddNew').forceDisable(false);
//		}
	},
	//修改清查条件
	checkResFormPanel_onBtnEditeRes: function(){
		//将列表中的项填入弹出窗体相应的位置中
		this.checkPubPanel.show(true);
	    this.checkPubPanel.showInWindow({
	        width: 800,
	        height: 600
	    });
	    this.checkPubPanel.clear();
	    var checkPubPanel=View.panels.get('checkPubPanel');
		var gridRows=this.checkResFormPanel.gridRows;
		for(var i=0;i<gridRows.length;i++){
			var rowRecord=gridRows.get(i).getRecord();
			var flds_name=rowRecord.getValue('eq_check_res.flds_name');
			var flds_res=rowRecord.getValue('eq_check_res.flds_res');
			
			if(flds_name=='dv_id'){
				var dvField=flds_res.split("-");
				checkPubPanel.setFieldValue('eq.dv_id',dvField[0]);
				checkPubPanel.setFieldValue('dv.dv_name',dvField[1]);
			}
			if(flds_name=='dp_id'){
				var dpField=flds_res.split("-");
				checkPubPanel.setFieldValue('eq.dp_id',dpField[0]);
				checkPubPanel.setFieldValue('dp.dp_name',dpField[1]);
			}
			if(flds_name=='eq_warehouse'){
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
				checkPubPanel.setFieldValue('eq.eq_warehouse',warehouse);
			}
			if(flds_name=='is_label'){
				var label;
	    		if(flds_res=="无"){
	    			label="0";
	    		}else if(flds_res=="有"){
	    			label="1";
	    		}
				checkPubPanel.setFieldValue('eq.is_label',label);
			}
			if(flds_name=='bl_id'){
				checkPubPanel.setFieldValue('eq.bl_id',flds_res);
			}
			if(flds_name=='fl_id'){
				checkPubPanel.setFieldValue('eq.fl_id',flds_res);
			}
			if(flds_name=='rm_id'){
				checkPubPanel.setFieldValue('eq.rm_id',flds_res);
			}
			if(flds_name=='date_from'){
				checkPubPanel.setFieldValue('date_from',flds_res);
			}
			if(flds_name=='date_to'){
				checkPubPanel.setFieldValue('date_to',flds_res);
			}
			if(flds_name=='csi_id'){
				document.getElementById('csi_list_txt').innerHTML=flds_res;
			}
			if(flds_name=='price_from'){
				checkPubPanel.setFieldValue('price_from',flds_res);
			}
			if(flds_name=='price_to'){
				checkPubPanel.setFieldValue('price_to',flds_res);
			}
		}
	},
	checkPubPanel_onBtnAdd: function(){
		var dv_id=this.checkPubPanel.getFieldValue('eq.dv_id');
		var dv_name=this.checkPubPanel.getFieldValue('dv.dv_name');
		var dp_id=this.checkPubPanel.getFieldValue('eq.dp_id');
		var dp_name=this.checkPubPanel.getFieldValue('dp.dp_name');
		var eq_warehouse=this.checkPubPanel.getFieldValue('eq.eq_warehouse');
		var is_label=this.checkPubPanel.getFieldValue('eq.is_label');
		var bl_id=this.checkPubPanel.getFieldValue('eq.bl_id');
		var fl_id=this.checkPubPanel.getFieldValue('eq.fl_id');
		var rm_id=this.checkPubPanel.getFieldValue('eq.rm_id');
		var dateFrom=this.checkPubPanel.getFieldValue('date_from');
		var dateTo=this.checkPubPanel.getFieldValue('date_to');
		var csiIdList=document.getElementById('csi_list_txt').innerHTML;
		//var typeUse=this.checkPubPanel.getFieldValue('eq.type_use');
		var priceFrom=this.checkPubPanel.getFieldValue('price_from');
		var priceTo=this.checkPubPanel.getFieldValue('price_to');
		
		
		//先在eq_check_main中插入一条新记录
		
//			//检查目前eq_check_main表中是否有未关闭的记录，有则提示关闭
//			var eqCheckMainDs=View.dataSources.get('ascBjUsmsEqCheckMainDs');
//			var checkMainRes=new Ab.view.Restriction();
//			checkMainRes.addClause('eq_check_main.is_done','1','=');
//			var checkMainRecord=eqCheckMainDs.getRecord(checkMainRes);
//			if(!checkMainRecord.isNew){
//				View.alert('上次清查尚未关闭,请先关闭上次清查');
//				return;
//			}
		//根据eq_check_main中的记录Id,在eq_check_res中插入一条记录
		//取出eq_check_main中的主键
    	var eqCheckResDs=View.dataSources.get('ascBjUsmsEqCheckResDs');
    	var eqCheckMainId=this.mainCheckFormPanel.getFieldValue('eq_check_main.check_main_id');
    	
    	//存入设备所在单位
    	if(valueExistsNotEmpty(dv_id)){
    		
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'dv_id');
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','dv_id');
            	checkResRecord.setValue('eq_check_res.flds_res',dv_id+"-"+dv_name);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【所在单位】为');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',dv_id+"-"+dv_name);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'dv_id');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备所在科室
    	if(valueExistsNotEmpty(dp_id)){
    		
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'dp_id');
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','dp_id');
            	checkResRecord.setValue('eq_check_res.flds_res',dp_id+"-"+dp_name);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【所在科室】为');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',dp_id+"-"+dp_name);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'dp_id');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备的分库类型
    	if(valueExistsNotEmpty(eq_warehouse)){
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'eq_warehouse');
    		var warehouse;
    		if(eq_warehouse=="1"){
    			warehouse="设备";
    		}else if(eq_warehouse=="2"){
    			warehouse="行政";
    		}else if(eq_warehouse=="3"){
    			warehouse="易耗品";
    		}else if(eq_warehouse=="4"){
    			warehouse="软件";
    		}else if(eq_warehouse=="5"){
    			warehouse="工程";
    		}else if(eq_warehouse=="6"){
    			warehouse="其他";
    		}else if(eq_warehouse=="7"){
    			warehouse="图书";
    		}
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','eq_warehouse');
            	checkResRecord.setValue('eq_check_res.flds_res',warehouse);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【分库类型】为');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',warehouse);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'eq_warehouse');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备有无标签
    	if(valueExistsNotEmpty(is_label)){
    		
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'is_label');
    		var label;
    		if(is_label=="0"){
    			label="无";
    		}else{
    			label="有";
    		}
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','is_label');
            	checkResRecord.setValue('eq_check_res.flds_res',label);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备有无标签】：');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',label);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'is_label');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备所在建筑物
    	if(valueExistsNotEmpty(bl_id)){
    		
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'bl_id');
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','bl_id');
            	checkResRecord.setValue('eq_check_res.flds_res',bl_id);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备所在建筑物】为');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',bl_id);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'bl_id');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备所在楼层
    	if(valueExistsNotEmpty(fl_id)){
    		
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'fl_id');
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','fl_id');
            	checkResRecord.setValue('eq_check_res.flds_res',fl_id);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备所在楼层】为');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',fl_id);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'fl_id');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备所在房间
    	if(valueExistsNotEmpty(rm_id)){
    		
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'rm_id');
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','rm_id');
            	checkResRecord.setValue('eq_check_res.flds_res',rm_id);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备所在房间】为');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',rm_id);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'rm_id');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备入库开始时间
    	if(valueExistsNotEmpty(dateFrom)){
    		
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'date_from');
    		if(checkResRecord.isNew){
    			checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','date_from');
            	checkResRecord.setValue('eq_check_res.flds_res',dateFrom);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备购置日期】大于等于');
    		}else{
    			checkResRecord.setValue('eq_check_res.flds_res',dateFrom);
    		}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'date_from');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备入库结束时间
    	if(valueExistsNotEmpty(dateTo)){
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'date_to');
        	if(checkResRecord.isNew){
        		checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','date_to');
            	checkResRecord.setValue('eq_check_res.flds_res',dateTo);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备购置日期】小于等于');
        	}else{
    			checkResRecord.setValue('eq_check_res.flds_res',dateTo);
    		}
        	
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'date_to');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备分类编码列表
    	if(valueExistsNotEmpty(csiIdList)){
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'csi_id');
        	if(checkResRecord.isNew){
        		checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','csi_id');
            	checkResRecord.setValue('eq_check_res.flds_res',csiIdList);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【资产分类】包含');
        	}else{
    			checkResRecord.setValue('eq_check_res.flds_res',csiIdList);
    		}
        	
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'csi_id');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备价格开始
    	if(valueExistsNotEmpty(priceFrom)){
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'price_from');
        	if(checkResRecord.isNew){
        		checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','price_from');
            	checkResRecord.setValue('eq_check_res.flds_res',priceFrom);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备单价】大于等于');
        	}else{
        		checkResRecord.setValue('eq_check_res.flds_res',priceFrom);
        	}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'price_from');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	
    	//存入设备价格结束
    	if(valueExistsNotEmpty(priceTo)){
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'price_to');
        	if(checkResRecord.isNew){
        		checkResRecord.setValue('eq_check_res.check_main_id',eqCheckMainId);
        		checkResRecord.setValue('eq_check_res.flds_name','price_to');
            	checkResRecord.setValue('eq_check_res.flds_res',priceTo);
            	checkResRecord.setValue('eq_check_res.flds_name_desc','【设备单价】小于等于');
        	}else{
        		checkResRecord.setValue('eq_check_res.flds_res',priceTo);
        	}
        	eqCheckResDs.saveRecord(checkResRecord);
    	}else{
    		var checkResRecord=checkAreadyExits(eqCheckMainId,'price_to');
    		if(!checkResRecord.isNew){
    			eqCheckResDs.deleteRecord(checkResRecord);
    		}
    	}
    	this.checkResFormPanel.refresh();
    	View.alert('已经成功添加清查条件');
    	View.panels.get('checkPubPanel').closeWindow();
    	View.panels.get("mainCheckFormPanel").actions.get('btnSave').enable(true);
	}
});

function showSelectDetail(value){
	var mainCheckFormPanel=View.panels.get('mainCheckFormPanel');
	var checkResFormPanel=View.panels.get('checkResFormPanel');
	
	var mainId=value.restriction['eq_check_main.check_main_id'];
	controller.checkMainId=mainId;
	var mainDs=View.dataSources.get('ascBjUsmsEqCheckMainDs');
	var mainStatus=mainDs.getRecord(value.restriction).getValue('eq_check_main.is_done');
	mainCheckFormPanel.refresh(value.restriction,false);
	var res=new Ab.view.Restriction();
	res.addClause('eq_check_res.check_main_id',mainId,'=');
	checkResFormPanel.show(true);
	checkResFormPanel.refresh(res);
	
	var uploadFiled=mainCheckFormPanel.fields.items[4];
	uploadFiled.actions.get('mainCheckFormPanel_eq_check_main.check_doc_checkOutDocument').show(false);
	uploadFiled.actions.get('mainCheckFormPanel_eq_check_main.check_doc_lockDocument').show(false);
	uploadFiled.actions.get('mainCheckFormPanel_eq_check_main.check_doc_checkInNewDocumentVersion').show(false);
	//uploadFiled.actions.get('mainCheckFormPanel_eq_check_main.check_doc_checkInNewDocument').show(false);
	
	if(mainStatus!='0'){
		//禁用关闭清查按钮
		View.panels.get('mainCheckFormPanel').actions.get('btnClose').enable(true);
		uploadFiled.actions.get('mainCheckFormPanel_eq_check_main.check_doc_deleteDocument').show(false);
		mainCheckFormPanel.actions.get('btnSave').forceDisable(true);
		checkResFormPanel.actions.get('btnEditeRes').enable(false);
		mainCheckFormPanel.actions.get('btnApprove').enable(false);
		//mainCheckFormPanel.enableField('eq_check_main.check_doc',false);
		var gridRows=checkResFormPanel.gridRows;
		for(var i=0;i<gridRows.length;i++){
			gridRows.get(i).actions.get('btnDelete').enable(false);
		}
	}else{
		View.panels.get('mainCheckFormPanel').actions.get('btnClose').enable(false);
		uploadFiled.actions.get('mainCheckFormPanel_eq_check_main.check_doc_deleteDocument').show(true);
		mainCheckFormPanel.actions.get('btnSave').forceDisable(false);
		checkResFormPanel.actions.get('btnEditeRes').enable(true);
		mainCheckFormPanel.actions.get('btnApprove').enable(true);
		//mainCheckFormPanel.enableField('eq_check_main.check_doc',true);
		
		var gridRows=checkResFormPanel.gridRows;
		for(var i=0;i<gridRows.length;i++){
			gridRows.get(i).actions.get('btnDelete').enable(true);
		}
	}
	
	var checkReportRes=new Ab.view.Restriction();
	var checkName=mainDs.getRecord(value.restriction).getValue('eq_check_main.check_name');
	
	checkReportRes.addClause('eq_check_report.check_main_id',mainId,'=');
	View.panels.get('EqCheckReportListByDvPanel').show(true);
	View.panels.get('EqCheckReportListByDvPanel').refresh(checkReportRes);
	View.panels.get('EqCheckReportListByDvPanel').setTitle(checkName+' 各清查单位列表');
	View.panels.get('mainCheckFormPanel').actions.get('btnSave').enable(true);
}

function toAddCsi(){
	var checkPubPanel=View.panels.get('checkPubPanel');
	var csiId=checkPubPanel.getFieldValue('eq.csi_id');
	if(!valueExistsNotEmpty(csiId)){
		View.alert('请选择分类编码后执行此操作 ! ');
		return;
	}
	var cisList=document.getElementById('csi_list_txt').innerHTML;
	cisList=cisList+csiId+',';
	document.getElementById('csi_list_txt').innerHTML=cisList;
	checkPubPanel.setFieldValue('eq.csi_id','');
}

function toChoseAll(){
	var checkPubPanel=View.panels.get('checkPubPanel');
//	var csiList="";
//	for(var i=1;i<17;i++){
//		var csiS=i.toString();
//		if(i<10){
//			csiS='0'+csiS;
//		}
//		csiS=csiS+'000000'+',';
//		csiList=csiList+csiS;
//	}
	
	document.getElementById('csi_list_txt').innerHTML="0,";
	checkPubPanel.enableField('eq.csi_id',false);
}

function toRemoveAll(){
	var checkPubPanel=View.panels.get('checkPubPanel');
	document.getElementById('csi_list_txt').innerHTML="";
	checkPubPanel.enableField('eq.csi_id',true);
}

//验证是否列表中已经存在
function checkAreadyExits(id,flds_name){
	var checkId="";
	var ascBjUsmsEqCheckResDs=View.dataSources.get('ascBjUsmsEqCheckResDs');
	var res=new Ab.view.Restriction();
	res.addClause('eq_check_res.check_main_id',id,'=');
	res.addClause('eq_check_res.flds_name',flds_name,'=');
	var resRecord=ascBjUsmsEqCheckResDs.getRecord(res);
	return resRecord;
}

//删除指定的清查条件
function toDeleteRes(value){
	var resDs=View.dataSources.get('ascBjUsmsEqCheckResDs');
	var resRecord=resDs.getRecord(value.restriction);
	if(!resRecord.isNew){
		resDs.deleteRecord(resRecord);
	}
	View.panels.get('checkResFormPanel').refresh();
}

//保存后刷新批次列表panel
function refreshMainForm(){
	View.panels.get('mainCheckListFormPanel').refresh();
	var checkResFormPanel=View.panels.get('checkResFormPanel');
	
	//var eqCheckPanel=View.panels.get('eqCheckPanel');
	var EqCheckReportListByDvPanel=View.panels.get('EqCheckReportListByDvPanel');
	var mainCheckFormPanel=View.panels.get('mainCheckFormPanel');
	var mainId=mainCheckFormPanel.getFieldValue('eq_check_main.check_main_id');
	var res=new Ab.view.Restriction();
	res.addClause('eq_check_res.check_main_id',mainId,'=');
	checkResFormPanel.show(true);
	checkResFormPanel.refresh(res);
	
	//刷新各单位统计列表
	try{
		
		var result=Workflow.callMethod('AbAssetManagement-EquipmentCheck-createCheckReport',''+mainId);
		
	}catch(e){
		Workflow.handleError(e); 
		View.alert("对不起，工作流执行失败!");
	}
	
	var reportRes=new Ab.view.Restriction();
	reportRes.addClause('eq_check_report.check_main_id',mainId,'=');
	View.panels.get('EqCheckReportListByDvPanel').show(true);
	View.panels.get('EqCheckReportListByDvPanel').refresh(reportRes);
	var checkName=mainCheckFormPanel.getFieldValue('eq_check_main.check_name');
	
	EqCheckReportListByDvPanel.setTitle(checkName+' 各清查单位列表');
	mainCheckFormPanel.actions.get('btnSave').enable(false);
}

//禁用所有控件
function disableButton(){
	var mainCheckFormPanel=View.panels.get('mainCheckFormPanel');
	var checkResFormPanel=View.panels.get('checkResFormPanel');
	
	mainCheckFormPanel.actions.get('btnSave').enable(false);
	checkResFormPanel.actions.get('btnEditeRes').enable(false);
	mainCheckFormPanel.actions.get('btnApprove').enable(false);
	mainCheckFormPanel.enableField('eq_check_main.check_doc',false);
	var gridRows=checkResFormPanel.gridRows;
	for(var i=0;i<gridRows.length;i++){
		gridRows.get(i).actions.get('btnDelete').enable(false);
	}
}

//当点击添加新清查时，保存按钮生效
function showBtnAction(){
	var mainCheckFormPanel=View.panels.get('mainCheckFormPanel');
	mainCheckFormPanel.actions.get('btnSave').enable(true);
}


