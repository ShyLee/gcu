/**
 * Contains version information for the mobile applications.
 */
Ext.define('Common.util.VersionInfo', {

	singleton : true,

	/**
	 * Framework version. The build version is updated by the build process
	 */
	FRAMEWORK_VERSION : '21.1.0',

	getVersion : function() {
		return this.FRAMEWORK_VERSION;
	}

});
