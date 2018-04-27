View.createController('abBldgMetricsBldgsMap_ctrl', {
	// Ab.flash.Map control instance
	map: null,
	
	indexSelected:null,
	
	afterViewLoad: function(){
        // initialize the Flash Map control
		this.map = new Ab.flash.Map(
			'htmlBldgsMap', 
			'objBldgsMap',
			'abBldgMetricsBldgsMap_ds'					
		);
		View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').mapControl = this.map;
	},
	
	htmlBldgsMap_onHighlightByMetric: function(){
		var openerController = this;
		
		View.openDialog('ab-bldgmetrics-select-metrics.axvw',null, true, {
			width:400,
			height:500, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsSelectMetrics_ctrl');
					var gridPanel = dialogController.bldgMetricsSelectMetrics_grid;
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_bldgsAllMetrics;
					
					// Define which 'metrics' will be returned by DataSource 
                    dataSource.addParameter("cost_per_area", getMessage("cost_per_area"));
                    dataSource.addParameter("avg_area_em", getMessage("avg_area_em"));
                    dataSource.addParameter("ru_ratio", getMessage("ru_ratio"));
                    dataSource.addParameter("usable_area", getMessage("usable_area"));
                    dataSource.addParameter("value_book", getMessage("value_book"));
                    dataSource.addParameter("value_market", getMessage("value_market"));
                    dataSource.addParameter("fci", getMessage("fci"));
                    dataSource.addParameter("operating_costs", getMessage("operating_costs"));
                    dataSource.addParameter("capital_project_cost", getMessage("capital_project_cost"));
                    dataSource.addParameter("area_estimated", getMessage("area_estimated"));
                    dataSource.addParameter("efficency_rate", getMessage("efficency_rate"));
                    dataSource.addParameter("int_gross_area", getMessage("int_gross_area"));
                    dataSource.addParameter("total_lease_neg_area", getMessage("total_lease_neg_area"));
                    dataSource.addParameter("total_occup_area", getMessage("total_occup_area"));
                    dataSource.addParameter("rentable_area", getMessage("rentable_area"));
                    dataSource.addParameter("total_room_area", getMessage("total_room_area"));
                    dataSource.addParameter("employee_headcount", getMessage("employee_headcount"));
                    dataSource.addParameter("max_bldg_occup", getMessage("max_bldg_occup"));
                    dataSource.addParameter("building_occupancy", getMessage("building_occupancy"));
                    dataSource.addParameter("vacancy_percent", getMessage("vacancy_percent"));
                    dataSource.addParameter("chargeable_cost", getMessage("chargeable_cost"));
					
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
						this.bldgMetricsSelectMetrics_grid.setAllRowsSelected(false);
						row.select(selected);
						openerController.indexSelected = row.getIndex();
					};
					
					//Override 'onShowFieldsEvent' function from dialogController. This function is the event handler for 'onShowFields' action.
					dialogController.onShowFieldsEvent = function(){
						
						if(openerController.indexSelected){
							
							var markerProperty = openerController.map.getMarkerPropertyByDataSource('abBldgMetricsBldgsMap_ds');

							markerProperty.setSymbolType('diamond');
							openerController.map.updateDataSourceMarkerPropertyPair('abBldgMetricsBldgsMap_ds', markerProperty);
							
							//set thematic colors
							markerProperty.thematicColors = [markerProperty.colors[0],markerProperty.colors[9],markerProperty.colors[8]];
							
							var fieldSelected = View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').fieldsArray[openerController.indexSelected];
							var avgFieldValue = View.getOpenerView().controllers.get('bldgStatisticsController').bldgMetricsBldgsStatistics_form.getFieldValue(fieldSelected+"_avg");
							var maxFieldValue = View.getOpenerView().controllers.get('bldgStatisticsController').bldgMetricsBldgsStatistics_form.getFieldValue(fieldSelected+"_max");
							
							//set thematic buckets interval
							var thematicBuckets = [avgFieldValue, maxFieldValue];	 
							
							markerProperty.setThematic(fieldSelected, thematicBuckets); 
		
							//set to null previous 'thematicLegend'
							openerController.map.thematicLegend = null;
							
							//build thematic legend
							openerController.map.buildThematicLegend(markerProperty);
	
							openerController.map.refresh(View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').restriction);
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
		if (!mapControl.getMarkerPropertyByDataSource('abBldgMetricsBldgsMap_ds')) {
			
			var markerProperty = new Ab.flash.ArcGISMarkerProperty('abBldgMetricsBldgsMap_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.bl_id', 'bl.pr_id', 'bl.name', 'bl.address', 'bl.cost_sqft', 'bl.ratio_ur', 'bl.ratio_ru', 'bl.area_usable', 'bl.value_book', 'bl.value_market']);
			mapControl.updateDataSourceMarkerPropertyPair('abBldgMetricsBldgsMap_ds', markerProperty);
			
		}
		
		mapControl.refresh(View.getOpenerView().controllers.get('abBldgMetricsBldgs_ctrl').restriction);
		
}