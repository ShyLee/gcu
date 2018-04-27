var scRepairEngineerController = View.createController('scRepairEngineerController',{
	saveType:"edit",
	consoleForm_onShow:function(){
    	var malfunction = this.consoleForm.getFieldValue('sc_hos_repair.malfunction');
		var rec2 = new Ab.view.Restriction();
		rec2.addClause('sc_hos_repair.malfunction', "%"+malfunction+"%",'like');
    	this.gridEngineerPanel.refresh(rec2);
    },
    consoleForm_onJianzhuwu:function(){
    	var blid = "";
		var rec2 = new Ab.view.Restriction();
		rec2.addClause('sc_hos_repair.bl_id', blid,'is not null');
    	this.gridEngineerPanel.refresh(rec2);
    },
    consoleForm_onFeijianzhuwu:function(){
    	var blid = "";
    	var rec3 = new Ab.view.Restriction();
    	rec3.addClause('sc_hos_repair.bl_id', blid,'is null');
    	this.gridEngineerPanel.refresh(rec3);
    },
    consoleForm_onClear:function(){
    	var res = new Ab.view.Restriction();
		this.consoleForm.clear();
    	this.gridForm.refresh(res);
    },
    consoleForm_onNew:function(){
		var emId=this.view.user.employee.id;
		var emName = getEmName(emId);
		
		this.formEngineerPanel.showInWindow({
			x:100,
			y:80,
			width:800,
			height:600,
			closeButton:false 
		});
		this.formEngineerPanel.refresh([],true);
		this.formEngineerPanel.setFieldValue('sc_hos_repair.engineer_name','施工申请');
		this.formEngineerPanel.setFieldValue('sc_hos_repair.dv_cons','广州洪峰房地产有限公司');
		this.formEngineerPanel.setFieldValue('sc_hos_repair.dv_copy','采购与招标管理中心');
		this.formEngineerPanel.setFieldValue('sc_hos_repair.dv_apply','后勤处');
		this.formEngineerPanel.setFieldValue('sc_hos_repair.em_apply',emId);
		this.formEngineerPanel.setFieldValue('em.name',emName);
		var curDate = new Date();
		this.formEngineerPanel.setFieldValue('sc_hos_repair.date_apply',curDate);
		this.saveType="save";
	},
	gridEngineerPanel_onEdit:function(){
		var selectIndex = this.gridEngineerPanel.selectedRowIndex;
        var paramRecord = this.gridEngineerPanel.gridRows.get(selectIndex).getRecord();
        var paramId = paramRecord.getValue("sc_hos_repair.id");
		this.formEngineerPanel.showInWindow({
			x:100,
			y:80,
			width:800,
			height:600,
			closeButton:false 
		});
		var res = new Ab.view.Restriction();
        res.addClause("sc_hos_repair.id", paramId, '=');
        this.formEngineerPanel.refresh(res, false);
        this.saveType="edit";
	},
	formEngineerPanel_onSave:function(){
		
		if(this.saveType=="save"){
			var id="";
			 try {
		         var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-HousePKValueHander-getPKValue',1);
		         if (result.code == 'executed') {
					id=result.message;
		         }
		        } 
		        catch (e) {
		            Workflow.handleError(e);
		        }         
		    this.formEngineerPanel.setFieldValue('sc_hos_repair.id',id);
		    if(this.formEngineerPanel.canSave()){
				
				var success=this.formEngineerPanel.save();
				if(success){
					this.formEngineerPanel.closeWindow();
					this.gridEngineerPanel.refresh();
				}
			}
		}else if(this.saveType=="edit"){
			if(this.formEngineerPanel.canSave()){
				
				var success=this.formEngineerPanel.save();
				if(success){
					this.formEngineerPanel.closeWindow();
					this.gridEngineerPanel.refresh();
				}
			}
		}	
		
	},
	formEngineerPanel_onReport:function(){
		var Id=this.formEngineerPanel.getFieldValue("sc_hos_repair.id");
			
		
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {
	            width: 470,
	            height: 200,
	            xmlName: "asc-repair-requestSheet",
	             parameters: {
	                 'applyId':Id
	             },
	            closeButton: false
	        });
	},
	gridEngineerPanel_onDelete: function(){
		var grid = this.gridEngineerPanel;
		var selectedRecordList = grid.getSelectedRecords();
		if (selectedRecordList.length == 0) {
			View.alert('请选择要操作的数据');
			return;
		}
		stuDataSource = this.sc_engineer_ds;
		View.confirm('确定要删除选中的维修记录吗？', function(button, text){
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

function getEmName(emId){
	var parameters = {
 			tableName: 'em',
 			fieldNames: toJSON(['em.name']),
 			restriction: "em.em_id ='" + emId + "'"
 		};
		var name="";
 		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
 		if (result.data.records.length > 0) {
 			name = result.data.records[0]['em.name'];
 		}
 		return name;
}
