package com.archibus.service.school.house;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class HousePKValueService extends EventHandlerBase {
    
    public static String getPKValue(final String number) {
        String result = "";
        // 得到系统当前时间并转换成yyyyMMdd的格式
        final Date d = new Date();
        final String current_date = new SimpleDateFormat("yyyyMMdd").format(d);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // 判断标志字段的值为1还是2,1是工程部，2是维修部
        String flag = "GC";
        // 查询DB中申请时间最晚的一条数据
        String oneSql = "select * from sc_hos_repair";
        if ("1".equals(number)) {
            oneSql =
                    "select * from sc_hos_repair where marked='1' and date_sys=(select max(date_sys) from sc_hos_repair)";
        } else if ("2".equals(number)) {
            flag = "WX";
            oneSql =
                    "select * from sc_hos_repair where marked='2' and date_sys=(select max(date_sys) from sc_hos_repair)";
        }
        
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            // 把得到的数据截取成两段，第一段为日期，第二段为流水号
            final Map record = (Map) records.get(0);
            final String new_date = record.get("id").toString();
            final String new_date_left = new_date.substring(2, 10);
            final String new_date_right = new_date.substring(10);
            if (current_date.equals(new_date_left)) {
                // 如果截取的日期与当前日期一致，把流水号+1
                final int count = Integer.parseInt(new_date_right);
                final int counts = count + 1;
                final String new_count = String.format("%1$,03d", counts);
                result = flag + new_date_left + new_count;
            } else {
                // 如果截取的日期与当前日期不一致
                result = flag + current_date + "001";
            }
        } else {
            // 如果DB中没有数据
            result = flag + current_date + "001";
        }
        SqlUtils.commit();
        return result;
    }
    
    public static String getLabValue(final String dv_id, final String dp_id) {
        String result = "";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select * from sc_lab where dv_id='" + dv_id + "' and dp_id='" + dp_id + "'";
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            // 把得到的数据截取成两段，第一段为日期，第二段为流水号
            final Map record = (Map) records.get(0);
            final String lab_id = record.get("lab_id").toString();
            final String lab_id_left = lab_id.substring(0, 4);
            final String lab_id_right = lab_id.substring(lab_id.length() - 2);
            // 把流水号+1
            final int count = Integer.parseInt(lab_id_right);
            final int counts = count + 1;
            final String new_count = String.format("%1$,02d", counts);
            result = lab_id_left + new_count;
        } else {
            // 如果DB中没有数据
            result = dv_id + dp_id + "01";
        }
        SqlUtils.commit();
        return result;
    }
    
    public void deleteEqAddValue(final String eq_id, final String rtr_id) {
        final String deleteSQL1 =
                "delete from eq_attach_change where eq_id='" + eq_id + "' and rtr_dip_id='"
                        + rtr_id + "'";
        this.log.debug("[DELETE EQ_ATTACH_CHANGE]:[" + deleteSQL1 + "]");
        SqlUtils.executeUpdate("eq_attach_change", deleteSQL1);
        final String deleteSQL2 =
                "delete from eq_attach where type='1' and sch_status='7' and eq_id='" + eq_id
                        + "' and rtr_dip_id='" + rtr_id + "'";
        this.log.debug("[DELETE EQ_ATTACH]:[" + deleteSQL2 + "]");
        SqlUtils.executeUpdate("eq_attach", deleteSQL2);
        final String deleteSQL3 =
                "delete from eq_change where eq_id='" + eq_id + "' and rtr_dip_id='" + rtr_id + "'";
        this.log.debug("[DELETE EQ_CHANGE]:[" + deleteSQL3 + "]");
        SqlUtils.executeUpdate("eq_change", deleteSQL3);
        SqlUtils.commit();
    }
    
    /**
     * 根据学生状态变更学生信息：1：转学院 2：转专业
     * 
     * @param stuNo 学号
     * @return
     */
    
    public void updateStuInfo(final String stu_no, final String dv_id, final String dv_name,
            final String pro_id, final String pro_name, final String bl_id, final String fl_id,
            final String rm_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String updateSQL1 = null;
        String updateSQL2;
        
        if (dv_id.equals("")) {
            final String dv_id_new = this.getDvId(context, dv_name);
            if (dv_id_new.equals("")) {
                updateSQL1 =
                        "update sc_student set bl_id='',fl_id='',rm_id='',comments=comments||''||'学生变更院系出错'  where stu_no="
                                + literal(context, stu_no);
            } else {
                if (pro_id.equals("")) {
                    final String pro_id_new = this.getProId(context, pro_name);
                    if (pro_id_new.equals("")) {
                        updateSQL1 =
                                "update sc_student set bl_id='',fl_id='',rm_id='',comments=comments||''||'学生变更专业出错'  where stu_no="
                                        + literal(context, stu_no);
                    } else {
                        updateSQL1 =
                                "update sc_student set bl_id='',fl_id='',rm_id='',stay_status='2',dv_id="
                                        + literal(context, dv_id_new) + ",pro_id="
                                        + literal(context, pro_id_new) + " where stu_no="
                                        + literal(context, stu_no);
                    }
                } else {
                    updateSQL1 =
                            "update sc_student set bl_id='',fl_id='',rm_id='',stay_status='2',dv_id="
                                    + literal(context, dv_id_new) + ",pro_id="
                                    + literal(context, pro_id) + " where stu_no="
                                    + literal(context, stu_no);
                }
            }
            
        } else {
            if (pro_id.equals("")) {
                final String pro_id_new = this.getProId(context, pro_name);
                if (pro_id_new.equals("")) {
                    updateSQL1 =
                            "update sc_student set bl_id='',fl_id='',rm_id='',comments=comments||''||'学生变更专业出错'  where stu_no="
                                    + literal(context, stu_no);
                } else {
                    updateSQL1 =
                            "update sc_student set bl_id='',fl_id='',rm_id='',stay_status='2',dv_id="
                                    + literal(context, dv_id) + ",pro_id="
                                    + literal(context, pro_id_new) + " where stu_no="
                                    + literal(context, stu_no);
                }
            } else {
                updateSQL1 =
                        "update sc_student set bl_id='',fl_id='',rm_id='',stay_status='2',dv_id="
                                + literal(context, dv_id) + ",pro_id=" + literal(context, pro_id)
                                + " where stu_no=" + literal(context, stu_no);
            }
        }
        
        updateSQL2 =
                "update rm set count_key=count_key-1 where bl_id=" + literal(context, bl_id)
                        + " and fl_id=" + literal(context, fl_id) + " and rm_id="
                        + literal(context, rm_id);
        this.log.debug("[UPDATE SC_STUDENT SQL]:[" + updateSQL1 + "]");
        this.log.debug("[UPDATE RM SQL]:[" + updateSQL2 + "]");
        SqlUtils.executeUpdate("sc_student", updateSQL1);
        SqlUtils.executeUpdate("rm", updateSQL2);
        
        SqlUtils.commit();
    }
    
    public String getDvId(final EventHandlerContext context, final String dv_name) {
        String dv_id = "";
        final String oneSql = "select * from dv where dv_name=" + literal(context, dv_name);
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            dv_id = record.get("dv_id").toString();
        }
        return dv_id;
    }
    
    public String getProId(final EventHandlerContext context, final String pro_name) {
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
    
}
