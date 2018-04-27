/**
 * @author kevenxi
 * 2009-11-06
 */
var confirmRmReservController = View.createController("confirmRmReservController",{
		
		/**
		 * This function is called when the page is loaded into the browser.
		 */
		afterViewLoad: function(){
			var tabs = this.createEditResevationTabs;
			
			//It is necessary to hide the tab pages roomReservationConfirm 
    		//and resourceReservationConfirm so that they are not active
			tabs.showTab('roomReservationConfirm', true);
			tabs.hideTab('roomReservation');
			tabs.hideTab('roomReservationConflicts');
			tabs.hideTab('resourceReservationConfirm');
		}
})
