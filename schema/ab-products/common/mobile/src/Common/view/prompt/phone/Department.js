Ext.define('Common.view.prompt.phone.Department', {
    extend : 'Common.view.prompt.phone.Base',

    xtype : 'phoneDepartmentPrompt',

    config : {
        list : {
            store : 'departmentsStore',
            id : 'departmenPromptList',
            itemTpl : '<div class="prompt-list-hbox"><div style="width:40%">{dp_id}</div>' + '<h3>{dv_id}</h3></div>'
        },

        titleBar : {
            title : LocaleManager.getLocalizedString('Departments')
        }
    }
});