Ext.define('Maintenance.view.tablet.Main', {
    extend: 'Maintenance.view.Main',

    xtype: 'tabletMainview',

    config: {
        editViewClass: 'Maintenance.view.tablet.WorkRequestEdit',
        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: 'Apps',
                ui: 'iron',
                cls: 'x-button-back',
                action: 'backToAppLauncher',
                displayOn: 'all'
            },
            {
                xtype: 'toolbarbutton',
                text: 'Sync',
                action: 'syncWorkRequest',
                align: 'right',
                ui: 'iron',
                displayOn: 'all'
            }
        ]
    }
});