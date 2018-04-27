Ext.define('Campus.view.SiteList', {
	extend : 'Ext.DataView',

	requires : 'Campus.view.SiteListItem',

	xtype : 'siteListPanel',

	isNavigationList : true,

	config : {
		title : 'Sites',

		editViewClass : 'Campus.view.Site',

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