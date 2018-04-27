var projStatTeamController = View.createController('projStatTeam', {
	// pull-down menu entries
	menuAddNew: new Array('add1','add2','add3','add4'),
	
    afterInitialDataFetch: function(){
    	var titleObjAddNew = Ext.get('addNewMember');
        titleObjAddNew.on('click', this.showAddNewMenu, this, null);
    },
    
    showAddNewMenu: function(e, item){
    	this.showMenu(e, this.menuAddNew, this.onAddNewButtonPush);
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
	
	onAddNewButtonPush: function(menuItemId){     
		switch(menuItemId) {
			case 'add1':
				View.openDialog('ab-proj-stat-team-em.axvw');
				break;
			case 'add2':
				View.openDialog('ab-proj-stat-team-vn.axvw');
				break;
			case 'add3':
				View.openDialog('ab-proj-stat-team-cf.axvw');
				break;		
			case 'add4':
				View.openDialog('ab-proj-stat-team-contact.axvw');
				break;
		}
	},
	
	projStatTeamGrid_onEdit: function(row) {
		var member_id = row.record['projteam.member_id.key'];
		var openerController = View.getOpenerView().controllers.get('projStat');
		var project_id = openerController.project_id;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('projteam.member_id', member_id);
		restriction.addClause('projteam.project_id', project_id);
		View.openDialog('ab-proj-stat-team-edit.axvw', restriction);
	},
	
	addMember: function(member) {
		var openerController = View.getOpenerView().controllers.get('projStat');
		var project_id = openerController.project_id;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('projteam.member_id', member.getValue('projteam.member_id'));
		restriction.addClause('projteam.project_id', project_id);
		var existingRecords = this.projStatTeam_ds0.getRecords(restriction);
		if (existingRecords.length > 0) return;
		
		member.setValue('projteam.project_id', project_id);
		this.projStatTeam_ds0.saveRecord(member);
	}
});
