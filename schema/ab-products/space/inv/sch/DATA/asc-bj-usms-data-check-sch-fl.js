var checkFalseController = View.createController('checkFalseController', {

	afterViewLoad: function(){
    	this.falseDataPanel.addParameter("errorinfo1","该楼层没有建筑物编码");
    	this.falseDataPanel.addParameter("errorinfo2","部门办公区总面积大于办公区总面积");
    	this.falseDataPanel.addParameter("errorinfo3","可用面积小于0");
    	this.falseDataPanel.addParameter("errorinfo4","办公区总面积小于0");
    	this.falseDataPanel.addParameter("errorinfo5","房间数小于0");
    },
    edit:function(){
		var panel = this.falseDataPanel;
		var selectedIndex = panel.selectedRowIndex;
		var stdcode = panel.rows[selectedIndex]["fl.fl_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("fl.fl_id",stdcode);
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