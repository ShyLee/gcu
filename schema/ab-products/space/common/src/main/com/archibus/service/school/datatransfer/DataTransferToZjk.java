package com.archibus.service.school.datatransfer;

import com.archibus.datasource.SqlUtils;

public class DataTransferToZjk {
    
    /**
     * Rm Fields
     */
    public static final String RM_Fields =
            "bl_id, name,fl_id,rm_id,abc,area_rm,rm_cat,rm_type,dv_id";
    
    /**
     * sc_jc_rm Fields
     */
    public static final String JC_RM_Fields =
            "sc_jc_rm.bl_id,sc_jc_rm.bl_name,sc_jc_rm.fl_id,sc_jc_rm.rm_id,sc_jc_rm.rm_name,sc_jc_rm.area_rm,sc_jc_rm.rm_cat,sc_jc_rm.rm_type,sc_jc_rm.dv_id";
    
    /**
     * Rm Fields
     */
    public static final String GJJ_Fields =
            "em_id,em_name,dv_id,acc_balance,amount_dv,amount_em,amount_hj,bank_name,em_gjj_no,gjj_acc,identi_code,acc_status,comments";
    
    /**
     * Rm Fields
     */
    public static final String JC_GJJ_Fields =
            "sc_jc_gjj.em_id,sc_jc_gjj.em_name,sc_jc_gjj.dv_id,sc_jc_gjj.acc_balance,sc_jc_gjj.amount_dv,sc_jc_gjj.amount_em,sc_jc_gjj.amount_hj,"
                    + "sc_jc_gjj.bank_name,sc_jc_gjj.em_gjj_no,sc_jc_gjj.gjj_acc,sc_jc_gjj.identi_code,sc_jc_gjj.acc_status,sc_jc_gjj.comments";
    
    /**
     * Rm Fields
     */
    public static final String ZFBT_Fields =
            "em_id,em_name,zhiji_name,dv_id,alloted_count_month,em_bt_no,identi_code,bt_start_yearmonth,po_em_id,"
                    + "po_name,po_identi_code,po_dv_id,po_zhiji_name,address_bt,area_fuli,area_fuli_family";
    
    /**
     * Rm Fields
     */
    public static final String JC_ZFBT_Fields =
            "sc_jc_zfbt.em_id,sc_jc_zfbt.em_name,sc_jc_zfbt.zhiji_name,sc_jc_zfbt.dv_id,sc_jc_zfbt.alloted_count_month,sc_jc_zfbt.em_bt_no,"
                    + "sc_jc_zfbt.identi_code,sc_jc_zfbt.bt_start_yearmonth,sc_jc_zfbt.po_em_id,sc_jc_zfbt.po_name,sc_jc_zfbt.po_identi_code,sc_jc_zfbt.po_dv_id,sc_jc_zfbt.po_zhiji_name,sc_jc_zfbt.address_bt,"
                    + "sc_jc_zfbt.area_fuli,sc_jc_zfbt.area_fuli_family";
    
    /**
     * 从房产系统中获取数据更新到中间库的sc_jc_rm,sc_jc_gjj,sc_jc_zfbt表中
     * 
     * 
     */
    public void main() {
        
        // insertSc_jc_rm(); // 1、更新sc_jc_rm表
        
        // insertSc_jc_gjj();// 2、更新sc_jc_gjj表
        
        // insertSc_jc_zfbt();// 3、更新sc_jc_zfbt表
        
        updateDataToZjk();
        
    }
    
    public void updateDataToZjk() {
        
        // ---------------------------rm---------
        final TransferObject sourceRm = new TransferObject();
        sourceRm.setTableName("rm_view"); // view
        sourceRm.setFieldsString(RM_Fields);
        sourceRm.setWhereSql("");
        
        final TransferObject targetRm = new TransferObject();
        targetRm.setTableName("sc_jc_rm");
        targetRm.setFieldsString(JC_RM_Fields);
        
        final WriterImpl wi = new WriterImpl();
        wi.writerToZjk(sourceRm, targetRm);
        
        // -----------------------------gjj--------------
        final TransferObject sourceGjj = sourceRm.clone();
        sourceGjj.setTableName("gjj_view"); // view
        sourceGjj.setFieldsString(GJJ_Fields);
        sourceGjj.setWhereSql("");
        
        final TransferObject targetGjj = new TransferObject();
        targetGjj.setTableName("sc_jc_gjj");
        targetGjj.setFieldsString(JC_GJJ_Fields);
        
        final WriterImpl wigjj = new WriterImpl();
        wigjj.writerToZjk(sourceGjj, targetGjj);
        
        // -----------------------------zfbt--------------
        final TransferObject sourceZfbt = sourceRm.clone();
        sourceZfbt.setTableName("zfbt_view"); // view
        sourceZfbt.setFieldsString(ZFBT_Fields);
        sourceZfbt.setWhereSql("");
        
        final TransferObject targetZfbt = new TransferObject();
        targetZfbt.setTableName("sc_jc_zfbt");
        targetZfbt.setFieldsString(JC_ZFBT_Fields);
        
        new WriterImpl();
        wigjj.writerToZjk(sourceZfbt, targetZfbt);
    }
    
    /***
     * 1、删除sc_jc_rm表中的数据
     * 
     * 2、把rm中的数据批量插入到sc_jc_rm中
     * 
     * 
     */
    public void insertSc_jc_rm() {
        // 1、删除sc_jc_rm表中的数据
        final String sql = "delete from sc_jc_rm";
        // 2、把rm中的数据批量插入到sc_jc_rm中
        final String sqll =
                "INSERT INTO sc_jc_rm(sc_jc_rm.bl_id,sc_jc_rm.bl_name,sc_jc_rm.fl_id,sc_jc_rm.rm_id,sc_jc_rm.rm_name,sc_jc_rm.area_rm,sc_jc_rm.rm_cat,sc_jc_rm.rm_type,sc_jc_rm.dv_id)SELECT rm.bl_id, bl.name,rm.fl_id,rm.rm_id,rm.name AS abc,bl.area_rm,rm.rm_cat,rm.rm_type,rm.dv_id FROM rm, bl WHERE rm.bl_id = bl.bl_id";
        SqlUtils.executeUpdate("sc_jc_rm", sql);
        SqlUtils.executeUpdate("sc_jc_rm", sqll);
        SqlUtils.commit();
    }
    
    /***
     * 1、删除sc_jc_gjj中的数据 2、把sc_gjj_account中的数据批量插入到sc_jc_gjj里
     * 
     * 
     */
    public void insertSc_jc_gjj() {
        // 1、删除sc_jc_gjj中的数据
        final String sql = "delete from sc_jc_gjj";
        // 2、把sc_gjj_account中的数据批量插入到sc_jc_gjj里
        final String sqll =
                "INSERT INTO sc_jc_gjj(sc_jc_gjj.em_id,sc_jc_gjj.em_name,sc_jc_gjj.dv_id,sc_jc_gjj.acc_balance,sc_jc_gjj.amount_dv,sc_jc_gjj.amount_em,sc_jc_gjj.amount_hj,sc_jc_gjj.bank_name,sc_jc_gjj.em_gjj_no,sc_jc_gjj.gjj_acc,sc_jc_gjj.identi_code,sc_jc_gjj.acc_status,"
                        + "sc_jc_gjj.comments) SELECT Sc_gjj_account.em_id,Sc_gjj_account.em_name,Sc_gjj_account.dv_id,Sc_gjj_account.acc_balance,Sc_gjj_account.amount_dv,Sc_gjj_account.amount_em,"
                        + "Sc_gjj_account.amount_hj,Sc_gjj_account.bank_name,Sc_gjj_account.em_gjj_no,Sc_gjj_account.gjj_acc,Sc_gjj_account.identi_code,Sc_gjj_account.acc_status,Sc_gjj_account.comments FROM Sc_gjj_account"
                        + " where acc_status='NORMAL' and em_id is not null and em_id !='空'";
        SqlUtils.executeUpdate("sc_jc_gjj", sql);
        SqlUtils.executeUpdate("sc_jc_gjj", sqll);
        SqlUtils.commit();
    }
    
    /***
     * 1、删除sc_jc_zfbt表中的数据 2、把sc_bt_acc表里的数据批量插入到sc_jc_zfbt中
     * 
     * 
     */
    public void insertSc_jc_zfbt() {
        // 1、删除sc_jc_zfbt表中的数据
        final String sql = "delete from sc_jc_zfbt";
        // 2、把sc_bt_acc表里的数据批量插入到sc_jc_zfbt中
        final String sqll =
                " INSERT INTO sc_jc_zfbt(sc_jc_zfbt.em_id,sc_jc_zfbt.em_name,sc_jc_zfbt.zhiji_name,sc_jc_zfbt.dv_id,sc_jc_zfbt.alloted_count_month,sc_jc_zfbt.em_bt_no,"
                        + "sc_jc_zfbt.identi_code,sc_jc_zfbt.bt_start_yearmonth,sc_jc_zfbt.po_em_id,sc_jc_zfbt.po_name,sc_jc_zfbt.po_identi_code,sc_jc_zfbt.po_dv_id,sc_jc_zfbt.po_zhiji_name,sc_jc_zfbt.address_bt,"
                        + "sc_jc_zfbt.area_fuli,sc_jc_zfbt.area_fuli_family) SELECT Sc_bt_acc.em_id,sc_bt_acc.em_name,sc_bt_acc.zhiji_name,sc_bt_acc.dv_id,sc_bt_acc.alloted_count_month,sc_bt_acc.em_bt_no,"
                        + "sc_bt_acc.identi_code,sc_bt_acc.bt_start_yearmonth,sc_bt_acc.po_em_id,sc_bt_acc.po_name,sc_bt_acc.po_identi_code,sc_bt_acc.po_dv_id,sc_bt_acc.po_zhiji_name,sc_bt_acc.address_bt,"
                        + "sc_bt_acc.area_fuli,sc_bt_acc.area_fuli_family FROM Sc_bt_acc where em_id!='20052099' and em_id!='20052021' and em_id!='20081216'";
        SqlUtils.executeUpdate("sc_jc_zfbt", sql);
        SqlUtils.executeUpdate("sc_jc_zfbt", sqll);
        SqlUtils.commit();
    }
}
