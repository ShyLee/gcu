Ext.define('AppLauncher.view.phone.Preferences', {
    extend: 'AppLauncher.view.Preferences',

    config: {
        items: [
            {
                xtype: 'titlebar',
                docked: 'top',
                title: 'Preferences',
                items: [
                    {
                        xtype: 'button',
                        align: 'right',
                        action: 'cancelPreferences',
                        text: 'Cancel'
                    }
                ]
            },
            {
                xtype: 'container',
                itemId: 'urlFieldSet',
                hidden: true,
                items: [
                    {
                        xtype: 'textfield',
                        label: 'Web Central URL',
                        labelAlign: 'top',
                        name: 'url',
                        readOnly: true
                    },
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: 'Change Web Central URL',
                                action: 'resetWebCentralUrl',
                                width: '300px',
                                margin: '10px 0px 0px 0px',
                                ui: 'action'
                            }
                        ]
                    }

                ]
            },
            {
                xtype: 'container',
                items: [
                    {
                        xtype: 'textfield',
                        label: 'Registered User',
                        name: 'user_name',
                        readOnly: true,
                        labelAlign: 'top'
                    },
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: 'Change Registered User',
                                action: 'registerUser',
                                width: '300px',
                                margin: '10px 0px 0px 0px',
                                ui: 'action'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'container',
                items: [
                    {
                        xtype: 'textfield',
                        label: 'Last Background Data Sync Time',
                        name: 'syncTime',
                        readOnly: true,
                        labelAlign: 'top'
                    },
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            pack: 'center',
                            align: 'center',
                            ui: 'action'
                        },
                        items: [
                            {
                                xtype: 'button',
                                text: 'Reset Background Data Sync',
                                action: 'resetSyncHistory',
                                width: '300px',
                                margin: '10px 0px 0px 0px',
                                ui: 'action'
                            }
                        ]
                    }
                ]
            }

        ]

    }
});