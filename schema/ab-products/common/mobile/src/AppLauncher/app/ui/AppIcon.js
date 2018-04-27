/**
 * Application Icon component
 * 
 * @author Jeff Martin
 */
Ext.define('AppLauncher.ui.AppIcon', {
	extend : 'Ext.Component',
	mixins : [ 'Ext.mixin.Observable' ],
	requires : [ 'AppLauncher.ui.IconData' ],

	xtype : 'appicon',

	config : {
		title : '',
		url : '',
		iconData : null,

		listeners : {
			singletap : function() {
				this.fireEvent('appIconTapped', this.getUrl());
			},
			element : 'element'
		}
	},

	constructor : function(config) {
		var html;

		this.callParent(arguments);

		if (Ext.os.deviceType === 'Phone') {
			html = '<div style="width:60px;height:80px;text-align:center;"><div><img src="data:image/png;base64,'
					+ this.getIconData() + '"/></div><div style="font-size:8pt">' + this.getTitle() + '</div></div>';
		} else {
			html = '<div style="width:150px;height:180px;text-align:center;"><div><img src="data:image/png;base64,'
					+ this.getIconData() + '"/></div><div>' + this.getTitle() + '</div></div>';
		}
		this.setHtml(html);
	}
});