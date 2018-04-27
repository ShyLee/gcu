var controller = View.createController('controller', {	
	afterViewLoad: function(){
		this.tablePanel.addParameter('gt400k', "7单价大于等于400K元");
		this.tablePanel.addParameter('gt200k', "6单价在200K元至400K元");
		this.tablePanel.addParameter('gt100k', "5单价在100K元至200K元");
		this.tablePanel.addParameter('gt10k', "4单价在10K元至100K元");
		this.tablePanel.addParameter('gt800', "3单价在800元至10K元");
		this.tablePanel.addParameter('gt500', "2单价在500元至800元");
		this.tablePanel.addParameter('lt500', "1单价小于500元");
		
		this.eqOwnTablePanel.addParameter('gt400k', "7单价大于等于400K元");
		this.eqOwnTablePanel.addParameter('gt200k', "6单价在200K元至400K元");
		this.eqOwnTablePanel.addParameter('gt100k', "5单价在100K元至200K元");
		this.eqOwnTablePanel.addParameter('gt10k', "4单价在10K元至100K元");
		this.eqOwnTablePanel.addParameter('gt800', "3单价在800元至10K元");
		this.eqOwnTablePanel.addParameter('gt500', "2单价在500元至800元");
		this.eqOwnTablePanel.addParameter('lt500', "1单价小于500元");
	},
	tablePanel_onReport: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqDvManageReport",closeButton:false});
	}
});