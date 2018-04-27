Ext.define('Common.view.prompt.tablet.Equipment', {
    extend: 'Common.view.prompt.tablet.Base',

    xtype: 'tabletEquipmentPrompt',

    config: {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Equipment Code</h3>'
                        + '<div>Equipment Standard</div></div>'
            }
        ],
        list: {
            store: 'equipmentsStore',
            id: 'equipmentPromptList',
            itemTpl: '<div class="prompt-list-hbox"><div style="width:30%;">{eq_id}</div><div>{eq_std}</div></div>'
        },

        titleBar: {
            docked: 'top',
            title: 'Equipment',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'equipmentSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Equipment',
                            'Common.view.prompt.tablet.Equipment')
                }
            ]
        }
    }
});
