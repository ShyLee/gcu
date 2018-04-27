/**
 * Domain object for Site.
 * <p>
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.model.Site', {
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
		} ]
	}
});