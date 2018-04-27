var scRepairEngineerController = View.createController('scRepairEngineerController',{
	
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
    	this.gridEngineerPanel.refresh(res);
    },
    gridEngineerPanel_onUpdate: function (){
        var selectIndex = this.gridEngineerPanel.selectedRowIndex;
        var paramRecord = this.gridEngineerPanel.gridRows.get(selectIndex).getRecord();
        var paramId = paramRecord.getValue("sc_hos_repair.id");
		this.formForm.showInWindow({
            x: 150,
            y: 100,
            width: 550,
            height: 300,
            closeButton: false
        });
        var res = new Ab.view.Restriction();
        res.addClause("sc_hos_repair.id", paramId, '=');
        this.formForm.refresh(res, false);
	},
	formForm_onSave: function(){
		this.formForm.setFieldValue("sc_hos_repair.status","2");
		var success=this.formForm.save();
		if(success){
			this.formForm.closeWindow();
			this.gridEngineerPanel.refresh();
			View.showMessage("更新成功！");
		}
	}

});
