package com.archibus.service.school.dbf;

import java.io.*;
import java.sql.*;
import java.text.ParseException;

import com.archibus.context.ContextStore;
import com.archibus.service.school.javadbf.*;

public class WriteDvToSDW {
    public void writeToSdw() {
        try {
            
            final DBFWriter writer = new DBFWriter();
            // 获取EQ设备表的字段
            final DBFField fields[] = FieldSDWDef.getDwFields();
            writer.setFields(fields);
            
            // 从数据库中挑出值
            final getConnection getConn = new getConnection();
            final java.sql.Connection conn = getConn.get();
            
            final String sql =
                    "  select bh_num,bh_name,bh_dwjc,bh_dwjm,bh_jlnf,bh_dwxz,bh_syfxz,bh_jfkmz,bh_dwbz,NVL(bh_bz,'5') as bh_bz,NVL(bh_sh,'F') as bh_sh,NVL(bh_xq,'0') as  bh_xq"
                            + "  from"
                            + "  ("
                            + "    ("
                            + "    select '00' as bh_num,'对外经济贸易大学' as bh_name,'对外经贸' as bh_dwjc,'' as bh_dwjm, '1951' as bh_jlnf,'1' as bh_dwxz,'2' as bh_syfxz,'1' as bh_jfkmz,'' as bh_dwbz,'' as bh_bz, '' as bh_sh,'0' as bh_xq"
                            + "    from dual"
                            + "    ) "
                            + "    union"
                            + "    ("
                            + "    select bh_num,dv_id as bh_name,bh_dwjc,bh_dwjm,bh_jlnf,bh_dwxz,bh_syfxz,bh_jfkmz,"
                            + "    (select '*' from dual where not exists(select dp_id from dp_top where dp_top.dv_id=dv.dv_id)) as bh_dwbz,"
                            + "    bh_bz,bh_sh,bh_xq from dv"
                            + "    where dv.dv_id!='未分配' and dv.dv_id != '学校' and dv.dv_id !='校领导' and dv.dv_id!='其他'"
                            + "    )"
                            + "    union"
                            + "    ("
                            + "    select bh_num,dp_id as bh_name,bh_dwjc,bh_dwjm,bh_jlnf,bh_dwxz,bh_syfxz,bh_jfkmz,"
                            + "    (select '*' from dual where not exists(select dl_id from dp_level where dp_level.dp_id=dp_top.dp_id)) as bh_dwbz,"
                            + "    bh_bz,bh_sh,bh_xq from dp_top"
                            + "    where dv_id in (select dv_id from dv where dv.dv_id!='未分配' and dv.dv_id != '学校' and dv.dv_id !='校领导' and dv.dv_id!='其他')"
                            + "    )"
                            + "    union"
                            + "    ("
                            + "    select bh_num,dl_id as bh_name,bh_dwjc,bh_dwjm,bh_jlnf,bh_dwxz,bh_syfxz,bh_jfkmz,'*' as bh_dwbz,bh_bz,bh_sh,bh_xq from dp_level"
                            + "    where dv_id in (select dv_id from dv where dv.dv_id!='未分配' and dv.dv_id != '学校' and dv.dv_id !='校领导' and dv.dv_id!='其他')"
                            + "    )" + "  )";
            
            System.out.println("[查询语句]：" + sql);
            
            final Statement stat = conn.createStatement();
            final ResultSet rs = stat.executeQuery(sql);
            int i = 0;
            while (rs.next()) {
                i++;
                System.out.println("正在向单位库中加载第" + i + "条记录");
                final Object[] rowData = new Object[fields.length];
                
                // 向变动库中写入数据
                rowData[0] = rs.getString("bh_num");// 单位编号
                rowData[1] = rs.getString("bh_name");// 单位名称
                rowData[2] = rs.getString("bh_dwjc");// 单位简称
                rowData[3] = rs.getString("bh_dwjm");// 单位简码
                rowData[4] = rs.getString("bh_jlnf");// 建立年份
                rowData[5] = rs.getString("bh_dwxz"); // 单位性质
                rowData[6] = rs.getString("bh_syfxz");// 使用方向值
                rowData[7] = rs.getString("bh_jfkmz");// 经费科目值
                rowData[8] = rs.getString("bh_dwbz");// 单位标志
                rowData[9] = rs.getString("bh_bz");// 标志
                rowData[10] = rs.getString("bh_sh");// 审核
                rowData[11] = rs.getString("bh_xq");// 校区
                writer.addRecord(rowData);
                
            }
            
            rs.close();
            stat.close();
            conn.close();
            final String dbfFilePath =
                    ContextStore.get().getWebAppPath().toString() + File.separatorChar + "DBF"
                            + File.separatorChar + "S_DW.dbf";
            final OutputStream fos = new FileOutputStream(dbfFilePath);
            
            // 写入数据
            writer.setCharactersetName("GBK");
            writer.write(fos);
            //
            fos.close();
            System.out.println("写入完毕!");
            
        } catch (final DBFException e) {
            e.printStackTrace();
        } catch (final FileNotFoundException e) {
            e.printStackTrace();
        } catch (final SQLException e) {
            e.printStackTrace();
        } catch (final ParseException e) {
            e.printStackTrace();
        } catch (final IOException e) {
            e.printStackTrace();
        } catch (final Exception e) {
            e.printStackTrace();
        }
    }
}
