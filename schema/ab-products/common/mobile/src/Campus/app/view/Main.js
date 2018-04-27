Ext.define('Campus.view.Main', {
	extend : 'Common.view.navigation.NavigationView',

	requires : [ 'Common.controls.ToolbarButton', 'Campus.view.Campus' ],

	xtype : 'mainview',

	isNavigationList : true,

	config : {
		toolBarButtons : [ {
			xtype : 'toolbarbutton',
			text : 'Apps',
			action : 'backToAppLauncher',
			ui : 'back',
			displayOn : 'all'
		}, {
			xtype : 'toolbarbutton',
			text : 'Download Data',
			action : 'downloadValidatingTables',
			displayOn : 'all'
		}, {
			xtype : 'toolbarbutton',
			text : 'Download Floor Plans',
			action : 'downloadFloorPlans',
			displayOn : 'all'
		} ],
		items : [ {
			xtype : 'campusPanel'
		} ]
	},

	initialize : function() {

		// Add additional toolbar buttons to the main view.
		var navBar = this.getNavigationBar();
		navBar.addToolBarButtons(this);

        // Do not display the Add New button in the tool bar
        navBar.setHideSaveButtons(true);

		this.callParent(arguments);
	}

});
