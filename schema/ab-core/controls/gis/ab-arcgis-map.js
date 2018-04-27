/**
 * This control is used for JavaScript-based map API.
 */
Ab.namespace('arcgis');

//this is the ArcGIS Map control itself.
var mapControl = null;

//this is the license type
var license_type = null;

/*
 *  check to see whether user has valid license
 */
function hasValidArcGisMapLicense(){
    
	//the license key name in afm_activity_params table
    var license_name = 'ESRIArcGisOnlineServicesKey';
    var license_demo_value = 'ESRIDEMO3895';
    var license_prod_value = 'ESRIAI4963';
    
    var activity_params_activity_id = 'AbSystemAdministration';

	//read the ArcWebServices key from database
	var param_id = license_name;
	var parameters ={ tableName: 'afm_activity_params',
		       		fieldNames: toJSON(['afm_activity_params.param_value']),
		       		restriction: toJSON({'afm_activity_params.param_id':param_id,
		                          'afm_activity_params.activity_id':activity_params_activity_id})
		     		};

	var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);

	if (result.code == 'executed') 
	{
   		var record = result.data.records[0];
   		var key_value = record['afm_activity_params.param_value'];
   		if(key_value == license_demo_value){
   			license_type = 'demo';
   			return true;
   		} 
   		else if(key_value == license_prod_value) {
   			license_type = 'prod';
   			return true;
   		}
   		else {
   			return false;
   		}
  	}
	else 
	{
		AFM.workflow.Workflow.handleError(result);
		return false;
	}   		
};

/*
 *   The ArcGISMap Control     
 */

Ab.arcgis.ArcGISMap = Ab.view.Component.extend({
    
    // @begin_translatable
    z_MESSAGE_LAYER_NOT_VISIBLE: 'This map layer is not available at this map scale. Zoom out to view this layer.',
	z_MESSAGE_INVALID_LICENSE: 'Please refer to the Enabling GIS Services System Management Help topic for instructions on how to enable this view.',
	z_MESSAGE_TERMS_OF_SERVICE: 'Use of the ESRI ArcGIS Online Services is subject to the Terms of Use available on the ESRI Web site.',
	z_MESSAGE_NO_REFERENCE_LAYER: 'None',
	// BASEMAPS
	z_MESSAGE_WORLD_IMAGERY_AND_STREET_HYBRID: 'World Imagery and Street Hybrid',
	z_MESSAGE_WORLD_IMAGERY: 'World Imagery', 
	z_MESSAGE_WORLD_STREET_MAP: 'World Street Map', 	
	z_MESSAGE_WORLD_TOPOGRAPHIC_MAP: 'World Topographic Map',
	z_MESSAGE_WORLD_LIGHT_GRAY_BASE: 'World Light Gray Canvas',	
	z_MESSAGE_WORLD_PHYSICAL_MAP: 'World Physical Map', 	
	z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY: 'World Shaded Relief Imagery', 		
    z_MESSAGE_NATGEO_WORLD_MAP: 'National Geographic',
	z_MESSAGE_OCEAN_BASEMAP: 'Oceans',	
	z_MESSAGE_USA_TOPOGRAPHIC_MAPS: 'USA Topographic Maps', 
	
	// REFERENCE LAYERS
	z_MESSAGE_USA_DIVERSITY_INDEX: 'USA Diversity Index', 	
	z_MESSAGE_USA_HOUSEHOLD_SIZE: 'USA Average Household Size',
	z_MESSAGE_USA_LABOR_FORCE_PARTICIPATION_RATE: 'USA Labor Force Participation Rate',
	z_MESSAGE_USA_MEDIAN_AGE: 'USA Median Age',
	z_MESSAGE_USA_MEDIAN_HOME_VALUE: 'USA Median Home Value',
	z_MESSAGE_USA_MEDIAN_HOUSEHOLD_INCOME: 'USA Median Household Income', 
	z_MESSAGE_USA_MEDIAN_NET_WORTH: 'USA Median Net Worth',	
	z_MESSAGE_USA_OWNER_OCCUPIED_HOUSING: 'USA Owner Occupied Housing',
	z_MESSAGE_USA_POPULATION_BY_SEX: 'USA Population by Sex',
	z_MESSAGE_USA_PERCENT_OVER_64: 'Percentage of U.S. Population Older than Age 64',
	z_MESSAGE_USA_PERCENT_UNDER_18: 'Percentage of U.S. Population Aged Younger than 18 Years',
	z_MESSAGE_USA_POPULATION_DENSITY: 'USA Population Density',
    z_MESSAGE_USA_POPULATION_CHANGE: 'USA Population Change',
	z_MESSAGE_USA_PROJECTED_POPULATION_CHANGE: 'USA Projected Population Change',
	z_MESSAGE_USA_RECENT_POPULATION_CHANGE: 'USA Population Change',
	z_MESSAGE_USA_RETAIL_SPENDING_POTENTIAL: 'USA Retail Spending Potential',
	z_MESSAGE_USA_SOCIAL_VULNERABILITY_INDEX: 'USA Social Vulnerability Index',	
	z_MESSAGE_USA_TAPESTRY: 'USA Tapestry Segmentation',
	z_MESSAGE_USA_UNEMPLOYMENT_RATE: 'USA Unemployment Percentage Rate',
	z_MESSAGE_WORLD_NAVIGATION_MAPS: 'World Navigation Maps', 	
	// @end_translatable
	//z_MESSAGE_WORLD_POLITICAL_MAP: 'World Political Map', 
    
    //the ESRI ArcGIS Map
   	map: null,
    // the map configuration parameters
	mapConfigObject: null,
	
    //the div which holds the map
    divId: '',
    
    // ID of the view panel that contains the map
    panelId: '',
    
    //the width and height of the div which holds the map
    divWidth: null,
    divHeight: null,
    
    //the graphic mouse click call back function passed in 
    mouseClickHandler: null,
    mouseClickEnabled: false,
    
    //the font of the text symbol
    textSymbolFont: 'BOLDER',
    
    //the color of the text symbol
    //textSymbolColor: [0,0,205,1], //blue
    textSymbolColor: [255,215,0,1],
	
    //Ext.util.MixedCollection
    //it holds all pairs of datasource-ArcGISMarkerProperty
    //key is the dataSource, value is the corresponding ArcGISMarkerProperty
    dataSourceMarkerPairs: null,
    
    //this is the multipoints object which holds all points on the map
    allPoints: null,
    
    //limit the level of detail for automatic zoom by the application, helps prevent "no map data available" message in some locations with some map services
    autoZoomLevelLimit: 13,
    
    //the restriction passed through the refresh function
    restrictionFromRefresh: null,
    
    //Ext.util.MixedCollection
    // holds BASEMAP layerName--layerURL pairs available to the map
    // availableMapLayerList is deprecated at 21.1 -- use basemapLayerList instead
	availableMapLayerList: null,
    basemapLayerList: null,
	// holds REFERENCE layerName--layerURL pairs available to the map
	referenceLayerList: null,
	// ESRI legend 
	legendDijit: null,
	legendLayers: [],
	// map graphics layers
	markerGraphicsLayer: null,
	markerLabelGraphicsLayer: null,
	
    // will be replaced by localized string 
    HYBRID_LAYER: '', 
    
    mapInited: false,
    
    // whether dojo.connect has been called in doRefresh
    dojoConnectCalledInDoRefresh: false,
    
     /*
     *  constructor
     *  @param panelIdParam. The panel which holds the div.
     *  @param divIdParam. The div which holds the map.
     *  @param configObject. The configObject for the panel.
     */
    constructor: function(panelIdParam, divIdParam, configObject, mapConfigObject) {
    	mapControl = this;
		if ( valueExistsNotEmpty(mapConfigObject) ) { 
			this.mapConfigObject = mapConfigObject;
		}	
    	this.panelId = panelIdParam;
    	    	
    	// add default config parameters if they are not defined in AXVW
		configObject.addParameterIfNotExists('showOnLoad', true); 
		
        // call the base Component constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
		
		// 
        // this.inherit(panelIdParam, 'html', configObject);
		
    	this.dataSourceMarkerPairs = new Ext.util.MixedCollection();
    	this.divId = divIdParam;
    	
    	this.divWidth = document.getElementById(this.divId).clientWidth;
    	this.divHeight = document.getElementById(this.divId).clientHeight;
	    
  		// build the basemap layerList to holds basemap layers available to the map
    	// if the mapConfigObject.basemapLayerList exists, use it 
		// otherwise, default to ArcGISOnline basemaps
		if (valueExistsNotEmpty(this.mapConfigObject)) {
			if (valueExistsNotEmpty(mapConfigObject.basemapLayerList)) {
				this.basemapLayerList = mapConfigObject.basemapLayerList;		
			}
		}
		else {
			this.buildBasemapLayerList();
		}		
		// buildAvailableLayerList is deprecated at 21.1 -- use buildBasemapLayerList instead
		this.buildAvailableLayerList();
		
		// build the reference layer list
		if (valueExistsNotEmpty(this.mapConfigObject)) {
			if (valueExistsNotEmpty(mapConfigObject.referenceLayerList)) {
				this.referenceLayerList = mapConfigObject.referenceLayerList;		
			}
		}
		else {
			this.buildReferenceLayerList();
		}	 	
	
	 	if( hasValidArcGisMapLicense() ) {
	 		//import the esri map, geocoding, and legend libraries
	    	dojo.require("esri.map");    	
	    	dojo.require("esri.tasks.locator");
	    	dojo.require("esri.dijit.Legend"); 
			dojo.require("dojo.dnd.Moveable");	
			dojo.require("dojo.io.script"); 	// for ajax/JSON requests
			
	    	//defers script execution until all the HTML is loaded
	    	//then call initMap function	    	
	     	dojo.addOnLoad(this.initMap);
	     }
	     else {
	     	var msg = View.getLocalizedString(this.z_MESSAGE_INVALID_LICENSE);
   			View.showMessage(msg);
	     }

		// resize the panel that contains the map
		var panel = View.panels.get(panelIdParam);
		
		panel.syncHeight = function() {
			panel.afterResize();
		};
		
		panel.afterResize = function() {
			var height = panel.determineHeight();
			var width = panel.determineWidth();		
			var div = Ext.get(mapControl.divId);
			div.setHeight(height);
			div.setWidth(width);
		};

		panel.afterLayout = function() {
			var regionPanel = this.getLayoutRegionPanel();
			if (regionPanel) {
				if (!panel.resizeListenerAttached) {
					panel.resizeListenerAttached = true;
					
					regionPanel.addListener('resize', function() {
						panel.afterResize();
					});
		            regionPanel.addListener('expand', function() {
		                panel.afterResize();
		            });
				}
			}
		};
		
		panel.afterLayout();
		panel.afterResize();
    },
    
    /*
     *  Init the Map
     */
   	initMap: function() {
		var mapExtent;
		// check mapConfigObject for custom user map extent
		if (valueExistsNotEmpty(mapControl.mapConfigObject)) { 
			if (valueExistsNotEmpty(mapControl.mapConfigObject.mapInitExtent && valueExistsNotEmpty(mapControl.mapConfigObject.mapInitExtentWKID))) {
				mapExtent = new esri.geometry.Extent( 
					mapControl.mapConfigObject.mapInitExtent[0],
					mapControl.mapConfigObject.mapInitExtent[1],
					mapControl.mapConfigObject.mapInitExtent[2],
					mapControl.mapConfigObject.mapInitExtent[3],
					new esri.SpatialReference({"wkid":mapControl.mapConfigObject.mapInitExtentWKID})
				);
			} 
		}		
		else {
			//create default map extent (north america)
			mapExtent = new esri.geometry.Extent(-14676000, 1718000, -6849000, 7589000, new esri.SpatialReference({"wkid":102100}));
		}
		
		//create map 
   		mapControl.map = new esri.Map(mapControl.divId, {wrapAround180: true,
			extent:mapExtent});
   		
   	    // resize map when browser resizes
   	    dojo.connect(window, 'resize', mapControl.map, mapControl.map.resize);
		
       	// add default (hybrid) layer or
       	// default to first layer in map layer list		
		if (valueExistsNotEmpty(mapControl.mapConfigObject)) {
			if (valueExistsNotEmpty( mapControl.mapConfigObject.basemapLayerList )){
				mapControl.switchBasemapLayer( mapControl.basemapLayerList.keys[0] );
			}
		}
		else {
			mapControl.switchBasemapLayer(mapControl.HYBRID_LAYER);
       	}
	   
       	mapControl.mapInited = true;
       	
		//create the graphics layers
		mapControl.markerGraphicsLayer = new esri.layers.GraphicsLayer({
			id: 'markerGraphics',
			index: 20
		});
		mapControl.map.addLayer( mapControl.markerGraphicsLayer );
		mapControl.markerLabelGraphicsLayer = new esri.layers.GraphicsLayer({
			id: 'markerLabelGraphics',
			index: 25
		});
		mapControl.markerLabelGraphicsLayer.disableMouseEvents(); // not sure this works
		mapControl.map.addLayer( mapControl.markerLabelGraphicsLayer );
		// reorder graphics layers
		mapControl.map.reorderLayer( mapControl.markerGraphicsLayer, 20 );
		mapControl.map.reorderLayer( mapControl.markerLabelGraphicsLayer, 25 );
		
		// display terms of use message
		var reportTargetPanel = document.getElementById(mapControl.divId).parentNode; // we want the mapPanel		
		var pTag = document.createElement("p");
		pTag.innerHTML = View.getLocalizedString(mapControl.z_MESSAGE_TERMS_OF_SERVICE);
		var divTag = document.createElement("div");
		divTag.id = 'esriTOS';
		divTag.appendChild(pTag);
		reportTargetPanel.appendChild(divTag);
		// allow user to dismiss terms of use message		
		dojo.connect(dojo.byId('esriTOS'), 'click', function() {
			dojo.destroy(dojo.byId('esriTOS'));
		});
		
		// add legend display elements
		var esriLegendContainer = document.createElement("div");
		esriLegendContainer.id = 'esriLegendContainer';
		var esriLegendCloseButton = document.createElement("div");
		esriLegendCloseButton.id = 'esriLegendCloseButton'; 
		esriLegendContainer.appendChild( esriLegendCloseButton );
		var esriLegend = document.createElement("div");
		esriLegend.id = 'esriLegend';
		esriLegendContainer.appendChild( esriLegend );
		reportTargetPanel.appendChild( esriLegendContainer );
		dojo.style('esriLegendContainer', { 'display': 'none' });
		// make the legend moveable
		var esriMoveable = dojo.dnd.Moveable(dojo.byId('esriLegendContainer'));
		// wire up close event to close button
		dojo.connect(dojo.byId('esriLegendCloseButton'), 'click', function() {
			mapControl.hideEsriLegend();
		});
		
		// create esri legend dijit 
		dojo.connect( mapControl.map, 'onLoad', function() {
			mapControl.legendDijit = new esri.dijit.Legend({
				map: mapControl.map,
				layerInfos: mapControl.legendLayers
			}, 'esriLegend' );
			mapControl.legendDijit.startup();
		});
		// wire up layer events for legend
		dojo.connect( mapControl.map, 'onLayersAddResult', function(results){
			mapControl.legendDijit.refresh( mapControl.legendLayers );
		});
		
   	    mapControl.map.resize();
   	},

	/*
     *  get layer names for all available map layers 
	 *  deprecated at 21.1 -- use getBasemapLayerList instead
     */
	getAvailableMapLayerList: function() {
        return this.availableMapLayerList.keys;
	},
	/*
     *  get layer names for all available BASEMAP layers 
     */	
	getBasemapLayerList: function() { 
		return this.basemapLayerList.keys;
	},
	/*
     *  get layer names for all available REFERENCE layers 
     */
	getReferenceLayerList: function() {
        return this.referenceLayerList.keys;
	},	
	/*
     *  build the layerName-layerURL pairs which are available 
	 *	deprecated at 21.1 -- use buildBasemapLayerList instead
     */
	buildAvailableLayerList: function() {

		this.availableMapLayerList = new Ext.util.MixedCollection();
		
		//HYBRID_LAYER: 'World Imagery and Street Hybrid'
		//This is the combination of "World Imagery", "World Transportation" and "World Boundaries and Places"
		//create specifically by ArcGISMap control
		this.HYBRID_LAYER = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY_AND_STREET_HYBRID);
		this.availableMapLayerList.add(this.HYBRID_LAYER, "hybrid");
		
		var appIdCode = "";
		if(license_type=='prod'){
			appIdCode = "?appId=esriAI2010";
		}
		
		//base maps
     	var msg = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_STREET_MAP);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_TOPOGRAPHIC_MAPS);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_PHYSICAL_MAP);	
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer" + appIdCode);		
		var  msg = View.getLocalizedString(this.z_MESSAGE_WORLD_LIGHT_GRAY_BASE);
		this.availableMapLayerList.add(msg, "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer" + appIdCode);
		var  msg = View.getLocalizedString(this.z_MESSAGE_NATGEO_WORLD_MAP);
		this.availableMapLayerList.add(msg, "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer" + appIdCode);
		var  msg = View.getLocalizedString(this.z_MESSAGE_OCEAN_BASEMAP);
		this.availableMapLayerList.add(msg, "http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_NAVIGATION_MAPS);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/World_Navigation_Charts/MapServer" + appIdCode);		
		//reference layers
		//these layers should be used in conjunction with a basemap and not independently
		msg = View.getLocalizedString(this.z_MESSAGE_USA_DIVERSITY_INDEX);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Diversity_Index/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_HOUSEHOLD_SIZE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Average_Household_Size/MapServer" + appIdCode);		
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_HOUSEHOLD_INCOME);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Household_Income/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_LABOR_FORCE_PARTICIPATION_RATE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Labor_Force_Participation_Rate/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_AGE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Age/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_HOME_VALUE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Home_Value/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_NET_WORTH);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Net_Worth/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_OWNER_OCCUPIED_HOUSING);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Owner_Occupied_Housing/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_BY_SEX);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_by_Sex/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_OVER_64);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Over_64/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_UNDER_18);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Under_18/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_DENSITY);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_Density/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_CHANGE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer" + appIdCode);		
	    msg = View.getLocalizedString(this.z_MESSAGE_USA_PROJECTED_POPULATION_CHANGE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Projected_Population_Change/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_RECENT_POPULATION_CHANGE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Recent_Population_Change/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_RETAIL_SPENDING_POTENTIAL);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Retail_Spending_Potential/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_SOCIAL_VULNERABILITY_INDEX);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Social_Vulnerability_Index/MapServer" + appIdCode);		
		msg = View.getLocalizedString(this.z_MESSAGE_USA_TAPESTRY);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Tapestry/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_UNEMPLOYMENT_RATE);
		this.availableMapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer" + appIdCode);

	},
	/*
     *  build the layerName-layerURL pairs for BASEMAP layers
     */	
	buildBasemapLayerList: function() {

		this.basemapLayerList = new Ext.util.MixedCollection();
		
		//HYBRID_LAYER: 'World Imagery and Street Hybrid'
		//This is the combination of "World Imagery", "World Transportation" and "World Boundaries and Places"
		//create specifically by ArcGISMap control
		this.HYBRID_LAYER = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY_AND_STREET_HYBRID);
		this.basemapLayerList.add(this.HYBRID_LAYER, "hybrid");
		
		var appIdCode = "";
		if(license_type=='prod'){
			appIdCode = "?appId=esriAI2010";
		}
		
		//base maps
     	var msg = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY);
		this.basemapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_STREET_MAP);
		this.basemapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer" + appIdCode);
		var  msg = View.getLocalizedString(this.z_MESSAGE_WORLD_TOPOGRAPHIC_MAP);
		this.basemapLayerList.add(msg, "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer" + appIdCode);
		var  msg = View.getLocalizedString(this.z_MESSAGE_WORLD_LIGHT_GRAY_BASE);
		this.basemapLayerList.add(msg, "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_PHYSICAL_MAP);	
		this.basemapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY);
		this.basemapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer" + appIdCode);		
		var  msg = View.getLocalizedString(this.z_MESSAGE_NATGEO_WORLD_MAP);
		this.basemapLayerList.add(msg, "http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer" + appIdCode);
		var  msg = View.getLocalizedString(this.z_MESSAGE_OCEAN_BASEMAP);
		this.basemapLayerList.add(msg, "http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_TOPOGRAPHIC_MAPS);
		this.basemapLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer" + appIdCode);		
	},
	/*
     *  build the layerName-layerURL pairs which for REFERENCE layers
     */
	buildReferenceLayerList: function() {

		this.referenceLayerList = new Ext.util.MixedCollection();
		
		var appIdCode = "";
		if(license_type=='prod'){
			appIdCode = "?appId=esriAI2010";
		}
		
		//reference layers
		//these layers should be used in conjunction with a basemap and not independently
     	var msg = View.getLocalizedString(this.z_MESSAGE_NO_REFERENCE_LAYER);
		this.referenceLayerList.add(msg, "");
		msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_CHANGE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_DIVERSITY_INDEX);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Diversity_Index/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_HOUSEHOLD_INCOME);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Household_Income/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_HOUSEHOLD_SIZE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Average_Household_Size/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_SOCIAL_VULNERABILITY_INDEX);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Social_Vulnerability_Index/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_LABOR_FORCE_PARTICIPATION_RATE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Labor_Force_Participation_Rate/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_AGE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Age/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_HOME_VALUE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Home_Value/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_NET_WORTH);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Net_Worth/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_OWNER_OCCUPIED_HOUSING);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Owner_Occupied_Housing/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_BY_SEX);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_by_Sex/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_OVER_64);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Over_64/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_UNDER_18);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Under_18/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_DENSITY);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_Density/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_PROJECTED_POPULATION_CHANGE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Projected_Population_Change/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_RECENT_POPULATION_CHANGE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Recent_Population_Change/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_RETAIL_SPENDING_POTENTIAL);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Retail_Spending_Potential/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_TAPESTRY);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Tapestry/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_USA_UNEMPLOYMENT_RATE);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer" + appIdCode);
		msg = View.getLocalizedString(this.z_MESSAGE_WORLD_NAVIGATION_MAPS);
		this.referenceLayerList.add(msg, "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/World_Navigation_Charts/MapServer" + appIdCode);
	},
	
	/*
     *  switch the map layer
     *  @param layerName 	Required 	The new layer name
	 *  deprecated at 21.1 -- use switchBasemapLayer instead
     */
	switchMapLayer: function(layerName) {
		
		if( this.map.loaded){
			this.map.removeAllLayers();
		}
		
		//if HYBRID_LAYER: 'World Imagery and Street Hybrid'	
		if( layerName == this.HYBRID_LAYER ) {
			if(license_type=='demo'){				
					var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer");
	     		this.map.addLayer(baseLayer); 	
       		
       		var placeNameLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer");
       		this.map.addLayer(placeNameLayer); 
       }
       if(license_type=='prod'){
       		var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer?appId=esriAI2010");
	     		this.map.addLayer(baseLayer); 	
       		
       		var transportationLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer?appId=esriAI2010");
       		this.map.addLayer(transportationLayer); 	
       		
       		var placeNameLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer?appId=esriAI2010");
       		this.map.addLayer(placeNameLayer); 
      }
		}
		else {
			var layerURL = this.availableMapLayerList.get(layerName);
			var newLayer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL);
     		this.map.addLayer(newLayer);
     		
     		//when the layer is onload, call this.afterLayerLoad function
     		dojo.connect(newLayer, "onLoad", this.afterLayerLoad);
		}
	},
	/*
     *  switch the BASEMAP layer
     *  @param layerName 	Required 	The new layer name
     */   	
	switchBasemapLayer: function(layerName) {
		if( this.map.loaded){
			var baseLayer = this.map.getLayer("baseLayer");
			if (valueExistsNotEmpty( baseLayer )) {
				this.map.removeLayer( baseLayer );
			}	
			var baseLabelLayer = this.map.getLayer("baseLabelLayer");
			if (valueExistsNotEmpty( baseLabelLayer )) {
				this.map.removeLayer( baseLabelLayer );
			}	
		}
		
		//if HYBRID_LAYER: 'World Imagery and Place Labels'	
		if( layerName == this.HYBRID_LAYER ) {
			if(license_type=='demo'){				
				var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {id: "baseLayer", index: 0});
	     		this.map.addLayer( baseLayer );
				this.map.reorderLayer( baseLayer, 0 );
				var baseLabelLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer", {id: "baseLabelLayer", index: 1});
				this.map.addLayer( baseLabelLayer ); 
				this.map.reorderLayer( baseLabelLayer, 1 );
				var referenceLayer = this.map.getLayer("referenceLayer");
				if (valueExistsNotEmpty( referenceLayer )) {
					this.map.reorderLayer( referenceLayer, 2 );
				}	
			}
			if(license_type=='prod'){
				var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer?appId=esriAI2010", {id: "baseLayer", index: 0});
	     		this.map.addLayer( baseLayer );
				this.map.reorderLayer( baseLayer, 0 );
				var baseLabelLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer?appId=esriAI2010", {id: "baseLayer", index: 1});
				this.map.addLayer( baseLabelLayer ); 
				this.map.reorderLayer( baseLabelLayer, 1 );
				var referenceLayer = this.map.getLayer("referenceLayer");
				if (valueExistsNotEmpty( referenceLayer )) {
					this.map.reorderLayer( referenceLayer, 2 );
				}	
			}
		}
		else {
			var layerURL = this.basemapLayerList.get(layerName);
			var baseLayer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL, {id: "baseLayer", index: 0, opacity: 1.0} );
     		this.map.addLayer( baseLayer );
     		this.map.reorderLayer( baseLayer, 0 );
			//when the layer is onload, call this.afterLayerLoad function
     		dojo.connect(baseLayer, "onLoad", mapControl.afterLayerLoad);
		}
	},
	/*
     *  switch the REFERENCE layer
     *  @param layerName 	Required 	The new layer name
     */
	switchReferenceLayer: function( layerName, visibleLayers ) {
		
		// remove existing reference layer
		if (this.map.loaded){
			//this.map.removeReferenceLayers();  //TODO
			var referenceLayer = this.map.getLayer("referenceLayer");
			if (valueExistsNotEmpty( referenceLayer )) {
				this.map.removeLayer( referenceLayer );
			}	
		}
		
		var layerURL = this.referenceLayerList.get(layerName);
		// check layerURL for layer type 
		// use layerURL + '?f=json' to retrieve info about map service as a JSON object
		// use '?f=pjson' for pretty JSON -- debugging only!
		// use &callback=methodName to reference a callback function in the URL

		dojo.io.script.get({
			url: layerURL,
			callbackParamName: "callback",
			content: {
				f: 'json'	
			},
			load: function( mapServiceJson ){
				// tiled or dynamic?				
				var isTiledMapCache = mapServiceJson.singleFusedMapCache;
				loadReferenceLayer(layerURL, isTiledMapCache);
			},
			error: function(error){
				View.alert("Error loading reference layer: " + layerName);
				console.log("Error loading reference layer: " + error);
			}
		});
		

		// load layer based on type
		function loadReferenceLayer( layerURL, isTiledMapCache ){
			var refLayer = '';
			if ( layerURL != '' && isTiledMapCache == true ) {
				refLayer = new esri.layers.ArcGISTiledMapServiceLayer( layerURL, {
					id: "referenceLayer",
					index: 10,
					opacity: "0.5"} 
				);
			} else if (  layerURL != '' && isTiledMapCache == false)  {
				refLayer = new esri.layers.ArcGISDynamicMapServiceLayer( layerURL, {
					id: "referenceLayer",
					index: 10,
					opacity: "0.5"} 
				);		
			}
			if (refLayer != '') {
				mapControl.legendLayers = [];
				mapControl.legendLayers.push({layer:refLayer, title:layerName});
				mapControl.map.addLayers( [refLayer] );
				mapControl.map.reorderLayer( refLayer, 10 );
			}
			else {
				mapControl.legendLayers = [];
				mapControl.removeReferenceLayer();
			}
			// when the layer is onload, call this.afterLayerLoad function
			dojo.connect(refLayer, "onLoad", mapControl.afterLayerLoad);
		}		
		
	},
	/*
     *  remove the REFERENCE layer
     *  @param layerName 	Required 	The layer name to be removed
     */	
	removeReferenceLayer: function() {
		if (this.map.loaded){
			var referenceLayer = this.map.getLayer("referenceLayer");
			if (valueExistsNotEmpty( referenceLayer )) {
				this.map.removeLayer( referenceLayer );
			}	
		}		
	},

	showEsriLegend: function() {
		dojo.style('esriLegendContainer', { 'display': 'block' });
		mapControl.legendDijit.refresh( mapControl.legendLayers );
	},
	
	hideEsriLegend: function() {
		dojo.style('esriLegendContainer', { 'display': 'none' });
	},
	
   	/*
     *  This is the callback function for the layer load event.
     *  check whether the layer is visible
     */
   	afterLayerLoad: function( layer ) {
		console.log( 'afterLayerLoad method...' );
		
   		//the current scale of the map
   		// var currentMapScale = mapControl.map.getScale(); // v3.1+ only
   		var currentMapScale = mapControl.map.__LOD.scale;
		console.log('Current map scale : ' + currentMapScale );
		
   		//the maximum scale under which the layer is visible
		if (valueExistsNotEmpty( layer)){
			// layerMaxScale = layer.maxScale(); // v3.1+ only
			layerScales = layer.scales;
			console.log('Max layer scale : ' + layerScales[layerScales.length-1] );
		}
   		
   		// if we are zoomed in beyond the maxScale, the layer will not be visible
		if( currentMapScale < layerScales[layerScales.length-1] ) {
   			var msg = View.getLocalizedString(mapControl.z_MESSAGE_LAYER_NOT_VISIBLE);
   			View.showMessage(msg);
   		}
		// TODO
		// if we are zoomed out beyond the minScale, the layer will not be visible
		
   	},
   	
   	/*
     *  set map extent
     *  @param xmin 	Required 	Bottom-left X-coordinate of an extent envelope.
     *  @param ymin 	Required 	Bottom-left Y-coordinate of an extent envelope.
     *  @param xmax 	Required 	Top-right X-coordinate of an extent envelope.
     *  @param ymax 	Required 	Top-right Y-coordinate of an extent envelope.
     */
   	setMapExtent: function(xmin, ymin, xmax, ymax){
   		
   		//this runner is needed to IE.  Firefox works fine without it.
   		var runner = new Ext.util.TaskRunner();
        var task = {
            run: function(){
                if (mapControl.mapInited) {
                    runner.stop(task);
                    mapControl.map.setExtent(new esri.geometry.Extent(xmin, ymin, xmax, ymax, new esri.SpatialReference({wkid: 102100})));
                }
            },
            interval: 100
        }
        runner.start(task);  
   	},
   	
   	/*
     *  add and update the DataSourceMarkerPropertyPair
     *  @param ds. The dataSource name
     *  @param markerProperty. The corresponding ArcGISMarkerProperty
     */
   	updateDataSourceMarkerPropertyPair: function(ds, markerProperty){
   	
   		if( this.getMarkerPropertyByDataSource(ds) == null ) {
	   		this.dataSourceMarkerPairs.add(ds, markerProperty);
   		}
   		else {
   			this.dataSourceMarkerPairs.replace(ds, markerProperty);
   		}
   	},
   	
   	/*
     *  remove one pair in DataSourceMarkerPropertyPair
     *  @param ds. The dataSource name
     */
   	removeDataSourceMarkerPropertyPair: function(ds){
   		this.dataSourceMarkerPairs.removeKey(ds);
   	},
   	
   	/*
     *  return the markerProperty for given ds
     *  @param ds. The dataSource name
     */
   	getMarkerPropertyByDataSource: function(ds){
   		return this.dataSourceMarkerPairs.get(ds);
   	},
   	
   	/*
     *  clear the whole map, remove all markers
     */
   	clear: function(){
		//if( mapControl.map.graphics != null ){
		if( mapControl.markerGraphicsLayer != null ){
			mapControl.markerGraphicsLayer.clear();
			//mapControl.map.graphics.clear();
		}
		if( mapControl.markerLabelGraphicsLayer != null ){
			mapControl.markerLabelGraphicsLayer.clear();
		}
   		this.dataSourceMarkerPairs.clear();
   	},
   	
   	/*
     *  the callback funtion for map's onload event
     *  @param {map} The map itself.
     */
   	afterMapLoad: function(map){
   		
   		//if( map != null && map.graphics != null ){
		if( map != null && mapControl.markerGraphicsLayer != null ){
   			mapControl.markerGraphicsLayer.clear();
			if (mapControl.markerLabelGraphicsLayer != null){
				mapControl.markerLabelGraphicsLayer.clear();
			}
			//map.graphics.clear();
			mapControl.refresh(mapControl.restrictionFromRefresh);
   		}   		
   	},
   	
   	/*
     *  refresh the map and the markers
     *  @param {restriction} Ab.view.Restriction. Optional.
     *  	This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
     */
   	refresh: function(restriction){
   		
   		//this runner is needed to IE.  Firefox works fine without it.
        var runner = new Ext.util.TaskRunner();
        var task = {
            run: function(){
            
                if (mapControl.mapInited) {
                    runner.stop(task);
                    mapControl.doRefresh(restriction);
                }
            },
            interval: 100
        }
        runner.start(task);   
 	},
 	
 	doRefresh: function(restriction){
        
   		this.restrictionFromRefresh = restriction;
   		
   		//if(this.dataSourceMarkerPairs.getCount() != 0 && this.map != null && this.map.graphics == null ){
   		if(this.dataSourceMarkerPairs.getCount() != 0 && this.map != null && this.markerGraphicsLayer == null ){
   			//When add a map to a page, cannot use it until the first layer has been added to it. 
       		//Adding a layer to the map initializes the graphics and fires the onLoad event of the map. 
       		//At this point, user can interact with the map.
 			//Need to call refresh inside the afterMapLoad function for the map's onLoad event, 
 			//because when the map is just created
 			//and if the .axvw file calls the refresh() before the onLoad happens, the map has no graphics
 			//yet to show markers.  For this situation, we need to call refresh here again.
   			dojo.connect(this.map, "onLoad", this.afterMapLoad);
   		}
   		// if( this.map != null && this.map.graphics != null ){
   		if( this.map != null && this.markerGraphicsLayer != null ){

   			//this.map.graphics.clear();
   			mapControl.markerGraphicsLayer.clear();
			mapControl.markerLabelGraphicsLayer.clear();
			
   			// Only add event handler once
   			if (!this.dojoConnectCalledInDoRefresh) {
   				this.dojoConnectCalledInDoRefresh = true;
	   			//add event handler for mouseOver and mouseOut to show infoWindow as toolTip
	   			//dojo.connect(this.map.graphics, "onMouseOver", this.graphicsMouseOverHandler);
	   			//dojo.connect(this.map.graphics, "onMouseOut", this.graphicsMouseOutHandler);
	   			//dojo.connect(this.map.graphics, "onClick", this.graphicsMouseClickHandler);
	   			dojo.connect(mapControl.markerGraphicsLayer, "onMouseOver", this.graphicsMouseOverHandler);
	   			dojo.connect(mapControl.markerGraphicsLayer, "onMouseOut", this.graphicsMouseOutHandler);
	   			dojo.connect(mapControl.markerGraphicsLayer, "onClick", this.graphicsMouseClickHandler);
		}
   			
   			//show all markers defined in the dataSourceMarkerPairs
   			this.showAllMarkers(restriction);
   		}
   	},
   	
   	/*
     *  define the graphic mouse click event call back function
     *  @param {handler} Required.  The call back function name.
     *  	
     */
   	addMouseClickEventHandler: function(handler) {
   		this.mouseClickHandler = handler;
   		this.mouseClickEnabled = true;
   	},
   	
   	/*
     *  the ESRI mouseClick event handler 
     *  This handler will call the actual call back function defined by users
     */
   	graphicsMouseClickHandler: function(evt) {
   	
   		if( mapControl.mouseClickEnabled ) {
	  		var graphic = evt.graphic;
	  		var point = new esri.geometry.Point(graphic.geometry.x, graphic.geometry.y);
	  		var title = graphic.getTitle();
	  		var attributes = graphic.attributes;
	  	
	  		//pass the info window tooltip's information out to this call back function
	  		mapControl.mouseClickHandler(title, attributes);
	  	}
	  	else {  //hide the infoWindow generated through the default mouse click event.
	  		mapControl.map.infoWindow.hide();
	  	}
	},
	
	/*
     *  the mouseOver event handler
     *  show infoWindow as toolTip
     */
	graphicsMouseOverHandler: function(evt) {
	
  		var graphic = evt.graphic;
  		var point = new esri.geometry.Point(graphic.geometry.x, graphic.geometry.y);
  		var title = graphic.getTitle();
  		var content = graphic.getContent();
  		mapControl.map.infoWindow.setTitle(title);
        mapControl.map.infoWindow.setContent(content);
        
        //mapControl.map.infoWindow.show(evt.screenPoint,mapControl.map.getInfoWindowAnchor(evt.screenPoint));
        var screenPoint = mapControl.map.toScreen( point );      
        if (title) {
			mapControl.map.infoWindow.show( screenPoint );
		}
	},
	
	/*
     *  the mouseOut event handler
     *  hide infoWindow as toolTip
     */
	graphicsMouseOutHandler: function(evt) {
		mapControl.map.infoWindow.hide();
	},
   	
   	/*
   	 * iterate over all dataSourceMarkerPairs to show all markers
   	 *  @param {restriction} Ab.view.Restriction. Optional.
     *  	This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
   	 */
   	showAllMarkers: function(restriction){
   		
   		var length = this.dataSourceMarkerPairs.getCount();
   		
   		if( length != 0 ){
   			
   			//this multipoint will hold all markers's point
	   		this.allPoints =  new esri.geometry.Multipoint(this.map.spatialReference);
	   	
	   		for (var i = 0; i < length; i++ ){
	   			var markerProperty = this.dataSourceMarkerPairs.get(i);
	   			
	   			//This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
	   			if( i == 0 ){
	   				this.showDSMarker(markerProperty, i, restriction);
	   			}
	   			else{
	   				this.showDSMarker(markerProperty, i);
	   			}
	   		}
	   		this.setMapExtentByMultiPoints();
	   	}
   	},
   	
   	/*
   	 * show markers for a certain dataSourceMarkerPair
   	 *  @param markerProperty. The markerProperty.
     *  @param index. The position in dataSourceMarkerPairs
     *  @param restriction. 
     * 		This restriction will only apply to the FIRST pair in the dataSourceMarkerPairs
     *      And it is carried over from refresh(restriction)
   	 */
   	showDSMarker: function(markerProperty, index, restrictionFromRefresh){

		//get all the parameter from markerProperty   		
   		var dataSourceName = markerProperty.dataSourceName;
   		var restriction = markerProperty.restriction;
   		var geometryFields = markerProperty.geometryFields;
		
    	var infoWindowTitleField = markerProperty.infoWindowTitleField;
     	var infoWindowAttribute = markerProperty.infoWindowAttribute;
     	
     	var symbolType = markerProperty.symbolType;
     	
     	var simpleSymbol;
     	var thematicSymbols; 
     	var showThematicSymbol = markerProperty.showThematicSymbol;
     	var thematicField;
		var thematicFieldIsNumber;
    	var thematicFieldType; 
		var thematicBuckets;
    	var thematicColors;
		var thematicNoDataClass = markerProperty.thematicNoDataClass; 
		
		var showLabels = markerProperty.showLabels; 
		
    	var dataSource = View.dataSources.get(dataSourceName);
		
		//the property for each marker
		var lat;  //Y
		var lon;  //X
		var point;
		var attributes;
		var content;
		var infoTemplate;
		var title;
		var symbol;
		var textSymbol;

		//set symbol for simple marker
		if( !showThematicSymbol ) {
			simpleSymbol = new esri.symbol.SimpleMarkerSymbol(); 
			simpleSymbol.setStyle(this.getSymbolStyle(markerProperty, symbolType));
			simpleSymbol.size = markerProperty.symbolSize;
			
       		//for simple marker, we use the predefined colors rotately for each pair in dataSourceMarkerPairs
        	var color = markerProperty.colors[index+1%markerProperty.colorNumber]; 
        	simpleSymbol.setColor(new dojo.Color(color));   
        } 
        //set symbol for thematic marker
        else{
			thematicField = markerProperty.getThematicField();
        	thematicFieldIsNumber = markerProperty.thematicFieldIsNumber;
			thematicFieldType = markerProperty.thematicFieldType;
			thematicBuckets = markerProperty.getThematicBuckets();
        	thematicColors = markerProperty.getThematicColors();
  			thematicSymbols = new Array();

        	//define symbol for each individual thematic bucket
			for (var i = 0; i <= thematicBuckets.length+2; i++) { 
				var tempSymbol = new esri.symbol.SimpleMarkerSymbol(); 
				tempSymbol.setStyle(this.getSymbolStyle(markerProperty, symbolType));
				tempSymbol.size = markerProperty.symbolSize;
				//for thematic marker, we use the predefined colors rotately for thematic bucket
				var color = thematicColors[i];
				tempSymbol.setColor(new dojo.Color(color));
				thematicSymbols[i] = tempSymbol;
			}
        }

		//set restriction
		var finalRestriction;
		if(restrictionFromRefresh != null) {
			finalRestriction = restrictionFromRefresh;
		}
		else{
			finalRestriction = restriction;
		}
		
		//get records from dataSource
		var records = this.getDataSourceRecords(dataSourceName, finalRestriction);
			
		//set markers, tooltip
     	for (var i = 0; i < records.length; i++) {
     	
          	lat = records[i].getValue(geometryFields[0]); // TODO : Can we alwaysassume lon (x) will be the SECOND geometry field???
          	lon = records[i].getValue(geometryFields[1]); 
          	
          	//create marker only if the geometry field is not null
          	if( lat != null && lon != null && lat.length != 0 && lon.length != 0) {
          	
          		attributes = new Object();
          		
          		//create infoTemplate for each marker
          		infoTemplate = new esri.InfoTemplate();
          		content = "";

          		//set info template, tooltip
          	 	for(var j = 0; j < infoWindowAttribute.length; j++) {
          	 		var fieldId = infoWindowAttribute[j];
          	 		var fieldTitle = this.getFieldTitle(dataSourceName, fieldId);
          	 		
          	 		var value = records[i].getValue(fieldId);
          			attributes[fieldId] = value; 	
          			
          			var localizedValue = dataSource.formatValue(fieldId, value, true);
             			
          			content += "<b>" + fieldTitle + ":</b> " + localizedValue;
          			if( j != infoWindowAttribute.length - 1 ) {
          				content += "<br />";
          			}
          		}

          		title = records[i].getValue(infoWindowTitleField);
          		infoTemplate.setTitle(title);
          		infoTemplate.setContent(content);
          		
          		//add marker itself to map
          	 	point = new esri.geometry.Point(lon, lat, new esri.SpatialReference({ wkid: 102100 }));
          	 	// convert geometry from lat/lon to Web Mercator coordinate system          	  
            	point = esri.geometry.geographicToWebMercator(point);
          	 	
          	 	this.allPoints.addPoint(point);

          	 	if( !showThematicSymbol ) {
          	 		symbol = simpleSymbol;
          	 	}
				else if ( !thematicFieldIsNumber ) { 
					// thematic field is string
					var thematicValue = records[i].getValue(thematicField);
					// determine the proper symbol 
					var index = thematicBuckets.indexOf( thematicValue ); 
					symbol = thematicSymbols[index];
				}
          	 	else{ 
					// thematic value is number (integer or numeric)
          	 		var thematicValue = records[i].getValue(thematicField);
          	 		
          	 		//find the right bucket and set the symbol
          	 		//e.g. 	if thematicBuckets has 3 values: 10, 20, 30
          	 		//		then there are 5 actual buckets
          	 		//		1:  value = 0
					//		2:  0 < value < 10
          	 		//		3:  10 <= value < 20
          	 		//		4:  20 <= value < 30
          	 		//		5:  30 <= value 
          	 		
					if ( thematicValue == 0 || thematicValue == ""){
						if (thematicNoDataClass) {
							symbol = thematicSymbols[0];
						}
						else {
							symbol = thematicSymbols[1];																	
						}
					}
					else if (thematicValue < thematicBuckets[0]) {
						symbol = thematicSymbols[1];
					}
					else if (thematicValue >= thematicBuckets[thematicBuckets.length-1] ){
						symbol = thematicSymbols[thematicBuckets.length+1];
					}
					else {
          	 			for (var j = 0; j < thematicBuckets.length-1; j++) {
          	 				if(thematicValue >= thematicBuckets[j] && thematicValue < thematicBuckets[j+1] ){
          	 					symbol = thematicSymbols[j+2]; 
          	 				}
          	 			}					
					}
					
          	 	}//end else 
          	 	
          	 	//this.map.graphics.add(new esri.Graphic(point, symbol, attributes, infoTemplate)); 
				mapControl.markerGraphicsLayer.add(new esri.Graphic(point, symbol, attributes, infoTemplate));
				
            	//add corresponding text graphic
            	if ( showLabels == true ) { 
					textSymbol = new esri.symbol.TextSymbol(title, new esri.symbol.Font().setWeight(this.textSymbolFont), new dojo.Color(this.textSymbolColor)); 
					//this.map.graphics.add(new esri.Graphic(point, textSymbol.setOffset(0, 8)));
					mapControl.markerLabelGraphicsLayer.add(new esri.Graphic(point, textSymbol.setOffset(0, 8)));
				}
            }//end if( lat != null && lon != null & lat.length != 0 && lon.length != 0) 
   		}//end for (var i = 0; i < records.length; i++)
	},
  	
   	/**
   	 * 	get the actual field title 
   	 *  @param dataSourceName. The data source.
     *  @param fieldName. bl.bl_id
   	 */
   	getFieldTitle: function(dataSourceName, fieldName) {
   		var ds = View.dataSources.get(dataSourceName);
   		var items = ds.fieldDefs.items;
   		
   		for(var i = 0; i < items.length; i++) {
   			var item = items[i];
   			var id = item.id;
   			if( fieldName == id ) {
   				return item.title;
   			}
   		}
   		
   		return "";
   	},
   	
   	/**
   	 * 	get ESRI ArcGIS marker symbol
   	 *  @param markerProperty. The markerProperty.
     *  @param style. The marker style definend in markerProperty.
     *  @return. ESRI ArcGIS marker symbol
   	 */
   	getSymbolStyle: function(markerProperty, style){
   	
   		switch (style)
		{
			case markerProperty.SYMBOLTYPE_CIRCLE:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE;
  			break;
			case markerProperty.SYMBOLTYPE_CROSS:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_CROSS;
  			break;
  			case markerProperty.SYMBOLTYPE_DIAMOND:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND;
  			break;
  			case markerProperty.SYMBOLTYPE_SQUARE:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE;
  			break;
  			case markerProperty.SYMBOLTYPE_X:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_X;
  			break;
			default:
  				return esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE;
		}
   	},   	
   	
   	/*
   	 * set the map extent based on the extent of all markers
   	 */
   	setMapExtentByMultiPoints: function(){
   		if( this.allPoints.points.length > 1 ) {
   			var pointsExtent = this.allPoints.getExtent();
   			var mapExtent;
   			mapExtent = pointsExtent.expand(1.5);
   			this.map.setExtent(mapExtent);
   		}
   		else if (this.allPoints.points.length == 1 ){
   			var onePoint = new esri.geometry.Point( this.allPoints.points[0][0], this.allPoints.points[0][1], this.map.spatialReference );
   			this.map.centerAndZoom( onePoint, this.autoZoomLevelLimit );
   		}
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
	 *  remove thematic legend
	 */
	removeThematicLegend: function(){
		if( this.thematicLegend != null ){
   			// remove legend DOM element if exists
	        var legendDiv = Ext.get('legend_div');
	        if (legendDiv != null) {
	            legendDiv.remove();
	        }
			this.thematicLegend = null;
		}
	},
 	
   	/**
   	 * 	create thematic legend as an ext.window
   	 *  @param markerProperty. The ArcGISMarkerProperty associated with thematic markers.
   	 */
   	buildThematicLegend: function(markerProperty) {
        
        //create legend if not exist
        if( this.thematicLegend == null ){
   		
   			// remove legend DOM element if exists
	        var legendDiv = Ext.get('legend_div');
	        if (legendDiv != null) {
	            legendDiv.remove();
	        }
	        
	        // create new legend DIV
	        var htmlDiv = '<div id="legend_div" class="x-hidden"></div>';
	        Ext.DomHelper.insertHtml('afterBegin', document.body, htmlDiv);
   		
   			//
   			//create legend
   			//
			var topY = Ext.fly(this.panelId).getTop(false); 
			var topX = Ext.fly(this.panelId).getRight(false)-250;
			
			var title = this.getFieldTitle(markerProperty.dataSourceName,  markerProperty.thematicField);
			var thematicBuckets = markerProperty.getThematicBuckets();
			var thematicColors = markerProperty.getThematicColors();
			var thematicFieldIsNumber = markerProperty.thematicFieldIsNumber;
			var thematicFieldType = markerProperty.thematicFieldType;
			var thematicNoDataClass = markerProperty.thematicNoDataClass;
		
	    	//define the width and height for the legend
	    	var height = 125;
	    	var width = 250;
	    	
			if( thematicNoDataClass && thematicFieldIsNumber ){
				height = 23 * (thematicColors.length + 1);
			}
			else {
				height = 23 * (thematicColors.length) ;
			}
	    
	    	//build a html table based on the thematicBuckets and the thematicColors
	        var htmlBody = "<table style='font-size:11; font-weight:bold; color:blue; font-family: Verdana, Arial, Helvetica, sans-serif'>";
	        
			if (thematicFieldIsNumber) {
				// if thematic field is number we need 2 additional thematic buckets
				for (var i=0; i<thematicBuckets.length+2; i++) {
					//convert RGB color to hex color
					var RGBColor = thematicColors[i];
					var hexColor = this.RGBtoHex(RGBColor[0], RGBColor[1], RGBColor[2]);
					if (i==0) {
						if (thematicNoDataClass) {
							htmlBody += "<tr><td style='background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
							htmlBody += "&nbsp;0&nbsp;" + "</td></tr>";
							htmlBody += "<tr height=3></tr>";
						}
					}
					else if (i==1) {
						htmlBody += "<tr><td style='background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
						if (thematicNoDataClass) {
							htmlBody += "&nbsp;1&nbsp;-&nbsp;" + insertGroupingSeparator((thematicBuckets[i-1]-1)+"", true, true) + "</td></tr>";
						}
						else {
							htmlBody += "&nbsp;&lt;&nbsp;" + insertGroupingSeparator(thematicBuckets[i-1]+"", true, true) + "</td></tr>";
						}
						htmlBody += "<tr height=3></tr>";
					}
					else if (i==thematicBuckets.length+1) {
						htmlBody += "<tr><td style='background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
						htmlBody += "&nbsp;" + insertGroupingSeparator(thematicBuckets[i-2]+"", true, true) + " +" + "</td></tr>";
					}
					else {
						htmlBody += "<tr><td style='background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
						htmlBody += "&nbsp;" + insertGroupingSeparator(thematicBuckets[i-2]+"", true, true) + "&nbsp;-&nbsp;" + insertGroupingSeparator((thematicBuckets[i-1]-1)+"", true, true) + "</td></tr>";
						htmlBody += "<tr height=3></tr>";
					}
				}
			} else {
				// if thematic field is character 
				for (var i=0; i<thematicBuckets.length; i++) {
					//convert RGB color to hex color
					var RGBColor = thematicColors[i];
					var hexColor = this.RGBtoHex(RGBColor[0], RGBColor[1], RGBColor[2]);
					if (i==0) {
						if (thematicNoDataClass && thematicBuckets[i] == "") {
							htmlBody += "<tr><td style='filter:alpha(opacity=90); opacity: 0.90; background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
							htmlBody += "no&nbsp;data&nbsp;" + "</td></tr>";
							htmlBody += "<tr height=3></tr>";
						}
						else
						{
							htmlBody += "<tr><td style='filter:alpha(opacity=90); opacity: 0.90; background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
							htmlBody += insertGroupingSeparator(thematicBuckets[i]+"", true, true) + "</td></tr>";
							htmlBody += "<tr height=3></tr>";						
						}
					}
					else {					
						htmlBody += "<tr><td style='filter:alpha(opacity=90); opacity: 0.90; background-color:#" + hexColor +"'>&nbsp;&nbsp;&nbsp;</td><td>";
						htmlBody += insertGroupingSeparator(thematicBuckets[i]+"", true, true) + "</td></tr>";
						htmlBody += "<tr height=3></tr>";						
					}
					if(i < thematicBuckets.length){
						htmlBody += "<tr height=3></tr>";
					}
				} 			
			}
			htmlBody += "</table>";
	        
	        //create the legend as ext.window 
	        this.thematicLegend = new Ext.Window({
	        	el: 'legend_div',
	        	layout: 'fit',
				x: topX,
				y: topY,
	            height: height,
	            width: width,
	            modal: false,
	            shadow: false,
	            autoScroll: true,
	            closable: true,
	            html: htmlBody,
	            title: title,
	            collapsible: true
	        });
	        
	        this.thematicLegend.show();
        }
    },
	
	RGBtoHex: function(R,G,B) {
		return this.toHex(R) + this.toHex(G) + this.toHex(B)
	},
	
	toHex: function(N) {
 		if (N==null) return "00";
 		N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 		N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 		return "0123456789ABCDEF".charAt((N-N%16)/16) + "0123456789ABCDEF".charAt(N%16);
	}

});

/*
 *   This class define common properties for a group of markers 
 */ 

Ab.arcgis.ArcGISMarkerProperty = Base.extend({  	


	//the predefined symbol type
	SYMBOLTYPE_CIRCLE: 'circle', // default
	SYMBOLTYPE_CROSS: 'cross', 
	SYMBOLTYPE_DIAMOND: 'diamond', 
	SYMBOLTYPE_SQUARE: 'square', 
	SYMBOLTYPE_X: 'x', 
	
	//the symbol type of the markers
	symbolType: null, 
	//the symbol size of the markers
	symbolSize: 15,
	
	//the predefined symbol color (original)
	/* colors: [ 	[255,0,0,0.75],   //default
				[165,42,42,0.75],
				[191,62,255,0.75],
				[30,144,255,0.75],
				[69,139,116,0.75],
				[0,0,255,0.75],
				[205,127,50,0.75],
				[255,127,36,0.75],
				[124,252,0,0.75],
				[255,140,0,0.75]	
			],
	*/
	
	// symbol colors ( qualitative 10 )
	//
	 colors: [ 	[140, 140, 140, 0.9],
	            [227, 26, 28, 0.9],   //default
				[31, 120, 180, 0.9],
				[51, 160, 44, 0.9],
				[255, 127, 0, 0.9],
				[106, 61, 154, 0.9],
				[251, 154, 153, 0.9],
				[166, 206, 227, 0.9],
				[178, 223, 138, 0.9],
				[253, 191, 111, 0.9],
				[202, 178, 214, 0.9]	
			],
	
	
	// symbol colors ( sequential 5 )
	/* colors: [   [140, 140, 140, 0.9],
				[255,255,178,0.9],
				[254,204,92,0.9],
				[253,141,60,0.9],
				[240,59,32,0.9],
				[189,0,38,0.9]    
			],
	*/
	
	// symbol colors ( diverging 3 )
	/*colors: [ [140, 140, 140, 0.9],
			  [26,150,65,0.9],
			  [255,255,191],
			  [215,25,28]
			],*/
	
	
	//the available number of colors
	colorNumber: null,

	//the dataSource associated with markers
	dataSourceName: null,
	
	//fields defined in dataSource
	infoWindowTitleField: null,
	infoWindowAttribute: null,
	geometryFields:null,

	//text label properties 
	showLabels: true,
	
	//thematic marker properties
	showThematicSymbol: false,
	thematicField: null,
	thematicFieldIsNumber: null,
	thematicFieldType: null,
	thematicBuckets: null,
	thematicColors: null,
	// distinct symbol class for no data value?
	thematicNoDataClass: false,
	
	//the restriction set for dataSource
	restriction: null,

	/*
     *  constructor
     *  @param dataSourceNameParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param infoWindowTitleFieldParam. The data field which defines infoWindow Title.
     *  @param infoWindowAttributeParam.  The data Fields which define attributes for infoWindow 
     */
	constructor: function(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam) {
    	
    	this.dataSourceName = dataSourceNameParam;
    	this.geometryFields = geometryFieldsParam;
    	this.infoWindowTitleField = infoWindowTitleFieldParam;
    	this.infoWindowAttribute = infoWindowAttributeParam;
    	
    	this.colorNumber = this.colors.length;
    	
    	this.symbolType = this.SYMBOLTYPE_CIRCLE;
    },
    
    /*
     *  set restriction for dataSource
     *  @param restrictionParam. The restriction.
     */  
    setRestriction: function(restrictionParam) {
    	this.restriction = restrictionParam;
    },
    
    /*
     *  set symbol for the marker.  Both for simple and for thematic symbol.
     *	@param symbolTypeParam. Required.  Options are "circle", "square", "diamond", "cross", and "x"
     */
    setSymbolType: function(symbolTypeParam) {
    	this.symbolType = symbolTypeParam;
    },
    
    /*
     *  set thematic property for the marker.  
     *	@param thematicFieldParam. The value in whice decides which thematic bucket the marker belongs to.
     *  @param thematicBucketsParam.  The arrary which holds the thematic buckets values.  
     *          e.g [10, 20, 30], if the value is 11, then it belongs to the buckets between 10 and 20.
     */
    setThematic: function(thematicFieldParam, thematicBucketsParam) {
    	this.showThematicSymbol = true;
		this.thematicField = thematicFieldParam;
		var ds = View.dataSources.get(this.dataSourceName);
		
		this.thematicFieldIsNumber = ds.fieldDefs.get(this.thematicField).isNumber();	
		this.thematicFieldType = ds.fieldDefs.get(this.thematicField).type;
		this.thematicBuckets = thematicBucketsParam;
		
		if(!this.thematicFieldIsNumber){
   			// get count
   			this.thematicBuckets = this.getDistinctFieldValues(this.thematicField);	
   		}
   		// if there are more buckets than colors, generate more colors
		if (this.colors.length < this.thematicBuckets.length){
			// generate more colors
			var colorsNeeded = this.thematicBuckets.length-this.colors.length;
			for (var x=0; x<colorsNeeded; x++){
				this.colors.push(this.generateRandomColor());					
			}
			this.colorNumber = this.colors.length;
		}    	
    	this.thematicColors = new Array();
    	//define color for each individual thematic bucket
		for (var i = 0; i <= this.thematicBuckets.length+2; i++) { 
        	//for thematic marker, we use the predefined colors rotately for thematic bucket
        	this.thematicColors[i] = this.colors[i%this.colorNumber];	
        }
    },

	
	/*
     *
     *  get functions
     *
     */ 
    getThematicField: function() {
    	return this.thematicField;
    },
    
    getThematicBuckets: function() {
    	return this.thematicBuckets;
    },
    
    getThematicColors: function() {
    	return this.thematicColors;
    },
	
	getDistinctFieldValues: function(field){
    	var values = [];
    	try {
    		var temp = field.split(".");
    		var table = temp[0];
    		var parameters = {
    			tableName: table,
    			fieldNames: toJSON([field]),
     			sortValues: toJSON([{'fieldName': field, 'sortOrder':1}]), 
     			recordLimit: 0,  		
    			isDistinct: true
    		};
  
    		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    		var rows = result.data.records;
    		for(var i=0; i<rows.length; i++){
    			values.push(rows[i][field]);
    		}
    		return values;
    	} catch (e) {
    		Workflow.handleError(e);
    	}
    	return values;
    }, 
    
    generateRandomColor: function(){
    	return [this.generateRandomNumber(255), this.generateRandomNumber(255), this.generateRandomNumber(255), 0, 75];   	   	
    },
    
    generateRandomNumber: function(n){
    	return (Math.floor (Math.random() * n) );
    }
	
});
