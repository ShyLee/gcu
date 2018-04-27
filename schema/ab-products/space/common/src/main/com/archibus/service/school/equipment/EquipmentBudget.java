/**
 * 
 */
package com.archibus.service.school.equipment;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * @author Administrator
 * 
 */
public class EquipmentBudget extends EventHandlerBase {
    StringBuffer errorLog = new StringBuffer();
    
    /**
     * 删除已存在的年度预算，为重新导入预算做准备
     * 
     * @param year
     */
    public void deleteEqBudget(final String year) {
        this.log.debug("正在删除已存在的" + year + "年年度预算……");
        final String deleteSQL1 =
                "delete eq_budget_item where budget_id in (select budget_id from eq_budget where fiscal_year = '"
                        + year + "' and eq_budget.status = '0')";
        this.log.debug("[DELETE SQL]:[" + deleteSQL1 + "]");
        SqlUtils.executeUpdate("eq_budget_item", deleteSQL1);
        final String deleteSQL2 =
                "delete eq_budget where fiscal_year = '" + year + "' and eq_budget.status = '0'";
        this.log.debug("[DELETE SQL]:[" + deleteSQL2 + "]");
        SqlUtils.executeUpdate("eq_budget", deleteSQL2);
        SqlUtils.commit();
    }
    
    /**
     * 新增一个预算
     * 
     * @param budget_id
     * @param record
     */
    public void addEqBudget(final String year, final String dv_id, final String dp_id,
            final String budget_id, final String name, final HashMap<String, Object> record) {
        final String insertSQL =
                "insert into eq_budget (budget_id,name,dv_id,dp_id,fiscal_year)values('"
                        + budget_id + "','" + name + "','" + dv_id + "','" + dp_id + "','" + year
                        + "')";
        this.log.debug("[INSERT SQL]:[" + insertSQL + "]");
        SqlUtils.executeUpdate("eq_budget", insertSQL);
        SqlUtils.commit();
    }
    
    // 自动生成预算项id
    public String getItemid(final String budget_id) {
        String result = "";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // 查询DB中申请时间最晚的一条数据
        final String oneSql =
                "select * from eq_budget_item where budget_id='" + budget_id
                        + "' order by budget_item_id desc";
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            // 把得到的数据截取成两段，第一段为预算编码，第二段为流水号
            final Map record = (Map) records.get(0);
            final String new_Id = record.get("budget_item_id").toString();
            final String new_Id_left = new_Id.substring(0, new_Id.length() - 3);
            final String new_Id_right = new_Id.substring(new_Id.length() - 3);
            final int count = Integer.parseInt(new_Id_right);
            final int counts = count + 1;
            final String new_count = String.format("%1$,03d", counts);
            result = new_Id_left + new_count;
        } else {
            // 如果DB中没有数据
            result = budget_id + "001";
        }
        return result;
    }
    
    /**
     * 新增一个预算项
     * 
     * @param budget_id
     * @param record
     */
    public void addEqBudgetItem(final String budget_id, final HashMap<String, Object> record) {
        ContextStore.get().getEventHandlerContext();
        String dp_id_new;
        final String budget_item_id = getItemid(budget_id);
        final int total_cost = getNoNullInteger(record, "预算总额");
        
        final String dv_id = record.get("单位名称").toString();
        final String dv_id_new = getDvId(dv_id);
        final String dp_id = record.get("部门名称").toString();
        if (dp_id != "" && dp_id != null) {
            dp_id_new = getDpId(dv_id_new, dp_id);
        } else {
            dp_id_new = "1";
        }
        
        final String date_buy_old_eq = record.get("原设备购置年份").toString();
        
        final String budget_item_name = record.get("预算项名称").toString();
        final String budget_id_old = record.get("budget_id_old").toString();
        
        final String type = record.get("预算类型").toString();
        
        final String beizhu = record.get("备注").toString();
        
        String budget_type = "2";
        if (type.equals("更新原有设备")) {
            budget_type = "1";
        }
        if (type.equals("无")) {
            budget_type = "0";
        }
        
        final StringBuffer fields = new StringBuffer();
        final StringBuffer values = new StringBuffer();
        
        fields.append("budget_id");
        values.append("'" + budget_id + "'");
        
        fields.append(",budget_item_id");
        values.append(",'" + budget_item_id + "'");
        
        fields.append(",dv_id");
        values.append(",'" + dv_id_new + "'");
        
        if (dp_id_new != "1") {
            fields.append(",dp_id");
            values.append(",'" + dp_id_new + "'");
        }
        
        fields.append(",total_cost");
        values.append(",'" + total_cost + "'");
        
        fields.append(",date_buy_old_eq");
        values.append(",'" + date_buy_old_eq + "'");
        
        fields.append(",budget_id_old");
        values.append(",'" + budget_id_old + "'");
        
        fields.append(",comments");
        values.append(",'" + beizhu + "'");
        
        fields.append(",budget_item_name");
        values.append(",'" + budget_item_name + "'");
        
        fields.append(",type");
        values.append(",'" + budget_type + "'");
        
        final String insertSQL =
                "insert into eq_budget_item (" + fields.toString() + ")values(" + values.toString()
                        + ")";
        this.log.debug("[INSERT SQL]:[" + insertSQL + "]");
        
        SqlUtils.executeUpdate("eq_budget_item", insertSQL);
        SqlUtils.commit();
    }
    
    /**
     * 更新预算信息，同级预算总金额
     * 
     * @param budget_id
     * @param record
     */
    public void updateEqBudget(final String budget_id) {
        // 更新预算总金额
        // UPDATE eq_budget
        // SET cost_budget_cap =
        // (SELECT SUM(total_cost) FROM eq_budget_item WHERE budget_id = 'YS20130016'
        // )
        // WHERE budget_id = 'YS20130016'
        final String updateSQL =
                "UPDATE eq_budget SET cost_budget_cap = (SELECT SUM(total_cost) FROM eq_budget_item WHERE budget_id = '"
                        + budget_id + "') WHERE budget_id = '" + budget_id + "'";
        this.log.debug("[UPDATE SQL]:[" + updateSQL + "]");
        SqlUtils.executeUpdate("eq_budget", updateSQL);
        SqlUtils.commit();
    }
    
    public int getLastBudgetId(final String year) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectSQL =
                "select MAX(budget_id) as max_id from eq_budget where fiscal_year="
                        + literal(context, year);
        
        try {
            final List records = retrieveDbRecords(context, selectSQL);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                if (!record.equals(null)) {
                    final String max_id = record.get("max_id").toString();
                    final int budget_no = Integer.parseInt(max_id.substring(2));
                    return budget_no;
                }
            }
        } catch (final Exception e) {
            this.log.debug("无预算号");
            return 0;
        }
        return 0;
    }
    
    /**
     * 通过dv_name拿到dv_id
     * 
     * @param dv_id
     * @param dv_name
     */
    public String getDvId(final String dv_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectSQL = "select dv_id from dv where dv_name='" + dv_id + "'";
        
        try {
            final List records = retrieveDbRecords(context, selectSQL);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                if (!record.equals(null)) {
                    final String dv_id_new = record.get("dv_id").toString();
                    return dv_id_new;
                } else {
                    return "111";
                }
            }
        } catch (final Exception e) {
            this.log.debug("无单位名称");
            return "111";
        }
        return "111";
    }
    
    /**
     * 通过dp_name拿到dp_id
     * 
     * @param dp_id
     * @param dp_name
     */
    public String getDpId(final String dv_id, final String dp_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectSQL =
                "select dp_id from dp where dp_name='" + dp_id + "' and dv_id='" + dv_id + "'";
        try {
            final List records = retrieveDbRecords(context, selectSQL);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                if (!record.equals(null)) {
                    final String dp_id_new = record.get("dp_id").toString();
                    return dp_id_new;
                } else {
                    return "111";
                }
            }
        } catch (final Exception e) {
            this.log.debug("无部门名称");
            return "111";
        }
        return "111";
    }
    
    public boolean getBudgetIdExit(final String budget_id, final String dv_id, final String dp_id) {
        boolean is_exit = false;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String selectSQL = "";
        if (!dp_id.equals("")) {
            selectSQL =
                    "select budget_id from eq_budget where budget_id='" + budget_id
                            + "' and dv_id='" + dv_id + "' and dp_id='" + dp_id + "'";
        } else {
            selectSQL =
                    "select budget_id from eq_budget where budget_id='" + budget_id
                            + "' and dv_id='" + dv_id + "'";
        }
        final List records = retrieveDbRecords(context, selectSQL);
        if (!records.isEmpty()) {
            is_exit = true;
        } else {
            is_exit = false;
        }
        return is_exit;
    }
    
    /**
     * 格式化数字类型数据，目前要求是如果输入的内容为空，则保存空值
     * 
     * @param record
     * @param name
     * @return
     */
    
    protected static int getNoNullInteger(final HashMap<String, Object> record, final String name) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object rec = record.get(name);
        int n = 0;
        if (rec != null && rec != "") {
            n = getIntegerValue(context, rec).intValue();
            
        }
        return n;
    }
}
