// Enable the loader
// <debug>
Ext.Loader.setConfig({
    enabled: true
});
// </debug>


Ext.Loader.setPath({
    'Ext': '../touch/src',
    'SpaceBook': 'app',
    'Common': '../Common'
});


Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application',
    'Common.lang.LocaleManager' ], function () {
    Ext.application({
        name: 'SpaceBook',

        requires: [ 'Common.util.TableDef',
            'Ext.SegmentedButton',
            'Ext.Img',
            'Ext.Toolbar',
            'Ext.field.Search',
            'SpaceBook.util.Ui',
            'Common.plugin.DataViewListPaging',
            'Common.util.UserProfile',
            'Ext.field.Hidden',
            'Common.controls.PromptField',
            'Ext.MessageBox',
            'SpaceBook.util.SurveyState'
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
            'BuildingFloors',
            'Common.store.Downloads',
            'UserGroups'
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

        profiles: [ 'Tablet' ],

        launch: function () {
            Ext.fly('appLoadingIndicator').destroy();
            // Initialize the main view
            Ext.Viewport.add(Ext.create('SpaceBook.view.Main'));
        }

    });
});
