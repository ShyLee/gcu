package com.archibus.service.school.datatransfer;

import java.sql.*;
import java.util.*;
import java.util.Date;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class DataTransferStuToFc extends EventHandlerBase {
    /*
     * HRBOOK = (DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = 10.1.1.63)(PORT =
     * 5432)) ) (CONNECT_DATA = (SERVICE_NAME = urpdb) ) )
     * 
     * 数据库用户：gcu_zcc/pwd_zcc141202 学生数据（学号、姓名、性别、单位编码、单位名称、专业编码、专业名称、入学年份、状态、长号、短号） 授权开放可供查询的数据表：
     * 教职工信息：zcc_jsxxb_view
     */
    String selectSql =
            "select xh,xm,xbdm,xydm,xymc,zydm,zymc,rxnf,ydlb,ch,dh,sfzx from zcc_xsxxb_view where sfzx='是'";
    
    /*
     * static String url = "jdbc:postgresql://10.1.1.63:5432/zhxy";
     * 
     * static String usr = "gcu_zcc";
     * 
     * static String psd = "pwd_zcc141202";
     * 
     * public static void start() { Connection conn = null; try {
     * Class.forName("org.postgresql.Driver"); conn = DriverManager.getConnection(url, usr, psd);
     * new DataTransferStuToFc().SyncStuDataToFc(conn);
     * 
     * conn.close(); } catch (final Exception e) { e.printStackTrace(); } }
     */
    
    public void SyncStuDataToFc(final Connection conn) {
        this.log.info("Sync Stu Data rule called begin at " + new Date());
        
        ResultSet rs1;
        try {
            final Statement st1 = conn.createStatement();
            rs1 = st1.executeQuery(this.selectSql);
            while (rs1.next()) {
                final String stu_no = rs1.getString(1);
                this.compareEm(conn, stu_no);
            }
        } catch (final SQLException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        
    }
    
    /**
     * compare the record ,then update or insert record in Stu table
     * 
     * @param context
     * @param record
     */
    public void compareEm(final Connection conn, final String stu_no) {
        // TODO Auto-generated method stub
        
        if (this.isExistedStu(stu_no)) {
            this.updateStu(conn, stu_no);
        } else {
            this.insertStu(conn, stu_no);
        }
    }
    
    /**
     * insert new record from zcc_xsxxb_view
     * 
     * @param context
     * @param record
     */
    public void insertStu(final Connection conn, final String stu_no) {
        ResultSet rs3;
        String sql = null;
        try {
            final Statement st3 = conn.createStatement();
            rs3 = st3.executeQuery("select xh,xm from zcc_xsxxb_view where xh='" + stu_no + "'");
            while (rs3.next()) {
                final String name = this.isNull(rs3.getString(2));
                
                sql =
                        "INSERT INTO sc_student(stu_no,stu_name) VALUES('" + stu_no + "','" + name
                                + "')";
                try {
                    SqlUtils.executeUpdate("sc_student", sql);
                } catch (final Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                    this.log.error("insert into sc_student: sql=" + sql);
                    continue;
                }
            }
        } catch (final SQLException e) {
            this.log.error("insert into sc_student: sql=" + sql);
            this.log.error(e.getMessage());
        }
        SqlUtils.commit();
    }
    
    /**
     * update Stu fields:name,dv_id,status
     * 
     * @param context
     * @param record
     */
    public void updateStu(final Connection conn, final String stu_no) {
        ResultSet rs2;
        String sql = null;
        try {
            final Statement st2 = conn.createStatement();
            rs2 =
                    st2.executeQuery("select xh,xm,xbdm,xydm,xymc,zydm,zymc,rxnf,ydlb,ch,dh,sfzx from zcc_xsxxb_view where xh='"
                            + stu_no + "'");
            while (rs2.next()) {
                final String name = this.isNull(rs2.getString(2));
                final String xbdm = this.isNull(rs2.getString(3));
                final String xydm = this.isNull(rs2.getString(4));
                final String xymc = this.isNull(rs2.getString(5));
                final String zydm = this.isNull(rs2.getString(6));
                final String zymc = this.isNull(rs2.getString(7));
                final String rxnf = this.isNull(rs2.getString(8));
                final String status_old = this.isNull(rs2.getString(9));
                String status = "";
                final String ch = this.isNull(rs2.getString(10));
                final String dh = this.isNull(rs2.getString(11));
                final String sfzx = this.isNull(rs2.getString(12));
                if (status_old.equals("无异动")) {
                    if (sfzx.equals("是")) {
                        status = "1";
                    } else {
                        status = "99";
                    }
                } else {
                    status = "1";
                }
                sql =
                        "UPDATE sc_student SET stu_name='" + name + "',stu_sex='" + xbdm
                                + "',dv_id='" + xydm + "',dv_name='" + xymc + "',pro_id='" + zydm
                                + "',pro_name='" + zymc + "',stu_in_year='" + rxnf
                                + "',telephone='" + ch + "',phone='" + dh + "',status='" + status
                                + "' WHERE stu_no='" + stu_no + "'";
                try {
                    SqlUtils.executeUpdate("sc_student", sql);
                } catch (final Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                    this.log.error("update sc_student: sql=" + sql);
                    continue;
                }
            }
        } catch (final SQLException e) {
            this.log.error("update sc_student: sql=" + sql);
            this.log.error(e.getMessage());
        }
        SqlUtils.commit();
        
    }
    
    /**
     * check the record of zcc_xsxxb_view is already existed in sc_student records
     * 
     * @param context
     * @param record
     * @return
     */
    private boolean isExistedStu(final String stu_no) {
        boolean isExisted = false;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String oneSql = "select * from sc_student WHERE stu_no='" + stu_no + "'";
        final List Records = retrieveDbRecords(context, oneSql);
        if (!Records.isEmpty()) {
            isExisted = true;
        }
        SqlUtils.commit();
        return isExisted;
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
