Ext.define('SpaceBook.view.Main', {
	extend : 'Common.view.navigation.NavigationView',

	requires : [ 'Common.controls.ToolbarButton', 'SpaceBook.view.Campus' ],

	xtype : 'mainview',

	isNavigationList : true,

	config : {

        navigationBar: {
            saveButton: {
                ui: 'iron'
            },
            addButton: {
                ui: 'iron'
            },

            backButton: {
                ui: 'iron',
                cls: 'x-button-back'
            },

            showSaveButton: false
        },

		toolBarButtons : [ {
			xtype : 'toolbarbutton',
			text : 'Apps',
			action : 'backToAppLauncher',
            ui: 'iron',
            cls: 'x-button-back',
			displayOn : 'all'
		}, {
			xtype : 'toolbarbutton',
			text : 'Download Data',
            itemId: 'downloadData',
			//action : 'downloadValidatingTables',
			displayOn : 'all',
            ui: 'iron'
		}, {
			xtype : 'toolbarbutton',
			text : 'Download Floor Plans',
			action : 'downloadFloorPlans',
			displayOn : 'all',
            ui: 'iron'
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
