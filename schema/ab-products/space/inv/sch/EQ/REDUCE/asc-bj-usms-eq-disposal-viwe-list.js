var contorller=View.createController('disposeViewForm',{
	afterInitialDataFetch: function(){
		addXuHao(this.returnDisposeListPanel);
		addXuHao(this.eqChangeItemPanel);
	},
	eqChangeItemPanel_afterRefresh: function(){
		addXuHao(this.eqChangeItemPanel);
	},
	consolePanel_onBtnShow: function(){
		var rtrId=this.consolePanel.getFieldValue('return_dispose.rtr_dip_id');
		var dvId=this.consolePanel.getFieldValue('return_dispose.dv_id');
		var czDate=this.consolePanel.getFieldValue('return_dispose.date_approved');
		var consoleRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(rtrId)){
			consoleRes.addClause('return_dispose.rtr_dip_id',rtrId,'=');
		}
		if(valueExistsNotEmpty(dvId)){
			consoleRes.addClause('return_dispose.dv_id','%'+dvId+'%','LIKE');
		}
		if(valueExistsNotEmpty(czDate)){
			consoleRes.addClause('return_dispose.date_approved',czDate,'=');
		}
		this.eqChangeItemPanel.show(false);
		this.returnDisposeListPanel.refresh(consoleRes);
		addXuHao(this.returnDisposeListPanel);
	},
	
	consolePanel_onBtnClear: function(){
		this.consolePanel.clear();
		this.returnDisposeListPanel.restriction=null;
		this.eqChangeItemPanel.show(false);
		this.returnDisposeListPanel.refresh("");
	}
});
function showSelectPanel(value){
	View.panels.get('eqChangeItemPanel').show(true);
	dipId=value.restriction['return_dispose.rtr_dip_id'];
	var res=new Ab.view.Restriction();
	res.addClause('eq_change.rtr_dip_id',dipId,'=');
	View.panels.get('eqChangeItemPanel').refresh(res);
	var itemPanel=View.panels.get('eqChangeItemPanel');
	addXuHao(itemPanel);
}

function addXuHao(addXuHaoPanel){
	
	var rows=addXuHaoPanel.gridRows;
	if(rows.length>0){
		for(var i=0;i<rows.length;i++){
			var row=rows.get(i);
			row.cells.items[0].dom.innerHTML=i+1;
			
		}
	}
}