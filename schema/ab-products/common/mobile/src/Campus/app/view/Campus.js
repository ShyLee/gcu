Ext.define('Campus.view.Campus', {
    extend: 'Ext.Container',

    xtype: 'campusPanel',

    config: {
        layout: 'vbox',
        title: 'Sites',
        items: [
            {
                xclass: 'Campus.view.SiteList',
                flex: 1
            }
        ]
    }
});