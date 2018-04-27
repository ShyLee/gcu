Ext.define('SpaceBook.view.SiteList', {
	extend : 'Ext.DataView',

	requires : 'SpaceBook.view.SiteListItem',

	xtype : 'siteListPanel',

	isNavigationList : true,

	config : {
		title : 'Sites',

        scrollable : {
            direction : 'vertical',
            directionLock : true
        },

        emptyText: '<div style="text-align:center;color: #4169e1;margin-top:20px">Select the Download Data button' +
                    ' to download your list of Sites, Buildings, and Floors.</div>',

		editViewClass : 'SpaceBook.view.Site',

		cls : 'spacebook-list',

		useComponents : true,

		defaultType : 'siteListItem',

		store : 'spaceBookSites',

		plugins : {
			xclass : 'Common.plugin.DataViewListPaging',
			autoPaging : false
		}

	}
});