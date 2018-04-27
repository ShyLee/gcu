Ext.define('Common.view.prompt.tablet.Floor', {
    extend: 'Common.view.prompt.tablet.Base',

    xtype: 'tabletFloorPrompt',

    config: {

        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Floor Code</h3>'
                        + '<div>Building Code</div></div>'
            }
        ],

        list: {
            store: 'floorsStore',
            id: 'floorPromptList',
            itemTpl: '<div class="prompt-list-hbox"><div style="width:30%">{fl_id}</div>'
                    + '<div>{bl_id}</div></div>'
        },

        titleBar: {
            docked: 'top',
            title: 'Floors',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'floorSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Floors',
                            'Common.view.prompt.tablet.Floor')
                }
            ]
        }
    }
});