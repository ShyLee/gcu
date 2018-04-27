
var resourceReservAdddetailsController = View.createController("resourceReservAdddetailsController", {
	/**
	 * 
	 */
    opener: null,
	
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
        this.opener = View.getOpenerView().controllers.get("addResourceReservContentController");
		this.onStart();
    },

    /**
     *
     */
    onStart: function(){
        this.addResourceReservDetailsPanel.setFieldValue("reserve_rs.time_start", this.opener.eventToEdit.timeline.getColumnDateTime(this.opener.eventToEdit.columnStart));
        this.addResourceReservDetailsPanel.setFieldValue("reserve_rs.time_end", this.opener.eventToEdit.timeline.getColumnDateTime(this.opener.eventToEdit.columnEnd + 1));
        this.addResourceReservDetailsPanel.setFieldValue("reserve_rs.comments", this.opener.eventToEdit.comments);
        //Added for KB 3018920. By ZY 2008-07-31.
        this.addResourceReservDetailsPanel.actions.get("delete").enable(this.opener.eventToEdit.canDelete);
        this.addResourceReservDetailsPanel.actions.get("save").enable(this.opener.eventToEdit.canEdit);
        this.addResourceReservDetailsPanel.enableField("reserve_rs.time_start", this.opener.eventToEdit.canEdit);
        this.addResourceReservDetailsPanel.enableField("reserve_rs.time_end", this.opener.eventToEdit.canEdit);
        this.addResourceReservDetailsPanel.enableField("reserve_rs.comments", this.opener.eventToEdit.canEdit);
    },
    /**
     * This function is called when click the Save button
     */
    addResourceReservDetailsPanel_onSave: function(){
        if (this.modifyReserveResource()) {
            //Update the necessary user interface elements, update the JSObjects with the selected information
            this.opener.eventToEdit.comments = this.addResourceReservDetailsPanel.getFieldValue("reserve_rs.comments");
            
            //Close the form
            View.closeThisDialog();
        }
    },
    /**
     * This function is called when click the Delete button
     */
    addResourceReservDetailsPanel_onDelete: function(){
        this.opener.arrTimeline[this.getIdarrTimeline()].model.removeEvent(this.opener.eventToEdit);
        this.opener.arrTimeline[this.getIdarrTimeline()].removeEvent(this.opener.eventToEdit);
        this.opener.existResources();
       
	   
	   	//set the deleted event status to Cancelled and add to array opener.cancelledTimelineEvents
		//added by Guo 2008-06-19
		//KB 3019158, Changed opener.cancelledTimelineEvents to opener.tabs.cancelledTimelineEvents,by Guo 2008-08-19.
		if (valueExists(this.opener.eventToEdit.eventId) && this.opener.eventToEdit.eventId !== "") {
			this.opener.eventToEdit.resource.status = "Cancelled";
			if (!valueExists(this.opener.cancelledTimelineEvents)) {
				var cancelledTimelineEvents = new Array();
			} else {
				var cancelledTimelineEvents = eval("(" + this.opener.cancelledTimelineEvents + ")");
			}
			var cancelledTimelineEvent = new Object();
			cancelledTimelineEvent.resource_id = this.opener.eventToEdit.resource.resourceId;
			cancelledTimelineEvent.endtime = this.opener.eventToEdit.timeline.getColumnDateTime(this.opener.eventToEdit.columnEnd + 1);
			cancelledTimelineEvent.starttime = this.opener.eventToEdit.timeline.getColumnDateTime(this.opener.eventToEdit.columnStart);
			cancelledTimelineEvent.quantity = this.opener.eventToEdit.resource.quantity;
			cancelledTimelineEvent.comments = this.opener.eventToEdit.comments;
			cancelledTimelineEvent.eventId = this.opener.eventToEdit.eventId;
			cancelledTimelineEvent.status = this.opener.eventToEdit.resource.status;
			cancelledTimelineEvents.push(cancelledTimelineEvent);
			this.opener.cancelledTimelineEvents = toJSON(cancelledTimelineEvents);
		}
		
		//Guo added 2008-07-25 for setting the checkbox if the no new event in the timeline row.
		var row = this.opener.eventToEdit.getRow();
		var tempevents = this.opener.arrTimeline[this.getIdarrTimeline()].model.getRowEvents(row);
		var events = [];
		for (var i = 0; i < tempevents.length; i++) {
			if (tempevents[i].isNew()) {
				events.push(tempevents[i]);
			}
		}
		if (events.length == 0) {
			var checkBox = this.getTimelineCellContent(this.opener.currentTimeLine, row, 0);
			if (checkBox.checked) {
				checkBox.checked = false;
			}
		}
				 
        
        View.closeThisDialog();
    },
	/**
	 * 
	 */
    modifyReserveResource: function(){
        if ((getInputValue('reserve_rs.time_start') != this.opener.eventToEdit.dateTimeStart) ||
        (getInputValue('reserve_rs.time_end') != this.opener.eventToEdit.dateTimeEnd)) {
        
            var time_start = this.addResourceReservDetailsPanel.getFieldValue('reserve_rs.time_start');
            var time_end = this.addResourceReservDetailsPanel.getFieldValue('reserve_rs.time_end');
            if (!this.checkTimeScope(time_start, time_end)) {
                View.showMessage(getMessage("errorOutOfRoomTimeScope"));
                return false;
            }
            var minorSegments = this.opener.eventToEdit.timeline.minorToMajorRatio;
            var timelineStartTime = this.opener.eventToEdit.timeline.getTimemark(0).getDateTime();
            var MaxTimemarksColumn = this.opener.eventToEdit.timeline.getColumnNumber();
            
            if ((time_start != '') && (time_end != '')) {
                //timeslot column index for reservation start and end times
                var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, time_start, MaxTimemarksColumn);
                var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, time_end, MaxTimemarksColumn) - 1;
                var resource = this.opener.eventToEdit.resource;
                
                if (columnStart <= columnEnd) {
                    //check the column start considers the init preblock and
                    //check the column end considers the end postblock
                    if ((columnStart >= resource.columnAvailableFrom + resource.getPreBlockTimeslots()) &&
                    (columnEnd <= resource.columnAvailableTo - resource.getPostBlockTimeslots())) {
                        if (this.opener.eventToEdit.timeline.canModifyEvent(this.opener.eventToEdit, columnStart, columnEnd)) {
                            this.opener.eventToEdit.timeline.modifyEvent(this.opener.eventToEdit, columnStart, columnEnd);
                            this.opener.arrTimeline[this.getIdarrTimeline()].refreshTimelineRow(this.opener.eventToEdit.getRow(), true);
                            return true;
                        }
                        else {
                            View.showMessage(getMessage("timeSelectedNotAvailable"));
                            return false;
                        }
                    }
                    else {
                        View.showMessage(getMessage("timeSelectedNotAvailable"));
                        return false;
                    }
                }
                else {
                    View.showMessage(getMessage("selectTimeError"));
                    return false;
                }
            }
            else {
                View.showMessage(getMessage("selectResourceAndTimeError"));
                return false;
            }
        }
    },
	/**
	 * 
	 */
    getIdarrTimeline: function(){
        var idarrTimelineName = this.opener.eventToEdit.timeline.id;
        
        for (i = 0; i < this.opener.timeName.length; i++) {
            if (this.opener.timeName[i] == idarrTimelineName) 
                return i;
        }
        
        return false;
    },
    /**
     * 
     * @param {Object} time_start
     * @param {Object} time_end
     */
    checkTimeScope: function(time_start, time_end){
        if (this.opener.mainTabs.roomReservation && this.opener.mainTabs.roomReservation.rmres_id) {
            var roomRreservation = this.opener.mainTabs.roomReservation;
            //Modified for kb#3019118 by ZY, 2008-08-12
            if (ABRV_isMinnor(ABRV_convert24H(time_start), ABRV_convert24H(roomRreservation.time_start)) || ABRV_isMinnor(ABRV_convert24H(roomRreservation.time_end), ABRV_convert24H(time_end))) 
                return false;
        }
        return true;
    },
    
	/**
	 * Returns child element of specified timeline cell.
	 * @param {Object} timeline -- Timeline .
	 * @param {Object} row -- 0-based data row index (header rows are not included).
	 * @param {Object} column -- 0-based column index.
	 * Guo added 2008-07-25 for setting the checkbox if the no new event in the timeline row.
	 */
    getTimelineCellContent: function(timeline, row, column){
     	var dataCells = timeline.grid.cells;
        var td = dataCells[row][column];
     
        return td.firstChild;
    }
});





