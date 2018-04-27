package com.archibus.service.school.datatransfer;

import java.util.List;

import com.archibus.datasource.SqlUtils;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

public class DataTransferFcxtToZjk {
    
    public static final String sql =
            "select em_id,em_name,identi_code,minzu,xingbie,email,zhiji_name,dv_id,date_begin_work,date_chusheng,date_come_school,date_retired,date_update,zg_status "
                    + " from sc_jc_em";
    
    public static final String[] flds =
            new String[] { "em_id", "em_name", "identi_code", "minzu", "xingbie", "email",
                    "zhiji_name", "dv_id", "date_begin_work", "date_chusheng", "date_come_school",
                    "date_retired", "date_update", "zg_status" };
    
    public static final String sqll =
            "select eq_id,eq_std,dv_id,em_id,date_qude,bl_id,fl_id,rm_id from sc_jc_eq";
    
    public static final String[] fldss =
            new String[] { "eq_id", "eq_std", "dv_id", "em_id", "date_qude", "bl_id", "fl_id",
                    "rm_id" };
    
    /**
     * 房产系统 从中间库 的人员表 和 设备表 获取数据 ，更新到房产系统的em 与 eq表
     * 
     * 
     * */
    
    public void main() {
        
        updateEm(); // 1.更新em
        
        updateEq(); // 2.更新eq
        
        final DataTransferToZjk Test = new DataTransferToZjk();
        
        Test.main();
        
    }
    
    /**
     * 获取中间表sc_jc_eq数据 ，eq表为空直接插入，如果非空，删除eq中的数据，再插入。
     * 
     * 
     */
    public void updateEq() {
        // 1、获取中间表sc_jc_eq数据
        final List<DataRecord> jcEqRecs = getJcEqRecs();
        // 2、逐条更新到eq表中
        try {
            
            for (final DataRecord jcEqRec : jcEqRecs) {
                String sql = "";
                String eq_std = "";
                String em_id = "";
                final String eq_id = (String) jcEqRec.getValue("sc_jc_eq.eq_id");
                if (jcEqRec.getValue("sc_jc_eq.eq_std") != null) {
                    eq_std = (String) jcEqRec.getValue("sc_jc_eq.eq_std");
                }
                // final String eq_std = (String) jcEqRec.getValue("sc_jc_eq.eq_std");
                final String dv_id = (String) jcEqRec.getValue("sc_jc_eq.dv_id");
                if (jcEqRec.getValue("sc_jc_eq.em_id") != null) {
                    em_id = (String) jcEqRec.getValue("sc_jc_eq.em_id");
                }
                // final String em_id = (String) jcEqRec.getValue("sc_jc_eq.em_id");
                final String date_qude = (String) jcEqRec.getValue("sc_jc_eq.date_qude");
                final String bl_id = (String) jcEqRec.getValue("sc_jc_eq.bl_id");
                final String fl_id = (String) jcEqRec.getValue("sc_jc_eq.fl_id");
                final String rm_id = (String) jcEqRec.getValue("sc_jc_eq.rm_id");
                if (isExistedEq(eq_id)) {// 存在此员工，从中间表中更新员工信息到eq表中
                    sql =
                            "UPDATE eq SET  eq_std = '" + eq_std + "', dv_id = '" + dv_id
                                    + "', em_id = '" + em_id + "', date_purchased = to_date("
                                    + date_qude + ",'yyyy-mm-dd hh24:mi:ss'), bl_id = '" + bl_id
                                    + "',fl_id='" + fl_id + "',rm_id='" + rm_id + "' where eq_id='"
                                    + eq_id + "' ";
                } else {// 插入此员工
                    sql =
                            "insert into eq (eq_id,eq_std,dv_id,em_id,date_purchased,bl_id,fl_id,rm_id) values('"
                                    + eq_id + "','" + eq_std + "','" + dv_id + "','" + em_id
                                    + "',to_date(" + date_qude + ",'yyyy-mm-dd hh24:mi:ss') ,'"
                                    + bl_id + "','" + fl_id + "','" + rm_id + "') ";
                }
                
                SqlUtils.executeUpdate("eq", sql);
                
            }
        } catch (final Exception e) {
            throw new ExceptionBase("设备从中间库更新到系统库失败");
        }
    }
    
    /**
     * 房产系统 从中间库 的人员表 和 设备表 获取数据 ，更新到房产系统的em
     * 
     * 1.获取中间表sc_jc_em数据 2.逐条更新到em表中
     * 
     * */
    public void updateEm() {
        // 1.获取中间表sc_jc_em数据
        final List<DataRecord> jcEmRecs = getJcEmRecs();
        // 2.逐条更新到em表中
        try {
            for (final DataRecord jcEmRec : jcEmRecs) {
                String sql = "";
                final String em_id = (String) jcEmRec.getValue("sc_jc_em.em_id");
                final String em_name = (String) jcEmRec.getValue("sc_jc_em.em_name");
                final String identi_code = (String) jcEmRec.getValue("sc_jc_em.identi_code");
                final String minzu = (String) jcEmRec.getValue("sc_jc_em.minzu");
                final String xingbie = (String) jcEmRec.getValue("sc_jc_em.xingbie");
                final String email = (String) jcEmRec.getValue("sc_jc_em.email");
                // final String zhiji_name = (String) jcEmRec.getValue("sc_jc_em.zhiji_name");
                final String dv_id = (String) jcEmRec.getValue("sc_jc_em.dv_id");
                final String date_begin_work =
                        (String) jcEmRec.getValue("sc_jc_em.date_begin_work");
                final String date_chusheng = (String) jcEmRec.getValue("sc_jc_em.date_chusheng");
                // final String date_come_school = (String)
                // jcEmRec.getValue("sc_jc_em.date_come_school");
                final String date_retired = (String) jcEmRec.getValue("sc_jc_em.date_retired");
                // final String date_update = (String) jcEmRec.getValue("sc_jc_em.date_update");
                final String zg_status = (String) jcEmRec.getValue("sc_jc_em.zg_status");
                if (isExistedEm(em_id)) {// 存在此员工，从中间表中更新员工信息到em表中
                    sql =
                            "UPDATE em SET name = '" + em_name + "', identi_code = '" + identi_code
                                    + "', minzu = '" + minzu + "', sex = '" + xingbie
                                    + "', email = '" + email + "', dv_id = '" + dv_id
                                    + "', date_work_begin = to_date(" + date_begin_work
                                    + ",'yyyy-mm-dd hh24:mi:ss'), date_chusheng = to_date("
                                    + date_chusheng
                                    + ",'yyyy-mm-dd hh24:mi:ss'), date_retired = to_date("
                                    + date_retired
                                    + ",'yyyy-mm-dd hh24:mi:ss'), zaigangzhuangtai_id='"
                                    + zg_status + "' where em_id = '" + em_id + "' ";
                } else {// 插入此员工
                    sql =
                            "insert into em (em_id,name,identi_code,minzu,sex,email,dv_id,date_work_begin,date_chusheng,date_retired,zaigangzhuangtai_id) values('"
                                    + em_id
                                    + "','"
                                    + em_name
                                    + "','"
                                    + identi_code
                                    + "','"
                                    + minzu
                                    + "','"
                                    + xingbie
                                    + "','"
                                    + email
                                    + "','"
                                    + dv_id
                                    + "',to_date("
                                    + date_begin_work
                                    + ",'yyyy-mm-dd hh24:mi:ss') ,to_date("
                                    + date_chusheng
                                    + ",'yyyy-mm-dd hh24:mi:ss') ,to_date("
                                    + date_retired
                                    + ",'yyyy-mm-dd hh24:mi:ss'),'" + zg_status + "') ";
                }
                
                SqlUtils.executeUpdate("em", sql);
                
            }
        } catch (final Exception e) {
            throw new ExceptionBase("员工从中间库更新到系统库失败");
        }
        
    }
    
    /**
     * 获取中间表sc_jc_em数据
     * 
     * @return List<DataRecord> records
     * */
    private List<DataRecord> getJcEmRecs() {
        final TransferObject sourceEm = new TransferObject();
        sourceEm.setTableName("sc_jc_em");
        final ReaderImpl read = new ReaderImpl();
        return read.ReadZjk(sourceEm, sql, flds);
    }
    
    /**
     * 获取中间表sc_jc_eq中的数据
     * 
     * 
     **/
    private List<DataRecord> getJcEqRecs() {
        final TransferObject sourceEq = new TransferObject();
        sourceEq.setTableName("sc_jc_eq");
        final ReaderImpl read = new ReaderImpl();
        return read.ReadZjk(sourceEq, sqll, fldss);
    }
    
    /**
     * 判断系统员工表中是否存在此员工
     * 
     * @return true or false
     * */
    private Boolean isExistedEm(final String em_id) {
        // getAllZfbt_ems(context, "在岗职工", dvId);
        
        final String sql = "select em_id from em where em_id = '" + em_id + "' ";
        final String[] flds = new String[] { "em_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("em", flds, sql);
        
        if (records.isEmpty()) {
            return false;
        }
        return true;
        
    }
    
    /**
     * 判断eq中是否存在此员工
     * 
     * @return true or false
     * */
    private Boolean isExistedEq(final String eq_id) {
        
        final String sql = "select eq_id from eq where eq_id='" + eq_id + "'";
        final String[] flds = new String[] { "eq_id" };
        final List<DataRecord> records = SqlUtils.executeQuery("eq", flds, sql);
        
        if (records.isEmpty()) {
            return false;
        }
        return true;
    }
}