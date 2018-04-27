Ext.define('Common.view.prompt.tablet.Division', {
    extend: 'Common.view.prompt.tablet.Base',
    xtype: 'tabletDivisionPrompt',

    config: {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3 style="width:40%;margin-left:10px">Division Code</h3>' +
                      '<div>Name</div></div>'
            }
        ],
        list: {
            store: 'divisionsStore',
            id: 'divisionPromptList',
            itemTpl: '<div class="prompt-list-hbox"><div style="width:40%">{dv_id}</div>' +
                    '<div>{name}</div></div>'
        },

        titleBar: {
            docked: 'top',
            title: 'Divisions',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'divisionSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Divisions',
                            'Common.view.prompt.tablet.Division')
                }
            ]
        }
    }
});