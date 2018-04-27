Ext.define('Campus.controller.Download', {

	extend : 'Ext.app.Controller',
	requires : [ 'Common.controls.DrawingControl', 'Common.view.panel.ProgressBar', 'Common.util.Drawing' ],

	config : {
		refs : {
			siteList : 'siteListPanel', // TODO: Remove this after the site_id is sorted out.
			progressbar : 'progressbarpanel > progressbar',
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
			progressbar : {
				cancel : 'onCancelProgress',
				complete : 'onCompleteProgress'
			}
		}
	},

    onDownloadPlanTypes: function(onCompleted, scope) {
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
	},

	// TODO: getFloorCodesFromSite and getFloorCodes from building are almost the same function
	// refactor..

	getFloorCodesFromSite : function(siteId, callback, scope) {
		var me = this, buildingFloorStore = Ext.getStore('buildingFloorsStore'), floorCodes = [];

		buildingFloorStore.clearFilter();
		buildingFloorStore.setDisablePaging(true);
		// Do not apply the filter if the site_id parameter is null. This will
		// retrieve the floorCodes for all sites.
		if (siteId !== null) {
			buildingFloorStore.filter('site_id', siteId);
		}
		buildingFloorStore.load(function(records) {
			Ext.each(records, function(record) {
				floorCodes.push({
					bl_id : record.data.bl_id,
					fl_id : record.data.fl_id
				});
			});
			buildingFloorStore.clearFilter();
			buildingFloorStore.setDisablePaging(false);
			if (typeof callback === 'function') {
				callback.call(scope || me, floorCodes);
			}
		});
	},

	getFloorCodesFromBuilding : function(blId, callback, scope) {
		var me = this,
            buildingFloorStore = Ext.getStore('buildingFloorsStore'),
            floorCodes = [];

		buildingFloorStore.clearFilter();
		buildingFloorStore.setDisablePaging(true);
		buildingFloorStore.filter('bl_id', blId);
		buildingFloorStore.load(function(records) {
			Ext.each(records, function(record) {
				floorCodes.push({
					bl_id : record.data.bl_id,
					fl_id : record.data.fl_id
				});
			});
			buildingFloorStore.clearFilter();
			buildingFloorStore.setDisablePaging(false);
			if (typeof callback === 'function') {
				callback.call(scope || me, floorCodes);
			}
		});
	},

	downloadFloorPlansForSite : function(siteId) {
		var me = this,
            activePlanTypes = me.getActivePlanTypes();

		if (activePlanTypes.length === 0) {
			Ext.Msg.alert(LocaleManager.getLocalizedString('No active plan types found.'));
			return;
		} else {
			// Get a list of all floors for this site
			me.getFloorCodesFromSite(siteId, function(floorCodes) {
				var numberOfPlans = activePlanTypes.length * floorCodes.length;

				me.checkNumberOfFloorPlansToDownload(numberOfPlans, function(continueDownload) {
					if (continueDownload) {
						me.displayProgressBar(numberOfPlans);
						Common.util.Drawing.deleteFloorDrawings(function() {
							me.downloadFloorPlansByPlanType(floorCodes, activePlanTypes);
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

	downloadFloorPlansForBuilding : function(blId) {
		var me = this,
            activePlanTypes = me.getActivePlanTypes();

		if (activePlanTypes.length === 0) {
			Ext.Msg.alert(LocaleManager.getLocalizedString('No active plan types found.'));
			return;
		} else {
			me.getFloorCodesFromBuilding(blId, function(floorCodes) {
				// TODO: Check if there are floors returned, if not end here.

				var numberOfPlans = activePlanTypes.length * floorCodes.length;
				me.checkNumberOfFloorPlansToDownload(numberOfPlans, function(continueDownload) {
					if (continueDownload) {
						me.displayProgressBar(numberOfPlans);
						Common.util.Drawing.deleteFloorDrawings(function() {
							me.downloadFloorPlansByPlanType(floorCodes, activePlanTypes);
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

	downloadFloorPlansByPlanType : function(floorIds, activePlanTypes) {
		var me = this, parameterValues = [],
            ln,
            retrieveSvgData = function(parameterIndex) {
			Common.util.Drawing.getSVGFromServerAsync(parameterValues[parameterIndex], function(svgData, params) {
                var progressBar = me.getProgressbar();
				progressBar.increment();
				Common.util.Drawing.saveFloorDrawing(params, svgData, function() {
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

		Ext.each(floorIds, function(floorId) {
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

	checkNumberOfFloorPlansToDownload : function(numberOfPlans, callback, scope) {
		var me = this;

		if (numberOfPlans < 600) {
			if (typeof callback === 'function') {
				callback.call(scope || me, true);
			}
		} else {
			Ext.Msg.confirm('Download Floor Plans', 'You are attempting to download ' + numberOfPlans
					+ ' Floor Plans.<br>A The download may take several minutes. Do you wish to continue?', function(
					buttonId) {
				var returnVal = buttonId === 'yes' ? true : false;
				if (typeof callback === 'function') {
					callback.call(scope || me, returnVal);
				}
			});
		}
	},

    downloadFloorPlans: function (level) {
        var me = this;
        if (level === 'building') {
            me.onDownloadPlanTypes(function() {
                me.onDownloadBuildingFloorPlans();
            }, me);
        }

        if (level === 'site') {
            me.onDownloadPlanTypes(function() {
                me.onDownloadSiteFloorPlans();
            }, me);
        }

        if (level === 'all') {
            me.onDownloadPlanTypes(function() {
                me.onDownloadFloorPlans();
            }, me);
        }
    },

	onDownloadFloorPlans : function() {
		// A site_id value of null will download all
		// floor plans
		this.downloadFloorPlansForSite(null);
	},

	onDownloadSiteFloorPlans : function() {
		var siteView = this.getSiteView(),
            siteId = siteView.getParentId();

		this.downloadFloorPlansForSite(siteId);
	},

	onDownloadBuildingFloorPlans : function() {
		var floorsListView = this.getFloorsListView(),
            blId = floorsListView.getParentId();

		this.downloadFloorPlansForBuilding(blId);
	},

	displayProgressBar : function(maxValue) {
		var progressBar;

		if (!this.progressView) {
			this.progressView = Ext.create('Common.view.panel.ProgressBar');
		}

		progressBar = this.getProgressbar();
		progressBar.setValue(0);
		progressBar.setMaxValue(maxValue);
        progressBar.setCancelled(false);
		progressBar.setProgressMessage('Loading Floor Plan {0} of {1}');
		Ext.Viewport.add(this.progressView);
		this.progressView.show();
	},

	onCancelProgress : function() {
		//this.setCancelDownload(true);
		if (this.progressView) {
			this.progressView.hide();
		}
	},

    onInitializeProgress: function () {
        this.setCancelDownload(false);
    },

	onCompleteProgress : function() {
		if (this.progressView) {
			this.progressView.hide();
		}
	}
});