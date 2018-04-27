var abReletRoomController = View.createController("abReletRoomController", {
	cardId:"",
	afterInitialDataFetch: function(){
		 this.tabs = View.getControlsByType(parent, 'tabs')[0];
		 var array=[];
		 array.push("ytz");
		 array.push("yrz");
		 var restriction = new Ab.view.Restriction();
	     restriction.addClause("sc_zzfcard.card_status", array, "in");
	     restriction.addClause("sc_zzfcard.is_renew", "2", "=");
	     this.finishPanel.refresh(restriction);
	},
	needPanel_select_onClick:function(){
		var grid =this.needPanel;
	    var selectedRow = grid.rows[grid.selectedRowIndex];
	    var carId= selectedRow["sc_zzfcard.card_id"];
	    
	    var tabs = this.tabs;
	    var nextTabName = 'detailsTab';
	   	tabs.cardId=carId;
	   	
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('sc_zzfcard.card_id',carId, '=');
	    tabs.restriction = restriction;
	    
	    tabs.findTab(nextTabName).loadView();
		tabs.findTab(nextTabName).show(true);
		tabs.selectTab(nextTabName,restriction,false,false,true);
	},
	
	showDetail:function(flag){	
		if(flag=="1"){
			var grid =this.needPanel;
		}else if(flag=="2"){
			var grid =this.finishPanel;
		}else{
			var grid =this.xqListPanel;
		}		
	    var selectedRow = grid.rows[grid.selectedRowIndex];
	    var card_id= selectedRow["sc_zzfcard.card_id"];
		View.openDialog('asc-bj-usms-house-card.axvw', null, true, {
            width: 880,
            height: 600,
            card_id:card_id,
            closeButton: false
        });
	 },
	 
	 finishPanel_onShowAll:function(){
		 var restriction = new Ab.view.Restriction();
	     restriction.addClause("sc_zzfcard.card_status", "yxq", "=");
	     this.xqListPanel.refresh(restriction);
	     this.xqListPanel.showInWindow({
	      x:300,
	      y:300,
	      width: 800,
	      height: 800
	     });
	 },
	 
	 finishPanel_onXuzu:function(){
		 var panel = this.finishPanel;
		 var selectedIndex = panel.selectedRowIndex;
		 var card_id = panel.rows[selectedIndex]["sc_zzfcard.new_card_id"];
		 View.openDialog('asc-bj-usms-house-card.axvw', null, true, {
	            width: 880,
	            height: 600,
	            card_id:card_id,
	            closeButton: false
	        });
	 }
	 
});