
var rmReservAdddetailsController = View.createController("rmReservAdddetailsController", {
    roomTimeline: null,
    globalParameters: null,
	
    /**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
    //    this.mainTabs = View.getControl('', 'createEditResevationTabs');
    //    this.onStart();
    },
	
	addReservDetailsPanel_afterRefresh: function() {
	    this.globalParameters = View.getOpenerView().controllers.get("addRoomReservContentController").globalParameters;
        this.onStart();
   	},
	
    /**
     *
     */
    onStart: function(){
        this.roomTimeline = View.getOpenerView().controllers.get("addRoomReservContentController").roomTimeline;
		
        //The field values take from the form father
        this.addReservDetailsPanel.setInputValue('reserve_rm.time_start', this.roomTimeline.eventToEdit.dateTimeStart);
        this.addReservDetailsPanel.setInputValue('reserve_rm.time_end', this.roomTimeline.eventToEdit.dateTimeEnd);
        this.addReservDetailsPanel.setFieldValue('reserve_rm.comments', this.globalParameters.roomReservation.comments);
    },
	
    /**
     * This function is called when the button Save is clicked.
     */
    addReservDetailsPanel_onSave: function(){
        var isModified = this.modifyReserveRoom();
        
        //If successful or reservation type = ?recurring?, the function will update the 
        //necessary user interface elements, then we must update the JSObjects with the 
        //selected information from the form
        if (isModified) {
            //Update the necessary user interface elements, update the JSObjects with the selected information
            this.globalParameters.roomReservation.time_start = this.addReservDetailsPanel.getFieldValue('reserve_rm.time_start');
            this.globalParameters.roomReservation.time_end = this.addReservDetailsPanel.getFieldValue('reserve_rm.time_end');
            this.globalParameters.reservation.time_start = this.globalParameters.roomReservation.time_start;
            this.globalParameters.reservation.time_end = this.globalParameters.roomReservation.time_end;
            this.globalParameters.roomReservation.comments = this.addReservDetailsPanel.getFieldValue('reserve_rm.comments');
            
            //Close the form
            View.closeThisDialog();
        }
    },
    /**
     * This function checks if the timeslots are empty according to the interval of hours introduced.
     */
    modifyReserveRoom: function(){
        var time_start = this.addReservDetailsPanel.getFieldValue('reserve_rm.time_start');
        var time_end = this.addReservDetailsPanel.getFieldValue('reserve_rm.time_end');
        if ((time_start != this.roomTimeline.eventToEdit.dateTimeStart) ||
        		(time_end != this.roomTimeline.eventToEdit.dateTimeEnd)) {
        
            //Get the reserve type
            var reserve_type = this.globalParameters.reservation.res_type;
            
            var minorSegments = this.roomTimeline.timelineController.model.minorToMajorRatio;
            var timelineStartTime = this.roomTimeline.timelineController.model.getTimemark(0).getDateTime();
            var MaxTimemarksColumn = this.roomTimeline.timelineController.model.getColumnNumber();
            
			// alert(timelineStartTime);
			
            if ((time_start != '') && (time_end != '')) {
                //timeslot column index for reservation start time
                var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, time_start, MaxTimemarksColumn);
                //timeslot column index for reservation end time
                var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, time_end, MaxTimemarksColumn) - 1;
                //Get as parameter the Event object selected
                var resource = this.roomTimeline.eventToEdit.resource;
                
                if (columnStart <= columnEnd) {
                    //if the column start considers the init preblock AND
                    //if the column end considers the end postblock, OR
                    //if the reserve type is recurring
                    if (((columnStart >= resource.columnAvailableFrom + resource.getPreBlockTimeslots()) &&
                    (columnEnd <= resource.columnAvailableTo - resource.getPostBlockTimeslots())) ||
                    (reserve_type == 'recurring')) {
                    
                        //If modifyEvent function returns Null and res_type = ?regular?, then the system can?t modify it because 
                        //it?s an unavailable period. In this case show the ?timeSelectedNotAvailable? error information as an alert
                        if (this.roomTimeline.timelineController.getTimeline().canModifyEvent(this.roomTimeline.eventToEdit, columnStart, columnEnd, (reserve_type == 'recurring'))) {
                            this.roomTimeline.timelineController.getTimeline().modifyEvent(this.roomTimeline.eventToEdit, columnStart, columnEnd);
                            this.roomTimeline.timelineController.refreshTimelineRow(this.roomTimeline.eventToEdit.getRow(), true);
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
                View.showMessage(getMessage("selectRoomAndTimeError"));
                return false;
            }
        }
    }
    
});
