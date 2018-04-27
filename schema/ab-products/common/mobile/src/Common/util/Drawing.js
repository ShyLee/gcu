
Ext.define('Common.util.Drawing', {
    alternateClassName : [ 'Drawing' ],
    singleton: true,

    // TODO: Move to service?
    getSVGFromServer: function (parameters) {
        var session = Ext.create('Common.Session'),
            result = null;

        session.doInSession(function () {
            var pkeyValues = {},
                planType = null,
                highlightParameters = [];

            if (!Ext.isEmpty(parameters.pkeyValues)) {
                pkeyValues = parameters.pkeyValues;
            }

            if (!Ext.isEmpty(parameters.plan_type)) {
                planType = parameters.plan_type;
            }

            if (!Ext.isEmpty(parameters.highlightParameters)) {
                highlightParameters = parameters.highlightParameters;
            }

            DrawingSvgService.highlightSvgDrawing(pkeyValues, planType, highlightParameters, {
                async: false,
                headers: { "cache-control": "no-cache" },
                callback: function (svgData) {
                    result = svgData;
                },
                errorHandler: function (message, exception) {
                    console.log('Fail to load required svg drawing: ' + exception.localizedMessage);
                }
            });

        });

        return result;
    },

    /*
    getSVGFromServerAsync: function (parameters, callback, scope) {
        var me = this;

        Ext.defer(function () {
            var result = me.getSVGFromServer(parameters);
            if (typeof callback === 'function') {
                callback.call(scope || me, result, parameters);
            }
        }, 100, me);
    },
    */


    getSVGFromServerAsync: function (parameters, callback, scope) {
        var me = this,
            session = Ext.create('Common.Session'),
            result = null;

        var pkeyValues = {},
            planType = null,
            highlightParameters = [];

        var onCompleted = function(result) {
            session.endSession();
            if (typeof callback === 'function') {
                callback.call(scope || me, result, parameters);
            }
        }

        // Construct the WFR parameters
        if (!Ext.isEmpty(parameters.pkeyValues)) {
            pkeyValues = parameters.pkeyValues;
        }

        if (!Ext.isEmpty(parameters.plan_type)) {
            planType = parameters.plan_type;
        }

        if (!Ext.isEmpty(parameters.highlightParameters)) {
            highlightParameters = parameters.highlightParameters;
        }

        session.startSession();
        DrawingSvgService.highlightSvgDrawing(pkeyValues, planType, highlightParameters, {
            async: true,
            headers: { "cache-control": "no-cache" },
            timeout: 30000,
            callback: function (svgData) {
                result = svgData;
                onCompleted(result);
            },
            errorHandler: function (message, exception) {
                result = null;
                console.log('Fail to load required svg drawing: ' + exception.localizedMessage);
                onCompleted(result);
            }
        });
    },


    // TODO: Do we need a restriction like bl_id for the delete?
    deleteFloorDrawings: function (onSuccess, onError, scope) {
        var me = this,
            db = SqliteConnectionManager.getConnection();

        db.transaction(function (tx) {
            tx.executeSql("DELETE FROM FloorDrawing", [], function () {
                if (typeof onSuccess === 'function') {
                    onSuccess.call(scope || me);
                }
            }, function (error) {
                if (typeof onError === 'function') {
                    onError.call(scope || me, error);
                }
            });
        });
    },

    /**
     * Deletes a Floor Drawing from the SQLite database
     * @param parameters
     * @param onSuccess
     * @param scope
     */
    deleteFloorDrawing: function(parameters, onSuccess, onError, scope) {
        var me = this,
            db = SqliteConnectionManager.getConnection(),
            sql = 'DELETE FROM FloorDrawing WHERE bl_id = ? AND fl_id = ? and plan_type = ?',
            values = [];

        values[0] = parameters.pkeyValues.bl_id;
        values[1] = parameters.pkeyValues.fl_id;
        values[2] = parameters.plan_type;

        db.transaction(function (tx) {
            tx.executeSql("DELETE FROM FloorDrawing", values, function () {
                if (typeof onSuccess === 'function') {
                    onSuccess.call(scope || me);
                }
            }, function (error) {
                if (typeof onError === 'function') {
                    onError.call(scope || me, error);
                }
            });
        });

    },


    /**
     * Writes the Floor Drawing SVG data to the SQLite database
     * @param parameters {Object} contains the bl_id, fl_id and plan_type values for the drawing record
     * @param svgData {String} The SVG data
     * @param onSuccess {Function} Called when the save is completed
     * @param scope {Object} The scope to execute the callback
     */
    saveFloorDrawing: function (parameters, svgData, onSuccess, scope) {
        var me = this,
            db = SqliteConnectionManager.getConnection(),
            sql = 'INSERT INTO FloorDrawing (bl_id, fl_id, plan_type, svg_data) VALUES (?, ?, ?, ?)',
            deleteSql = 'DELETE FROM FloorDrawing WHERE bl_id = ? AND fl_id = ? and plan_type = ?',
            blId = parameters.pkeyValues.bl_id,
            flId = parameters.pkeyValues.fl_id,
            planType = parameters.plan_type,
            values = [ blId, flId, planType, svgData ],

            afterDelete = function(tx) {
                tx.executeSql(sql, values, function () {
                    console.log('Drawing saved for ' + blId + ' - ' + flId + ' - ' + planType);
                    if (typeof onSuccess === 'function') {
                         onSuccess.call(scope || me);
                    }
                }, function (tx, error) {
                    throw new Error(error.message);
                });
            };

        if (svgData !== null) {
            db.transaction(function (tx) {
                tx.executeSql(deleteSql, [ blId, flId, planType ], afterDelete,
                function (tx, error) {
                    throw new Error(error.message);
                });
            });
        } else {
            console.log('Contents are empty. Drawing will not be saved for ' + blId + ' - ' + flId
                    + ' - ' + planType);
            if (typeof onSuccess === 'function') {
                onSuccess.call(scope || me);
            }
        }
    },

    saveTaskFloorDrawing: function (blId, flId, svgData) {
        var db = SqliteConnectionManager.getConnection(),
            deleteSql = 'DELETE FROM TaskFloorDrawing WHERE bl_id = ? AND fl_id = ?',
            insertSql = 'INSERT INTO TaskFloorDrawing (bl_id, fl_id, svg_data) VALUES(?,?,?)',
            onError = function (error) {
                throw new Error(error.message);
            },
            afterDelete = function(tx) {
                tx.executeSql(insertSql, [ blId, flId, svgData ], Ext.emptyFn, onError);
            };

        db.transaction(function (tx) {
            tx.executeSql(deleteSql, [ blId, flId ], afterDelete, onError);
        });
    },

    getSiteDrawingRecords: function (onSuccess, scope) {
        var me = this,
            db = SqliteConnectionManager.getConnection(),
            sql = 'SELECT site_id,detail_dwg FROM SpaceSite WHERE detail_dwg IS NOT NULL',
            onError = function (error) {
                throw new Error(error.message);
            };

        db.transaction(function (tx) {
            tx.executeSql(sql, null, function (tx, result) {
                var ln = result.rows.length, detailDrawings = [], i;

                for (i = 0; i < ln; i++) {
                    detailDrawings.push({
                        site_id: result.rows.item(i).site_id,
                        detail_dwg: result.rows.item(i).detail_dwg
                    });
                }
                if (typeof onSuccess === 'function') {
                    onSuccess.call(scope || me, detailDrawings);
                }
            }, onError);
        });

    },

    saveSiteDrawing: function (siteId, svgData, onCompleted, scope) {
        var me = this,
            deleteSql = 'DELETE FROM SiteDrawing WHERE site_id=?',
            insertSql = 'INSERT INTO SiteDrawing(site_id, svg_data) VALUES(?,?)',
            db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            onError = function (error) {
                throw new Error(error.message);
            },
            afterDelete = function (tx) {
                tx.executeSql(insertSql, [ siteId, svgData ], function() {
                    if(typeof onCompleted === 'function') {
                        onCompleted.call(scope || me);
                    }
                }, onError);
            };

        db.transaction(function (tx) {
            tx.executeSql(deleteSql, [ siteId ], afterDelete, onError);
        });
    },

    /**
     * Retrieves the SVG data from the server for the active plan types for the floor
     * @param floorId {Object} Object containing the building id (bl_id) and floor id (fl_id) values
     * @param activePlanTypes {Array} An array of active plan type objects
     */
    downloadFloorPlansByPlanType : function(floorId, activePlanTypes, progressBar) {
        var me = this,
            parameterValues = [],
            ln,
            retrieveSvgData = function(parameterIndex) {
                me.getSVGFromServerAsync(parameterValues[parameterIndex], function(svgData, params) {
                        progressBar.increment();
                        me.saveFloorDrawing(params, svgData, function() {
                            if (progressBar.getCancelled()) {
                                Ext.Msg.alert('Download Cancelled', 'Floor Plan download has been cancelled.');
                                return;
                            }
                            if (parameterIndex === ln - 1) {
                                return;
                            } else {
                                retrieveSvgData(parameterIndex += 1);
                            }
                        }, me);

                    });
                };

        // Return if there are no fields to process
        if (floorId && floorId.length === 0) {
            return;
        }

        // Prepare the plan type parameters for each floor
        Ext.each(floorId, function(floorId) {
            Ext.each(activePlanTypes, function(activePlanType) {
                var parameters = {
                    plan_type : activePlanType,
                    pkeyValues : {
                        bl_id : floorId.bl_id,
                        fl_id : floorId.fl_id
                    },
                    displayError : false
                };
                parameterValues.push(parameters);
            }, me);
        }, me);

        ln = parameterValues.length;
        retrieveSvgData(0);
    },

    /**
     * Returns an array of Active Plan Types
     * @returns {Array}
     */
    getActivePlanTypes : function() {
        var planTypesStore = Ext.getStore('planTypes'),
            activePlanTypes = [];

        // The Plan Types store is loaded and does not have a page size set
        planTypesStore.each(function(planType) {
            if (planType.get('active') === 1) {
                activePlanTypes.push(planType.get('plan_type'));
            }
        });

        return activePlanTypes;
    }
});