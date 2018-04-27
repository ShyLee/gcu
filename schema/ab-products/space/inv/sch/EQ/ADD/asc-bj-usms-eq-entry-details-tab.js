var ascBjUsmsProcAsgnApproveReqApproveTabController = View.createController("ascBjUsmsProcAsgnApproveReqApproveTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    
	record: null,
	
    afterInitialDataFetch: function(){
    	
        this.tabs = View.getControlsByType(parent, 'tabs')[0];
		
		this.selectBasicFormByRequestType();
		
        //this.ascBjUsmsProcAsgnApproveReqApproveTabDestricptionForm.setRecord(this.record);
        
        var red=this.record;
    	var addEqId = red.getValue('activity_log.add_eq_id');
    	var restriction=new Ab.view.Restriction();
		    restriction.addClause("add_eq.add_eq_id",addEqId,"=");
		this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.refresh(restriction);
		
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldElement('activity_log.approved_by').disabled = true;
    },
    
	selectBasicFormByRequestType: function(){
        if (this.tabs.requestType != '房屋分配-项目用房') {
            
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.refresh(this.tabs.approveTabrestriction);
            this.record = this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getRecord();
        }
        else {
            this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.show(false);
        }
    },
       ascBjUsmsProcAsgnApproveReqApproveTabForm1_afterRefresh: function(){
        USMS_showBaseInfoOfUserOrProject(this.ascBjUsmsProcAsgnApproveReqApproveTabForm1,false);
    },   
	
    onBack: function(){
    	View.getWindow('parent').View.setTitle("设备入库-入库请求列表");
        //select next tab and reload the tab view
        var tabName = 'selectTab';
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
    },
	//审批信息
    onShowApproveWindow: function(){
        $("comments").value = '';
        var role=View.user.role;
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.refresh(this.tabs.approveTabrestriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.showInWindow({
            width: 800,
            height: 300
        })
    },
    //显示报增设备分配列表
    onShowEqAddListWindow: function(){
    	var restriction=new Ab.view.Restriction();
    	var addEqId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.add_eq_id');
            restriction.addClause("add_eq_list.add_eq_id",addEqId,"=");
        this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.refresh(restriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabEqListGrid.showInWindow({
            width: 800,
            height: 300
        })
    },
    //显示预算项详细信息
    onShowBudgetDetailsWindow: function(){
    	var restriction=new Ab.view.Restriction();
	  
    	var budgetItemId = this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.budget_item_id');
            restriction.addClause("eq_budget_item.budget_item_id",budgetItemId,"=");
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.refresh(restriction);
        this.ascBjUsmsProcAsgnApproveReqApproveTabBudgetItemGrid.showInWindow({
            width: 800,
            height: 300
        })
    },
    
    
    getRecord: function(){
        var record = {};
        record['activity_log.activity_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.activity_log_id');
        record['activity_log.approved_by'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log.approved_by');
        record['activity_log_step_waiting.step_log_id'] = this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.getFieldValue('activity_log_step_waiting.step_log_id');
        return record;
    },
    
    closeApproveWindow: function(isReject){
        this.ascBjUsmsProcAsgnApproveReqApproveTabApproveForm.closeWindow();
        this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.actions.get('approve').enable(false);
		
		
	
    },
    //将报增的设备入库
    ascBjUsmsProcAsgnApproveReqApproveTabForm1_onBtnEntry: function(){
    	//获取此报增单下的设备项
    	var eqIdList=new Array();
    	var addEqId=this.ascBjUsmsProcAsgnApproveReqApproveTabAddInfoForm.getFieldValue('add_eq.add_eq_id');
    	var addEqDs=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabAddFormDS');
    	var addEqRes=new Ab.view.Restriction();
    	addEqRes.addClause('add_eq.add_eq_id',addEqId,'=');
    	var record = new Ab.data.Record();
    	record.isNew=true;
    	var addEqRecord=addEqDs.getRecord(addEqRes);
    	
    	var addEqListDs=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabEqListDS');
    	var addEqListRes=new Ab.view.Restriction();
    	addEqListRes.addClause('add_eq_list.add_eq_id',addEqId);
    	var addEqListRecords=addEqListDs.getRecords(addEqListRes);
    	if(!addEqRecord.isNew){
    		
    		record.setValue('eq.eq_id',addEqRecord.set)
   		    record.setValue('eq.eq_name',addEqRecord.getValue('add_eq.eq_name'));
    		record.setValue('eq.brand',addEqRecord.getValue('add_eq.brand'));
    		record.setValue('eq.vn_id',addEqRecord.getValue('add_eq.vn_id'));
    		record.setValue('eq.eq_type',addEqRecord.getValue('add_eq.eq_type'));
    		record.setValue('eq.eq_std',addEqRecord.getValue('add_eq.eq_std'));
    		record.setValue('eq.price',addEqRecord.getValue('add_eq.price'));
    		record.setValue('eq.unit',addEqRecord.getValue('add_eq.units'));
    		record.setValue('eq.source',addEqRecord.getValue('add_eq.source'));
    		record.setValue('eq.ctry_name',addEqRecord.getValue('add_eq.ctry_name'));
    		record.setValue('eq.ctry_id',addEqRecord.getValue('add_eq.ctry_id'));
    		record.setValue('eq.dv_id',addEqRecord.getValue('add_eq.dv_id'));
    		record.setValue('eq.servcont_id',addEqRecord.getValue('add_eq.supplier_agreement_id'));
    		//对事件字段进行非空判断
    		var dateManufactured=addEqRecord.getValue('add_eq.date_manufactured');
    		if(valueExistsNotEmpty(dateManufactured)){
    			record.setValue('eq.date_manufactured',dateManufactured.format('Y-m-d'));
    		}else{
    			record.setValue('eq.date_manufactured',dateManufactured);
    		}
    		var datePurchased=addEqRecord.getValue('add_eq.date_purchased');
    		if(valueExistsNotEmpty(dateManufactured)){
    			record.setValue('eq.date_purchased',datePurchased.format('Y-m-d'));
    		}else{
    			record.setValue('eq.date_purchased',datePurchased);
    		}
    		
    		record.setValue('eq.type_use',addEqRecord.getValue('add_eq.type_use'));
    		record.setValue('eq.csi_id',addEqRecord.getValue('add_eq.csi_id'));
    		record.setValue('eq.eq_name',addEqRecord.getValue('add_eq.eq_name'));
    		
    		if(addEqListRecords.length<=0){
        		View.alert("该报增单下无报增设备项，无法执行入库操作！");
        		return;
        	}else{
        		for(var i=0;i<addEqListRecords.length;i++){
        			var addEqListRecord=addEqListRecords[i];
        			
        			var eqId=createPrimaryKey('eq','eq_id',"");
        			record.setValue('eq.eq_id',eqId);
            		record.setValue('eq.bl_id',addEqListRecord.getValue('add_eq_list.bl_id'));
            		record.setValue('eq.fl_id',addEqListRecord.getValue('add_eq_list.fl_id'));
            		record.setValue('eq.rm_id',addEqListRecord.getValue('add_eq_list.rm_id'));
            		record.setValue('eq.em_id',addEqListRecord.getValue('add_eq_list.em_id'));
            		record.setValue('eq.attachments_num',addEqListRecord.getValue('add_eq_list.attachments_num'));
            		record.setValue('eq.attachments_price',addEqListRecord.getValue('add_eq_list.attachments_price'));
            		record.setValue('eq.subject_funds',addEqListRecord.getValue('add_eq_list.subject_funds'));
            		record.setValue('eq.handling_em',addEqListRecord.getValue('add_eq_list.handling_em'));
            		record.setValue('eq.image_file',addEqListRecord.getValue('add_eq_list.image_file'));
            		record.setValue('eq.sci_resh_id',addEqListRecord.getValue('add_eq_list.sci_resh_id'));
            		record.setValue('eq.danju_id',addEqListRecord.getValue('add_eq_list.danju_id'));
            		record.setValue('eq.approved',addEqListRecord.getValue('add_eq_list.approved'));
            		record.setValue('eq.comments',addEqListRecord.getValue('add_eq_list.comments'));
            		record.setValue('eq.approved_fiance',addEqListRecord.getValue('add_eq_list.approved_fiance'));
            		var dateFinApproved=addEqListRecord.getValue('add_eq_list.date_fin_approved');
            		if(valueExistsNotEmpty(dateFinApproved)){
            			record.setValue('eq.date_fin_approved',dateFinApproved.format('Y-m-d'));
            		}
            		else{
            			record.setValue('eq.date_fin_approved',dateFinApproved);
            		}
            		
            		record.setValue('eq.approved_by_fin',addEqListRecord.getValue('add_eq_list.approved_by_fin'));
            		record.setValue('eq.sch_status','1');
            		
            		//将record作为参数传到workflow rule中，进行保存
            		
            		try{
            			var result=Workflow.callMethod('AbAssetManagement-EquipmentHandler-addNewEq',record);
            		}catch(e){
            			Workflow.handleError(e); 
            			View.alert("对不起，工作流执行失败!");
            		}
            		if(result.code='executed'){
            			eqIdList.push(eqId);
            			//当保存成功后将request_id为传送过来的Id的status改为completed，并且将选择按钮进行置灰
            			
            			var activityLogDs=View.dataSources.get('ascBjUsmsProcAsgnApproveReqApproveTabFormDS');
            			var activityLogId=this.ascBjUsmsProcAsgnApproveReqApproveTabForm1.getFieldValue('activity_log.activity_log_id');
            			var activityLogRes=new Ab.view.Restriction();
            			activityLogRes.addClause('activity_log.activity_log_id',activityLogId,'=');
            			var activityRecord=activityLogDs.getRecord(activityLogRes);
            			activityRecord.setValue('activity_log.status','COMPLETED');
            			activityLogDs.saveRecord(activityRecord);
            			//提示操作成功
            			//View.alert(result.message);
            		}
        		}
        		
        		var restriction=new Ab.view.Restriction();

        		restriction.addClause('eq.eq_id',eqIdList,'IN');
        		
        		var tabs = ascBjUsmsProcAsgnApproveReqApproveTabController.tabs;
        		tabs.selectTabConsoleRestriction =restriction;
        		
        		View.getWindow('parent').View.setTitle("设备入库-入库设备列表");
        	   //select next tab and reload the tab view
    		    var nextTabName = 'assignTab';
    		    var nextTab = tabs.findTab(nextTabName);
    		    nextTab.loadView();
    		    tabs.selectTab(nextTabName);
        	}
	
    	}

    }
    
});

