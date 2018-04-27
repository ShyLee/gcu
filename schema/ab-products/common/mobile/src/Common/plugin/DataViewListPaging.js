Ext
		.define(
				'Common.plugin.DataViewListPaging',
				{
					extend : 'Ext.plugin.ListPaging',

					alias : 'plugin.dataviewlistpaging',

					/**
					 * Override onStoreLoad to allow us to handle an issue where
					 * the scrollDockHeightRefresh method does not exists
					 */
					onStoreLoad : function(store) {
						var loadCmp = this.getLoadMoreCmp(), template = this
								.getLoadTpl(), message = this
								.storeFullyLoaded() ? this
								.getNoMoreRecordsText() : this
								.getLoadMoreText();

						if (store.getCount()) {
							loadCmp.show();
							// The Ext.DataView class does not have the
							// scrollDockHeightRefresh method.
							if (typeof this.getList().scrollDockHeightRefresh === 'function') {
								this.getList().scrollDockHeightRefresh();
							}
						}
						this.setLoading(false);

						// if we've reached the end of the data set, switch to
						// the noMoreRecordsText
						loadCmp.setHtml(template.apply({
							cssPrefix : Ext.baseCSSPrefix,
							message : message
						}));
					}

				});
