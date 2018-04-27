var ascBjUsmsProcChangeCreateReqBasicInputTabController = View.createController("ascBjUsmsProcChangeCreateReqBasicInputTabController", {

    //main tab object , used here for store some globle varible
    tabs: null,
    editId:null,
    afterInitialDataFetch: function(){
    	var status="";
    	this.editId=null;
    	this.tabs = View.getControl('', 'createRequestTabs');
       // this.tabs = View.getControlsByType(parent, 'tabs')[0];
        //set the selected value of activity_log.activity_type
        var activityLogid=this.tabs.restriction;
        if(activityLogid!=null){
        	this.editStart();
//        	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.show(false);
        }else{
        	
//        	this.basicInformationForm.setFieldValue('activity_log.activity_type',this. tabs.requestType);
//    		this.basicInformationForm.setFieldValue('activity_log.prob_type',	this. tabs.probTypeValue);
    		 var restrictionRm = new Ab.view.Restriction();
    		 restrictionRm.addClause('ts_rm_tu_change_log.rm_tu_change_id', '', 'IS NULL', 'AND', true);
    		 this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.refresh(restrictionRm);
    		 this.start();
        }
        this.basicInformationForm.setFieldValue('activity_log.activity_type',this.tabs.requestType);
    	this.basicInformationForm.setFieldValue('activity_log.prob_type',	this.tabs.probTypeValue);
    },
    start: function(){
    	 var emId=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue('ts_rm_tu_change_log.oper_em_id');
    	 var restrictionEm = new Ab.view.Restriction();
		 restrictionEm.addClause('em.em_id', emId, '=');
		 var emdata=View.dataSources.get('emDS');
		 var record=emdata.getRecord(restrictionEm);
		 var emName=record.getValue("em.name");
		 this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue('ts_rm_tu_change_log.oper_em_name',emName);
		 
		
    },
    basicInformationForm_onBack: function(){
    	if(status!=""){
    		status="";
    	}
		this.tabs = View.getControlsByType(parent, 'tabs')[0];
        View.getWindow('parent').View.setTitle("房屋用途变更-申请");
        var tabName = 'selectTab';
        this.tabs.restriction=null;
        var tab = this.tabs.findTab(tabName);
        tab.loadView();
        this.tabs.selectTab(tabName);
        
    },
  
    ascBjUsmsProcChangeCreateReqBasicInputTabForm_onSave : function(){
    	var blId=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("rm.bl_id");
    	var flId=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("rm.fl_id");
    	var rmId=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("rm.rm_id");
    	var rmcat=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("rm.rm_cat");
    	var rmtype=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("rm.rm_type");
    	var usedesc=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("rm.use_desc");
    	var name=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("rm.name");
    	
    },
    basicInformationForm_onInsert: function(){   
    	status="";
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.newRecord=true;
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.refresh();
    	var emId=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue('ts_rm_tu_change_log.oper_em_id');
   	    var restrictionEm = new Ab.view.Restriction();
		 restrictionEm.addClause('em.em_id', emId, '=');
		 var emdata=View.dataSources.get('emDS');
		 var record=emdata.getRecord(restrictionEm);
		 var emName=record.getValue("em.name");
		 this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue('ts_rm_tu_change_log.oper_em_name',emName);
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.show(true);
    },
    
    ascBjUsmsProcChangeCreateReqBasicInputTabForm_onClear: function(){
    	if(status=='edit'){
    	var rm_tu_change_id=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue('ts_rm_tu_change_log.rm_tu_change_id');
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.clear();
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue('ts_rm_tu_change_log.rm_tu_change_id',rm_tu_change_id);
    	
    	}else{
    	  
    	  this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.clear();
      }
    	var emId=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue('ts_rm_tu_change_log.oper_em_id');
   	    var restrictionEm = new Ab.view.Restriction();
		 restrictionEm.addClause('em.em_id', emId, '=');
		 var emdata=View.dataSources.get('emDS');
		 var record=emdata.getRecord(restrictionEm);
		 var emName=record.getValue("em.name");
		 this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue('ts_rm_tu_change_log.oper_em_name',emName);
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.show(true);
    },
    ascBjUsmsProcChangeCreateReqBasicInputTabForm_onCancel: function(){
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.show(false);
    },
	     
    basicInformationForm_onSubmit: function(){
    	
    	var activityPanel=this.basicInformationForm;
//		var activityLogId=activityPanel.getFieldValue('activity_log.activity_log_id');
		var requestor=activityPanel.getFieldValue('activity_log.requestor');
		var dv_id=activityPanel.getFieldValue('activity_log.dv_id');
		var date_required=activityPanel.getFieldValue('activity_log.date_required');
		var prob_type=activityPanel.getFieldValue('activity_log.prob_type');
		var activity_type=activityPanel.getFieldValue('activity_log.activity_type');
		var description=activityPanel.getFieldValue('activity_log.description');

		var record = this.getRecord();
	      
        if (this.checkInputFields()) {          
           var record = this.getRecord();     
           var restriction = this.submitRequest(record);
           if (restriction) {
                this.selectNextTab(restriction);
            }
       }
    },
	 getRecord: function(){
	        var record = {};
	        var ds = this.ascBjUsmsProcChangeCreateReqBasicInputTabFormDS;
	        var panel = View.panels.get("basicInformationForm");
	        for (var i = 0; i < ds.fieldDefs.items.length; i++) {
	            var fieldId = ds.fieldDefs.items[i].id;
	            if (panel.containsField(fieldId)) {
	                record[fieldId] = panel.getFieldValue(fieldId);
	            }
	        }
	        return record;
	    },
    ascBjUsmsProcChangeCreateReqBasicInputTabForm_onSave : function(){
    	
    	//创建新的申请单号
    	var activityPanel=this.basicInformationForm;
		var activityLogId=activityPanel.getFieldValue('activity_log.activity_log_id');
		var requestor=activityPanel.getFieldValue('activity_log.requestor');
		var dv_id=activityPanel.getFieldValue('activity_log.dv_id');
		var date_required=activityPanel.getFieldValue('activity_log.date_required');
		var prob_type=activityPanel.getFieldValue('activity_log.prob_type');
		var activity_type=activityPanel.getFieldValue('activity_log.activity_type');
		var description=activityPanel.getFieldValue('activity_log.description');

    	var panel=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm;
    	var panel2 = View.panels.get("basicInformationForm");
    	
    	var siteId=panel.getFieldValue('ts_rm_tu_change_log.site_id');
    	var prId=panel.getFieldValue('ts_rm_tu_change_log.pr_id');
    	var blId=panel.getFieldValue('ts_rm_tu_change_log.bl_id');
    	var blName=panel.getFieldValue('ts_rm_tu_change_log.bl_name');
    	var flId=panel.getFieldValue('ts_rm_tu_change_log.fl_id');
    	var rmId=panel.getFieldValue('ts_rm_tu_change_log.rm_id');
    	var rmUse=panel.getFieldValue('ts_rm_tu_change_log.rm_use');
    	var rmUseAfter=panel.getFieldValue('ts_rm_tu_change_log.rm_use_after');
    	var rmCat=panel.getFieldValue('ts_rm_tu_change_log.rm_cat');
    	var rmCatAfter=panel.getFieldValue('ts_rm_tu_change_log.rm_cat_after');   	
    	var rmType=panel.getFieldValue('ts_rm_tu_change_log.rm_type');
    	var rmTypeAfter=panel.getFieldValue('ts_rm_tu_change_log.rm_type_after');
    	var useDesc=panel.getFieldValue('ts_rm_tu_change_log.use_desc');
    	var useDescAfter=panel.getFieldValue('ts_rm_tu_change_log.use_desc_after');
    	var rmName=panel.getFieldValue('ts_rm_tu_change_log.rm_name');
    	var rmNameAfter=panel.getFieldValue('ts_rm_tu_change_log.rm_name_after');
    	var operDvId=panel.getFieldValue('ts_rm_tu_change_log.oper_dv_id');
    	var operEmId=panel.getFieldValue('ts_rm_tu_change_log.oper_em_id');
    	var operEmName=panel.getFieldValue('ts_rm_tu_change_log.oper_em_name');
    	var operDate=panel.getFieldValue('ts_rm_tu_change_log.oper_date');
    	var LogId=panel.getFieldValue('ts_rm_tu_change_log.activity_log_id');
    	if(siteId==''){
    		View.showMessage("请填写校区！");
    		return;
    	}
    	if(prId==''){
    		View.showMessage("请填写片区！");
    		return;
    	}
    	if(blId==''){
    		View.showMessage("请填写建筑物编码！");
    		return;
    	}
    	if(blName==''){
    		View.showMessage("请填写建筑物名称！");
    		return;
    	}
    	if(flId==''){
    		View.showMessage("请填写楼层！");
    		return;
    	}
    	if(rmId==''){
    		View.showMessage("请填写房间！");
    		return;
    	}
    	if(rmUseAfter==''){
    		View.showMessage("请填写变更后的房屋大类！");
    		return;
    	}
    	if(rmCatAfter==''){
    		View.showMessage("请填写变更后的房屋类别！");
    		return;
    	}
    	if(rmTypeAfter==''){
    		View.showMessage("请填写变更后的房屋类型！");
    		return;
    	}
    	if(useDescAfter==''){
    		View.showMessage("请填写变更后的房屋变更明细！");
    		return;
    	}
    	if(rmNameAfter==''){
    		View.showMessage("请填写变更后的房屋名称！");
    		return;
    	}
    	if(operDvId==''){
    		View.showMessage("请填写使用单位！");
    		return;
    	}
    	if(operEmId==''){
    		View.showMessage("请填写变更操作人编号！");
    		return;
    	}
    	if(operEmName==''){
    		View.showMessage("请填写变更操作人名称！");
    		return;
    	}
    	if(operDate==''){
    		View.showMessage("请填写变更操作时间！");
    		return;
    	}
    	
     if(status=='edit'){
    		var roomForm=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm;
    		var rm_tu_change_id=roomForm.getFieldValue('ts_rm_tu_change_log.rm_tu_change_id');
    		var tsRmTuChangeLogDS=View.dataSources.get('tsRmTuChangeLogDS'); 
    		//保存前线删除数据库中的数据
    		 var restrictionDel = new Ab.view.Restriction();
    		 restrictionDel.addClause('ts_rm_tu_change_log.rm_tu_change_id',rm_tu_change_id,'=');
    		 var recordDel=tsRmTuChangeLogDS.getRecord(restrictionDel);
    		 tsRmTuChangeLogDS.deleteRecord(recordDel);
    		 if(this.editId!=null){
    	  		    this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.removeGridRow(this.editId);
    	  			this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.update();
    	  	    	this.editId=null;
    	  	  }
    		 //保存编辑后的房间
    		 panel.setFieldValue('ts_rm_tu_change_log.activity_log_id',activityLogId);
    		 var tsRmTuChangeLogDSedit=View.dataSources.get('tsRmTuChangeLogDS');
    		 var roomRecord=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getRecord();
    		 tsRmTuChangeLogDSedit.saveRecord(roomRecord);
//    	    var restriction = new Ab.view.Restriction();
//    	    restriction.addClause('ts_rm_tu_change_log.rm_tu_change_id',rm_tu_change_id,'=');    	   
//    	    var roomRecord=tsRmTuChangeLogDSedit.getRecord(restriction);
//    	    roomRecord.isNew=false;
//    	    roomRecord.setValue('ts_rm_tu_change_log.site_id',siteId);
//        	roomRecord.setValue('ts_rm_tu_change_log.pr_id',prId);
//        	roomRecord.setValue('ts_rm_tu_change_log.bl_id',blId);
//        	roomRecord.setValue('ts_rm_tu_change_log.bl_name',blName);
//        	roomRecord.setValue('ts_rm_tu_change_log.fl_id',flId);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_id',rmId);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_use',rmUse);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_use_after',rmUseAfter);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_cat',rmCat);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_cat_after',rmCatAfter);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_type',rmType);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_type_after',rmTypeAfter);
//        	roomRecord.setValue('ts_rm_tu_change_log.use_desc',useDesc);
//        	roomRecord.setValue('ts_rm_tu_change_log.use_desc_after',useDescAfter);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_name',rmName);
//        	roomRecord.setValue('ts_rm_tu_change_log.rm_name_after',rmNameAfter);
//        	roomRecord.setValue('ts_rm_tu_change_log.oper_dv_id',operDvId);
//        	roomRecord.setValue('ts_rm_tu_change_log.oper_em_id',operEmId);
//        	roomRecord.setValue('ts_rm_tu_change_log.oper_em_name',operEmName);
//        	roomRecord.setValue('ts_rm_tu_change_log.oper_date',operDate);
//        	roomRecord.setValue('ts_rm_tu_change_log.activity_log_id',activityLogId);
//        	tsRmTuChangeLogDSedit.saveRecord(roomRecord);
        	status="";
        	var a;
        	
        	if(!this.verifyRoomExists(blId,flId,rmId)){
            	this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.addGridRow(roomRecord);
        		this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.sortEnabled = false;
        		this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.update();
            	}else{
        	    	 View.showMessage("房间["+blName+"-"+flId+"-"+rmId+"]已经添加过了,请重新选择！");
        	    	 this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.refresh();
        	    	 this.start();
        	     }
    	    
    	}else{
    	//save
		  var record = this.getRecord();
		  var activityLogId = this.saveRequest(record);
		  
		  panel.setFieldValue('ts_rm_tu_change_log.activity_log_id',activityLogId);
	      panel2.setFieldValue('activity_log.activity_log_id',activityLogId);
	     	
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.save();
    	var rm_tu_change_id=panel.getFieldValue('ts_rm_tu_change_log.rm_tu_change_id');
//    	var datas=View.dataSources.get('tsRmTuChangeLogDS');   	
    	var recordRoom=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getRecord();
//    	recordRoom.isNew=true;
    	recordRoom.setValue('ts_rm_tu_change_log.rm_tu_change_id',rm_tu_change_id);
    	recordRoom.setValue('ts_rm_tu_change_log.site_id',siteId);
    	recordRoom.setValue('ts_rm_tu_change_log.pr_id',prId);
    	recordRoom.setValue('ts_rm_tu_change_log.bl_id',blId);
    	recordRoom.setValue('ts_rm_tu_change_log.bl_name',blName);
    	recordRoom.setValue('ts_rm_tu_change_log.fl_id',flId);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_id',rmId);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_use',rmUse);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_use_after',rmUseAfter);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_cat',rmCat);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_cat_after',rmCatAfter);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_type',rmType);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_type_after',rmTypeAfter);
    	recordRoom.setValue('ts_rm_tu_change_log.use_desc',useDesc);
    	recordRoom.setValue('ts_rm_tu_change_log.use_desc_after',useDescAfter);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_name',rmName);
    	recordRoom.setValue('ts_rm_tu_change_log.rm_name_after',rmNameAfter);
    	recordRoom.setValue('ts_rm_tu_change_log.oper_dv_id',operDvId);
    	recordRoom.setValue('ts_rm_tu_change_log.oper_em_id',operEmId);
    	recordRoom.setValue('ts_rm_tu_change_log.oper_em_name',operEmName);
    	recordRoom.setValue('ts_rm_tu_change_log.oper_date',operDate);
    	recordRoom.setValue('ts_rm_tu_change_log.activity_log_id',activityLogId);
//    	datas.saveRecord(recordRoom);
    	
    	
    	if(!this.verifyRoomExists(blId,flId,rmId)){
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.addGridRow(recordRoom);
		this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.sortEnabled = false;
		this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.update();
    	}else{
	    	 View.showMessage("房间["+blName+"-"+flId+"-"+rmId+"]已经添加过了,请重新选择！");
	    	 this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.refresh();
	    	 this.start();
	     }
    	
    	//更改房屋状态     
//        var roomdata=View.dataSources.get('roomDS');   	
//   	    restriction = new Ab.view.Restriction();
//        restriction.addClause('rm.rm_id',rmId, '=');
//        var rec=roomdata.getRecord(restriction);
//        rec.setValue('rm.ruzhu_status',2);
//        roomdata.saveRecord(rec);
    	}	
    },
    
    verifyRoomExists:function(blId,flId,rmId){
		  var panel=this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm;
		   for(var i=0;i<panel.rows.length;i++){
			   var blIdValue=panel.rows[i].row.getFieldValue("ts_rm_tu_change_log.bl_id");
			   var flIdValue=panel.rows[i].row.getFieldValue("ts_rm_tu_change_log.fl_id");
			   var rmIdValue=panel.rows[i].row.getFieldValue("ts_rm_tu_change_log.rm_id");
			   if(blId==blIdValue && flId==flIdValue &&  rmId==rmIdValue){
				   return true;
			   }
		   }
		   return false;
	},
    
    checkInputFields: function(){
        this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.clearValidationResult();
        this.basicInformationForm.clearValidationResult();
        if (this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.validateFields() &&
        this.basicInformationForm.validateFields()) {
            var requestType = this.basicInformationForm.getFieldValue("activity_log.prob_type");
            var rmCatFrom = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_cat");
            var rmCatTo = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_cat_after");
            var rmTypeFrom = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_type");
            var rmTypeTo = this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("activity_log.rm_type_after");
            if (requestType == "房屋变更-用途") {
                if (!rmCatFrom || !rmCatTo || !rmTypeFrom || !rmTypeTo) {
                    View.alert(getMessage('noRoomType'));
                    return false;
                }
                else {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    },
    

    
    saveRequest: function(record){
    	var activityLodId="";
        try {
        	 var activityLogId=this.basicInformationForm.getFieldValue('activity_log.activity_log_id');
        	if(activityLogId==''){
        		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-saveRequest', record);	
//        		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);	
        	}else{
        		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-saveRequest', record);
//        		result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activityLogId, record);
        	}
        	if (result.code == 'executed') {
                //get activity_log_id from result 
            	activityLodId=eval('(' + result.jsonExpression + ')').activity_log_id;
                return activityLodId;
            }
            else {
                return null;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return null;
        }
        
    },
    submitRequest: function(record){
    	var activityLodId="";
        try {
        	var activityLogId=this.basicInformationForm.getFieldValue('activity_log.activity_log_id');
        	if(activityLogId==''){
            result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0, record);
        	}else{
        	result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activityLogId, record);
        	}
            if (result.code == 'executed') {
                //get activity_log_id from result 
            	this.tabs.activityLodId=eval('(' + result.jsonExpression + ')').activity_log_id;
                return this.tabs.activityLodId;
            }
            else {
                return activityLodId;
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            return activityLodId;
        }
        
    },
    
    selectNextTab: function(restriction){
        //select next tab and reload the tab view
    	 this.tabs = View.getControlsByType(parent, 'tabs')[0];
        this.tabs.restriction = restriction;
        var nextTabName = 'attachTab';
        var nextTab = this.tabs.findTab(nextTabName);
        nextTab.loadView();
        this.tabs.selectTab(nextTabName);
    },
    
   
    
    ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm_delete_onClick:function(row){
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.removeGridRow(row.getIndex());
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.update();
    	var rm_tu_change_id=row.getFieldValue("ts_rm_tu_change_log.rm_tu_change_id");
    	var rmRestriction=new Ab.view.Restriction();
    	if (rm_tu_change_id!= "") {
			 rmRestriction.addClause("ts_rm_tu_change_log.rm_tu_change_id", rm_tu_change_id, "=");
			} 
    	var datasource=View.dataSources.get('tsRmTuChangeLogDS');
    	var record=datasource.getRecord(rmRestriction);
    	datasource.deleteRecord(record);
    	var rm_tu_change_id2=this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.getFieldValue("ts_rm_tu_change_log.rm_tu_change_id");
    	if(rm_tu_change_id==rm_tu_change_id2){
    		this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.clear();
    	}
    	var a;
    	
//    	var roomdata=View.dataSources.get('roomDS');   	
//   	    restriction = new Ab.view.Restriction();
//        restriction.addClause('rm.rm_id',rmid, '=');
//        var rec=roomdata.getRecord(restriction);
//        rec.setValue('rm.ruzhu_status',0);
//        roomdata.saveRecord(rec);    
        
    },
    ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm_edit_onClick:function(row){
    	
    	
    	
    	this. basicInformationForm_onInsert();
    	
    	this.editId=row.getIndex();    	
    	
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_tu_change_id",row.getFieldValue("ts_rm_tu_change_log.rm_tu_change_id"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.site_id",row.getFieldValue("ts_rm_tu_change_log.site_id"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.pr_id",row.getFieldValue("ts_rm_tu_change_log.pr_id"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.bl_id",row.getFieldValue("ts_rm_tu_change_log.bl_id"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.bl_name",row.getFieldValue("ts_rm_tu_change_log.bl_name"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.fl_id",row.getFieldValue("ts_rm_tu_change_log.fl_id"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_id",row.getFieldValue("ts_rm_tu_change_log.rm_id"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_use",row.getFieldValue("ts_rm_tu_change_log.rm_use"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_use_after",row.getFieldValue("ts_rm_tu_change_log.rm_use_after"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_cat",row.getFieldValue("ts_rm_tu_change_log.rm_cat"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_cat_after",row.getFieldValue("ts_rm_tu_change_log.rm_cat_after"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_type",row.getFieldValue("ts_rm_tu_change_log.rm_type"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_type_after",row.getFieldValue("ts_rm_tu_change_log.rm_type_after"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.use_desc",row.getFieldValue("ts_rm_tu_change_log.use_desc"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.use_desc_after",row.getFieldValue("ts_rm_tu_change_log.use_desc_after"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_name",row.getFieldValue("ts_rm_tu_change_log.rm_name"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.rm_name_after",row.getFieldValue("ts_rm_tu_change_log.rm_name_after"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.oper_dv_id",row.getFieldValue("ts_rm_tu_change_log.oper_dv_id"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.oper_em_id",row.getFieldValue("ts_rm_tu_change_log.oper_em_id"));
    //	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.oper_em_name",row.getFieldValue("ts_rm_tu_change_log.oper_em_name"));
    	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.setFieldValue("ts_rm_tu_change_log.oper_date",row.getFieldValue("ts_rm_tu_change_log.oper_date"));
    	status='edit';
    },
    editStart: function(){
//    	var data=View.dataSources.get('ascBjUsmsProcChangeCreateReqBasicInputTabFormDS');
//    	var restriction = new Ab.view.Restriction();
//    	restriction.addClause('activity_log.activity_log_id',this.tabs.restriction, '=');
//        var rec=data.getRecord(restriction);
    	this.basicInformationForm.refresh(this.tabs.restriction);
    	this.basicInformationForm.setFieldValue('activity_log.activity_log_id',this.tabs.restriction);
    	this.basicInformationForm.setFieldValue('activity_log.activity_type',this.tabs.requestType);
    	this.basicInformationForm.setFieldValue('activity_log.prob_type',	this.tabs.probTypeValue);
    	var restriction = new Ab.view.Restriction();
     	restriction.addClause('ts_rm_tu_change_log.activity_log_id',this.tabs.restriction, '=');
     	this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.refresh(restriction);
     	
     	var grid=this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm;
     	if(this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.gridRows.length!=0){
     		
     		var row=this.ascBjUsmsProcChangeCreateReqBasicInputTabDestricptionForm.gridRows.get(0);
     		var rm_tu_change_id=row.getRecord().getValue('ts_rm_tu_change_log.rm_tu_change_id');
     		var restriction2 = new Ab.view.Restriction();
     		restriction2.addClause('ts_rm_tu_change_log.rm_tu_change_id',rm_tu_change_id, '=');
     		this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.newRecord=false;
     		this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.refresh(restriction2);
     	}
     	status='edit';
     	this.ascBjUsmsProcChangeCreateReqBasicInputTabForm.show(false);
     	var a;
    }
    	
    
});

function selectSubRequestType(){
    //get request type
    var requestType = ascBjUsmsProcChangeCreateReqBasicInputTabController.tabs.requestType;
    
    //create restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause('probtype.prob_type', requestType.replace(/SERVICE DESK - /g, '') + "%", 'LIKE');
    
    //open select value window using restriction
    View.selectValue({
        formId: 'basicInformationForm',
        title: '',
        fieldNames: ['activity_log.prob_type'],
        selectTableName: 'probtype',
        selectFieldNames: ['probtype.prob_type'],
        visibleFieldNames: ['probtype.prob_type', 'probtype.description'],
        restriction: restriction,
        sortValues: toJSON([{
            'fieldName': 'probtype.prob_type',
            'sortOrder': 0
        }])
    });
}

function autoGetTitle(fieldName,newValue,oldValue){
	var a=fieldName;	
	var panel=View.panels.get("ascBjUsmsProcChangeCreateReqBasicInputTabForm");
	if(fieldName=='ts_rm_tu_change_log.rm_name'){
		var name=newValue;		
		panel.setFieldValue("ts_rm_tu_change_log.rm_name_after",name);	
	}
	if(fieldName=='ts_rm_tu_change_log.use_desc'){
		var name2=newValue;		
		panel.setFieldValue("ts_rm_tu_change_log.use_desc_after",name2);	
	}
	if(fieldName=='ts_rm_tu_change_log.rm_type'){
		var name3=newValue;		
		panel.setFieldValue("ts_rm_tu_change_log.rm_type_after",name3);	
	}
	if(fieldName=='ts_rm_tu_change_log.rm_cat'){
		var name4=newValue;		
		panel.setFieldValue("ts_rm_tu_change_log.rm_cat_after",name4);	
	}
	if(fieldName=='ts_rm_tu_change_log.rm_use'){
		var name5=newValue;		
		panel.setFieldValue("ts_rm_tu_change_log.rm_use_after",name5);	
	}
//	var panel=View.panels.get('ascBjUsmsProcChangeCreateReqBasicInputTabForm');
//	panel.setFieldValue('rm.name2',rmName);
}



