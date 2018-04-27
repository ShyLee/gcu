/*********************************************************************
 JavaScript File: ab-eq-locate-detail.js

 John Till
 3/9/05
 *********************************************************************/


var bl_id, fl_id, rm_id, assetTable;


function addTCAsset(assetType)
{
  assetTable = assetType;

  bl_id = getCookie("ab_eq_locate_bl_id_cookie");
  fl_id = getCookie("ab_eq_locate_fl_id_cookie");
  rm_id = getCookie("ab_eq_locate_rm_id_cookie");

//	var strURLLink = "ab-eq-locate-add-"+assetType+".axvw";
//	var newWindow = openNewContent(strURLLink, "");
//	if (newWindow) newWindow.focus();

	var strURLLink = "ab-eq-locate-add-"+assetType+".axvw?handler=com.archibus.config.ActionHandlerDrawing&"+assetType+"_id=NEWASSET";
	var newWindow = openNewContent(strURLLink, "");
	if (newWindow) newWindow.focus();
}


function editTCAsset(fieldName, fieldValue)
{
	var assetType  = fieldName.split(".")[0];
	if(assetType != "rm")
	{
		var strURLLink = "ab-eq-locate-edit-"+assetType+".axvw?handler=com.archibus.config.ActionHandlerDrawing&"+fieldName+"="+fieldValue;
		var newWindow = openNewContent(strURLLink, "");
		if (newWindow) newWindow.focus();
	}
}
