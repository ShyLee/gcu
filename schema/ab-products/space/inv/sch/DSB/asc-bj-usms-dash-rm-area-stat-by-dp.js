/**
 * @author Keven.xi
 */


View.createController('ascBjUsmsDingeActualStatTeachController', {
	
	
	afterViewLoad:function(){
		//restriction : Main Campus
		
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('officeRes',"办公室");
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('meetingRes',"会议室");
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('commonOfficeRes',"公共办公用房");
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('adminAssistRes',"行政辅助用房");
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('teachOfficeRes',"教室办公室");
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('projectZXYFRes',"科研专项用房");
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('teachFUYFRes',"教学辅助用房");
		this.ascBjUsmsDingeActualStatTeach_dvSumGrid.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('officeRes',"办公室");
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('meetingRes',"会议室");
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('commonOfficeRes',"公共办公用房");
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('adminAssistRes',"行政辅助用房");
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('teachOfficeRes',"教室办公室");
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('projectZXYFRes',"科研专项用房");
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('teachFUYFRes',"教学辅助用房");
		this.ascBjUsmsDingeActualStatTeach_Over5.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
		
		
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('officeRes',"办公室");
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('meetingRes',"会议室");
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('commonOfficeRes',"公共办公用房");
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('adminAssistRes',"行政辅助用房");
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('teachOfficeRes',"教室办公室");
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('projectZXYFRes',"科研专项用房");
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('teachFUYFRes',"教学辅助用房");
		this.ascBjUsmsDingeActualStatTeach_vacant5.addParameter('buClassRes',ascBjUsmsConstantControl.BU_CLASS_JXKY);
	},
	
	ascBjUsmsDingeActualStatTeach_dvSumGrid_afterRefresh:function(){
		this.doWithEachRow();
		
	},
	
	
	doWithEachRow:function(){
		this.setStyle();
		
		var rows = this.ascBjUsmsDingeActualStatTeach_dvSumGrid.rows;
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			this.doAreaShiyongDinge(row);
		}
	},
	
	setStyle:function(){
		var rows = this.ascBjUsmsDingeActualStatTeach_dvSumGrid.rows;
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			for (var j=3;j<10;j++){
				row.row.cells.items[j].dom.bgColor = '#fff5d1';
			}
		}
	},
	
	/**
	 * 
	 * @param {Object} row
	 */
	doAreaShiyongDinge:function(row){
		
		//do with usable area of teaching division
		var totalAreaShiyong = row['dv.total_actual_area'];	
		if(row['dv.total_actual_area.raw']){
			totalAreaShiyong = row['dv.total_actual_area.raw'];
		}
		if (totalAreaShiyong == "")  totalAreaShiyong = 0.0;
		
		var totalAreaDinge = row['dv.total_dinge_area'];	
		if(row['dv.total_dinge_area.raw']){
			totalAreaDinge = row['dv.total_dinge_area.raw'];
		}
		if (totalAreaDinge == "")  totalAreaDinge = 0.0;
		
		//---begin
		var office_area = row['dv.office_area'];	
		if(row['dv.office_area.raw']){
			office_area = row['dv.office_area.raw'];
		}
		if (office_area == "")  office_area = 0.0;
		//---------------------------------------------
		var meeting_area = row['dv.meeting_area'];	
		if(row['dv.meeting_area.raw']){
			meeting_area = row['dv.meeting_area.raw'];
		}
		if (meeting_area == "")  meeting_area = 0.0;
		//---------------------------------------------
		var commonOffice_area = row['dv.commonOffice_area'];	
		if(row['dv.commonOffice_area.raw']){
			commonOffice_area = row['dv.commonOffice_area.raw'];
		}
		if (commonOffice_area == "")  commonOffice_area = 0.0;
		//---------------------------------------------
		var manaAssist_area = row['dv.manaAssist_area'];	
		if(row['dv.manaAssist_area.raw']){
			manaAssist_area = row['dv.manaAssist_area.raw'];
		}
		if (manaAssist_area == "")  manaAssist_area = 0.0;
		//---------------------------------------------
		var teachOffice_area = row['dv.teachOffice_area'];	
		if(row['dv.teachOffice_area.raw']){
			teachOffice_area = row['dv.teachOffice_area.raw'];
		}
		if (teachOffice_area == "")  teachOffice_area = 0.0;
		//---------------------------------------------
		var projectZxYf_area = row['dv.projectZxYf_area'];	
		if(row['dv.projectZxYf_area.raw']){
			projectZxYf_area = row['dv.projectZxYf_area.raw'];
		}
		if (projectZxYf_area == "")  projectZxYf_area = 0.0;
		//---------------------------------------------
		var teachAssist_area = row['dv.teachAssist_area'];	
		if(row['dv.teachAssist_area.raw']){
			teachAssist_area = row['dv.teachAssist_area.raw'];
		}
		if (teachAssist_area == "")  teachAssist_area = 0.0;
		//--end
		var areaShiyong = 0.0;
		var overArea = 0.0;
		var overRate = 0.0;
		
		
	   areaShiyong = parseFloat(office_area) +parseFloat(meeting_area) +
			   parseFloat(commonOffice_area) + parseFloat(manaAssist_area) + parseFloat(teachOffice_area) + 
			   parseFloat(projectZxYf_area) + parseFloat(teachAssist_area) ;
		
	   overArea = areaShiyong - totalAreaDinge;
	   if (parseFloat(totalAreaDinge) !=0){
			overRate = overArea/parseFloat(totalAreaDinge) * 100.0; 
	   }
		
		
		areaShiyong = areaShiyong.toFixed(2);
		overArea = overArea.toFixed(2);
		overRate = overRate.toFixed(2);
		var rowEl = Ext.get(row.row.dom).dom;
		if (areaShiyong == 0){
			rowEl.cells[2].innerHTML = "";
		}else{
			rowEl.cells[2].innerHTML = areaShiyong;
		}
		if (overArea == 0){
			rowEl.cells[10].innerHTML = "";
		}else{
			rowEl.cells[10].innerHTML = overArea;
		}
		if (overRate == 0){
			rowEl.cells[11].innerHTML = "";
		}else{
			rowEl.cells[11].innerHTML = overRate+'%';
		}
		
	}
	
});



/**
 * Called from the chart control. Sets custom properties for Column3D chart.
 */
function setColumn3DCustomProperties() {  
    var chart = View.getControl('', 'ascBjUsmsDingeActualStatTeach_vacant5');
    
    // The depth of the chart relative to its width, between 1 and 100. The default value is 10. 
    chart.setControlProperty('depth', '5');

    // The elevation angle in degrees, within the range [-90 ; 90]. The default value is 35.            
    chart.setControlProperty('rotationAngle', '15');

    // The projection type: "orthographic" or "oblique". The default is "orthographic". 
    //chart.setControlProperty('projectionType', 'oblique');
}  

