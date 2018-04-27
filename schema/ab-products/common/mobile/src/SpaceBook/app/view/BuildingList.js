Ext.define('SpaceBook.view.BuildingList', {
	extend : 'Ext.DataView',

	requires : 'SpaceBook.view.BuildingListItem',

	xtype : 'buildingsListPanel',

	isNavigationList : true,

	config : {
		title : 'Buildings',

        scrollable : {
            direction : 'vertical',
            directionLock : true
        },

		/**
		 * @cfg parentId {String} The site_id value of the buildings displayed in the list
		 */
		parentId : null,

		editViewClass : 'SpaceBook.view.FloorList',

		cls : 'spacebook-list',

		useComponents : true,

		defaultType : 'buildingListItem',

		store : 'spaceBookBuildings',

		plugins : {
			xclass : 'Common.plugin.DataViewListPaging',
			autoPaging : false
		}
	}

});