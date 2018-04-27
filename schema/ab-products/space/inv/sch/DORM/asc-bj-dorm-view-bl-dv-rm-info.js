var controller = View.createController('abViewDvRmByBlControl', {
	blId:"",
	feormale:"",
	afterInitialDataFetch:function(){
		var blId=this.view.parameters["blId"];
		this.blName=this.view.parameters["blName"];
		this.feormale=this.view.parameters["feormale"];
		this.blId=blId;
		if(blId!=undefined && blId!=""){
			this.dvRmInfoPanel.addParameter('blId',blId);
			this.dvRmInfoPanel.addParameter('feormale',this.feormale);
			this.dvRmInfoPanel.refresh();
			
			var allRm=getRmCount(this.blId,this.feormale,"");
			var unassignRm=getRmCount(this.blId,this.feormale,"null");
			var dorm_type;
			if(this.feormale=="1"){
				dorm_type="男生宿舍";
			}else if(this.feormale=="2"){
				dorm_type="女生宿舍";
			}
			this.dvRmInfoPanel.setTitle("【"+this.blName+"】("+dorm_type+")总房间数/空房间数="+allRm+"/"+unassignRm);
		}
	},
	dvRmInfoPanel_afterRefresh:function(){
		var rows=this.dvRmInfoPanel.rows;
		for(var i=0;i<rows.length;i++){
			var dvName=this.dvRmInfoPanel.rows[i].row.getRecord().getValue("rm.dv_name");
			if(dvName=="null"){
				this.dvRmInfoPanel.gridRows.items[i].cells.items[0].dom.innerHTML = "空房间";
			}
		}
	},
	dvRmDetailInfoPanel_afterRefresh:function(){
		this.dvRmDetailInfoPanel.setTitle("【"+this.dvName+"】房间列表");
	}
});
function onClickDv(afterShow){
    var grid = View.panels.get("dvRmInfoPanel");
    
    //判断是手动点击的还是查询后默认刷新第一条
    var selectedIndex = -1;
    if (afterShow) {
        selectedIndex = 0;
    }
    else {
        selectedIndex = grid.selectedRowIndex;
    }
    
    var dvId = grid.rows[selectedIndex]["rm.dv_id"];
    var dvName = grid.rows[selectedIndex]["rm.dv_name"];
    
    var restriction = new Ab.view.Restriction();
    if(dvId=="null"){
    	restriction.addClause("rm.dv_id", '', 'IS NULL', 'AND', true);
    }else{
    	restriction.addClause("rm.dv_id", dvId, "=");
    }
    if(dvName=="null"){
    	dvName="空房间";
    }
    controller.dvName=dvName;
    restriction.addClause("rm.bl_id", controller.blId, "=");
    restriction.addClause("rm.feormale", controller.feormale, "=");
    controller.dvRmDetailInfoPanel.refresh(restriction);
    controller.dvRmDetailInfoPanel.setTitle("【"+dvName+"】房间列表");
}
/**
 * 获取某一建筑物中的男生宿舍总房间数
 * 
 */
function getRmCount(blId,feormale,dvId){
	    var account = View.dataSources.get("rm_count_ds");
	    account.addParameter('blId',"rm.bl_id='"+blId+"'");
	    account.addParameter('feormale',"rm.feormale='"+feormale+"'");
	    if(dvId=="null"){
	    	account.addParameter('dvId',"rm.dv_id is null");
	    }
		var count_rm=account.getRecord().getValue("rm.count_rm");
 		return count_rm;
}
///**
// * 获取某一建筑物中的男生宿舍总房间数
// * 
// */
//function getRmUnassign(){
//	var parameters = {
//			tableName: 'rm',
//			fieldNames: toJSON(['rm.rm_id',]),
//			restriction: "rm.bl_id ='" + controller.blId + "' and feormale='"+controller.feormale+"' and dv_id is null"
//	};
//	var count_rm="";
//	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
//	var count_rm=result.data.records.length;
//	return count_rm;
//}