/**
 * Writes the cached Sencha files that are collected during start up to the SQLite database.
 * The application data is transferred from the start up code to the application in the Ab.appCacheData array.
 * @author Jeff Martin
 */
Ext.define('Common.util.AppCacheManager', {
    singleton: true,

    requires: 'Common.store.proxy.SqliteConnectionManager',

    /**
     * Writes the application cache data to the client database
     * The Abm.appCacheData array is populated in the Sencha microloader
     * start up code.
     */
    writeAppCacheData: function(onCompleted, scope) {
        var me = this,
            appData,
            appKey = '%',
            deleteSql = 'DELETE FROM AppCache WHERE key LIKE ?',
            insertSql = 'INSERT INTO AppCache(key, value) VALUES(?,?)',
            db = SqliteConnectionManager.getConnection(),
            itemCount,
            onError = function(error) {
                throw new Error(error);
            },
            checkComplete = function() {
                if(itemCount === 0) {
                    if (typeof onCompleted === 'function') {
                        onCompleted.call(scope || me );
                    }
                }
            };


        if (Ext.isDefined(Abm.appCacheData)) {
            appData = Abm.appCacheData;
            itemCount = appData.length;
            if (Ext.isDefined(Abm.appKey)) {
                appKey = '%' + Abm.appKey + '%';
            }
            db.transaction(function(tx) {
                tx.executeSql(deleteSql, [appKey], function(tx) {
                    Ext.each(appData, function(item) {
                        tx.executeSql(insertSql, [item.key, item.value], function() {
                            itemCount -=1;
                            checkComplete();
                        }, onError);
                    });
                });
            });
        }
    }
});