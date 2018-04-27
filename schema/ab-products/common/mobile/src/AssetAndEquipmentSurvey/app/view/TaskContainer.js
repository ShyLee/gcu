Ext.define('AssetAndEquipmentSurvey.view.TaskContainer', {
    extend: 'Ext.Container',

    xtype: 'taskContainer',

    config: {
        title: 'Equipment Items',

        editViewClass: 'AssetAndEquipmentSurvey.view.Task',

        layout: 'vbox',

        surveyId: null,

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                text: Ext.os.is.Phone ? 'Complete' : 'Complete Survey',
                action: 'completeEquipmentSurvey',
                displayOn: 'all',
                align: 'right',
                ui: 'iron',
                hidden: true
            },
            {
                xtype: 'toolbarbutton',
                iconCls : 'add',
                iconMask : true,
                action: 'addSurveyTask',
                displayOn: 'all',
                align: 'right',
                ui: 'iron',
                hidden: true
            }
        ],

        items: [
            {
                xtype: 'taskListPanel',
                flex: 1
            },
            {
                xtype: 'floorPlanList',
                flex: 1,
                hidden: true
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
                                text: LocaleManager.getLocalizedString('List'),
                                itemId: 'taskList',
                                width: '135px'
                            },
                            {
                                text: LocaleManager.getLocalizedString('Floor Plan'),
                                itemId: 'floorPlan',
                                width: '135px'
                            }
                        ]
                    }
                ]
            }
        ]
    }

});