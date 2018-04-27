var controller=View.createController('othersDormAssignController', {
	gridForm_onDelete:function(){
		var grid = this.gridForm;
		var selectedRecordList = grid.getSelectedRecords();
		if (selectedRecordList.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		var stuDataSource = this.sc_other_assign_ds;
		View.confirm('确定删除选中的外来人员记录？', function(button, text){
			if (button == 'yes') {
				for (var i = 0; i < selectedRecordList.length; i++) {
					var record = selectedRecordList[i];
					stuDataSource.deleteRecord(record);
				}
				grid.refresh();
			}
		});
	}
});




