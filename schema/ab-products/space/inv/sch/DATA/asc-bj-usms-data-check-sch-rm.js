var checkFalseController = View.createController('checkFalseController', {

	afterViewLoad: function(){
    	this.falseDataPanel.addParameter("errorinfo1","没有建筑物编码");
    	this.falseDataPanel.addParameter("errorinfo2","没有楼层编码");
    	this.falseDataPanel.addParameter("errorinfo3","没有二级单位编码");
    	this.falseDataPanel.addParameter("errorinfo4","没有一级单位编码");
    	this.falseDataPanel.addParameter("errorinfo5","房间净使用面积大于使用面积");
    	this.falseDataPanel.addParameter("errorinfo6","已租赁资源大于总租赁资源");
    	this.falseDataPanel.addParameter("errorinfo7","建筑面积小于使用面积");
    },
    edit:function(){
		var panel = this.falseDataPanel;
		var selectedIndex = panel.selectedRowIndex;
		var stdcode = panel.rows[selectedIndex]["rm.rm_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.rm_id",stdcode);
		this.editPanel.refresh(restriction);
		this.editPanel.showInWindow({
			x:300,
			y:300,
			width: 700,
			height: 700
		})
	},
	editPanel_onSave:function(){
		this.editPanel.save();
		View.showMessage("保存成功");
		this.falseDataPanel.refresh();
		this.editPanel.closeWindow();
	}
})