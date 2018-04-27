/**
 * file Name : asc-bj-usms-bl-type-stat-dialog.js
 * 
 * used for the view file: asc-bj-usms-bl-type-stat-rpt.axvw
 * 
 * 
 * @author Keven.xi 
 * @date  2010-07-28
 * 
 */

var abScRptRmcatTypebyBl = View.createController('abScRptRmcatTypebyBl', {
	
	blId:"",
	blName:"",
	
	afterViewLoad:function(){
		
		this.abScRmcatTypeRptPanel.buildPostFooterRows = addTotalRow;
	   
		this.blId  = this.view.parameters['blId'];
		this.blName = this.view.parameters['blName'];
		
	    this.abScRmcatTypeRptPanel.addParameter('blIdRes', this.blId);
	    this.abScRmcatTypeRptPanel.addParameter('weiDingyiRes', '未定义');
	    
	},
	
	abScRmcatTypeRptPanel_afterRefresh: function(){
		 var title = String.format(getMessage('rptPanelTitle'), this.blName);
	 	 setPanelTitle('abScRmcatTypeRptPanel', title);
		 
		 this.updateRowNumberForRmcattypeReport();
    },

	updateRowNumberForRmcattypeReport: function(){
		var tempRmCat = "123";
		var rowNumber = 0;
		var rows = this.abScRmcatTypeRptPanel.rows;
		for (var i=0;i<rows.length;i++){
			var row =rows[i];
			// get room category from the row record
            var rmcat = row['rmcat.rm_cat'];
			row['rmcat.row_number'] = "";
			
			if (rmcat != tempRmCat){
				rowNumber++;
				row['rmcat.row_number'] = ""+rowNumber;
				tempRmCat = rmcat;
			}else{
				row['rmcat.rm_cat'] = "";
				row['rmcat.rmcat_name'] = "";
			}
		}
		
		this.abScRmcatTypeRptPanel.build();
     },
    
    linkToShow: function (){
	    var selectedIndex = this.abScRmcatTypeRptPanel.selectedRowIndex;
	   	var rmcatCode = this.abScRmcatTypeRptPanel.rows[selectedIndex]["rmcat.rm_cat"];
	   	if(rmcatCode==''){
	   		 rmcatCode=this.abScRmcatTypeRptPanel.rows[selectedIndex-1]["rmcat.rm_cat"];
	   	}
   	
	   	var rmcatName=this.abScRmcatTypeRptPanel.rows[selectedIndex]["rmcat.rmcat_name"];
	      
	   this.abScRmcatRmRptPanel.addParameter('blIdRes', this.blId);
	   this.abScRmcatRmRptPanel.addParameter('rmcatRes', rmcatCode);
	   
	   this.abScRmcatRmRptPanel.refresh();
	
	   var title = this.blName + "-" + rmcatCode;
	   setPanelTitle('abScRmcatRmRptPanel', title);
   }
     
});


/**
 * add total row if there are more lines
 * @param {Object} parentElement
 */
function addTotalRow(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	
	var totalCount = 0;
	var totalAreaShiyong = 0.0;
	var totalAreaJianZhu = 0.0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var fntstdCountValue = row['rmcat.rmcat_bl_area_shiyong'];
		if(row['rmcat.rmcat_bl_area_shiyong.raw']){
			fntstdCountValue = row['rmcat.rmcat_bl_area_shiyong.raw'];
		}
		if (!isNaN(parseInt(fntstdCountValue))) {
			totalAreaShiyong += parseFloat(fntstdCountValue);
		}
		
		var fntstdPriceValue = row['rmcat.rmcat_bl_area_jianzhu'];	
		if(row['rmcat.rmcat_bl_area_jianzhu.raw']){
			fntstdPriceValue = row['rmcat.rmcat_bl_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(fntstdPriceValue))) {
			totalAreaJianZhu += parseFloat(fntstdPriceValue);
		}
		
		var rmCountValue = row['rmcat.count_rm'];	
		if(row['rmcat.count_rm.raw']){
			rmCountValue = row['rmcat.count_rm.raw'];
		}
		if (!isNaN(parseInt(rmCountValue))) {
			totalCount += parseInt(rmCountValue);
		}
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianZhu = totalAreaJianZhu.toFixed(2);
	totalCount = ""+totalCount;
	
	var ds = this.getDataSource();
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: empty	
    addColumn(gridRow, 1);
    // column 2: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 3: empty	
    addColumn(gridRow, 1);
	// column 4: empty	
    addColumn(gridRow, 1);
	// column 5: room count
    addColumn(gridRow, 1, ds.formatValue('rmcat.count_rm', totalCount, true));
    // column 6: total area
    addColumn(gridRow, 1, ds.formatValue('rmcat.rmcat_bl_area_shiyong', totalAreaShiyong, true));
    // column 7: total area of Structure
    addColumn(gridRow, 1, ds.formatValue('rmcat.rmcat_bl_area_jianzhu', totalAreaJianZhu, true));
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


