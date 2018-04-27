var controller=View.createController('controller',{
	
	afterInitialDataFetch:function(){
		this.refreshPanel(true);
		this.studentLogGridPanel.show(false);
	},
	refreshPanel:function(autoShow){
		this.studentLogGridPanel.show(false);
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
		res1.addClause("sc_student.rm_id",rm_id,"=");
		res1.addClause("sc_student.fl_id",fl_id,"=");
		res1.addClause("sc_student.bl_id",bl_id,"=");
		this.studentGridPanel.refresh(res1);
		
		var res2= new Ab.view.Restriction();
		res2.addClause("sc_em.rm_id",rm_id,"=");
		res2.addClause("sc_em.fl_id",fl_id,"=");
		res2.addClause("sc_em.bl_id",bl_id,"=");	
		this.counsellorGridPanel.refresh(res2);
		
		var res3= new Ab.view.Restriction();
		res3.addClause("sc_stu_other.rm_id",rm_id,"=");
		res3.addClause("sc_stu_other.fl_id",fl_id,"=");
		res3.addClause("sc_stu_other.bl_id",bl_id,"=");	
		this.otherGridPanel.refresh(res3);
	},	
	refreshCountKey:function(flag){
		this.studentLogGridPanel.show(false);
		var key;
		if(flag){
			key="1";
		}else{
			key="0";
		}
		var panel = this.gridPanel;
		var selectedIndex=panel.selectedRowIndex;
		var rm_id = panel.rows[selectedIndex]["rm.rm_id"];
		var fl_id = panel.rows[selectedIndex]["rm.fl_id"];
		var bl_id = panel.rows[selectedIndex]["rm.bl_id"];
		
		var res1= new Ab.view.Restriction();				
		res1.addClause("sc_student.rm_id",rm_id,"=");
		res1.addClause("sc_student.fl_id",fl_id,"=");
		res1.addClause("sc_student.bl_id",bl_id,"=");
		res1.addClause("sc_student.is_key",key,"=");
		this.studentGridPanel.refresh(res1);
		
		var res2= new Ab.view.Restriction();
		res2.addClause("sc_em.rm_id",rm_id,"=");
		res2.addClause("sc_em.fl_id",fl_id,"=");
		res2.addClause("sc_em.bl_id",bl_id,"=");	
		res2.addClause("sc_em.is_key",key,"=");	
		this.counsellorGridPanel.refresh(res2);
		
		var res3= new Ab.view.Restriction();
		res3.addClause("sc_stu_other.rm_id",rm_id,"=");
		res3.addClause("sc_stu_other.fl_id",fl_id,"=");
		res3.addClause("sc_stu_other.bl_id",bl_id,"=");	
		res3.addClause("sc_stu_other.is_key",key,"=");	
		this.otherGridPanel.refresh(res3);
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
	changeKey:function(){
		var user = this.view.user;
		var id = user.employee.id;
		var dsEm = View.dataSources.get("sc_em_ds");
		var res=new Ab.view.Restriction();
		res.addClause('sc_em.em_id',id,'=');
		var record=dsEm.getRecord(res);
		var name = record.getValue("sc_em.name");
		var selectedRecord = this.gridPanel.getSelectedRecords();
		for (var i = 0; i < selectedRecord.length; i++) {
			var row = selectedRecord[0];   
			var bl_id = row.values["rm.bl_id"];
			var fl_id = row.values["rm.fl_id"];
			var rm_id = row.values["rm.rm_id"];
			var num_old = row.values["rm.count_key"];
		}
		if(selectedRecord.length>0){
			
			this.studentLogPanel.refresh();
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.bl_id",bl_id);
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.fl_id",fl_id);
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.rm_id",rm_id);
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.num_old",num_old);
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.name",name);
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.num_new","");
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.reason","");
			this.studentLogPanel.setFieldValue("sc_stu_keys_log.change_date","");
			this.studentLogPanel.setTitle("钥匙变更");
			this.studentLogPanel.showInWindow({
				 x:200,
				 y:200,
				 width: 550,
				 height: 400
			});
				
		}else{
			View.showMessage("请选择需要变更的房间");
			return;
		}
	},
	saveChangeLog:function(){
		var dsRmStuLog = View.dataSources.get("sc_student_keys_log_ds");
		var dsRm = View.dataSources.get("rm_ds2");
				
		var bl_id=this.studentLogPanel.getFieldValue("sc_stu_keys_log.bl_id");
		var fl_id=this.studentLogPanel.getFieldValue("sc_stu_keys_log.fl_id");
		var rm_id=this.studentLogPanel.getFieldValue("sc_stu_keys_log.rm_id");
		var num_old=this.studentLogPanel.getFieldValue("sc_stu_keys_log.num_old");
		var num_new=this.studentLogPanel.getFieldValue("sc_stu_keys_log.num_new");
		var name=this.studentLogPanel.getFieldValue("sc_stu_keys_log.name");
		var reason=this.studentLogPanel.getFieldValue("sc_stu_keys_log.reason");		
		var change_date=this.studentLogPanel.getFieldValue("sc_stu_keys_log.change_date");
		
		if(this.studentLogPanel.canSave()){		
			if(num_old==num_new){
				View.showMessage("变更前后钥匙数无变化，变更失败");
				return;
			}							
				//更新rm表的信息
				var restriction = new Ab.view.Restriction();
				restriction.addClause("rm.bl_id", bl_id, "=");
				restriction.addClause("rm.fl_id", fl_id, "=");
				restriction.addClause("rm.rm_id", rm_id, "=");
				var Record=dsRm.getRecord(restriction);
				Record.setValue("rm.count_key", num_new);	
				dsRm.saveRecord(Record);
				//插入一条log记录
				var rec = new Ab.data.Record();
	            rec.isNew = true;
	            rec.setValue("sc_stu_keys_log.reason", reason);
	            rec.setValue("sc_stu_keys_log.num_new", num_new);
	            rec.setValue("sc_stu_keys_log.change_date", change_date);
	            rec.setValue("sc_stu_keys_log.bl_id", bl_id);
	            rec.setValue("sc_stu_keys_log.fl_id", fl_id);
	            rec.setValue("sc_stu_keys_log.rm_id", rm_id);
	            rec.setValue("sc_stu_keys_log.num_old", num_old);
	            rec.setValue("sc_stu_keys_log.name", name);
	            dsRmStuLog.saveRecord(rec);
				this.gridPanel.refresh();
				this.studentLogPanel.closeWindow();
				View.showMessage("变更成功");
			
		}
	},
	showChangeList:function(){
		this.LogListPanel.refresh();
		this.LogListPanel.setTitle("钥匙变更历史");
		this.LogListPanel.showInWindow({
			 x:100,
			 y:200,
			 width: 900,
			 height: 600
		});
	},
	
	//下载导入模板
	gridPanel_onDownload: function(){
		var src=View.project.projectGraphicsFolder + '/model/DormKeysInfo.xls';
		window.open(src);
	},
	//导入钥匙总数，备用钥匙数
	gridPanel_onImport: function(){
   	 View.openDialog("asc-bj-dorm-key-import.axvw", null, false, {
           width: 750,
           height: 320
       });
       this.gridPanel.refresh();
   },
	refreshKey:function(){
		this.studentGridPanel.show(false);
		this.studentLogGridPanel.show(true);
		/*var key;
		if(flag){
			key="1";
		}else{
			key="0";
		}*/
		var panel = this.gridPanel;
		var selectedIndex=panel.selectedRowIndex;
		var rm_id = panel.rows[selectedIndex]["rm.rm_id"];
		var fl_id = panel.rows[selectedIndex]["rm.fl_id"];
		var bl_id = panel.rows[selectedIndex]["rm.bl_id"];
		
		var res1= new Ab.view.Restriction();				
		res1.addClause("sc_stu_log.rm_id",rm_id,"=");
		res1.addClause("sc_stu_log.fl_id",fl_id,"=");
		res1.addClause("sc_stu_log.bl_id",bl_id,"=");
		res1.addClause("sc_stu_log.is_key","2","=");
		this.studentLogGridPanel.refresh(res1);
		
		var res2= new Ab.view.Restriction();
		res2.addClause("sc_em.rm_id",rm_id,"=");
		res2.addClause("sc_em.fl_id",fl_id,"=");
		res2.addClause("sc_em.bl_id",bl_id,"=");	
		res2.addClause("sc_em.is_key","2","=");	
		this.counsellorGridPanel.refresh(res2);
		
		var res3= new Ab.view.Restriction();
		res3.addClause("sc_stu_other.rm_id",rm_id,"=");
		res3.addClause("sc_stu_other.fl_id",fl_id,"=");
		res3.addClause("sc_stu_other.bl_id",bl_id,"=");	
		res3.addClause("sc_stu_other.is_key","2","=");	
		this.otherGridPanel.refresh(res3);
	}
});