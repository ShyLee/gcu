var caDefEq = View.createController('caDefEq', {  
	
    crtRow: null,  
    restriction: null, 
    isNew: true, 
    consoleRestriction: null,  
    afterInitialDataFetch: function(){
  	  	this.abScDefDeAreaGrid.sortEnabled = false;
		if (this.abScDefDeAreaGrid.rows.length == 0) {
		  	this.abScDefDeAreaGrid.refresh();
		 }
		document.getElementById("idd4").innerHTML="<font size='2'>>60天</font>";
		document.getElementById("idd5").innerHTML="<font size='2'>60天内</font>";
		document.getElementById("idd6").innerHTML="<font size='2'>租期到(超)期</font>";
      },
    DateAdd: function(interval,number,date){
    	var currentDay=new Date(date.toDateString());
        switch(interval){
          case "m" : currentDay.setMonth(currentDay.getMonth()+number); break;
          case "w" : currentDay.setDate(currentDay.getDate()+number);  break;
          case "d" : currentDay.setDate(date.getDate()+number);break;
        }
        return currentDay;
    },
    searchGridColor2: function(gridRows,rows) {
		var i =0;
		var iday=0;
    	gridRows.each(function(row) 
		{    		
    		var color = '#FFF';
			var iday=rows[i]['sc_zzfcard.xiangchatianshu'];
			if(parseFloat(iday)>60){
				color = '#00CC66'; //green 
			}
			if (parseFloat(iday)>0 && parseFloat(iday) <= 60) {
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
    abScDefDeAreaGrid_afterRefresh: function(){
		// after build color the grid for escalation values
		this.searchGridColor2(this.abScDefDeAreaGrid.gridRows,this.abScDefDeAreaGrid.rows);
    }
});

