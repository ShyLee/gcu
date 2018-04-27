/**
 * @author Guo Jiangtao
 */
var abHpdReqCreateController = View.createController("abHpdReqCreateController", {
	basicRestriction : null,
	
	afterInitialDataFetch : function() {
		top.window.location.parameters["fromIncident"] = false;

		/*
		 * EC - add callback method to perform additional work on created service request
		 * (e.g. attach redlined drawing to service request)
		 */
		if(valueExists(View.getOpenerView().dialogConfig)){
			var callbackMethod = View.getOpenerView().dialogConfig.callback;
			if(valueExists(callbackMethod) && typeof(callbackMethod) == "function"){
				top.window.location.parameters["callbackMethod"] = callbackMethod;
			}
			var redlining = View.getOpenerView().dialogConfig.redlining;
			if(valueExists(redlining) && redlining){
				top.window.location.parameters["redlining"] = true;
			} else {
				top.window.location.parameters["redlining"] = false;
			}
			
			// if called from from Incident, set the fromIncident parameter
			var fromIncident = View.getOpenerView().dialogConfig.fromIncident;
			if(valueExists(fromIncident) && fromIncident){
				top.window.location.parameters["fromIncident"] = true;
			}
		} else {	
			top.window.location.parameters["callbackMethod"] = null;
		}

		/*
		 * If request created from an Incident, pass the restriction to Basic tab
		 */
		if(top.window.location.parameters["fromIncident"] && this.helpDeskRequestTabs.restriction){
			var clause = this.helpDeskRequestTabs.restriction.findClause("activity_log.incident_id");
			if(valueExists(clause)){
				top.window.location.parameters["condAssessmentRestrication"] = this.helpDeskRequestTabs.restriction;
			}
		}

		// specified tabs according to the request type
		var groupMoveTabs = {
			'requestType' : 'SERVICE DESK - GROUP MOVE',
			'tabs' : ['catalog', 'basic', 'gpMoveRequestInfoTab','groupMoveDetailTab', 'groupMoveResult']
		};

		var individualMoveTabs = {
			'requestType' : 'SERVICE DESK - INDIVIDUAL MOVE',
			'tabs' : ['catalog', 'basic', 'indvMoveRequestInfoTab',   'groupMoveResult']
		};

		var departmentSpaceTabs = {
			'requestType' : 'SERVICE DESK - DEPARTMENT SPACE',
			'tabs' : ['catalog', 'basic', 'question', 'assignments', 'departmentSpaceResult']
		};

		// add the tab setting to dynamicAssemblyTabsController
		var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(groupMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(individualMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(departmentSpaceTabs);
		
		
	}
});