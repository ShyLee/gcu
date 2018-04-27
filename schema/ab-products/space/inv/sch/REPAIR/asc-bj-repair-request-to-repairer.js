var controller = View.createController('abSpAsgnEmToRm_Controller', {
	datecheckin:"",
	saveType:"edit",
    consoleForm_onShow:function(){
    	var malfunction = this.consoleForm.getFieldValue('sc_hos_repair.malfunction');
		var rec2 = new Ab.view.Restriction();
		if(malfunction!=""){
			rec2.addClause('sc_hos_repair.malfunction', "%"+malfunction+"%",'like');
		}
    	this.gridForm.refresh(rec2);
    },
    consoleForm_onJianzhuwu:function(){
    	var blid = "";
		var rec2 = new Ab.view.Restriction();
		rec2.addClause('sc_hos_repair.bl_id', blid,'is not null');
    	this.gridForm.refresh(rec2);
    },
    consoleForm_onFeijianzhuwu:function(){
    	var blid = "";
    	var rec3 = new Ab.view.Restriction();
    	rec3.addClause('sc_hos_repair.bl_id', blid,'is null');
    	this.gridForm.refresh(rec3);
    },
    consoleForm_onClear:function(){
    	var res = new Ab.view.Restriction();
		this.consoleForm.clear();
    	this.gridForm.refresh(res);
    },
	gridForm_onDelete:function(){
		var selects=this.gridForm.getSelectedRows();
		if(selects.length<1){
			View.showMessage(getMessage('message'));
		}else{
			var confirmMessage="确定要删除选中的维修记录吗？";
			 View.confirm(confirmMessage, function(button){
		            if (button == 'yes') {
		            	try { 
		            		deleteall();
		            	}catch(e){
		            		Workflow.handleError(e);
		                	 return ;
		                 }
		           }	
			 });
		}
	},
//------------------------弹出Panel滴-------------------------  	
	consoleForm_onAdd: function (){
		this.formForm.showInWindow({
            x: 100,
            y: 80,
            width: 900,
            height: 600,
            closeButton: false
        });
		this.formForm.refresh([],true);
		this.saveType="save";
	},
	onXiugai: function (){
        var selectIndex = this.gridForm.selectedRowIndex;
        var paramRecord = this.gridForm.gridRows.get(selectIndex).getRecord();
        var paramId = paramRecord.getValue("sc_hos_repair.id");
		this.formForm.showInWindow({
            x: 100,
            y: 80,
            width: 900,
            height: 600,
            closeButton: false
        });
        var res = new Ab.view.Restriction();
        res.addClause("sc_hos_repair.id", paramId, '=');
        this.formForm.refresh(res, false);
        this.saveType="edit";
	},
	formForm_onSave: function(){
		if(this.saveType=="save"){
			var id="";
			 try {
		         var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-HousePKValueHander-getPKValue',2);
		         if (result.code == 'executed') {
					id=result.message;
		         }
		        } 
		        catch (e) {
		            Workflow.handleError(e);
		        }         
		    this.formForm.setFieldValue('sc_hos_repair.id',id);
		    if(this.formForm.canSave()){
				
				var success=this.formForm.save();
				if(success){
					this.formForm.closeWindow();
					this.gridForm.refresh();
				}
			}
		}else if(this.saveType=="edit"){
			if(this.formForm.canSave()){
				
				var success=this.formForm.save();
				if(success){
					this.formForm.closeWindow();
					this.gridForm.refresh();
				}
			}
		}
	}
    
});
function deleteall(){
	var dsEmp = View.dataSources.get("ds_form");
	var grid = View.panels.get("gridForm");
	var selects=controller.gridForm.getSelectedRows();
	for(var i=0;i<selects.length;i++){
		var id=selects[i]["sc_hos_repair.id"];
		var rec2 = new Ab.data.Record();
		rec2.setValue("sc_hos_repair.id", id);
		dsEmp.deleteRecord(rec2);
		}
	View.panels.get("gridForm").refresh();
}