Ext.define('AssetAndEquipmentSurvey.view.Main', {
	extend : 'Common.view.navigation.NavigationView',

	requires : [ 'Common.controls.ToolbarButton' ],

	xtype : 'main',

	config : {

		editViewClass : 'AssetAndEquipmentSurvey.view.Task',

        useTitleForBackButtonText: false,

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

            showSaveButton: false,

            hideSaveButtons: true
        },

		toolBarButtons : [ {
			xtype : 'toolbarbutton',
			text : 'Apps',
			ui : 'iron',
			cls : 'x-button-back',
			action : 'backToAppLauncher',
			displayOn : 'all'
		}, {
			xtype : 'toolbarbutton',
			action : 'syncSurvey',
            text: 'Sync',
			align : 'right',
			ui : 'iron',
			displayOn : 'all'
		} ],

		items : [ {
			xtype : 'surveyListPanel'
		}
		]
	},

	// TODO: Adding toolbar buttons should be in the base NavigationView
	initialize : function() {

		// Add additional toolbar buttons to the main view.
		var navBar = this.getNavigationBar();
		navBar.addToolBarButtons(this);
        navBar.setHideSaveButtons(true);
		this.callParent(arguments);
	}
});
