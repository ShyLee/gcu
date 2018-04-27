/**

* @author lei

*/
var assignController = View.createController('assignController',
{	mainTabs:'',
	
	//mainController:'',
	enableTabsArr: new Array(['events',true],['docs',true],['commLogs',true]),
	currentClicked:0,

	fieldArr:['compliance_locations.em_id','compliance_locations.eq_id','compliance_locations.eq_std',
	          'compliance_locations.rm_id','compliance_locations.fl_id','compliance_locations.bl_id',
	          'compliance_locations.pr_id','compliance_locations.site_id','compliance_locations.county_id','compliance_locations.city_id',
	          'compliance_locations.state_id','compliance_locations.regn_id','compliance_locations.ctry_id','compliance_locations.geo_region_id'],

	mainController:null,
	
	//use for filter button of panel
	currentCompliance:'',
	
	//store current location view assigned location location_id
	assignLocationArray:new Array(),

    /**
     * KB 3038574: because the view JS code guarantees that only one of the three grid panels is
     * displayed at one time, force the first two panels to believe that they own the layout region
     * and therefore can display their own scroll bars.
     */
    afterViewLoad: function() {
        this.requirementGrid.ownsLayoutRegion =
        this.programGrid.ownsLayoutRegion =
        this.regulationGrid.ownsLayoutRegion = function() {
            return true;
        };
    },
	
	afterInitialDataFetch: function(){
		//this.mainController=View.getOpenerView().controllers.get('manageLocationMainController');
    	//this.mainController.manageLocationController=manageLocationController;

		if (View.parentTab==null) {
			this.afterInitialDataFetch.defer(1000, this);
			return;
		}

		this.mainController=View.getOpenerView().controllers.get(0);
		//hideEmptyColumnsByPrefix(this.regLocGrid,'compliance_locations');
		this.showPanel(0);		
		this.mainTabs = View.parentTab.parentPanel;
		View.parentTab.parentPanel.assignController=assignController;
		View.getOpenerView().controllers.get(0).assignController=assignController;
		this.complianceLocForm.isNewRecord=true;
		this.complianceLocForm.show(true);		
  },
    
    
    requirementGrid_onAssignLocation:function(){
    	
    	  this.assignLocation(3);
    },
    
    programGrid_onAssignLocation:function(){
    	//call workflow createComplianceLocations 	
    	this.assignLocation(2);
    },
    
    regulationGrid_onAssignLocation:function(){
    	//call workflow createComplianceLocations 
    	this.assignLocation(1);
    },
    
    /**
     * Create new compliance location record.
     */
    assignLocation:function(index){	
    	//call workflow createComplianceLocations 
    	assignController.mainController.setOthersTabRefreshObj(['assignLocation'], 1);
    	
    	var regulationGridArr=[];
    	var programGridArr=[];
    	var requirementGridArr=[];
    	
    	if(index==1){
    		regulationGridArr =this.regulationGrid.getSelectedRecords();
    	}else if(index==2){
    		programGridArr =this.programGrid.getSelectedRecords();
    	}else if(index==3){
    		requirementGridArr =this.requirementGrid.getSelectedRecords();
    	}
    	
    	var isNotNull=validateLocField(this.complianceLocForm,this.fieldArr);
    	if(!isNotNull){return;}
    	var locObj=getFieldValueObjects(this.complianceLocForm,this.fieldArr);
    	var isHasValue = false;	
    	for (var prop in locObj){
    		isHasValue = true;
    		break;
		}
    	if(regulationGridArr.length==0&&programGridArr.length==0&&requirementGridArr.length==0){
    		
    		if(index==1){
    			View.alert(getMessage('selectCompReg'));
        	}else if(index==2){
        		View.alert(getMessage('selectCompPro'));
        	}else if(index==3){
        		View.alert(getMessage('selectCompreq'));
        	}
    		return;
    	}
    	
    	if(!isHasValue){
    		View.alert(getMessage('selectComploc'));
    		return;
    	}
    	
    	validateDataExists(this.fieldArr,locObj);
    	
    	try{
			var result=Workflow.callMethod('AbRiskCompliance-ComplianceCommon-createComplianceLocations',regulationGridArr,programGridArr,
					requirementGridArr, locObj);
			var jsonResult = eval("(" + result.jsonExpression + ")");
			
			if(jsonResult.records[0]){
				for(var i=0;i<jsonResult.records.length;i++){
					this.assignLocationArray.push(parseInt(jsonResult.records[i]['regloc.location_id'].l));
				}
				View.alert(getMessage('assignSuccess'));				
			}else{
				View.alert(getMessage('assignDuplicate'));
				return;
			}
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause('regloc.location_id', this.assignLocationArray ,'in');
			
			this.regLocGrid.refresh(restriction);
		}catch(e){
			Workflow.handleError(e); 
		}
    	
    },
    
    /**
     * update we select records
     */
    regLocGrid_onUpdateSelection:function(){
		var operGird=View.panels.get('regLocGrid');
			
			var keys = operGird.getPrimaryKeysForSelectedRows();
			
		if(keys.length==0){
				View.alert(getMessage('selectLocation'));
				return;
			}
	    this.regLocPopupForm.show(true);
	    this.regLocPopupForm.refresh('1=2');
	    this.regLocPopupForm.showInWindow({
	        width: 750,
	        height: 380,
	        closeButton: true
	    });
    },
    
    /**
     * Update we select compliance location which in opener view  with we filled value .
     */
    regLocPopupForm_onUpdate:function(){
    	assignController.mainController.setOthersTabRefreshObj(['assignLocation'], 1);
    	var operGird=View.panels.get('regLocGrid');
		
		var keys = operGird.getPrimaryKeysForSelectedRows();
    	
	
		var resp_person=this.regLocPopupForm.getFieldValue('regloc.resp_person');
		var vn_id=this.regLocPopupForm.getFieldValue('regloc.vn_id');
		var comp_level=this.regLocPopupForm.getFieldValue('regloc.comp_level');
		var event_offset=this.regLocPopupForm.getFieldValue('regloc.event_offset');
		
		var arr=new Array();
		for(var j=0;j<keys.length;j++){
			arr.push(keys[j]['regloc.location_id']);
		}
		var restriction = new Ab.view.Restriction();
			restriction.addClause('regloc.location_id' ,arr,'in');
		var records=this.dsRegLocPopup.getRecords(restriction);
		for(var i=0;i<records.length;i++){
			var record=records[i];
			record.isNew=false;
			record.setValue("regloc.resp_person", resp_person);
			record.setValue("regloc.vn_id", vn_id);
			record.setValue("regloc.comp_level", comp_level);
			record.setValue("regloc.event_offset", event_offset);
		}
		View.dataSources.get("dsRegLocPopup").saveRecords(records);
		
		this.regLocGrid.refresh();
		this.regLocPopupForm.closeWindow();
		View.alert(getMessage('updatesuccess'));
    },
    
    regLocGrid_onUnassignSelection:function(){
    	assignController.mainController.setOthersTabRefreshObj(['assignLocation'], 1);
    	var operGird=View.panels.get('regLocGrid');
		
		var keys = operGird.getPrimaryKeysForSelectedRows();
		
		var arr=new Array();
		
		View.dataSources.get("dsRegLocPopup")
		
		for(var j=0;j<keys.length;j++){
			arr.push(keys[j]['regloc.location_id']);
			
		}
		var restriction = new Ab.view.Restriction();
			restriction.addClause('regloc.location_id' ,arr,'in');
		var records=this.dsRegLocPopup.getRecords(restriction);
		// delete getted record.
		for(var i=0;i<records.length;i++){
			var record=records[i];
			try{
				View.dataSources.get("dsRegLocPopup").deleteRecord(record);
			}catch(e){
				Workflow.handleError(e);
			}
			
		}
		
		for(var j=0;j<keys.length;j++){
			try{
				
				var result =  Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteLocation',parseInt(keys[j]['regloc.location_id']),0);
			    
			 View.alert('unassignSuccess');
			
			}catch(e){
				Workflow.handleError(e);
			}
		}
		this.regLocGrid.refresh();
		
    },
    
    showPanel:function(index){
    	//for refresh assign west when tab changed back current panel.
    	View.getOpenerView().controllers.get(0).currentClicked=index;
    	this.currentClicked=index;
    	var gridArr=new Array(assignController.requirementGrid,assignController.programGrid,assignController.regulationGrid);
    	
    	for(var i=0;i<gridArr.length;i++){
    		gridArr[i].show(false);
    		if(index==i){
    			gridArr[i].show(true);
    			if (gridArr[i].rows.length==0) {
    				gridArr[i].refresh();
    		  }
    		}
    		
    	}
    	
    },
	 
	/**
	 * Filter grid list function.
	 */
    requirementGrid_onFilterButton:function(){
    	assignController.currentCompliance = 'requirementGrid';
		Ab.view.View.openDialog('ab-comp-location-tab-assign-console.axvw',null , false, 0, 0, 1000, 400);  
	},
	
	/**
	 * Filter grid list function.
	 */
	programGrid_onFilterButton:function(){
    	assignController.currentCompliance = 'programGrid';
		Ab.view.View.openDialog('ab-comp-location-tab-assign-console.axvw',null , false, 0, 0, 1000, 400);  
	},
	
	/**
	 * Filter grid list function.
	 */
	regulationGrid_onFilterButton:function(){
    	assignController.currentCompliance = 'regulationGrid';
		Ab.view.View.openDialog('ab-comp-location-tab-assign-console.axvw',null , false, 0, 0, 1000, 400);  
	},
	
	

	stringToSqlArray: function(array){
	    
	    var resultedString = "('" + array[0] + "'";
	    
	    for (i = 1; i < array.length; i++) {
	        resultedString += " ,'" + array[i] + "'";
	    }
	    
	    resultedString += ")"
	    
	    return resultedString;
	},
	
	/**
	 * Print paginate report
	 */
	onPaginatedReport: function(commandObject, pagRepName){
		
		var paramteters="";
		if(this.assignLocationArray){
			
			parameters = {
					'consoleRestriction': " regloc.location_id IN " +this.stringToSqlArray(this.assignLocationArray)
			    };
		}else{
			parameters = {
					 'consoleRestriction': ' 1=1 '
			        
			    };
		}
		
		View.openPaginatedReportDialog(pagRepName, null, parameters);
	}

});

function getFieldValueObjects(console,fieldsArr){
	
	    var obj={};
	    for (var i = 0; i < fieldsArr.length;i++ ) {
	        var field = fieldsArr[i];
	        var mainKeyValue=console.getFieldValue(field);
	        if(mainKeyValue==''){
	        	continue;
	        }
	        if(field=='compliance_locations.rm_id'){
	        	var foreignFieldValue1=console.getFieldValue('compliance_locations.bl_id');
	        	var foreignFieldValue2=console.getFieldValue('compliance_locations.fl_id');
	        	obj[field]=stringToSqlArray2(0,field,mainKeyValue,'compliance_locations.bl_id',foreignFieldValue1,'compliance_locations.fl_id',foreignFieldValue2);
	        }else if(field=='compliance_locations.fl_id'){
	        	var foreignFieldValue1=console.getFieldValue('compliance_locations.bl_id');
	        	var foreignFieldValue3=console.getFieldValue('compliance_locations.rm_id');
	        	//decide if there is rm_id ,if there is rm_id we drop first fl_id value,or we keep first fl_id value.
	        	if(foreignFieldValue3!=''){
	        		obj[field]=stringToSqlArray2(1,field,mainKeyValue,'compliance_locations.bl_id',foreignFieldValue1,'','');
	        	}else{
	        		obj[field]=stringToSqlArray2(0,field,mainKeyValue,'compliance_locations.bl_id',foreignFieldValue1,'','');
	        	}
	        	
	        }else
	        if(field=='compliance_locations.bl_id'){
	        	var foreignFieldValue2=console.getFieldValue('compliance_locations.fl_id');
	        	//decide if there is rm_id ,if there is rm_id we drop first fl_id value,or we keep first fl_id value.
	        	if(foreignFieldValue2!=''){
	        		obj[field]=stringToSqlArray2(1,field,mainKeyValue,'','','','');
	        	}else{
	        		obj[field]=stringToSqlArray2(0,field,mainKeyValue,'','','','');
	        	}
	        }else if(field=='compliance_locations.city_id'){
	        	var foreignFieldValue1=console.getFieldValue('compliance_locations.state_id');
	        	obj[field]=stringToSqlArray2(0,field,mainKeyValue,'compliance_locations.state_id',foreignFieldValue1,'','');
	        }
	        else if(field=='compliance_locations.county_id'){
	        	var foreignFieldValue1=console.getFieldValue('compliance_locations.state_id');
	        	obj[field]=stringToSqlArray2(0,field,mainKeyValue,'compliance_locations.state_id',foreignFieldValue1,'','');
	        }else if(field=='compliance_locations.state_id'){
	        	var foreignFieldValue1=console.getFieldValue('compliance_locations.city_id');
	        	var foreignFieldValue2=console.getFieldValue('compliance_locations.county_id');
	        	//decide if there is rm_id ,if there is rm_id we drop first fl_id value,or we keep first fl_id value.
	        	if(foreignFieldValue1!=''||foreignFieldValue2!=''){
	        		obj[field]=stringToSqlArray2(1,field,mainKeyValue,'','','','');
	        	}else{
	        		obj[field]=stringToSqlArray2(0,field,mainKeyValue,'','','','');
	        	}
	        }else if(field=='compliance_locations.regn_id'){
	        	var foreignFieldValue1=console.getFieldValue('compliance_locations.ctry_id');
	        	obj[field]=stringToSqlArray2(0,field,mainKeyValue,'compliance_locations.ctry_id',foreignFieldValue1,'','');
	        }else if(field=='compliance_locations.ctry_id'){
	        	var foreignFieldValue1=console.getFieldValue('compliance_locations.regn_id');
	        	//decide if there is rm_id ,if there is rm_id we drop first fl_id value,or we keep first fl_id value.
	        	if(foreignFieldValue1!=''){
	        		obj[field]=stringToSqlArray2(1,field,mainKeyValue,'','','','');
	        	}else{
	        		obj[field]=stringToSqlArray2(0,field,mainKeyValue,'','','','');
	        	}
	        }else{
	        	obj[field]=stringToSqlArray2(0,field,mainKeyValue,'','','','');
	        }
	        break;
	    }
	    
	 return obj;
}


function stringToSqlArray2(index,field,mainKeyValue,foreignFieldKey1,foreignFieldValue1,foreignFieldKey2,foreignFieldValue2){
    var values = mainKeyValue.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var foreignFieldValue1 = foreignFieldValue1.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR)[0];
    var foreignFieldValue2 = foreignFieldValue2.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR)[0];
    
    var arr=[];
    // if index =0 then field in the bellow level in the union key
    //if  index =1 then field has bellow level value so, we drop first value
    for (i = index; i < values.length; i++) {
    	var obj={};
    	if(values[i]==null){
    		obj[field]='';
    	}else{
    		obj[field]=values[i];
    	}
    	if(foreignFieldKey1!=''){
	    	obj[foreignFieldKey1]=foreignFieldValue1;
    	}
    	if(foreignFieldKey2!=''){
	    	obj[foreignFieldKey2]=foreignFieldValue2;
    	}
    	
    	arr.push(obj);
    }
    return arr;
}

function validateLocField(console,fieldArr){
	var obj={};
	var isNotNull=true;
	var geo_region_id=console.getFieldValue('compliance_locations.geo_region_id');
    var ctry_id=console.getFieldValue('compliance_locations.ctry_id');
    var regn_id=console.getFieldValue('compliance_locations.regn_id');
    var state_id=console.getFieldValue('compliance_locations.state_id');
    var city_id=console.getFieldValue('compliance_locations.city_id');
    var county_id=console.getFieldValue('compliance_locations.county_id');
    var site_id=console.getFieldValue('compliance_locations.site_id');
    var pr_id=console.getFieldValue('compliance_locations.pr_id');
    var bl_id=console.getFieldValue('compliance_locations.bl_id');
    var fl_id=console.getFieldValue('compliance_locations.fl_id');
    var rm_id=console.getFieldValue('compliance_locations.rm_id');
    var eq_std=console.getFieldValue('compliance_locations.eq_std');
    var eq_id=console.getFieldValue('compliance_locations.eq_id');
    var em_id=console.getFieldValue('compliance_locations.em_id');
  
    for (var i = 0; i < fieldArr.length;i++ ) {
        var field = fieldArr[i];
        var mainKeyValue=console.getFieldValue(field);
        if(mainKeyValue==''){
        	continue;
        }
        
        if(field=='compliance_locations.rm_id'){
        	if(bl_id==''){
        		View.alert('Building Code can not be null.');
        		isNotNull=false;
        	}
        	if(fl_id==''){
        		View.alert('Floor Code can not be null.');
        		isNotNull=false;
        	}
        	
        }
        
        if(field=='compliance_locations.fl_id'){
        	if(bl_id==''){
        		View.alert('Building Code can not be null.');
        		isNotNull=false;
        	}
        }
        
        if(field=='compliance_locations.city_id'){
        	if(state_id==''){
        		View.alert('State_id is not null');
        		isNotNull=false;
        	}
        }
        
        if(field=='compliance_locations.county_id'){
        	if(state_id==''){
        		View.alert('State_id is not null');
        		isNotNull=false;
        	}
        }
      
        if(field=='compliance_locations.regn_id'){
        	if(ctry_id==''){
        		View.alert('ctry_id is not null');
        		isNotNull=false;
        	}
        }
    }
    return isNotNull;
}

function validateDataExists(fieldArr,locObj){
	        
	  var c = assignController;
	 for(var field in locObj){
		 fieldObjArr=locObj[field];
		 
	 	for(var j=0;j<fieldObjArr.length;j++){
			 var recordObj=fieldObjArr[j];
			 
			 var restriction=new Ab.view.Restriction();
			 if(field=='compliance_locations.geo_region_id'){
				
				 var value1=recordObj['compliance_locations.geo_region_id'];
				 restriction.addClause('geo_region.geo_region_id', value1, '=');
				 
				 var record=c.dsGeo_region.getRecord(restriction);
				 if(record.isNew){
					 View.alert('compliance_locations.geo_region_id do not exist in table.');
				 }
				 
			 }else if(field=='compliance_locations.ctry_id'){
				 var value1=recordObj['compliance_locations.ctry_id'];
				 restriction.addClause('ctry.ctry_id', value1, '=');
				 
				 var record=c.dsCtry.getRecord(restriction);
				 if(record.isNew){
					 View.alert('ctry_id do not exist in table.');
				 }
				
			 }else
			 if(field=='compliance_locations.regn_id'){
				 var value1=recordObj['compliance_locations.regn_id'];
				 var value2=recordObj['compliance_locations.ctry_id'];
				 restriction.addClause('regn.regn_id', value1, '=');
				 restriction.addClause('regn.ctry_id', value2, '=');
				
				 var record=c.dsRegn.getRecord(restriction);
				 if(record.isNew){
					 View.alert('regn_id do not exist in table.');
					 
				 }
			
			 }else
			 if(field=='compliance_locations.state_id'){
				 var value1=recordObj['compliance_locations.state_id'];
				 restriction.addClause('state.geo_region_id', value1, '=');
				 
				 var record=c.dsState.getRecord(restriction);
				 if(record.isNew){
					 View.alert('state do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.city_id'){
				 var value1=recordObj['compliance_locations.city_id'];
				 var value2=recordObj['compliance_locations.state_id'];
				 restriction.addClause('city.city_id', value1, '=');
				 restriction.addClause('city.state_id', value2, '=');
				 
				 var record=c.dsCity.getRecord(restriction);
				 if(record.isNew){
					 View.alert('city_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.county_id'){
				 var value1=recordObj['compliance_locations.county_id'];
				 var value2=recordObj['compliance_locations.state_id'];
				 restriction.addClause('county.county_id', value1, '=');
				 restriction.addClause('county.state_id', value2, '=');
				 
				 var record=c.dsCounty.getRecord(restriction);
				 if(record.isNew){
					 View.alert('county_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.site_id'){
				 var value1=recordObj['compliance_locations.site_id'];
				 restriction.addClause('site.site_id', value1, '=');
				 
				 var record=c.dsSite.getRecord(restriction);
				 if(record.isNew){
					 View.alert('site_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.pr_id'){
				 var value1=recordObj['compliance_locations.pr_id'];
				 restriction.addClause('property.pr_id', value1, '=');
				 
				 var record=c.dsProperty.getRecord(restriction);
				 if(record.isNew){
					 View.alert('pr_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.bl_id'){
				 var value1=recordObj['compliance_locations.bl_id'];
				 restriction.addClause('bl.bl_id', value1, '=');
				 
				 var record=c.dsBl.getRecord(restriction);
				 if(record.isNew){
					 View.alert('bl_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.fl_id'){
				 var value1=recordObj['compliance_locations.bl_id'];
				 var value2=recordObj['compliance_locations.fl_id'];
				 restriction.addClause('fl.bl_id', value1, '=');
				 restriction.addClause('fl.fl_id', value2, '=');
				 
				 var record=c.dsFl.getRecord(restriction);
				 if(record.isNew){
					 View.alert('fl_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.rm_id'){
				 var value1=recordObj['compliance_locations.bl_id'];
				 var value2=recordObj['compliance_locations.fl_id'];
				 var value3=recordObj['compliance_locations.rm_id'];
				 restriction.addClause('rm.bl_id', value1, '=');
				 restriction.addClause('rm.fl_id', value2, '=');
				 restriction.addClause('rm.rm_id', value3, '=');
				 
				 var record=c.dsRm.getRecord(restriction);
				 if(record.isNew){
					 View.alert('rm_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.eq_std'){
				 var value1=recordObj['compliance_locations.eq_std'];
				 restriction.addClause('eqstd.eq_std', value1, '=');
				 
				 var record=c.dsEqstd.getRecord(restriction);
				 if(record.isNew){
					 View.alert('eq_std do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.eq_id'){
				 var value1=recordObj['compliance_locations.eq_id'];
				 restriction.addClause('eq.eq_id', value1, '=');
				 
				 var record=c.dsEq.getRecord(restriction);
				 if(record.isNew){
					 View.alert('eq_id do not exist in table.');
				 }
			 }else
			 if(field=='compliance_locations.em_id'){
				 var value1=recordObj['compliance_locations.em_id'];
				 restriction.addClause('em.em_id', value1, '=');
				 
				 var record=c.dsEm.getRecord(restriction);
				 if(record.isNew){
					 View.alert('em_id do not exist in table.');
				 }
			 }
		 }
		 
	 }
	 
}



/**
 * Action Listener for select value button 'fl'.
 */
function afterSelectFloorOrRoom(fieldName, selectedValue, previousValue){
	var form = assignController.complianceLocForm; 
	if(fieldName.indexOf("bl_id")!=-1){
		var bl_id = selectedValue;
    	var dsBlForJS = View.dataSources.get("dsBlForJS");
    	var record = dsBlForJS.getRecords("bl_id = '"+selectedValue+"'")[0];  
        form.setFieldValue("compliance_locations.ctry_id", record.getValue('bl.ctry_id'));
        form.setFieldValue("compliance_locations.site_id", record.getValue('bl.site_id'));
        form.setFieldValue("compliance_locations.regn_id", record.getValue('bl.regn_id'));
        form.setFieldValue("compliance_locations.state_id", record.getValue('bl.state_id'));
        form.setFieldValue("compliance_locations.city_id", record.getValue('bl.city_id'));
        form.setFieldValue("compliance_locations.pr_id", record.getValue('bl.pr_id'));
        form.setFieldValue("compliance_locations.geo_region_id", record.getValue('ctry.geo_region_id'));
        form.setFieldValue("compliance_locations.county_id", record.getValue('property.county_id'));
	}
}


function editCompLoc(){
	
	assignController.mainController.setOthersTabRefreshObj(['assignLocation','manageLocation'], 1);
	var grid = assignController.regLocGrid;
	var rowIndex = grid.rows[grid.selectedRowIndex];
    var location_id = rowIndex["regloc.location_id"];
    
    var regulation = rowIndex["regloc.regulation"];
    var regprogram = rowIndex["regloc.reg_program"];
    var regrequirement = rowIndex["regloc.reg_requirement"];
	//this.sbfDetailTabs.enableTab('select');
	assignController.mainTabs.location_id=location_id;
	assignController.mainTabs.findTab("editLocation").isContentLoaded=false;
	assignController.mainTabs.selectTab("editLocation");
	
	var compLocationTabs=assignController.mainController.compLocationTabs;
	enableAndDisableTabs(compLocationTabs,assignController.enableTabsArr);
	var recordComLoc=assignController.dsCompLocForm.getRecords('location_id='+location_id)[0];
	var instructionStr=generateInstruction(regulation,regprogram,regrequirement,recordComLoc);

	assignController.mainController.instructionStr=instructionStr;
	assignController.mainController.location_id=location_id;
	assignController.mainController.regulation=regulation;
	assignController.mainController.regprogram=regprogram;
	assignController.mainController.regrequirement=regrequirement;
	
}
/**
 * Clear selected checkbox
 * @param grid
 */
function unselectAllRecords(grid) {
    var grid = Ab.view.View.getControl('', grid);
	var selectedRows = grid.setAllRowsSelected(false);
}