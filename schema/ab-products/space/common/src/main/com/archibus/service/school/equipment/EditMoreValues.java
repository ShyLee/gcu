package com.archibus.service.school.equipment;

import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.helpdesk.HelpdeskEventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class EditMoreValues extends HelpdeskEventHandlerBase {
    // 部门内调剂--设备批量调剂
    public void AdjustMoreValue(final JSONObject record1, final JSONObject record2,
            final JSONObject record3, final String num) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues1 = parseJSONObject(context, record1);
        final Map values1 = stripPrefix(fieldValues1);
        final Map fieldValues3 = parseJSONObject(context, record3);
        final Map values3 = stripPrefix(fieldValues3);
        for (int i = 0; i < values1.size(); i++) {
            final String eq_id = notNull(values1.get("id" + i));
            final String bl_name = notNull(values3.get("name" + i));
            this.updateEqChange(context, eq_id, record2, bl_name, num);
            this.doAdjustDetail(context, eq_id, record2, num);
        }
        
    }
    
    // 部门内调剂--设备批量调剂--更新设备和对应的附件的信息
    public void doAdjustDetail(final EventHandlerContext context, final String eq_id,
            final JSONObject record, final String num) {
        
        // save form
        final Map fieldValues = parseJSONObject(context, record);
        final Map records = stripPrefix(fieldValues);
        
        final String em_id = notNull(records.get("em_id"));
        final String em_name = notNull(records.get("em_name"));
        final String type_use = notNull(records.get("type_use"));
        final String bl_id = notNull(records.get("bl_id"));
        final String fl_id = notNull(records.get("fl_id"));
        final String rm_id = notNull(records.get("rm_id"));
        final String dp_id = notNull(records.get("dp_id"));
        final String add_comment = notNull(records.get("add_comment"));
        final String comments = notNull(records.get("comments"));
        
        final StringBuffer eq_fields = new StringBuffer();
        final StringBuffer eqAttach_fields = new StringBuffer();
        
        if (!em_id.equals("")) {
            eq_fields.append("em_id=" + literal(context, em_id) + ",");
            eqAttach_fields.append("em_id=" + literal(context, em_id) + ",");
        }
        if (!em_name.equals("")) {
            eq_fields.append("em_name=" + literal(context, em_name) + ",");
            eqAttach_fields.append("em_name=" + literal(context, em_name) + ",");
        }
        if (num.equals("1")) {
            if (!dp_id.equals("")) {
                eq_fields.append("dp_id=" + literal(context, dp_id) + ",");
                eqAttach_fields.append("dp_id=" + literal(context, dp_id) + ",");
            }
        }
        
        eq_fields.append("bl_id=" + literal(context, bl_id) + ",");
        eqAttach_fields.append("bl_id=" + literal(context, bl_id) + ",");
        
        eq_fields.append("fl_id=" + literal(context, fl_id) + ",");
        eqAttach_fields.append("fl_id=" + literal(context, fl_id) + ",");
        
        eq_fields.append("rm_id=" + literal(context, rm_id) + ",");
        eqAttach_fields.append("rm_id=" + literal(context, rm_id) + ",");
        
        if (!add_comment.equals("")) {
            eq_fields.append("add_comment=" + literal(context, add_comment) + ",");
            
        }
        if (!comments.equals("")) {
            eq_fields.append("comments=" + literal(context, comments) + ",");
            
        }
        if (type_use != "") {
            eq_fields.append("type_use=" + literal(context, type_use));
            eqAttach_fields.append("type_use=" + literal(context, type_use));
        }
        
        final String updateSQL1 =
                "update eq set " + eq_fields.toString() + " where eq_id=" + literal(context, eq_id);
        this.log.debug("[UPDATE EQ SQL]:[" + updateSQL1 + "]");
        final String updateSQL2 =
                "update eq_attach set " + eqAttach_fields.toString()
                        + " where sch_status='1' and eq_id=" + literal(context, eq_id);
        this.log.debug("[UPDATE EQ SQL]:[" + updateSQL2 + "]");
        
        SqlUtils.executeUpdate("eq", updateSQL1);
        SqlUtils.executeUpdate("eq_attach", updateSQL2);
        
        SqlUtils.commit();
    }
    
    // 部门内调剂--设备批量调剂--在eq_change表中插入一条记录
    public void updateEqChange(final EventHandlerContext context, final String eq_id,
            final JSONObject record2, final String bl_name_old, final String num) {
        final Map fieldValues = parseJSONObject(context, record2);
        final Map records = stripPrefix(fieldValues);
        
        final String em_id = notNull(records.get("em_id"));
        final String em_name = notNull(records.get("em_name"));
        final String type_use = notNull(records.get("type_use"));
        final String bl_id = notNull(records.get("bl_id"));
        final String bl_name = this.getBlName(context, bl_id);
        final String fl_id = notNull(records.get("fl_id"));
        final String rm_id = notNull(records.get("rm_id"));
        final String dv_id = notNull(records.get("dv_id"));
        final String dv_name = notNull(records.get("dv_name"));
        final String dp_id = notNull(records.get("dp_id"));
        final String dp_name = notNull(records.get("dp_name"));
        
        String em_id_old;
        String em_name_old;
        String bl_id_old;
        String fl_id_old;
        String rm_id_old;
        String dp_id_old;
        String dp_name_old = null;
        
        final String oneSql = "select * from eq where eq_id=" + literal(context, eq_id);
        final List eqRecords = retrieveDbRecords(context, oneSql);
        if (!eqRecords.isEmpty()) {
            // 得到设备的原信息
            final Map eqRecord = (Map) eqRecords.get(0);
            final String eq_name = eqRecord.get("eq_name").toString();
            final Object dp_id_oldy = eqRecord.get("dp_id");
            if (dp_id_oldy == null) {
                dp_id_old = "";
            } else {
                dp_id_old = dp_id_oldy.toString();
                final String dp_name_oldy = this.getDpName(context, dv_id, dp_id_old);
                if (dp_name_oldy == null) {
                    dp_name_old = "";
                } else {
                    dp_name_old = dp_name_oldy.toString();
                }
            }
            
            final Object em_id_oldy = eqRecord.get("em_id");
            if (em_id_oldy == null) {
                em_id_old = "";
            } else {
                em_id_old = em_id_oldy.toString();
            }
            final Object em_name_oldy = eqRecord.get("em_id");
            if (em_name_oldy == null) {
                em_name_old = "";
            } else {
                em_name_old = em_name_oldy.toString();
            }
            final String type_use_old = eqRecord.get("type_use").toString();
            final Object bl_id_oldy = eqRecord.get("bl_id");
            if (bl_id_oldy == null) {
                bl_id_old = "";
            } else {
                bl_id_old = bl_id_oldy.toString();
            }
            final Object fl_id_oldy = eqRecord.get("fl_id");
            if (fl_id_oldy == null) {
                fl_id_old = "";
            } else {
                fl_id_old = fl_id_oldy.toString();
            }
            final Object rm_id_oldy = eqRecord.get("rm_id");
            if (rm_id_oldy == null) {
                rm_id_old = "";
            } else {
                rm_id_old = rm_id_oldy.toString();
            }
            
            final StringBuffer fields = new StringBuffer();
            final StringBuffer values = new StringBuffer();
            // 添加拷贝字段
            fields.append("eq_id");
            values.append(literal(context, eq_id));
            
            fields.append(",eq_name");
            values.append("," + literal(context, eq_name));
            
            fields.append(",em_id_old");
            values.append("," + literal(context, em_id_old));
            
            fields.append(",em_name_old");
            values.append("," + literal(context, em_name_old));
            
            fields.append(",type_use_old");
            values.append("," + literal(context, type_use_old));
            
            fields.append(",bl_id_old");
            values.append("," + literal(context, bl_id_old));
            
            fields.append(",bl_name_old");
            values.append("," + literal(context, bl_name_old));
            
            fields.append(",fl_id_old");
            values.append("," + literal(context, fl_id_old));
            
            fields.append(",rm_id_old");
            values.append("," + literal(context, rm_id_old));
            
            fields.append(",em_id");
            values.append("," + literal(context, em_id));
            
            fields.append(",em_name");
            values.append("," + literal(context, em_name));
            
            fields.append(",type_use");
            values.append("," + literal(context, type_use));
            
            fields.append(",bl_id");
            values.append("," + literal(context, bl_id));
            
            fields.append(",bl_name");
            values.append("," + literal(context, bl_name));
            
            fields.append(",fl_id");
            values.append("," + literal(context, fl_id));
            
            fields.append(",rm_id");
            values.append("," + literal(context, rm_id));
            
            fields.append(",dv_id");
            values.append("," + literal(context, dv_id));
            
            fields.append(",dv_id_old");
            values.append("," + literal(context, dv_id));
            
            fields.append(",dv_name");
            values.append("," + literal(context, dv_name));
            
            fields.append(",dv_name_old");
            values.append("," + literal(context, dv_name));
            
            if (num.equals("1")) {
                fields.append(",dp_id");
                values.append("," + literal(context, dp_id));
            } else {
                fields.append(",dp_id");
                values.append("," + literal(context, dp_id_old));
            }
            
            fields.append(",dp_id_old");
            values.append("," + literal(context, dp_id_old));
            
            if (num.equals("1")) {
                fields.append(",dp_name");
                values.append("," + literal(context, dp_name));
            } else {
                fields.append(",dp_name");
                values.append("," + literal(context, dp_name_old));
            }
            
            fields.append(",dp_name_old");
            values.append("," + literal(context, dp_name_old));
            
            fields.append(",audit_status");
            values.append("," + literal(context, "1"));
            
            final String insertEqChangeSQL =
                    "INSERT INTO eq_change (" + fields.toString() + ") values ("
                            + values.toString() + ")";
            this.log.debug("[INSERT EQ_CHANEG SQL]:[" + insertEqChangeSQL + "]");
            SqlUtils.executeUpdate("eq_change", insertEqChangeSQL);
            
        }
        SqlUtils.commit();
    }
    
    // 部门内调剂--设备批量调剂--在eq_change表中插入一条记录--拿bl.name
    public String getBlName(final EventHandlerContext context, final String bl_id) {
        String bl_name;
        if (bl_id.equals("")) {
            bl_name = "";
        } else {
            final String oneSql = "select name from bl where bl_id=" + literal(context, bl_id);
            final List records = retrieveDbRecords(context, oneSql);
            final Map eqRecord = (Map) records.get(0);
            bl_name = eqRecord.get("name").toString();
        }
        
        return bl_name;
    }
    
    // 部门内调剂--设备批量调剂--在eq_change表中插入一条记录--拿dp.dp_name
    public String getDpName(final EventHandlerContext context, final String dv_id,
            final String dp_id) {
        String dp_name;
        if (dp_id.equals("")) {
            dp_name = "";
        } else {
            final String oneSql =
                    "select dp_name from dp where dv_id=" + literal(context, dv_id) + " and dp_id="
                            + literal(context, dp_id);
            final List records = retrieveDbRecords(context, oneSql);
            final Map eqRecord = (Map) records.get(0);
            dp_name = eqRecord.get("dp_name").toString();
        }
        
        return dp_name;
    }
    
    // 设备批量修改
    public void EditEqMoreValue(final JSONObject record1, final JSONObject record2) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues1 = parseJSONObject(context, record1);
        final Map values1 = stripPrefix(fieldValues1);
        for (int i = 0; i < values1.size(); i++) {
            final String eq_id = notNull(values1.get("id" + i));
            this.editEqInfo(context, eq_id, record2);
        }
        
    }
    
    // 设备批量修改--具体执行
    private void editEqInfo(final EventHandlerContext context, final String eq_id,
    
    final JSONObject record) {
        final Map fieldValues = parseJSONObject(context, record);
        final Map records = stripPrefix(fieldValues);
        
        final String em_id = notNull(records.get("em_id"));
        final String em_name = notNull(records.get("em_name"));
        final String type_use = notNull(records.get("type_use"));
        final String is_up = notNull(records.get("is_up"));
        final String is_label = notNull(records.get("is_label"));
        final String eq_warehouse = notNull(records.get("eq_warehouse"));
        final String add_comment = notNull(records.get("add_comment"));
        
        final StringBuffer eq_fields = new StringBuffer();
        
        if (!em_id.equals("")) {
            eq_fields.append("em_id=" + literal(context, em_id) + ",");
            eq_fields.append("em_name=" + literal(context, em_name) + ",");
        }
        
        if (!eq_warehouse.equals("")) {
            eq_fields.append("eq_warehouse=" + literal(context, eq_warehouse) + ",");
        }
        
        if (!is_label.equals("")) {
            eq_fields.append("is_label=" + literal(context, is_label) + ",");
        }
        
        if (!is_up.equals("")) {
            eq_fields.append("is_up=" + literal(context, is_up) + ",");
        }
        
        if (!add_comment.equals("")) {
            eq_fields.append("add_comment=" + literal(context, add_comment) + ",");
        }
        
        if (!type_use.equals("")) {
            eq_fields.append("type_use=" + literal(context, type_use) + ",");
        }
        eq_fields.deleteCharAt(eq_fields.length() - 1);
        final String updateSQL1 =
                "update eq set " + eq_fields.toString() + " where eq_id=" + literal(context, eq_id);
        this.log.debug("[UPDATE EQ SQL]:[" + updateSQL1 + "]");
        
        SqlUtils.executeUpdate("eq", updateSQL1);
        
        SqlUtils.commit();
    }
    
    // 设备附件批量修改
    public void EditEqAttachMoreValue(final JSONObject record1, final JSONObject record2) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues1 = parseJSONObject(context, record1);
        final Map values1 = stripPrefix(fieldValues1);
        for (int i = 0; i < values1.size(); i++) {
            final String eq_attach_id = notNull(values1.get("id" + i));
            this.editEqAttachInfo(context, eq_attach_id, record2);
        }
        
    }
    
    // 设备附件批量修改--具体执行
    private void editEqAttachInfo(final EventHandlerContext context, final String eq_attach_id,
    
    final JSONObject record) {
        final Map fieldValues = parseJSONObject(context, record);
        final Map records = stripPrefix(fieldValues);
        
        final String em_id = notNull(records.get("em_id"));
        final String em_name = notNull(records.get("em_name"));
        final String type_use = notNull(records.get("type_use"));
        final String is_up = notNull(records.get("is_up"));
        final String is_label = notNull(records.get("is_label"));
        final String eq_warehouse = notNull(records.get("eq_warehouse"));
        final String add_comment = notNull(records.get("add_comment"));
        
        final StringBuffer eq_fields = new StringBuffer();
        
        if (!em_id.equals("")) {
            eq_fields.append("em_id=" + literal(context, em_id) + ",");
            eq_fields.append("em_name=" + literal(context, em_name) + ",");
        }
        
        if (!eq_warehouse.equals("")) {
            eq_fields.append("eq_warehouse=" + literal(context, eq_warehouse) + ",");
        }
        
        if (!is_label.equals("")) {
            eq_fields.append("is_label=" + literal(context, is_label) + ",");
        }
        
        if (!is_up.equals("")) {
            eq_fields.append("is_up=" + literal(context, is_up) + ",");
        }
        
        if (!add_comment.equals("")) {
            eq_fields.append("add_comment=" + literal(context, add_comment) + ",");
        }
        
        if (!type_use.equals("")) {
            eq_fields.append("type_use=" + literal(context, type_use) + ",");
        }
        eq_fields.deleteCharAt(eq_fields.length() - 1);
        
        final String updateSQL1 =
                "update eq_attach set " + eq_fields.toString() + " where eq_attach_id="
                        + literal(context, eq_attach_id);
        this.log.debug("[UPDATE EQ_ATTACH SQL]:[" + updateSQL1 + "]");
        
        SqlUtils.executeUpdate("eq", updateSQL1);
        
        SqlUtils.commit();
    }
    
    public void insertIntoEqAttachChange(final String eq_id, final String rtr_dip_id) {
        
        final String insertSql =
                "insert into eq_attach_change(eq_id,eq_attach_id,eq_attach_name,brand,eq_std,eq_type,csi_id,eq_warehouse,num_eq,price,units,"
                        + "ctry_id,ctry_name,dv_id_old,dv_name_old,dp_id_old,dp_name_old,type_use_old,buy_type,source,num_serial,date_in_service,date_purchased,"
                        + "bl_id_old,bl_name_old,fl_id_old,rm_id_old,em_id_old,em_name_old,vn_id,sch_status,rtr_dip_id) "
                        + "(select eq_attach.eq_id, "
                        + "eq_attach.eq_attach_id, "
                        + "eq_attach.eq_attach_name, "
                        + "eq_attach.brand, "
                        + "eq_attach.eq_std, "
                        + "eq_attach.eq_type, "
                        + "eq_attach.csi_id, "
                        + "eq_attach.eq_warehouse, "
                        + "eq_attach.num_eq, "
                        + "eq_attach.price, "
                        + "eq_attach.units, "
                        + "eq_attach.ctry_id, "
                        + "eq_attach.ctry_name, "
                        + "eq_attach.dv_id, "
                        + "dv.dv_name, "
                        + "eq_attach.dp_id, "
                        + "dp.dp_name, "
                        + "eq_attach.type_use, "
                        + "eq_attach.buy_type, "
                        + "eq_attach.source, "
                        + "eq_attach.num_serial, "
                        + "eq_attach.date_in_service, "
                        + "eq_attach.date_purchased, "
                        + "eq_attach.bl_id, "
                        + "bl.name, "
                        + "eq_attach.fl_id, "
                        + "eq_attach.rm_id, "
                        + "eq_attach.em_id, "
                        + "eq_attach.em_name, "
                        + "eq_attach.vn_id, "
                        + "eq_attach.sch_status, '"
                        + rtr_dip_id
                        + "'  from eq_attach "
                        + "left join  dv on eq_attach.dv_id= dv.dv_id "
                        + "left join  dp on eq_attach.dv_id = dp.dv_id and eq_attach.dp_id= dp.dp_id "
                        + "left join  bl on eq_attach.bl_id= bl.bl_id "
                        + "left join  em on eq_attach.em_id = em.em_id "
                        + "where sch_status = '1' and eq_id = '" + eq_id + "')";
        this.log.debug("[INSERT EQ_ATTACH_CHANGE SQL]:[" + insertSql + "]");
        
        SqlUtils.executeUpdate("eq_attach_change", insertSql);
        
        SqlUtils.commit();
    }
    
    // 资产追加-驳回
    // 要删除eq_attach_chang表和eq_attach表的追加数据
    public void rejectEqAttachValue(final String rtr_dip_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String deleteSql1 =
                "delete from eq_attach_change where sch_status='7' and rtr_dip_id="
                        + literal(context, rtr_dip_id);
        SqlUtils.executeUpdate("eq_attach_change", deleteSql1);
        SqlUtils.commit();
        
        final String deleteSql2 =
                "delete from eq_attach where type='1' and sch_status='7' and rtr_dip_id="
                        + literal(context, rtr_dip_id);
        SqlUtils.executeUpdate("eq_attach", deleteSql2);
        SqlUtils.commit();
    }
    
    // 批量修改设备清查的状态
    public void EditEqChechStatus(final JSONObject record, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        for (int i = 0; i < values.size(); i++) {
            final String eq_id = notNull(values.get("id" + i));
            updateEqChechStatus(context, eq_id, status);
        }
        
    }
    
    private void updateEqChechStatus(final EventHandlerContext context, final String eq_id,
            final String status) {
        final String updateSQL =
                "update eq set check_status=" + literal(context, status) + " where eq_id="
                        + literal(context, eq_id);
        
        SqlUtils.executeUpdate("eq", updateSQL);
        SqlUtils.commit();
    }
    
    // 批量修改设备附件清查的状态
    public void EditEqAttachChechStatus(final JSONObject record, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        for (int i = 0; i < values.size(); i++) {
            final String eq_attach_id = notNull(values.get("id" + i));
            updateEqAttachChechStatus(context, eq_attach_id, status);
        }
        
    }
    
    private void updateEqAttachChechStatus(final EventHandlerContext context,
            final String eq_attach_id, final String status) {
        final String updateSQL =
                "update eq_attach set check_status=" + literal(context, status)
                        + " where eq_attach_id=" + literal(context, eq_attach_id);
        
        SqlUtils.executeUpdate("eq_attach", updateSQL);
        SqlUtils.commit();
    }
    
    public void saveQuantityEqInfo(final JSONObject record, final String add_eq_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues = parseJSONObject(context, record);
        final Map records = stripPrefix(fieldValues);
        
        final String units = notNull(records.get("units"));
        final String type_use = notNull(records.get("type_use"));
        final String buy_type = notNull(records.get("buy_type"));
        final String csi_id = notNull(records.get("csi_id"));
        final String eq_std = notNull(records.get("eq_std"));
        final String eq_type = notNull(records.get("eq_type"));
        final String vn_id = notNull(records.get("vn_id"));
        final String brand = notNull(records.get("brand"));
        final String date_purchased = notNull(records.get("date_purchased"));
        final String date_in_service = notNull(records.get("date_in_service"));
        final String danju_id = notNull(records.get("danju_id"));
        
        final String updateSQL =
                "update eq set units=" + literal(context, units) + ",type_use="
                        + literal(context, type_use) + ",buy_type=" + literal(context, buy_type)
                        + ",csi_id=" + literal(context, csi_id) + ",eq_std="
                        + literal(context, eq_std) + ",eq_type=" + literal(context, eq_type)
                        + ",vn_id=" + literal(context, vn_id) + ",brand=" + literal(context, brand)
                        + ",date_purchased=to_date(" + literal(context, date_purchased)
                        + ", 'yyyy-mm-dd'),date_in_service=to_date("
                        + literal(context, date_in_service) + ", 'yyyy-mm-dd'),danju_id="
                        + literal(context, danju_id) + " where add_eq_id="
                        + literal(context, add_eq_id);
        
        SqlUtils.executeUpdate("eq", updateSQL);
        SqlUtils.commit();
    }
    
    public void saveQuantityEqDetailInfo(final String warehouse, final String is_up,
            final String is_label, final String add_eq_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String updateSQL1 =
                "update eq_attach set price_old=price,sch_status='1' where add_eq_id="
                        + literal(context, add_eq_id);
        
        SqlUtils.executeUpdate("eq_attach", updateSQL1);
        SqlUtils.commit();
        
        final String updateSQL =
                "update eq_attach set eq_warehouse=" + literal(context, warehouse) + ",is_up="
                        + literal(context, is_up) + ",price=0 where add_eq_id="
                        + literal(context, add_eq_id);
        
        SqlUtils.executeUpdate("eq_attach", updateSQL);
        SqlUtils.commit();
        
        final String updateSQL3 =
                "update eq set eq_warehouse=" + literal(context, warehouse) + ",is_up="
                        + literal(context, is_up) + ",is_label=" + literal(context, is_label)
                        + ",sch_status='1' where add_eq_id=" + literal(context, add_eq_id);
        
        SqlUtils.executeUpdate("eq_attach", updateSQL3);
        SqlUtils.commit();
    }
    
    public void updateSchStatus(final String flag, final String eq_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (flag.equals("1")) {
            final String updateSQL1 =
                    "update eq_attach set sch_status='D' where eq_id=" + literal(context, eq_id);
            
            SqlUtils.executeUpdate("eq_attach", updateSQL1);
            SqlUtils.commit();
            
            final String updateSQL2 =
                    "update eq set sch_status='D' where eq_id=" + literal(context, eq_id);
            
            SqlUtils.executeUpdate("eq", updateSQL2);
            SqlUtils.commit();
        } else {
            final String updateSQL3 =
                    "update eq_attach set sch_status='D' where eq_attach_id="
                            + literal(context, eq_id);
            
            SqlUtils.executeUpdate("eq_attach", updateSQL3);
            SqlUtils.commit();
        }
        
    }
    
    // 判断上一年的清查任务是否全部完成
    public String isGuiDang(String year) {
        String flag;
        year = year.substring(2);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select check_main_id from eq_check_main where is_done!='2' and check_date_start like '%-"
                        + year + "'";
        final List records = retrieveDbRecords(context, oneSql);
        if (records.size() > 0) {
            flag = "1";
        } else {
            flag = "2";
        }
        return flag;
    }
    
    public void eqCheckGuiDang(final String year) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String updateSQL =
                "insert into eq_history(eq_id,eq_id_old,eq_name,csi_id,eq_type,price,total_price,eq_std,date_purchased,"
                        + "buy_type,vn_id,danju_id,date_in_service,num_serial,type_use,is_up,add_comment,units,sci_resh_id,"
                        + "subject_funds,dv_id,dp_id,sch_status,source,em_id,em_name,bl_id,fl_id,rm_id,brand, add_eq_id,"
                        + "ctry_name,eq_warehouse,is_label,option1,Option2,Number2,Cost_Dep_Value,Cost_Purchase,Cost_Replace,"
                        + "Criticality, is_multiplexing,Limit_Alarm_High,limit_alarm_low,Limit_Ctl_High,Limit_Ctl_Low,"
                        + "Locked_Out,Meter, Meter_Usage_Per_Day,Qty_Mtbf,Qty_Mttr,Qty_Dep_Period,Qty_Hrs_Run_Day,"
                        + "Qty_Life_Expct,Qty_Pms,Recovery_Status,Salvaged,Tagged_Out,Value_Salvage,is_assign,year)"
                        + " SELECT eq_id,eq_id_old,eq_name,"
                        + "  csi_id,eq_type,price,total_price,eq_std,date_purchased,buy_type,vn_id,danju_id,"
                        + "  date_in_service,num_serial,type_use,is_up,add_comment,units,sci_resh_id,subject_funds,"
                        + "  dv_id,dp_id,sch_status,source,em_id,em_name,bl_id,fl_id,rm_id,brand,"
                        + "  add_eq_id,ctry_name,eq_warehouse,is_label,option1,Option2,Number2,Cost_Dep_Value,"
                        + "  Cost_Purchase,Cost_Replace,Criticality, is_multiplexing,Limit_Alarm_High,"
                        + "  limit_alarm_low,Limit_Ctl_High,Limit_Ctl_Low,Locked_Out,Meter,"
                        + "  Meter_Usage_Per_Day,Qty_Mtbf,Qty_Mttr,Qty_Dep_Period,Qty_Hrs_Run_Day,"
                        + "Qty_Life_Expct,Qty_Pms,Recovery_Status,Salvaged,Tagged_Out,Value_Salvage,"
                        + "is_assign,"
                        + literal(context, year)
                        + " FROM eq"
                        + " WHERE (((sch_status!='5' AND sch_status!='6'"
                        + " AND sch_status!='7' AND sch_status!='C'"
                        + " AND sch_status!='D') AND (add_eq_id IS NULL"
                        + " Or Add_Eq_Id  In"
                        + "  (SELECT add_eq_id FROM add_eq WHERE add_eq.status='4'))))"
                        + " AND ((check_status = '1'))";
        
        SqlUtils.executeUpdate("eq_history", updateSQL);
        SqlUtils.commit();
        // 更新清查状态为未清查
        final String updateSQL2 =
                "update eq set check_status='0' WHERE check_status='1' and (((sch_status!='5' AND sch_status!='6' AND sch_status!='7' "
                        + "AND sch_status!='C' AND sch_status!='D') "
                        + "AND (add_eq_id IS NULL Or Add_Eq_Id  In(SELECT add_eq_id FROM add_eq WHERE add_eq.status='4')))) ";
        SqlUtils.executeUpdate("eq", updateSQL2);
        SqlUtils.commit();
        
    }
}
