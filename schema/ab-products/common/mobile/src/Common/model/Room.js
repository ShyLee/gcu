/**
 * Domain object for Room.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Room', {
	extend : 'Ext.data.Model',
	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'bl_id',
			type : 'string'
		}, {
			name : 'fl_id',
			type : 'string'
		}, {
			name : 'rm_id',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}, {
			name : 'rm_type',
			type : 'string'
		}, {
			name : 'rm_use',
			type : 'string'
		}, {
			name : 'rm_cat',
			type : 'string'
		}, {
			name : 'rm_std',
			type : 'string'
		}, {
			name : 'dv_id',
			type : 'string'
		}, {
			name : 'dp_id',
			type : 'string'
		} ]
	}
});