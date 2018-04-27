/**
 * Contains common synchronization functions.
 * 
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.SynchronizationManager', {
	alternateClassName : [ 'SynchronizationManager' ],

    requires: 'Common.util.Mask',
	singleton : true,

    appName: '',

	/**
	 * Synchronizes the transaction table or tables.
	 * 
	 * @param {Array/String}
	 *            transactionTableStoreIds The store ids of the stores to synchronize
	 * @param {Function}
	 *            completedCallback Called when all of the transaction tables have completed synchronization
	 * @param {Object}
	 *            scope The scope used to execute the completedCallback function.
	 */
	syncTransactionTables : function(transactionTableStoreIds, completedCallback, scope) {
		var me = this;

		if (Ext.isArray(transactionTableStoreIds)) {
			syncStores = transactionTableStoreIds;
		} else {
			syncStores = [ transactionTableStoreIds ];
		}

		// Synchronize each of the transaction tables
		// The following steps are performed by the synchronization operation on
		// each of the transaction tables:
		// 1. Records are retrieved from the mobile database where the mob_is_changed
		// field is equal to 1
		// 2. The transaction table definition in the mobile database is compared
		// with the table definition from the server side TableDef object. The
		// mobile database definition is modified if it does not match the server
		// side table definition.
		// 3. The changed records are 'checked in' to the WebCentral server database
		// 4. Records in the WebCentral database that are assigned to the current device
		// owner are 'checked out' from the server database and transferred to the
		// mobile database.

        me.doSync(syncStores, 0, function() {
            me.syncTableDefsStore();
            if (typeof completedCallback === 'function') {
                completedCallback.call(scope || me);
            }
        }, scope);
	},

    doSync: function(syncStores, index, onCompleted, scope) {
        var me = this,
            store = Ext.getStore(syncStores[index]),
            model = store.getModel();

        store.suspendEvents();
        model.prototype.disableEditHandling = true;

        store.synchronize(function() {
            index += 1;
            store.resumeEvents(true);
            model.prototype.disableEditHandling = false;
            if(index === syncStores.length) {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            } else {
                me.doSync(syncStores, index, onCompleted, scope);
            }
        }, me);
    },

    //********* Validating Tables  **************//

    /**
     * Downloads the validating data. Downloads all stores that are type Validating Table store.
     * @param appName {String} The name of the application
     * @param alwaysDownload {Boolean} True to always download the validating data regardless of the
     * last download timestamp.
     * @param onCompleted {Function} callback function called when the download is completed.
     * @param scope {Object} The scope to execute the callback function in.
     */
    downloadValidatingTables: function (appName, alwaysDownload, onCompleted, scope) {

        var me = this,
            stores = this.getValidatingStores(),
            downloadRequired = true;

        me.appName = appName;

        // If alwaysDownload is true we skip the background data required step
        if (!alwaysDownload) {
            downloadRequired = me.backgroundDataIsRequired();
        }

        if (!downloadRequired) {
            if (typeof onCompleted === 'function') {
                onCompleted.call(scope || me);
            }
            return;
        }

        me.setUserStoreRestriction();
        Mask.setLoadingMessage('Downloading Background Data');

        me.doValidatingSync(stores, 0, function() {
            me.syncTableDefsStore();
            me.loadStoresAfterSync(function() {
                me.updateLastDownloadTime();
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            }, me);
        }, me);
    },

    doValidatingSync: function(validatingStores, index, onCompleted, scope) {
        var me = this,
            store = Ext.getStore(validatingStores[index]);

        store.suspendEvents();

        store.clearAndImportRecords(function(success) {
            console.log('----> Open Sessions: ' + Common.Session.sessionCount + ' <-------');
            index += 1;
            store.resumeEvents(true);
            if(index === validatingStores.length || (success === false)) {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            } else {
                me.doValidatingSync(validatingStores, index, onCompleted, scope);
            }
        }, me);
    },

    /**
     * Get an array of all of the validating stores for the application.
     *
     * @return {Array} Validating stores.
     */
    getValidatingStores: function () {
        var validatingStores = [];

        Ext.data.StoreManager.each( function (store) {
            if (store instanceof Common.store.sync.ValidatingTableStore) {
                validatingStores.push(store);
            }
        });

        return validatingStores;
    },

    /**
     * Load all of the validating stores after the sync is completed.
     */
    loadValidatingStores: function (onCompleted, scope) {
        var me = this,
            validatingStores = this.getValidatingStores(),
            numberOfStores = validatingStores.length,
            checkIfLoadingIsComplete = function () {
                numberOfStores -= 1;
                if (numberOfStores === 0) {
                    if (typeof onCompleted === 'function') {
                        onCompleted.call(scope || me);
                    }
                }
            };

        Ext.each(validatingStores, function (store) {
            var isPagingDisabled = store.getDisablePaging();
            if (!isPagingDisabled) {
                store.loadPage(1, function() {
                    checkIfLoadingIsComplete();
                }, me);
            } else {
                store.load(function(){
                    checkIfLoadingIsComplete();
                },me);
            }
        });
    },

    loadUserProfile: function (onCompleted, scope) {
        var me = this,
            userProfileStore = Ext.getStore('userProfileStore');
        // The userProfileStore may not be used by all apps. Check if it exists before loading
        if (userProfileStore) {
            userProfileStore.load(function () {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            }, me);
        }
    },

    syncTableDefsStore: function () {
        var tableDefsStore = Ext.getStore('tableDefsStore');
        tableDefsStore.sync();
    },

    /**
     * Loads the validating table stores when the sync has completed
     */
    loadStoresAfterSync: function (onCompleted, scope) {
        var me = this;
        me.loadValidatingStores(function() {
            me.loadUserProfile(function() {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            }, me);
        }, me);
    },

    updateLastDownloadTime: function () {
        var me = this,
            downloadStore = Ext.getStore('downloadStore'),
            downloadRecord;

        downloadRecord = downloadStore.findRecord('application', me.appName);

        if(downloadRecord) {
            downloadRecord.set('downloadTime', new Date());
        } else {
            downloadRecord = new Common.model.Download({application: me.appName, downloadTime: new Date()});
        }

        downloadStore.add(downloadRecord);
        downloadStore.sync();
    },

    backgroundDataIsRequired: function () {
        var me = this,
            downloadStore = Ext.getStore('downloadStore'),
            lastDownloadTime = new Date(),
            downloadRecord,
            hoursDifference = 1024;

        downloadRecord = downloadStore.findRecord('application', me.appName);
        if (downloadRecord) {
            lastDownloadTime = downloadRecord.get('downloadTime');
            hoursDifference = this.timeDifference(lastDownloadTime, new Date());
        }

        return hoursDifference > 12;
    },

    timeDifference: function(laterdate,earlierdate) {
        var difference = laterdate.getTime() - earlierdate.getTime(),
                hoursDifference = Math.floor(difference/1000/60/60);

        return Math.abs(hoursDifference);
    },

    setUserStoreRestriction: function () {
        // Set restriction on Users store
        var usersStore = Ext.getStore('usersStore');
        if (usersStore) {
            usersStore.setRestrictionClause({
                tableName: 'afm_users',
                fieldName: 'user_name',
                operation: 'EQUALS',
                value: ConfigFileManager.username
            });
        }
    }

});