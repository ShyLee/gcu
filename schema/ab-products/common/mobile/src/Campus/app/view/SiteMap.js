Ext.define('Campus.view.SiteMap', {

	extend : 'Common.controls.DrawingControl',

	xtype : 'siteMapPanel',

	isNavigationList : true,

	config : {
		editViewClass : 'Campus.view.FloorList',
		xtype : 'drawing',
		itemId : 'sitesMap',
		width : '100%',
		height : '100%',
		record : null,
		drawingData : '<h1>Drawing Data goes here...</h1>',
		html : '<div id="siteDiv" style="width:100%;height:100%"></div>',
		hidden : true
	}
});