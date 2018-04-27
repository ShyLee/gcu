Ext.define('Campus.store.Sites', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'Campus.model.SpaceSite' ],

	serverTableName : 'site',

	serverFieldNames : [ 'site_id', 'name', 'city_id', 'state_id', 'ctry_id', 'area_gross_ext', 'area_gross_int',
			'area_rentable', 'area_usable', 'site_photo', 'detail_dwg' ],

	inventoryKeyNames : [ 'site_id' ],

	config : {
		model : 'Campus.model.SpaceSite',
		sorters : [ {
			property : 'site_id',
			direction : 'ASC'
		} ],
		storeId : 'spaceBookSites',
		enableAutoLoad : true,
		disablePaging : false,
		remoteSort : 'true',
		proxy : {
			type : 'Sqlite'
		}
	}
});