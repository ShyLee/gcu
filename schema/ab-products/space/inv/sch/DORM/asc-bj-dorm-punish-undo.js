var stuPunishController=View.createController('stuPunishController',{
	stuPunishGrid_onUndo:function(){
		var rows = this.stuPunishGrid.getSelectedRows();
		this.selectRows=rows;
		if (rows.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		for (var i = 0; i < rows.length; i++) {
			var pId=rows[i]["sc_stu_punish_log.id.key"];
			
			var restriction=new Ab.view.Restriction();
			restriction.addClause("sc_stu_punish_log.id",pId,"=");
		}
		this.stuUndoPunishDjform.refresh(restriction);
		this.stuUndoPunishDjform.showInWindow({
			x:300,
			y:100,
	        width: 700,
	        height: 450,
	        closeButton: false
		})
	},
	//去掉全选按钮
	stuPunishGrid_afterRefresh: function(){
		this.stuPunishGrid.enableSelectAll(false);
		this.selectedRow = null;
	},
	stuPunishGrid_multipleSelectionColumn_onClick: function(row){
		if(this.selectedRow != null){
			this.selectedRow.select(false);
		}
		if(row.isSelected()){
			this.selectedRow = row;
		}else{
			this.selectedRow = null;
		}
	},
	stuUndoPunishDjform_onSave:function(){
		var success=this.stuUndoPunishDjform.canSave();
		if(success){
			var date_backout=this.stuUndoPunishDjform.getFieldValue("sc_stu_punish_log.date_backout");
			var doc_backout=this.stuUndoPunishDjform.getFieldValue("sc_stu_punish_log.doc_backout");
			var backout_cause=this.stuUndoPunishDjform.getFieldValue("sc_stu_punish_log.backout_cause");
			var comments_backout=this.stuUndoPunishDjform.getFieldValue("sc_stu_punish_log.comments_backout");

			var rows = this.stuPunishGrid.getSelectedRows();
			this.selectRows=rows;
			var controller=this;
			for (var i = 0; i < rows.length; i++) {
				var pId=rows[i]["sc_stu_punish_log.id.key"];
				
				var restriction=new Ab.view.Restriction();
				restriction.addClause("sc_stu_punish_log.id",pId,"=");
				var account = View.dataSources.get("scStuPunishDs");
				
				var record=account.getRecord(restriction);
				record.setValue("sc_stu_punish_log.date_backout", date_backout);
				record.setValue("sc_stu_punish_log.backout_cause", backout_cause);
				record.setValue("sc_stu_punish_log.comments_backout", comments_backout);
				account.saveRecord(record);
			}
			this.stuPunishGrid.refresh();
			this.stuPunishUndoGrid.refresh();
			this.stuUndoPunishDjform.closeWindow();
			View.showMessage("撤销处分登记成功！");
			
		}
	}
});