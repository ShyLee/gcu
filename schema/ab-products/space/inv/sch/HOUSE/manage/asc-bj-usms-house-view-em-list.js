var controller = View.createController("controller", {
	showDetail:function(){	
		var grid =this.teacherForm;	
	    var selectedRow = grid.rows[grid.selectedRowIndex];
	    var card_id= selectedRow["sc_zzfcard.card_id"];
		View.openDialog('asc-bj-usms-house-card.axvw', null, true, {
            width: 880,
            height: 600,
            card_id:card_id,
            closeButton: false
        });
	 },
	 printProtocol:function(){
		var grid =this.teacherForm;	
	    var selectedRow = grid.rows[grid.selectedRowIndex];
	    var card_id= selectedRow["sc_zzfcard.card_id"];
	    var card_type= selectedRow["sc_zzfcard.card_type"];
	    var currentXmlName="";
	    //0;周转房(在校职工);1;周转房(外来人员);3;周转房(合同工)
	    if(card_type==0){
	    	currentXmlName="gcu-house-print-protocol-in";
	    }else if(card_type==1){
	    	currentXmlName="gcu-house-print-protocol-out";
	    }else if(card_type==3){
	    	currentXmlName="gcu-house-print-protocol-in-part";
	    	
	    }else{
	    	currentXmlName="gcu-house-print-protocol-in";
	    }
    	View.openDialog('asc-bj-usms-select-fixed-rpt-format-zzf.axvw', null, false, {
              width: 470,
              height: 200,
              xmlName: currentXmlName,
              parameters: {     
                 'CARD_ID':card_id 
             },
              closeButton: false
        });
	 },
	 printProtocolSafe:function(){
			var grid =this.teacherForm;	
		    var selectedRow = grid.rows[grid.selectedRowIndex];
		    var card_id= selectedRow["sc_zzfcard.card_id"];
	    	View.openDialog('asc-bj-usms-select-fixed-rpt-format-zzf.axvw', null, false, {
	              width: 470,
	              height: 200,
//	              xmlName: "gcu-house-print-protocol-in-part",//报表名称
//	              xmlName: "gcu-house-print-protocol-in-stop",//报表名称
//	              xmlName: "gcu-house-print-protocol-in",//报表名称
	              xmlName: "gcu-house-print-protocol-out-safe",//报表名称
	              parameters: {     
	                 'CARD_ID':card_id 
	             },
	              closeButton: false
	        });
		 }
});