var controller=View.createController('controller',{
	eqId:null,
	/**
     * 查看设备附件列表
     */
    gridPanel_onViewAttach:function(){
    	var selectIndex=this.gridPanel.selectedRowIndex;
		var addEqId=this.gridPanel.gridRows.get(selectIndex).getRecord().getValue('eq.add_eq_id');
		this.eqId=this.gridPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
        
		View.openDialog("asc-bj-usms-eq-attach-card.axvw",null,false,{
			x:150,
			y:200,
			width:900,
			height:400,
			addEqId:addEqId,
			eqId:this.eqId
		});
    },
    gridPanel_onRegist: function(row){
    	this.eqId=row.record['eq.eq_id'];
    	var eq_name=row.record['eq.eq_name'];
    	var brand=row.record['eq.brand'];
    	var eq_type=row.record['eq.eq_type'];
    	this.formPanel.showInWindow({
    	    x: 200, 
    	   	y: 200, 
    	    width: 700, 
    	   	height: 400,
    	    closeButton: false 
    	});
    	this.formPanel.refresh(null,true);
    	this.formPanel.setFieldValue('eq_repair.eq_id',this.eqId);
    	this.formPanel.setFieldValue('eq_repair.eq_name',eq_name);
    	this.formPanel.setFieldValue('eq_repair.brand',brand);
    	this.formPanel.setFieldValue('eq_repair.eq_type',eq_type);
    	this.formPanel.setFieldValue('eq_repair.date_register',new Date().format('Y-m-d'));
    },
    formPanel_onSave: function(){
    	if (this.formPanel.save()) {
			this.formPanel.closeWindow();
			View.alert('保存成功!');
			var res=new Ab.view.Restriction();
	        res.addClause('eq_repair.eq_id',this.eqId,'=');
			this.eqRepairGrid.refresh(res);
			this.eqRepairGrid.setTitle("设备【"+this.eqId+"】的维修记录");
			this.update_repair_counts();
		}
    },
    showEqRepairs: function(){
    	this.formPanel.closeWindow();
    	var selectIndex=this.gridPanel.selectedRowIndex;
    	this.eqId=this.gridPanel.gridRows.get(selectIndex).getRecord().getValue('eq.eq_id');
        var res=new Ab.view.Restriction();
        res.addClause('eq_repair.eq_id',this.eqId,'=');
		this.eqRepairGrid.refresh(res);
		this.eqRepairGrid.setTitle("设备【"+this.eqId+"】的维修记录");
    },
    eqRepairGrid_onDelete: function(){
    	var selected=this.eqRepairGrid.getSelectedRows();
    	if (selected.length<1) {
			View.alert('请选择要删除的项!');
			return;
		}
    	var controller=this;
		View.confirm('确认要删除吗？',function(button){
			if (button=='yes') {
				for ( var i = 0; i < selected.length; i++) {
					var delRecord = selected[i];
					var record = new Ab.data.Record({
						'eq_repair.eq_repair_id': delRecord['eq_repair.eq_repair_id']
					}, false);
					controller.eq_repair_ds.deleteRecord(record);
				}
				View.alert('成功删除! ');
				var res=new Ab.view.Restriction();
				res.addClause('eq_repair.eq_id',controller.eqId,'=');
				controller.eqRepairGrid.refresh(res);
				controller.eqRepairGrid.setTitle("设备【"+controller.eqId+"】的维修记录");
				controller.update_repair_counts();
			}
		});
    },
    /**
     * 更新设备的维修次数字段
     */
    update_repair_counts: function(){
    	var res=new Ab.view.Restriction();
    	res.addClause('eq_repair.eq_id',this.eqId);
    	var repairRecords=this.eq_repair_ds.getRecords(res);
    	var cost_repair=0;
    	for ( var i = 0; i < repairRecords.length; i++) {
			var fee=repairRecords[i].getValue('eq_repair.fee');
			cost_repair+=Number(fee);
		}
    	var eqRes=new Ab.view.Restriction();
    	eqRes.addClause('eq.eq_id',this.eqId);
    	var eqRecord=this.count_repair_eq_ds.getRecord(eqRes);
    	if (!eqRecord.isNew) {
    		eqRecord.setValue('eq.count_repair',repairRecords.length);
    		eqRecord.setValue('eq.cost_repair',cost_repair);
    		this.count_repair_eq_ds.saveRecord(eqRecord);
		}
    	this.gridPanel.refresh();
    },
    onClickEqRepair: function(){
    	var index=this.eqRepairGrid.selectedRowIndex;
    	var row=this.eqRepairGrid.rows[index];
    	var pk=row['eq_repair.eq_repair_id'];
    	var res=new Ab.view.Restriction();
    	res.addClause('eq_repair.eq_repair_id',pk,'=');
    	this.formPanel.showInWindow({
    	    x: 200, 
    	   	y: 200, 
    	    width: 700, 
    	   	height: 400,
    	    closeButton: false 
    	});
    	this.formPanel.refresh(res,false);
    }
    
	
});