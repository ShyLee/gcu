var checkListFormController=View.createController('checkListFormController',{
	check_main_id: null,
	progressControl:null,
	dv_id:"",
	dp_id:"",
	record:{},
	resEqAR:"",
	resEqAR2:"",
	resEqR:"",
	resEqR2:"",
	afterInitialDataFetch: function(){
		this.onStart();
	},
	onStart:function(){
		//界面打开后 自动加载第一条数据
		if(this.eqCheckMainPanel.rows.length>0){
			var check_main_id = this.eqCheckMainPanel.rows[0]["eq_check_main.check_main_id"];
			this.check_main_id_onClick(check_main_id);
			this.check_main_id = check_main_id;
		}
	},
	eqCheckMainPanel_check_name_onClick: function(row){
		var check_main_id = row.getFieldValue("eq_check_main.check_main_id");
		this.check_main_id_onClick(check_main_id);
		this.check_main_id = check_main_id;
	},
	mainPanel_onFinish:function(){
		var dsEqCheckMain = View.dataSources.get("ascBjUsmsEqCheckMainDs");
		var message="确定完成清查";
		var controller=this;
		View.confirm(message,function(button){
		    if(button=="yes"){
		    	var res=new Ab.view.Restriction();
		    	res.addClause('eq_check_main.check_main_id',controller.check_main_id,'=');
		    	var record=dsEqCheckMain.getRecord(res);
		    	record.setValue("eq_check_main.is_done", "4");
		    	dsEqCheckMain.saveRecord(record);
		    	controller.eqCheckMainPanel.refresh();
		    	controller.onStart();
		    	View.showMessage('操作成功');
		    }else{
		     
		    }
		});		
	},
	mainPanel_dv_name_onClick:function(row){
		var check_main_id = row.getFieldValue("eq_check_report.check_main_id");
		var dv_id = row.getFieldValue("eq_check_report.dv_id");
		this.dv_id=dv_id;
		var dp_id = row.getFieldValue("eq_check_report.dp_id");
		this.dp_id=dp_id;
		var res1 = this.getCheckRestriction(check_main_id,"eq");
		var res2 = this.getCheckRestriction(check_main_id,"eq_attach");
		var res3 = new Ab.view.Restriction();
		if(dv_id !=""){
			res1.addClause('eq.dv_id',dv_id,'=');
			res3.addClause('eq_attach.dv_id',dv_id,'=');
		}
		if(dp_id !=""){
			res1.addClause('eq.dp_id',dp_id,'=');
			res3.addClause('eq_attach.dp_id',dp_id,'=');
		}else{
			res1.addClause('eq.dp_id',"","IS NULL");
			res3.addClause('eq_attach.dp_id',"","IS NULL");
			res2=res2+" and eq.dp_id IS NULL";
		}
		this.resEqR=res1;
		this.eqListPanel.refresh(res1);
		res2=res2+")";
		this.resEqAR=res2;
		this.eqAttachPanel.addParameter('eqId', res2);
		this.eqAttachPanel.refresh();
	},
	eqAttachPanel_onDownload:function(){
			try {						
				var jobId = Workflow.startJob('AbSpaceRoomInventoryBAR-EqInventoryDownload-exportEqInventoryCheckList',"asc-bj-usms-eq-check-scanning-list-wq.axvw", this.dv_id,this.dp_id,this.check_main_id,"eq_attach");
				var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
	            View.openDialog(url);
			} catch (e) {
				Workflow.handleError(e);
			}
		
	},
	eqAttachPanel_onImportTaskData:function(){
		  View.openDialog("asc-bj-usms-eq-import.axvw","eq_attch",null,{width:500,table:"eq_attach",height:300});
	},
	eqListPanel_onImportTaskData:function(){
		  View.openDialog("asc-bj-usms-eq-import.axvw","eq",null,{width:500,table:"eq",height:300});
	},
	eqListPanel_onDownload:function(){
		try {						
			var jobId = Workflow.startJob('AbSpaceRoomInventoryBAR-EqInventoryDownload-exportEqInventoryCheckList',"asc-bj-usms-eq-check-scanning-list-wq.axvw", this.dv_id,this.dp_id,this.check_main_id,"eq");
			var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
            View.openDialog(url);
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	check_main_id_onClick: function(check_main_id){
		//如果清查已完成，则无法进行报失等操作
		this.eqAndAttachTabs.selectTab("eqTab");
		
		var res = new Ab.view.Restriction();
		var res2 = new Ab.view.Restriction();
		var resAttach = new Ab.view.Restriction();
		res.addClause('eq_check_report.check_main_id',check_main_id,'=');
		res2.addClause('eq_check.check_main_id',check_main_id,'=');
		
		resAttach.addClause('eq_check_attach.check_main_id',check_main_id,'=');
		
		var res4 = new Ab.view.Restriction();
		res4.addClause('eq_check_report.check_main_id',check_main_id,'=');
		this.mainPanel.refresh(res4);
		
		if(this.mainPanel.rows.length>0){
			var row=this.mainPanel.rows[0];
			var dv_id = row["eq_check_report.dv_id"];
			this.dv_id=dv_id;
			var dp_id = row["eq_check_report.dp_id"];
			this.dp_id=dp_id;
			var res3 = this.getCheckRestriction(check_main_id,"eq");
			var res5 = this.getCheckRestriction(check_main_id,"eq_attach");
			if(dv_id !=""){
				res3.addClause('eq.dv_id',dv_id,'=');
			}
			if(dp_id !=""){
				res3.addClause('eq.dp_id',dp_id,'=');
			}else{
				res3.addClause('eq.dp_id',"","IS NULL");
				res5=res5+" and eq.dp_id IS NULL";
			}
			//此处添加刷新设备表的筛选项
			this.resEqR2=res3;
			this.eqListPanel.refresh(res3);
						
			res5=res5+")";
			this.resEqAR2=res5;
			this.eqAttachPanel.addParameter('eqId', res5);
			this.eqAttachPanel.refresh();
		}
	},
	eqListPanel_onChange:function(){
		var record = {};
		var selectedPrimaryKeys = this.eqListPanel.getSelectedRecords();
		if(selectedPrimaryKeys.length>0){
			for (var i = 0; i < selectedPrimaryKeys.length; i++) {
				var row = selectedPrimaryKeys[i];   
				record['eq.id'+i] = row.values["eq.eq_id"];
			}
			this.record=record;
			
			this.eq_tishi.showInWindow({
			      x:300,
			      y:300,
			      width: 400,
			      height: 200
			});			
		}else{
			View.showMessage('请选择需要更改状态的数据');
			return;
		}
		
	},
	eqAttachPanel_onChange:function(){
		var record = {};
		var selectedPrimaryKeys = this.eqAttachPanel.getSelectedRecords();
		if(selectedPrimaryKeys.length>0){
			for (var i = 0; i < selectedPrimaryKeys.length; i++) {
				var row = selectedPrimaryKeys[i];   
				record['eq_attach.id'+i] = row.values["eq_attach.eq_attach_id"];
			}
			this.record=record;
			
			this.eq_attach_tishi.showInWindow({
			      x:300,
			      y:300,
			      width: 400,
			      height: 200
			});			
		}else{
			View.showMessage('请选择需要更改状态的数据');
			return;
		}
		
	},
	eq_tishi_onSave:function(){
		var status=this.eq_tishi.getFieldValue("eq.check_status");
		try {
            var result= Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-EditEqChechStatus', this.record,status);
            
		} catch (e) {
            Workflow.handleError(e);
            View.showMessage('工作流失败');
        }
        if(result.code == 'executed'){
    		if(this.resEqR!=""){
    			this.eqListPanel.addParameter('eqId', this.resEqR);
    		}else{
    			this.eqListPanel.addParameter('eqId', this.resEqR2);
    		}
    		this.eqListPanel.refresh();  
//        	var res=new Ab.view.Restriction();
//			res.addClause('eq.dv_id',this.dv_id,'=');
//			res.addClause('eq.dp_id',this.dp_id,'=');
//            this.eqListPanel.refresh(res);       	
        	this.eq_tishi.closeWindow();
        	View.showMessage("操作成功");
        }
	},
	eq_attach_tishi_onSave:function(){
		var status=this.eq_attach_tishi.getFieldValue("eq_attach.check_status");
		try {
            var result= Workflow.callMethod('AbSpaceRoomInventoryBAR-EqQuantityEditValue-EditEqAttachChechStatus', this.record,status);
            
		} catch (e) {
            Workflow.handleError(e);
            View.showMessage('工作流失败');
        }
        if(result.code == 'executed'){
    		if(this.resEqR!=""){
    			this.eqListPanel.addParameter('eqId', this.resEqR);
    		}else{
    			this.eqListPanel.addParameter('eqId', this.resEqR2);
    		}
    	this.eqListPanel.refresh();  
//        	var res=new Ab.view.Restriction();
//			res.addClause('eq_attach.dv_id',this.dv_id,'=');
//			res.addClause('eq_attach.dp_id',this.dp_id,'=');
//            this.eqAttachPanel.refresh(res);       	
        	this.eq_attach_tishi.closeWindow();
        	View.showMessage("操作成功");
        }
	},
	eqListPanel_onRefresh:function(){
		if(this.resEqR!=""){
			this.eqListPanel.addParameter('eqId', this.resEqR);
		}else{
			this.eqListPanel.addParameter('eqId', this.resEqR2);
		}
		this.eqListPanel.refresh();  
		View.alert("刷新成功");
//		var res=new Ab.view.Restriction();
//		res.addClause('eq.dv_id',this.dv_id,'=');
//		res.addClause('eq.dp_id',this.dp_id,'=');
//        this.eqListPanel.refresh(res);  
	},
	eqAttachPanel_onRefresh:function(){
		
		if(this.resEqAR!=""){
			this.eqAttachPanel.addParameter('eqId', this.resEqAR);
		}else{
			this.eqAttachPanel.addParameter('eqId', this.resEqAR2);
		}
//		this.eqAttachPanel.refresh();    
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach.dv_id',this.dv_id,'=');
		res.addClause('eq_attach.dp_id',this.dp_id,'=');
        this.eqAttachPanel.refresh(res);    
        View.alert("刷新成功");
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
			return str;
		}		
	}
});

