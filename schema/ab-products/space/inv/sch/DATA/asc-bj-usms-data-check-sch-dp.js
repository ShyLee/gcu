var checkFalseController = View.createController('checkFalseController', {

	afterViewLoad: function(){
    	this.falseDataPanel.addParameter("errorinfo1","可占用面积大于建筑面积");
    	this.falseDataPanel.addParameter("errorinfo2","使用面积大于建筑面积");
    	this.falseDataPanel.addParameter("errorinfo3","净使用面积大于使用面积");
    	this.falseDataPanel.addParameter("errorinfo4","定额面积大于建筑面积");
    	this.falseDataPanel.addParameter("errorinfo5","房间数小于0");
    	this.falseDataPanel.addParameter("errorinfo6","一级单位不存在");
    },
    edit:function(){
		var panel = this.falseDataPanel;
		var selectedIndex = panel.selectedRowIndex;
		var stdcode = panel.rows[selectedIndex]["dv.dv_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("dv.dv_id",stdcode);
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