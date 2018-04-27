package com.archibus.service.school;

import org.json.JSONObject;

import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.service.school.dinge.DingeHandler;

public class SchoolJobService extends JobBase {
    /**
     * @author Huang Muliang
     * @date 2012-06-11
     * @Fixed bug WUDAHOUSE-51 Building XiaZhang add openJobProgressBar
     */
    public void BuildingWholeLifeCycleManageServiceStart(final JSONObject record) {
        this.status.setResult(new JobResult("Building XiaZhang"));
        
        this.status.setTotalNumber(100);
        this.status.setCurrentNumber(3);
        final BuildingWholeLifeCycleManage bwlcm = new BuildingWholeLifeCycleManage();
        this.status.setCurrentNumber(7);
        final String blId = record.getString("sc_bl_xz.bl_id");
        
        // 1 修改bl.acc_type的值为已下帐。
        
        // 2 将该建筑物数据拷贝到sc_bl_xz表中
        bwlcm.copyBlRecToXZ(blId);
        this.status.setCurrentNumber(30);
        
        // 3 补充保存表sc_bl_xz该建筑物有关下账的数据字段------------------------------HML
        bwlcm.saveDataToScBlXz(record);
        this.status.setCurrentNumber(50);
        
        // 4 将建筑物的房屋分类统计数据写入sc_his_rmcat_bl
        bwlcm.saveBlRmcatHisData(blId);
        this.status.setCurrentNumber(60);
        
        bwlcm.setAccTypeToYxz(blId);
        this.status.setCurrentNumber(10);
        
        // 5 将文件目录中该建筑物的图纸文档保存到指定的“已下帐”目录下 -------------------HML
        bwlcm.copyDrawingFileToYiXiaZhang(record);
        this.status.setCurrentNumber(90);
        
        // 6 删除bl表中该建筑物的数据 ？是否要这样做------------------------------------HML
        /*
         * 返回后在asc-bj-usms-data-def-loc-wd.js 回调函数 dialog2_onClose: function(dialogController)
         */
        
        // 7 -更新汇总数据 ------------------------------------------------------------HML
        /*
         * 返回后在asc-bj-usms-data-def-loc-wd.js 回调函数 commonDeleteNoHint: function(dataSourceID,
         * formPanelID, primaryFieldFullName){ 更新汇总数据 updateStaticFieldAboutEmOrRm();
         */
        
        this.status.setCurrentNumber(100);
    }
    
    public void updateDingeAreaSpace() {
        final DingeHandler dingeOB = new DingeHandler();
        dingeOB.updateDingeArea(this.status);
    }
    
    public void updateRoomAreaFromManualArea() {
        this.status.setResult(new JobResult("Update Room Area from Manual Area"));
        this.status.setTotalNumber(100);
        // SqlUtils.executeUpdate("rm",
        // "UPDATE rm SET area = area_manual WHERE area = 0 OR area IS NULL");
        // final UpdateSchoolCount usp = new UpdateSchoolCount();
        // usp.updateCount();
        this.status.setCurrentNumber(30);
        new UpdateSchoolArea();
        // ss.updateByManualArea();
        this.status.setCurrentNumber(100);
    }
    
    public void updateRoomAreaByDefault() {
        this.status.setResult(new JobResult("Update Room Area from Manual Area"));
        this.status.setTotalNumber(100);
        
        UpdateSchoolArea.updateArea();
        this.status.setCurrentNumber(40);
        
        UpdateSchoolCount.updateCount();
        this.status.setCurrentNumber(100);
    }
}
