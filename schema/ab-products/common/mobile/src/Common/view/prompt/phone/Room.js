Ext
		.define(
				'Common.view.prompt.phone.Room',
				{
					extend : 'Common.view.prompt.phone.Base',

					xtype : 'phoneRoomPrompt',

					config : {
						list : {
							store : 'roomsStore',
							itemTpl : '<div class="prompt-list-hbox"><div style="width:30%">{rm_id}</div><h3>{bl_id} - {fl_id}</h3></div>'
						},

						titleBar : {
							title : LocaleManager.getLocalizedString('Rooms', 'Common.view.prompt.phone.Room')
						}
					}
				});