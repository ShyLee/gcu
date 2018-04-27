Ext.define('Common.view.prompt.tablet.Room', {

	extend : 'Common.view.prompt.tablet.Base',

	xtype : 'tabletRoomPrompt',

	config : {
        items: [
            {
                xtype: 'container',
                html: '<div class="prompt-list-label"><h3>Room Code</h3><h3>Floor Code</h3>'
                        + '<div>Building Code</div></div>'
            }
        ],
		list : {
			store : 'roomsStore',
			id : 'roomPromptList',
			itemTpl : '<div class="prompt-list-hbox"><div style="width:30%;">{rm_id}</div>'
					+ '<div style="width:30%;">{fl_id}</div><div>{bl_id}</div></div>'
		},
		titleBar : {
			docked : 'top',
            title: 'Rooms',
			items : [
					{
						xtype : 'searchfield',
						align : 'right',
						name : 'roomSearch',
						placeHolder : LocaleManager
								.getLocalizedString('Search Rooms', 'Common.view.prompt.tablet.Room')
					} ]
		}
	}
});