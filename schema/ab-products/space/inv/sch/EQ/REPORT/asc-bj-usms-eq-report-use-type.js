var controller = View.createController('controller', {	
	afterViewLoad: function(){
//		1;教学;2;行政;3;科研;4;学生组织;5;后勤服务;
		this.tablePanel.addParameter('JX', "教学");
		this.tablePanel.addParameter('KY', "科研");
		this.tablePanel.addParameter('XZ', "行政");
		this.tablePanel.addParameter('XS', "学生组织");
		this.tablePanel.addParameter('HQ', "后勤服务");
		
		this.eqOwnTablePanel.addParameter('JX', "教学");
		this.eqOwnTablePanel.addParameter('KY', "科研");
		this.eqOwnTablePanel.addParameter('XZ', "行政");
		this.eqOwnTablePanel.addParameter('XS', "学生组织");
		this.eqOwnTablePanel.addParameter('HQ', "后勤服务");
	},
	tablePanel_onReport: function(){
//		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqCapitalSourceReport",closeButton:false});
	}
});