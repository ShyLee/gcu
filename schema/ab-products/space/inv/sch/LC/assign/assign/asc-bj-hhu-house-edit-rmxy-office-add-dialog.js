var abCreateDealDialogController = View.createController('abCreateDealDialogController', {
    primaryKey: null,
    listLocation:"",
    activityLogId:"",
    dealId:"",
    afterInitialDataFetch: function(){
        this.addPanel.refresh(null, true);
        var handingName = View.user.name;
        
        this.activityLogId=this.view.parameters["aActivityLogId"];
    	var dvId=this.view.parameters["aDvId"];
    	var dvName=this.view.parameters["aDvName"];
		var address=this.view.parameters["aAddress"];
		var emName=this.view.parameters["aEmName"];
		this.listLocation=this.view.parameters["aListLocation"];
		
        this.addPanel.setFieldValue('sc_rmxy.handing_name_yi', emName);
        this.addPanel.setFieldValue('sc_rmxy.dv_id', dvId);
        this.addPanel.setFieldValue('dv.name', dvName);
        this.addPanel.setFieldValue('sc_rmxy.yi',dvName);
        this.addPanel.setFieldValue('sc_rmxy.rm_address',address);
        this.addPanel.setFieldValue('sc_rmxy.handing_name_jia',handingName);
        this.addPanel.setFieldValue('sc_rmxy.jia', "资产管理处");
		this.addPanel.setFieldValue('sc_rmxy.deal_type', "BGRMXY");
		this.addPanel.setFieldValue('sc_rmxy_type.description', "办公用房");
        this.addPanel.setFieldValue('sc_rmxy.date_checkin', new Date());
        this.addPanel.enableField("sc_rmxy.doc_deal", false);
        var restriction = new Ab.view.Restriction();
		restriction.addClause('sc_deal_rm.deal_id', '', 'IS NULL', 'AND', true);
		this.scDealRmDsGridPanel.refresh(restriction);
        this.showAndSaveRecordAsignRm(this.listLocation,"show");
        
        this.addPanel.actions.get('effective').enable(false);
        this.addPanel.actions.get('downLoad').enable(false);
    },
	/**
	 * 维修房间显示和提交功能
	 */
    showAndSaveRecordAsignRm:function(listRoom,type){
	   if(listRoom!=""){
		   for(var i=0;i<listRoom.length;i++){
			   var blId=listRoom[i].substring(0,listRoom[i].indexOf("|"));
			   var flId=listRoom[i].substring(listRoom[i].indexOf("|")+1,listRoom[i].lastIndexOf("|"));
			   var rmId=listRoom[i].substring(listRoom[i].lastIndexOf("|")+1,listRoom[i].length);
			   
			   var restriction=new Ab.view.Restriction();
			   var account = View.dataSources.get("rm_ds");
			   restriction.addClause("bl.bl_id",blId,"=");
			   restriction.addClause("rm.fl_id",flId,"=");
			   restriction.addClause("rm.rm_id",rmId,"=");
			   
			   var recordRm=account.getRecord(restriction);
			   
			   var siteId=recordRm.getValue("bl.site_id");
			   var siteName=this.getSiteName(siteId);
				
			   var blName=recordRm.getValue("bl.name");
			   var area=recordRm.getValue("rm.area");
			   
			   var record="";
			   if(type=="show"){
				   record= new Ab.data.Record();
			   }else if(type=="submit"){
				   record = View.dataSources.get("scDealRmDs").getRecord();
				   record.isNew=true;
			   }
			   record.setValue("sc_deal_rm.deal_id", this.dealId);
			   record.setValue("sc_deal_rm.bl_id", blId);
			   record.setValue("sc_deal_rm.fl_id", flId);
			   record.setValue("sc_deal_rm.rm_id", rmId);
			   record.setValue("sc_deal_rm.rm_area", area);
			   record.setValue("sc_deal_rm.deal_rm_id", i+1);
			   
			   if(type=="show"){
				   record.setValue("site.name", siteName);
				   record.setValue("sc_deal_rm.bl_name", blName);
				   this.scDealRmDsGridPanel.addGridRow(record);
				   this.scDealRmDsGridPanel.sortEnabled = false;
				   this.scDealRmDsGridPanel.update();
			   }else if(type=="submit"){
				   var account=View.dataSources.get("scDealRmDs");
				   account.saveRecord(record);
			   }
           }
	    }
	},
	getSiteName:function(siteId){
		var parameters = {
				tableName: 'site',
			fieldNames: toJSON(['site.name']),
			restriction: "site.site_id ='" + siteId + "'"
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		var siteName=siteId;
		if (result.data.records.length > 0) {
			siteName = result.data.records[0]['site.name'];
		}
		return siteName;
	},
    addPanel_onSave: function(){
        var dealId = this.addPanel.getFieldValue("sc_rmxy.deal_id");
        if (dealId == "") {
            try {
                result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-createFixedIndex', "sc_rmxy", "deal_id", "system_time");
                if (result.code == "executed") {
                    var obj = eval("(" + result.jsonExpression + ")");
                    var leaseId = obj.leaseId;
                    var dateCreate = obj.dateCreate;
                    this.dealId = 'BG' + leaseId;
                }
                //1、保存协议表sc_rmxy
                this.addPanel.setFieldValue('sc_rmxy.deal_id', this.dealId);
                this.addPanel.setFieldValue('sc_rmxy.system_time', dateCreate);
                this.addPanel.save();
                
                //2、保存协议对应的房间列表到sc_deal_rm表中
                this.showAndSaveRecordAsignRm(this.listLocation,"submit");
                
                //3、更新协议编号到activity_log表中
                var restriction=new Ab.view.Restriction();
        		var account = View.dataSources.get("activity_log_ds");
        		restriction.addClause("activity_log.activity_log_id",this.activityLogId,"=");
        		
        		var record=account.getRecord(restriction);
                record.setValue("activity_log.deal_id",this.dealId);
                account.saveRecord(record);
				
				this.disableFieldEdit();
            } 
            catch (e) {
                Workflow.handleError(e);
                return;
            }
        }
    },
    show: function(){
        var deal_id = this.scRmXyDsConsole.getFieldValue('sc_rmxy.deal_id');
        var dv_id = this.scRmXyDsConsole.getFieldValue('sc_rmxy.dv_id');
        var rm_address = this.scRmXyDsConsole.getFieldValue('sc_rmxy.rm_address');
        var consoleRes = new Ab.view.Restriction();
        if (deal_id != "") {
            consoleRes.addClause('sc_rmxy.deal_id', deal_id+"%", 'like');
        }
        if (dv_id != "") {
            consoleRes.addClause('sc_rmxy.dv_id', dv_id+"%", 'like');
        }
        if (rm_address != "") {
            consoleRes.addClause('sc_rmxy.rm_address', "%"+rm_address+"%", 'like');
        }
        this.scRmXyDsGird.refresh(consoleRes);
        if (this.scRmXyDsGird.rows.length == 0) {
			 this.scDealRmDsGridPanel.show(false);
			 return;
		}
    },
    downLoad1: function(){
    	var dealId = this.addPanel.getFieldValue("sc_rmxy.deal_id");
    	this.printReport(dealId);
    },
    printReport:function(dealId){
        View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
            width: 470,
            height: 200,
            xmlName: "hhu-rmxy-office",
            parameters: {
                'dealId': dealId
            },
            closeButton: false
        });
    },
	/**
	 * 协议生效
	 * 0;已建立;1;已确认;2;已生效;3;已关闭
	 */
	addPanel_onEffective:function(){
		 var dealId=this.addPanel.getFieldValue('sc_rmxy.deal_id');
		 var dealState=this.addPanel.getFieldValue('sc_rmxy.deal_state');
		 if(dealState=="2"){
			 View.showMessage('协议已经生效!');
	         return;
		 }else{
			 var message = getMessage("确认协议【"+dealId+"】生效？");
			 var controller = this;
			 View.confirm(message, function(button){
				 if (button == 'yes') {
					 try { 
						 controller.addPanel.setFieldValue('sc_rmxy.deal_state', '2');
						 var success=controller.addPanel.save();
						 if(success){
							 controller.addPanel.actions.get('effective').enable(false);
							 controller.addPanel.closeWindow();
						 }
					 }catch (e) {
						 Ab.workflow.Workflow.handleError(e);
					 }
				 }
			 });
		 }
	},
	enableFieldEdit:function(){
		this.addPanel.actions.get('save').enable(false);
	    this.addPanel.actions.get('effective').forcedDisabled=false;
	    this.addPanel.actions.get('effective').enable(true);
	    this.addPanel.actions.get('downLoad').forcedDisabled=false;
	    this.addPanel.actions.get('downLoad').enable(true);
	    
	    this.addPanel.enableField("sc_rmxy.yi",true);
	    this.addPanel.enableField("sc_rmxy.date_start",true);
	    this.addPanel.enableField("sc_rmxy.date_end",true);
	    this.addPanel.enableField("sc_rmxy.rm_address",true);
	    this.addPanel.enableField("sc_rmxy.principal_jia",true);
	    this.addPanel.enableField("sc_rmxy.rent",true);
	    this.addPanel.enableField("sc_rmxy.principal_yi",true);
	    this.addPanel.enableField("sc_rmxy.date_checkin",true);
	    this.addPanel.enableField("sc_rmxy.doc_deal",true);
	},
	disableFieldEdit:function(){
		this.addPanel.actions.get('save').enable(false);
	    this.addPanel.actions.get('effective').forcedDisabled=false;
	    this.addPanel.actions.get('effective').enable(true);
	    this.addPanel.actions.get('downLoad').forcedDisabled=false;
	    this.addPanel.actions.get('downLoad').enable(true);
	    
		this.addPanel.enableField("sc_rmxy.handing_name_yi",false);
		this.addPanel.enableField("sc_rmxy.principal_yi",false);
		this.addPanel.enableField("sc_rmxy.principal_jia",false);
		this.addPanel.enableField("sc_rmxy.rm_address",false);
		this.addPanel.enableField("sc_rmxy.date_checkin",false);
		this.addPanel.enableField("sc_rmxy.doc_deal",true);
		this.addPanel.enableField("sc_rmxy.beizhu",false);
		
	}
});
