Ext.define('Maintenance.view.phone.QuickComplete', {
    extend: 'Maintenance.view.overlay.QuickComplete',


    config: {
        fullscreen: true,
        modal: true
    },

    initialize: function() {
        var me = this,
            titleBar;

        me.callParent(arguments);

        titleBar = Ext.factory({title: 'Complete Request', docked: 'top'}, 'Ext.TitleBar');
        me.add(titleBar);
    }
});