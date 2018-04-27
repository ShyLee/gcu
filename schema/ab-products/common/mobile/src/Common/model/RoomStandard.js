Ext.define('Common.model.RoomStandard', {
	extend : 'Ext.data.Model',

	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'rm_std',
			type : 'string'
		}, {
			name : 'description',
			type : 'string'
		} ]
	}

});