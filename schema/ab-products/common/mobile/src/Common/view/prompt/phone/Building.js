Ext.define('Common.view.prompt.phone.Building', {
	extend : 'Common.view.prompt.phone.Base',

	xtype : 'phoneBuildingPrompt',

	config : {
		list : {
			store : 'buildingsStore',
			itemTpl : '<div class="prompt-list-hbox"><div style="width:40%;">{bl_id}</div>' + '<h3>{name}</h3></div>'
		},

		titleBar : {
			title : LocaleManager.getLocalizedString('Buildings', 'Common.view.prompt.phone.Building')
		}
	}
});