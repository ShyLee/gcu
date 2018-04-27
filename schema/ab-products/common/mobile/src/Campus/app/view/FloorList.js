Ext.define('Campus.view.FloorList', {
	extend : 'Ext.DataView',

	requires : 'Campus.view.FloorListItem',

	xtype : 'floorsListPanel',

	isNavigationList : true,

	config : {
		title : 'Floors',

		parentId : null,

		toolBarButtons : [ {
			xtype : 'toolbarbutton',
			text : 'Download Floor Plans',
			action : 'downloadBuildingFloorPlans',
			displayOn : 'all'
		} ],

		editViewClass : 'Campus.view.FloorPlan',

		cls : 'spacebook-list',

		useComponents : true,

		defaultType : 'floorListItem',

		store : 'spaceBookFloors',

		plugins : {
			xclass : 'Common.plugin.DataViewListPaging',
			autoPaging : false
		}
	}
});