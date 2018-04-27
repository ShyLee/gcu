
/**
 * The RoomTime is used as a component for create room reservation,
 * and it is just called in the ab-rr-content-add-room-reservation-timeline.js
 *
 * @author Weijie.Li
 * @Date 2009-11-27
 */

Ab.namespace('application');

Ab.application.RoomTimeline = Base.extend({

    id: null,
    parameters: null,
	timezonePanel: null,
    timelinePanel: null,
    consolePanel: null,
    infoRestriction: null,
    newEvent: null,
    eventToEdit: null,
	existTimelineTimezone: false,
	timelineController: null,
    
    /**
     *
     * @param {Object} id of a given div in axvw file for holding timeline component.
     * @param {Object} reservationParameters the global variable for holding the parameter and values.
     * @param {Object} timelinePanelId the div's (param id) parent panel.
     * @param {Object} consolePanelId the console panel in the ab-rr-content-add-room-reservation.axvw.
     */
    constructor: function(id, reservationParameters, timelinePanelId, consolePanelId, timezonePanelId) {
        this.id = id;
        this.parameters = reservationParameters;
        this.timelinePanel = View.panels.get(timelinePanelId);
		this.timezonePanel = View.panels.get(timezonePanelId);
        this.consolePanel = View.panels.get(consolePanelId);
        
		this.initTimelinePanel();      
		this.createTimeline();
	},
    
    initTimelinePanel: function() {
        //While timeline is not showed, buttons Next and Cancel are disabled
        this.enablePanelActions(false);
		
        var btnPrevWeek = document.getElementById("preWeek");
        var btnPrevDay = document.getElementById("preDay");
        var btnNextDay = document.getElementById("nextDay");
        var btnNextWeek = document.getElementById("nextWeek");
        
        //Update the text content of the jump days/weeks buttons
        btnPrevDay.value = "< " + getMessage("prevDay");
        btnPrevWeek.value = "<< " + getMessage("prevWeek");
        btnNextDay.value = getMessage("nextDay") + " >";
        btnNextWeek.value = getMessage("nextWeek") + " >>";
        
        this.enablePreNextButtons(false);
    },
    
	/**
	 * 
	 * @param {Object} enabled
	 */
	enablePanelActions: function(enabled) {
		this.timelinePanel.actions.get('next').enable(enabled);
        this.timelinePanel.actions.get('cancel').enable(enabled);
	},
	
	clear: function() {
		// this.timeline.clear();
        this.timelineController.clearRowBlocks();
		
		//While timeline is not showed, Next and Cancel buttons are disabled
        this.enablePanelActions(false);
        this.enablePreNextButtons(false);
		
	},
	
    /**
     *
     * @param {Object} type_called
     */
    loadTimeLine: function(type_called) {
    
        if (valueExists(this.parameters.timelineData)) {
            this.timelineController.clearRowBlocks();
        }
        
        var reservation = this.parameters.reservation;
        var roomReservation = this.parameters.roomReservation;
        var objectsToSave = [this.parameters.user, reservation, roomReservation];
        var jsonExpression = toJSON(objectsToSave);
        
        var jsonReservation = jsonExpression;
		var availableforTimeframeOnly = type_called;
   		
		try{
			var results = Workflow.callMethod('AbWorkplaceReservations-room-loadTimeline', jsonReservation, availableforTimeframeOnly);
			this.afterLoadTimeline(results);
		}catch(e){
			Workflow.handleError(e);
		}
    },
    
    /**
     * Load WFR results
     * @param {Object} result
     */
    afterLoadTimeline: function(result) {
		if (result.code != 'executed') {
            View.showMessage(result.message);
            return;
        }
        
		if (result.message != "OK") {
		    View.showMessage(result.message);
		}
        
		var reservation = this.parameters.reservation;
        var roomReservation = this.parameters.roomReservation;
        var timelineJSON = eval("(" + result.jsonExpression + ")");
        
		this.timelineController.clearRowBlocks();
		this.timelineController.isEditable = true;
        
        // Load the JSON data into the timeline
        this.timelineController.loadTimelineModel(timelineJSON);
       
        // Drag & drop isn't allowed in the recurrent reserve
        if (reservation.res_type == 'recurring') {
            this.timelineController.isEditable = false;
        }
        
		if (valueExists(this.timelineController.timelineLayerDiv)) {
			this.timelineController.timelineLayerDiv.scrollLeft = 0;
		}
		
		this.timelineController.show();
		
	    // Store timeline data in a JS object
        this.parameters.timelineData = this.timelineController.getTimeline();
        
        this.enablePreNextButtons(true);
        
		//Make next button enabled for editing if room reservation exists. 
        if (!valueExists(roomReservation)) {
             this.enablePanelActions(false);
        }
    
	    // Finally disables the <, >, <<, >> buttons when it's not a regular reservation	
        if (reservation.res_type != "regular") {
            this.enablePreNextButtons(false);
        }
        
        // Select additional timezone should be enabled	
        this.timezonePanel.enableField('afm_timezones.timezone_id', true);
        
	    // enable/disable radio buttons
        this.handleRadioButtons();
        
	    // create the timeline event according the roomReservation.
        this.createTimelineEvents(roomReservation);
        
    },
    
    /**
     * enable/disable radio buttons in the timeline.
     */
    handleRadioButtons: function() {
		if (!valueExists(this.parameters.timelineData)) {
			return;
		}
		
		// Enable the radio buttons for the rooms
		var disableRadioButtons = true;
		var time_start = this.consolePanel.getFieldValue("reserve.time_start");
		var time_end = this.consolePanel.getFieldValue("reserve.time_end");
		
		if (time_start != '' && time_end != '') {
			disableRadioButtons = false;
		}
		
		// Disable the radio buttons for the rooms
		for (var i = 0; i < this.parameters.timelineData.resources.length; i++) {
			var radioButton = this.getTimelineCellContent(i, 0);
			radioButton.disabled = disableRadioButtons;
		}
	},
    
    /**
     * Create the realted events to timeline according to an existing room reservation.
     *
     * @param {Object} roomReservation
     */
    createTimelineEvents: function(roomReservation) {
    
        // BEGIN If editing a reservation, manually generate the event to edit
        if (!valueExists(roomReservation) || !valueExists(roomReservation.rmres_id)) {
            return;
        }
        
        var timeline = this.timelineController.getTimeline();
        
        var recordToSearch = "";
        recordToSearch += "<record";
        recordToSearch += " rm.bl_id='" + roomReservation.bl_id + "'";
        recordToSearch += " rm.fl_id='" + roomReservation.fl_id + "'";
        recordToSearch += " rm.rm_id='" + roomReservation.rm_id + "'";
        recordToSearch += " />";
        
        var arrangeToSearch = roomReservation.rm_arrange_type_id;
        var configToSearch = roomReservation.config_id;
        var indexResource = -1;
        var resource;
        
        //Search the row of the resource to generate the event
        for (var i = 0; i < timeline.resources.length; i++) {
            resource = timeline.getResource(i);
            
            if ((resource.getResourceId() == recordToSearch) &&
            (resource.roomArrangement == arrangeToSearch) &&
            (resource.roomConfiguration == configToSearch)) {
                indexResource = i;
                break;
            }
        }
        
        var timeStart = roomReservation.time_start;
        var timeEnd = roomReservation.time_end;
        
        if ((timeStart != '') && (timeEnd != '') && (indexResource != -1)) {
        
            var minorSegments = timeline.minorToMajorRatio;
            var timelineStartTime = timeline.getTimemark(0).getDateTime();
            var MaxTimemarksColumn = timeline.getColumnNumber();
            
            //timeslot column index for reservation start and end times
            var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeStart, MaxTimemarksColumn);
            var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeEnd, MaxTimemarksColumn);
            
            if ((columnStart >= resource.columnAvailableFrom + resource.getPreBlockTimeslots()) &&
            (columnEnd <= resource.columnAvailableTo - resource.getPostBlockTimeslots())) {
            
                var timelineColumnStart = columnStart - resource.getPreBlockTimeslots();
                var timelineColumnEnd = columnEnd + resource.getPostBlockTimeslots() - 1;
                
                var timeslotAvailable = timeline.allTimeslotsAvailable(resource.row, timelineColumnStart, timelineColumnEnd);
                
                if (timeslotAvailable) {
                    // Delete previous event if it was created
                    this.deleteLastUnactiveEvents();
                    
                    // Create new event
                    this.newEvent = new Ab.timeline.Event(null, resource.row, columnStart, columnEnd - 1, true, timeline);
                    timeline.addEvent(this.newEvent);
                    
                    var time_start = this.newEvent.timeline.getColumnDateTime(this.newEvent.getStart());
                    var time_end = this.newEvent.timeline.getColumnDateTime(this.newEvent.getEnd() + 1);
                    
                    this.newEvent.canEdit = true;
                    this.newEvent.canDelete = true;
                    this.newEvent.dateTimeStart = time_start;
                    this.newEvent.dateTimeEnd = time_end;
                    
                    // While below two properties are not used at current case. 
                    this.newEvent.rmres_id = roomReservation.rmres_id;
                    this.newEvent.rm_arrange_type_id = roomReservation.rm_arrange_type_id;
                }
            }
        }
    },
    
    /**
     * enable/disable the buttons in the timeline panel as list:
     * Previous Week, Previous Day, Next Day, Next Week.
     *
     * @param {Object} enabled
     */
    enablePreNextButtons: function(enabled) {
    
        var btnPrevWeek = document.getElementById("preWeek");
        var btnPrevDay = document.getElementById("preDay");
        var btnNextDay = document.getElementById("nextDay");
        var btnNextWeek = document.getElementById("nextWeek");
        
        btnPrevWeek.disabled = !enabled;
        btnPrevDay.disabled = !enabled;
        btnNextDay.disabled = !enabled;
        btnNextWeek.disabled = !enabled;
    },
    
    /**
     * Create the timeline control instance and display the timeline data if already loaded.
     */
    updateTimeline: function() {
    	if (!valueExists(this.timelineController)) {
			this.createTimeline();
		}
		
        if (valueExists(this.parameters.timelineData)) {
            // Hack,  the scrolling for the grid's parent div,
            // This bug in IE. 
            if (valueExists(this.timelineController.timelineLayerDiv)) {
				this.timelineController.timelineLayerDiv.scrollLeft = 0;
			}
            this.timelineController.refreshRowBlocks();
        }
    },
    
	/**
	 * 
	 */
	createTimeline: function() {
	    this.timelineController = new Ab.timeline.TimelineController(this.id, true);
		
		this.timelineController.addOnClickEvent(this.timeline_onClickEvent.createDelegate(this));
		this.timelineController.addOnCreateEvent(this.timeline_onTimelineDragNew.createDelegate(this));
		this.timelineController.addOnChangeEvent(this.timeline_onChangeEvent.createDelegate(this));
		
		//Add custom tooltip handler, to include room_id,etc.
		this.timelineController.addOnShowTimeslotTooltip(this.timeline_onShowTimeslotTooltip.createDelegate(this));
		this.timelineController.addOnShowEventTooltip(this.timeline_onShowEventTooltip.createDelegate(this));
		
		this.timelineController.addColumn('selectRoom', '', 'radiobutton', this.onSelectRoom.createDelegate(this));
		this.timelineController.addColumn('info', "", 'image', this.viewRoomDetails.createDelegate(this), getMessage('info'), 'ab-rr-info.gif');
		this.timelineController.addColumn('room', getMessage("roomHTML"), 'text');
		this.timelineController.addColumn('roomConfiguration', getMessage("configHTML"), 'text');
		this.timelineController.addColumn('criteria', getMessage("OrderCriteria"), 'text');
		this.timelineController.addColumn('approval', "", 'image', null, getMessage('approval'), 'ab-rr-approval.gif');
		this.timelineController.addColumn('isDefault', "", 'image', null, getMessage('isDefault'), 'ab-rr-isdefault.gif');
	},
	
    /**
     * Returns child element of specified timeline cell.
     *
     * @param {Object} row -- 0-based data row index (header rows are not included).
     * @param {Object} column -- 0-based column index.
     */
    getTimelineCellContent: function(row, column) {
        // 2D array of cell DOM elements, 1st index is row, 2nd index is column
        var dataCells = this.timelineController.grid.cells;
        var td = dataCells[row][column];
        
        return td.firstChild;
    },
    
    /**
     * This method is executed when the user clicks in some timeslot of timeline
     *
     * @param {Object} e
     * @param {Object} timeslot
     */
    onClickTimeslot: function(e, timeslot) {
       
        var event = this.timelineController.getEvent(timeslot.getRow(), timeslot.getColumn());
        if (event != null) {
            this.addReservationDetails(e, event);
        }
    },
    
    /**
     * This method is executed when the user paints a new event by Drag&Drop
     *
     * @param {Object} event
     */
    timeline_onTimelineDragNew: function(event) {
        this.deleteLastUnactiveEvents();
        
        //Disable the enabled radiobuttons
        for (i = 0; i < event.timeline.resources.length; i++) {
            event.resource.grid.cells[i][0].firstChild.checked = false;
        }
        
        //Select the radioButton of the selected room
        event.resource.grid.cells[event.resource.row][0].firstChild.checked = true;
        event.dateTimeStart = event.timeline.getColumnDateTime(event.getStart());
        event.dateTimeEnd = event.timeline.getColumnDateTime(event.getEnd() + 1);
        
        //When timeline is showed, some buttons are enabled
        if (this.parameters.timelineData.resources.length > 0) {
            this.enablePanelActions(true);
        } else {
            this.enablePanelActions(false);
        }
        return true;
    },
    
    /**
     * This method is executed when the user modify an event by Drag&Drop
     *
     * @param {Object} event
     * @param {Object} startColumn
     * @param {Object} endColumn
     */
    timeline_onChangeEvent: function(event, startColumn, endColumn) {
        event.dateTimeStart = event.timeline.getColumnDateTime(startColumn);
        event.dateTimeEnd = event.timeline.getColumnDateTime(endColumn + 1);
        //When editing an existed roomReseration, enable the bittons. Modified by ZY 2008-05-20.
        this.enablePanelActions(true);
        return true;
    },
    
    /**
     * called by the timeline to display custom tooltip for the timeslot
     *
     * @param {Object} timeslot
     */
    timeline_onShowTimeslotTooltip: function(timeslot) {
        if (timeslot && timeslot.resource) {
            var labeltz = '';
            //If already have a row in the timeline showing the selected timezone time, add to the tooltip the time in this timezone
            if (this.existTimelineTimezone == true) {
                labeltz = '<tr><td class="value">' + this.timezonePanel.getFieldValue('afm_timezones.timezone_id') + ': ' + this.timeMarksTimezone[timeslot.getColumn()].dateTimeLabel + '</td></tr>';
            }
            return {
                text: '<tr><td>' + timeslot.resource.room + '</td></tr>' + labeltz,
                override: false, // true to override default tooltip text, false to append
                cancel: false // true to cancel the tooltip display for this timeslot 
            }
        } else {
            return "";
        }
    },
    
    /**
     * Called by the timeline to display custom tooltip for the event.
     * Event parameter can be null or undefined if the tooltip is displyed for in-progress drag.
     *
     * @param {Object} event
     * @param {Object} eventStatus
     * @param {Object} timeslotStart
     * @param {Object} timeslotEnd
     */
    timeline_onShowEventTooltip: function(event, eventStatus, timeslotStart, timeslotEnd) {
        return {
            text: '<tr><td class="label">' + getMessage("roomHTML") + ':</td><td class="value">' + timeslotStart.resource.room + '</td></tr>' +
            '<tr><td class="label">' + getMessage("roomArrangementHTML") + ':</td><td class="value">' +
            timeslotStart.resource.roomArrangement +
            '</td></tr>',
            override: false, // true to override default tooltip text, false to append
            cancel: false // true to cancel the tooltip display for this event 
        }
    },
    
    /**
     * This method is executed when the user clicks on the info icon (room details)
     *
     * @param {Object} e
     */
    viewRoomDetails: function(e) {
        var room = e.room;
        var arrFields = new Array();
        arrFields = room.split(":");
        
        this.infoRestriction = {
            'rm_arrange.bl_id': arrFields[0],
            'rm_arrange.fl_id': arrFields[1],
            'rm_arrange.rm_id': arrFields[2],
            'rm_arrange.config_id': e.roomConfiguration,
            'rm_arrange.rm_arrange_type_id': e.roomArrangement
        };
        View.openDialog("ab-rr-rm-arrange-details.axvw");
    },
    
    /**
     * This method is executed when the user clicks in some timeslot of timeline
     *
     * @param {Object} e
     * @param {Object} event
     */
    timeline_onClickEvent: function(e, event) {
        //Get first timeslot of the event the user clicked on
        var timeslot = event.getStartTimeslot();
        //Get a list of all events that reserve this timeslot
        var allEvents = event.timeline.getAllEventsForTimeslot(timeslot);
        
        // Select the first (earliest) event in the list
        event = allEvents[0];
        
        if (event.isNew() && event.eventId == null) {
            this.addReservationDetails(e, event);
        } else {
            //Create a restriction and open the room reservation details dialog
            var restriction = {
                'reserve_rm.res_id': event.eventId
            };
            View.openDialog("ab-rr-reserve-rm-details.axvw", restriction);
        }
    },
    
    /**
     * This method is executed when the user clicks on a edited reserve, the user can modify the
     * commments, the start and end times
     *
     * @param {Object} e
     * @param {Object} event
     */
    addReservationDetails: function(e, event) {
        this.eventToEdit = event;
        View.openDialog("ab-rr-reserve-rm-adddetails.axvw");
    },
    
    /**
     * Called when the user clicks on the Select radio button of the timeline.
     *
     * @param {Object} e
     */
    onSelectRoom: function(e) {
        var roomReservation = this.parameters.roomReservation;
        var timeStart = this.consolePanel.getFieldValue("reserve.time_start");
        var timeEnd = this.consolePanel.getFieldValue("reserve.time_end");
        var res_type = this.consolePanel.getFieldValue("reserve.res_type");
        
        if ((timeStart == "") || (timeEnd == "")) {
            View.showMessage(getMessage("selectRoomAndTimeError"));
            return;
        }
        
        if (!ABRV_isMinnor(timeStart, timeEnd)) {
            View.showMessage(getMessage("selectTimeError"));
            return;
        }
        
        var timeline = this.timelineController.getTimeline();
        var minorSegments = timeline.minorToMajorRatio;
        var timelineStartTime = timeline.getTimemark(0).getDateTime();
        var MaxTimemarksColumn = timeline.getColumnNumber();
        
        // Timeslot column index for reservation start and end time, the time is second number
        var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeStart, MaxTimemarksColumn);
        var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeEnd, MaxTimemarksColumn);
        
        // get the available/correct column start and end time.	
        var availableColumnStart = e.columnAvailableFrom + e.getPreBlockTimeslots();
        var availableColumnEnd = e.columnAvailableTo - e.getPostBlockTimeslots();
        
        // if the column start or column end is not available, pop up warning.
        if (columnStart < availableColumnStart || columnEnd > availableColumnEnd) {
            View.showMessage(getMessage("timeSelectedNotAvailable"));
            return;
        }
        
        // In case the reservation type is regular check whether the requested time period is available 
        // for the room arrangement, time start and time end selected.
        // In case of a recurring reservation, overlapping events are allowed. Add a new Event to the 
        // Timeline, for the row got as parameter argument, and the time start and time end values of the console
        var eventTimeslotsAvailable = timeline.allTimeslotsAvailable(e.row, columnStart - e.getPreBlockTimeslots(), columnEnd + e.getPostBlockTimeslots() - 1, (res_type == "recurring"));
        if (!eventTimeslotsAvailable) {
            if (res_type == "regular") {
                View.showMessage(getMessage("timeSelectedNotAvailable"));
            }
            return;
        }
        
        //Delete previous event if it was created
        this.deleteLastUnactiveEvents();
        //Create new event
        this.newEvent = new Ab.timeline.Event(null, e.row, columnStart, columnEnd - 1, true, timeline);
        timeline.addEvent(this.newEvent);
        
        var time_start = this.newEvent.timeline.getColumnDateTime(this.newEvent.getStart());
        var time_end = this.newEvent.timeline.getColumnDateTime(this.newEvent.getEnd() + 1);
        
        this.newEvent.canEdit = true;
        this.newEvent.canDelete = true;
        this.newEvent.dateTimeStart = time_start;
        this.newEvent.dateTimeEnd = time_end;
        
        this.timelineController.refreshTimelineRow(this.newEvent.getRow());
        
        //When timeline is showed, some buttons are enabled
        if (this.parameters.timelineData.resources.length > 0) {
             this.enablePanelActions(true);
        } else {
             this.enablePanelActions(false);
        }
    },
    
    /**
     * Delete previous event if it was created
     */
    deleteLastUnactiveEvents: function() {
        var newEvents = this.timelineController.getPendingEvents();
        if (newEvents.length > 0) {
            this.timelineController.removeEvents(newEvents);
        }
    },
	
    afterSelectTimezone: function(selectedValue, siteId) {

   	 // If timeline is loaded send to WFR the current timemarks, current site_id and new timezone selected
    if (valueExists(this.parameters.timelineData)) {
    
        //If already have a row in the timeline showing the selected timezone time
        if (this.existTimelineTimezone == true) {
            //Remove the row before adding it again and set to false the boolean indicating if selected timezones times are showed
            document.getElementById("grid_timeline1").deleteRow(document.getElementById("grid_timeline1").rows.length - 1);
            this.existTimelineTimezone = false;
        }
        
        var objectsToSave = [this.timelineController.getTimemarks()];
        var jsonExpression = toJSON(objectsToSave);
        var timeline = this.timelineController.getTimeline();
		
        var timeZoneId = selectedValue;
        var strDateStart = this.parameters.reservation.date_start[0];
        var jsonTimemarks = jsonExpression;
      
		try{
			var result = Workflow.callMethod("AbWorkplaceReservations-room-loadTimezonesTimeline", timeZoneId, siteId, strDateStart, jsonTimemarks);
			if (result.code == 'executed') {
				var timelinetzJSON = eval("(" + result.jsonExpression + ")");
				var newTimemarks = timelinetzJSON.timemarks;
				
				// Add an additional row to existing timeline, to show selected timezone times 
				// the grid name is 'grid' + timeline Id.
				var row = document.getElementById("grid_timeline1").insertRow(-1);
				var th, cell, newAttr;
				
				//Create a text column that will spand to first 6 columns
				th = document.createElement('TH');
				newAttr = document.createAttribute("colspan");
				newAttr.nodeValue = "7";
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
				this.existTimelineTimezone = true;
				this.timeMarksTimezone = newTimemarks;
			}
		}catch(e){
			Workflow.handleError(e);
		}
    }

}

});
