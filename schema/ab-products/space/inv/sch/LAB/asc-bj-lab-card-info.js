var ascController = View.createController('ascController', {
	showEqList:function(){
		  var panel = this.labListPanel;
		  var selectedIndex = panel.selectedRowIndex;
		  var id = panel.rows[selectedIndex]["sc_lab.id"];
		  var option1 = panel.rows[selectedIndex]["sc_lab.option1"];
		  var lab_name = panel.rows[selectedIndex]["sc_lab.lab_name"];
		  
		  var array1=[];
		  var array3;
	      array1 = option1.split(',');
		  for(var i = 0; i < array1.length; i++){
				if(!valueExistsNotEmpty(array3)){
					array3="'"+array1[i]+"'";
				}else{
					array3=array3+",'"+array1[i]+"'";
				}
		  }
		  this.eqListPanel.addParameter("roomId","eq.bl_id||'|'||eq.fl_id||'|'||eq.rm_id in("+array3+")");	  
		  this.eqListPanel.refresh();
		  this.eqListPanel.setTitle("【"+lab_name+"】资产清单");
		  
		  var res1= new Ab.view.Restriction();
		  res1.addClause("sc_lab.id",id,"=");
		  this.labDetailPanel.refresh(res1,false);
		  this.labDetailPanel.setTitle("【"+lab_name+"】基本信息");
	}
});
