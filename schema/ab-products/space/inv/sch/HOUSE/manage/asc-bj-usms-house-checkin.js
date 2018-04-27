var controller = View.createController('controller', {

    tabs: null,
    afterViewLoad: function(){
        this.rm_detail.addParameter('rmType', " rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
    },
    
    afterInitialDataFetch: function(){
    	//this.rmDetail.addParameter('rmType', " rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
    },
    
    gridPanel_onAdd:function(){
    	this.applicant_info.refresh([],true);
    },
    
    gridPanel_afterRefresh: function(){
    	this.gridPanel.enableSelectAll(false);
    	  this.selectedRow = null;
    	},

    gridPanel_multipleSelectionColumn_onClick: function(row){
    	if(this.selectedRow != null){
    	   this.selectedRow.select(false);
    	}
    	if(row.isSelected()){
    	   this.selectedRow = row;
    	}else{
    	   this.selectedRow = null;
    	}
    },
    
    rm_detail_afterRefresh: function(){
    	this.rm_detail.enableSelectAll(false);
    	  this.selectedRow = null;
    	},

    rm_detail_multipleSelectionColumn_onClick: function(row){
    	if(this.selectedRow != null){
    	   this.selectedRow.select(false);
    	}
    	if(row.isSelected()){
    	   this.selectedRow = row;
    	}else{
    	   this.selectedRow = null;
    	}
    },
    
    applicant_info_onSelectRoom:function(){
    	var card_id = this.applicant_info.getFieldValue("sc_zzfcard.card_id");
    	if(valueExistsNotEmpty(card_id)){     	
    		this.rm_detail.refresh();
    	    this.rm_detail.showInWindow({
    	      x:300,
    	      y:200,
    	      width: 800,
    	      height: 500
    	     });
    	}else{
    	   View.showMessage("请先保存申请单");
    	   return;
    	}
    },
    
    rm_detail_onAssign:function(){
    	var dsRm = View.dataSources.get("rmDetail");
       	
    	var selectedRecord = this.rm_detail.getSelectedRecords();  	
    	if(selectedRecord.length>0){
    		 var selectedIndex=this.rm_detail.selectedRowIndex;
    		 var row=this.rm_detail.rows[selectedIndex];
    		 var bl_id=row["rm.bl_id"];   	
    		 var fl_id=row["rm.fl_id"];   	
    		 var rm_id=row["rm.rm_id"];  
    		 var res=new Ab.view.Restriction();
    		 res.addClause('rm.bl_id',bl_id,'=');
    	     res.addClause('rm.fl_id',fl_id,'=');
    	     res.addClause('rm.rm_id',rm_id,'=');
    	     var record=dsRm.getRecord(res);
    		 
    		 this.applicant_info.setFieldValue("sc_zzfcard.bl_id",bl_id);
    		 this.applicant_info.setFieldValue("sc_zzfcard.fl_id",fl_id);
    		 this.applicant_info.setFieldValue("sc_zzfcard.rm_id",rm_id);
    		 this.applicant_info.setFieldValue("sc_zzfcard.unit_code",record.getValue("rm.unit_code"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.area",record.getValue("rm.area"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.area_comn_rm",record.getValue("rm.area_comn_rm"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.area_lease",record.getValue("rm.area_lease"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.huxing",record.getValue("rm.huxing"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.eq_desc",record.getValue("rm.eq_desc"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.weixiu_log",record.getValue("rm.weixiu_log"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.rm_cat",record.getValue("rm.rm_cat"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.rmcat_name",record.getValue("rmcat.rmcat_name"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.rm_type",record.getValue("rm.rm_type"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.rmtype_name",record.getValue("rmtype.rmtype_name"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.is_left",record.getValue("rm.is_left"));
    		 this.applicant_info.setFieldValue("sc_zzfcard.is_low_high",record.getValue("rm.is_low_high"));
    		 
    		 this.applicant_info.setFieldValue("sc_zzfcard.card_status","yxf");
    		 this.applicant_info.save();    	     
    	     this.gridPanel.refresh();
    	     this.rm_detail.closeWindow();
    	     View.showMessage("分配成功");
    	}else{
    	   View.showMessage("请选择分配的房间");
    	   return;
    	}
    },
    
    applicant_info_onSubmit:function(){
    	var rm_id=this.applicant_info.getFieldValue("sc_zzfcard.rm_id");
    	if(valueExistsNotEmpty(rm_id)){     	
    		this.applicant_info.setFieldValue("sc_zzfcard.card_status","ysq");
    		this.applicant_info.save();    	     
    	    this.gridPanel.refresh();
    	    this.applicant_info.show(false);
    	    View.showMessage("提交成功");
    	}else{
    	   View.showMessage("请先选择房间");
    	   return;
    	}
    	
    },
    
    applicant_info_onSave:function(){
    	var marriage_stat = this.applicant_info.getFieldValue("sc_zzfcard.marriage_stat");
    	var is_working_parents = this.applicant_info.getFieldValue("sc_zzfcard.is_working_parents");
    	var po_em_id = this.applicant_info.getFieldValue("sc_zzfcard.po_em_id");
    	if(marriage_stat=="T"){
    		if(is_working_parents=="T"){
    			if(!valueExistsNotEmpty(po_em_id)){
    				View.showMessage("配偶工号不能为空");
    		    	return;
    			}
    		}
    	}
    	
    	 var success=this.applicant_info.canSave();
    	 if(success){
    		 this.applicant_info.setFieldValue("sc_zzfcard.card_status","ybc");
    		 this.applicant_info.save();
    	     
    	     this.gridPanel.refresh();
    	 }
    	
    },
    
    showZZFCardInfo:function(){
    	var panel = this.gridPanel;
    	var selectedIndex = panel.selectedRowIndex;
    	var card_id = panel.rows[selectedIndex]["sc_zzfcard.card_id"];
    	var res= new Ab.view.Restriction();
    	res.addClause("sc_zzfcard.card_id",card_id,"=");
    	this.applicant_info.refresh(res,false);
    },
    
    gridPanel_onDelete:function(){
    	var selectedRecord = this.gridPanel.getSelectedRecords();
    	if(selectedRecord.length>0){
    		var message="确定要删除";
        	var controller=this;
        	View.confirm(message,function(button){
        	    if(button=="yes"){
        	    	var selectedIndex=controller.gridPanel.selectedRowIndex;
           		 	var row=controller.gridPanel.rows[selectedIndex];
           		 	var card_id=row["sc_zzfcard.card_id"];  
           		 	var res= new Ab.view.Restriction();
           		 	res.addClause("sc_zzfcard.card_id",card_id,"=");
           		 	var record=controller.sc_zzfcardDataSource.getRecord(res);
           		 	controller.sc_zzfcardDataSource.deleteRecord(record);
           		 	controller.gridPanel.refresh();
           		 	View.showMessage("删除成功");
           		 	controller.applicant_info.show(false);
        	    }else{
        	     
        	    }
        	 }); 	
    		
    	}else{
    	   View.showMessage("请选择需要删除的申请单");
    	   return;
    	}
    },
    gridPanel_onUpdateHouse:function(){
        var result;
        try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-datatransferHouse-houseTrans');
            if(result.code == 'executed'){
            	View.showMessage("OA数据同步成功!");
            	this.gridPanel.refresh();
            } else {
            	Workflow.handleError(result);
            	View.showMessage("OA数据同步失败!");
            }
        } 
        catch (e) {
            Workflow.handleError(e);
            View.showMessage("OA数据同步失败!");
            return;
        }
	}
    
    
    
});



