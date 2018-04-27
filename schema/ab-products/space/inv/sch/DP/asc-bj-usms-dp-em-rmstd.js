/**
 *@author kevenxi
 */
var ascBjUsmsDpEmRmStdController = View.createController('ascBjUsmsDpEmRmStdController', {
	
//	afterViewLoad:function(){
//		$('rmstd').selectedIndex = 0;
//	},
//	
    ascBjUsmsDpEmRmStdConsole_onShow: function(){
        var restriction = this.getConsoleRestriction();
        this.ascBjUsmsDpEmRmStdGrid.refresh(restriction);
    },
	
	getConsoleRestriction:function(){
		var restriction = new Ab.view.Restriction;
		var dvId = this.ascBjUsmsDpEmRmStdConsole.getFieldValue("dv.dv_id");
		var buId = this.ascBjUsmsDpEmRmStdConsole.getFieldValue("dv.bu_id");
		var siteName = this.ascBjUsmsDpEmRmStdConsole.getFieldValue("bl.site_id");
		var blName = this.ascBjUsmsDpEmRmStdConsole.getFieldValue("bl.name");
		
		
		if (dvId != "") {
			restriction.addClause("dv.dv_id",dvId+'%','LIKE');
		}
		if (buId != "") {
			restriction.addClause("em.bu_id",buId+'%','LIKE');
		}
		if (siteName != "") {
			restriction.addClause("em.site_id",siteName+'%','LIKE');
		}
		if (blName != "") {
			restriction.addClause("em.blName",blName+'%','LIKE');
		}
		
		return restriction;
		
	},
	
	ascBjUsmsDpEmRmStdConsole_onClear:function(){
		this.ascBjUsmsDpEmRmStdConsole.clear();
		
	},
	
	ascBjUsmsDpEmRmStdGrid_afterRefresh:function(){
	//	this.editRowsEmOption1Column();
	},
	
	editRowsEmOption1Column:function(){
		var rows = this.ascBjUsmsDpEmRmStdGrid.rows;
		var rowEl;
		
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			rowEl = Ext.get(row.row.dom).dom;
			var option1 = row['em.option1']; 
			if (option1=="1"){
				rowEl.cells[7].innerHTML = "单人间";
			}else if (option1=="2"){
				rowEl.cells[7].innerHTML = "双人间";
			}else if(option1==""||option1.length<1){
				rowEl.cells[7].innerHTML = "";
			}else {
				rowEl.cells[7].innerHTML = "多人间";
			}
		}
	}
})
