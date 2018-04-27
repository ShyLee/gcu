var costByDepartmentController = View.createController('costByDepartmentCtrl', {
	dp_id: null,
	gridCostByDepartment_onRefresh: function(){
		if(this.dp_id != null){
			this.gridCostByDepartment.addParameter('departmentId', this.dp_id);
			this.gridCostByDepartment.refresh();
		}
	},
	gridDepartment_onRefresh: function(){
		this.gridDepartment.refresh();
	}
});

function loadCostsByDepartment(row){
	costByDepartmentController.dp_id = row['dp.dp_id'];
	costByDepartmentController.gridCostByDepartment_onRefresh();
}
