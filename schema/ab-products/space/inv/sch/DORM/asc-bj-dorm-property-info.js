var scDormPropertyController=View.createController('scDormPropertyController',{
	scPropertyGridPanel_onImport:function(){
		View.openDialog('asc-bj-dorm-property-import.axvw',null, false, {
			width: 800,
			height: 400,
			closeButton: false
		});
	},
	scPropertyGridPanel_onDownload: function(){
		var src=View.project.projectGraphicsFolder + '/model/PropertyInfo.xls';
		window.open(src);
	},
	scPropertyGridPanel_onDelete: function(){
		var grid = this.scPropertyGridPanel;
		var selectedRecordList = grid.getSelectedRecords();
		if (selectedRecordList.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		stuDataSource = this.sc_property_ds;
		View.confirm('确定删除物业人员？', function(button, text){
			if (button == 'yes') {
				for (var i = 0; i < selectedRecordList.length; i++) {
					var record = selectedRecordList[i];
					stuDataSource.deleteRecord(record);
				}
			}
			grid.refresh();
		});
	}
});
