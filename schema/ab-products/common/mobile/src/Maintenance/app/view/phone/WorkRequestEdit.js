Ext.define('Maintenance.view.phone.WorkRequestEdit', {
    extend: 'Maintenance.view.WorkRequestEdit',

    xtype: 'phoneWorkRequestPanel',

    config: {
        toolBarButtons: [
            {
                xtype : 'toolbarbutton',
                align : 'left',
                iconCls : 'photo1',
                iconMask : true,
                action : 'capturePhoto',
                ui : 'iron',
                displayOn : 'all'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'stop2',
                iconMask: true,
                align: 'left',
                style: '-webkit-box-ordinal-group:1',
                action: 'workRequestHold',
                displayOn: 'update',
                ui: 'iron'
            },
            {
                xtype: 'toolbarbutton',
                iconCls: 'check2',
                iconMask: true,
                align: 'right',
                action: 'workRequestComplete',
                displayOn: 'update',
                ui: 'iron'
            }
        ]
    }

});