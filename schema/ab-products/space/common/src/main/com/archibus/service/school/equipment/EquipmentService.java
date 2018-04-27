package com.archibus.service.school.equipment;

import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;

import com.alibaba.fastjson.JSONArray;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.school.datatransfer.*;

// extends EventHandlerBase
public class EquipmentService extends EventHandlerBase {
    static String url = "jdbc:postgresql://10.1.1.63:5432/zhxy";
    
    static String usr = "gcu_zcc";
    
    static String psd = "pwd_zcc141202";
    
    /**
     * 根据设定的规则自动设置主键值
     * 
     * @param drecord 传入的DataRecord类型的参数
     * @param primaryTableFieldVlaue 主表的主键值，根据此键值+尾数 生成主键策略
     * @return
     */
    public String getPrimaryKey(final DataRecord drecord, final String primaryTableFieldVlaue) {
        return GetPrimaryKeyValue.getKey(drecord, primaryTableFieldVlaue);
    }
    
    /**
     * 根据传入的tableName和fieldName自动生成调用已设定的生成策略产生主键
     * 
     * @param tableName
     * @param fieldName
     * @return
     */
    public String updatePrimaryKey(final String tableName, final String fieldName,
            final String primaryTableFieldVlaue) {
        return UpdatePrimaryKeyValue.updateKey(tableName, fieldName, primaryTableFieldVlaue);
    }
    
    /**
     * 自动生成所有的层级结构
     */
    public void createAllTreeLevel() {
        CreateTreeLevel.createTreeLevel();
    }
    
    /**
     * 向eq表中增加新记录
     * 
     * @param record
     * @return
     */
    public String addNewEq(final DataRecord record) {
        return AddNewEq.addNewEq(record);
    }
    
    public void equipmentAddId(final String add_eq_id) {
        EquipmentAdd.addEquipmentByAddEqId(add_eq_id);
    }
    
    public void equipmentDispose(final String rtr_dip_id) {
        EquipmentDispose.dispose_equipment(rtr_dip_id);
    }
    
    // 自动生成附件的id
    public static String getEqPKValue(final String eqId) {
        String result = "";
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // 查询DB中申请时间最晚的一条数据
        final String oneSql =
                "select * from eq_attach where eq_id='" + eqId + "' order by eq_attach_id desc";
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            // 把得到的数据截取成两段，第一段为日期，第二段为流水号
            final Map record = (Map) records.get(0);
            final String new_Id = record.get("eq_attach_id").toString();
            final String new_Id_left = new_Id.substring(0, new_Id.length() - 3);
            final String new_Id_right = new_Id.substring(new_Id.length() - 3);
            final int count = Integer.parseInt(new_Id_right);
            final int counts = count + 1;
            final String new_count = String.format("%1$,03d", counts);
            result = new_Id_left + new_count;
        } else {
            // 如果DB中没有数据
            result = eqId + "001";
        }
        SqlUtils.commit();
        return result;
    }
    
    // 自动生成追加单号(学校)的sc_add_id
    public static String getScAddId() {
        String result = "";
        // 得到系统当前时间的年份
        final Date date = new Date();
        final String year = new SimpleDateFormat("yyyy").format(date);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String flag = "ZJ";
        // 查询DB中申请时间最晚的一条数据
        final String oneSql =
                "select sc_add_id from return_dispose where data_type='2' and sc_add_id is not null order by sc_add_id desc";
        
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            // 把得到的数据截取成两段，第一段为日期，第二段为流水号
            final Map record = (Map) records.get(0);
            final String sc_add = record.get("sc_add_id").toString();
            final String sc_add_left = sc_add.substring(2, 6);
            final String sc_add_right = sc_add.substring(6);
            if (year.equals(sc_add_left)) {
                // 如果截取的年份与当前年份一致，把流水号+1
                final int count = Integer.parseInt(sc_add_right);
                final int counts = count + 1;
                final String new_count = String.format("%1$,04d", counts);
                result = flag + sc_add_left + new_count;
            } else {
                // 如果截取的日期与当前日期不一致
                result = flag + year + "0001";
            }
        } else {
            // 如果DB中没有数据
            result = flag + year + "0001";
        }
        SqlUtils.commit();
        return result;
    }
    
    // 主体设备报减
    public void eqDispose(final String rtr_dip_id) {
        String eq_id;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql = "select eq_id from eq_change where rtr_dip_id='" + rtr_dip_id + "'";
        final List eqRecords = retrieveDbRecords(context, oneSql);
        if (!eqRecords.isEmpty()) {
            for (int i = 0; i < eqRecords.size(); i++) {
                final Map eqRecord = (Map) eqRecords.get(i);
                eq_id = eqRecord.get("eq_id").toString();
                // 更改报减附件的状态为7
                updateEqAttach(eq_id);
                // 插入一条新的eq记录，并更改该不报减附件的状态为：“调出”
                getAttachAndSetEq(eq_id);
                // 更改该主体设备的状态为“调出”
                updateEqStatus(eq_id);
            }
        }
        SqlUtils.commit();
    }
    
    // 主体设备报减-更改该主体设备的报减附件的状态为“报废”
    public static void updateEqAttach(final String eq_id) {
        String eq_attach_id;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select * from eq_attach where is_dispose=0 and eq_id='" + eq_id + "'";
        final List eqRecords = retrieveDbRecords(context, oneSql);
        if (!eqRecords.isEmpty()) {
            for (int i = 0; i < eqRecords.size(); i++) {
                final Map eqRecord = (Map) eqRecords.get(i);
                eq_attach_id = eqRecord.get("eq_attach_id").toString();
                final String twoSql =
                        "update eq_attach set sch_status='6' where eq_attach_id='" + eq_attach_id
                                + "'";
                SqlUtils.executeUpdate("eq_attach", twoSql);
            }
        }
        SqlUtils.commit();
    }
    
    // 主体设备报减-插入一条新的eq记录，并更改该不报减附件的状态为：“调出”
    public static void getAttachAndSetEq(final String eq_id) {
        String eq_attach_id;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select * from eq_attach where is_dispose=1 and eq_id='" + eq_id + "'";
        final List eqRecords = retrieveDbRecords(context, oneSql);
        if (!eqRecords.isEmpty()) {
            for (int i = 0; i < eqRecords.size(); i++) {
                final Map eqRecord = (Map) eqRecords.get(i);
                eq_attach_id = eqRecord.get("eq_attach_id").toString();
                // 插入一条新纪录
                final String twoSql =
                        "insert into eq(eq_id,eq_name, brand, eq_std,date_purchased, eq_type, csi_id, eq_warehouse, units,num_eq, price, source, ctry_id, ctry_name, dv_id, dp_id, type_use, num_serial,buy_type, bl_id, fl_id, rm_id, em_id, em_name, sch_status, vn_id, subject_funds) select eq_attach_id,eq_attach_name, brand, eq_std,date_purchased, eq_type, csi_id, eq_warehouse, units,num_eq, price, source, ctry_id, ctry_name, dv_id, dp_id, type_use, num_serial,buy_type, bl_id, fl_id, rm_id, em_id, em_name, sch_status, vn_id, subject_funds from eq_attach where eq_attach_id='"
                                + eq_attach_id + "'";
                SqlUtils.executeUpdate("eq", twoSql);
                final String threeSql =
                        "update eq_attach set sch_status='6' where eq_attach_id='" + eq_attach_id
                                + "'";
                SqlUtils.executeUpdate("eq_attach", threeSql);
            }
        }
        SqlUtils.commit();
    }
    
    // 主体设备报减-更改该主体设备的状态为“调出”
    public static void updateEqStatus(final String eq_id) {
        final String threeSql = "update eq set sch_status='7' where eq_id='" + eq_id + "'";
        SqlUtils.executeUpdate("eq", threeSql);
        SqlUtils.commit();
    }
    
    // 资产追加
    public void editEqValue(final String rtr_dip_id) {
        String eq_id;
        int attachNum = 0;
        double total_price = 0;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql = "select eq_id from eq_change where rtr_dip_id='" + rtr_dip_id + "'";
        final List eqRecords = retrieveDbRecords(context, oneSql);
        if (!eqRecords.isEmpty()) {
            for (int i = 0; i < eqRecords.size(); i++) {
                final Map eqRecord = (Map) eqRecords.get(i);
                eq_id = eqRecord.get("eq_id").toString();
                // 更新附件的状态sch_status为1,价格为0
                updateAttachStatus(rtr_dip_id, eq_id);
                // 拿到主体设备附件总数
                attachNum = getAttachNum(eq_id);
                // 拿到附件总价
                total_price = getTotalPrice(eq_id);
                // 更新主体设备的附件总价，附件数量，主体设备总价
                updateEqValue(eq_id, attachNum, total_price);
            }
        }
        SqlUtils.commit();
    }
    
    // 资产追加-更新附件的状态sch_status为1,价格为0
    public static void updateAttachStatus(final String rtr_dip_id, final String eq_id) {
        String eq_attach_id;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select * from eq_attach where eq_id=(select eq_id from eq_change where eq_id='"
                        + eq_id + "' and rtr_dip_id='" + rtr_dip_id + "')";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            for (int i = 0; i < Records.size(); i++) {
                final Map eqRecord = (Map) Records.get(i);
                eq_attach_id = eqRecord.get("eq_attach_id").toString();
                final String twoSql =
                        "update eq_attach set sch_status='1',price=0 where sch_status='7' and eq_attach_id='"
                                + eq_attach_id + "'";
                SqlUtils.executeUpdate("eq_attach", twoSql);
            }
        }
        SqlUtils.commit();
    }
    
    // 资产追加-拿到主体设备附件总数
    public static int getAttachNum(final String eq_id) {
        int attachNum = 0;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select count(*) num from eq_attach where sch_status='1' and eq_id='" + eq_id + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            for (int i = 0; i < Records.size(); i++) {
                final Map eqRecord = (Map) Records.get(0);
                final String temp = eqRecord.get("num").toString();
                attachNum = Integer.parseInt(temp);
            }
        }
        SqlUtils.commit();
        return attachNum;
    }
    
    // 资产追加-拿到附件总价
    public static double getTotalPrice(final String eq_id) {
        double total_price = 0;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select sum(price_old) sum from eq_attach where sch_status='1' and eq_id='" + eq_id
                        + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            for (int i = 0; i < Records.size(); i++) {
                final Map eqRecord = (Map) Records.get(0);
                final String temp = eqRecord.get("sum").toString();
                total_price = Double.parseDouble(temp);
            }
        }
        SqlUtils.commit();
        return total_price;
    }
    
    // 资产追加-更新主体设备的附件总价，附件数量，主体设备总价
    public static void updateEqValue(final String eq_id, final int attachNum,
            final double total_price) {
        double eqPrice = 0;
        double sumPrice = 0;
        double eqAttachNum = 0;
        double sumAttachNum = 0;
        double eqAttachPrice = 0;
        double sumAttachPrice = 0;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select total_price,attachments_num,attachments_price from eq where eq_id='"
                        + eq_id + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            for (int i = 0; i < Records.size(); i++) {
                final Map eqRecord = (Map) Records.get(0);
                final String temp = eqRecord.get("total_price").toString();
                eqPrice = Double.parseDouble(temp);
                eqAttachNum = Integer.parseInt(eqRecord.get("attachments_num").toString());
                eqAttachPrice = Double.parseDouble(eqRecord.get("attachments_price").toString());
            }
            sumPrice = eqPrice + total_price;
            sumAttachNum = eqAttachNum + attachNum;
            sumAttachPrice = eqAttachPrice + total_price;
            final String twoSql =
                    "update eq set attachments_num=" + sumAttachNum + ",attachments_price="
                            + sumAttachPrice + ",total_price=" + sumPrice + " where eq_id='"
                            + eq_id + "'";
            SqlUtils.executeUpdate("eq", twoSql);
        }
        SqlUtils.commit();
    }
    
    public static void test() {
        final Calendar c = Calendar.getInstance();// 可以对每个时间域单独修改
        c.get(Calendar.HOUR_OF_DAY);
        // if ("01-02-03".contains(time)) {
        Connection conn = null;
        try {
            Class.forName("org.postgresql.Driver");
            conn = DriverManager.getConnection(url, usr, psd);
            new DataTransferEmToFc().SyncEmDataToFc(conn);
            
            conn.close();
        } catch (final Exception e) {
            e.printStackTrace();
        }
        // }
    }
    
    public static void start() {
        final Calendar c = Calendar.getInstance();// 可以对每个时间域单独修改
        c.get(Calendar.HOUR_OF_DAY);
        // if ("01-02-03".contains(time)) {
        Connection conn1 = null;
        try {
            Class.forName("org.postgresql.Driver");
            conn1 = DriverManager.getConnection(url, usr, psd);
            new DataTransferStuToFc().SyncStuDataToFc(conn1);
            
            conn1.close();
        } catch (final Exception e) {
            e.printStackTrace();
        }
        // }
    }
    
    /**
     * Add the save attachment for multiple equipment
     * 
     * @param eqIds The selected equipments
     * @param eqAttachRecord The save attachment detail
     */
    public void batchAddAttach(final String eqIds, final DataRecord eqAttachRecord) {
        final JSONArray eqIdArray = JSONArray.parseArray(eqIds);
        if (eqIdArray.size() > 0) {
            // Step 1:为所选择的设备生成设备附件
            final DataSource eqAttachDataSource = createEqAttachDataSourceForSave();
            final DataSource eqAttachChangeDataSource = createEqAttachChangeDataSourceForSave();
            for (final Object object : eqIdArray) {
                final DataRecord eqRecord = getEqInfoByEqId(object.toString());
                insertEqAttach(eqAttachDataSource, eqAttachChangeDataSource, eqAttachRecord,
                    eqRecord);
            }
        }
    }
    
    /**
     * 创建生成设备附件表的dataSource
     * 
     * @return 设备附件表的dataSource
     */
    private DataSource createEqAttachDataSourceForSave() {
        final String[] fieldNames =
                { "eq_attach_id", "add_eq_id", "csi_id", "eq_attach_name", "brand", "eq_std",
                        "eq_type", "price", "price_old", "units", "source", "type_use", "ctry_id",
                        "ctry_name", "date_in_service", "date_purchased", "vn_id", "num_serial",
                        "comments", "eq_id", "buy_type", "type", "rtr_dip_id", "dv_id", "dp_id",
                        "sch_status", "bl_id", "fl_id", "rm_id", "em_id", "em_name", "add_comment",
                        "eq_warehouse" };
        return DataSourceFactory.createDataSourceForFields("eq_attach", fieldNames, false);
    }
    
    /**
     * 创建生成设备附件变更表记录的dataSource
     * 
     * @return 设备附件变更表的dataSource
     */
    private DataSource createEqAttachChangeDataSourceForSave() {
        final String[] fieldNames =
                { "eq_id", "eq_attach_id", "csi_id", "eq_attach_name", "brand", "eq_std",
                        "eq_type", "price", "buy_type", "units", "source", "type_use",
                        "subject_funds", "ctry_id", "ctry_name", "dv_id", "dp_id",
                        "date_in_service", "date_purchased", "vn_id", "num_serial", "comments",
                        "handling_em", "handling_em_name", "sch_status", "bl_id", "fl_id", "rm_id",
                        "em_id", "em_name", "rtr_dip_id", "eq_warehouse", "is_up", "is_label" };
        return DataSourceFactory.createDataSourceForFields("eq_attach_change", fieldNames, false);
    }
    
    /**
     * 根据eq_id获取eq信息
     * 
     * @param eq_id eq 表的主键
     * @return 返回一个eqRecord
     */
    private DataRecord getEqInfoByEqId(final String eq_id) {
        final String querySql =
                "select add_eq_id,eq_id,buy_type,dv_id,dp_id,bl_id,fl_id,rm_id,em_id,em_name,add_comment,eq_warehouse from eq where eq_id='"
                        + eq_id + "'";
        final String[] fieldNames =
                { "add_eq_id", "eq_id", "buy_type", "dv_id", "dp_id", "bl_id", "fl_id", "rm_id",
                        "em_id", "em_name", "add_comment", "eq_warehouse" };
        final List<DataRecord> eqRecords = SqlUtils.executeQuery("eq", fieldNames, querySql);
        if (eqRecords.size() > 0) {
            return eqRecords.get(0);
        }
        return null;
    }
    
    /**
     * 为该设备新增设备附件记录
     * 
     * @param eqAttachDataSource 设备附件表的数据源
     * @param eqAttachRecord 设备附件对象
     * @param eqRecord 设备对象
     */
    private void insertEqAttach(final DataSource eqAttachDataSource,
            final DataSource eqAttachChangeDataSource, final DataRecord eqAttachRecord,
            final DataRecord eqRecord) {
        final String eqPKValue = getEqPKValue(eqRecord.getString("eq.eq_id"));
        eqAttachRecord.setNew(true);
        eqAttachRecord.setValue("eq_attach.eq_attach_id", eqPKValue);
        eqAttachRecord.setValue("eq_attach.price_old", eqAttachRecord.getDouble("eq_attach.price"));
        eqAttachRecord.setValue("eq_attach.add_eq_id", eqRecord.getString("eq.add_eq_id"));
        eqAttachRecord.setValue("eq_attach.eq_id", eqRecord.getString("eq.eq_id"));
        eqAttachRecord.setValue("eq_attach.buy_type", eqRecord.getInt("eq.buy_type"));
        eqAttachRecord.setValue("eq_attach.type", 1);
        eqAttachRecord.setValue("eq_attach.dv_id", eqRecord.getString("eq.dv_id"));
        eqAttachRecord.setValue("eq_attach.dp_id", eqRecord.getString("eq.dp_id"));
        eqAttachRecord.setValue("eq_attach.sch_status", "7");
        eqAttachRecord.setValue("eq_attach.bl_id", eqRecord.getString("eq.bl_id"));
        eqAttachRecord.setValue("eq_attach.fl_id", eqRecord.getString("eq.fl_id"));
        eqAttachRecord.setValue("eq_attach.rm_id", eqRecord.getString("eq.rm_id"));
        eqAttachRecord.setValue("eq_attach.em_id", eqRecord.getString("eq.em_id"));
        eqAttachRecord.setValue("eq_attach.em_name", eqRecord.getString("eq.em_name"));
        eqAttachRecord.setValue("eq_attach.add_comment", eqRecord.getString("eq.add_comment"));
        eqAttachRecord.setValue("eq_attach.eq_warehouse", eqRecord.getString("eq.eq_warehouse"));
        eqAttachDataSource.saveRecord(eqAttachRecord);
        eqAttachDataSource.commit();
        insertEqAttachChange(eqAttachChangeDataSource, eqAttachRecord, eqPKValue);
    }
    
    /**
     * 插入到设备附件变更详情表中
     * 
     * @param eqAttachChangeDataSource 设备附件变更详情表DataSource
     * @param eqAttachRecord 设备附件对象
     * @param eqPKValue 生成的设备附件编码
     */
    private void insertEqAttachChange(final DataSource eqAttachChangeDataSource,
            final DataRecord eqAttachRecord, final String eqPKValue) {
        final DataRecord newRecord = eqAttachChangeDataSource.createNewRecord();
        newRecord.setValue("eq_attach_change.eq_id", eqAttachRecord.getString("eq_attach.eq_id"));
        newRecord.setValue("eq_attach_change.eq_attach_id", eqPKValue);
        newRecord.setValue("eq_attach_change.csi_id", eqAttachRecord.getString("eq_attach.csi_id"));
        newRecord.setValue("eq_attach_change.eq_attach_name",
            eqAttachRecord.getString("eq_attach.eq_attach_name"));
        newRecord.setValue("eq_attach_change.brand", eqAttachRecord.getString("eq_attach.brand"));
        newRecord.setValue("eq_attach_change.eq_std", eqAttachRecord.getString("eq_attach.eq_std"));
        newRecord.setValue("eq_attach_change.eq_type",
            eqAttachRecord.getString("eq_attach.eq_type"));
        newRecord.setValue("eq_attach_change.price", eqAttachRecord.getDouble("eq_attach.price"));
        newRecord
            .setValue("eq_attach_change.buy_type", eqAttachRecord.getInt("eq_attach.buy_type"));
        newRecord.setValue("eq_attach_change.units", eqAttachRecord.getString("eq_attach.units"));
        newRecord.setValue("eq_attach_change.source", eqAttachRecord.getString("eq_attach.source"));
        newRecord.setValue("eq_attach_change.type_use",
            eqAttachRecord.getString("eq_attach.type_use"));
        newRecord.setValue("eq_attach_change.subject_funds",
            eqAttachRecord.getString("eq_attach.subject_funds"));
        newRecord.setValue("eq_attach_change.ctry_id",
            eqAttachRecord.getString("eq_attach.ctry_id"));
        newRecord.setValue("eq_attach_change.ctry_name",
            eqAttachRecord.getString("eq_attach.ctry_name"));
        newRecord.setValue("eq_attach_change.dv_id", eqAttachRecord.getString("eq_attach.dv_id"));
        newRecord.setValue("eq_attach_change.dp_id", eqAttachRecord.getString("eq_attach.dp_id"));
        newRecord.setValue("eq_attach_change.date_in_service",
            eqAttachRecord.getDate("eq_attach.date_in_service"));
        newRecord.setValue("eq_attach_change.date_purchased",
            eqAttachRecord.getDate("eq_attach.date_purchased"));
        newRecord.setValue("eq_attach_change.vn_id", eqAttachRecord.getString("eq_attach.vn_id"));
        newRecord.setValue("eq_attach_change.num_serial",
            eqAttachRecord.getString("eq_attach.num_serial"));
        newRecord.setValue("eq_attach_change.comments",
            eqAttachRecord.getString("eq_attach.comments"));
        newRecord.setValue("eq_attach_change.handling_em",
            eqAttachRecord.getString("eq_attach.handling_em"));
        newRecord.setValue("eq_attach_change.handling_em_name",
            eqAttachRecord.getString("eq_attach.handling_em_name"));
        newRecord.setValue("eq_attach_change.sch_status",
            eqAttachRecord.getString("eq_attach.sch_status"));
        newRecord.setValue("eq_attach_change.bl_id", eqAttachRecord.getString("eq_attach.bl_id"));
        newRecord.setValue("eq_attach_change.fl_id", eqAttachRecord.getString("eq_attach.fl_id"));
        newRecord.setValue("eq_attach_change.rm_id", eqAttachRecord.getString("eq_attach.rm_id"));
        newRecord.setValue("eq_attach_change.em_id", eqAttachRecord.getString("eq_attach.em_id"));
        newRecord.setValue("eq_attach_change.em_name",
            eqAttachRecord.getString("eq_attach.em_name"));
        newRecord.setValue("eq_attach_change.rtr_dip_id",
            eqAttachRecord.getInt("eq_attach.rtr_dip_id"));
        newRecord.setValue("eq_attach_change.eq_warehouse",
            eqAttachRecord.getString("eq_attach.eq_warehouse"));
        newRecord.setValue("eq_attach_change.is_up", eqAttachRecord.getString("eq_attach.is_up"));
        newRecord.setValue("eq_attach_change.is_label",
            eqAttachRecord.getString("eq_attach.is_label"));
        eqAttachChangeDataSource.saveRecord(newRecord);
        eqAttachChangeDataSource.commit();
    }
}
