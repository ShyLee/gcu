Ext.define('Common.view.prompt.phone.Division', {
    extend : 'Common.view.prompt.phone.Base',

    xtype : 'phoneDivisionPrompt',

    config : {
        list : {
            store : 'divisionsStore',
            id : 'divisionPromptList',
            itemTpl : '<div class="prompt-list-hbox"><div style="width:40%">{dv_id}</div>' + '<h3>{name}</h3></div>'
        },

        titleBar : {
            title : LocaleManager.getLocalizedString('Divisions')
        }
    }
});