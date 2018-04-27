
var checkoutDormController=View.createController('checkoutDormController', {
	init:function(){
		var index = this.detailsPanel.selectedRowIndex;
		var row = this.detailsPanel.rows[index];
		this.stu_no=row["sc_student.stu_no"];
		
		
		var restriction={'sc_student.stu_no':stu_no};
		this.detailsPanel.refresh(restriction);
	},
	
	refreshPnoto:function(){
//		this.detailsPanel.refresh();
//		this.detailsPanel.showInWindow({
//			x:100,
//			y:200,
//	        width: 600,
//	        height: 520,
//	        closeButton: true
//		})
		var image_file = this.detailsPanel.getFieldValue("sc_student.photo").toLowerCase();
		if (valueExistsNotEmpty(image_file)) {
			this.detailsPanel.showImageDoc('stu_photo_image', 'sc_student.stu_no', 'sc_student.photo');
    	}else {
    		this.detailsPanel.fields.get('stu_photo_image').dom.src = null;
    		this.detailsPanel.fields.get('stu_photo_image').dom.alt = '';
    	}
	},
	
	stuGridPanel_onDelete: function(){
		var grid = this.stuGridPanel;
		var selectedRecordList = grid.getSelectedRecords();
		if (selectedRecordList.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		stuDataSource = this.stu_ds;
		View.confirm('确定删除学生', function(button, text){
			if (button == 'yes') {
				for (var i = 0; i < selectedRecordList.length; i++) {
					var record = selectedRecordList[i];
					stuDataSource.deleteRecord(record);
				}
			}
			grid.refresh();
		});
	},
	stuGridPanel_onDownLoad: function(){
		var src=View.project.projectGraphicsFolder + '/model/StudentInfo.xls';
		window.open(src);
	},
	stuGridPanel_onImportXLS: function(){
		var controller = this
		View.openDialog('asc-bj-dorm-stu-info-import.axvw', null, false, {
			width: 600,
			height: 400,
			closeButton: false,
			afterViewLoad: function(dialogView) {
    			var dialogController = dialogView.controllers.get('importStudentController');
    		    dialogController.onClose = controller.dialog_onClose.createDelegate(controller);
    		}
		});
	},
	dialog_onClose:function(){
		var grid = this.stuGridPanel;
		grid.refresh();
	},
	stuGridPanel_onTest:function(){
        var result;
        try {
            result = Workflow.callMethod('AbSpaceRoomInventoryBAR-RMBHandler2-start');
        } 
        catch (e) {
            Workflow.handleError(e);
        }
	}
});




//function showCollegeByRestriction(){
//		var restriction = "dv.dv_name like '%学院%'"; 
//	
//		View.selectValue({
//	    	formId:"detailsPanel",
//	    	title: "",
//	    	fieldNames: ['sc_student.dv_id,dv.dv_name'],
//	    	selectTableName: 'dv',
//	    	selectFieldNames: ["dv.dv_id","dv.dv_name"],
//	    	visibleFieldNames: ["dv.dv_id","dv.dv_name"],
//	    	restriction: restriction
//		});
//	}
