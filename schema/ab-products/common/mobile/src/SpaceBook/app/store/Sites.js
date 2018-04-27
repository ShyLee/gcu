Ext.define('SpaceBook.store.Sites', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'SpaceBook.model.SpaceSite' ],

	serverTableName : 'site',

	serverFieldNames : [ 'site_id', 'name', 'city_id', 'state_id', 'ctry_id', 'area_gross_ext', 'area_gross_int',
                         'area_rentable', 'area_usable', 'site_photo', 'detail_dwg' ],

	inventoryKeyNames : [ 'site_id' ],

	config : {
		model : 'SpaceBook.model.SpaceSite',

        sorters: [{
           sorterFn: function(record1, record2) {
               var siteId1 = record1.get('site_id'),
                   siteId2 = record2.get('site_id');
               siteId1 = siteId1 === null ? 'AAAAA' : siteId1;
               siteId2 = siteId2 === null ? 'AAAAA' : siteId2;
               return siteId1 > siteId2 ? 1 : (siteId1 === siteId2 ? 0 : -1);
           },
           direction: 'ASC'
        }
        ],
		storeId : 'spaceBookSites',
		enableAutoLoad : true,
		disablePaging : false,
		remoteSort : 'true',
		proxy : {
			type : 'Sqlite'
		},
        blankSiteIsAdded: false,
        listeners: {
            load: function(store, records) {
                if (store.currentPage === 1 && records.length > 0) {
                    var emptySite = new SpaceBook.model.SpaceSite();
                    emptySite.setData({site_id: null, name: 'Buildings Without a Site Assigned'});
                    store.setBlankSiteIsAdded(true);
                    store.add(emptySite);
                    store.setRemoteSort(false);
                    store.sort();
                    store.setRemoteSort(true);
                }
            }
        }
	},

    /**
     * Override the add function so we can prevent the Unassigned Buildings
     * entry from being added to the store twice.
     * @param records
     * @returns {*|Object|Object}
     */
    add: function(records) {
        var blankSiteIsAdded = this.getBlankSiteIsAdded();

        if (!Ext.isArray(records)) {
            records = Array.prototype.slice.call(arguments);
        }
        if(records.length === 1 && records[0].site_id === null) {
            if (blankSiteIsAdded) {
                return;
            } else {
                this.setBlankSiteIsAdded(true);
                return this.insert(this.data.length, records);
            }
        } else {
            return this.insert(this.data.length, records);
        }
    }
});