/*
 *   This control defines the Geocoder 
 *   The Geocoder finds geographic coordinates (latitude and longitude) associated with a street address
 *   This class uses the ESRI JS API and the ArcGIS Online Locator Service
 */
Ab.namespace('arcgis');

//this is the geoCodeTool object itself
var geoCodeTool = null
 
Ab.arcgis.Geocoder = Base.extend({  

	// @begin_translatable
    z_MESSAGE_GEOCODE_FINISHED: 'The Geocode Operation is finished.',
	z_MESSAGE_GEOCODE_FINISHED_WITHOUT_MATCH: 'The Geocode Operation is finished. Cannot find a match for item(s): {0}',
	// @end_translatable

	//the Ab.arcgis.ArcGISMap associated with the tool
	abMap: null, 
	
	//the data records returned from datasource
	initRecords: null,
	
	//the data records that need geocode operation
	//the difference between initRecords and targetRecords is determined by whether the existing
	//geometry information needs to be replaced.
	targetRecords: null,
	
	// records that were not geocoded
	notGeocodedRecords: null,
	
	//indicated which data records in the targetRecords is being geocoding now.
	index: null,
	
	//the esri.tasks.Locator which does the geocode	
	geoCodeLocatorNA: null,
	geoCodeLocatorEU: null,

	//the information needed for geocode  --- records, address, geometry, etc. 
	dataSourceName: null,
	tableName: null,
	restriction: null,
	pkField: null,
	geometryFields: null,
	addressFields: null,
	replace: null,
	
	// callback function to perfom aditional task when geocode is done
	callbackMethod: null,
	/*
     *  The constructor.
     *	@param mapParam. The Ab.arcgis.ArcGISMap associated with thie tool
     */
	constructor: function(mapParam) {
    	this.abMap = mapParam; // not needed, but will leave for now as to not change the interface
    	geoCodeTool = this;
		
 		//import the esri ibraries
		dojo.require("esri.tasks.locator");
	},
    
    /**
     *  This function get all records which need GeoCoding operation, process them, and send information to actual GeoCode operation.
     *	@param dataSourceName. The dataSource to get records.
     * 	@param restriction. The restriction needed when get dataRecords from dataSource.
     * 	@param tableName. The tableName in which the records's geometry information will be added.
     * 	@param pkField.  The primary key field for tableName.
     * 	@param geometryFields.  The geometryFields for tableName.
     *  @param addressFields.  The fields whose value hold the actual address.
     *  @param replace.  Boolean.  Whether replace the existing geometry information.
     */
   	geoCode: function(dataSourceName, restriction, tableName, pkField, geometryFields, addressFields, replace){
		
		//create esri.tasks.Locator
		if( this.geoCodeLocatorNA == null || this.geoCodeLocatorEU == null ){
			if(license_type=='demo'){
				this.geoCodeLocatorNA = new esri.tasks.Locator("http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/TA_Address_NA/GeocodeServer");
				// original EU locator
				this.geoCodeLocatorEU = new esri.tasks.Locator("http://tasks.arcgisonline.com/arcgis/rest/services/Locators/TA_Address_EU/GeocodeServer");
				// alternate EU locator
				//this.geoCodeLocatorEU = new esri.tasks.Locator("http://tasks.arcgis.com/ArcGIS/rest/services/WorldLocator/GeocodeServer");
			}
			if(license_type=='prod'){
				this.geoCodeLocatorNA = new esri.tasks.Locator("http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/TA_Address_NA/GeocodeServer?appId=esriAI2010");				
				this.geoCodeLocatorEU = new esri.tasks.Locator("http://tasks.arcgisonline.com/arcgis/rest/services/Locators/TA_Address_EU/GeocodeServer?appId=esriAI2010");
				//The following Locator may be substituted for the geoCodeLocators above if needed to process data outside North America or the EU.  Additional configuration required to pass search criteria to this locator.
				//this.geoCodeLocator = new esri.tasks.Locator("http://tasks.arcgisonline.com/arcgis/rest/services/Locators/ESRI_Places_World/GeocodeServer");
			}
			
			//will call this.doGeoCode after the completion of each AddressToLocations operation
			dojo.connect(this.geoCodeLocatorNA, "onAddressToLocationsComplete", this.doGeoCode);
			dojo.connect(this.geoCodeLocatorEU, "onAddressToLocationsComplete", this.doGeoCode);
		}
	
		this.dataSourceName = dataSourceName;
		this.tableName = tableName;
		this.restriction = restriction;
		this.pkField = pkField;
		this.geometryFields = geometryFields;
		this.addressFields = addressFields;
		this.replace = replace;
	
		// clear all markers on the map.
		// this.abMap.map.graphics.clear(); // gk 07302012
		// this throws an error in the fl version. we would need a callback to get the message over to the map control.
		// in general, this feels misplaced -- as a geocode function shouldnt be touching map graphcis. a geocoder should geocode.
		// if we want to clear the map graphics, we can do that from the view controller.  
		
		this.index = 0;
      
      	//get all the data records returned from datasource
		this.initRecords = this.getDataSourceRecords(this.dataSourceName, this.restriction);
		
		//prepare targetRecords based on whether to replace the existing geometry information.
		this.targetRecords = new Array();
		this.notGeocodedRecords = new Array();
		
		for (var i = 0; i < this.initRecords.length; i++) {
			
			var recordLat = this.initRecords[i].getValue(this.geometryFields[0]);
   			var recordLon = this.initRecords[i].getValue(this.geometryFields[1]);
   			
   			//geocode if replace is true OR lat or lon is null
   			if( this.replace || ( recordLat == null || recordLon == null || recordLat == "" || recordLon == "") ) {
   				this.targetRecords.push(this.initRecords[i]);
   			}
		}
		
   		var finalAddress = new Object();	
   		var pkValue;
   			
   		//for each record which needs GeoCoding operation.
   		for (var i = 0; i < this.targetRecords.length; i++) {
  		
    		//The address argument is data object that contains properties representing 
    		//the various address fields accepted by the corresponding geocode service. 
    		//These fields are listed in the addressFields property of the associated 
    		//geocode service resource. 
    		//The "ESRI_Geocode_USA" service requires: Street, City, State and Zip, 
    		//then the address argument is of the form:
    		//{
 			//	Street: "<street>",
 			//	City: "<city>",
 			//	State: "<state>",
 			//	Zip: "<zip>"
			//} 
   			var isNA = null;   			
   			//use explicit field references, if possible, else use indexed fields
			finalAddress["Address"] = this.targetRecords[i].getValue(this.addressFields[0]);
			finalAddress["City"] = this.targetRecords[i].getValue(this.addressFields[1]);
    		//Determine which geocode locator to use and the input format according to country field	    		
    		var country = this.targetRecords[i].getValue(this.addressFields[4]); 
   			if (country == "USA" || country == "CANADA" || !valueExistsNotEmpty(country)) {
   				finalAddress["State"] = this.targetRecords[i].getValue(this.addressFields[2]);
   				isNA = true;
			    finalAddress["Zip"] = this.targetRecords[i].getValue(this.addressFields[3]);	
   			}
    		else {
				finalAddress["Postcode"] = this.targetRecords[i].getValue(this.addressFields[3]);
			}
    		finalAddress["Country"] = country;	    		
   			
    		//call the actual Geocode function. 
    		//Pass in the address, and the list of fields included in the returned result set.
    		if (isNA){
    			this.geoCodeLocatorNA.addressToLocations(finalAddress,["Loc_name"]);//, "x", "y"]);
    		}
    		else
    		{
					
				//original multi-line (object) approach 
				this.geoCodeLocatorEU.addressToLocations(finalAddress,["Loc_name"]);//, "x", "y"]);
				//alternate single-line approach
				//var address = {"SingleLine":finalAddress.Address + ' ' + finalAddress.City + ' ' + finalAddress.Country + ' ' + finalAddress.Zip};
				//var options = {
				//	address:address,
				//	outFields:["Loc_name"]
				//} 
				//this.geoCodeLocatorEU.addressToLocations(options);//, "x", "y"]);
    		}
        }//for (var i = 0; i < this.targetRecords.length; i++)
  	},

   	/**
   	 * 	get data records
   	 *  @param dataSourceName. The dataSourceName.
     *  @param restriction. The Restriction.
     *  @return. The dataRecords.
   	 */
   	getDataSourceRecords: function(dataSourceName, restriction){
   		var ds = View.dataSources.get(dataSourceName);
   		return ds.getRecords(restriction);
   	},
	
   	/**
     *  This is the callback function after the completion of each AddressToLocations operation.
     *	@param candidates. All the possible candidates returned from AddressToLocations operation.
     */	
  	doGeoCode: function(candidates) {
        	
    	var candidate; 
		var isMatch = false;
    		
    	//each geoCodeLocator.addressToLocations operation will return multiple candidates
    	//each candidate has different level of accuracy-->score, and different "loc_name".
    	//"loc_name" could be street_address, city_state, etc.  Since we need the geometry information
    	//for an address, we want Loc_name == "Street_Address".  And since we want a close match for the address,
    	//we need high score.
    	for (var j = 0; j < candidates.length; j++) {
    	
    		candidate = candidates[j];
     	
     		//Logic here will prioritize rooftop over street address over sample server results.  
     		// EU and World Loc_name values may be different.
     		if (
     				(candidate.attributes.Loc_name == "US_RoofTop"
     				 || candidate.attributes.Loc_name == "US_Streets"
     				 || candidate.attributes.Loc_name == "CAN_Streets"		     		 
		     		 //this will match street results from the TA_Address_EU Locator service, but not filter by country
					 || candidate.attributes.Loc_name.match("_Streets")
		     		 || candidate.attributes.Loc_name.match("Street_Addr")
		     		 )
     		&& 
     		candidate.score > 80 &&
     		candidate.location.x &&
     		candidate.location.y) 
     		{
			
				var lon = candidate.location.x;
				var lat = candidate.location.y;
				
				//prepare the new record
				var record = {};
				record[geoCodeTool.pkField] = geoCodeTool.targetRecords[geoCodeTool.index].getValue(geoCodeTool.pkField);
				record[geoCodeTool.geometryFields[0]] = lat;
				record[geoCodeTool.geometryFields[1]] = lon;
				
				//call WFR to save record
				var parameters = {
					tableName: geoCodeTool.tableName,
					fields: toJSON(record)
				}
				
				var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
				if (result.code != 'executed') {
					Ab.workflow.Workflow.handleError(result);
				}
				//alert("good: " + geoCodeTool.targetRecords[geoCodeTool.index].getValue(geoCodeTool.pkField)); 	
				isMatch = true;
				break;
			}//end if
		}//end    for (var j = 0; j < candidates.length; j++) 
		
		if(!isMatch){
			geoCodeTool.notGeocodedRecords.push(geoCodeTool.targetRecords[geoCodeTool.index].getValue(geoCodeTool.pkField));
		}
		
		//alert(geoCodeTool.targetRecords[geoCodeTool.index].getValue(geoCodeTool.pkField) + ": " + geoCodeTool.index ); 
		
		geoCodeTool.index++;
		
		if( geoCodeTool.index == geoCodeTool.targetRecords.length ) {
			var msg = View.getLocalizedString(geoCodeTool.z_MESSAGE_GEOCODE_FINISHED	);
			if(geoCodeTool.notGeocodedRecords.length > 0){
				msg = View.getLocalizedString(geoCodeTool.z_MESSAGE_GEOCODE_FINISHED_WITHOUT_MATCH	);
				msg = msg.replace('{0}', geoCodeTool.notGeocodedRecords.toString());
			}
   			View.showMessage(msg);
			if(geoCodeTool.callbackMethod != null){
				geoCodeTool.callbackMethod.call();
			}
		}
	}
});
