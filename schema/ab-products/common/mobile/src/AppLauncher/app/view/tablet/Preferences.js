Ext.define('AppLauncher.view.tablet.Preferences', {
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
                xtype: 'fieldset',
                padding: 20,
                margin: 20,
                itemId: 'urlFieldSet',
                hidden: true,
                items: [
                    {
                        xtype: 'textfield',
                        label: 'Web Central URL',
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
                                text: 'Change Web Central Server URL',
                                action: 'resetWebCentralUrl',
                                width: '400px',
                                margin: '20px 0px 0px 10px'
                            }
                        ]
                    }

                ]
            },
            {
                xtype: 'fieldset',
                padding: 20,
                margin: 20,
                items: [
                    {
                        xtype: 'textfield',
                        label: 'Registered User',
                        name: 'user_name',
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
                                text: 'Change Registered User',
                                action: 'registerUser',
                                width: '400px',
                                margin: '20px 0px 0px 10px'
                            }
                        ]
                    }
                ]
            },
            {
                xtype: 'fieldset',
                padding: 20,
                margin: 20,
                items: [
                    {
                        xtype: 'textfield',
                        label: 'Last Background Data Sync Time',
                        name: 'syncTime',
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
                                text: 'Reset Background Data Sync Flag',
                                action: 'resetSyncHistory',
                                width: '400px',
                                margin: '20px 0px 0px 10px'
                            }
                        ]
                    }
                ]
            }

        ]
    }
});