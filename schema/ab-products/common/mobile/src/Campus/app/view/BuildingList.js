Ext.define('Campus.view.BuildingList', {
	extend : 'Ext.DataView',

	requires : 'Campus.view.BuildingListItem',

	xtype : 'buildingsListPanel',

	isNavigationList : true,

	config : {
		title : 'Buildings',

		/**
		 * @cfg parentId {String} The site_id value of the buildings displayed in the list
		 */
		parentId : null,

		editViewClass : 'Campus.view.FloorList',

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