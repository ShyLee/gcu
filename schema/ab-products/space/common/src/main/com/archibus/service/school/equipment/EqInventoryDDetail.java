package com.archibus.service.school.equipment;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.helpdesk.HelpdeskEventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class EqInventoryDDetail extends HelpdeskEventHandlerBase {
    public StringBuffer getEqThInfo(final String dv_id, final String dp_id,
            final String chechMianId, final String table) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        StringBuffer str = new StringBuffer();
        if ("eq".equals(table)) {
            str = getEqInfo(context, dv_id, dp_id, chechMianId);
        } else {
            str = getEqAttachInfo(context, dv_id, dp_id, chechMianId);
        }
        return str;
    }
    
    private StringBuffer getEqInfo(final EventHandlerContext context, final String dv_id,
            final String dp_id, final String chechMianId) {
        // 获取当前清查任务的筛选条件
        String eqCheck = getCheckInfo(context, chechMianId);
        if (eqCheck.equals("")) {
            eqCheck = "1=1";
        } else {
            eqCheck = eqCheck.substring(4);
        }
        String oneSql;
        if (dp_id == null || dp_id.equals("")) {
            oneSql =
                    "SELECT eq.eq_id,eq.eq_name,eq.date_in_service,eq.date_purchased,eq.em_name,eq.bl_id,"
                            + "eq.fl_id,eq.rm_id,eq.dv_id,eq.dp_id,bl.name FROM eq LEFT OUTER JOIN bl ON eq.bl_id=bl.bl_id "
                            + "WHERE (((eq.sch_status!='5' AND eq.sch_status!='6' AND eq.sch_status!='7' AND eq.sch_status!='C' "
                            + "AND eq.sch_status!='D') AND (add_eq_id IS NULL OR add_eq_id IN "
                            + "(SELECT add_eq_id FROM add_eq WHERE add_eq.status='4')))) AND (( eq.dv_id="
                            + literal(context, dv_id)
                            + ") AND("
                            + eqCheck
                            + ") AND ( eq.dp_id  is null and eq.check_status='0')) ORDER BY eq.eq_id DESC NULLS LAST";
        } else {
            oneSql =
                    "SELECT eq.eq_id,eq.eq_name,eq.date_in_service,eq.date_purchased,eq.em_name,eq.bl_id,"
                            + "eq.fl_id,eq.rm_id,eq.dv_id,eq.dp_id,bl.name FROM eq LEFT OUTER JOIN bl ON eq.bl_id=bl.bl_id "
                            + "WHERE (((eq.sch_status!='5' AND eq.sch_status!='6' AND eq.sch_status!='7' AND eq.sch_status!='C' "
                            + "AND eq.sch_status!='D') AND (add_eq_id IS NULL OR add_eq_id IN "
                            + "(SELECT add_eq_id FROM add_eq WHERE add_eq.status='4')))) AND (( eq.dv_id="
                            + literal(context, dv_id) + ") AND(" + eqCheck + ") AND ( eq.dp_id="
                            + literal(context, dp_id)
                            + " and eq.check_status='0')) ORDER BY eq.eq_id DESC NULLS LAST";
        }
        final List eqRecords = retrieveDbRecords(context, oneSql);
        final StringBuffer str = new StringBuffer();
        int temp1 = 0;
        if (!eqRecords.isEmpty()) {
            for (int i = 0; i < eqRecords.size(); i++) {
                final StringBuffer tmpStr = new StringBuffer();
                final Map eqRecord = (Map) eqRecords.get(i);
                final String eqId = eqRecord.get("eq_id").toString();
                final String eqName = notNull(eqRecord.get("eq_name"));
                final String blName = notNull(eqRecord.get("name"));
                final String flId = notNull(eqRecord.get("fl_id"));
                final String rmId = notNull(eqRecord.get("rm_id"));
                final String emName = notNull(eqRecord.get("em_name"));
                String location = "";
                if (blName == "" && flId == "" && rmId == "") {
                    location = "";
                } else if (blName != "" && flId != "" && rmId == "") {
                    location = blName + "-" + flId;
                } else if (blName != "" && flId == "" && rmId == "") {
                    location = blName;
                } else {
                    location = blName + "-" + flId + "-" + rmId;
                }
                if (temp1 == 0) {
                    tmpStr.append("设备编码|盘点数量|备注|资产名称|存放地点|使用人").append("\r\n");
                    temp1 = 1;
                    tmpStr.append(eqId).append("|0||").append(eqName).append("|").append(location)
                        .append("|").append(emName).append("\r\n");
                } else {
                    tmpStr.append(eqId).append("|0||").append(eqName).append("|").append(location)
                        .append("|").append(emName).append("\r\n");
                }
                
                str.append(tmpStr);
            }
        }
        
        return str;
    }
    
    private StringBuffer getEqAttachInfo(final EventHandlerContext context, final String dv_id,
            final String dp_id, final String chechMianId) {
        // 获取当前清查任务的筛选条件
        String eqCheck = getCheckInfo(context, chechMianId);
        if (eqCheck.equals("")) {
            eqCheck = "1=1";
        } else {
            eqCheck = eqCheck.substring(4);
        }
        String oneSql;
        if (dp_id == null || dp_id.equals("")) {
            oneSql =
                    "select eq_attach.eq_attach_id,eq_attach.eq_attach_name,eq_attach.em_name,"
                            + "eq_attach.fl_id,eq_attach.rm_id,bl.name"
                            + " from eq_attach LEFT OUTER JOIN bl ON eq_attach.bl_id=bl.bl_id "
                            + "where eq_id in(SELECT eq.eq_id FROM eq "
                            + "WHERE (((eq.sch_status!='5' AND eq.sch_status!='6' AND eq.sch_status!='7' AND eq.sch_status!='C' "
                            + "AND eq.sch_status!='D') AND (add_eq_id IS NULL OR add_eq_id IN "
                            + "(SELECT add_eq_id FROM add_eq WHERE add_eq.status='4')))) AND (( eq.dv_id="
                            + literal(context, dv_id)
                            + ") AND("
                            + eqCheck
                            + ") AND ( eq.dp_id  is null and eq.check_status='0'))) and eq_attach.check_status='0'"
                            + " ORDER BY eq_attach.eq_attach_id DESC NULLS LAST";
        } else {
            oneSql =
                    "select eq_attach.eq_attach_id,eq_attach.eq_attach_name,eq_attach.em_name,"
                            + "eq_attach.fl_id,eq_attach.rm_id,bl.name"
                            + " from eq_attach LEFT OUTER JOIN bl ON eq_attach.bl_id=bl.bl_id "
                            + "where eq_id in(SELECT eq.eq_id FROM eq "
                            + "WHERE (((eq.sch_status!='5' AND eq.sch_status!='6' AND eq.sch_status!='7' AND eq.sch_status!='C' "
                            + "AND eq.sch_status!='D') AND (add_eq_id IS NULL OR add_eq_id IN "
                            + "(SELECT add_eq_id FROM add_eq WHERE add_eq.status='4')))) AND (( eq.dv_id="
                            + literal(context, dv_id) + ") AND(" + eqCheck + ") AND ( eq.dp_id="
                            + literal(context, dp_id)
                            + " and eq.check_status='0')))  and eq_attach.check_status='0'"
                            + " ORDER BY eq_attach.eq_attach_id DESC NULLS LAST";
        }
        final List eqAttachRecords = retrieveDbRecords(context, oneSql);
        final StringBuffer str = new StringBuffer();
        int temp1 = 0;
        if (!eqAttachRecords.isEmpty()) {
            for (int i = 0; i < eqAttachRecords.size(); i++) {
                final StringBuffer tmpStr = new StringBuffer();
                final Map eqAttachRecord = (Map) eqAttachRecords.get(i);
                final String eqId = eqAttachRecord.get("eq_attach_id").toString();
                final String eqName = notNull(eqAttachRecord.get("eq_attach_name"));
                final String blName = notNull(eqAttachRecord.get("name"));
                final String flId = notNull(eqAttachRecord.get("fl_id"));
                final String rmId = notNull(eqAttachRecord.get("rm_id"));
                final String emName = notNull(eqAttachRecord.get("em_name"));
                String location = "";
                if (blName == "" && flId == "" && rmId == "") {
                    location = "";
                } else if (blName != "" && flId != "" && rmId == "") {
                    location = blName + "-" + flId;
                } else if (blName != "" && flId == "" && rmId == "") {
                    location = blName;
                } else {
                    location = blName + "-" + flId + "-" + rmId;
                }
                if (temp1 == 0) {
                    tmpStr.append("设备附件编码|盘点数量|备注|资产名称|存放地点|使用人").append("\r\n");
                    temp1 = 1;
                    tmpStr.append(eqId).append("|0||").append(eqName).append("|").append(location)
                        .append("|").append(emName).append("\r\n");
                } else {
                    tmpStr.append(eqId).append("|0||").append(eqName).append("|").append(location)
                        .append("|").append(emName).append("\r\n");
                }
                
                str.append(tmpStr);
            }
        }
        
        return str;
    }
    
    public String getCheckInfo(final EventHandlerContext context, final String chechMianId) {
        final String resSQL =
                "select flds_res,flds_name from eq_check_res where check_main_id="
                        + literal(context, chechMianId);
        this.log.debug("[SELECT SQL]:[" + resSQL + "]");
        final List recordsSql = retrieveDbRecords(context, resSQL);
        final StringBuffer res = new StringBuffer();
        res.append("");
        // res.append("where sch_status='1'");
        // 筛选基础条件是只清查在用设备
        if (!recordsSql.isEmpty()) {
            // 循环所有筛选条件，将筛选条件拼接
            for (int i = 0; i < recordsSql.size(); i++) {
                final Map record = (Map) recordsSql.get(i);
                final String fieldName = record.get("flds_name").toString();
                final String fieldRes = record.get("flds_res").toString();
                
                if (fieldName.equals("dv_id")) {
                    // 单位
                    final String[] dv_id = fieldRes.split("-");
                    res.append(" and eq.dv_id=" + literal(context, dv_id[0]));
                } else if (fieldName.equals("dp_id")) {
                    // 科室
                    final String[] dp_id = fieldRes.split("-");
                    res.append(" and eq.dp_id=" + literal(context, dp_id[0]));
                } else if (fieldName.equals("eq_warehouse")) {
                    // 分库类型
                    String warehouse = "1";
                    if (fieldRes.equals("设备")) {
                        warehouse = "1";
                    } else if (fieldRes.equals("行政")) {
                        warehouse = "2";
                    } else if (fieldRes.equals("易耗品")) {
                        warehouse = "3";
                    } else if (fieldRes.equals("软件")) {
                        warehouse = "4";
                    } else if (fieldRes.equals("工程")) {
                        warehouse = "5";
                    } else if (fieldRes.equals("其他")) {
                        warehouse = "6";
                    } else if (fieldRes.equals("图书")) {
                        warehouse = "7";
                    }
                    res.append(" and eq.eq_warehouse=" + literal(context, warehouse));
                } else if (fieldName.equals("is_label")) {
                    // 有无标签
                    String label = "0";
                    if (fieldRes.equals("无")) {
                        label = "0";
                    } else if (fieldRes.equals("有")) {
                        label = "1";
                    }
                    res.append(" and eq.is_label=" + literal(context, label));
                } else if (fieldName.equals("bl_id")) {
                    // 建筑物
                    res.append(" and eq.bl_id=" + literal(context, fieldRes));
                } else if (fieldName.equals("fl_id")) {
                    // 楼层
                    res.append(" and eq.fl_id=" + literal(context, fieldRes));
                } else if (fieldName.equals("rm_id")) {
                    // 房间号
                    res.append(" and eq.rm_id=" + literal(context, fieldRes));
                } else if (fieldName.equals("date_from")) {
                    // 起始时间
                    res.append(" and eq.date_purchased >= TO_DATE('" + fieldRes
                            + "', 'YYYY-MM-DD HH24:MI:SS')");
                } else if (fieldName.equals("date_to")) {
                    // 结束时间
                    res.append(" and eq.date_purchased <= TO_DATE('" + fieldRes
                            + "', 'YYYY-MM-DD HH24:MI:SS')");
                } else if (fieldName.equals("price_from")) {
                    // 最低价格
                    res.append(" and eq.price >=" + fieldRes);
                } else if (fieldName.equals("price_to")) {
                    // 最高价格
                    res.append(" and eq.price <=" + fieldRes);
                } else if (fieldName.equals("csi_id")) {
                    // 包含类型，当包含类型为空，时，不添加该筛选条件。
                    res.append(csiRestriction(fieldRes));
                }
            }
            // 添加完所有的筛选条件后，生成eq_check_report
        } else {
            return "";
        }
        return res.toString();
    }
    
    /**
     * CSI_ID列中用逗号隔开了多个CSI_ID 这里将多个CSI_ID拼接成或关系来查询
     */
    private String csiRestriction(final String csi_id) {
        final StringBuffer result = new StringBuffer();
        if (csi_id.equals("0,")) {
            return "";// 如果字符串为0，则不需要添加筛选条件
        }
        final String csilist[] = csi_id.split(",");
        if (csilist.length == 0) {
            return "";// 如果字符串为，则不需要添加筛选条件
        }
        final int a = csilist.length;
        
        result.append("and (");
        boolean flag = true;
        for (int i = 0; i < a; i++) {
            String csi = "";
            if (csilist[i].length() < 8) {
                csi = csilist[i];// 如果字符串长度不足，则是按该类型匹配。
            }
            csi = subCsi(csilist[i]);// 截断字符串。
            if (!csi.equals("") && !csi.equals("0")) {
                if (flag) {// 如果为第一个字符，则不加or。
                    result.append(" csi_id like '" + csi + "%'");
                    flag = false;
                } else {
                    result.append(" or csi_id like '" + csi + "%'");
                }
            }
        }
        result.append(")");
        return result.toString();
    }
    
    /**
     * CSI_ID的大类ID为05000000这样的格式，筛选时更改为05%，0510%这种方法以满足整个大类下的所有数据都匹配
     */
    private String subCsi(final String csi) {
        final String last2 = csi.substring(6);
        final String last4 = csi.substring(4);
        final String last6 = csi.substring(2);
        if (last2.equals("00")) {
            if (last4.equals("0000")) {
                if (last6.equals("000000")) {
                    return csi.substring(0, 2);
                }
                return csi.substring(0, 4);
            }
            return csi.substring(0, 6);
        }
        return csi;
    }
}
