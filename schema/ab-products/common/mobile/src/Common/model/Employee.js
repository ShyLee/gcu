Ext.define('Common.model.Employee', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'em_id',
			type : 'string'
		}, {
			name : 'email',
			type : 'string'
		}, {
			name : 'bl_id',
			type : 'string'
		}, {
			name : 'fl_id',
			type : 'string'
		}, {
			name : 'phone',
			type : 'string'
		} ]
	}
});