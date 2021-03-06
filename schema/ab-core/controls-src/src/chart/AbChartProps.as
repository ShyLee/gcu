package chart
{		
	public class AbChartProps{		
		import com.adobe.serialization.json.JSON;
		import mx.collections.ArrayCollection;
		
		// define the default chart type - pieChart
		public static const CHARTTYPE_DEFAULT:String = "pieChart"; // default
		public static const CHARTTYPE_STACKEDAREA:String = "stackedAreaChart"; 
		public static const CHARTTYPE_STACKEDBAR:String = "stackedBarChart"; 
        
		// define the default legend locations - right
		public static const LEGENDLOC_DEFAULT:String  = "right";
		
		// define the supported data fill types as constants
		public static const FILLTYPE_SOLID:String  = "solid";    //default
		public static const FILLTYPE_LINEARGRADIENT:String  = "linearGradient";
		public static const FILLTYPE_RADIALGRADIENT:String  = "radialGradient";
		
		//		  Normal  Desaturated
		//Brown   CC9900  CCB87E
		//Green   99CC33  BDCC9F
		//Blue    3399CC  9CBCCC
		//GOchre  CCCC99  CCCCB9
		//DBlue   6699CC  ACBCCC
		//Red     FF6633  FFAF95
		//Cyan    99CCCC  BDCCCC
		//LGreen  CCFF99  E9FFD4
		//YOchre  FFCC00  FFEB9D
		//DGreen  66CC00  B5CC9E

		//color for data series
		public static const NORMAL_COLOR:Array = 
					["0xCC9900", "0x99CC33", "0x3399CC", "0xCCCC99", "0x6699CC", 
					 "0xFF6633", "0x99CCCC", "0xCCFF99", "0xFFCC00", "0x66CC00"];

		//color for gradient
		public static const DESATURATED_COLOR:Array = 
					["0xCCB87E", "0xBDCC9F", "0x9CBCCC", "0xCCCCB9", "0xACBCCC", 
					 "0xFFAF95", "0xBDCCCC", "0xE9FFD4", "0xFFEB9D", "0xB5CC9E"];
		
		/* new colors - rolled back
		public static const NORMAL_COLOR:Array = ['0x5380A3', '0x87A9D4', '0xAFC5E2', '0xC9D5E4', '0xE3E9F1', '0xD6E2F0', '0x3C5E67', '0x5B8D9B', '0x7CB6C6', '0xAFD3DC', '0xCAE1E8', '0xE4F0F3', '0x463D51', '0x695C7A', '0x8D7CA2', 
                        	 '0x9C98B7', '0xBAB0C7', '0x56613E', '0x81925E', '0xA7BB80', '0xCAD6B2', '0xDBE3CB', '0xEDF1E5', '0x633D3C', '0x955C5A', '0xC07C7B', '0xD9B0AF', '0xE5CAC9', '0xF2E4E4', '0xF2A663', 
                        	 '0xDFB670', '0xF3C166', '0xF2DB98', '0xFFFFC4'] ;


		//color for gradient
		public static const DESATURATED_COLOR:Array = ['0x8B98A3', '0xBCC7D4', '0xD2D9E2', '0xDBDFE4', '0xECEEF1', '0xE8EBF0', '0x5A6467', '0x87969B', '0xAFC1C6', '0xCED9DC', '0xDFE5E8', '0xEEF2F3', '0x4D4B51', '0x74717A',
                             '0x9B96A2', '0xAEADB7', '0xC3C0C7', '0x5D6156', '0x8C9282', '0xB5BBA9', '0xD2D6CB', '0xE0E3DB', '0xEFF1ED', '0x635757', '0x958383', '0xC0ABAB', '0xD9CCCC', '0xE5DCDC', '0xF2EDED', '0xF2DBC7',
                             '0xDFD2BD', '0xF3E4C8', '0xF2EBD7', '0xFFFFED'];
		*/


		// the panel's id passed from the view
		public var panelId: String = "";

		/**
	     * The title for the chart control, usually displays at the top of the flash control panel
	     * @type String.
	     * @public
	     */
	    public var title: String =  "";
	
	    /**
	     * define the type for the chart control
	     * @type String. the values are 'pieChart', 'lineChart', 'columnChart', 'barChart', 'stackedBarChart', 'stackedAreaChart', 'columnLineChart'               
	     * @public
	     */
	    public var type: String = AbChartProps.CHARTTYPE_DEFAULT;
	    
	
		/**
		  * define if we want to show the legend when we load the chart.<b> 
	      * @type Boolean
	      * @public
	      */
	    public var showLegendOnLoad: Boolean = true;
	    
	    /**
		  * define if we want to show the legend as pop up when we load the chart.<b> 
	      * @type Boolean
	      * @public
	      */
	    public var showLegendAsPopUp: Boolean = false;
	          
	    /**
		 * define the position we want to show the legend when loading the chart.
	     * @type String. the values are 'right', 'left', 'top', 'bottom'
	     * @public
	     */
	    public var legendLocation: String = AbChartProps.LEGENDLOC_DEFAULT;
	    
	    /**
		 * define if we want to show the dataTip when user places the mouse on the chart data
	     * @type Boolean
	     * @public
	     */
	    public var showDataTips: Boolean = true;
	       	 

	    /**
		 * define if we want to show all the available dataTip info when user places the mouse on the chart data and showDataTips="true"
	     * @type Boolean
	     * @public
	     */
	    public var showAllDataTips: Boolean = false;

	     /**
		 * define the rgb color in hex format for the chart background. Default is white.
	     * @type String
	     * @public
	     */
	    public var backgroundColor: String = "FFFFFF";
	
	    /**
		 * define the rgb color in hex format for the chart's data.
		 * fillColor is used as custom colors for solid and first set of gradient colors.
		 * fillColorDesaturated  is used as second set of gradient colors.
	     * @type Array
	     * @public
	     */
	    public var fillColor:Array = new Array();
	    public var fillColorDesaturated:Array = new Array();

	    /**
		 * define how the color is filled into the chart.
	     * @type String. The values are 'solid', 'linearGradient', 'radialGradient'
	     * @public
	     */
	    public var fillType: String = AbChartProps.FILLTYPE_SOLID;
		
	    /** 
	     * define where in the chart the color starts the transition to the next color. The parameter corresponds to "ratio" value of Flex chart
	     * @type numeric. The value is a decimal number between 0.0 to 1
	     * @public
	     */
	    public var percentGradientChange: Number = 1.0;
	    
	    /** 
	     * define the level of the color transparency in the chart. The parameter corresponds to "alpha" value of Flex chart
	     * @type numeric. The value is a decimal number between 0.0 to 1
	     * @public
	     */
	    public var percentTransparency: Number = 1.0;
	    
	    
	    /**
	     * define the grouping axis (Flex's category Axis)
	     * @type ChartAxis
	     * @public
	     */
	    public var groupingAxis:Object = null;
	    
	    /**
	     * define the secondary grouping axis (for chart of one calculated fields summarized by two groups)
	     * @type ChartAxis
	     * @public
	     */
	    public var secondaryGroupingAxis:Object = null;
	    
	    /**
	     * define the data axis collections for chart control
	     * @type Ext.util.MixedCollection of Ab.chart.ChartDataAxis objects 
	     * @public
	     */
	    public var dataAxis: Array =  null;
	    
	    
	    /** 
	     * define the panel events defined in the view, such as onClick etc.
	     * @type JSON array.
	     * @public
	     */
	    public var events: Array = null;
	    
	    /**
	     * define the JSON data returned from server to populate the chart
	     * @type JSON string
	     * @public
	     */
	    public var data: Array = null;
	    
	    /**
	     * define the panel's field defs information
	     * @type JSON String
	     * @public
	     */
	    public var fieldDefs: Array = null;
	    	    
	    /**
	     * show the data axis title if true, false otherwise.
	     */ 
		public var showDataAxisTitle:Boolean = true;
		
	    /**
	     * show the grouping axis title if true, false otherwise.
	     */ 
		public var showGroupingAxisTitle:Boolean = true;
		
	    /**
	     * the data axis title to be displayed when the showDataAxisTitle is true.
	     */ 
		public var dataAxisTitle:String = "";

	    private var _arrConfigObj:Object = null;
		
	    public function AbChartProps(chartConfigObj:String){
			// get the config object from the AFM view through javascript
			_arrConfigObj = JSON.decode(chartConfigObj);

			if(_arrConfigObj.hasOwnProperty("panelId"))
				this.title = _arrConfigObj.panelId;
				
			if(_arrConfigObj.hasOwnProperty("title"))
				this.title = _arrConfigObj.title;
			
			if(_arrConfigObj.hasOwnProperty("controlType"))
				this.type = _arrConfigObj.controlType;

			if(_arrConfigObj.hasOwnProperty("showLegendOnLoad"))
				this.showLegendOnLoad = _arrConfigObj.showLegendOnLoad;

			if(_arrConfigObj.hasOwnProperty("showLegendAsPopUp"))
				this.showLegendAsPopUp = _arrConfigObj.showLegendAsPopUp;

			if(_arrConfigObj.hasOwnProperty("legendLocation"))
				this.legendLocation = _arrConfigObj.legendLocation;
				
	    	if(_arrConfigObj.hasOwnProperty("showDataTips"))
				this.showDataTips = _arrConfigObj.showDataTips;
		
			if(_arrConfigObj.hasOwnProperty("showAllDataTips"))
				this.showAllDataTips = _arrConfigObj.showAllDataTips;
		
	    	if(_arrConfigObj.hasOwnProperty("backgroundColor"))
				this.backgroundColor = _arrConfigObj.backgroundColor;
	        
	   	 	if(_arrConfigObj.hasOwnProperty("fillColor")){
	   	 		var fillColorArray:Array = _arrConfigObj["fillColor"];
				if(fillColorArray.length > 0)
					this.fillColor = _arrConfigObj.fillColor;
				else
					this.fillColor = AbChartProps.NORMAL_COLOR;
			}else
				this.fillColor = AbChartProps.NORMAL_COLOR;
			
			
	   	 	if(_arrConfigObj.hasOwnProperty("fillColorDesaturated")){
	   	 		var fillColorDesaturatedArray:Array = _arrConfigObj["fillColorDesaturated"];
				if(fillColorDesaturatedArray.length > 0)
					this.fillColorDesaturated = _arrConfigObj.fillColorDesaturated;
				else
					this.fillColorDesaturated = AbChartProps.DESATURATED_COLOR;
			}else
				this.fillColor = AbChartProps.DESATURATED_COLOR;

	     	if(_arrConfigObj.hasOwnProperty("fillType"))
				this.fillType = _arrConfigObj.fillType;
	    
	     	if(this.fillType != AbChartProps.FILLTYPE_SOLID && _arrConfigObj.hasOwnProperty("percentGradientChange"))
				this.percentGradientChange = Number(_arrConfigObj.percentGradientChange);
			else 
				this.percentGradientChange = 1.0;
				
	   	 	if(this.fillType != AbChartProps.FILLTYPE_SOLID && _arrConfigObj.hasOwnProperty("percentTransparency"))
				this.percentTransparency = Number(_arrConfigObj.percentTransparency);
	    	else
	    		this.percentTransparency = 1.0;
			
	   	 	if(_arrConfigObj.hasOwnProperty("events"))
				this.events = _arrConfigObj.events;
	    
	   	 	if(_arrConfigObj.hasOwnProperty("groupingAxis")){
				var arrGroupingAxis:Array = _arrConfigObj["groupingAxis"];
				// the chart will have 1 and only 1 grouping axis
				if(arrGroupingAxis.length>0)
					this.groupingAxis = arrGroupingAxis[0];
	   	 	}
	   	 	
	     	if(_arrConfigObj.hasOwnProperty("secondaryGroupingAxis")){
				var arrSecondaryGroupingAxis:Array = _arrConfigObj["secondaryGroupingAxis"];
				// the chart will have at most 1 secondary grouping axis
				if(arrSecondaryGroupingAxis.length>0)
					this.secondaryGroupingAxis = arrSecondaryGroupingAxis[0];
	   	 	}
	    
	     	if(_arrConfigObj.hasOwnProperty("dataAxis")){
				var arrDataAxis:Array = _arrConfigObj["dataAxis"];
				if(arrDataAxis.length>0)
					this.dataAxis = arrDataAxis;
	     	}
	     	
	     	if(_arrConfigObj.hasOwnProperty("events")){
				var arrEvents:Array = _arrConfigObj["events"];
				if(arrEvents.length>0)
					this.events = arrEvents;
	     	}
	     	
	   	 	if(_arrConfigObj.hasOwnProperty("fieldDefs"))
				this.fieldDefs = _arrConfigObj["fieldDefs"];

			if(_arrConfigObj.hasOwnProperty("showDataAxisTitle"))
				this.showDataAxisTitle = _arrConfigObj.showDataAxisTitle;
		
			if(_arrConfigObj.hasOwnProperty("showGroupingAxisTitle"))
				this.showGroupingAxisTitle = _arrConfigObj.showGroupingAxisTitle;
			
			if(_arrConfigObj.hasOwnProperty("dataAxisTitle")){
				this.dataAxisTitle = _arrConfigObj.dataAxisTitle;
				
			}
				    
		}
		
		// set the chart data (dataProvider) from WFR through javascript
		public function setChartData(chartData:String):void{
			this.data = (JSON.decode(chartData) as Array);
		}
		
		// private functions that are used internally
		
	}
}