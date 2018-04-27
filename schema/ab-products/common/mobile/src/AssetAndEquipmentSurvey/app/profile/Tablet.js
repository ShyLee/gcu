Ext.define('AssetAndEquipmentSurvey.profile.Tablet', {
	extend : 'Ext.app.Profile',

	config : {
		controllers : [ 'Common.controller.tablet.PromptController' ],

        views : [ 'Common.view.prompt.tablet.Base',
            'Common.view.prompt.tablet.Site',
            'Common.view.prompt.tablet.Building',
            'Common.view.prompt.tablet.Floor',
            'Common.view.prompt.tablet.Room',
            'Common.view.prompt.tablet.Equipment',
            'Common.view.prompt.tablet.Division',
            'Common.view.prompt.tablet.Department',
            'Common.view.prompt.tablet.EquipmentStandard']
	},

	isActive : function() {
		return Ext.os.is.Tablet || Ext.os.is.Desktop;
	}
});