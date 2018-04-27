Ext.define('SpaceBook.view.SiteMap', {

	extend : 'Common.controls.DrawingControl',

	xtype : 'siteMapPanel',

	isNavigationList : true,


	config : {
		editViewClass : 'SpaceBook.view.FloorList',
		xtype : 'drawing',
		itemId : 'sitesMap',
		width : '100%',
		height : '100%',
		record : null,
		drawingData : '',
		html : '<div id="siteDiv" style="width:100%;height:100%"></div>',
		hidden : true
	}
});