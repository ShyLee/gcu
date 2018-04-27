Ext.define('SpaceBook.store.Buildings', {
	extend : 'Common.store.sync.ValidatingTableStore',
	requires : [ 'SpaceBook.model.SpaceBuilding' ],

	serverTableName : 'bl',
	serverFieldNames : [ 'bl_id', 'name', 'city_id', 'state_id', 'ctry_id', 'use1', 'contact_name', 'date_bl',
			'area_gross_ext', 'area_gross_int', 'area_rentable', 'area_usable', 'contact_phone', 'construction_type',
			'site_id', 'bldg_photo' ],

	inventoryKeyNames : [ 'bl_id' ],

	config : {
		model : 'SpaceBook.model.SpaceBuilding',
		sorters : [ {
			property : 'bl_id',
			direction : 'ASC'
		} ],
		storeId : 'spaceBookBuildings',
        destroyRemovedRecords: false,
		enableAutoLoad : true,
		remoteFilter : true,
		proxy : {
			type : 'Sqlite'
		}
	}
});