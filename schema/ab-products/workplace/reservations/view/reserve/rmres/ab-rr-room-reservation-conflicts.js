var roomReservConflictsController = View.createController("roomReservConflictsController",{
		
		/**
		 * This function is called when the page is loaded into the browser.
		 */
		afterViewLoad: function(){
			var tabs = View.getControl('',"createEditResevationTabs");
			
			//It is necessary to hide the tab pages roomReservationConfirm, roomReservationConflicts
			//and resourceReservationConfirm so that they are not active
			tabs.hideTab('roomReservationConfirm');
			tabs.hideTab('resourceReservationConfirm');
			tabs.showTab('roomReservationConflicts', true);
		}
});
