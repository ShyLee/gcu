Ext.define('Maintenance.view.Main', {
    extend: 'Common.view.navigation.NavigationView',

    xtype: 'mainview',

    isNavigationList: true,

    tollBarButtons: [],

    config: {
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

        items: [
            {
                xtype: 'workrequestListPanel'
            }
        ]
    },

    // TODO: Adding toolbar buttons should be in the base NavigationView
    initialize: function () {

        // Add additional toolbar buttons to the main view.
        var navBar = this.getNavigationBar();
        navBar.addToolBarButtons(this);

        this.callParent(arguments);
    }

});
