Ext.define('Maintenance.profile.Tablet', {
    extend: 'Ext.app.Profile',

    requires: 'Common.controller.PromptController',

    config: {
        controllers: ['Common.controller.tablet.PromptController',
                      'Maintenance.controller.tablet.WorkRequestForms',
                      'Maintenance.controller.tablet.WorkRequestDocuments'
                     ],

        views: [ 'Common.view.prompt.tablet.Base',
                 'Common.view.prompt.tablet.Building',
                 'Common.view.prompt.tablet.Floor',
                 'Common.view.prompt.tablet.Room',
                 'Common.view.prompt.tablet.Equipment',
                 'Common.view.prompt.tablet.Part',
                 'Maintenance.view.tablet.ProblemType',
                 'Maintenance.view.tablet.ProblemDescription',
                 'Maintenance.view.tablet.ProblemResolution',
                 'Maintenance.view.tablet.PhotoPanel',
                 'Maintenance.view.tablet.Main',
                 'Maintenance.view.tablet.WorkRequestEdit',
                 'Maintenance.view.tablet.QuickComplete'
               ]
    },

    launch : function () {
        Ext.Viewport.add(Ext.create('Maintenance.view.tablet.Main'));
    },

    isActive: function () {
        return Ext.os.is.Tablet || Ext.os.is.Desktop;
    }
});