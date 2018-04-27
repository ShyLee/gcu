// Enable the loader
// <debug>
Ext.Loader.setConfig({
    enabled: true
});
// </debug>


Ext.Loader.setPath({
    'Ext': '../touch/src',
    'Campus': 'app',
    'Common': '../Common'
});


Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application',
    'Common.lang.LocaleManager' ], function () {
    Ext.application({
        name: 'Campus',

        requires: [ 'Common.util.TableDef',
            'Ext.SegmentedButton',
            'Ext.Img',
            'Ext.Toolbar',
            'Ext.field.Search',
            'Campus.util.Ui',
            'Common.plugin.DataViewListPaging',
            'Common.util.UserProfile',
            'Ext.field.Hidden',
            'Common.controls.PromptField',
            'Ext.MessageBox',
            'Campus.util.SurveyState'
        ],

        stores: [ 'Common.store.TableDefs',
            'Common.store.AppPreferences',
            'Common.store.Users',
            'Common.store.Buildings',
            'Common.store.Floors',
            'Common.store.Rooms',
            'Common.store.Employees',
            'Common.store.Craftspersons',
            'Common.store.Divisions',
            'Common.store.Departments',
            'Common.store.RoomCategories',
            'Common.store.RoomTypes',
            'Common.store.RoomUses',
            'Common.store.RoomStandards',
            'Sites',
            'Buildings',
            'Floors',
            'PlanTypes',
            'SiteDrawings',
            'FloorDrawings',
            'Common.store.UserProfiles',
            'SpaceSurveys',
            'RoomSurveys',
            'BuildingFloors'
        ],

        controllers: [
            'Common.controller.CommonController',
            'SpaceBookSync',
            'SpaceBookNavigation',
            'FloorPlan',
            'Survey',
            'Download'
        ],

        views: [ 'Main', 'Campus', 'SiteList', 'BuildingList',
            'FloorList', 'FloorPlan', 'RoomSurvey', 'BuildingProfile',
            'Site', 'SiteListItem', 'SiteProfile', 'SiteMap',
            'FloorListItem', 'FloorProfile', 'StartSurvey', 'RoomList',
            'Common.view.panel.ProgressBar'],

        profiles: [ 'Campus.profile.Tablet' ],

        launch: function () {
            // Initialize the main view

            // Set restriction on Users store
            var usersStore = Ext.getStore('usersStore');
            usersStore.setRestrictionClause({
                tableName: 'afm_users',
                fieldName: 'user_name',
                operation: 'EQUALS',
                value: ConfigFileManager.username
            });

            Ext.Viewport.add(Ext.create('Campus.view.Main'));
        }

    });
});
