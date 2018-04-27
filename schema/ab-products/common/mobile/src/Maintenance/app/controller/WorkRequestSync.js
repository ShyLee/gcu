Ext.define('Maintenance.controller.WorkRequestSync', {
    extend: 'Ext.app.Controller',

    requires: ['Common.util.SynchronizationManager',
               'Common.util.Mask'],

    requires: [ 'Maintenance.util.WorkRequestFilter', 'Common.service.workflow.Workflow',
        'Common.util.SynchronizationManager' ],

    config: {
        refs: {
            myWorkSegmentedButton: 'workrequestListPanel > toolbar[docked=bottom] > segmentedbutton',
            workRequestList: 'workrequestListPanel list'
        },
        control: {
            'button[action=syncWorkRequest]': {
                tap: 'onStartSyncWorkRequest'
            }
        },

        transactionTableStoreIds: [ 'workRequestsStore', 'workRequestPartsStore',
            'workRequestCostsStore', 'workRequestCraftspersonsStore' ]
    },

    /**
     * The default timeout for the Maintenance WFR
     */
    DEFAULT_TIMEOUT: 300,

    /**
     * Starts the synchronization process. Loads the DWR scripts if they have not been loaded.
     */
    onStartSyncWorkRequest: function () {
        var me = this;

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }

        Mask.displayLoadingMask();

        Common.scripts.ScriptManager.registerDwrServiceScripts(function () {
            me.syncBackgroundData(function() {
                Mask.setLoadingMessage('Syncing Work Requests');
                me.syncMaintenanceTransactionTables();
            }, me);
        }, me);

    },

    syncBackgroundData: function (onCompleted, scope) {
        var me = this,
            applicationName = me.getApplication().getName();

        SynchronizationManager.downloadValidatingTables(applicationName, false, function() {
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me);
            }
        }, me);
    },

    /**
     * Synchronizes the transaction tables for the app. Executes the following sequence: 1 - Syncs
     * transaction tables 2 - Runs server side Work Flow Rules 3 - Sync transaction tables
     */
    syncMaintenanceTransactionTables: function () {
        var me = this,
            storeIds = this.getTransactionTableStoreIds(),
            workRequestStore = Ext.getStore('workRequestsStore');

        // Remove all items from the work request store and suspend events
        // to prevent the work request list from updating during the sync
        // process
        workRequestStore.removeAll();
        SynchronizationManager.syncTransactionTables(storeIds, function () {
            Mask.setLoadingMessage('Updating Work Requests');
            me.executeWorkFlowRules(function(success, errorMessage) {
                if(success) {
                    Mask.setLoadingMessage('Syncing Work Requests');
                    SynchronizationManager.syncTransactionTables(storeIds, function () {
                        me.syncCompleted();
                    }, me);
                } else {
                    Ext.Msg.alert('Error', errorMessage);
                    me.syncCompleted();
                }
            }, me);
        });
    },

    /**
     * Loads the transaction stores and saves the TableDefs when the synchronization is complete.
     */
    syncCompleted: function () {
        var storeIds = this.getTransactionTableStoreIds(),
            tableDefStore = Ext.getStore('tableDefsStore'),
            myWorkSegmentedButton = this.getMyWorkSegmentedButton();

        Ext.each(storeIds, function (storeId) {
            var store = Ext.getStore(storeId);
            store.load();
        }, this);

        // Set the Work Request list filter to display My Work
        myWorkSegmentedButton.setPressedButtons(0);
        tableDefStore.sync();
        Mask.hideLoadingMask();
    },

    /**
     * Executes the server side workflow rules
     */
    executeWorkFlowRules: function (onCompleted, scope) {
        var me = this,
            session = Ext.create('Common.Session'),
            userName = ConfigFileManager.username,
            userProfile = UserProfile.getUserProfile(),
            callback = function(success, errorMessage) {
                if (success) {
                    session.endSession();
                }
                Ext.callback(onCompleted, scope, [success, errorMessage]);
            };

        session.startSession();
        Workflow.callMethodAsync('AbBldgOpsHelpDesk-MaintenanceMobileService-syncWorkData',
                                  [userName, userProfile.cf_id], me.DEFAULT_TIMEOUT,  callback, me);
    }
});
