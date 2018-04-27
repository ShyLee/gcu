Ext.define('Maintenance.view.overlay.HoldAction', {
    extend: 'Ext.Panel',

    xtype: 'holdActionPanel',

    config: {
        modal: true,
        hidden: true,
        hideOnMaskTap: false,
        width: '300px',
        layout: {
            type: 'vbox',
            padding: '10px'
        },
        defaults: {
            flex: 1,
            height: '30px',
            margin: '10 2 0 2',
            scope: this,
            ui: 'iron'
        },
        items: [
            {
                xtype: 'button',
                text: 'On Hold For Parts',
                itemId: 'holdParts'
            },
            {
                xtype: 'button',
                text: 'On Hold for Labor',
                itemId: 'holdLabor'
            },
            {
                xtype: 'button',
                text: 'On Hold for Access',
                itemId: 'holdAccess'
            },
            {
                xtype: 'button',
                text: 'Cancel',
                itemId: 'holdCancel',
                ui: 'iron',
                margin: '10 2 10 2'
            }
        ]
    }
});