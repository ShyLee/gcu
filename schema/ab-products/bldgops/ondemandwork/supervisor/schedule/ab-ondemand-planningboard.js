
var abOndemandPlaningboardController = View.createController('abOndemandPlaningboardController', {
	
	scheduleView: null,
	currentTreeNode: null,
	
    afterViewLoad: function(){
    	this.initializeScheduleViewPanel();
    	this.initializeTreePanel();
    	
    	var contextMenu = Ext.get('showMenu');
        contextMenu.on('click', this.showMenu, this, null);
    },
    
    initializeTreePanel: function(){
    	this.treeProbWrTask.createRestrictionForLevel = createRestrictionForLevel;
        
        this.treeProbWrTask.enableDragForLevel(0, false);
        this.treeProbWrTask.enableDragForLevel(1, false);
        this.treeProbWrTask.enableDragForLevel(2, true);
    },
    
    initializeScheduleViewPanel: function(){
    
   		this.scheduleView = new AFM.planboard.ScheduleView("scheduleView");		
	
		// create a layout 
		var config = {
			style: AFM.planboard.STYLES.EU_7_DAYS,
			selected: "week",		
			timelineClass: AFM.planboard.WeekTimeline,		
			resourceGroupPanelClass: AFM.planboard.CollapsiblePanel,
			resourceContainerClass: AFM.planboard.ResourceWeekContainer			
		}
		
		var layout = new AFM.planboard.WeekResourceLayout(this.scheduleView, config);
		// apply the layout to the view	
		this.scheduleView.setLayout(layout); 
		this.scheduleView.build(false); 	 // debug is true
    },
    
     showMenu: function(e, item){
  	
  	    var menuItems = [];
        var itemShowInfo = getMessage("contextmenuShowInfo");
        var itemHighlight = getMessage("contextmenuHighlightEntries");
        var itemClearHighlight = getMessage("contextmenuClearAllHighlights");
        
        menuItems.push({
            text: itemShowInfo,
            handler: this.onShowMenuPush.createDelegate(this, ['info'])
        });
        menuItems.push({
            text: itemHighlight,
            handler: this.onShowMenuPush.createDelegate(this, ['highlight'])
        });
        menuItems.push({
            text: itemClearHighlight,
            handler: this.onShowMenuPush.createDelegate(this, ['clear'])
        });
                
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
    },
    
    onShowMenuPush: function(menuItemId) {
    	
    	this.currentTreeNode = this.treeProbWrTask.lastNodeClicked;
    	
    	// just do something for workrequest node, i.e, its levelIndex is 1.
    	if (this.currentTreeNode == null 
    			|| this.currentTreeNode.level.levelIndex != 1) {
    		View.showMessage(getMessage("NoWorkRequestNodeSelected"));
    		return;
    	}
    	
    	var wrId = this.currentTreeNode.data['wr.wr_id'];
    	//var wrId = '1150000294';
	  	var restriction = new Ab.view.Restriction();
	  	//restrication.addClause("wr.wr_id", currentTreeNode.data['wr.wr_id'], "=");
	  	restriction.addClause("wr.wr_id", wrId, "=");
	  	 
      	switch (menuItemId) {
        	case "info":
            	View.openDialog("ab-ondemand-planningboard-wr-info.axvw",restriction);
                break;
            case "highlight":
                this.highlightEntries(wrId);
                break;
            case "clear":
                this.clearAllHighlights();
                break;
           default: 
           		break;
        }
    },
    
   highlightEntries: function(wrId) {			
		var entries = this.scheduleView.scheduleEntries;
		
		for (var i=0; i<entries.length; i++) {
			if (entries[i].getProperty("wrcf.wr_id") == wrId) {
				var el = entries[i].entryRenderer.element; 
				Dom.removeClass(el, "dimmed");
			} else {
				var el = entries[i].entryRenderer.element;
				Dom.addClass(el, "dimmed");
			}
		}
	},
	
	clearAllHighlights: function() {
		var entries = this.scheduleView.scheduleEntries;
		
		for (var i=0; i<entries.length; i++) {
			var el = entries[i].entryRenderer.element; 
			Dom.removeClass(el, "dimmed");
		}
	}
	
	/*,
	filterPanel_onFilter: function() {
		
	} 
	*/
});

function refreshScheduleView(){
	var filterPanel = View.panels.get("filterPanel");
	var siteId = filterPanel.getFieldValue("wr.site_id");
	
	if (siteId != null) {
		var fullYear = abOndemandPlaningboardController.scheduleView.startDate.getFullYear();
		abOndemandPlaningboardController.scheduleView.holidays = AFM.planboard.ScheduleController.loadHolidays(siteId, fullYear);
	  	abOndemandPlaningboardController.scheduleView.refresh(); 
  	}
}

/*
 * set the global variable 'currentTreeNode'
 */
function setCurrentTreeNode(){
	abOndemandPlaningboardController.currentTreeNode = View.panels.get("treeProbWrTask").lastNodeClicked;
}

function afterGeneratingTreeNode(treeNode){
    
    var labelText1 = "";
    
    if (treeNode.level.levelIndex == 0) {
        var prob_type = treeNode.data['wr.prob_type'];
       
        
        if (!prob_type) {
            labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + getMessage("noProbType") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    
    if (treeNode.level.levelIndex == 1) {
        var wrId = treeNode.data['wr.wr_id'];
        var probType = treeNode.data['wr.prob_type'];
        var description = treeNode.data['wr.description'];
		
		var labelText = "";       
        labelText = labelText + "<span id='wr" + wrId + "' class='" + treeNode.level.cssPkClassName + "'>" + wrId + "</span> ";
        labelText = labelText + "-" + "<span class='" + treeNode.level.cssClassName + "'>" + description + "</span> ";
        
       	treeNode.setUpLabel(labelText);
   		treeNode.getStyle = getNodeStyle;
   		renderDragDrop(treeNode);
    }
}

function getNodeStyle(){
	// XXX Replace the default getStyle to avoid the bug for displaying
	// the tasks.
	var loc = (this.nextSibling) ? "t" : "l";
	type = (this.expanded) ? "m" : "p";
	return "ygtv" + loc + type;
}
  
function renderDragDrop(treeNode){
	
	
	var wrId = treeNode.data['wr.wr_id'];
	 
	for (var i=0; i < abOndemandPlaningboardController.scheduleView.workRequests.length; i++) {
	      
	    var workRequest = abOndemandPlaningboardController.scheduleView.workRequests[i];	
	    var taskWrId = workRequest.getProperty("wr.wr_id");			 
		var site_id = workRequest.getProperty("wr.site_id");					
		var desc = workRequest.getProperty("wr.description");	
	 	
	 	if (wrId != taskWrId)
	 		continue;
	 	
		var leaf = new AFM.planboard.TaskNode(workRequest, null, treeNode);
		
		//XXX, since add the leaf manually, it will throw exception without
		// the level and level events. 
		leaf.level = [];
		leaf.level.events = [];
		
		for (var j=0; j<workRequest.tasks.length; j++) {				
			var leaf = new AFM.planboard.TaskNode(workRequest, workRequest.tasks[j], treeNode);
			//XXX, since add the leaf manually, it will throw exception without
			// the level and level events.
			leaf.level = [];
			leaf.level.events = [];
		}	
	}
}

function createRestrictionForLevel(parentNode, level){
	//fix KB3029907 - add console restriction for every level of the tree(Guo 2011/4/11)
    var restriction = View.panels.get('filterPanel').getFieldRestriction();
    if (parentNode.data) {
        var prob = parentNode.data['wr.prob_type'];
        if (!prob && level == 1) {
            restriction.addClause('wr.prob_type', '', 'IS NULL', 'AND', true);
        }
		
		if (prob && level == 1) {
            restriction.addClause('wr.prob_type', prob, '=', 'AND', true);
        }
        
        if (prob && level == 2){
        	var wrId = parentNode.data['wr.wr_id'];
            restriction = new Ab.view.Restriction();
            restriction.addClause('wrtr.wr_id', wrId, '=', 'AND', true);
        }
         
    }
    return restriction;
}

function onClose(panelId) {
	var panel = View.panels.get(panelId);
	panel.closeWindow();
}

function selectCf(){
	var panel = View.panels.get("editPanel");
	
	var wr_id = panel.getFieldValue("wrcf.wr_id");
	
	//KB3026671 2010-03-29
	/*var sql = "assign_work = 1 AND status = 'A' " +
			"AND (work_team_id is null OR work_team_id IN (SELECT work_team_id FROM wr WHERE wr_id = " + wr_id +
				" UNION SELECT work_team_id FROM cf WHERE email = " +
					"(SELECT email FROM em WHERE em_id = " +
						"(SELECT supervisor FROM wr WHERE wr_id = " + wr_id + "))) )";
						*/

	var restriction = createRestriction(wr_id);
	View.selectValue("editPanel",getMessage('cfCodeFieldTitle'),["wrcf.cf_id"],"cf",["cf.cf_id"],["cf.cf_id","cf.name","cf.tr_id","cf.work_team_id"],restriction,'', false, true, '', 700, 600, 'grid', 0, toJSON([{
        fieldName: 'cf.cf_id',
        sortOrder: 1
    }]));
}

function createRestriction(wr_id){
	 var restriction = new Ab.view.Restriction();
	 restriction.addClause("cf.assign_work",1,"=");
	 restriction.addClause("cf.status",'A',"=");
	 restriction.addClause("cf.date_contract_exp","","IS NULL",")AND(");
	 restriction.addClause("cf.date_contract_exp","${sql.currentDate}",">","OR");
	 restriction.addClause("cf.work_team_id","","IS NULL",")AND(");
	 
	 var restr = new Ab.view.Restriction();
	 restr.addClause("wr.wr_id",wr_id,"=");
	 var supervisor = getCode('wr','wr.supervisor',restr,false);
	 restr.clauses.length = 0;
	 restr.addClause("em.em_id",supervisor,"=");
	 var email = getCode('em','em.email',restr,false);
	 
	 restr.clauses.length = 0;
	 restr.addClause("cf.email",email,"=");
	 var workTeamIds = getCode('cf','cf.work_team_id',restr,true);
	 restr.clauses.length = 0;
	 restr.addClause("wr.wr_id",wr_id,"=");
	 workTeamIds.concat(getCode('wr','wr.work_team_id',restr,true));
	 
	 for (var i=0;i<workTeamIds.length;i++){
	 	var item = workTeamIds[i];
		restriction.addClause("cf.work_team_id",item,"=","OR");  
	 }
     return restriction;
}

function getCode(table,fieldName,restriction,isArray){
	var parameter0 = {
            tableName: table,
            fieldNames: toJSON([fieldName]),
            restriction: toJSON(restriction)
     }; 
	 
	 var results = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter0);
	 if (results.code == 'executed') {
          if (results.data.records.length > 0) {
			   if (isArray){
				   var returnCodes = [];
				   for (var i = 0; i < results.data.records.length; i++) {
                       returnCodes.push(results.data.records[i][fieldName]);
				   }
			   }else{
                   var returnCode=results.data.records[0][fieldName];
			   }
          }
     }
     else {
          View.showMessage(results.message);
     }
	 if (isArray){
		 return returnCodes;
	 }else{
	     return returnCode;
	 }
}
