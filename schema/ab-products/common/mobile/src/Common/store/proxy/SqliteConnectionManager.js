/**
 * Manages the only SQLite database connection: creates the database connection if it does not exist; stores the
 * database connection in a field.
 * 
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 * 
 * 01.03.13 Removed getProxyConfig function. JM
 */
Ext.define('Common.store.proxy.SqliteConnectionManager', {
	alternateClassName : [ 'SqliteConnectionManager' ],
	singleton : true,

	/**
	 * @cfg {String} Name Name of database
	 */
	name : 'ARCHIBUS',

	/**
	 * @cfg {String} Version database version. If different than current, use updatedb event to update database.
	 */
	version : '1.0',

	/**
	 * @cfg {String} Description Description of the database.
	 */
	description : 'ARCHIBUS Mobile Applications Database',

	/**
	 * @cfg {String} Size Max storage size in bytes.
	 */
	size : 50 * 1024 * 1024,

	/**
	 * {Database} The one and only Sqlite database connection.
	 */
	connection : null,

	/**
	 * @public
	 * 
	 * Creates the only database connection if it does not exist. Stores the database connection in a field.
	 * <p>
	 * The start up sequence requires that database connection is created after the Phonegap library is loaded.
	 * 
	 * @return {Database} database connection.
	 */
	getConnection : function() {
		if (this.connection === null) {
			this.connection = openDatabase(this.name, this.version, this.description, this.size);
		}

		return this.connection;
	}

});
