/**
 * @author Keven.xi
 */
var overallDvMainControll = View.createController('ascBjUsmsOverallDeptOccuMainController', {

    siteId: "",
    mainTabs: null,
    
    afterViewLoad: function(){
        this.mainTabs = View.getControl('', 'campusTabs');
        this.siteId = this.mainTabs.currentSiteId;
        this.ascBjUsmsOverallDeptOccuMain_dvGrid.buildPostFooterRows = addTotalRow;
		
        this.ascBjUsmsOverallDeptOccuMain_siteBasicGrid.addParameter('siteIdRes', this.siteId);
		
		this.ascBjUsmsOverallDeptOccuMain_dvGrid.addParameter('xuexiaoBuDv', "学校");
		this.ascBjUsmsOverallDeptOccuMain_dvGrid.addParameter('wuDv', "无");
		this.ascBjUsmsOverallDeptOccuMain_dvGrid.addParameter('officeRmRes', "办公室");
		this.ascBjUsmsOverallDeptOccuMain_dvGrid.addParameter('meetingRmRes', "会议室");
        this.ascBjUsmsOverallDeptOccuMain_dvGrid.addParameter('teaOfficeRmRes', "教师办公室");
        this.ascBjUsmsOverallDeptOccuMain_dvGrid.addParameter('siteIdRes', this.siteId);
    },
    afterInitialDataFetch:function(){
		
	},
    ascBjUsmsOverallDeptOccuMain_dvGrid_afterRefresh: function(){
    	this.setStyle();
       
    },
    
    getRecord: function(records, dv_id){
        var record = null;
        for (var i = 0; i < records.length; i++) {
            record = records[i];
            var tempDv = record.getValue("dv.dv_id");
            if (dv_id == tempDv) {
                return record;
            }
        }
        return null;
    },
    
    setStyle: function(){
        var rows = this.ascBjUsmsOverallDeptOccuMain_dvGrid.rows;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            for (var j = 7; j < 10; j++) {
                row.row.cells.items[j].dom.bgColor = '#fff5d1';
            }
        }
    },
	
	setSumValueInSitePanel:function(totalAreaJianzhu,totalAreaShiyong){
		    document.getElementById("area_jianzhu").innerHTML= ""+totalAreaJianzhu;
	        document.getElementById("area_shiyong").innerHTML = ""+totalAreaShiyong;
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
	
	var totalAreaShiyong = 0.0;
	var totalAreaJianzhu = 0.0;
	var totalRmCount = 0;
	var totalEmCount = 0;
	var totalAreaOffice = 0.0;
	var totalAreaMeeting = 0.0;
	var totalAreaTeaOffice = 0.0;
	
    for (var i = 0; i < this.rows.length; i++) {
        var row = this.rows[i];
        
		//使用面积
		var areaShiyong = row['dv.total_area_shiyong'];
		if(row['dv.total_area_shiyong.raw']){
			areaShiyong = row['dv.total_area_shiyong.raw'];
		}
		if (!isNaN(parseFloat(areaShiyong))) {
			totalAreaShiyong += parseFloat(areaShiyong);
		}
		//建筑面积
		var areaJianzhu = row['dv.total_area_jianzhu'];
		if(row['dv.total_area_jianzhu.raw']){
			areaJianzhu = row['dv.total_area_jianzhu.raw'];
		}
		if (!isNaN(parseFloat(areaJianzhu))) {
			totalAreaJianzhu += parseFloat(areaJianzhu);
		}
		//办公室面积
		var areaOffice = row['dv.area_comn_ocup'];
		if(row['dv.area_comn_ocup.raw']){
			areaOffice = row['dv.area_comn_ocup.raw'];
		}
		if (!isNaN(parseFloat(areaOffice))) {
			totalAreaOffice += parseFloat(areaOffice);
		}
		//会议室面积
		var areaMeeting = row['dv.area_conference'];
		if(row['dv.area_conference.raw']){
			areaMeeting = row['dv.area_conference.raw'];
		}
		if (!isNaN(parseFloat(areaMeeting))) {
			totalAreaMeeting += parseFloat(areaMeeting);
		}
		//教师工作室面积
		var areaTeaOffice = row['dv.area_comn_nocup'];
		if(row['dv.area_comn_nocup.raw']){
			areaTeaOffice = row['dv.area_comn_nocup.raw'];
		}
		if (!isNaN(parseFloat(areaTeaOffice))) {
			totalAreaTeaOffice += parseFloat(areaTeaOffice);
		}
		
		
		//房间数
		var countRm = row['dv.total_count_rm'];	
		if(row['dv.total_count_rm.raw']){
			countRm = row['dv.total_count_rm.raw'];
		}
		if (!isNaN(parseInt(countRm))) {
			totalEmCount += parseInt(countRm);
		}
		//教职工人数
		var countEm = row['dv.total_count_em'];	
		if(row['dv.total_count_em.raw']){
			countEm = row['dv.total_count_em.raw'];
		}
		if (!isNaN(parseInt(countEm))) {
			totalEmCount += parseInt(countEm);
		}
		
    }
	
	totalAreaShiyong = totalAreaShiyong.toFixed(2);
	totalAreaJianzhu = totalAreaJianzhu.toFixed(2);
	totalRmCount = totalRmCount.toFixed(0);
	totalEmCount = totalEmCount.toFixed(0);
	totalAreaOffice = totalAreaOffice.toFixed(2);
	totalAreaMeeting = totalAreaMeeting.toFixed(2);
	totalAreaTeaOffice = totalAreaTeaOffice.toFixed(2);
	
	overallDvMainControll.setSumValueInSitePanel(totalAreaJianzhu,totalAreaShiyong);
	//overallDvMainControll.totalAreaJianzhu=totalAreaJianzhu;
	//overallDvMainControll.totalAreaShiyong=totalAreaShiyong;
	//overallDvMainControll.setSumValueInSitePanel();
    // create new grid row and cells containing statistics
    var gridRow = document.createElement('tr');
    parentElement.appendChild(gridRow);
    // column 1: 'Total' title
    addColumn(gridRow, 1, getMessage('total'));
	// column 2: empty	
    addColumn(gridRow, 1);
	// column 3: empty	
    addColumn(gridRow, 1);
	// column 4: total employee count 
    addColumn(gridRow, 1,totalEmCount);
    // column 5: total room count
    addColumn(gridRow, 1,  totalRmCount);
	// column 6: total area jianzhu 
    addColumn(gridRow, 1,  totalAreaJianzhu);
    // column 7: total area shiyong
    addColumn(gridRow, 1, totalAreaShiyong);
	// column 8: total area office 
    addColumn(gridRow, 1,totalAreaOffice);
    // column 9: total area meeting
    addColumn(gridRow, 1,  totalAreaMeeting);
	// column 10: total area teacher office
    addColumn(gridRow, 1,totalAreaTeaOffice);
    
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


