var controller = View.createController('abSpAsgnEmToRm_Controller', {
	datecheckin:"",
	malfunction:"",
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
//------------------------弹出Panel滴-------------------------  	
	onGengxin: function (){
        var selectIndex = this.gridForm.selectedRowIndex;
        var paramRecord = this.gridForm.gridRows.get(selectIndex).getRecord();
        var paramId = paramRecord.getValue("sc_hos_repair.id");
		this.formForm.showInWindow({
            x: 100,
            y: 80,
            width: 550,
            height: 300,
            closeButton: false
        });
        var res = new Ab.view.Restriction();
        res.addClause("sc_hos_repair.id", paramId, '=');
        this.formForm.refresh(res, false);
	},
	formForm_onSave: function(){
		var id = this.formForm.getFieldValue('sc_hos_repair.id');
		var date_finish = this.formForm.getFieldValue('sc_hos_repair.date_finish');
		var cost_actual = this.formForm.getFieldValue('sc_hos_repair.cost_actual');
		if(date_finish==''){
			View.showMessage("请输入完成时间！");
			return;
		}
		if(cost_actual<=0){
			View.showMessage("实际费用不可以为0，请重新输入！");
			return;
		}
		var message="确定要更新申请单【"+id+"】信息？";
		View.confirm(message, function(button){
	         if (button == 'yes') {
            	try { 
            		doSubmitChanges();
            	}catch(e){
            		Workflow.handleError(e);
                	return ;
                }
	         }	
		 });
    }
});
//==============================================Function==============================================//
/**
 * 保存配置.
 */
function doSubmitChanges(){
	var account = View.dataSources.get("ds_form");
	try {
		var id=controller.formForm.getFieldValue("sc_hos_repair.id");
		var date_finish=controller.formForm.getFieldValue("sc_hos_repair.date_finish");
		var cost_actual=controller.formForm.getFieldValue("sc_hos_repair.cost_actual");
		var summarizes=controller.formForm.getFieldValue("sc_hos_repair.summarizes");
		var status="2";
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("sc_hos_repair.id", id, '=');
		var rec=account.getRecord(restriction);
	   
		rec.setValue("sc_hos_repair.status", status);
		rec.setValue("sc_hos_repair.date_finish", date_finish);
		rec.setValue("sc_hos_repair.cost_actual", cost_actual);
		rec.setValue("sc_hos_repair.summarizes", summarizes);
		account.saveRecord(rec);
	} catch (e) {
		Workflow.handleError(e);
		return;
	}
	View.panels.get("gridForm").refresh();
	View.panels.get("formForm").closeWindow();
}