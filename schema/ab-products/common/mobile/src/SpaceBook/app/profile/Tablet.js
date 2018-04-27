Ext.define('SpaceBook.profile.Tablet', {
    extend: 'Ext.app.Profile',

    requires: 'Common.controller.PromptController',

    config: {
        controllers: ['Common.controller.tablet.PromptController'],

        views: [ 'Common.view.prompt.tablet.Division',
                 'Common.view.prompt.tablet.Department',
                 'Common.view.prompt.tablet.RoomCategory',
                 'Common.view.prompt.tablet.RoomType',
                 'Common.view.prompt.tablet.RoomStandard']
    },

    isActive: function () {
        // This is the only profile in the SpaceBook app. We need it
        // for compatibility with the PromptController
        return true;
    }
});