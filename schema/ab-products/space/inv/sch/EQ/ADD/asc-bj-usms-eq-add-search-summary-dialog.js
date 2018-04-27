var controller=View.createController('summaryDialogForm',{
	afterInitialDataFetch: function(){
		
		
		
		if (this.view.parameters){
			var add_eq_id = this.view.parameters['add_eq_id'];
			if(valueExistsNotEmpty(add_eq_id)){
 				var restriction=new Ab.view.Restriction();
				restriction.addClause("add_eq.add_eq_id",add_eq_id,"=");
 				this.BZDetialPanel.refresh(restriction);
 				var b=1;
 				
 			}
			
			var res=new Ab.view.Restriction();
			var addEqId=this.BZDetialPanel.getFieldValue('add_eq.add_eq_id');
			res.addClause('eq.add_eq_id',addEqId,'=');
			this.SNPanelGrid.refresh(res);
 		}	
	},
//	afterViewLoad: function(){
//		if (this.view.parameters){
//			var add_eq_id = this.view.parameters['add_eq_id'];
//			if(valueExistsNotEmpty(add_eq_id)){
// 				var restriction=new Ab.view.Restriction();
//				restriction.addClause("add_eq.add_eq_id",add_eq_id,"=");
// 				var record = this.ascBjUsmsEqAddSearchSummaryAddEqDs.getRecord(restriction);
// 				
// 			}
// 		}	
//	}
});