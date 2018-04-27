Ext.define('SpaceBook.view.FloorList', {
	extend : 'Ext.DataView',

	requires : 'SpaceBook.view.FloorListItem',

	xtype : 'floorsListPanel',

	isNavigationList : true,

	config : {
		title : 'Floors',

		parentId : null,

        scrollable : {
            direction : 'vertical',
            directionLock : true
        },

		toolBarButtons : [ {
			xtype : 'toolbarbutton',
			text : 'Download Floor Plans',
			action : 'downloadBuildingFloorPlans',
            ui: 'iron',
			displayOn : 'all'
		} ],

		editViewClass : 'SpaceBook.view.FloorPlan',

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