
var myReservController = View.createController("myReservController",{
		WeekDays: [{
	        "type": "sun",
	        "value": "0"
	    }, {
	        "type": "mon",
	        "value": "1"
	    }, {
	        "type": "tue",
	        "value": "2"
	    }, {
	        "type": "wed",
	        "value": "3"
	    }, {
	        "type": "thu",
	        "value": "4"
	    }, {
	        "type": "fri",
	        "value": "5"
	    }, {
	        "type": "sat",
	        "value": "6"
	    }],
	    
	    Months: [{
	        "type": "first",
	        "value": "1"
	    }, {
	        "type": "second",
	        "value": "2"
	    }, {
	        "type": "third",
	        "value": "3"
	    }, {
	        "type": "fourth",
	        "value": "4"
	    }, {
	        "type": "last",
	        "value": "5"
	    }],
		/**
		 * This function is called when the page is loaded into the browser.
		 */
		afterViewLoad: function(){
			var tabs = View.getControl('',"createEditResevationTabs");
			
			//It is necessary to hide the tab pages roomReservationConfirm 
    		//and resourceReservationConfirm so that they are not active
			tabs.hideTab('roomReservationConfirm');
			tabs.hideTab('roomReservationConflicts');
			tabs.hideTab('resourceReservationConfirm');
			tabs.hideTab('resourceReservationConflicts');
		}
})
