Ext.define('Maintenance.view.tablet.WorkRequestEdit', {

	extend : 'Maintenance.view.WorkRequestEdit',

	xtype : 'tabletWorkRequestPanel',

	config : {

		toolBarButtons : [ {
			xtype : 'toolbarbutton',
			align : 'left',
			iconCls : 'photo1',
			iconMask : true,
			action : 'capturePhoto',
			ui : 'iron',
			displayOn : 'all'
		}, {
			xtype : 'toolbarbutton',
			text : LocaleManager.getLocalizedString('Hold', 'Maintenance.view.WorkRequestEdit'),
			align : 'right',
			style : '-webkit-box-ordinal-group:1',
			action : 'workRequestHold',
			displayOn : 'update',
			ui : 'iron'
		}, {
			xtype : 'toolbarbutton',
			text : LocaleManager.getLocalizedString('Complete', 'Maintenance.view.WorkRequestEdit'),
			align : 'right',
			action : 'workRequestComplete',
			displayOn : 'update',
			ui : 'iron'
		} ]
	}

});
