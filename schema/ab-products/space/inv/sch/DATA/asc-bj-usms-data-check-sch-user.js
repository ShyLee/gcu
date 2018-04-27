var checkFalseController = View.createController('checkFalseController', {

	afterViewLoad: function(){
    	this.falseDataPanel.addParameter("errorinfo1","参加工作时间大于当前日期");
    	this.falseDataPanel.addParameter("errorinfo2","聘用日期大于当前日期");
    	this.falseDataPanel.addParameter("errorinfo3","参加工作时间大于来校时间");
    	this.falseDataPanel.addParameter("errorinfo4","占用面积小于0");
    	this.falseDataPanel.addParameter("errorinfo5","公共区域总面积小于0");
    	this.falseDataPanel.addParameter("errorinfo6","员工的二级单位为空");
    },
    edit:function(){
		var panel = this.falseDataPanel;
		var selectedIndex = panel.selectedRowIndex;
		var stdcode = panel.rows[selectedIndex]["em.em_id"];
		var restriction = new Ab.view.Restriction();
		restriction.addClause("em.em_id",stdcode);
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