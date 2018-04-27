Ext.define('Maintenance.view.tablet.PhotoPanel', {
	extend : 'Maintenance.view.overlay.PhotoPanel',

	xtype : 'tabletWorkRequestPhotoPanel',

	config : {
		modal : true,
		hidden : true,
		hideOnMaskTap : false,
		width : 400,
		height : 500,
		centered : true
	}
});