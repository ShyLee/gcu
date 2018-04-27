var abScRptRmtypesAreabyRmcat = View.createController('abScRptRmtypesAreabyRmcatController', {
    
	dvId:"",
	
	afterViewLoad: function(){
		this.gridPanelByBu.show(false);
		this.perAreaBySelectBuPanel.show(false);
		this.gridPanelByBu.show(false);

		
		this.dashLeader_teachDvGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		this.dashLeader_manageDvGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_DZGL);
		
		this.abScDatebyRmcatChartPie.addParameter("less80",'1980年之前');
		this.abScDatebyRmcatChartPie.addParameter("80to89",'1980年-1990年');
		this.abScDatebyRmcatChartPie.addParameter("90to99",'1990年-2000年');
		this.abScDatebyRmcatChartPie.addParameter("00to09",'2000年-2010年');
		this.abScDatebyRmcatChartPie.addParameter("more2010",'2010年之后');
		this.abScDatebyRmcatChartPie.addParameter("nullBLDate",'没有建造年代');
		
		this.caculatePerNumChart.addParameter("quanxiao",'全校');
		
		this.gridPanelByBuAllSchool.addParameter("quanxiao",'全校');
		this.gridPanelByBuAllSchool.addParameter("weifenpei",'未分配');
		this.gridPanelByBuAllSchool.addParameter("xuexiao",'学校');
		
		this.dialogRmcatGridReport.buildPostFooterRows = addTotalRowForCatType;
	},
	abScRmtypebyRmcatChartPie_onRmCatReport:function(){
		 this.rmCatReportGrid.showInWindow({
	            width: 900,
	            height: 500
	        });
	        this.rmCatReportGrid.refresh();
	},
	
	abScDatebyRmcatChartPie_onRmCatReport:function(){
		this.dateReportGrid.showInWindow({
			width: 800,
			height: 500
		});
		this.dateReportGrid.refresh();
	},
	/**
	 * show whole school rmcat
	 */
	dashLeader_teachDvGrid_onShowWholeSchoolRmcat:function(){
		this.dvId = "";
		this.dialogRmcatGridReport.addParameter('rmRes', "1=1");
		this.dialogRmcatGridReport.refresh();
		refreshChartPanel(this.dvId);
	},
	
	dialogRmcatGridReport_afterRefresh:function(){
		var title = "";
		if (this.dvId !=""){
			title = String.format(getMessage('rmcatGridTitleDv'), this.dvId);
			
		}
		this.dialogRmcatGridReport.setTitle(title);
	}
	
});
/**
 * 
 */
function onRefreshDvRmcatPanel(row){
	var dvGrid = row.command.getParentPanel();
	var dvId = dvGrid.rows[dvGrid.selectedRowIndex]["dv.dv_id"];
	abScRptRmtypesAreabyRmcat.dvId = dvId;
	var rmcatGrid = View.panels.get("dialogRmcatGridReport");
	rmcatGrid.addParameter('rmRes', "rm.dv_id='"+dvId+"'");
	rmcatGrid.refresh();
	refreshChartPanel(dvId);
}

function onShowDialogRmListGridByDvRmcat(){
	var rmcatGrid = View.panels.get("dialogRmcatGridReport");
	var rmcat = rmcatGrid.rows[rmcatGrid.selectedRowIndex]["rm.rm_cat"];
    var res = new Ab.view.Restriction();
    res.addClause("rm.rm_cat", rmcat, "=");
    if (abScRptRmtypesAreabyRmcat.dvId != ""){
		res.addClause("rm.dv_id", abScRptRmtypesAreabyRmcat.dvId, "=");
	}
    var rmListGrid = View.panels.get("dialogRmListGrid");
	rmListGrid.showInWindow({
        width: 800,
        height: 500
    });
    rmListGrid.refresh(res);
	setRmListTitle(rmcat);
}
function onShowDialogRmListGridByDvRmtype(){
	var rmcatGrid = View.panels.get("dialogRmcatGridReport");
	var rmcat = rmcatGrid.rows[rmcatGrid.selectedRowIndex]["rm.rm_cat"];
    var rmtype = rmcatGrid.rows[rmcatGrid.selectedRowIndex]['rm.rm_type'];
    var res = new Ab.view.Restriction();
    res.addClause("rm.rm_cat", rmcat, "=");
    res.addClause("rm.rm_type", rmtype, "=");
	if (abScRptRmtypesAreabyRmcat.dvId != ""){
		res.addClause("rm.dv_id", abScRptRmtypesAreabyRmcat.dvId, "=");
	}
	var rmListGrid = View.panels.get("dialogRmListGrid");
	rmListGrid.showInWindow({
        width: 800,
        height: 500
    });
    rmListGrid.refresh(res);
	setRmListTitle(rmcat,rmtype);
}

function setRmListTitle(rmcat, rmtype){
    var title = "";
    if (rmcat) {
        title = String.format(getMessage('rmListDialogTitle'), rmcat);
		
    }
     
    if (rmcat && rmtype) {
        title = String.format(getMessage('rmListDialogTitle'), rmcat+"--"+rmtype);
    }
    View.panels.get("dialogRmListGrid").setTitle(title);
}

function refreshChartPanel(dvId){
	var res = new Ab.view.Restriction();
	if (dvId != "") res.addClause("dv_id",dvId,"=");
	View.panels.get("abScRmtypebyRmcatChartPie").refresh(res);
	View.panels.get("abScDatebyRmcatChartPie").refresh(res);
	View.panels.get("caculatePerNumChart").refresh(res);
}
/**
 * 点击饼图显示按房屋类别统计建筑屋面积的信息
 * @param obj
 */
function showDetail(obj){
   
    var restriction = obj.restriction;
    var rmCatChartGrid=View.panels.get("rmcat_chartGrid");
    rmCatChartGrid.showInWindow({
        width: 800,
        height: 500
    });
    rmCatChartGrid.refresh(restriction);
}
/**
 * 点击饼图显示按年代统计建筑屋面积的信息
 * @param obj
 */
function showDateDetail(obj){
	
	var restriction =new Ab.view.Restriction();
	var niandai=obj.selectedChartData['bl.niandai'];
     if(niandai=='1980年之前'){
    	 restriction.addClause("bl.date_bl",'1980-01-01','&lt;');
     }else if(niandai=='1980年之前'){
    	 restriction.addClause("bl.date_bl",'1980-01-01','&lt;');
    	 restriction.addClause("bl.date_bl",'1980-12-31','&lt;=');
    }else if(niandai=='1980年-1990年'){
    	restriction.addClause("bl.date_bl",'1980-01-01','&gt;');
    	restriction.addClause("bl.date_bl",'1989-12-31','&lt;=');
    }else if(niandai=='1990年-2000年'){
    	restriction.addClause("bl.date_bl",'1990-01-01','&gt;');
    	restriction.addClause("bl.date_bl",'1999-12-31','&lt;=');
    }else if(niandai=='2000年-2010年'){
    	restriction.addClause("bl.date_bl",'2000-01-01','&gt;');
    	restriction.addClause("bl.date_bl",'2009-12-31','&lt;=');
    }else if(niandai=='2010年之后'){
    	restriction.addClause("bl.date_bl",'2010-01-01','&gt;');
    }else if(niandai=='没有建造年代'){
    	restriction.addClause("bl.date_bl", '', 'IS NULL', 'AND', true);
}
	
	var dateChartGrid=View.panels.get("date_chartGrid");
	dateChartGrid.showInWindow({
		width: 800,
		height: 500
	});
	dateChartGrid.refresh(restriction);
}

function addTotalRowForCatType(parentElement){
    if (this.rows.length < 2) {
        return;
    }
	var totalAreaShiyong = 0.0;
	var totalRmCount = 0;
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		var rmCountValue = row['rm.count_rm'];
		if(row['rm.count_rm.raw']){
			rmCountValue = row['rm.count_rm.raw'];
		}
		if (!isNaN(parseInt(rmCountValue))) {
			totalRmCount += parseFloat(rmCountValue);
		}
		
		var areaValue = row['rm.area_shiyong'];	
		if(row['rm.area_shiyong.raw']){
			areaValue = row['rm.area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(areaValue))) {
			totalAreaShiyong += parseFloat(areaValue);
		}
		
    }
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	
	
	var ds = this.getDataSource();
	
	
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: 
	addColumn(gridRow, 1);
	// column 3: Count Room
    addColumn(gridRow, 1, ds.formatValue('rm.count_rm', totalRmCount, true));
    // column 4: total area
    addColumn(gridRow, 1, ds.formatValue('rm.area_shiyong', totalAreaShiyong, true));
	
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

/**
 * 通过单位大类
 * 
 */
function selectPerAreaByBu(obj){
	var buId=obj.selectedChartData['em.buId'];
	var perAreaBySelectBuPanel=View.panels.get('perAreaBySelectBuPanel');
	perAreaBySelectBuPanel.addParameter("quanxiao",'全校');
	perAreaBySelectBuPanel.addParameter("weifenpei",'未分配');
	perAreaBySelectBuPanel.addParameter("xuexiao",'学校');
	perAreaBySelectBuPanel.addParameter("buId",buId);
	if(buId=='全校'){
		var gridPanelByBuAllSchool=View.panels.get('gridPanelByBuAllSchool');
		gridPanelByBuAllSchool.show(true);
		gridPanelByBuAllSchool.showInWindow({
	        width: 800,
	        height: 500
		});
		gridPanelByBuAllSchool.refresh();
		gridPanelByBuAllSchool.setTitle('全校所有单位的人均使用面积统计表');
	}else{
		perAreaBySelectBuPanel.show(true);
		perAreaBySelectBuPanel.showInWindow({
	        width: 800,
	        height: 500
		});
		
		perAreaBySelectBuPanel.refresh();
		perAreaBySelectBuPanel.setTitle('部门类别为<'+buId+'>下各单位人均面积');
		var gridPanelByBu=View.panels.get('gridPanelByBu');
		gridPanelByBu.addParameter("quanxiao",'全校');
		gridPanelByBu.addParameter("weifenpei",'未分配');
		gridPanelByBu.addParameter("xuexiao",'学校');
		gridPanelByBu.addParameter("buId",buId);
		gridPanelByBu.refresh();
		gridPanelByBu.show(false);
		gridPanelByBu.setTitle('部门类别为<'+buId+'>下各单位人均面积');
	}
	
}

function perAreaBySelectBuMethod(){
	var gridPanelByBu=View.panels.get('gridPanelByBu');
	
	gridPanelByBu.showInWindow({
        width: 800,
        height: 500
	});
	gridPanelByBu.show(true);
	
}

