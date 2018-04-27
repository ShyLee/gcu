/*
 * @author : HuangMuLiang
 * @date   : 2012-11-01
 */
var controller = View.createController('soumap', {
	makerArray:new Array(),
	brandArray:new Array(),

	map:'',
	afterViewLoad:function() {
		var records=getBuildingRecords("","");
		initialize(records);
		
		
		
	},

	console_onShow:function(){
		
		var bl_id = this.console.getFieldValue("bl.bl_id");
		var dv_use = this.console.getFieldValue("bl.dv_use");
		var use1 = this.console.getFieldValue("bl.use1");
		var records=getBuildingRecords(bl_id,use1,dv_use);
		//重新绘图
		showBl(records);
	}

});

/**
 * Get building records by console value
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

	  var latLng = new sogou.maps.Point(12949804.01,4836468.03);
	  var myOptions = {
	    'zoom': 16,
	    'center': latLng,
	    'mapTypeId': sogou.maps.MapTypeId.EDUSHIMAP  // 加载三维图像
	   
	  }
	 var  map = new sogou.maps.Map(document.getElementById("map_canvas"), myOptions);
	        controller.map=map;
    		//addMakeForMap(map,records);
	        addBrandForMap(map,records);
	 var triangleCoords = [
		           		                      new sogou.maps.Point(12949566.95,4836080.08),
		           		                      new sogou.maps.Point(12950175.36,4836116.92),
		           		                      new sogou.maps.Point(12950042.65,4837058.79),
		           		                      new sogou.maps.Point(12949521.08,4837039.58),
		           		                      new sogou.maps.Point(12949566.95,4836080.08)
		           		                      ];

		           		// create polygon 
		           		bermudaTriangle = new sogou.maps.Polyline({
		           			paths: triangleCoords,
		           			strokeColor: "#FF0000",
		           			strokeOpacity: 0.8,
		           			strokeWeight: 6
		           		});
		           	     map.clearAll();
		           		bermudaTriangle.setMap(map);
}


//初始化地图，画出校园范围
function showBl(records) {
	    var map=controller.map;
    		addBrandForMap(map,records);
}


//标记所有建筑
function addMakeForMap(map,records){
	
	 for(var j=0;j<controller.makerArray.length;j++){
		 controller.makerArray[j].setMap(null);
		}
	 
	for(var i=0;i<records.length;i++){
			var record=records[i];
			var lat=record.getValue("bl.latsou");
			var lon=record.getValue("bl.lonsou");
			var blId=record.getValue("bl.bl_id");
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
    	        title: blId
    	    });
    	
    	 controller.makerArray[controller.makerArray.length]=marker;
    	attachSecretMessage(map,marker);
    }
	    	
}

//上一个点击的广告牌

//添加建筑 brand
function addBrandForMap(map,records){
	var length = controller.brandArray.length;
	 for(var j=0;j<length;j++){
		 var popB = controller.brandArray.pop();
		 popB.hide();
		 popB.setMap(null);
		}
	 
	for(var i=0;i<records.length;i++){
			var record=records[i];
			var lat=record.getValue("bl.latsou");
			var lon=record.getValue("bl.lonsou");
			var blId=record.getValue("bl.bl_id");
			var location="";
			var use1=record.getValue("bl.use1");
			var area_building_manual=record.getValue("bl.area_building_manual");
			var area_rm=record.getValue("bl.area_rm");
			if(!isNaN(lat)){
			 location = new sogou.maps.Point(parseFloat(lat), parseFloat(lon));
			}else{
				continue;
			}
			 
			 var brand = new sogou.maps.Brand({
    	        position: location,
    	        map: map,
    	        //设置信息窗上方标题栏的文字
    	        content: blId,
    	        bl_id: blId,
    	        isShow: false
    	    });
				
			var infowindow = new sogou.maps.InfoWindow(
	      { content: "" ,
	    	title: "" 
	      });
			 sogou.maps.event.addListener(brand, 'click', function() { 
				    var bl_id=this.bl_id;
				    var	  str_url_link_bl = '<a href="#" onclick=\'showBlInfo("'+bl_id+'")\'>'+getMessage("<建筑物房产信息摘要>")+'</a>';
					var	  str_url_link_fl = '<a href="#" onclick=\'showBlFlRmCatInfo("'+bl_id+'")\'>'+getMessage("<楼层房屋类别叠堆图>")+'</a>';
					//var   str_img = '<img src=\''+View.project.projectGraphicsFolder+'/bl/' + '汇德公寓'+'.jpg\'/>';
					var   str_img = '';
					//添加建筑物照片，需调整页面中的CSS设置，使图片正常显示。（修改info宽度到250+）
					var html="<div id='info' class='info'><h1>"+bl_id+"</h1> <p> "+getMessage('大楼用途')+":"+use1+"</p><p>"+getMessage("建筑面积")+":"+area_building_manual+"平米"+" </p> <p>"+
							getMessage("使用面积")+":"+area_rm+"平米"+" </p><p> "+str_img +"</p><p>"+str_url_link_bl+" </p><p> "+str_url_link_fl+"</p> </div>";	
			  //View.showMessage('message', html, null, null, function(){
                
              //   });
			for(var i=0;i<controller.brandArray.length;i++){
				var br = controller.brandArray[i];
				if(br.bl_id != this.bl_id && br.isShow != false){
					br.isShow = false;
					br.setContent(br.bl_id);
				}
			}
			
              if(!this.isShow){
              	this.setContent(html);
              	this.isShow = true;
              	}else{
              	this.setContent(bl_id);
              	this.isShow = false;
              	}

			  });
    	 controller.brandArray.push(brand);
    	
    }
	 

	    	
}

//显示房产信息摘要
function showBlInfo(blId){
	//this.blId = row.record['bl.bl_id'];
	View.openDialog('asc-bj-usms-bl-pracelland-summary-info.axvw', null, false, {
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

		  var bl_id=records[0].getValue("bl.bl_id");
	
		  
		  var use1=records[0].getValue("bl.use1");
		  var area_building_manual=records[0].getValue("bl.area_building_manual");
		  var area_rm=records[0].getValue("bl.area_rm");
			
		var	  str_url_link_bl = '<a href="#" onclick=\'showBlInfo("'+bl_id+'")\'>'+getMessage("<建筑物房产信息摘要>")+'</a>';
		var	  str_url_link_fl = '<a href="#" onclick=\'showBlFlRmCatInfo("'+bl_id+'")\'>'+getMessage("<楼层房屋类别叠堆图>")+'</a>';
		  var html="<div id='info'>"+getMessage("大楼名")+":"+bl_id+" <br> "+getMessage('大楼用途')+":"+use1+"<br>"+getMessage("建筑面积")+":"+area_building_manual+"平米"+" <br> "+
				getMessage("使用面积")+":"+area_rm+"平米"+" <br> "+str_url_link_bl+" <br> "+str_url_link_fl+"</br> </div>";	
			
		  var head=bl_id;
			
			infowindow.setContent(html);
			infowindow.setTitle(head);
			infowindow.open(map,marker);
	  });
	  
	}
function attachDetailsInfo(map,brand) {
	 
	 var infowindow = new sogou.maps.InfoWindow(
		      { content: "" ,
		    	title: "" 
		      });
		  //添加单击监听事件
	    sogou.maps.event.addListener(brand, 'click', function() { 
			  var lat=brand.getPosition().x;
			  var lon=brand.getPosition().y;
			  var bl_id=brand.getContent();
			  var records=controller.blDS.getRecords(  "bl.bl_id='"+blId+"'" );
			  
			  var use1=records[0].getValue("bl.use1");
			  var area_building_manual=records[0].getValue("bl.area_building_manual");
			  var area_rm=records[0].getValue("bl.area_rm");
				
				  str_url_link_bl = '<a href="#" onclick=\'showBlInfo("'+bl_id+'")\'>'+getMessage("<建筑物房产信息摘要>")+'</a>';
				  str_url_link_fl = '<a href="#" onclick=\'showBlFlRmCatInfo("'+bl_id+'")\'>'+getMessage("<楼层房屋类别叠堆图>")+'</a>';
			  var html="<div id='info'>"+getMessage("大楼名")+":"+bl_id+" <br> "+getMessage('大楼用途')+":"+use1+"<br>"+getMessage("建筑面积")+":"+area_building_manual+"平米"+" <br> "+
					getMessage("使用面积")+":"+area_rm+"平米"+" <br> "+str_url_link_bl+" <br> "+str_url_link_fl+"</br> </div>";	
		      var head=bl_id;
				infowindow.setContent(html);
				infowindow.setTitle(head);
				infowindow.open(map,brand);
		  });
		  
}


