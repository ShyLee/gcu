Ext.define('Common.view.prompt.phone.Site', {
    extend : 'Common.view.prompt.phone.Base',

    xtype : 'phoneSitePrompt',

    config : {
        list : {
            store : 'sitesStore',
            id : 'sitePromptList',
            itemTpl : '<div class="prompt-list-hbox"><div style="width:40%">{site_id}</div>' + '<h3>{name}</h3></div>'
        },

        titleBar : {
            title : LocaleManager.getLocalizedString('Sites')
        }
    }
});