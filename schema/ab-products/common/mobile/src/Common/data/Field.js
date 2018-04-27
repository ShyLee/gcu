/**
 * Overrides Ext.data.Field. Adds two properties to the field object
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.data.Field', {
	extend : 'Ext.data.Field',

	config : {

		/**
		 * @cfg {Boolean} Indicates if the field should be included in the data sent to the Web Central server. When the
		 *      value is true the field is included in the data. This property is used in the
		 *      MobileSyncServiceConversionUtils.convertRecordsForServer() function.
		 * 
		 * This field allows you to define fields that exist in the mobile database but are not saved on the Web Central
		 * database.
		 */
		isSyncField : true,

		/**
		 * @cfg {Boolean} Used to identify mobile database document fields. This property is analogous to the ARCHIBUS
		 *      Document type. Mobile database fields that correspond to ARCHIBUS Document fields should have this value
		 *      set to true.
		 * 
		 * When this value is true the synchronization service expects to see an associated '_contents' field. The
		 * document synchronization method relies on a naming convention for the fields involved in the document sync.
		 * 
		 * For transaction table syncs each mobile document field should have an associated '_contents' and '_isnew'
		 * field.
		 * 
		 * Example: The doc1 field in the wr_sync table also has a doc1_contents and doc1_isnew field associated with
		 * it.
		 */
		isDocumentField : false
	}
});