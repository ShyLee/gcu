Ext.define('Common.view.prompt.tablet.Site', {
    extend: 'Common.view.prompt.tablet.Base',
    xtype: 'tabletSitePrompt',

    config: {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Site Code</h3>' +
                      '<div>Name</div></div>'
            }
        ],
        list: {
            store: 'sitesStore',
            id: 'sitePromptList',
            itemTpl: '<div class="prompt-list-hbox"><div style="width:30%">{site_id}</div>' +
                     '<div>{name}</div></div>'
        },

        titleBar: {
            docked: 'top',
            title: 'Sites',
            items: [
                {
                    xtype: 'searchfield',
                    align: 'right',
                    name: 'siteSearch',
                    placeHolder: LocaleManager.getLocalizedString('Search Sites',
                            'Common.view.prompt.tablet.Site')
                }
            ]
        }

    }
});