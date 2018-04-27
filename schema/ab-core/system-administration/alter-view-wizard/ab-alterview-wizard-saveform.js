﻿/**
* Generated by Yong Shao (2008/06/25)
*/
var tabsFrame = View.getView('parent').getView('parent').panels.get('tabsFrame');
var avw_save_control = View.createController('avw_save_control', {  
	 afterViewLoad: function() {
	 	if(typeof tabsFrame== "undefined" || tabsFrame==null){
    		tabsFrame =  View.getView('parent').panels.get('tabsFrame');
    	}
        tabsFrame.addEventListener('beforeTabChange', this.beforeSaveTabChange.createDelegate(this));
        $("displayPreviewAction").value = getMessage('display_view');
        $("saveChangeAction").value = getMessage('overwrite_original_view');
        $("save2FavoriteAction").value = getMessage('save_view_to_my_favorites');
      },    
      
     afterInitialDataFetch: function(){         	
   		this.initializingSaveForm();
   		//XXX: update UI
   		this.saveCopyFileUI();
   		this.save2FavoriteFileUI(); 		
     },
     
     saveCopyFileUI:function(){    	
 		var isAlterable = tabsFrame.isAlterable;
 		if(!isAlterable){
 			$("saveCopyButton").style.display="none";
 			$("saveCopy").style.display="none";
 		}else{
 			$("saveCopyFile").innerHTML = saveCopyFile.innerHTML + " " +  tabsFrame.fileFullName;
 		}		
     },
     
     save2FavoriteFileUI:function(){
     	if(tabsFrame.openerView.taskRecord==null){
     		//XXX: no action for adding favorite since view not coming from PN
     		$("save2FavoriteButton").style.display="none";
 			$("save2Favorite").style.display="none";
     	}else{
	     	
			var fileName =  tabsFrame.fileFullName;
			
			var pos = fileName.indexOf(".axvw");
			if(pos > 0){
				fileName = fileName.substring(fileName.indexOf("/")+1, pos);			
			}
			
			var userName = View.user.name;			
			var myFavoriteFileFullName = "/schema/per-site/"+fileName + "-" + userName.toLowerCase() + ".axvw";
						
	 		var save2FavoriteFile = $("save2FavoriteFile");
	 		save2FavoriteFile.innerHTML = save2FavoriteFile.innerHTML + " " + myFavoriteFileFullName;
	 		tabsFrame.myFavoriteFileFullName = myFavoriteFileFullName;
 		}
     },
     
     beforeSaveTabChange:function(tabPanel, selectedTabName, newTabName){
    	if(newTabName=="page5"){
    		this.initializingSaveForm();
    	}    	
     },
     
     initializingSaveForm:function(){
     	//XXX: convertFilePerform() defined in ab-viewdef-preview-helper.js
     	convertFilePerform(tabsFrame.fileToConvert ); 	
     }
});

/**
* open preview dialog
*/
function displayPreview(){
 	var uniqueFileName = tabsFrame.uniqueFileName; 
 	var writeFileName =  uniqueFileName + ".axvw";
 	displayView(writeFileName); 
}     
/**
* overwrite and reload
*/
function saveChange(){
 	var fileFullName = '/' + tabsFrame.fileFullName; 	 	
 	var tempFile = tabsFrame.uniqueFileName + ".axvw";
 	tempFile = tempFile.replace(/\\/g,'/') ;
	tempFile = "/schema/per-site/" + tempFile;
	var dataSourceIds = [];
	tabsFrame.openerView.dataSources.eachKey(function (id) {
           dataSourceIds.push(id);
    });
	
	dataSourceIds = toJSON(dataSourceIds);
 	//overwrite original file
 	var parameters = {'type': 'overwrite', 'tempFile': tempFile, 'newFileName': fileFullName, 'dataSourceIds': dataSourceIds}; 			
    Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-moveAndRenameFile', parameters);	
    //reload opener view
    if(tabsFrame.openerView){
   		tabsFrame.openerView.reload();
   	}	   	
  	//XXX: close AVW
   	tabsFrame.openerView.closeDialog();
}
/**
* save to favorite list
*/
function save2Favorite(){
	var tempFile = tabsFrame.uniqueFileName + ".axvw";
 	tempFile = tempFile.replace(/\\/g,'/') ;
 	tempFile = "/schema/per-site/" + tempFile;
 	var openerView = View.getOpenerView();
 	var viewTitle = tabsFrame.newView.title;
 	var fileFullName = tabsFrame.fileFullName;
 	var fileName = tabsFrame.fileName;
	
	var myFavoriteFileFullName = tabsFrame.myFavoriteFileFullName;
	var parameters = {};
	var task = tabsFrame.openerView.taskRecord;
	if (task != null) {
		parameters.keyField = task.tableName + '.' + task.keyFieldName;
		parameters.keyValue = task.getKey();
		parameters.taskId = task.getValue('afm_ptasks.task_id');
		parameters.processId = task.getValue('afm_ptasks.process_id');
		parameters.activityId = task.getValue('afm_ptasks.activity_id');
	}
	parameters.type = "checkAndSave2Favorite";
	parameters.tempFile = tempFile;
	parameters.newFileName = myFavoriteFileFullName;
	parameters.userName=View.user.name;
	parameters.viewTitle = viewTitle;
	
    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-moveAndRenameFile', parameters);	
    if(result.message=="existed") {
    	View.confirm(getMessage('avw_save_confirm_message'), function(button){
			if(button == 'yes'){
                try {
					//overwrite 
					parameters.type = "save2Favorite";
					result = Ab.workflow.Workflow.runRuleAndReturnResult('AbSystemAdministration-moveAndRenameFile', parameters);	
					//XXX: close AVW
					if(result.message=="done"){
						tabsFrame.openerView.closeDialog();
					}			 			
                } catch (e) {
                
                }				
			}
		})
    }else if(result.message=="done"){
   	 	//XXX: close AVW
		tabsFrame.openerView.closeDialog();	
	}		
 }

