/**
 * @author Keven.xi
 */
View.createController('ascBjUsmsDashHouseBlController', {

    siteId: "",
    blId: "",
    blName:"",
    
    /**
     * Ext element for the property map.
     */
    schoolPhoto: null,
    
    afterViewLoad: function(){
        this.schoolPhoto = Ext.get('schMap');
        this.schoolPhoto.addListener('click', this.onClickImage);
        var panle = this.abScShowDvStackGridPanel;
        panle.addParameter('rmCatZG', "rm.rm_cat = '教工住宅'"); 
        panle.addParameter('rmCatXS', "rm.rm_cat = '学生宿舍'");
        panle.addParameter('rmCatZGXS', "rm.rm_cat in ('教工住宅', '学生宿舍')");
    },
	
	afterInitialDataFetch: function(){
        var grid = View.panels.get("ascBjUsmsOverallBlWhole_blGrid");
		if (grid.rows.length > 0) {
			this.blId = grid.rows[0].row.getFieldValue("bl.bl_id");
			this.blName=grid.rows[0].row.getFieldValue("bl.name");
		}
		
        this.refreshBlInfoPanels(this.blId);
		
        
    },
	
    schMap_afterRefresh: function(){
        var title = String.format(getMessage('imagePanelTitle'), this.blId);
        this.schMap.setTitle(title);
        showSchMap();
    },
    
    /**
     *
     */
    buildingPhotos_afterRefresh: function(){
        var title = String.format(getMessage('imagePanelTitle'), this.blName);
        this.buildingPhotos.setTitle(title);
        showBldgPhoto();
        
    },
    abScBlInfoForm_afterRefresh: function(){
        var gongtanlv = this.abScBlInfoForm.getFieldValue("bl.gongtanlv");
        if (gongtanlv) {
            gongtanlv = gongtanlv * 100;
            gongtanlv = gongtanlv.toFixed(2);
            document.getElementById("abScBlInfoForm_bl.gongtanlv").innerHTML = gongtanlv + "%";
        }
    },
    ascBjUsmsOverallBlWhole_blGrid_afterRefresh: function(){
        var grid = this.ascBjUsmsOverallBlWhole_blGrid;
        for (var r = 0; r < grid.gridRows.length; r++) {
            var gongtanlv = grid.rows[r].row.getFieldValue("bl.gongtanlv");
            if (gongtanlv) {
                gongtanlv = gongtanlv * 100;
                gongtanlv = gongtanlv.toFixed(2);
                grid.rows[r].row.setFieldValue("bl.gongtanlv", gongtanlv + "%")
            }
        }
        
    },
    
    abScShowDvStackGridPanel_afterRefresh: function(){
    
        var gridPanel = this.abScShowDvStackGridPanel;
        var dataRows = gridPanel.getDataRows();
        for (var r = 0; r < dataRows.length; r++) {
            var dataRow = dataRows[r];
            var blUse = document.getElementById("abScShowDvStackGridPanel_row" + r + "_bl.bl_use").innerHTML;
            if (blUse == 'XuexiaozongJi') {
                dataRow.cells[0].innerHTML = '<a id="abScShowDvStackGridPanel_row' + r + '_bl.bl_use" onclick="showBlList(this)" href="javascript: //">' + '学校总计' + '</a>';
            }
            else 
                if (blUse == 'JiaoXueBanGong') {
                    dataRow.cells[0].innerHTML = '<a id="abScShowDvStackGridPanel_row' + r + '_bl.bl_use" onclick="showBlList(this)" href="javascript: //">' + '教学办公' + '</a>';
                }
                else 
                    if (blUse == 'JiaoGongSuShe') {
                        dataRow.cells[0].innerHTML = '<a id="abScShowDvStackGridPanel_row' + r + '_bl.bl_use" onclick="showBlList(this)" href="javascript: //">' + '教工宿舍' + '</a>';
                    }
                    else 
                        if (blUse == 'XueShengSuShe') {
                            dataRow.cells[0].innerHTML = '<a id="abScShowDvStackGridPanel_row' + r + '_bl.bl_use" onclick="showBlList(this)" href="javascript: //">' + '学生宿舍' + '</a>';
                        }
                        else 
                            if (blUse == 'QiTa') {
                                dataRow.cells[0].innerHTML = '<a id="abScShowDvStackGridPanel_row' + r + '_bl.bl_use" onclick="showBlList(this)" href="javascript: //">' + '其它' + '</a>';
                            }
            
            
        }
        
    },
    /**
     * show building photo and map when user select building
     * @param {Object} curBlNode
     */
    refreshBlInfoPanels: function(blId){
        this.abScBlBasicInfoForm.addParameter('blIdRes', blId);
        this.abScBlBasicInfoForm.refresh();
        
        this.abScBlInfoForm.addParameter('blIdRes', blId);
        this.abScBlInfoForm.refresh();
        
		this.buildingPhotos.addParameter("blIdRes",blId);
		this.buildingPhotos.refresh();
    },
    
    ascBjUsmsOverallBlWhole_blGrid_showBlInfo_onClick: function(row){
        this.blId = row.record['bl.bl_id'];
        
		this.refreshBlInfoPanels(this.blId);
    },
    
    
    onClickImage: function(){
    
        if (this.dom.src) {
            View.openDialog(this.dom.src);
        }
    }
    
});

function showSchMap(){
    var distinctPanel = View.panels.get('schMap');
    var sch_map = distinctPanel.getFieldValue('sc_school.photo1').toLowerCase();
    var sch_id = distinctPanel.getFieldValue('sc_school.sch_id');
    if (valueExistsNotEmpty(sch_map)) {
        distinctPanel.showImageDoc('sch_map', 'sc_school.sch_id', 'sc_school.photo1');
        distinctPanel.fields.get('sch_map').dom.alt = "";
    }
    else {
        distinctPanel.fields.get('sch_map').dom.src = null;
        distinctPanel.fields.get('sch_map').dom.alt = "校区照片不存在！";
    }
}

function showBldgPhoto(){
    var distinctPanel = View.panels.get('buildingPhotos');
    var bl_photo = distinctPanel.getFieldValue('bl.image_file').toLowerCase();
    var blId = distinctPanel.getFieldValue('bl.bl_id');
    var bl_photoImg = Ext.get('bl_photo');   
    if (valueExistsNotEmpty(bl_photo)) {
    	
    	bl_photoImg.setVisible(true);
		bl_photoImg.dom.src = View.project.projectGraphicsFolder + '/bl/' + bl_photo;
		bl_photoImg.dom.alt = "";
    }
    else {
    	bl_photoImg.setVisible(false);
		bl_photoImg.dom.src = null;
		bl_photoImg.dom.alt = "此建筑物照片不存在！";

    }
}

//点击查看详情按钮，显示 右上侧“建筑物信息摘要”
function onCrossTableClick(obj){
    var blGrid = View.panels.get('ascBjUsmsOverallBlWhole_blGrid');
    var restriction = obj.restriction;
    blGrid.refresh(restriction);
    
}

//点击建筑物链接界面2<建筑物房屋分布>
function fangwufenbu(){
    var blGrid = View.panels.get('ascBjUsmsOverallBlWhole_blGrid');
    var blId = blGrid.rows[blGrid.selectedRowIndex]['bl.bl_id'];
    var blName = blGrid.rows[blGrid.selectedRowIndex]['bl.name'];
    
    View.openDialog('asc-bj-usms-bl-dv-type-cht-stack.axvw', null, false, {
        width: 1000,
        height: 500,
        blId: blId,
        blName:blName,
        closeButton: false
    });
    
}

function showBlList(row){
    var grid = View.panels.get('abScShowDvStackGridPanel');
    var blGrid = View.panels.get('ascBjUsmsOverallBlWhole_blGrid');
    var blUse = row.innerHTML;
    var restriction = new Ab.view.Restriction();
    
    
    if (blUse == '学校总计') {
    
        blGrid.addParameter('blCatRes', "");
        blGrid.refresh();
    }
    else 
        if (blUse == '教学办公') {
            blGrid.addParameter('blCatRes', " and  bl.use1 in ('TE', 'TEOFF', 'TEASS', 'TELV', 'OFF', 'LVOFF')");
            blGrid.refresh();
        }
        else 
            if (blUse == '教工宿舍') {
            	//Fixed bug WUDAHOUSE-18 2012-04-01 Muliang
            	 blGrid.addParameter('blCatRes', " and  bl.building_cat='教工宿舍' ");
                blGrid.refresh();
            }
            else 
                if (blUse == '学生宿舍') {
                    blGrid.addParameter('blCatRes', ") and  bl.bl_id in (select rm.bl_id from rm, rmcat where rm.rm_cat = rmcat.rm_cat and rm.rm_cat = '学生宿舍'");
                    blGrid.refresh();
                    
                }
                else {
                    blGrid.addParameter('blCatRes', " and  use1 not in ('TE', 'TEOFF', 'TEASS', 'TELV', 'OFF', 'LVOFF')) and not exists (select 1 from rm where rm.bl_id = bl.bl_id and rm.rm_cat in ('职工宿舍', '学生宿舍') ");
                    blGrid.refresh();
                }
    var title = String.format(getMessage('blListPanelTitle'), blUse);
    blGrid.setTitle(title);
    
}
