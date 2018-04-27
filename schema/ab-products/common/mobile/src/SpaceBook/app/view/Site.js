Ext.define('SpaceBook.view.Site', {

    extend: 'Ext.Container',

    xtype: 'sitePanel',

    isNavigationList: true,

    requires: [ 'Common.controls.ToolbarButton', 'SpaceBook.view.Main' ],

    config: {
        layout: 'vbox',
        title: 'Buildings',

        parentId: null,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: 'Download Floor Plans',
                action: 'downloadSiteFloorPlans',
                ui: 'iron',
                displayOn: 'all'
            }
        ],

        items: [
            {
                xtype: 'buildingsListPanel',
                flex: 1
            },
            {
                xtype: 'siteMapPanel'
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        xtype: 'segmentedbutton',
                        centered: true,
                        items: [
                            {
                                text: 'List View',
                                itemId: 'buildingList'
                            },
                            {
                                text: 'Map View',
                                itemId: 'siteMap'
                            }
                        ]
                    }
                ]
            }
        ]
    }
});