//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//
var sougouDefController = View.createController('sougouDefController', {
	makerArray:new Array(),
	myMaker:null,
	map:'',
	afterViewLoad:function() {
		initialize();
	},
	
	blgridPanel_onShowNoPosition : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.latsou", "", "IS NULL");
		restriction.addClause("bl.lonsou", "", "IS NULL");
		this.blgridPanel.refresh(restriction);
	},
	blgridPanel_onShowAll : function() {
		this.blgridPanel.refresh([]);
	},
    showPointOnMap:function(row){
		var row = this.blgridPanel.gridRows.get(this.blgridPanel.selectedRowIndex);
		var bl_id = row.getFieldValue("bl.bl_id");
		var lat = row.getFieldValue("bl.latsou");
		var lon = row.getFieldValue("bl.lonsou");
		var blName = row.getFieldValue("bl.name");

		//刷新建筑物和坐标详细panel
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id",bl_id,"=");
		this.formPanel.refresh(restriction,false);
		
		//点击建筑物 在地图上显示热点
		if(this.myMaker!=null){
			this.myMaker.setMap(null)
		}
		if(lat!=null && lon!=null)
		{
			this.addMakeForMap(blName,lat,lon);
		}
   },
   addMakeForMap:function(blName,lat,lon){
	   for(var j=0;j<this.makerArray.length;j++){
			 this.makerArray[j].setMap(null);
	    }
		var map=this.map;
		var location="";
		if (!isNaN(lat)) {
			location = new sogou.maps.Point(parseFloat(lat), parseFloat(lon));
		}else{
			return;
		}
		this.myMaker= new sogou.maps.Marker({
			position : location,
			map : map,
			title : blName
		});
		map.setCenter(location);
		this.makerArray[this.makerArray.length] = this.myMaker;
   },
   clearMarkerAndPolyline:function(){
		marker.setVisible(false);
		bermudaTriangle.hide();
	}
   
});


function initialize() {
	
	var myLatlng = new sogou.maps.Point(113.168352,23.438314);
	var myOptions = {
		'zoom': 16,
		'center': myLatlng,
		'dblclickable': false,
		'mapTypeId': sogou.maps.MapTypeId.ROADMAP
	}
	var map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	sougouDefController.map=map;
	map.clearAll();
//	//显示气泡
//	addCMakeForSite(map);
	
    
	//河海大学本部
    var triangleCoords = [
                  new sogou.maps.Point(113.166163,23.431481),
                  new sogou.maps.Point(113.16875,23.433288),
                  new sogou.maps.Point(113.169522,23.432857),
                  new sogou.maps.Point(113.170834,23.434067),
                  new sogou.maps.Point(113.171409,23.435095),
                  new sogou.maps.Point(113.171445,23.435559),
                  new sogou.maps.Point(113.171463,23.435692),
                  new sogou.maps.Point(113.170475,23.435211),
                  new sogou.maps.Point(113.169702,23.435058),
                  new sogou.maps.Point(113.169666,23.435389),
                  new sogou.maps.Point(113.170259,23.435829),
                  new sogou.maps.Point(113.170259,23.435841),
                  new sogou.maps.Point(113.169891,23.436492),
                  new sogou.maps.Point(113.169302,23.436521),
                  new sogou.maps.Point(113.168853,23.436778),
                  new sogou.maps.Point(113.169473,23.436869),
                  new sogou.maps.Point(113.169873,23.437122),
                  new sogou.maps.Point(113.168992,23.437221),
                  new sogou.maps.Point(113.168341,23.437457),
                  new sogou.maps.Point(113.168247,23.437814),
                  new sogou.maps.Point(113.168337,23.438415),
                  new sogou.maps.Point(113.168579,23.438767),
                  new sogou.maps.Point(113.16879,23.439202),
                  new sogou.maps.Point(113.169275,23.439252),
                  new sogou.maps.Point(113.169554,23.439182),
                  new sogou.maps.Point(113.169612,23.43936),
                  new sogou.maps.Point(113.169612,23.439501),
                  new sogou.maps.Point(113.169621,23.439517),
                  new sogou.maps.Point(113.169482,23.439679),
                  new sogou.maps.Point(113.169415,23.439675),
                  new sogou.maps.Point(113.169397,23.439687),
                  new sogou.maps.Point(113.169006,23.439915),
                  new sogou.maps.Point(113.169024,23.440184),
                  new sogou.maps.Point(113.169316,23.440342),
                  new sogou.maps.Point(113.169496,23.440371),
                  new sogou.maps.Point(113.169747,23.440495),
                  new sogou.maps.Point(113.169981,23.440371),
                  new sogou.maps.Point(113.170282,23.440292),
                  new sogou.maps.Point(113.17038,23.440388),
                  new sogou.maps.Point(113.170865,23.440276),
                  new sogou.maps.Point(113.170843,23.440417),
                  new sogou.maps.Point(113.170457,23.440582),
                  new sogou.maps.Point(113.170147,23.440806),
                  new sogou.maps.Point(113.170115,23.440972),
                  new sogou.maps.Point(113.169725,23.440864),
                  new sogou.maps.Point(113.169204,23.440877),
                  new sogou.maps.Point(113.169199,23.440885),
                  new sogou.maps.Point(113.169091,23.440852),
                  new sogou.maps.Point(113.167771,23.440881),
                  new sogou.maps.Point(113.167093,23.441519),
                  new sogou.maps.Point(113.166527,23.441581),
                  new sogou.maps.Point(113.166374,23.441987),
                  new sogou.maps.Point(113.166082,23.442124),
                  new sogou.maps.Point(113.16588,23.442298),
                  new sogou.maps.Point(113.16566,23.442182),
                  new sogou.maps.Point(113.165646,23.441983),
                  new sogou.maps.Point(113.164883,23.442004),
                  new sogou.maps.Point(113.164142,23.441788),
                  new sogou.maps.Point(113.163796,23.440868),
                  new sogou.maps.Point(113.16354,23.440806),
                  new sogou.maps.Point(113.1638,23.440603),
                  new sogou.maps.Point(113.164968,23.440615),
                  new sogou.maps.Point(113.165386,23.439965),
                  new sogou.maps.Point(113.165786,23.438742),
                  new sogou.maps.Point(113.165327,23.438523),
                  new sogou.maps.Point(113.164932,23.43863),
                  new sogou.maps.Point(113.164461,23.438668),
                  new sogou.maps.Point(113.164465,23.438663),
                  new sogou.maps.Point(113.164142,23.438589),
                  new sogou.maps.Point(113.163926,23.438332),
                  new sogou.maps.Point(113.164739,23.436032),
                  new sogou.maps.Point(113.164838,23.434163),
                  new sogou.maps.Point(113.16517,23.433023),
                  new sogou.maps.Point(113.165516,23.432239),
                  new sogou.maps.Point(113.166163,23.431481),
	];
	createPolygon(triangleCoords,map);
	
}

function createPolygon(triangleCoords,map){
	bermudaTriangle = new sogou.maps.Polyline({
		paths: triangleCoords,
		strokeColor: "#FF0000",
		strokeOpacity: 0.8,
		strokeWeight: 6
	});
	bermudaTriangle.setMap(map);
	new sogou.maps.event.addListener(map, 'dblclick', function(event) {
			var cForm= sougouDefController.formPanel;
			//cForm.clear();
			//cForm.refresh([],true);
			//get click location x y
			cForm.setFieldValue("bl.latsou",event.point.x);
			cForm.setFieldValue("bl.lonsou",event.point.y);
		});
	
}
//画出学校范围
//function showBl() {
//	var map=controller.map;
//    addMakeForMap(map);
//}

function setBuilding(){
    var cForm = sougouDefController.formPanel;
    var restriction = new Ab.view.Restriction();
    var blId = cForm.getFieldValue("bl.bl_id");
    var blName = cForm.getFieldValue("bl.name");
    var latsou = cForm.getFieldValue("bl.latsou");
    var lonsou = cForm.getFieldValue("bl.lonsou");
    
    if(blId != "" && latsou != "" && lonsou != ""){
	    restriction.addClause("bl.bl_id", blId, "=");
	    var account=sougouDefController.blDS;
	    var record=account.getRecord(restriction);
	    
	    record.setValue("bl.latsou", latsou);
	    record.setValue("bl.lonsou", lonsou);
	    
	    account.saveRecord(record);
	    sougouDefController.addMakeForMap(blName,latsou,lonsou);
	    
	    sougouDefController.blgridPanel.refresh();
	    alert("保存成功！");
    }else{
    	View.showMessage("请确认建筑物名称及经纬度后再点保存！");
    }
}

