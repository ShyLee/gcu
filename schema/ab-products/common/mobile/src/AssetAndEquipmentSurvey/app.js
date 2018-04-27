
Ext.Loader.setPath({
	'Ext' : '../touch/src',
	'AssetAndEquipmentSurvey' : 'app',
	'Common' : '../Common'
});


Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application', 'Common.lang.LocaleManager' ], function() {
	Ext.application({
		name : 'AssetAndEquipmentSurvey',

		requires : [ 'Common.util.TableDef',
                     'Common.controls.PromptField',
                     'Ext.field.Search',
                     'Ext.SegmentedButton'],

		views : [ 'Main',
                  'SurveyList',
                  'Task',
                  'TaskList',
                  'FloorPlan',
                  'FloorPlanList',
                  'TaskContainer',
                  'RoomTaskList'],

		controllers : [ 'Common.controller.CommonController',
                        'Common.controller.SyncController',
                        'AssetAndEquipmentSurveySync',
                        'Navigation',
                        'FloorPlan'],

		stores : [ 'Common.store.TableDefs',
                   'Common.store.AppPreferences',
                   'Common.store.Sites',
                   'Common.store.Buildings',
                   'Common.store.Floors',
                   'Common.store.Rooms',
                   'Common.store.Equipments',
                   'Surveys', 'Tasks',
                   'Common.store.Craftspersons',
                   'Common.store.Employees',
                   'Common.store.Users',
                   'Common.store.UserProfiles',
                   'Common.store.Divisions',
                   'Common.store.Departments',
                   'TaskFloors',
                   'TaskFloorDrawings',
                   'Common.store.EquipmentStandards',
                   'Common.store.Downloads'
                  ],

		profiles : [ 'Tablet', 'Phone' ],

		launch : function() {
            Ext.fly('appLoadingIndicator').destroy();
			// Initialize the main view
			Ext.Viewport.add(Ext.create('AssetAndEquipmentSurvey.view.Main'));
		}
	});

});
