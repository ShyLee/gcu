package com.archibus.service.school;

import com.archibus.datasource.*;
import com.archibus.eventhandler.EventHandlerBase;

public class UpdateSchoolCount extends EventHandlerBase {
    
    /**
     * 
     */
    public static void updateCount() {
        calculateCountRm();
        calculateNoBldgs();
        updateStudentCount();
        updateEmployeeHeadcounts();
        calculateFlNum();
    }
    
    public static void updateStudentAndEmpCount() {
        // calculateCountRm();
        // calculateNoBldgs();
        updateStudentCount();
        updateEmployeeHeadcounts();
    }
    
    public static void calculateNoBldgs() {
        new FieldOperation("property", "bl").setAssignedRestriction("bl.acc_type !='yxz'")
            .calculate("property.qty_no_bldgs_calc", "COUNT", "bl.bl_id");
        new FieldOperation("site", "property").calculate("site.no_bldgs", "SUM",
            "property.qty_no_bldgs_calc");
        new FieldOperation("sc_school", "site").calculate("sc_school.count_bl", "SUM",
            "site.no_bldgs");
    }
    
    private static void calculateFlNum() {
        new FieldOperation("bl", "fl").setAssignedRestriction("fl.overground ='yes'").calculate(
            "bl.count_upground", "COUNT", "fl.fl_id");
        
        new FieldOperation("bl", "fl").setAssignedRestriction("fl.overground !='yes'").calculate(
            "bl.count_underground", "COUNT", "fl.fl_id");
        
        new FieldOperation("bl", "fl").calculate("bl.count_fl", "COUNT", "fl.fl_id");
    }
    
    /**
     * Update Room COUNT for FL,BL,DV,SITE,SC_SCHOOL
     */
    public static void calculateCountRm() {
        
        // Count Numbers of room on each floor
        
        new FieldOperation("fl", "rm").calculate("fl.count_rm", "COUNT", "rm.rm_id");
        
        // Count Numbers of room on each building from fl"
        
        new FieldOperation("bl", "fl").calculate("bl.count_rm_keyong", "SUM", "fl.count_rm");
        
        // SUM Numbers of room on each site from bl
        new FieldOperation("site", "bl").setAssignedRestriction("bl.acc_type!='yxz'").calculate(
            "site.count_rm", "SUM", "bl.count_rm_keyong");
        
        // SUM Numbers of room on school from site
        new FieldOperation("sc_school", "site").calculate("sc_school.count_rm", "SUM",
            "site.count_rm");
        
        // Count Numbers of room on each division from "RM"
        
        new FieldOperation("dv", "rm").setAssignedRestriction("rm.dv_id is not null").calculate(
            "dv.count_rm", "COUNT", "rm.bl_id||'-'||rm.fl_id||'-'||rm.rm_id");
    }
    
    /**
     * calculate the dv.count_student field
     */
    public static void updateStudentCount() {
        // COUNT number of SC_STUDENT in each DV
        new FieldOperation("dv", "sc_student").setAssignedRestriction("sc_student.status='1'")
            .calculate("dv.count_student", "COUNT", "sc_student.stu_no");
        
        // COUNT number of room in each dp
        new FieldOperation("dp", "rm").setAssignedRestriction(
            "rm.dp_id in('21','22') and rm.dv_id not in('03','06','39')").calculate("dp.count_rm",
            "COUNT", "rm.bl_id||'-'||rm.fl_id||'-'||rm.rm_id");
        
        // COUNT number of student in all school
        new FieldOperation("sc_school", "dv").calculate("sc_school.count_student_actual", "SUM",
            "dv.count_student");
    }
    
    /**
     * Employee update calculations.
     * 
     * @see emup.abs
     */
    public static void updateEmployeeHeadcounts() {
        
        // COUNT number of EMPLOYEES in each RM
        
        new FieldOperation("rm", "em").calculate("rm.count_em", "COUNT", "em.em_id");
        
        // Equal Division of room area among employees
        
        new FieldFormula("rm", "em")
            .setAssignedRestriction(
                "em.pct_rm = 0 AND em.bl_id is not null AND em.fl_id is not null AND em.rm_id IS NOT NULL")
            .calculate("em.area_rm",
                "rm.area / " + SqlUtils.formatSqlReplace0WithHuge("rm.count_em"));
        
        //
        new FieldFormula("rm", "em").setAssignedRestriction(
            "em.pct_rm = 0 AND em.rm_id IS NOT NULL").calculate("em.option1", "rm.count_em");
        
        // COUNT number of EMPLOYEES on each FL
        
        new FieldOperation("fl", "em").calculate("fl.count_em", "COUNT", "em.em_id");
        
        // SUM number of EMPLOYEES from FL to BL
        
        new FieldOperation("bl", "fl").calculate("bl.count_em", "SUM", "fl.count_em");
        
        // COUNT number of EMPLOYEES on each DP
        
        new FieldOperation("dp", "em").setAssignedRestriction(
            "em.dp_id in('21','22') and em.dv_id not in('03','06','39')").calculate("dp.count_em",
            "COUNT", "em.em_id");
        
        // COUNT number of EMPLOYEES in each DV
        
        new FieldOperation("dv", "em").calculate("dv.count_em", "COUNT", "em.em_id");
        // new FieldFormula("dv").calculate("dv.count_em",
        // "count_teacher + count_zhuanji + count_gongren + count_ganbu");
        
        // SUM number of EMPLOYEES from dv to SITE
        new FieldOperation("site", "dv").setAssignedRestriction("dv.site_id is not null")
            .calculate("site.count_teacher_actual", "SUM", "dv.count_em");
        
        // SUM number of TEACHERS from division to sc_school
        new FieldOperation("sc_school", "dv").calculate("sc_school.count_teacher_actual", "SUM",
            "dv.count_em");
        
        // SUM number of EMPLOYEES from DV to BU
        
        new FieldOperation("bu", "dv").calculate("bu.count_em", "SUM", "dv.count_em");
        
    }
    
}
