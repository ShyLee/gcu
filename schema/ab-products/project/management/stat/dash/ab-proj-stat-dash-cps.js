var projStatDashCpsController = View.createController('projStatDashCps',{
	
	// pull-down menu entries
	menuCpsAdd: new Array('add1','add2','add3'),
	menuReports: new Array('report1','report2'),
	menuTools: new Array('tool1','tool2'),
	
	afterViewLoad: function() {

    },
	
    afterInitialDataFetch: function(){
    	var titleObjCpsAdd = Ext.get('cpsAdd');
        titleObjCpsAdd.on('click', this.showCpsAddMenu, this, null);
        var titleObjReports = Ext.get('reports');
        titleObjReports.on('click', this.showReportsMenu, this, null);
        var titleObjTools = Ext.get('tools');
        titleObjTools.on('click', this.showToolsMenu, this, null);
    },
    
    showCpsAddMenu: function(e, item){
    	this.showMenu(e, this.menuCpsAdd, this.onCpsAddButtonPush);
    },
    
    showReportsMenu: function(e, item){
    	this.showMenu(e, this.menuReports, this.onReportsButtonPush);
    },
    
    showToolsMenu: function(e, item){
    	this.showMenu(e, this.menuTools, this.onToolsButtonPush);
    },
    
	/*
	 * show pull-down menu.
	 */
	showMenu: function(e, menuArr, handler){
		var menuItems = [];
		for(var i = 0; i < menuArr.length; i++){
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + menuArr[i]),
				handler: handler.createDelegate(this, [menuArr[i]])});

			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.showAt(e.getXY());
	},
	
	onCpsAddButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'add1':
			View.openDialog('ab-proj-stat-dash-inv.axvw', this.projStatDashCps_cps.restriction, true);
			break;
		case 'add2':
			View.openDialog('ab-proj-stat-dash-chg.axvw', this.projStatDashCps_cps.restriction, true);
			break;
		case 'add3':
			View.openDialog('ab-proj-stat-dash-pkg.axvw', this.projStatDashCps_cps.restriction, true);
			break;		
		}
	},
	
	onReportsButtonPush: function(menuItemId){
		switch(menuItemId) {
		case 'report1':
			View.openDialog('ab-proj-projects-scorecard.axvw', null, false, {
			    maximize: false
			});
			break;	
		case 'report2':
			View.openDialog('ab-proj-projects-metrics.axvw', null, false, {
			    maximize: false
			});
			break;
		}
	},
	
	onToolsButtonPush: function(menuItemId){
		var project_id = this.projStatDashCps_cps.restriction.clauses[0].value;
		switch(menuItemId) {
		case 'tool1':			
			View.openDialog('ab-proj-active-projects-timeline.axvw', null, false, {
			    maximize: false
			});
			break;
		case 'tool2':
			View.openDialog('ab-proj-projects-calendar.axvw', null, false, {
			    maximize: false
			});
			break;		
		}
	}
});

function showWorkpkg(obj) {
	if (obj.restriction.clauses.length < 1) return;
	var restriction = new Ab.view.Restriction();
	var project_id = '';
	var work_pkg_id = '';	
	for (var i = 0; i < obj.restriction.clauses.length; i++) {
		if (obj.restriction.clauses[i].name == 'work_pkgs.work_pkg_id') {
			work_pkg_id = obj.restriction.clauses[i].value;
			restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
		}
		else if (obj.restriction.clauses[i].name == 'project.project_id') {
			project_id = obj.restriction.clauses[i].value;
			restriction.addClause('work_pkgs.project_id', project_id);
		}		
	}
	var openerController = View.getOpenerView().controllers.get('projStat');
	selectNestedTab(openerController.projStatTabs, 'projStatPkg', openerController.projStatPkgTabs, 'projStatPkgProf', restriction);
	openerController.projStatTabs.setTabTitle('projStatPkg', work_pkg_id);
}
