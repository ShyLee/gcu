Ext.define('SpaceBook.view.Campus', {
    extend: 'Ext.Container',

    xtype: 'campusPanel',

    config: {
        layout: 'vbox',
        title: 'Sites',
        items: [
            {
                xclass: 'SpaceBook.view.SiteList',
                flex: 1
            }
        ]
    }
});