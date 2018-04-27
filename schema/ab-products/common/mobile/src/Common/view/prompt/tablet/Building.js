Ext.define('Common.view.prompt.tablet.Building', {

    extend: 'Common.view.prompt.tablet.Base',
    xtype: 'tabletBuildingPrompt',

    config: {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3 style="width:40%">Code</h3>' +
                      '<div>Name</div></div>'
            }
        ],
        list: {
            store: 'buildingsStore',
            id: 'buildingPromptList',
            itemTpl: '<div class="prompt-list-hbox"><div style="width:40%">{bl_id}</div>' +
                     '<div>{name}</div></div>'
        },

        titleBar: {
            docked: 'top',
            title: 'Buildings',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'buildingSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Buildings',
                            'Common.view.prompt.tablet.Building')
                }
            ]
        }
    }
});