package com.archibus.service.school.datatransfer;

import java.sql.*;
import java.util.*;
import java.util.Date;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class DataTransferHouseToFc extends EventHandlerBase {
    String selectSql =
            "select id,f_xm,f_xb,f_nl,F_rzsj,f_bm,f_xrzw,f_xrzc,f_sqsslx,f_qdfh,f_sqssyy,f_fj from w_jgsszysq";
    
    /**
     * 
     * @param conn
     */
    public void SyncHouseDataToFc(final Connection conn) {
        this.log.info("Sync House Data rule called begin at " + new Date());
        ResultSet rs1;
        try {
            final Statement st1 = conn.createStatement();
            rs1 = st1.executeQuery(this.selectSql);
            while (rs1.next()) {
                final String apply_id = rs1.getString(1);
                this.isExistHouseData(conn, apply_id);
            }
            this.insertIntoCard();
        } catch (final SQLException e) {
            e.printStackTrace();
            return;
        }
    }
    
    /**
     * 
     * @param conn
     * @param apply_id
     */
    public void isExistHouseData(final Connection conn, final String apply_id) {
        
        if (this.isExistedHouse(apply_id)) {
            return;
        } else {
            this.insertIntoApplyInfo(conn, apply_id);
        }
    }
    
    /**
     * 
     * @param apply_id
     * @return
     */
    private boolean isExistedHouse(final String apply_id) {
        boolean isExisted = false;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select apply_id from sc_zzfcard_apply where apply_id='" + apply_id + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            isExisted = true;
        }
        SqlUtils.commit();
        return isExisted;
    }
    
    /**
     * 
     * @param conn
     */
    public void insertIntoApplyInfo(final Connection conn, final String apply_id) {
        ResultSet rs1;
        String sql = null;
        try {
            final Statement house1 = conn.createStatement();
            rs1 =
                    house1
                        .executeQuery("select id,f_xm,f_xb,f_nl,F_rzsj,f_bm,f_xrzw,f_xrzc,f_sqsslx,f_qdfh,f_sqssyy,f_fj from w_jgsszysq where id='"
                                + apply_id + "'");
            while (rs1.next()) {
                // final String apply_id1 = this.isNull(rs1.getString(1));
                System.out.println(apply_id);
                final String em_name = this.isNull(rs1.getString(2));
                final String sex = this.isNull(rs1.getString(3));
                final String age = this.isNull(rs1.getString(4));
                final String date_join = this.isNull(rs1.getString(5));
                String csDateString = null;
                if (!date_join.equals("")) {
                    final String date_join_in = date_join.substring(0, 10);
                    csDateString = "to_date('" + date_join_in + "', 'yyyy-mm-dd')";
                }
                final String dv_name = this.isNull(rs1.getString(6));
                final String em_zhiw = this.isNull(rs1.getString(7));
                final String em_zhic = this.isNull(rs1.getString(8));
                final String dorm_type = this.isNull(rs1.getString(9));
                final String rm_info = this.isNull(rs1.getString(10));
                final String apply_cause = this.isNull(rs1.getString(11));
                // final String doc1 = this.isNull(rs1.getString(12));
                
                sql =
                        "INSERT INTO sc_zzfcard_apply(apply_id,em_name,sex,age,date_join,dv_name,em_zhiw,em_zhic,dorm_type,rm_info,apply_cause) VALUES('"
                                + apply_id
                                + "','"
                                + em_name
                                + "','"
                                + sex
                                + "',"
                                + age
                                + ","
                                + csDateString
                                + ",'"
                                + dv_name
                                + "','"
                                + em_zhiw
                                + "','"
                                + em_zhic
                                + "','" + dorm_type + "','" + rm_info + "','" + apply_cause + "')";
                try {
                    
                    SqlUtils.executeUpdate("sc_zzfcard_apply", sql);
                    SqlUtils.commit();
                    
                } catch (final Exception e) {
                    e.printStackTrace();
                    this.log.error("insert into sc_zzfcard_apply: sql=" + sql);
                    continue;
                }
            }
        } catch (final SQLException e) {
            this.log.error("insert into sc_zzfcard_apply: sql=" + sql);
            this.log.error(e.getMessage());
        }
    }
    
    public void insertIntoCard() {
        final String sql =
                "insert into sc_zzfcard(em_name,date_join_work,dv_name,zhiw_id,zhic_id,apply_beizhu,card_status) (select em_name,date_join,dv_name,em_zhiw,em_zhic,'申请宿舍类型:'||dorm_type||',原因:'||apply_cause||'房号:'||rm_info,'ybc' from sc_zzfcard_apply where is_update=0)";
        final String updateSql = "update sc_zzfcard_apply set is_update=1";
        try {
            
            SqlUtils.executeUpdate("sc_zzfcard", sql);
            SqlUtils.commit();
            SqlUtils.executeUpdate("sc_zzfcard_apply", updateSql);
            SqlUtils.commit();
            
        } catch (final Exception e) {
            e.printStackTrace();
            this.log.error("insert into sc_zzfcard: sql=" + sql);
            this.log.error("update sc_zzfcard_apply: updateSql=" + sql);
            return;
        }
    }
    
    private String isNull(final String field) {
        String isNull = field;
        if (field == null) {
            isNull = "";
        }
        return isNull;
    }
}
