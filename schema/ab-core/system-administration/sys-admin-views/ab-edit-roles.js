var abEditRolesController = View.createController('abEditRolesController', {
	newRoleName: "",
	//初始化安全组为 ‘%’
    initValue: function(){
    	this.newRoleName = this.detailsPanel.getFieldValue('afm_roles.role_name');
    	this.grouprolePanel.setFieldValue('afm_groupsforroles.role_name',this.newRoleName);
    },
    //默认分配安全组
    saveToGroupsforroles: function(){
		this.grouprolePanel.save();
    },
	deleteGroupsforroles:function(){
		this.grouprolePanel.deleteRecord();
	}
});