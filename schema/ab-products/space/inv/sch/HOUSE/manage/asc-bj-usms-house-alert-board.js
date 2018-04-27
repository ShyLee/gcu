var caDefEq = View.createController('caDefEq', {  
	
    crtRow: null,  
    restriction: null, 
    isNew: true, 
    consoleRestriction: null,  
    DateAdd: function(interval,number,date){
    	var currentDay=new Date(date.toDateString());
        switch(interval){
          case "m" : currentDay.setMonth(currentDay.getMonth()+number); break;
          case "w" : currentDay.setDate(currentDay.getDate()+number);  break;
          case "d" : currentDay.setDate(date.getDate()+number);break;
        }
        return   currentDay;
    },
    filterFn : function(){
    	var grid = View.panels.get('abScDefDeAreaGrid');
    	var formwindowshow = View.panels.get('formwindowshow');
	    var index = grid.selectedRowIndex;
	    var record = grid.gridRows.get(index).getRecord();	   
	    var cardId = record.getValue('sc_zzfcard.card_id');	
	    formwindowshow.showInWindow({
	    width: 600,
        height: 180
       });
       var restriction=new Ab.view.Restriction();
	    restriction.addClause("sc_zzfcard.card_id",cardId,"=");
	    formwindowshow.refresh(restriction);
    },
    
    formwindowshow_onShowhistory: function(){
    	var cardId=this.formwindowshow.getFieldValue('sc_zzfcard.card_id');
    	var year=this.formwindowshow.getFieldValue('sc_zzfrent_details.year');
    	var month=this.formwindowshow.getFieldValue('sc_zzfrent_details.month');
    	  this.formwindow2.showInWindow({
    		    width: 500,
    	        height:270
    	       });
    	var restriction=new Ab.view.Restriction();
  	    restriction.addClause("sc_zzfrent_details.card_id",cardId,"=");
  	    restriction.addClause("sc_zzfrent_details.year",year,"=");
  	    restriction.addClause("sc_zzfrent_details.month",month,"=");
  	    this.formwindow2.refresh(restriction);
    },
    
    selfGzcPayForm_dkselect_onClick: function(row){
    	var grid = View.panels.get('selfGzcPayForm');
    	var formwindow3 = View.panels.get('formwindow3');
    	formwindow3.showInWindow({
    		width: 800,
    		height: 325
    	});
	    var cardId=row.getFieldValue('sc_zzfcard.card_id');	
	    var restriction=new Ab.view.Restriction();
	    restriction.addClause("sc_zzfcard.card_id",cardId,"=");
	    formwindow3.refresh(restriction);
    },
    
    formwindow3_onEdit :function(){
    	var grid = View.panels.get('selfGzcPayForm');
    	var formwindow4 = View.panels.get('formwindow4');
	    formwindow4.showInWindow({
	    width: 500,
        height: 260
        });
       var cardId = this.formwindow3.getFieldValue('sc_zzfcard.card_id');	
	   var restriction=new Ab.view.Restriction();
	   restriction.addClause("sc_zzfrent_details.card_id",cardId,"=");
	   formwindow4.refresh(restriction);
    },
    
    formwindow4_onSave: function(){
    	var formwindow4=this.formwindow4;
    	var date_payrent=this.formwindow4.getFieldValue('sc_zzfrent_details.date_payrent');
    	var actual_payoff=this.formwindow4.getFieldValue('sc_zzfrent_details.actual_payoff');
    	var note1=this.formwindow4.getFieldValue('sc_zzfrent_details.note1');
    	if(date_payrent==""){
    		View.showMessage("请填写缴费日期！");
    		return;
    	}
    	if(actual_payoff==""){
    		View.showMessage("请填写本月扣房租！");
    		return;
    	}
    	if(note1==""){
    		View.showMessage("请填写备注！");
    		return;
    	}

    	var seccess=this.formwindow4.save();
    	if(seccess){
    		View.showMessage("保存成功！");
    	}
    }
});

function onRefreshRoomGrid(){
	var projectGrid = View.panels.get("abScDefDeAreaGrid");
	var restriction = new Ab.view.Restriction;
	var projectId = projectGrid.rows[projectGrid.selectedRowIndex]["rm.project_id"];
	ascBjUsmsProjectAlertBoardController.projectName = projectGrid.rows[projectGrid.selectedRowIndex]["sc_project.name"];
	restriction.addClause("sc_project.project_id",projectId,'=');
	var roomGrid = View.panels.get("projectRoomGrid");
	roomGrid.refresh(restriction);
};

function filterFn(){
	 var grid = View.panels.get('abScDefDeAreaGrid');
	    var index = grid.selectedRowIndex;
	    var record = grid.gridRows.get(index).getRecord();	   
	    var cardId = record.getValue('sc_zzfcard.card_id');
   var restriction=new Ab.view.Restriction();
   restriction.addClause("sc_zzfcard.card_id",this.cardId,"=");
   this.formwindow2.showInWindow({
       width: 800,
       height: 300
   })
}

