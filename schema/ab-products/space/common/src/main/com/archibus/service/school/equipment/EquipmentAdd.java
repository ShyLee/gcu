/**
 * 
 */
package com.archibus.service.school.equipment;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * @author Administrator
 * 
 */
public class EquipmentAdd extends EventHandlerBase {
    /**
     * 根据报增单ID添加报增设备
     * 
     * @param add_eq_id
     */
    public static void addEquipmentByAddEqId(final String add_eq_id) {
        if (add_eq_id.equals("")) {
            System.out.println("[无报增单号]");
            return;
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectAddEqSQL =
                "select count,eq_name,brand,buy_type,vn_id,eq_type,eq_std,type_use,price,csi_id,handing_em,handing_em_name"
                        + ",units,source,ctry_name,ctry_id,dv_id,dp_id,supplier_agreement_id,status,sci_resh_id"
                        + ",to_char(date_in_service,'yyyy-mm-dd') as date_in_service,to_char(date_purchased,'yyyy-mm-dd') as purchased"
                        + ",subject_funds,danju_id"
                        + " from add_eq where add_eq_id = '"
                        + add_eq_id + "'";
        
        System.out.println("[查询语句]：" + selectAddEqSQL);
        final List records = retrieveDbRecords(context, selectAddEqSQL);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            final int count = getIntegerValue(context, record.get("count")).intValue();
            System.out.println("[报增设备数]：" + count + "");
            if (count == 0) {
                return;
            }
            final String status = getString(record, "status");
            if (status.equals("1")) {
                System.out.println("[报增单状态为]：" + status + " 生成报增单对应的设备信息。");
                insertEquipment(context, record, add_eq_id);
                changeAddEqStatus(context, add_eq_id);
            } else {
                System.out.println("[报增单状态为]：" + status + " 不生成设备信息");
                return;
            }
        }
    }
    
    /**
     * 将已添加设备的报增单状态设置为待分配
     * 
     * @param context
     * @param add_eq_id
     */
    private static void changeAddEqStatus(final EventHandlerContext context, final String add_eq_id) {
        final String updateSQL =
                "update add_eq set status = '2' where add_eq_id = '" + add_eq_id + "'";
        executeDbSql(context, updateSQL, false);
    }
    
    /**
     * 根据报增单信息插入设备信息
     * 
     * @param context
     * @param record
     */
    private static void insertEquipment(final EventHandlerContext context, final Map record,
            final String add_eq_id) {
        final int count = getIntegerValue(context, record.get("count")).intValue();
        final int eq_id = getThisYearLastEqId(context);
        
        final SimpleDateFormat format = new SimpleDateFormat("yyyy/MM/dd");
        final String eq_name = getString(record, "eq_name");
        final String brand = getString(record, "brand");
        final String vn_id = getString(record, "vn_id");
        final String eq_type = getString(record, "eq_type");
        final String eq_std = getString(record, "eq_std");
        final String buy_type = getString(record, "buy_type");
        final String type_use = getString(record, "type_use");
        final String price = getString(record, "price");
        final String csi_id = getString(record, "csi_id");
        final String handing_em = getString(record, "handing_em");
        final String handing_em_name = getString(record, "handing_em_name");
        final String units = getString(record, "units");
        final String source = getString(record, "source");
        final String ctry_name = getString(record, "ctry_name");
        final String ctry_id = getString(record, "ctry_id");
        final String dv_id = getString(record, "dv_id");
        final String dp_id = getString(record, "dp_id");
        final String date_in_service = getString(record, "date_in_service");
        final String date_purchased = getString(record, "purchased");
        // final String contract_id = getString(record, "contract_id");
        final String supplier_agreement_id = getString(record, "supplier_agreement_id");
        final String subject_funds = getString(record, "subject_funds");
        final String danju_id = getString(record, "danju_id");
        final String keyan = getString(record, "sci_resh_id");
        
        for (int i = 1; i <= count; i++) {
            
            final StringBuffer fields = new StringBuffer();
            final StringBuffer values = new StringBuffer();
            // 添加拷贝字段
            fields.append("eq_id");
            values.append("'" + (eq_id + i) + "'");
            
            fields.append(",add_eq_id");
            values.append(",'" + add_eq_id + "'");
            
            fields.append(",eq_name");
            values.append(",'" + eq_name + "'");
            
            fields.append(",brand");
            values.append(",'" + brand + "'");
            
            fields.append(",buy_type");
            values.append(",'" + buy_type + "'");
            
            fields.append(",type_use");
            values.append(",'" + type_use + "'");
            
            fields.append(",vn_id");
            values.append(",'" + vn_id + "'");
            
            fields.append(",eq_type");
            values.append(",'" + eq_type + "'");
            
            fields.append(",eq_std");
            values.append(",'" + eq_std + "'");
            
            fields.append(",price");
            values.append(",'" + price + "'");
            
            fields.append(",total_price");
            values.append(",'" + price + "'");
            
            fields.append(",csi_id");
            values.append(",'" + csi_id + "'");
            
            fields.append(",handling_em");
            values.append(",'" + handing_em + "'");
            
            fields.append(",handling_em_name");
            values.append(",'" + handing_em_name + "'");
            
            fields.append(",units");
            values.append(",'" + units + "'");
            
            fields.append(",source");
            values.append(",'" + source + "'");
            
            fields.append(",ctry_name");
            values.append(",'" + ctry_name + "'");
            
            fields.append(",ctry_id");
            values.append(",'" + ctry_id + "'");
            
            fields.append(",dv_id");
            values.append(",'" + dv_id + "'");
            
            fields.append(",dp_id");
            values.append(",'" + dp_id + "'");
            
            fields.append(",date_in_service");
            values.append(",to_date('" + date_in_service + "','yyyy-mm-dd')");
            
            fields.append(",date_purchased");
            values.append(",to_date('" + date_purchased + "','yyyy-mm-dd')");
            
            fields.append(",servcont_id");
            values.append(",'" + supplier_agreement_id + "'");
            
            fields.append(",subject_funds");
            values.append(",'" + subject_funds + "'");
            
            fields.append(",date_in_storage");
            values.append(",to_date('" + format.format(new Date()) + "','yyyy-mm-dd')");
            
            fields.append(",danju_id");
            values.append(",'" + danju_id + "'");
            // 设备状态设置为多余
            fields.append(",sch_status");
            values.append(",'2'");
            
            fields.append(",number1");
            values.append(",0");
            fields.append(",input_type");
            values.append(",'1'");
            fields.append(",sci_resh_id");
            values.append(",'" + keyan + "'");
            
            final String insertEqSQL =
                    "INSERT INTO eq (" + fields.toString() + ") values (" + values.toString() + ")";
            executeDbSql(context, insertEqSQL, false);
            
            System.out.println("[插入语句]：" + insertEqSQL);
        }
    }
    
    /**
     * 查看本年度是否已经添加过设备，如果没有则从“本年度+00001”开始
     * 
     * @param context
     * @return
     */
    private static int getThisYearLastEqId(final EventHandlerContext context) {
        
        final Date date = new Date();
        final String year = new SimpleDateFormat("yyyy").format(date);
        final String selectEqIdSQL =
                "select max(eq_id) as last_eq_id from eq where eq_id like '" + year
                        + "%' and length(eq_id)=9";
        final String last_eq_id = year + "00000";
        int eq_id = Integer.parseInt(last_eq_id);
        try {
            final List records = retrieveDbRecords(context, selectEqIdSQL);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                eq_id = getIntegerValue(context, record.get("last_eq_id")).intValue();
            }
        } catch (final Exception e) {
            
        }
        return eq_id;
    }
    
    /**
     * 使用序列的方式添加序号，在跨年份的时候需要重置序号
     * 
     * @param context
     * @param add_eq_id
     */
    
    // private static void resetSequence(EventHandlerContext context, String add_eq_id) {
    //
    // // 检查序号和年份是否匹配
    // // 如果已更新年份，序号需要重置为“年份+0001”
    // // 先从数据库中查出当前最大序号
    // // select count(eq_id) as eq_count from eq where eq_id like 'year %';
    //
    // // select afm_eq_s.CURRVAL from add_eq where add_eq_id = 'BZ20130002'
    //
    // Date date = new Date();
    // String year = new SimpleDateFormat("yyyy").format(date);
    //
    // String selectEqIdSQL = "select afm_eq_s.CURRVAL as last_eq_id from add_eq where add_eq_id =
    // '"
    // + add_eq_id + "'";
    //
    // boolean needRestSequence = false;
    // try {
    // List records = retrieveDbRecords(context, selectEqIdSQL);
    // if (!records.isEmpty()) {
    // Map record = (Map) records.get(0);
    // String last_eq_id = record.get("last_eq_id").toString();
    // // 先查看是否存在本年度的设备，如果有设备则跟在最末的设备号后添加新设备，如果无设备则需要重建序号表。
    // if (last_eq_id.substring(1, 4).equals(year)) {
    // System.out.println("[最末设备年份]：" + last_eq_id.substring(1, 4) + "[当前年份]：" + year);
    // } else {
    // needRestSequence = true;
    // }
    // }
    // System.out.println("[未能获取id]");
    // } catch (Exception e) {
    // System.out.println("[错误]：" + e.toString());
    // }
    //
    // if (needRestSequence) {
    // // 需要重建序号表
    // try {
    // String resetSQL1 = "DROP SEQUENCE afm_eq_s";
    // String resetSQL2 = "create sequence afm_eq_s maxvalue 99999999 minvalue 1 start with "
    // + year + "0000 increment by 1 cache 10 order";
    // String resetSQL3 = "select afm_eq_s.nextval as last_eq_id from add_eq where add_eq_id = '"
    // + add_eq_id + "'";
    // executeDbSql(context, resetSQL1, false);
    // System.out.println("[删除序列]");
    // executeDbSql(context, resetSQL2, false);
    // System.out.println("[重建序列]");
    // executeDbSql(context, resetSQL3, false);
    // System.out.println("[启用序列]");
    // } catch (Exception e) {
    // System.out.println("[错误]：" + e.toString());
    // }
    // }
    // }
    protected static String getString(final Map record, final String name) {
        String s = (String) record.get(name);
        if (s == null) {
            s = "";
        }
        return s;
    }
}
