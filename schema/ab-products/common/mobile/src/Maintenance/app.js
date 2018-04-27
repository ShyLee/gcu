// Enable the loader
// <debug>
Ext.Loader.setConfig({
	enabled : true
});
// </debug>

// External Dependencies: Tell the Loader to find any class starting with the
// 'Common' namespace inside '../Common'
// folder.
Ext.Loader.setPath({
	'Common' : '../Common',
	'Maintenance' : 'app'
});

Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application',
		'Common.lang.LocaleManager' ], function() {
	Ext.application({
		name : 'Maintenance',

		requires : [ 'Ext.field.DatePicker', 'Ext.field.Spinner',
				'Common.controls.TimePickerField',
				'Common.controls.NumberField', 'Ext.field.Search',
				'Ext.field.Hidden', 'Common.util.UserProfile',
				'Common.util.TableDef', 'Common.controls.FormHeader',
				'Common.controls.ToolbarButton', 'Common.controls.PromptField',
				'Common.controls.TextPromptField', 'Ext.Img' ],

		views : [ 'ProblemType',
                  'WorkRequestCostEdit',
                  'WorkRequestCostList',
                  'WorkRequestPartEdit',
                  'WorkRequestPartList',
                  'WorkRequestCraftspersonEdit',
                  'WorkRequestCraftspersonList',
                  'WorkRequestList', 'ProblemDescription',
                  'WorkRequestDocuments' ],

		controllers : [ 'Common.controller.CommonController',
                        'Common.controller.SyncController',
                        'WorkRequestNavigation',
                        'WorkRequestSync' ],

		stores : [ 'Common.store.TableDefs',
                   'WorkRequests',
                   'Common.store.Buildings',
                   'Common.store.Floors',
                   'Common.store.Rooms',
                   'Common.store.Causes',
                   'Common.store.AppPreferences',
                   'Common.store.Equipments',
                   'Common.store.ProblemTypes',
                   'WorkRequestCosts',
                   'OtherResources',
                   'WorkRequestParts',
                   'Parts',
                   'WorkRequestCraftspersons',
                   'ProblemDescriptions',
                   'Common.store.Sites',
                   'Common.store.Employees',
                   'Common.store.Craftspersons',
                   'Common.store.Users',
                   'Common.store.UserProfiles',
                   'Common.store.Apps',
                   'PmProcedures',
                   'ProblemResolutions',
                   'Common.store.RepairTypes',
                   'Common.store.Downloads'],

		profiles : [ 'Tablet', 'Phone' ],

        launch: function () {
            Ext.fly('appLoadingIndicator').destroy();
        }

	});

});
