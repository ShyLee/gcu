Ext.define('AssetAndEquipmentSurvey.profile.Phone', {

	extend : 'Ext.app.Profile',

	config : {
		controllers : [ 'Common.controller.phone.PromptController' ],

        views : [ 'Common.view.prompt.phone.Base',
            'Common.view.prompt.phone.Building',
            'Common.view.prompt.phone.Floor',
            'Common.view.prompt.phone.Room',
            'Common.view.prompt.phone.Equipment',
            'Common.view.prompt.phone.Division',
            'Common.view.prompt.phone.Department',
            'Common.view.prompt.phone.EquipmentStandard'
        ]
	},

	isActive : function() {
		return Ext.os.is.Phone;// || Ext.os.is.Desktop;
	}

});