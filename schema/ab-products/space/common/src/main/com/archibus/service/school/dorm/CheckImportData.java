package com.archibus.service.school.dorm;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class CheckImportData extends EventHandlerBase {
    
    public String checkYear(final String year) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select count(*) as count from (      SELECT"
                        + "        sc_student_verify.stu_no,sc_student_verify.stu_name,sc_student_verify.stu_sex,"
                        + "sc_student_verify.stu_in_year,sc_student_verify.status,sc_student_verify.dv_name,"
                        + "sc_student_verify.pro_name,sc_student_verify.bl_id,sc_student_verify.fl_id,sc_student_verify.rm_id,"
                        + "sc_student_verify.phone,sc_student_verify.telephone,sc_student_verify.comments"
                        + "        FROM sc_student_verify WHERE NOT EXISTS (SELECT stu_no FROM sc_student"
                        + "        WHERE sc_student.stu_no =sc_student_verify.stu_no) AND"
                        + "        stu_in_year= '" + year + "')";
        final List records = retrieveDbRecords(context, sql);
        
        String message = "";
        if (!records.isEmpty()) {
            final int length = records.size();
            for (int i = 0; i < length; i++) {
                final Map recordMap = (Map) records.get(i);
                final String count = recordMap.get("count").toString();
                if (message == "") {
                    message = "有" + count + "个数据没有导入成功，请查看失败列表";
                } else {
                    message = message + "、" + "有" + count + "个数据没有导入成功，请查看失败列表";
                }
            }
            
        }
        return message;
        
    }
    
    public boolean isExistedStu(final String stu_no) {
        boolean isExisted = false;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql = "select * from sc_student WHERE stu_no='" + stu_no + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            isExisted = true;
        }
        SqlUtils.commit();
        return isExisted;
    }
    
    public String getDvId(final String dv_name) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String dv_id = "";
        final String oneSql = "select * from dv where dv_name=" + literal(context, dv_name);
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            dv_id = record.get("dv_id").toString();
        }
        return dv_id;
    }
    
    public String getProId(final String pro_name) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String pro_id = "";
        final String oneSql =
                "select * from sc_stu_profession where pro_name=" + literal(context, pro_name);
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            pro_id = record.get("pro_id").toString();
        }
        return pro_id;
    }
    
    public List checkDvPro(final String pro_name, final String dv_name) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "select dv.dv_id ,sc_stu_profession.pro_id,dv.dv_name,sc_stu_profession.pro_name from dv,sc_stu_profession where dv.dv_id=sc_stu_profession.dv_id and sc_stu_profession.pro_name="
                        + literal(context, pro_name)
                        + " and dv.dv_name ="
                        + literal(context, dv_name);
        final List records = retrieveDbRecords(context, sql);
        return records;
    }
    
    public List checkFlBlRm(final String bl_id, final String fl_id, final String rm_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "SELECT * from rm where bl_id=" + literal(context, bl_id) + " and fl_id="
                        + literal(context, fl_id) + " and rm_id ='" + rm_id + "'";
        final List records = retrieveDbRecords(context, sql);
        return records;
    }
}
