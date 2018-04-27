Ext.define('Campus.controller.SpaceBookSync', {
	extend : 'Common.controller.SyncController',

	requires : [ 'Common.util.Filter', 'Common.util.SynchronizationManager' ],

	/**
	 * Override the downloadValidatingTables function so we can download the Site floor plans when the validating table
	 * sync is complete
	 */
	downloadValidatingTables : function() {

		var me = this, stores = this.getValidatingStores(), storeCount = stores.length, isSyncComplete = function(
				storeCount) {
			if (storeCount === 0) {
				me.syncTableDefsStore();
				me.loadStoresAfterSync();
				me.downloadSiteDrawings();
				me.hideWaitCursor();
			}
		};

		me.showWaitCursor();

		Ext.each(stores, function(store) {
			// Use Ext.defer to allow the loading indicator to display.
			Ext.defer(store.clearAndImportRecords, 20, store, [ function() {
				storeCount -= 1;
				isSyncComplete(storeCount);
			}, me ]);
		});
	},

	/**
	 * Override so that we can load the SpaceSite and Space Building validating stores by page since these stores are
	 * used on list views.
	 */
	loadValidatingStores : function() {
		var validatingStores = this.getValidatingStores();
		Ext.each(validatingStores, function(store) {
			var storeId = store.getStoreId();
			if (storeId === 'spaceBookSites' || storeId === 'spaceBookBuildings') {
				store.loadPage(1);
			} else {
				store.load();
			}
		});
	},

	/**
	 * Retrieve the site_id values for all of the records where the detail_dwg field is not null. Retrieve the site
	 * drawing data from the server for each of the returned site records. Note: We are retrieving the site records from
	 * the database to avoid complications that arise from using the SpaceSite store to display the main page list of
	 * sites.
	 */
	downloadSiteDrawings : function() {
		var me = this;
		Common.util.Drawing.getSiteDrawingRecords(function(records) {
			me.getSiteDrawingsFromServer(records);
		}, me);
	},

	getSiteDrawingsFromServer : function(siteRecords) {

		var parameters = {
			highlightParameters : [ {
				view_file : 'ab-sp-space-book-bl.axvw',
				hs_ds : 'ds_ab-sp-space-book-bl_blHighlight',
				label_ds : 'ds_ab-sp-space-book-bl_blLabel',
				label_ht : '3'
			} ],
			pkeyValues : {
				site_id : ''
			}
		};

		Ext.each(siteRecords, function(siteRecord) {
			var site_id = siteRecord.site_id, svgData;
			parameters.pkeyValues.site_id = site_id;
			svgData = Common.util.Drawing.getSVGFromServer(parameters);
			Common.util.Drawing.saveSiteDrawing(site_id, svgData);
		}, this);

	}
});