Ext.define('Common.view.prompt.tablet.EquipmentStandard', {
    extend: 'Common.view.prompt.tablet.Base',
    xtype: 'tabletEquipmentStandardPrompt',

    config: {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Equipment Standard</h3>'
                        + '<div>Description</div></div>'
            }
        ],
        list: {
            store: 'equipmentStandardsStore',
            id: 'equipmentStandardsPromptList',
            itemTpl: '<div class="prompt-list-hbox"><div style="width:30%;">{eq_std}</div><div>{description}</div></div>'
        },

        titleBar: {
            docked: 'top',
            title: 'Equipment Standards',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'equipmentStandardsSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Standards',
                            'Common.view.prompt.tablet.EquipmentStandard')
                }
            ]
        }
    }
});