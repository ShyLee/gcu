var abScRptDvRmcatbyBlControll = View.createController('abScRptDvRmcatbyBlControll', {
	
	blId:"",
	blName:"",
	
	afterViewLoad: function(){	
    
		this.abScDvRmcatRptPanel.buildPostFooterRows = addTotalRow;
		
		this.blId  = this.view.parameters['blId'];
		this.blName = this.view.parameters['blName'];
	    
	    this.abScDvRmcatRptPanel.addParameter('blIdRes', this.blId);
		this.abScDvRmcatRptPanel.addParameter('weiDingyiRes', '未定义');   
    },
    
    abScDvRmcatRptPanel_afterRefresh: function(){
		 var title = String.format(getMessage('rptPanelTitle'), this.blName);
	 	 setPanelTitle('abScDvRmcatRptPanel', title);
   },
    
	show:function(){
	    var selectedIndex = this.abScDvRmcatRptPanel.selectedRowIndex;
		var rmcatCode=this.abScDvRmcatRptPanel.rows[selectedIndex]["dv.rm_cat"];
		var dv_id = this.abScDvRmcatRptPanel.rows[selectedIndex]["dv.dv_id"];
		
		if(rmcatCode==''){
			 this.abScDvRmRptPanelq.addParameter('blIdRes', this.blId);
			 this.abScDvRmRptPanelq.addParameter('dvIdRes', dv_id);

		     var restriction = new Ab.view.Restriction();
			 restriction.addClause(
			     'dv.rm_cat',"" ,'IS NULL');
		     this.abScDvRmRptPanelq.refresh(restriction); 
		}else{
		    this.abScDvRmRptPanelq.addParameter('blIdRes', this.blId);
		    this.abScDvRmRptPanelq.addParameter('dvIdRes', dv_id);
		    this.abScDvRmRptPanelq.addParameter('rmCat', rmcatCode);
		    
		    var restriction = new Ab.view.Restriction();
			restriction.addClause(
			     'dv.rm_cat',rmcatCode);
		    this.abScDvRmRptPanelq.refresh(restriction); 
			
		}
		
	    var title = this.blName + "-" + rmcatCode;
	    setPanelTitle('abScDvRmRptPanelq', title);
		
	}
   
});

function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalCount = 0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['dv.dv_bl_area_shiyong'];
		if(row['dv.dv_bl_area_shiyong.raw']){
			fntstdCountValue = row['dv.dv_bl_area_shiyong.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['dv.count_rm'];	
		if(row['dv.count_rm.raw']){
			fntstdPriceValue = row['dv.count_rm.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalCount += parseFloat(fntstdPriceValue);
		}
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalCount = totalCount.toFixed(0);
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty	
    addColumn(gridRow, 1);
	// column 3: total room count 
    addColumn(gridRow, 1, ds.formatValue('dv.count_rm', totalCount, true));
    // column 4: total area
    addColumn(gridRow, 1, ds.formatValue('dv.dv_bl_area_shiyong', totalAreaShiyong, true));
    
}

/**
 * add column
 * @param {Object} gridRow
 * @param {int} count
 * @param {String} text
*/
function addColumn(gridRow, count, text){
    for (var i = 0; i < count; i++) {
        var gridCell = document.createElement('th');
        if (text) {
            gridCell.innerHTML = text;
            gridCell.style.textAlign = 'right';
            gridCell.style.color = 'blue';
        }
        gridRow.appendChild(gridCell);
    }
     
}
