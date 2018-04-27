Ext.define('AppLauncher.view.ChangeUrl', {
    extend: 'Ext.Panel',

    xtype: 'changeUrlPanel',

    config: {
        modal: true,
        hidden: true,
        hideOnMaskTap: true,
        width: '70%',
        centered: true,
        layout: {
            type: 'vbox',
            padding: '10px'
        },
        items: [
            {
                xtype: 'textfield',
                name:'url',
                label:'Web Central URL',
                margin: '10px 20px 10px 20px',
                autoCapitalize: false
            },
            {
                xtype: 'button',
                text: 'Change URL',
                action: 'changeWebCentralUrl',
                margin: '10px 20px 10px 20px'
            }
        ]
    },

    getUrlValue: function () {
        var urlField = this.down('textfield[name=url]');

        if (urlField) {
            return urlField.getValue();
        }
    }
});