/**
 * Domain object for Floor.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Floor', {
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
			name : 'name',
			type : 'string'
		} ]
	}
});