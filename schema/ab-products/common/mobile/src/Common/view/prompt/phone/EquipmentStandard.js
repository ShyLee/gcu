Ext.define('Common.view.prompt.phone.EquipmentStandard', {
    extend : 'Common.view.prompt.phone.Base',

    xtype : 'phoneEquipmentStandardPrompt',

    config : {
        list : {
            store : 'equipmentStandardsStore',
            id : 'equipmentStandardPromptList',
            itemTpl : '<div class="prompt-list-hbox"><div style="width:40%">{eq_std}</div>' + '<h3>{description}</h3></div>'
        },

        titleBar : {
            title : LocaleManager.getLocalizedString('Equipment Standards', 'Common.view.prompt.phone.EquipmentStandard')
        }
    }
});