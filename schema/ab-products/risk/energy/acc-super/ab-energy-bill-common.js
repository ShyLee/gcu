/**
 * Common controller for reports views 
 */
var abEnergyBillCommonController = View.createController('abEnergyBillCommonController',{
	unitsConversionFactorSql: "(CASE WHEN (SELECT conversion_factor FROM bill_unit WHERE bill_unit.bill_type_id = 'ELECTRIC' AND {0}) IS NULL"
								+ " THEN ${sql.replaceZero('0')}"
								+ " ELSE (SELECT ${sql.replaceZero('conversion_factor')} FROM bill_unit WHERE bill_unit.bill_type_id = 'ELECTRIC' AND {0})"
								+ " END)",
	unitsConversionFactorSqlForCost: "(CASE WHEN (SELECT conversion_factor FROM bill_unit WHERE bill_unit.bill_type_id = 'ELECTRIC' AND {0}) IS NULL"
								+ " THEN 0"
								+ " ELSE (SELECT conversion_factor FROM bill_unit WHERE bill_unit.bill_type_id = 'ELECTRIC' AND {0})"
								+ " END)",
	unitsConversionFactorSql_dflt: "bill_unit.rollup_type = 'Energy' AND bill_unit.is_dflt = 1",
	unitsConversionFactorSql_user: "bill_unit.bill_unit_id = '{0}'",
	
	userUnitsChoise: "MMBTU",
	
    /**
     * Add to the Bill Units select field the other ELECTRIC Energy bill units besides the MMBTU
     */
    setBillUnitsOptions: function(){
    	var selectNode = $('select_bill_units');
		var unitsRecords = this.view.dataSources.get("abEnergyBillCommon_ds_allEnergyUnits").getRecords();
    	for (var i = 0; i < unitsRecords.length; i++) {
			var unitRecord = unitsRecords[i];
			var unit = unitRecord.getValue("bill_unit.bill_unit_id");
			var isDflt = (unitRecord.getValue("bill_unit.is_dflt") == "1");
			
			if(unit != "MMBTU"){
				var optionNode = document.createElement('option');
				optionNode.value = unit;
				optionNode.selected = isDflt;
				optionNode.appendChild(document.createTextNode(unit));
				selectNode.appendChild(optionNode);
			} else {
				selectNode.options[0].selected = isDflt;
			}
		}
    },

    /**
     * Set unitConversionFactor parameter to the datasources
     */
    setBillUnitsParameter: function(initial, viewPanelIds, viewPanelIdsForCost){
    	var billUnits = abEnergyBillCommonController.unitsConversionFactorSql;
    	var billUnitsForCost = abEnergyBillCommonController.unitsConversionFactorSqlForCost;
    	if(initial){
    		billUnits = billUnits.replace(/\{0\}/g, abEnergyBillCommonController.unitsConversionFactorSql_dflt);
    		billUnitsForCost = billUnitsForCost.replace(/\{0\}/g, abEnergyBillCommonController.unitsConversionFactorSql_dflt);
    	} else {
    		var selectNode = $('select_bill_units');
            if (selectNode.selectedIndex >= 0) {
                var userUnitsChoise = selectNode.options[selectNode.selectedIndex].value;
                abEnergyBillCommonController.userUnitsChoise = userUnitsChoise;
            }
    		
    		billUnits = billUnits.replace(/\{0\}/g, abEnergyBillCommonController.unitsConversionFactorSql_user);
    		billUnits = billUnits.replace(/\{0\}/g, userUnitsChoise);

    		billUnitsForCost = billUnitsForCost.replace(/\{0\}/g, abEnergyBillCommonController.unitsConversionFactorSql_user);
    		billUnitsForCost = billUnitsForCost.replace(/\{0\}/g, userUnitsChoise);
    	}
    	for ( var i = 0; i < viewPanelIds.length; i++) {
    		this.view.panels.get(viewPanelIds[i]).addParameter("unitsConversionFactor", billUnits);
		}
    	if(viewPanelIdsForCost){
        	for ( var i = 0; i < viewPanelIdsForCost.length; i++) {
        		this.view.panels.get(viewPanelIdsForCost[i]).addParameter("unitsConversionFactorForCost", billUnits);
    		}
    	}
    },

    setQtyEnergyTitle: function(panel){
		var title = "";
		var fields = null;
		
		switch (panel.type) {
		case "crossTable":
			title = getMessage("title_sum_qty_energy");
			fields = panel.calculatedFields;
			break;
			
		case "chart":
			title = getMessage("title_sum_qty_energy");
			fields = panel.dataAxis;
			break;

		default:
			// grid
			title = getMessage("title_qty_energy");
			fields = panel.columns;
			break;
		}
		
		title = title.replace("{0}", abEnergyBillCommonController.userUnitsChoise);
		
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];

			switch (panel.type) {
			case "crossTable":
				if(field.id == "bill_archive.sum_qty_energy" || field.id == "bill_archive.total_qty_energy"){
					field.title = title;
				}
				break;

			case "chart":
				if(field.id == "bill_archive.sum_qty_energy"
						|| field.id == "bill_archive.total_qty_energy"
						|| field.id == "energy_chart_point.sum_el_actual_consumption"
						|| field.id == "energy_chart_point.sum_gas_actual_consumption"){
					field.title = title;
				} else if(field.id == "bill_archive.total_cost_mmbtu"){
					var anotherTitle = getMessage("title_qty_energy_cost").replace("{0}", abEnergyBillCommonController.userUnitsChoise);
					field.title = anotherTitle;
				}
				break;

			default:
				// grid
				if(field.id == "bill_archive.qty_energy"){
					panel.setFieldLabel(field.id, title);
				} else if(field.id == "energy_chart_point.sum_el_actual_consumption"
						|| field.id == "energy_chart_point.sum_gas_actual_consumption"){
					var anotherTitle = getMessage("title_qty_energy_consum").replace("{0}", abEnergyBillCommonController.userUnitsChoise);
					panel.setFieldLabel(field.id, anotherTitle);
				}
				break;
			}
		}
	}
});