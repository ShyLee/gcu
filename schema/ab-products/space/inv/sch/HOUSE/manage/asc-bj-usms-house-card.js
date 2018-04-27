var controller = View.createController("controller", {
	cardId:"",
	afterInitialDataFetch: function(){
		var card_id=this.view.parameters["card_id"];
		this.cardId=card_id;
		this.teacherForm.show(true);
		var restriction=new Ab.view.Restriction();
		restriction.addClause("sc_zzfcard.card_id",this.cardId,"=");
		this.teacherForm.refresh(restriction,false);
	}
});

