//override, set event handlers, and load drawing on startup would typically
//done from the overridden 'user_form_onload' method


var controller = View.createController('soumap', {
	makerArray:new Array(),
	map:'',
	afterViewLoad:function() {
		var records=getBuildingRecords("","");
		initialize(records);
		this.abSpHlRmByDp_DrawingPanel.appendInstruction("default", "", "");
		this.flGrid.addEventListener('onMultipleSelectionChange', function(row){
			var highlightResc = "";
                highlightResc += " AND rm.dv_id IS NOT NULL";
                View.panels.get('abSpHlRmByDp_DrawingPanel').clear();
                View.panels.get('abSpHlRmByDp_DrawingPanel').addDrawing(row, null);
	      });
	},

	onClickShowInfo:function(autoShow){
		var panel=this.blGrid;
		var selectedIndx=-1;
		if(autoShow){
			selectedIndx=0;
		}else{
			selectedIndx=panel.selectedRowIndex;
		}
		var bl_id=this.blGrid.rows[selectedIndx]["bl.bl_id"];
		var blName=this.blGrid.rows[selectedIndx]["bl.name"];
		
		this.flGrid.addParameter("blRes","='"+bl_id+"'");
		this.flGrid.refresh();
		
		this.abSpHlRmByDp_DrawingPanel.setTitle(blName);
		
		//在建筑物编码上点击实现与show功能相同的效果
		var restriction=new Ab.view.Restriction();
		restriction.addClause("bl.bl_id",bl_id,"=");
		records=controller.blDS.getRecords(restriction);
		showBl(records);
	},
	flGrid_multipleSelectionColumn_onClick : function(row) {
		if (this.selectedRow != null) {
			this.selectedRow.select(false);
		}
		if (row.isSelected()) {
			this.selectedRow = row;
		} else {
			this.selectedRow = null;
		}
	}

});

function onRefreshBlGrid(sitename){
	var blgrid = View.panels.get('blGrid');
    var restr = new Ab.view.Restriction();
	restr.addClause('site.name',sitename,'=');
	blgrid.refresh(restr);
}
/**
 * Get building records by console value
 * 
 * @param bl_id
 * @param use1
 * @returns {String}
 */
function getBuildingRecords(bl_id,use1,dv_use){
	  var restriction=new Ab.view.Restriction();
	
	var records="";
	if(valueExistsNotEmpty(bl_id)){
		 restriction.addClause("bl.bl_id",bl_id,"=");
		records=controller.blDS.getRecords(restriction);
	}else if(use1){
		restriction.addClause("bl.use1",use1,"=");
		records=controller.blDS.getRecords(restriction);
	}else if(valueExistsNotEmpty(dv_use)){
		restriction.addClause("bl.dv_use",dv_use,"=");
		records=controller.blDS.getRecords(restriction);
	}
	else{
		var  resLatlon = "bl.latsou is not null and bl.lonsou is not null";
		  
		records=controller.blDS.getRecords(resLatlon);
	}
	return records;
}


//初始化地图，画出校园范围
function initialize(records) {
	
	var latLng = new sogou.maps.Point(113.168352,23.438314);
	  var myOptions = {
	    'zoom': 16,
	    'center': latLng,
	    'mapTypeId': sogou.maps.MapTypeId.SATELLITE   // 加载卫星图像SATELLITE
	  }
	 var  map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	 controller.map=map;
	 map.clearAll();
	 		//这句话控制一开始的热点出现问题
    		addMakeForMap(map,records);
	//广州学院
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
	// create polygon
	bermudaTriangle = new sogou.maps.Polyline({
		paths : triangleCoords,
		strokeColor : "#FF0000",
		strokeOpacity : 0.8,
		strokeWeight : 6
	});
	bermudaTriangle.setMap(map);
}

// 初始化地图，画出校园范围
function showBl(records) {
	var map=controller.map;
   addMakeForMap(map,records);
}


// 标记所有建筑
function addMakeForMap(map,records){
	
	 for(var j=0;j<controller.makerArray.length;j++){
		 controller.makerArray[j].setMap(null);
		}
	 

	for(var i=0;i<records.length;i++){
			var record=records[i];
			var lat=record.getValue("bl.latsou");
			var lon=record.getValue("bl.lonsou");
			var blId=record.getValue("bl.bl_id");
			var blName=record.getValue("bl.name");
			var location="";
			
			if(!isNaN(lat)){
			 location = new sogou.maps.Point(parseFloat(lat), parseFloat(lon));
			}else{
				continue;
			}
			  
    	    var marker = new sogou.maps.Marker({
    	        position: location,
    	        map: map,
    	        //设置信息窗上方标题栏的文字
    	        title: blName
    	    });
    	  map.setCenter(location);
    	 controller.makerArray[controller.makerArray.length]=marker;
    	 attachSecretMessage(map,marker);
    }
	    	
}

//显示房产信息摘要
function showBlInfo(blId){
	//this.blId = row.record['bl.bl_id'];
	View.openDialog('asc-bj-usms-bl-info-card.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
		openBlId:blId
    });
}

//显示楼层房屋类别叠堆图
function showBlFlRmCatInfo(blId){
	View.openDialog('asc-bj-usms-bl-type-cht-stack-sogou.axvw', null, false, {
        width: 800,
        height: 600,
        closeButton: false,
        blId:blId
    });
}

//建筑高亮热点监听
function attachSecretMessage(map,marker) {
	  var infowindow = new sogou.maps.InfoWindow(
	      { content: "" ,
	    	title: "" 
	      });
	  //添加单击监听事件
	  sogou.maps.event.addListener(marker, 'click', function() {
		  var lat=marker.getPosition().x;
		  var lon=marker.getPosition().y;
		  var records=controller.blDS.getRecords("bl.latsou='"+lat+"' and bl.lonsou='"+lon+"'");
		  var restriction=new Ab.view.Restriction();
		  var bl_id=records[0].getValue("bl.bl_id");
		  //查找bl_name
		  var bl_name=records[0].getValue("bl.name");
		  var  blRes = " = '" + bl_id + "'";
		  controller.flGrid.addParameter('blRes', blRes);
		  
		  //UNKNOWN;未知;HALL;会堂;JGST;教工食堂;KYRM;科研用房;LVWF;生活及福利用房;TSASS;实验及辅助用房;GYM;体育馆;LIB;图书馆;ADBL;行政用房;XSST;学生食堂;XSFS;学生宿舍;CR;教室;JGZZ;教工住宅;ZZF;周转房
		  var use1Text=records[0].getValue("bl.use1");
		  var use1="";
		  if(use1Text==="UNKNOWN"){
			  use1="未知";
		  }else if(use1Text=="HALL"){
			  use1="会堂";
		  }else if(use1Text=="JGST"){
			  use1="教工食堂";
		  }else if(use1Text=="KYRM"){
			  use1="科研用房";
		  }else if(use1Text=="LVWF"){
			  use1="生活及福利用房";
		  }else if(use1Text=="TSASS"){
			  use1="实验及辅助用房";
		  }else if(use1Text=="GYM"){
			  use1="体育馆";
		  }else if(use1Text=="LIB"){
			  use1="图书馆";
		  }else if(use1Text=="ADBL"){
			  use1="行政用房";
		  }else if(use1Text=="XSST"){
			  use1="学生食堂";
		  }else if(use1Text=="XSFS"){
			  use1="学生宿舍";
		  }else if(use1Text=="CR"){
			  use1="教室";
		  }else if(use1Text=="JGZZ"){
			  use1="教工住宅";
		  }else if(use1Text=="ZZF"){
			  use1="周转房";
		  }
		  var area_building_manual=records[0].getValue("bl.area_building_manual");
		  var area_rm=records[0].getValue("bl.area_rm");
			  controller.flGrid.refresh(restriction);
			  //显示小图
			  controller.blGrid.show();
			  controller.abSpHlRmByDp_DrawingPanel.clear();
			  controller.abSpHlRmByDp_DrawingPanel.setTitle(bl_name);
			  
			  str_url_link_bl = '<a href="#" onclick=\'showBlInfo("'+bl_id+'")\'>'+getMessage("<建筑物房产信息摘要>")+'</a>';
			  str_url_link_fl = '<a href="#" onclick=\'showBlFlRmCatInfo("'+bl_id+'")\'>'+getMessage("<楼层房屋类别叠堆图>")+'</a>';
		  var html="<div id='info' style='width:150px'>"+getMessage("大楼名")+":"+bl_name+" <br> "+getMessage('大楼用途')+":"+use1+"<br>"+getMessage("建筑面积")+":"+area_building_manual+"平米"+" <br> "+
				getMessage("使用面积")+":"+area_rm+"平米"+" <br> "+str_url_link_bl+" <br> "+str_url_link_fl+"</br> </div></br></br>";	
			
			var head=bl_name;
			
			infowindow.setContent(html);
			infowindow.setTitle(head);
			infowindow.open(map,marker);
	  });
	  
	}


