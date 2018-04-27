package com.archibus.service.school.datatransfer;

import java.sql.*;
import java.util.*;
import java.util.Date;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class DataTransferEmToFc extends EventHandlerBase {
    /*
     * HRBOOK = (DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = 10.1.1.63)(PORT =
     * 5432)) ) (CONNECT_DATA = (SERVICE_NAME = urpdb) ) )
     * 
     * 数据库用户：gcu_zcc/pwd_zcc141202 人事数据（职工号、姓名、性别、民族、单位编码、单位名称、科室编码、科室名称、入职日期、职务、岗位类别） 授权开放可供查询的数据表：
     * 教职工信息：zcc_jsxxb_view
     */
    String selectSql =
            "select zgh,xm,xbdm,mz,bmdm,ksdm,rzrq,zw,gwlb,category from zcc_jsxxb_view where zgh!='' and zgh is not null";
    
    public void SyncEmDataToFc(final Connection conn) {
        this.log.info("Sync Em Data rule called begin at " + new Date());
        
        ResultSet rs1;
        try {
            final Statement st1 = conn.createStatement();
            rs1 = st1.executeQuery(this.selectSql);
            while (rs1.next()) {
                final String em_id = rs1.getString(1);
                this.compareEm(conn, em_id);
            }
        } catch (final SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        
    }
    
    /**
     * compare the record ,then update or insert record in em table
     * 
     * @param context
     * @param record
     */
    public void compareEm(final Connection conn, final String em_id) {
        // TODO Auto-generated method stub
        
        if (this.isExistedEm(em_id)) {
            this.updateEm(conn, em_id);
        } else {
            this.insertEm(conn, em_id);
        }
    }
    
    /**
     * insert new record from zcc_jsxxb_view
     * 
     * @param context
     * @param record
     */
    public void insertEm(final Connection conn, final String em_id) {
        ResultSet rs3;
        String sql = null;
        try {
            final Statement st3 = conn.createStatement();
            rs3 = st3.executeQuery("select zgh,xm where zgh='" + em_id + "'");
            while (rs3.next()) {
                final String name = this.isNull(rs3.getString(2));
                
                sql = "INSERT INTO em(em_id,name) VALUES('" + em_id + "','" + name + ")";
                try {
                    SqlUtils.executeUpdate("em", sql);
                } catch (final Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                    this.log.error("insert into em: sql=" + sql);
                    continue;
                }
            }
        } catch (final SQLException e) {
            this.log.error("insert into em: sql=" + sql);
            this.log.error(e.getMessage());
        }
        SqlUtils.commit();
    }
    
    /**
     * because the value of zcc_jsxxb_view.dv_id maybe have two error 1 the value is not dv_id, is
     * dv_id 2 the lenth of the value is less than 5
     * 
     * @param record
     * @return
     */
    private String getDvId(final String dv_id) {
        String dvId_new = dv_id;
        if ((dv_id.length() == 4)) {
            dvId_new = dv_id.substring(0, 2);
        }
        return dvId_new;
    }
    
    /**
     * because the value of zcc_jsxxb_view.dp_id maybe have two error 1 the value is not dp_id, is
     * dp_id 2 the lenth of the value is less than 5
     * 
     * @param record
     * @return
     */
    private String getDpId(final String dp_id) {
        String dpId_new = dp_id;
        if ((dp_id.length() == 4)) {
            dpId_new = dp_id.substring(dp_id.length() - 2);
        }
        return dpId_new;
    }
    
    /**
     * update em fields:name,dv_id,status
     * 
     * @param context
     * @param record
     */
    public void updateEm(final Connection conn, final String em_id) {
        ResultSet rs2;
        String sql = null;
        try {
            final Statement st2 = conn.createStatement();
            rs2 =
                    st2.executeQuery("select zgh,xm,xbdm,mz,bmdm,ksdm,rzrq,zw,gwlb,category from zcc_jsxxb_view where zgh='"
                            + em_id + "'");
            while (rs2.next()) {
                final String name = this.isNull(rs2.getString(2));
                final String xbdm = this.isNull(rs2.getString(3)); // sex
                final String xbbm = (xbdm.equals("1")) ? "mal" : "fe";
                final String minzu = this.isNull(rs2.getString(4));
                final String dvid = this.getDvId(this.isNull(rs2.getString(5)));
                final String dpid_old = this.getDpId(this.isNull(rs2.getString(6)));
                final String dpid = this.isExistedDp(dvid, dpid_old);
                final String date_work = this.isNull(rs2.getString(7));
                String csDateString = null;
                if (!date_work.equals("")) {
                    csDateString = "to_date('" + date_work + "', 'yyyy-mm-dd')";
                }
                final String zw = this.isExistedZhiWu(this.isNull(rs2.getString(8)));
                final String gw = this.isNull(rs2.getString(9));
                final String category = this.isNull(rs2.getString(10));
                String status = null;
                if (category.equals("在职")) {
                    status = "1";
                } else if (category.equals("离退")) {
                    status = "8";
                } else {
                    status = "10";
                }
                if ((dvid == "" || dvid == null) && (dpid == "" || dpid == null)) {
                    sql =
                            "UPDATE em SET name='" + name + "',sex='" + xbbm + "',minzu='" + minzu
                                    + "',date_join_work=" + csDateString + ",zhiw_id='" + zw
                                    + "',gangweijibie_id='其他',gangwei_id='" + gw + "',status='"
                                    + status + "' WHERE em_id='" + em_id + "'";
                } else if ((dvid != "" || dvid != null) && (dpid == "" || dpid == null)) {
                    sql =
                            "UPDATE em SET name='" + name + "',sex='" + xbbm + "',minzu='" + minzu
                                    + "',dv_id='" + dvid + "',date_join_work=" + csDateString
                                    + ",zhiw_id='" + zw
                                    + "',gangweijibie_id='其他',dp_id='',gangwei_id='" + gw
                                    + "',status='" + status + "' WHERE em_id='" + em_id + "'";
                } else {
                    sql =
                            "UPDATE em SET name='" + name + "',sex='" + xbbm + "',minzu='" + minzu
                                    + "',dv_id='" + dvid + "',dp_id='" + dpid + "',date_join_work="
                                    + csDateString + ",zhiw_id='" + zw
                                    + "',gangweijibie_id='其他',gangwei_id='" + gw + "',status='"
                                    + status + "' WHERE em_id='" + em_id + "'";
                }
                
                try {
                    SqlUtils.executeUpdate("em", sql);
                } catch (final Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                    this.log.error("insert into em: sql=" + sql);
                    continue;
                }
            }
        } catch (final SQLException e) {
            this.log.error("update em: sql=" + sql);
            this.log.error(e.getMessage());
        }
        SqlUtils.commit();
        
    }
    
    /**
     * check the record of zhiwu_id is already existed in sc_zhiwu records
     * 
     * @param context
     * @param record
     * @return
     */
    private String isExistedZhiWu(final String zhiwu_id) {
        String sql = null;
        if (zhiwu_id != "") {
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            final String oneSql = "select * from sc_zhiwu WHERE zhiw_id='" + zhiwu_id + "'";
            final List Records = retrieveDbRecords(context, oneSql);
            if (Records.isEmpty()) {
                sql =
                        "INSERT INTO sc_zhiwu(zhiw_id,gangweijibie_id) values('" + zhiwu_id
                                + "','其他')";
                SqlUtils.executeUpdate("sc_zhiwu", sql);
            }
        }
        SqlUtils.commit();
        return zhiwu_id;
    }
    
    /**
     * check the record of hrbook_em is already existed in em records
     * 
     * @param context
     * @param record
     * @return
     */
    private boolean isExistedEm(final String em_id) {
        boolean isExisted = false;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql = "select * from em WHERE em_id='" + em_id + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            isExisted = true;
        }
        SqlUtils.commit();
        return isExisted;
    }
    
    private String isExistedDp(final String dv_id, final String dp_id) {
        String dp_id_new;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql =
                "select * from dp WHERE dv_id='" + dv_id + "' and dp_id='" + dp_id + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            dp_id_new = dp_id;
        } else {
            dp_id_new = "";
        }
        SqlUtils.commit();
        return dp_id_new;
    }
    
    /**
     * if field is null,return ""
     * 
     * @param field
     * @return
     */
    private String isNull(final String field) {
        String isNull = field;
        if (field == null) {
            isNull = "";
        }
        return isNull;
    }
    
}
