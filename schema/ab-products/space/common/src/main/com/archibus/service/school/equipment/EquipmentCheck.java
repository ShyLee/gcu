/**
 * 
 */
package com.archibus.service.school.equipment;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * @author Administrator
 * 
 */
public class EquipmentCheck extends EventHandlerBase {
    /**
     * 获取所有的筛选条件并根据筛选条件中的单位，发布清查任务
     */
    public void createCheckReport(final String eqCheckMainId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // 获取当前清查任务的筛选条件
        final String resSQL =
                "select flds_res,flds_name from eq_check_res where check_main_id="
                        + literal(context, eqCheckMainId);
        this.log.debug("[SELECT SQL]:[" + resSQL + "]");
        final List recordsSql = retrieveDbRecords(context, resSQL);
        final StringBuffer res = new StringBuffer();
        // res.append("where sch_status='1'");
        // 筛选基础条件是只清查在用设备
        if (!recordsSql.isEmpty()) {
            String isDp = "trueORfalse";
            String isDpNull = "trueORfalse";
            // 循环所有筛选条件，将筛选条件拼接
            for (int i = 0; i < recordsSql.size(); i++) {
                final Map record = (Map) recordsSql.get(i);
                final String fieldName = record.get("flds_name").toString();
                final String fieldRes = record.get("flds_res").toString();
                
                if (fieldName.equals("dv_id")) {
                    // 单位
                    isDp = "false";
                    final String[] dv_id = fieldRes.split("-");
                    res.append(" and eq.dv_id=" + literal(context, dv_id[0]));
                } else if (fieldName.equals("dp_id")) {
                    // 科室
                    isDpNull = "false";
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
            if (isDp.equals("false")) {
                if (!isDpNull.equals("false")) {
                    res.append(" and eq.dp_id is null");
                }
            }
            // 添加完所有的筛选条件后，生成eq_check_report
        }
        // 插入前先删除对应的单位report。确保不存在不正确的报失。
        deleteCheckReport(context, eqCheckMainId);
        
        insertCheckReport(context, eqCheckMainId, res.toString());
        
    }
    
    /**
     * 取消某次清查任务，删除该清查的所有报告
     * 
     * @param eqCheckMainId
     */
    public void cancelEqCheck(final String eqCheckMainId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        deleteEqCheck(context, eqCheckMainId);
        deleteCheckReport(context, eqCheckMainId);
        deleteEqCheckRes(context, eqCheckMainId);
        deleteCheckMain(context, eqCheckMainId);
        
    }
    
    /**
     * 清除eq_check_report
     * 
     * @param eqCheckMainId
     */
    private void deleteCheckReport(final EventHandlerContext context, final String eqCheckMainId) {
        final String deleteSQL =
                "delete eq_check_report where check_main_id =" + literal(context, eqCheckMainId);
        this.log.debug("[DELETE SQL]:[" + deleteSQL + "]");
        executeDbSql(context, deleteSQL, false);
        
    }
    
    /**
     * 插入eq_check_report
     * 
     * @param eqCheckMainId
     */
    private void insertCheckReport(final EventHandlerContext context, final String eqCheckMainId,
            final String res) {
        // final String insertSQL =
        // "insert into eq_check_report (dv_id,check_main_id,check_count ) select  dv_id,'"
        // + eqCheckMainId + "',count(eq_id) from eq " + res + " group by dv_id";
        // // System.out.println("[UPDATE SQL]:[" + insertSQL + "]");
        // this.log.debug("[UPDATE SQL]:[" + insertSQL + "]");
        // executeDbSql(context, insertSQL, false);
        final String insertSQL =
                "insert into eq_check_report (dv_id,dp_id,check_main_id,check_count,check_count_attach ) ( ( "
                        + "select a.dv_id, '',"
                        + eqCheckMainId
                        + ", nvl(count_eq, 0), nvl(count_eq_attach, 0)"
                        + " from (select dv_id, count(eq_id) count_eq from eq"
                        + " where (eq.sch_status != '5' and eq.sch_status != '6' and eq.sch_status != '7' and eq.sch_status != 'C' and eq.sch_status != 'D')"
                        + "and (add_eq_id is null or add_eq_id in (select add_eq_id from add_eq where add_eq.status = '4')) "
                        + "and eq.dv_id || eq.dp_id not in (select dv_id || dp_id from dp where eq_own = '1')"
                        + res
                        + " group by dv_id) a,"
                        + " (select eq_attach.dv_id, count(eq_attach.eq_id) count_eq_attach"
                        + " from eq_attach,eq"
                        + " where eq_attach.sch_status = '1' "
                        + "and eq.eq_id=eq_attach.eq_id and eq.dv_id || eq.dp_id not in (select dv_id || dp_id from dp where eq_own = '1')"
                        + res
                        + " group by eq_attach.dv_id) b"
                        + " where a.dv_id = b.dv_id(+))) "
                        + "union all (select a.dv_id,a.dp_id, "
                        + eqCheckMainId
                        + ", nvl(count_eq, 0), nvl(count_eq_attach, 0)"
                        + " from (select dv_id,dp_id,count(eq_id) count_eq from eq"
                        + " where (eq.sch_status != '5' and eq.sch_status != '6' and eq.sch_status != '7' and eq.sch_status != 'C' and eq.sch_status != 'D')"
                        + "and (add_eq_id is null or add_eq_id in (select add_eq_id from add_eq where add_eq.status = '4')) "
                        + "and eq.dv_id || eq.dp_id in (select dv_id || dp_id from dp where eq_own = '1')"
                        + res
                        + " group by dv_id,dp_id) a,"
                        + " (select eq_attach.dv_id,eq_attach.dp_id,count(eq_attach.eq_id) count_eq_attach"
                        + " from eq_attach,eq"
                        + " where eq_attach.sch_status = '1' and eq.eq_id=eq_attach.eq_id "
                        + "and eq.dv_id || eq.dp_id in (select dv_id || dp_id from dp where eq_own = '1')"
                        + res
                        + " group by eq_attach.dv_id,eq_attach.dp_id) b"
                        + " where a.dv_id = b.dv_id(+) and a.dp_id = b.dp_id(+))";
        // System.out.println("[UPDATE SQL]:[" + insertSQL + "]");
        this.log.debug("[UPDATE SQL]:[" + insertSQL + "]");
        executeDbSql(context, insertSQL, false);
        
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
    
    // /**
    // * 发送提醒邮件
    // *
    // * @param eqCheckMainId
    // */
    // private void newCheckTaskEmail(String eqCheckMainId) {
    // // 示例SQL
    // // (select afm_users.user_name,afm_users.email,em.dv_id from afm_users,em where
    // // afm_users.role_name='UNV DV ADMIN' and afm_users.email = em.email and dv_id in (select
    // // dv_id from eq_check_report where check_main_id = '41'))
    // // 获取对应单位管理员邮箱列表
    // }
    
    /**
     * 删除清查任务
     * 
     * @param eqCheckMainId
     */
    private void deleteCheckMain(final EventHandlerContext context, final String eqCheckMainId) {
        final String deleteSQL =
                "delete eq_check_main where check_main_id = " + literal(context, eqCheckMainId);
        this.log.debug("[DELETE SQL]:[" + deleteSQL + "]");
        executeDbSql(context, deleteSQL, false);
    }
    
    /**
     * 删除清查记录
     * 
     * @param eqCheckMainId
     */
    private void deleteEqCheck(final EventHandlerContext context, final String eqCheckMainId) {
        final String deleteSQL =
                "delete eq_check where check_main_id = " + literal(context, eqCheckMainId);
        this.log.debug("[DELETE SQL]:[" + deleteSQL + "]");
        executeDbSql(context, deleteSQL, false);
        
    }
    
    /**
     * 删除清查记录
     * 
     * @param eqCheckMainId
     */
    private void deleteEqCheckRes(final EventHandlerContext context, final String eqCheckMainId) {
        final String deleteSQL =
                "delete eq_check_res where check_main_id = " + literal(context, eqCheckMainId);
        this.log.debug("[DELETE SQL]:[" + deleteSQL + "]");
        executeDbSql(context, deleteSQL, false);
        
    }
    
}
