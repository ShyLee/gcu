var abBldgMetricsOrgsMap_ctrl = View.createController('abBldgMetricsOrgsMap_ctrl', {
	// Ab.flash.Map control instance
	map: null,
	
	indexSelected:null,
	
	afterViewLoad: function(){
        // initialize the Flash Map control
		this.map = new Ab.flash.Map(
			'htmlOrgsMap', 
			'objOrgsMap',
			'abBldgMetricsOrgsMap_ds'					
		);
		
		View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').mapControl = this.map;
	},
	
	htmlOrgsMap_onHighlightByMetric: function(){
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-orgs-select-metrics.axvw',null, true, {
			width:400,
			height:500, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsOrgsSelectMetrics_ctrl');
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_orgsAllMetrics;
					var gridPanel = dialogController.bldgMetricsOrgsSelectMetrics_grid;
					
					// Define which 'metrics' will be returned by DataSource 
                    dataSource.addParameter("area_alloc", getMessage("area_alloc"));
                    dataSource.addParameter("area_chargable", getMessage("area_chargable"));
                    dataSource.addParameter("area_comn_nocup", getMessage("area_comn_nocup"));
                    dataSource.addParameter("area_comn_ocup", getMessage("area_comn_ocup"));
                    dataSource.addParameter("area", getMessage("area"));
                    dataSource.addParameter("area_comn_rm", getMessage("area_comn_rm"));
                    dataSource.addParameter("area_manual", getMessage("area_manual"));
                    dataSource.addParameter("area_comn_serv", getMessage("area_comn_serv"));
                    dataSource.addParameter("area_comn", getMessage("area_comn"));
                    dataSource.addParameter("area_unalloc", getMessage("area_unalloc"));
                    dataSource.addParameter("chargeable_cost", getMessage("chargeable_cost"));
                    dataSource.addParameter("em_headcount", getMessage("employee_headcount"));
                    dataSource.addParameter("cost_per_area", getMessage("cost_per_area"));
                    dataSource.addParameter("area_per_em", getMessage("area_per_em"));
                    dataSource.addParameter("fci", getMessage("fci"));
					
					dialogController.dataSource = dataSource;
					
					
					//Override 'selectRows' function from dialogController.
					dialogController.selectRows = function(){
					
						if (openerController.indexSelected) {
							gridPanel.enableSelectAll(false);
							gridPanel.rows[openerController.indexSelected].row.select(true);
							gridPanel.updateHeight();
						}
					}
					
					//Add 'onClickEvent' function to dialogController. This function act like grid_multipleSelectionColumn_onClick event handler. 
					dialogController.onClickEvent = function(row){
						var selected = row.isSelected();
						this.bldgMetricsOrgsSelectMetrics_grid.setAllRowsSelected(false);
						row.select(selected);
						openerController.indexSelected = row.getIndex();
					};
					
					//Override 'onShowFieldsEvent' function from dialogController. This function is the event handler for 'onShowFields' action.
					dialogController.onShowFieldsEvent = function(){
						
						if(openerController.indexSelected){
							
							var markerProperty = openerController.map.getMarkerPropertyByDataSource('abBldgMetricsOrgsMap_ds');

							markerProperty.setSymbolType('diamond');
							openerController.map.updateDataSourceMarkerPropertyPair('abBldgMetricsOrgsMap_ds', markerProperty);
							
							//set thematic colors
							markerProperty.thematicColors = [markerProperty.colors[0],markerProperty.colors[9],markerProperty.colors[8]];
							
							var fieldSelected = View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').fieldsArray[openerController.indexSelected];
							var avgFieldValue = View.getOpenerView().controllers.get('abBldgMetricsOrgsStatistics_ctrl').bldgMetricsOrgsStatistics_form.getFieldValue(fieldSelected+"_avg");
							var maxFieldValue = View.getOpenerView().controllers.get('abBldgMetricsOrgsStatistics_ctrl').bldgMetricsOrgsStatistics_form.getFieldValue(fieldSelected+"_max");
							
							//set thematic buckets interval
							var thematicBuckets = [avgFieldValue, maxFieldValue];	 
							
							markerProperty.setThematic(fieldSelected, thematicBuckets); 
		
							//set to null previous 'thematicLegend'
							openerController.map.thematicLegend = null;
							
							//build thematic legend
							openerController.map.buildThematicLegend(markerProperty);
	
							openerController.abBldgMetricsOrgsMap_ds.addParameter('treeSelection', View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').restriction);
							openerController.map.refresh("1=1");
						}
						
					}
				}
		});
	} 
})


/**
 * This function is called from the Flash Map control after it is loaded. 
 * 
 * @param {panelId} The ID of the parent HTML panel defined in the AXVW file.
 * @param {mapId}   The ID of the EMBED element that hosts the map control SWF file. 
 */
function afterMapLoad_JS(panelId, mapId){
	
		//create the markerProperty only if the map is loaded for the first time
		if (!mapControl.getMarkerPropertyByDataSource('abBldgMetricsOrgsMap_ds')) {
			
			var markerProperty = new Ab.flash.ArcGISMarkerProperty('abBldgMetricsOrgsMap_ds', ['rm.lat', 'rm.lon'], ['rm.bl_id'], ['rm.bl_id', 'rm.area', 'rm.chargeable_cost', 'rm.em_headcount', 'rm.fci']);
			mapControl.updateDataSourceMarkerPropertyPair('abBldgMetricsOrgsMap_ds', markerProperty);
			
		}
		
		
		abBldgMetricsOrgsMap_ctrl.abBldgMetricsOrgsMap_ds.addParameter('treeSelection', View.getOpenerView().controllers.get('abBldgMetricsOrgs_ctrl').restriction);
		mapControl.refresh("1=1");
		
}