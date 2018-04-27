Ext.define('SpaceBook.model.SiteDrawing', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'site_id',
			type : 'string'
		}, {
			name : 'svg_data',
			type : 'string'
		} ]
	}
});