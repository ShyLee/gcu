
var abDwgChangesByBlCtrl = View.createController('abDwgChangesByBlCtrl',{
	// selected building id
	blId: null,
	
	//selected floor id
	flId: null,
	
	/*
	 * on filter 
	 * TO DO: format console values for SQL
	 */
	abDwgChangesByBlFilter_onShow: function(){
		var paramSiteId = "1 = 1";
		var paramBlId = "1 = 1";
		var siteId = this.abDwgChangesByBlFilter.getFieldValue("bl.site_id");
		if (valueExistsNotEmpty(siteId)){
			paramSiteId = "site.site_id = '" + siteId + "'";
		}
		var blId = this.abDwgChangesByBlFilter.getFieldValue("bl.bl_id");
		if (valueExistsNotEmpty(blId)){
			paramBlId = "bl.bl_id = '" + blId + "'";
		}
		this.blId = null;
		this.flId = null;
		this.abDwgChangesByBlVersions.show(false, true);
		this.abDwgChangesByBlDwg.show(false, true);
		this.abDwgChangesByBlTreeSite.addParameter("siteId", paramSiteId);
		this.abDwgChangesByBlTreeSite.addParameter("blId", paramBlId);
		this.abDwgChangesByBlTreeSite.refresh();
	},
	abDwgChangesByBlVersions_onDown:function(row){
		var downLoadDwgName=row.getRecord().getValue("afm_dwgvers.file_name");
		
		if(""!=downLoadDwgName){
			//var subName=downLoadDwgName.substring(0,downLoadDwgName.lastIndexOf("."));
			download({name:downLoadDwgName,downLink:downLoadDwgName})
		}
	},
	abDwgChangesByBlDwg_onDown:function(row){
		var downLoadDwgName=row.getRecord().getValue("afm_dwgs.dwg_name");
		if(""!=downLoadDwgName){
			download({name:downLoadDwgName+".dwg",downLink:downLoadDwgName+".dwg"})
		}
	},
	abDwgChangesByBlFilter_onClear:function(){
		this.abDwgChangesByBlTreeSite.refreshClearAllFilters();
		this.abDwgChangesByBlDwg.show(false);
	}
	
});

/*
 * click node event
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abDwgChangesByBlCtrl");
	var objTree = View.panels.get("abDwgChangesByBlTreeSite");
	var lastNodeClicked = objTree.lastNodeClicked;
	var flId = null;
	var blId = null;
	if (lastNodeClicked.restriction.findClause("bl.bl_id")){
		blId = lastNodeClicked.restriction.findClause("bl.bl_id").value;
		flId = null;
	}else if (lastNodeClicked.restriction.findClause("fl.fl_id")){
		flId = lastNodeClicked.restriction.findClause("fl.fl_id").value;
		blId = lastNodeClicked.parent.restriction.findClause("bl.bl_id").value;
	}
	controller.flId = flId;
	controller.blId = blId;
	var restriction = new Ab.view.Restriction();
	var restrValue = blId + (valueExistsNotEmpty(flId)?';'+flId:';%');
	restriction.addClause("afm_dwgs.space_hier_field_values", restrValue, "LIKE");
	controller.abDwgChangesByBlDwg.refresh(restriction);
	controller.abDwgChangesByBlVersions.show(false, true);
}


function download(param){
	var iframe = document.createElement("iframe");
	iframe.style.display="none";
	iframe.name="hiddentAreaForDownLoad";
	iframe.id="hiddentAreaForDownLoad";
	var downForm = document.createElement("form");
	
	downForm.style.display="none";
	downForm.action = "/archibus/schema/ab-products/space/inv/sch/fileDownLoad/jsp/FileDownLoadForDWG.jsp";
	downForm.target="hiddentAreaForDownLoad";
	downForm.method="post";
	downForm.id="downloadForm";
	downForm.name="downloadForm";
	
	var fileName = document.createElement("input");
	fileName.value = param.name;
	fileName.name = "name";
	
	var fileDownLink = document.createElement("input");
	fileDownLink.value = param.downLink;
	fileDownLink.name = "downLink";
	
	downForm.appendChild(fileName);
	downForm.appendChild(fileDownLink);

	document.body.appendChild(iframe);
	document.body.appendChild(downForm);
	
	//主要解决IE请求链接在新窗口打开问题
	document.getElementById('hiddentAreaForDownLoad').contentWindow.name = 'hiddentAreaForDownLoad'; 
	downForm.submit();
}