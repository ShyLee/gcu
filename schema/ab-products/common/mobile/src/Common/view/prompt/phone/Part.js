Ext.define('Common.view.prompt.phone.Part', {

	extend : 'Common.view.prompt.phone.Base',
	xtype : 'phonePartPrompt',

	config : {
		title : 'Parts',
		list : {
			store : 'partsStore',
			itemTpl : '<div class="prompt-list-vbox"><div>{part_id}</div><h3>{description}</h3></div>'
		},

		titleBar : {
			title : LocaleManager.getLocalizedString('Parts', 'Common.view.prompt.phone.Part')
		}
	}
});
