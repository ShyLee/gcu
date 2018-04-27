var checkFalseController = View.createController('checkFalseController', {

	afterViewLoad: function(){
    	this.falseDataPanel.addParameter("errorinfo1","公共面积大于建筑面积");
    	this.falseDataPanel.addParameter("errorinfo2","没有园区编码");
    	this.falseDataPanel.addParameter("errorinfo3","没有片区编码");
    	this.falseDataPanel.addParameter("errorinfo4","使用面积大于建筑面积");
    	this.falseDataPanel.addParameter("errorinfo5","净占地面积大于占地面积");
    	this.falseDataPanel.addParameter("errorinfo6","净使用面积大于净占地面积");
    	this.falseDataPanel.addParameter("errorinfo7","折旧价值大于原值");
    },
    edit:function(){
		var panel = this.falseDataPanel;
		var selectedIndex = panel.selectedRowIndex;
		var stdcode = panel.rows[selectedIndex]["bl.bl_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id",stdcode);
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