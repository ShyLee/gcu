var checkFalseController = View.createController('checkFalseController', {

	afterViewLoad: function(){
    	this.falseDataPanel.addParameter("errorinfo1","二级单位为空");
    	this.falseDataPanel.addParameter("errorinfo2","可占用面积大于房间面积");
    	this.falseDataPanel.addParameter("errorinfo3","办公区面积大于可占用面积");
    	this.falseDataPanel.addParameter("errorinfo4","不可占用面积大于房间面积");
    	this.falseDataPanel.addParameter("errorinfo5","房间面积小于0");
    	this.falseDataPanel.addParameter("errorinfo6","实际职工人数小于0");
    	this.falseDataPanel.addParameter("errorinfo7","人员平均面积大于房间面积");
    },
    edit:function(){
		var panel = this.falseDataPanel;
		var selectedIndex = panel.selectedRowIndex;
		var stdcode = panel.rows[selectedIndex]["dp.dp_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("dp.dp_id",stdcode);
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