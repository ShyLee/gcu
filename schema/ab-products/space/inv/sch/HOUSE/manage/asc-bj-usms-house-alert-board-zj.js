var caDefEq = View.createController('caDefEq', {  
	
    crtRow: null,  
    restriction: null, 
    isNew: true, 
    consoleRestriction: null,  
    afterInitialDataFetch: function(){
	  	 this.detailsconsole.sortEnabled = false;
	  	 if (this.detailsconsole.rows.length == 0) {
	  	  	this.detailsconsole.refresh();
	  	 }
	    document.getElementById("idd1").innerHTML="<font size='2'>30天内</font>";
		document.getElementById("idd2").innerHTML="<font size='2'>10天内</font>";
		document.getElementById("idd3").innerHTML="<font size='2'>到(超)期</font>";
      },
      detailsconsole_afterRefresh: function(){
  		this.searchGridColor(this.detailsconsole.gridRows,this.detailsconsole.rows);
      },
	  searchGridColor: function(gridRows,rows) {
		  var i =0;
			var iday=0;
	    	gridRows.each(function(row) 
			{    		
	    		var color = '#FFF';
				var iday=rows[i]['sc_zzfcard.tixingtianshu'];
				if(parseFloat(iday)>10 && parseFloat(iday) <= 30){
					color = '#00CC66'; //green 
				}
				if (parseFloat(iday)>0 && parseFloat(iday) <= 10) {
	    			color = '#FFFF00'; //Yellow 
	    		}
				if(parseFloat(iday)<=0){
					color = '#FF3333'; //Red
				}
	            var cellEl = Ext.get(row.cells.items[0].dom);
	        	cellEl.setStyle('background-color', color);
	            i++;     
			});	
	    },
  
	    DateAdd: function(interval,number,date){
	    	var currentDay=new Date(date.toDateString());
	        switch(interval){
	          case "m" : currentDay.setMonth(currentDay.getMonth()+number); break;
	          case "w" : currentDay.setDate(currentDay.getDate()+number);  break;
	          case "d" : currentDay.setDate(date.getDate()+number);break;
	        }
	        return   currentDay;
	    }

});

