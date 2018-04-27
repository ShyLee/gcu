/**
 * This example uses Baidu Map JavaScript API.
 *
 * See http://dev.baidu.com/wiki/map/index.php?title=%BF%AA%B7%A2%D6%B8%C4%CF.
 *
 * Please note that The Baidu! Maps AJAX API is limited to 50,000
 * queries per IP per day and to non-commercial use.
 **/
var chartExampleController = View.createController('chartExample', {

    /**
     * The map variable will hold the reference to the Yahoo Map control
     */
    map: null,
    centerPosition: {
        'lat': 116.3262278,
        'lng': 40.00298
    },
    myline: null,
    
    /**
     * Called when the view is loaded.
     * Initializes the Yahoo Map control and sets the initial address to display.
     */
    afterViewLoad: function(){
        this.initMap();
    },
    
    initMap: function(){
        this.map = createMap("mapContainer", this.centerPosition);//创建地图
        setMapEvent(this.map);//设置地图事件    
        addMapControl(this.map);//向地图添加控件
        getLocationData();
        addLocationData(this.map);//自定义覆盖物
        showAllLocation(this.map);
    },
    
    /**
     * Displays the selected building on the map.
     */
    parcellandGrid_onShowOnMap: function(row, action){
        var record = row.getRecord();
        var address = record.getValue('sc_parcelland.parcelland_address');
        
        if (this.myline) {
            this.map.removeOverlay(this.myline);
        }
        var data = findData(address);
        var id = data ? data.id : 1;
        showLocation(id - 1, this.map);
        
        var iw = createInfoWindow(id - 1);
        var p0 = data.point.split("|")[0];
        var p1 = data.point.split("|")[1];
        var p = new BMap.Point(p0, p1);
        this.map.openInfoWindow(iw, p);
    }
    
});
var locationData = null;
//创建地图函数
function createMap(divId, centerPosition){
    var map = new BMap.Map(divId);//在百度地图容器中创建一个地图
    var point = new BMap.Point(centerPosition.lat, centerPosition.lng);//定义一个中心点坐标
    map.centerAndZoom(point, 14);//设定地图的中心点和坐标并将地图显示在地图容器中
    return map;
    //window.map = map;//将map变量存储在全局
}

//地图事件设置函数：
function setMapEvent(map){
    map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
    map.enableScrollWheelZoom();//启用地图滚轮放大缩小
    map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
    map.enableKeyboard();//启用鼠标双击放大，默认启用(可不写)
}

//地图控件添加函数：
function addMapControl(map){
    //向地图中添加缩放控件
    var ctrl_nav = new BMap.NavigationControl({
        anchor: BMAP_ANCHOR_TOP_LEFT,
        type: BMAP_NAVIGATION_CONTROL_LARGE
    });
    map.addControl(ctrl_nav);
    //向地图中添加缩略图控件
    var ctrl_ove = new BMap.OverviewMapControl({
        anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
        isOpen: 1
    });
    map.addControl(ctrl_ove);
    //向地图中添加比例尺控件
    var ctrl_sca = new BMap.ScaleControl({
        anchor: BMAP_ANCHOR_BOTTOM_LEFT
    });
    map.addControl(ctrl_sca);
}

//自定义初始化   
function addLocationData(map){
    map.clearOverlays();
    
    
    for (var i = 0; i < locationData.length; i++) {
        var json = locationData[i];
        if (json.point == null) {
            continue;
        }
        var p0 = json.point.split("|")[0];
        var p1 = json.point.split("|")[1];
        var point = new BMap.Point(p0, p1);
        var iconImg = createIcon({
            w: 32,
            h: 32,
            l: 0,
            t: 0,
            x: 6,
            lb: 5
        });
        var marker = new BMap.Marker(point, {
            icon: iconImg
        });
        var iw = createInfoWindow(i);
        var label = new BMap.Label(json.addr, {
            "offset": new BMap.Size(9, -20)
        });
        marker.setLabel(label);
        map.addOverlay(marker);
        label.setStyle({
            borderColor: "#808080",
            color: "#333",
            cursor: "pointer"
        });
        (function(){
            var index = i;
            var _iw = createInfoWindow(i);
            var _marker = marker;
            _marker.addEventListener("click", function(){
                this.openInfoWindow(_iw);
                if (chartExampleController.myline) {
                    map.removeOverlay(chartExampleController.myline);
                }
                showLocation(index, map);
            });
            _iw.addEventListener("open", function(){
                _marker.getLabel().hide();
            })
            _iw.addEventListener("close", function(){
                _marker.getLabel().show();
            })
            label.addEventListener("click", function(){
                _marker.openInfoWindow(_iw);
            })
            if (!!json.isOpen) {
                label.hide();
                _marker.openInfoWindow(_iw);
            }
        })()
    }
}

function getLocationData(){
    locationData = new Array();
    var records = View.dataSources.get("sc_parcelland_ds").getRecords();
    var id = 0;
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
		
        var landcode = record.getValue('sc_parcelland.land_code');
        var addr = record.getValue('sc_parcelland.parcelland_address');
        var center_point = record.getValue('sc_parcelland.center_point');
        var points = record.getValue('sc_parcelland.points');
        var area = record.getValue('sc_parcelland.area_land');
        
        if (points != null) {
            locationData[id] = new Object();
            locationData[id].id = id + 1;
			locationData[id].landcode = landcode;
            locationData[id].addr = addr;
            locationData[id].area = area;
            locationData[id].point = center_point;
            locationData[id].points = new Array();
            if (points.length > 0) {
                locationData[id].points = points.split(",");
                
            }
            id++;
        }
    }
}

function findData(addr){
    for (var i = 0; i < locationData.length; i++) {
        var data = locationData[i];
        if (addr == data.addr) {
            return data;
        }
    }
    return null;
}

//自定义消息窗口
function createInfoWindow(i){
    var json = locationData[i];
    var iw = new BMap.InfoWindow("<b class='iw_poi_title' title='" + json.addr + "'>" + json.addr + "</b><div class='iw_poi_content'>总使用面积：" + json.area + "</div>");
    return iw;
}

//显示选中的区域
function showLocation(i, map){
    var json = locationData[i];
    var points = [];
    for (var j = 0; j < json.points.length; j++) {
        var p1 = json.points[j].split("|")[0];
        var p2 = json.points[j].split("|")[1];
        points.push(new BMap.Point(p1, p2));
    }
    var line = new BMap.Polygon(points, {
        strokeStyle: "solid",
        strokeWeight: 4,
        strokeColor: "#f00",
        strokeOpacity: 0.6
    });
    chartExampleController.myline = line;
    
    map.addOverlay(line);
}

//显示全部区域
function showAllLocation(map){
    for (var i = 0; i < locationData.length; i++) {
        var json = locationData[i];
        var points = [];
        for (var j = 0; j < json.points.length; j++) {
            var p1 = json.points[j].split("|")[0];
            var p2 = json.points[j].split("|")[1];
            points.push(new BMap.Point(p1, p2));
        }
        
        var line = new BMap.Polygon(points, {
            strokeStyle: "solid",
            strokeWeight: 2,
            strokeColor: "#a00",
            strokeOpacity: 0.6
        });
        (function(){
            var index = i;
            line.addEventListener("click", function(){
                if (chartExampleController.myline) {
                    map.removeOverlay(chartExampleController.myline);
                }
                showLocation(index, map);
                var data = locationData[index];
                var iw = createInfoWindow(index);
                var p0 = data.point.split("|")[0];
                var p1 = data.point.split("|")[1];
                var p = new BMap.Point(p0, p1);
                map.openInfoWindow(iw, p);
            });
            
        })()
        
        map.addOverlay(line);
        
    }
}

//创建一个Icon
function createIcon(json){
    var icon = new BMap.Icon("/archibus/schema/ab-system/graphics/ab-icon-dashboard32.gif", new BMap.Size(json.w, json.h), {
        imageOffset: new BMap.Size(-json.l, -json.t),
        infoWindowOffset: new BMap.Size(json.lb + 5, 1),
        offset: new BMap.Size(json.x, json.h)
    })
    return icon;
}

// 编写自定义函数，创建标注  
function addMarker(point, index){
    // 创建图标对象  
    var myIcon = new BMap.Icon("/archibus/schema/ab-core/graphics/markers.png", new BMap.Size(23, 25), {
        // 指定定位位置。  
        // 当标注显示在地图上时，其所指向的地理位置距离图标左上  
        // 角各偏移10像素和25像素。您可以看到在本例中该位置即是  
        // 图标中央下端的尖角位置。  
        offset: new BMap.Size(10, 25),
        // 设置图片偏移。  
        // 当您需要从一幅较大的图片中截取某部分作为标注图标时，您  
        // 需要指定大图的偏移位置，此做法与css sprites技术类似。  
        imageOffset: new BMap.Size(0, 0 - index * 25) // 设置图片偏移  
    });
    // 创建标注对象并添加到地图  
    var marker = new BMap.Marker(point, {
        icon: myIcon
    });
    marker.addEventListener("click", function(){
        alert("您点击了标注");
    });
	marker.enableDragging();
    marker.addEventListener("dragend", function(e){
        alert("当前位置：" + e.point.lng + ", " + e.point.lat);
    })
    map.addOverlay(marker);
}
