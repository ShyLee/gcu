Ext.define('SpaceBook.controller.SpaceBookSync', {
	extend : 'Ext.app.Controller',

	requires : [ 'Common.util.Filter',
                 'Common.util.SynchronizationManager' ],

    config: {
        refs: {
            siteList: 'siteListPanel'
        },
        control: {
            'mainview #downloadData': {
                tap: 'onDownloadData'
            }
        }

    },

    // TODO: Check if we need to load the Site and Building stores by page using loadPage
    onDownloadData: function () {
        var me = this,
            applicationName = me.getApplication().getName(),
            siteList = me.getSiteList(),
            emptyTextMessage = siteList.getEmptyText();

        if (!Network.checkNetworkConnectionAndDisplayMessage()) {
            return;
        }
        siteList.setEmptyText('');
        Mask.displayLoadingMask();
        ScriptManager.registerDwrServiceScripts(function() {
            SynchronizationManager.downloadValidatingTables(applicationName, true, function () {
                me.downloadSiteDrawings(function() {
                    SpaceBook.util.Ui.applyUserGroups();
                    siteList.setEmptyText(emptyTextMessage);
                    Mask.hideLoadingMask();
                }, me);
            }, me);
        }, me);
    },

	/**
	 * Retrieve the site_id values for all of the records where the detail_dwg field is not null. Retrieve the site
	 * drawing data from the server for each of the returned site records. Note: We are retrieving the site records from
	 * the database to avoid complications that arise from using the SpaceSite store to display the main page list of
	 * sites.
	 */
	downloadSiteDrawings : function(onCompleted, scope) {
		var me = this;
		Common.util.Drawing.getSiteDrawingRecords(function(records) {
			me.getSiteDrawingsFromServer(records, function() {
                Ext.callback(onCompleted, scope);
            }, me);
		}, me);
	},

	getSiteDrawingsFromServer : function(siteRecords, onCompleted, scope) {

		var me = this,
            parameters = {
			    highlightParameters : [ {
				    view_file : 'ab-sp-space-book-bl.axvw',
				    hs_ds : 'ds_ab-sp-space-book-bl_blHighlight',
				    label_ds : 'ds_ab-sp-space-book-bl_blLabel',
				    label_ht : '3'
			    } ],
			        pkeyValues : {
				        site_id : ''
			        }
           },
           recordCount = siteRecords.length,
           checkCompleted = function() {
               recordCount -= 1;
               if(recordCount === 0) {
                   if (typeof onCompleted === 'function') {
                       onCompleted.call(scope || me);
                   }
               }
           };

		Ext.each(siteRecords, function(siteRecord) {
			var site_id = siteRecord.site_id,
                svgData;
			parameters.pkeyValues.site_id = site_id;

            svgData = Common.util.Drawing.getSVGFromServer(parameters);
            Common.util.Drawing.saveSiteDrawing(site_id, svgData, function() {
                        checkCompleted();
                    });

			//Common.util.Drawing.getSVGFromServerAsync(parameters, function(svgData) {
            //    Common.util.Drawing.saveSiteDrawing(site_id, svgData, function() {
            //        checkCompleted();
            //    });
            //}, me);
		}, me);
	}
});