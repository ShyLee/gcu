/**
 * Base view class for all SVG drawing views.
 */
//XXX: JS Zoom and move variables to be called by SVG zoom and move buttons
// TODO: remove variables from global namespace

var assetDragging = null;
var touches = null;
var touchX;
var touchY;
var touchPanViewBoxX;
var touchPanViewBoxY;
var newTouches = null;
var touchZooming = false;

// TODO: Mixing presentation and control in a View class. Control actions should be refactored to
// a controller class.

Ext.define('Common.controls.DrawingControl', {
    extend: 'Ext.Panel',

    requires: ['Common.control.PanButton',
        'Common.control.ZoomButton'],


    isDrawingView: true,

    xtype: 'drawing',

    svgDivId: '',

    panning: null,

    config: {
        drawingDiv: null,
        isDrawingLoaded: false,
        panFactor: 0.25,
        zoomFactor: Ext.os.deviceType === 'Desktop' ? 1.5 : 1.05,
        emptyDrawingText: 'Floor Plan is not available'
    },

    initialize: function() {
        var me = this;
        me.callParent(arguments);
        var panButtonContainer = Ext.create('Ext.Container', {
            itemId: 'svgPanButton',
            bottom: (Ext.os.is.Desktop) ? 10: 20,
            right: 10,
            zIndex: 1,
            cls: 'x-floating',
            items: [
                {
                    xtype: 'panbutton',
                    hidden: true
                }
            ]
        });
        var zoomButtonContainer = Ext.create('Ext.Container',{itemId: 'svgZoomButton',
            bottom: (Ext.os.is.Desktop) ? 10: 20,
            left: 10,
            zIndex: 1,
            cls: 'x-floating',
            items: [
                {
                    xtype: 'zoombutton',
                    hidden: true
                }
            ]});


        var panButton = panButtonContainer.down('panbutton');
        var zoomButton = zoomButtonContainer.down('zoombutton');

        panButton.on('panup', me.onPanUp, me);
        panButton.on('pandown', me.onPanDown, me);
        panButton.on('panright', me.onPanRight, me);
        panButton.on('panleft', me.onPanLeft, me);

        zoomButton.on('zoomout', me.zoomOut, me);
        zoomButton.on('zoomin', me.zoomIn, me);
        zoomButton.on('zoomextent', me.zoomExtents, me);
        zoomButton.on('zoomto', me.zoomTo, me);

        // Set up Pan and Zoom events
        this.add(panButtonContainer);
        this.add(zoomButtonContainer);
    },

    onPanUp: function () {
        var me = this,
            svg = me.getSvg(),
            viewBox = me.getViewBox();

        viewBox[1] = Number(viewBox[1]) - Number(viewBox[3]) * me.getPanFactor();
        svg.attr("viewBox", viewBox.join(" "));
    },

    onPanDown: function () {
        var me = this,
            svg = me.getSvg(),
            viewBox = me.getViewBox();

        viewBox[1] = Number(viewBox[1]) + Number(viewBox[3]) * me.getPanFactor();
        svg.attr("viewBox", viewBox.join(" "));
    },

    onPanRight: function () {
        var me = this,
            svg = me.getSvg(),
            viewBox = me.getViewBox();

        viewBox[0] = Number(viewBox[0]) + Number(viewBox[2]) * me.getPanFactor();
        svg.attr("viewBox", viewBox.join(" "));
    },

    onPanLeft: function () {
        var  me = this,
             svg = me.getSvg(),
             viewBox = me.getViewBox();

        viewBox[0] = Number(viewBox[0]) - Number(viewBox[2]) * me.getPanFactor();
        svg.attr("viewBox", viewBox.join(" "));
    },


    // ************* zoom actions ****************** //

    zoomIn: function () {
        var me = this,
            svg = me.getSvg(),
            viewBox = me.getViewBox(),
            zoomFactor = me.getZoomFactor();

        viewBox[0] += (viewBox[2] - viewBox[2] / zoomFactor) / 2;
        viewBox[1] += (viewBox[3] - viewBox[3] / zoomFactor) / 2;
        viewBox[2] = Number(viewBox[2]) / zoomFactor;
        viewBox[3] = Number(viewBox[3]) / zoomFactor;

        svg.attr("viewBox", viewBox.join(" "));
    },

    zoomExtents: function () {
        var me = this,
            svg = me.getSvg(),
            defaultView = d3.select('#' + me.svgDivId + ' svg view[id=defaultView]');

        if (defaultView[0][0] !== null) {
            console.log('Execute defaultView');
            svg.attr("viewBox", defaultView.attr("viewBox"));
        }
    },

    zoomTo: function () {
        var me = this,
            svg = me.getSvg(),
            zoomToArea = svg.select("#zoomToArea");

        if (zoomToArea[0][0] !== null) {
            svg.attr("viewBox", zoomToArea.attr("viewBox"));
        } else {
            Ext.Msg.confirm('Zoom To', 'Do you want to set a shortcut to this area?', function(result) {
                if (result === 'yes') {
                    svg.append("view")
                            .attr("id", "zoomToArea")
                            .attr("viewBox", svg.attr("viewBox"));
                }
            });
        }
    },

    zoomOut: function () {
        var me = this,
            svg = me.getSvg(),
            viewBox = me.getViewBox(),
            zoomFactor = me.getZoomFactor();

        viewBox[0] -= (viewBox[2] * zoomFactor - viewBox[2]) / 2;
        viewBox[1] -= (viewBox[3] * zoomFactor - viewBox[3]) / 2;

        viewBox[2] = Number(viewBox[2]) * zoomFactor;
        viewBox[3] = Number(viewBox[3]) * zoomFactor;

        svg.attr("viewBox", viewBox.join(" "));
    },


    /**
     * Displays SVG and binds JS events to highlighted assets
     */
    processSvg: function (self, svgDivId, svgText, eventHandlers) {
        var emptyDrawingText = this.getEmptyDrawingText();
        this.svgDivId = svgDivId;
        d3.select("#" + svgDivId).node().innerHTML = (svgText) ? svgText : '<div style="text-align: center; color: #66b3ff;">' + emptyDrawingText + '</div>';

        if (svgText) {
            self.setDefaultViewIfNotExists(this);
            //adds JS events
            self.handleZoomPan();
            self.addEventHandlers(self, eventHandlers);
            self.setPanAndZoomButtonVisibility(true);
            self.setIsDrawingLoaded(true);
        } else {
            self.setPanAndZoomButtonVisibility(false);
            self.setIsDrawingLoaded(false);
        }
        d3.select("#" + svgDivId).node().focus();
    },

    getDiv: function () {
        return d3.select("#" + this.svgDivId);
    },

    getSvg: function () {
        return d3.select("#" + this.svgDivId + " svg");
    },

    getViewBox: function () {
        var viewBox = this.getSvg().attr("viewBox").split(" ");

        for (var i = 0; i < viewBox.length; i++) {
            viewBox[i] = Number(viewBox[i]);
        }
        return viewBox;
    },

    setPanAndZoomButtonVisibility: function(displayButtons) {
        var panButton = this.query('panbutton'),
            zoomButton = this.query('zoombutton');

        panButton[0].setHidden(!displayButtons);
        zoomButton[0].setHidden(!displayButtons);
    },


    handleZoomPan: function () {
        var me = this;
        var control = this;
        // TODO: Why are control and me duplicated?
        var div = control.getDiv();
        var svg = control.getSvg();
        var viewBox = control.getViewBox();
        var clientWidth = svg.property('clientWidth');
        var clientHeight = svg.property('clientHeight');
        var ratio = 1.5; // Default zoom factor for the Desktop
        
        if(Ext.os.deviceType != 'Desktop'){
            var zoomWidthDiff = Number(viewBox[2]) / Number(clientWidth);

            if(zoomWidthDiff > 40){
            	ratio = Math.floor(zoomWidthDiff/20);
            } else {
            	ratio = 1.05;
            }        	
        }
        control.setZoomFactor(ratio);
        
        div.on('mouseup', function () {
            div.style('cursor', 'default');
        });

        if (Ext.os.deviceType === 'Desktop') {
            div.call(d3.behavior.zoom()
                            .on("zoom", function () {
                                //console.log(d3.event.sourceEvent.type);
                                if (d3.event.sourceEvent.type === 'mousewheel') {
                                    if (d3.event.sourceEvent.wheelDelta < 0) {
                                        me.zoomOut();
                                    } else {
                                        me.zoomIn();
                                    }
                                }
                            })
                    )
                    .on("dblclick.zoom", Ext.emptyFn)
                    .call(d3.behavior.drag()
                            .on("dragstart", function () {
                                me.panning = d3.mouse(this);
                            })
                            .on("drag", function () {
                                var svg = control.getSvg();
                                var viewBox = control.getViewBox();
                                if (d3.event.sourceEvent.type === 'mousemove' && me.panning) {
                                    if (d3.event.sourceEvent.type === 'mousemove') {
                                        div.style('cursor', 'move');
                                    }
                                    var mouseStartX = me.panning[0];
                                    var mouseStartY = me.panning[1];
                                    var currentMousePosition = d3.mouse(this);
                                    var newX = mouseStartX - currentMousePosition[0];
                                    var newY = mouseStartY - currentMousePosition[1];
                                    var clientWidth = svg.property('clientWidth');
                                    var clientHeight = svg.property('clientHeight');

                                    viewBox[0] -= newX * -0.5 * Number(viewBox[2]) / Number(clientWidth);
                                    viewBox[1] -= newY * -0.5 * Number(viewBox[3]) / Number(clientHeight);
                                    svg.attr("viewBox", viewBox.join(" "));
                                    me.panning = currentMousePosition;
                                }
                            })
                            .on("dragend", function () {
                                me.panning = null;
                                div.style('cursor', 'default');
                            })
                    );
        } else {
            div.on("touchstart", function (d, i) {
                viewBox = control.getViewBox();
                touches = d3.touches(this);

                if (event.touches.length === 1) {
                    var touch = touches[0];
                    touchX = touch[0];
                    touchY = touch[1];
                    touchPanViewBoxX = viewBox[0];
                    touchPanViewBoxY = viewBox[1];
                }
            });
            div.on("touchmove", function (d, i) {
                newTouches = d3.touches(this);
                if (touches && touches.length === 2 && newTouches && newTouches.length === 2) {
                    //zooming
                    touchZooming = true;

                    var oldDistance = control.getDistance(touches[0], touches[1]);
                    var newDistance = control.getDistance(newTouches[0], newTouches[1]);

                    //var touchZoomFactor = 1.05;
                    if (newDistance < oldDistance) {
                        me.zoomOut();
                    } else if (newDistance > oldDistance) {
                        me.zoomIn();
                    }
                } else if (touches && (touches.length === 1) && !assetDragging) {

                    if (touchZooming) {
                        touchZooming = false;
                        return;
                    }

                    var touch = newTouches[0];

                    var dx = (touch[0] - touchX) * -1.25 * Number(viewBox[2]) / Number(clientWidth);
                    var dy = (touch[1] - touchY) * -1.25 * Number(viewBox[3]) / Number(clientHeight);

                    var newX = touchPanViewBoxX + dx;
                    var newY = touchPanViewBoxY + dy;

                    viewBox[0] = newX;
                    viewBox[1] = newY;

                    svg.attr("viewBox", viewBox.join(" "));
                    touches = newTouches;
                }

            });
            div.on("touchend", function (d, i) {
                touches = null;
            });
        }
    },

    getDistance: function (a, b) {
        return Math.sqrt(Math.pow((a[0] - b[0]), 2) + Math.pow((a[1] - b[1]), 2));
    },

    getXDistance: function (a, b) {
        return a[0] - b[0];
    },

    getYDistance: function (a, b) {
        return a[1] - b[1];
    },

    // TODO: Refactor and consolidate mouse and touch events
    handleAssetDrag: function (id, tagName, dragendHandler) {
        var control = this;

        //TODO: asset or label id has no prefix HL__, and highlighted asset or label has the attribute highlighted="true"
        d3.select("#" + id + "-assets").selectAll(tagName).each(function () {
            var asset = d3.select(this);
            var getNewLabelLocation;
            var getNewAssetLocation;

            // label
            var labelId = 'l-' + id + '-' + this.id;
            var dragLabel = control.getAssetById(labelId);

            asset.call(d3.behavior.drag()
                    .on("dragstart", function (d, i) {
                        assetDragging = d3.mouse(this);
                        var assetXOffset = assetDragging[0] - Number(asset.attr('x'));
                        var assetYOffset = assetDragging[1] - Number(asset.attr('y'));

                        getNewAssetLocation = function (x, y) {
                            return [(x - assetXOffset), (y - assetYOffset)];
                        };

                        if (asset.attr('highlighted') == 'true' && dragLabel) {
                            var transform = dragLabel.attr('transform');
                            var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transform);
                            var x = Number(parts[1]), y = Number(parts[2]);

                            assetDiffX = assetDragging[0] - x;
                            assetDiffY = assetDragging[1] + y;

                            getNewLabelLocation = function (x, y) {
                                return [ (x - assetDiffX ), (-y + assetDiffY )];
                            };
                        }
                    })
                    .on("drag", function (d, i) {
                        if (d3.event.sourceEvent.type === 'mousemove' && assetDragging && asset.attr('highlighted') == 'true') {
                            var currentMousePosition = d3.mouse(this);
                            var tmp = getNewAssetLocation(currentMousePosition[0], currentMousePosition[1]);
                            asset.attr('x', tmp[0]);
                            asset.attr('y', tmp[1]);

                            // Drag label with asset
                            if (asset.attr('highlighted') == 'true' && dragLabel) {
                                var newCoordinates = getNewLabelLocation(currentMousePosition[0], currentMousePosition[1]);
                                dragLabel.attr("transform", function (d) {
                                    return "translate(" + newCoordinates[0] + "," + newCoordinates[1] + ")";
                                });
                            }
                            assetDragging = currentMousePosition;
                        }
                    })
                    .on("dragend", function (d, i) {
                        if (dragendHandler) {
                            dragendHandler();
                        } else if (asset.attr('highlighted') == 'true') {
                            alert("Asset Moved.  x,y: " + asset.attr('x') + "," + asset.attr('y'));
                        }
                        assetDragging = null;
                    })
            );

            asset.on("touchstart", function (d, i) {
                assetDragging = d3.touches(this)[0];
                if (d3.touches(this)) {
                    var assetXOffset = assetDragging[0] - Number(asset.attr('x'));
                    var assetYOffset = assetDragging[1] - Number(asset.attr('y'));

                    getNewAssetLocation = function (x, y) {
                        return [(x - assetXOffset), (y - assetYOffset)];
                    };

                    if (asset.attr('highlighted') == 'true' && dragLabel) {
                        var transform = dragLabel.attr('transform');
                        var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(transform);
                        var x = Number(parts[1]), y = Number(parts[2]);

                        assetDiffX = assetDragging[0] - x;
                        assetDiffY = assetDragging[1] + y;

                        getNewLabelLocation = function (x, y) {
                            return [ (x - assetDiffX ), (-y + assetDiffY )];
                        };
                    }
                }

            })
                    .on("touchmove", function (d, i) {
                        if (assetDragging && asset.attr('highlighted') == 'true') {
                            var currentMousePosition = d3.touches(this)[0];
                            var tmp = getNewAssetLocation(currentMousePosition[0], currentMousePosition[1]);
                            asset.attr('x', tmp[0]);
                            asset.attr('y', tmp[1]);

                            // Drag label with asset
                            if (asset.attr('highlighted') === 'true' && dragLabel) {
                                var newCoordinates = getNewLabelLocation(currentMousePosition[0], currentMousePosition[1]);
                                dragLabel.attr("transform", function (d) {
                                    return "translate(" + newCoordinates[0] + "," + newCoordinates[1] + ")";
                                });
                            }
                            assetDragging = currentMousePosition;
                        }
                    })
                    .on("touchend", function (d, i) {
                        if (dragendHandler) {
                            dragendHandler();
                        } else if (asset.attr('highlighted') == 'true') {
                            alert("Asset Moved.  x,y: " + asset.attr('x') + "," + asset.attr('y'));
                        }
                        assetDragging = null;
                    });
        });

        this.getDiv().node().focus();
    },

    //return a d3 compatible object
    getAssetById: function (assetId) {
        var elem = document.getElementById(assetId);
        return d3.select(elem);
    },

    ////////////////////////////////////////////////////////////////////////////////
    /**
     * Adds JS events to highlighted assets and labels.
     */
    addEventHandlers: function (self, eventHandlers) {
        for (var i = 0; i < eventHandlers.length; i++) {
            var eventHandler = eventHandlers[i];
            this.addEvent2HighlightedAssets(self, eventHandler);
            this.addEvent2HighlightedLabels(self, eventHandler);
        }
    },

    /**
     * Adds JS event to highlighted Assets.
     */
    addEvent2HighlightedAssets: function (self, eventHandler) {
        var eventName = this.getClickEventName();
        d3.select("#" + eventHandler.assetType + "-assets").selectAll("path")
                .each(function () {
                    self.addEvent2HighlightedAsset(this, eventHandler, eventName);
                });
        //XXX: some assets published with <use>???
        d3.select("#" + eventHandler.assetType + "-assets").selectAll("use")
                .each(function () {
                    self.addEvent2HighlightedAsset(this, eventHandler, eventName);
                });
    },
    /**
     * Adds JS event to highlighted individual Asset.
     */
    addEvent2HighlightedAsset: function (self, eventHandler, eventName) {
        var control = this;
        var asset = d3.select(self);
        var assetId = self.id;

        //XXX:  highlighted assets have attribute highlighted="true"
        if (asset.attr('highlighted') === 'true') {
            asset.on(eventName, function () {
                if (eventHandler.handler) {
                    eventHandler.handler(control.retrieveValidAssetId(assetId));
                }
            });
        }
    },

    /**
     * Retrieves valid asset id since all white spaces of its id value have been replaced by underscore characters during publishing svg.
     */
    retrieveValidAssetId: function (assetEleId) {
        return assetEleId.replace(/___/g, "'").replace(/__/g, " ");
    },

    /**
     * Adds JS event to highlighted labels.
     */
    addEvent2HighlightedLabels: function (self, eventHandler) {
        var eventName = this.getClickEventName();
        var prefix = 'l-' + eventHandler.assetType + '-';
        d3.select("#" + eventHandler.assetType + "-labels").selectAll("g")
                .each(function () {
                    self.addEvent2HighlightedLabel(this, prefix, eventHandler, eventName);
                });
    },

    /**
     * Adds JS event to highlighted individual label.
     */
    addEvent2HighlightedLabel: function (self, prefix, eventHandler, eventName) {
        var control = this;
        var assetLabelId = self.id;
        var assetLabel = d3.select(self);

        //XXX:  highlighted asset labels have attribute highlighted="true"
        if (assetLabel.attr('highlighted') === 'true') {
            d3.select(self).selectAll("text")
                    .each(function () {
                        var text = d3.select(self);
                        text.on(eventName, function () {
                            if (eventHandler.handler) {
                                eventHandler.handler(control.retrieveValidAssetId(assetLabelId.substring(assetLabelId.indexOf(prefix) + prefix.length)));
                            }
                        });

                    });
        }
    },

    //XXX: click event is not fired on mobile, d3 js bugging????
    getClickEventName: function () {
        return 'click';
    },
    ////////////////////////////////////////////////////////////////////////////////////////

    setDefaultViewIfNotExists: function (control) {
        var svg = this.getSvg(),
            defaultView = d3.select('#' + this.svgDivId + ' svg view[id=defaultView]');

        if (defaultView[0][0] === null) {
            svg.append("view").attr("id", "defaultView").attr("viewBox", svg.attr("viewBox"));
        }
    }

});