var projStatLogsController = View.createController('projStatLogs',{	
	
	// pull-down menu entries
	menuAddNew: new Array('comm1','comm2','comm3','comm4'),
	
    afterInitialDataFetch: function(){
    	var titleObjAddNew = Ext.get('addNewComm');
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
		var openerController = View.getOpenerView().controllers.get('projStat');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.project_id', openerController.project_id);
		switch(menuItemId) {
		case 'comm1':
			restriction.addClause('ls_comm.comm_type', 'Notice');
			break;
		case 'comm2':
			restriction.addClause('ls_comm.comm_type', 'Correspondence');
			break;
		case 'comm3':
			restriction.addClause('ls_comm.comm_type', 'Meeting Minutes');
			break;		
		}
	    View.openDialog("ab-proj-stat-logs-add.axvw", restriction, true);
	}
});

