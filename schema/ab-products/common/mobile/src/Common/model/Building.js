/**
 * Domain object for Building.
 * <p>
 * 
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.model.Building', {
	extend : 'Ext.data.Model',
	config : {
		fields : [ {
			name : 'id',
			type : 'int'
		}, {
			name : 'site_id',
			type : 'string'
		}, {
			name : 'bl_id',
			type : 'string'
		}, {
			name : 'name',
			type : 'string'
		}
        ]
	}
});