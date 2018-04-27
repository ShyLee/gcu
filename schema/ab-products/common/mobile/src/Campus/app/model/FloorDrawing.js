Ext.define('Campus.model.FloorDrawing', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'id'
		}, {
			name : 'bl_id',
			type : 'string'
		}, {
			name : 'fl_id',
			type : 'string'
		}, {
			name : 'plan_type',
			type : 'string'
		}, {
			name : 'svg_data',
			type : 'string'
		} ]
	}
});