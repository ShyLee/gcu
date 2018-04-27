var stuPunishController=View.createController('stuPunishController',{
	dispId:null,
	punishId:null,
	/**
	 * 打开登记处分界面
	 * 
	 */
	stuAwardGrid_onPunishDJ:function(){
		var rows = this.stuAwardGrid.getSelectedRows();
		if (rows.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		this.stuPunishDjform.refresh([],true);
		this.stuPunishDjform.showInWindow({
			x:300,
			y:100,
	        width: 700,
	        height: 450,
	        closeButton: false
		})
		for (var i = 0; i < rows.length; i++) {
			var pId=rows[i]["sc_stu_disp_log.id.key"];
			var stuInYear=rows[i]["sc_stu_disp_log.stu_in_year"];
			var dvId=rows[i]["sc_stu_disp_log.dv_id"];
			var dvName=rows[i]["dv.dv_name"];
			var stuNo = rows[i]["sc_stu_disp_log.stu_no"];
			var stuName =rows[i]["sc_stu_disp_log.stu_name"];
			var proId = rows[i]["sc_stu_disp_log.pro_id"];
			var proName = rows[i]["sc_stu_profession.pro_name"];
			var stuSex = rows[i]["sc_stu_disp_log.stu_sex.raw"];
			
	    	this.stuPunishDjform.setFieldValue("sc_stu_punish_log.stu_no", stuNo);
			this.stuPunishDjform.setFieldValue("sc_stu_punish_log.punish_id", pId);
			this.stuPunishDjform.setFieldValue("sc_stu_punish_log.stu_name", stuName);
			this.stuPunishDjform.setFieldValue("sc_stu_punish_log.pro_id", proId);
			this.stuPunishDjform.setFieldValue("sc_stu_profession.pro_name", proName);
			this.stuPunishDjform.setFieldValue("sc_stu_punish_log.dv_id", dvId);
			this.stuPunishDjform.setFieldValue("dv.dv_name", dvName);
			this.stuPunishDjform.setFieldValue("sc_stu_punish_log.stu_in_year", stuInYear);
			this.stuPunishDjform.setFieldValue("sc_stu_punish_log.stu_sex", stuSex);
		}
	},
	//删除
	stuPunishGrid_onDels:function(){
		var rows = this.stuPunishGrid.getPrimaryKeysForSelectedRows();
		if (rows.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		for(var i=0;i<rows.length;i++){
			var punishDs = View.dataSources.get("scStuPunishDs");
			var id=rows[i]["sc_stu_punish_log.id.key"];
			var restriction=new Ab.view.Restriction();
			restriction.addClause("sc_stu_punish_log.id",id,"=");
			var record=punishDs.getRecord(restriction);
			punishDs.deleteRecord(record);
		}
		this.stuPunishGrid.refresh();
	},
	//去掉全选按钮
	stuAwardGrid_afterRefresh: function(){
		this.stuAwardGrid.enableSelectAll(false);
		this.selectedRow = null;
	},
	//只能单选
	stuAwardGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	//保存
	stuPunishDjform_onSave:function(){	
		var success=this.stuPunishDjform.canSave();
		if(success){
			this.stuPunishDjform.save();
			this.stuAwardGrid.refresh();
			this.stuPunishGrid.refresh();
			View.showMessage("处分登记成功,请上传附件！");
		}
	},
	showPanel:function(){
		var selectedIndex = this.stuAwardGrid.selectedRowIndex;
		var dispId=this.stuAwardGrid.rows[selectedIndex]["sc_stu_disp_log.id.key"];
		var res=new Ab.view.Restriction();
		res.addClause('sc_stu_punish_log.punish_id',dispId,"=");
		this.stuPunishGrid.refresh(res);
		
	}	
});
