/**
 * Base class for the common synchronization functions shared by all mobile apps.
 *
 * @author Jeff Martin
 * @since 21.1
 */
// TODO: Controller is no longer needed unless we need a global entry to call the Synchronizatoin manager
Ext.define('Common.controller.SyncController', {
    extend: 'Ext.app.Controller',

    config: {
        control: {
            'button[action=downloadValidatingTables]': {
                tap: 'onStartValidatingDataDownload'
            }
        }
    },

    onStartValidatingDataDownload: function (onCompleted, scope) {
        alert('not implemented')
    }
});