/**
 * Based on d3 JS library to handle Ab.svg.DrawingControl.
 * 
 */
Ab.namespace('svg');

(function(){

	Ab.svg.DrawingControl = {version: '1.0.0'};
	
	/**
	 * Gets svg xml from server-side by specified parameters.
	 */
	Ab.svg.DrawingControl.get = function (parameters){
		var pkeyValues = {};
		if(typeof(parameters.pkeyValues) != 'undefined' && parameters.pkeyValues != null){
			pkeyValues = parameters.pkeyValues;
		}
		var plan_type = null;
		if(typeof(parameters.plan_type) != 'undefined' && parameters.plan_type != null){
			plan_type = parameters.plan_type;
		}
		var highlightParameters = [];
		if(typeof(parameters.highlightParameters) != 'undefined' && parameters.highlightParameters != null){
			highlightParameters = parameters.highlightParameters;
		}
		
		var result = null;
		DrawingSvgService.highlightSvgDrawing(pkeyValues, plan_type, highlightParameters, {
				async: false,
				callback: function(xml) {
					result = xml;
				},
				errorHandler: function(m, e) {
					console.log('Fail to load required svg drawing: ' + m);
				}
		});
	
	   return result;
	};
	
	/**
	 * Gets and displays SVG 
	 * containerID: the id of <div> to display SVG
	 * parameters: server-side required info such as as bl_id, fl_id, viewName, highlight and label dataSource names to get and process corresponding SVG
	 */
	Ab.svg.DrawingControl.load  = function (svgDivId, parameters){
		var svgText  = Ab.svg.DrawingControl.get(parameters);
		d3.select("#" + svgDivId).node().innerHTML = (svgText) ? svgText : '<div style="text-align: center; color: #66b3ff;">No drawing contents found</div>';
	};
	
	
	/**
	 * Enables SVG's mouse wheel zooming and mouse panning features.
	 * 
	 */
	Ab.svg.DrawingControl.zoomPan = function(){
		 var viewer = d3.select("#viewer");
		 viewer.on('mouseup', function(){ viewer.style('cursor', 'default');});
		 viewer.call(d3.behavior.zoom()
			 .on("zoom", function() {
				 if(d3.event.sourceEvent.type  === 'mousemove'){
					 viewer.style('cursor', 'move');
				 } 
				viewer.attr("transform", "translate(" +  d3.event.translate + ")scale(" + d3.event.scale + ")");
			 })
		 )
		 .on("dblclick.zoom", null);
	};
	
	/**
	 * Adds JS events to highlighted assets and labels.
	 */
	Ab.svg.DrawingControl.addEventHandlers = function(eventHandlers){
		for(var i=0; i<eventHandlers.length; i++ ){
			var eventHandler = eventHandlers[i];
			addEvent2HighlightedAssets(eventHandler);
			addEvent2HighlightedLabels(eventHandler);
		}
	};
	
	/**
	 * Private.
	 * Adds JS event to highlighted Assets.
	 */
	addEvent2HighlightedAssets = function(eventHandler){
		var eventName = getClickEventName();
		d3.select("#" + eventHandler.assetType + "-assets").selectAll("path")
		.each(function () {
			addEvent2HighlightedAsset(this, eventHandler, eventName);
		});
		
		d3.select("#" + eventHandler.assetType + "-assets").selectAll("use")
		.each(function () {
			addEvent2HighlightedAsset(this, eventHandler, eventName);
		});
	};
	
	/**
	 * Private.
	 * Adds JS event to highlighted individual Asset.
	 */
	addEvent2HighlightedAsset = function(self, eventHandler, eventName){
		var asset = d3.select(self);
		var assetId = self.id;
		
		//XXX:  highlighted assets have attribute highlighted="true"
		if(asset.attr('highlighted') === 'true' ){
			asset.on(eventName, function(){
				if(eventHandler.handler){
					var position = getClickElementPosition(asset);
					eventHandler.handler(retrieveValidAssetId(assetId), position);
				}
			});
		}
	};
	
	/**
	 * Private.
	 * Adds JS event to highlighted labels.
	 */
	function addEvent2HighlightedLabels(eventHandler){
		var eventName = getClickEventName();
		var prefix = 'l-' + eventHandler.assetType + '-';
		d3.select("#" + eventHandler.assetType + "-labels").selectAll("g")
			.each(function(){
				addEvent2HighlightedLabel(this, prefix, eventHandler, eventName);
			});
	};
	
	/**
	 * Private.
	 * Adds JS event to highlighted individual label.
	 */
	function addEvent2HighlightedLabel(self, prefix, eventHandler, eventName){
		var assetLabel = d3.select(self);
		var assetLabelId = self.id;
		var assetId = assetLabelId.substring(assetLabelId.indexOf(prefix) + prefix.length);
		var asset = getAssetById(assetId);
		
		//XXX:  highlighted asset labels have attribute highlighted="true"
		if(asset != null && asset.attr('highlighted') === 'true' && assetLabel.attr('highlighted') === 'true' ){
			d3.select(self).selectAll("text")
				.each(function(){
					var text = d3.select(self);
					text.on(eventName, function(){
						if(eventHandler.handler){
							var position = getClickElementPosition(text);
							eventHandler.handler(retrieveValidAssetId(assetId), position);
						}
					})
					
				});
		}
	};
	

	/**
	 * Private.
	 * Retrieves valid asset id since all white spaces of its id value have been replaced by underscore characters during publishing svg.
	 */
	function retrieveValidAssetId(assetEleId){
		return assetEleId.replace(/___/g, "'").replace(/__/g, " ");
	};
	
	/**
	 * 
	 */
	function getClickEventName(){
		var eventName = 'click';
		if("ontouchstart" in window){
			eventName = 'touchend'
		}
		return eventName;
	};
	
	//return a d3 compatible object
	function getAssetById(assetId){
		var elem = document.getElementById(assetId);
		return d3.select(elem);
	};
	

	/**
	 * Private.
	 * Gets mouse clicked asset's X and Y position to be used by callback.
	 * 
	 */
	function getClickElementPosition(ele){
		var position = {x:0, y:0};
		var elem = ele[0][0];
		if(elem){
			var box = null;
			try{
				box = elem.getBoundingClientRect();
			}catch(error){
				box = { top : elem.offsetTop, left : elem.offsetLeft }
			}
			
			position.x = box.left;
			position.y = box.top;
		}
		return position;
	};
	
})();




