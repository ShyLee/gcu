Ext.define('Common.view.prompt.phone.Equipment', {
	extend : 'Common.view.prompt.phone.Base',

	xtype : 'phoneEquipmentPrompt',

	config : {
		list : {
			store : 'equipmentsStore',
			id : 'equipmentPromptList',
			itemTpl : '<div class="prompt-list-hbox"><div style="width:40%">{eq_id}</div>' + '<h3>{eq_std}</h3></div>'
		},

		titleBar : {
			title : LocaleManager.getLocalizedString('Equipment', 'Common.view.prompt.phone.Equipment')
		}
	}
});