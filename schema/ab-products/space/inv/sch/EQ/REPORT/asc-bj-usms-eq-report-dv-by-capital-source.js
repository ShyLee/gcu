var controller = View.createController('controller', {	
	afterViewLoad: function(){
		this.tablePanel.addParameter('JX', "教学");
		this.tablePanel.addParameter('KY', "科研");
		this.tablePanel.addParameter('JJ', "基建");
		this.tablePanel.addParameter('ZCJKDK', "自筹、捐款、贷款");
		this.tablePanel.addParameter('211JF', "211经费");
		this.tablePanel.addParameter('QT', "其他");
		this.tablePanel.addParameter('WZ', "未知");
		
		this.eqOwnTablePanel.addParameter('JX', "教学");
		this.eqOwnTablePanel.addParameter('KY', "科研");
		this.eqOwnTablePanel.addParameter('JJ', "基建");
		this.eqOwnTablePanel.addParameter('ZCJKDK', "自筹、捐款、贷款");
		this.eqOwnTablePanel.addParameter('211JF', "211经费");
		this.eqOwnTablePanel.addParameter('QT', "其他");
		this.eqOwnTablePanel.addParameter('WZ', "未知");
	},
	tablePanel_onReport: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqCapitalSourceReport",closeButton:false});
	}
});