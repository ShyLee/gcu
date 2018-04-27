Ext.define('AppLauncher.model.Registration', {

	extend : 'Common.model.ModelBase',

	config : {
		fields : [ {
			name : 'username',
			type : 'string'
		}, {
			name : 'password',
			type : 'string'
		} ],

		validations : [ {
			type : 'presence',
			field : 'username'
		}, {
			type : 'presence',
			field : 'password'
		} ]
	}
});
