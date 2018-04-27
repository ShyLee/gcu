Ext.define('Campus.model.SpaceSite', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'site_id',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}, {
			name : 'city_id',
			type : 'string'
		}, {
			name : 'state_id',
			type : 'string'
		}, {
			name : 'ctry_id',
			type : 'string'
		}, {
			name : 'area_gross_ext',
			type : 'float'
		}, {
			name : 'area_gross_int',
			type : 'float'
		}, {
			name : 'area_rentable',
			type : 'float'
		}, {
			name : 'area_usable',
			type : 'float'
		}, {
			name : 'site_photo',
			type : 'string'
		}, {
			name : 'site_photo_contents',
			type : 'string',
			isSyncField : false
		}, {
			name : 'detail_dwg',
			type : 'string'
		} ]
	}
});