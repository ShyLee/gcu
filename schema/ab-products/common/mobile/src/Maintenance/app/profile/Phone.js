Ext.define('Maintenance.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {
        controllers: ['Common.controller.phone.PromptController',
                      'Maintenance.controller.phone.WorkRequestForms',
                      'Maintenance.controller.phone.WorkRequestDocuments'
                     ],

        views: ['Common.view.prompt.phone.Base',
                'Common.view.prompt.phone.Building',
                'Common.view.prompt.phone.Floor',
                'Common.view.prompt.phone.Room',
                'Common.view.prompt.phone.Equipment',
                'Common.view.prompt.phone.Part',
                'Maintenance.view.phone.ProblemType',
                'Maintenance.view.phone.ProblemDescription',
                'Maintenance.view.phone.PhotoPanel',
                'Maintenance.view.phone.Main',
                'Maintenance.view.phone.WorkRequestEdit',
                'Maintenance.view.phone.ProblemResolution',
                'Maintenance.view.phone.QuickComplete'
               ]
    },

    launch : function () {
        Ext.Viewport.add(Ext.create('Maintenance.view.phone.Main'));
    },

    isActive: function () {
        return Ext.os.is.Phone; // || Ext.os.is.Desktop;
    }
});