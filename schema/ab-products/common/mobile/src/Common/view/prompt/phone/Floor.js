Ext.define('Common.view.prompt.phone.Floor', {

	extend : 'Common.view.prompt.phone.Base',

	xtype : 'phoneFloorPrompt',

	config : {
		list : {
			store : 'floorsStore',
			itemTpl : '<div class="prompt-list-hbox"><div style="width:30%">{fl_id}</div><h3>{bl_id}</h3></div>'
		},

		titleBar : {
			title : LocaleManager.getLocalizedString('Floors', 'Common.view.prompt.phone.Floor')
		}
	}

});
