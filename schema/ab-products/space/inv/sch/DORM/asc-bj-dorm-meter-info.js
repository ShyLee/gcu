var controller=View.createController('controller',{
	
	afterInitialDataFetch:function(){
		this.refreshPanel(true);
	},
	
	onShowPanel:function(){
		this.editBrandPanel.refresh([],true);
		this.editBrandPanel.showInWindow({
            x: 325,
            y: 195,
            width: 800,
            height: 400,
            closeButton: false
        });
		var	selectedIndex=this.gridPanel.selectedRowIndex;
		var row=this.gridPanel.rows[selectedIndex];
		var stuYear=row["rm.stu_in_year"];
		this.blId=row["rm.bl_id"];
		var blName=row["bl.name"];
		this.flId=row["rm.fl_id"];
		this.rmId=row["rm.rm_id"];
		var dvId=row["rm.dv_id"];
		var brand_cold_new=row["rm.brand_cold_new"];
		var brand_hot_new=row["rm.brand_hot_new"];
		var brand_elec_new=row["rm.brand_elec_new"];
		
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.stu_in_year",stuYear);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.bl_id",this.blId);
		this.editBrandPanel.setFieldValue("bl.name",blName);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.fl_id",this.flId);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.rm_id",this.rmId);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.dv_id",dvId);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.brand_cold_old",brand_cold_new);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.brand_hot_old",brand_hot_new);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.brand_elec_old",brand_elec_new);
		this.editBrandPanel.setFieldValue("sc_stu_meter_log.cause","旧水表损坏");
	},
	gridPanel_onChange:function(){
		var selectedRecord = this.gridPanel.getSelectedRecords();
		if(selectedRecord.length>0){
			this.editManyBrandPanel.refresh([],true);
			this.editManyBrandPanel.showInWindow({
		          x: 325,
		          y: 195,
		          width: 550,
		          height: 400,
		          closeButton: false
		    });		
			var	selectedIndex=this.gridPanel.selectedRowIndex;
			var row=this.gridPanel.rows[selectedIndex];
			var brand_cold_new=row["rm.brand_cold_new"];
			var brand_hot_new=row["rm.brand_hot_new"];
			var brand_elec_new=row["rm.brand_elec_new"];
						
			this.editManyBrandPanel.setFieldValue("sc_stu_meter_log.brand_cold_old",brand_cold_new);
			this.editManyBrandPanel.setFieldValue("sc_stu_meter_log.brand_hot_old",brand_hot_new);
			this.editManyBrandPanel.setFieldValue("sc_stu_meter_log.brand_elec_old",brand_elec_new);
			this.editManyBrandPanel.setFieldValue("sc_stu_meter_log.cause","旧水表损坏");
		}else{
			View.showMessage("请选择需要更改的数据");
			return;
		}		
		
	},
	refreshPanel:function(autoShow){
		var panel = this.gridPanel;
		var selectedIndex="-1";
		if(autoShow){
			selectedIndex="0";
		}else{
			selectedIndex=panel.selectedRowIndex;
		}
		var rm_id = panel.rows[selectedIndex]["rm.rm_id"];
		var fl_id = panel.rows[selectedIndex]["rm.fl_id"];
		var bl_id = panel.rows[selectedIndex]["rm.bl_id"];
		
		var res1= new Ab.view.Restriction();				
		res1.addClause("sc_stu_meter_log.rm_id",rm_id,"=");
		res1.addClause("sc_stu_meter_log.fl_id",fl_id,"=");
		res1.addClause("sc_stu_meter_log.bl_id",bl_id,"=");
		res1.addClause('sc_stu_meter_log.brand_cold_new', '', 'IS NOT NULL', 'AND', true);
		res1.addClause('sc_stu_meter_log.brand_cold_old', '', 'IS NOT NULL', 'AND', true);	
		this.coldGridPanel.refresh(res1,false);
		
		var res2= new Ab.view.Restriction();
		res2.addClause("sc_stu_meter_log.rm_id",rm_id,"=");
		res2.addClause("sc_stu_meter_log.fl_id",fl_id,"=");
		res2.addClause("sc_stu_meter_log.bl_id",bl_id,"=");	
		res2.addClause('sc_stu_meter_log.brand_hot_old', '', 'IS NOT NULL', 'AND', true);
		res2.addClause('sc_stu_meter_log.brand_hot_new', '', 'IS NOT NULL', 'AND', true);	
		this.hotGridPanel.refresh(res2,false);
		
		var res3= new Ab.view.Restriction();
		res3.addClause("sc_stu_meter_log.rm_id",rm_id,"=");
		res3.addClause("sc_stu_meter_log.fl_id",fl_id,"=");
		res3.addClause("sc_stu_meter_log.bl_id",bl_id,"=");	
		res3.addClause('sc_stu_meter_log.brand_elec_old', '', 'IS NOT NULL', 'AND', true);
		res3.addClause('sc_stu_meter_log.brand_elec_new', '', 'IS NOT NULL', 'AND', true);	
		this.elecGridPanel.refresh(res3,false);
	},
	editBrandPanel_onSave:function(){
		if(this.editBrandPanel.canSave()){
			var brand_cold_old=this.editBrandPanel.getFieldValue("sc_stu_meter_log.brand_cold_old");
			var brand_cold=this.editBrandPanel.getFieldValue("sc_stu_meter_log.brand_cold_new");
			if(!valueExistsNotEmpty(brand_cold)){
				brand_cold=brand_cold_old;
			}
			var brand_hot_old=this.editBrandPanel.getFieldValue("sc_stu_meter_log.brand_hot_old");
			var brand_hot=this.editBrandPanel.getFieldValue("sc_stu_meter_log.brand_hot_new");
			if(!valueExistsNotEmpty(brand_hot)){
				brand_hot=brand_hot_old;
			}
			var brand_elec_old=this.editBrandPanel.getFieldValue("sc_stu_meter_log.brand_elec_old");
			var brand_elec=this.editBrandPanel.getFieldValue("sc_stu_meter_log.brand_elec_new");
			if(!valueExistsNotEmpty(brand_elec)){
				brand_elec=brand_elec_old;
			}
			var thisController=this;
			var message="确定要保存数据吗";
			View.confirm(message, function(button, text){
				if(button=="yes"){
					try{
						var success=thisController.editBrandPanel.save();
						if(success){
							//更新rm表中冷水表、热水表、电表品牌
							var account = View.dataSources.get("rm_ds");
							var restriction = new Ab.view.Restriction();
				       		restriction.addClause("rm.bl_id", thisController.blId, "=");
				       		restriction.addClause("rm.fl_id", thisController.flId, "=");
				       		restriction.addClause("rm.rm_id", thisController.rmId, "=");
				       		
							var record=account.getRecord(restriction);
							record.setValue("rm.brand_cold_new",brand_cold);
							record.setValue("rm.brand_hot_new",brand_hot);
				    		record.setValue("rm.brand_elec_new",brand_elec);
				    		account.saveRecord(record);
				    		
				    		thisController.gridPanel.refresh();
				    		thisController.editBrandPanel.closeWindow();
						}
					}catch(e){
						Workflow.handleError(e);
						return;
					}
				}
			});			
		}
		this.coldGridPanel.refresh();
		this.hotGridPanel.refresh();
		this.elecGridPanel.refresh();
	},
	editManyBrandPanel_onSave:function(){		
		
		var thisController=this;
		
		var brand_cold_old=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.brand_cold_old");
		var brand_cold=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.brand_cold_new");
		if(!valueExistsNotEmpty(brand_cold)){
			brand_cold=brand_cold_old;
		}
		var brand_hot_old=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.brand_hot_old");
		var brand_hot=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.brand_hot_new");
		if(!valueExistsNotEmpty(brand_hot)){
			brand_hot=brand_hot_old;
		}
		var brand_elec_old=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.brand_elec_old");
		var brand_elec=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.brand_elec_new");
		if(!valueExistsNotEmpty(brand_elec)){
			brand_elec=brand_elec_old;
		}
		
		var brand_cause=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.cause");
		var brand_date_use=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.date_use");
		var brand_comments=this.editManyBrandPanel.getFieldValue("sc_stu_meter_log.comments");
		
		var selectedRecord = this.gridPanel.getSelectedRecords();
							
		var message="确定要保存数据吗";
		View.confirm(message, function(button, text){
			if(button=="yes"){
				for(var i=0;i<selectedRecord.length;i++){				    		    	
					//更新rm表中冷水表、热水表、电表品牌
					var rmAccount = View.dataSources.get("rm_ds");
					var restriction = new Ab.view.Restriction();
					var rm_id = selectedRecord[i].values["rm.rm_id"];
					var fl_id = selectedRecord[i].values["rm.fl_id"];
					var bl_id = selectedRecord[i].values["rm.bl_id"];
					var stu_in_year = selectedRecord[i].values["rm.stu_in_year"];
					var dv_id = selectedRecord[i].values["rm.dv_id"];
						
					restriction.addClause("rm.bl_id", bl_id, "=");
			       	restriction.addClause("rm.fl_id", fl_id, "=");
			       	restriction.addClause("rm.rm_id", rm_id, "=");
			       		
					var rmRecord=rmAccount.getRecord(restriction);
					rmRecord.setValue("rm.brand_cold_new",brand_cold);
					rmRecord.setValue("rm.brand_hot_new",brand_hot);
					rmRecord.setValue("rm.brand_elec_new",brand_elec);
					
					
					//插入一条更新的历史记录
					var meterAccount = View.dataSources.get("sc_stu_meter_log_ds");
					var meterRecord=new Ab.data.Record();					
							       		
					meterRecord.setValue("sc_stu_meter_log.brand_cold_new",brand_cold);
					meterRecord.setValue("sc_stu_meter_log.brand_cold_old",brand_cold_old);
					meterRecord.setValue("sc_stu_meter_log.brand_hot_new",brand_hot);
					meterRecord.setValue("sc_stu_meter_log.brand_hot_old",brand_hot_old);
					meterRecord.setValue("sc_stu_meter_log.brand_elec_new",brand_elec);
					meterRecord.setValue("sc_stu_meter_log.brand_elec_old",brand_elec_old);
					meterRecord.setValue("sc_stu_meter_log.cause",brand_cause);
					meterRecord.setValue("sc_stu_meter_log.date_use",brand_date_use);
					meterRecord.setValue("sc_stu_meter_log.comments",brand_comments);
					meterRecord.setValue("sc_stu_meter_log.stu_in_year",stu_in_year);
					meterRecord.setValue("sc_stu_meter_log.dv_id",dv_id);
					meterRecord.setValue("sc_stu_meter_log.bl_id",bl_id);
					meterRecord.setValue("sc_stu_meter_log.fl_id",fl_id);
					meterRecord.setValue("sc_stu_meter_log.rm_id",rm_id);
					
					//1、插入新的水电表更换记录
					meterAccount.saveRecord(meterRecord);
			    	
					//2、更新rm表中的水电表
					rmAccount.saveRecord(rmRecord);   
					
			    	var a;
				}		
				thisController.gridPanel.refresh();
				thisController.editManyBrandPanel.closeWindow();
			}
		});
	}
});