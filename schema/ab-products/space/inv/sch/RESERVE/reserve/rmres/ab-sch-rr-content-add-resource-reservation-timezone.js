
/**
 * Action listener for timezone is selected.
 * 
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue
 */
function afterSelectTimezone(fieldName, selectedValue, previousValue){
	var globalParameters =  View.getOpenerView().controllers.get(0);
		
    // If timeline is loaded send to WFR the current timemarks, current site_id and new timezone selected
    if (valueExists(globalParameters.timelineData)) {
    	var currentTimelineIndex = addResourceReservContentController.currentTimelineIndex;
            
        //If already have a row in the timeline showing the selected timezone time
        if (addResourceReservContentController.existtimelinetz == true) {
            //Remove the row before adding it again and set to false the boolean indicating if selected timezones times are showed
			document.getElementById("grid_timeline-" + currentTimelineIndex).deleteRow(document.getElementById("grid_timeline-" + currentTimelineIndex).rows.length - 1);
            addResourceReservContentController.existtimelinetz = false;
	    }
        //If the selected tab has timeline
        if (valueExists(addResourceReservContentController.currentTimeLine)) {
        
            var timeline = addResourceReservContentController.currentTimeLine.getTimeline();
            var objectsToSave = [timeline.timemarks];
            var jsonExpression = toJSON(objectsToSave);

			var timeZoneId = selectedValue;
			var	siteId = View.panels.get('selectResourceConsolePanel').getFieldValue("bl.site_id");
			var strDateStart = globalParameters.reservation.date_start[0];
			var jsonTimemarks = jsonExpression

			try{
				var result = Workflow.callMethod("AbWorkplaceReservations-room-loadTimezonesTimeline", timeZoneId, siteId, strDateStart, jsonTimemarks);
				if (result.code == 'executed') {
					var timelinetzJSON = eval("(" + result.jsonExpression + ")");
					var newTimemarks = timelinetzJSON.timemarks;
					//Add an additional row to existing timeline, to show selected timezone times 
					var row = document.getElementById("grid_timeline-" + currentTimelineIndex).insertRow(-1);
					var th, cell, newAttr;
					
					//Create a text column that will spand to first 4 columns
					th = document.createElement('TH');
					newAttr = document.createAttribute("colspan");
					newAttr.nodeValue = "4";
					th.setAttributeNode(newAttr);
					th.innerHTML = getMessage("selectedTimezone");
					row.appendChild(th);
					
					//With the timemarks for the new selected timezone, fill the required cells that will spand to minorToMajorRatio columns
					for (var x = 0; x < newTimemarks.length; x++) {
						if ((x % timeline.minorToMajorRatio) == 0) {
							cell = document.createElement('TH');
							newAttr = document.createAttribute("colspan");
							newAttr.nodeValue = timeline.minorToMajorRatio;
							cell.setAttributeNode(newAttr);
							cell.innerHTML = newTimemarks[x].dateTimeLabel;
							row.appendChild(cell);
						}
					}
					//Set to true the boolean indicating that the selected timezones times are now showed				
					addResourceReservContentController.existtimelinetz = true;
					addResourceReservContentController.timemarkstz = newTimemarks;                
				}
			}catch(e){
				Workflow.handleError(e);
			}
            
        }
    }
}

