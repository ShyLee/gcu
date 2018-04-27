var ascBjUsmsDefineApproveRoleController = View.createController("ascBjUsmsDefineApproveRoleController", {

    panel_roles_afterRefresh: function(){
        var role = this.panel_roles.getFieldValue('helpdesk_roles.role');
        if (!role) {
            this.panel_roles.setFieldValue('helpdesk_roles.step_type', 'approval');
            this.panel_roles.setFieldValue('helpdesk_roles.class', 'com.archibus.service.school.lc.RoleLookUp');
        }
        else {
            refreshEnployeeList();
        }
    },
    /**
     * if change the helpdesk_roles.role, it should sysc update the sc_role_em.role
     */
	panel_roles_onSave:function(){
		//1 if update, get old role; if new, directly save and return
		var newRecord = this.panel_roles.newRecord;
		var oldRoleValue = "";
		if (newRecord){
			this.panel_roles.save();
			return;
		}else{
			var oldRoleValue = this.panel_roles.getOldFieldValues()[("helpdesk_roles.role")];
			this.panel_roles.save();
		}
		//2 update and sysc update sc_role_em
		var newRoleValue = this.panel_roles.getFieldValue("helpdesk_roles.role");
		if (newRoleValue == oldRoleValue){
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause("sc_role_em.role", oldRoleValue, "=");
		var records = this.grid_roles_em_DS.getRecords(restriction);
		
		if (records.length > 0) {
            var recNum = records.length;
            
            for (var i = 0; i < recNum; i++) {
				var rec = records[i];
				var emId = rec.getValue('sc_role_em.em_id');
				var oldRecord = null;
                    oldRecord = new Ab.data.Record({
                        'sc_role_rm.role': oldRoleValue,
                        'sc_role_rm.em_id': emId
                    }, true);
				rec.setValue("sc_role_em.role",newRoleValue);
				this.grid_roles_em_DS.saveRecord(rec);
				this.grid_roles_em_DS.deleteRecord(oldRecord);
				
            }
        }
		alert("保存成功！");
	},
    grid_roles_em_onAdd: function(){
        var role = this.panel_roles.getFieldValue('helpdesk_roles.role');
        if (role) {
            this.grid_em.addParameter('role', role);
            this.grid_em.refresh();
            this.grid_em.showInWindow({
                width: 1200,
                height: 600
            });
        }
        
    }
});

function addEmployee(){
    var records = ascBjUsmsDefineApproveRoleController.grid_em.getSelectedRecords();
    var role = ascBjUsmsDefineApproveRoleController.panel_roles.getFieldValue('helpdesk_roles.role');
    for (var i = 0; i < records.length; i++) {
        var newRcord = new Ab.data.Record();
        newRcord.setValue("sc_role_em.em_id", records[i].getValue('em.em_id'));
        newRcord.setValue("sc_role_em.role", role);
        ascBjUsmsDefineApproveRoleController.grid_roles_em_DS.saveRecord(newRcord);
    }
    
    ascBjUsmsDefineApproveRoleController.grid_em.closeWindow();
    refreshEnployeeList();
}

function refreshEnployeeList(){
    var role = ascBjUsmsDefineApproveRoleController.panel_roles.getFieldValue('helpdesk_roles.role');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('sc_role_em.role', role, '=');
    ascBjUsmsDefineApproveRoleController.grid_roles_em.refresh(restriction);
}
