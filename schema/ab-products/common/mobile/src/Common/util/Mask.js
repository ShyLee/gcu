Ext.define('Common.util.Mask', {
    alternateClassName : [ 'Mask' ],
    singleton: true,

    displayLoadingMask: function (displayText) {
        var loadingText = displayText ? displayText : '';

        Ext.Viewport.setMasked({
            xtype: 'loadmask',
            message: loadingText
        });
    },

    hideLoadingMask: function () {
        Ext.Viewport.setMasked(false);
    },

    setLoadingMessage: function(message) {
        var loadMask = Ext.ComponentQuery.query('loadmask');

        if(loadMask && loadMask.length > 0) {
            loadMask[0].setMessage(message);
        }
    }
});