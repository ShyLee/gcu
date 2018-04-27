/**
 * Controller class for the Space Book Download features
 * Handles events and processes required to download floor plans
 * @author
 * @since 21.1
 */
Ext.define('SpaceBook.controller.Download', {

	extend : 'Ext.app.Controller',
	requires : [ 'Common.controls.DrawingControl', 'Common.view.panel.ProgressBar', 'Common.util.Drawing' ],

	config : {
		refs : {
			siteList : 'siteListPanel', // TODO: Remove this after the site_id is sorted out.
			floorsListView : 'floorsListPanel',
			siteView : 'sitePanel'
		},
		control : {
			'button[action=downloadFloorPlans]' : {
                tap: function () {
                    this.downloadFloorPlans('all');
                }
			},
			'button[action=downloadSiteFloorPlans]' : {
                tap: function () {
                    this.downloadFloorPlans('site');
                }
			},
			'button[action=downloadBuildingFloorPlans]' : {
                tap: function () {
                    this.downloadFloorPlans('building');
                }
			},
            progressbarpanel : {
                cancel : 'onCancelProgress',
                complete : 'onCompleteProgress'
            }
		},

        downloadFloorPlanMessage: ['The Floor Plan download may take several minutes.',
                                   '<br>Do you wish to continue?'].join('')

	},

    init: function() {
        var me = this,
            surveyController = this.getApplication().getController('Survey');

        // Register the Survey controller displayprogress event
        surveyController.on('displayprogress', function(maxValue) {
            me.displayProgressBar(maxValue);
        });
    },

    /**
     * Downloads the active floor plans
     * @param onCompleted {Function} Executed when the operation is completed
     * @param scope {Object} Scope to execute the callback in.
     */
    downloadPlanTypes: function(onCompleted, scope) {
        var me = this,
            planTypesStore = Ext.getStore('planTypes');

        planTypesStore.clearAndImportRecords(function () {
            planTypesStore.load(function () {
                if (typeof onCompleted === 'function') {
                    onCompleted.call (scope || me);
                }
            });
        }, me);
    },

    /**
     * Retrieves floor codes from the BuildingFloors view.
     * @param filter {Object} Restricts the returned recordset. The applied filter
     * is determined by the selected location that the download action is initiated from.
     * @param callback {Function} Called when the operation is complete
     * @param scope {Object} The scope to execute the callback function in.
     */
    getFloorCodes: function(filter, callback, scope) {
        var me = this,
            buildingFloorStore = Ext.getStore('buildingFloorsStore'),
            floorCodes = [];

        buildingFloorStore.retrieveAllStoreRecords(filter, function(records){
            Ext.each(records, function(record) {
                floorCodes.push({
                    bl_id : record.data.bl_id,
                    fl_id : record.data.fl_id
                });
            });
            if (typeof callback === 'function') {
                callback.call(scope || me, floorCodes);
            }
        }, me);
    },


    /**
     * Generates a filter object based on the level the download action was
     * initiated from
     * @param level {String} Valid values are 'all', 'site', and 'building'
     * @param id {String} The primary key of the parent site or building record
     * @returns {Common.util.Filter} Filter object
     */
    getFloorDownloadFilter:function(level, id) {
        var filterObject =  {
            property:'',
            value: '',
            matchIsNullValue: false,
            isEqualNull: true
        };

        if (level === 'all') {
            filterObject =  null;
        }
        if (level === 'site') {
            if(id === null) {
                filterObject.property = 'site_id';
                filterObject.matchIsNullValue = true;
            } else {
                filterObject.property = 'site_id';
                filterObject.value = id;
            }
        }
        if (level === 'building') {
            filterObject.property = 'bl_id';
            filterObject.value = id;
        }

        if (filterObject === null) {
            return null;
        } else {
            return Ext.create('Common.util.Filter', filterObject);
        }
    },


	checkNumberOfFloorPlansToDownload : function(numberOfPlans, callback, scope) {
		var me = this,
            downloadFloorPlanMessage = me.getDownloadFloorPlanMessage();

        // TODO: Use constant or config value from max numberof plans
		if (numberOfPlans < 600) {
			if (typeof callback === 'function') {
				callback.call(scope || me, true);
			}
		} else {
			Ext.Msg.confirm('Download Floor Plans', downloadFloorPlanMessage, function(
					buttonId) {
				var returnVal = buttonId === 'yes' ? true : false;
				if (typeof callback === 'function') {
					callback.call(scope || me, returnVal);
				}
			});
		}
	},

    /**
     * Downloads all floor plans for the provided location level
     * @param level {String} The location level.
     * <p>
     * Valid levels are:
     *  - all: download all floor plans
     *  - site: download all floor plans for the site
     *  - building: download all floor plans for the building
     */
    downloadFloorPlans: function (level) {
        var me = this,
            floorsListView,
            siteView,
            siteId,
            blId,
            downloadFilter = null;

        // Check Network connection before downloading.
        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }

        if (level === 'building') {
            floorsListView = me.getFloorsListView();
            blId = floorsListView.getParentId();
            downloadFilter = me.getFloorDownloadFilter(level, blId);
        }

        if (level === 'site') {
           siteView = me.getSiteView();
           siteId = siteView.getParentId();
           downloadFilter = me.getFloorDownloadFilter(level, siteId);
        }

        if (level === 'all') {
            downloadFilter = null;
        }

        // Download Active Plan Types before downloading floor plans
        me.downloadPlanTypes(function() {
            SpaceBook.util.Ui.applyUserGroups();
            me.doDownloadFloorPlans(downloadFilter);
        }, me);

    },

    doDownloadFloorPlans: function(downloadFilter) {
        var me = this,
            activePlanTypes = Drawing.getActivePlanTypes();

        if (activePlanTypes.length === 0) {
            Ext.Msg.alert(LocaleManager.getLocalizedString('No active plan types found.'));
            return;
        } else {
            me.getFloorCodes(downloadFilter, function(floorCodes) {
                if(floorCodes.length === 0) {
                    Ext.Msg.alert('Floor Plans', 'There are no Floor Plans to Download.');
                    return;
                }
                // TODO: Check if there are floors returned, if not end here.
                var numberOfPlans = activePlanTypes.length * floorCodes.length;
                me.checkNumberOfFloorPlansToDownload(numberOfPlans, function(continueDownload) {
                    if (continueDownload) {
                        me.displayProgressBar(numberOfPlans);
                        Drawing.deleteFloorDrawings(function() {
                            Drawing.downloadFloorPlansByPlanType(floorCodes, activePlanTypes, me.progressView);
                        }, function(error) {
                            alert('error ' + error);
                        });
                    } else {
                        return;
                    }
                }, me);
            }, me);
        }
    },

	displayProgressBar : function(maxValue) {
		var me = this;

		if (!me.progressView) {
			me.progressView = Ext.create('Common.view.panel.ProgressBar', {
                value: 0,
                maxValue: maxValue,
                progressMessage: 'Loading Floor Plan {0} of {1}'
            });
            Ext.Viewport.add(this.progressView);
		} else {
            me.progressView.setValue(0);
            me.progressView.setMaxValue(maxValue);
            me.progressView.setCancelled(false);
        }
		me.progressView.show();
	},

	onCancelProgress : function() {
		if (this.progressView) {
			this.progressView.hide();
		}
	},

	onCompleteProgress : function() {
		if (this.progressView) {
			this.progressView.hide();
		}
	}
});