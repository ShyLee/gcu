package com.archibus.service.school.dbf;

import java.io.*;
import java.sql.*;
import java.text.*;

import com.archibus.context.ContextStore;
import com.archibus.jobmanager.*;
import com.archibus.service.school.javadbf.*;

public class WriteEqToSZJ extends JobBase {
    
    public void writeToSzj(final JobStatus status) {
        try {
            
            final DBFWriter writer = new DBFWriter();
            // 获取EQ设备表的字段
            final DBFField fields[] = FieldDef.getEqFields();
            writer.setFields(fields);
            
            // 从数据库中挑出值
            final getConnection getConn = new getConnection();
            final java.sql.Connection conn = getConn.get();
            
            final String sql =
                    "select (select bh_num from dv where dv.dv_id=eq.dv_id) as dv_bh_num,"
                            + "(select bh_num from dp_top where dp_top.dp_id=eq.dp_id) as dp_bh_num,"
                            + "(select bh_num from dp_level where dp_level.dl_id=eq.dl_id) as dl_bh_num,"
                            + "dv_sy,eq_id,"
                            + "substr(csi_id,0,8) as csi_id,"
                            + "eq_name,NVL(eq_type,'*') as eq_type,NVL(eq_std,'*') as eq_std,price,"
                            + "NVL(ctry_name,'中国') as ctry_name,"
                            + "NVL(ctry_id,'156') as ctry_id,"
                            + "NVL(vn_id,'无') as vn_id,num_serial,date_manufactured,date_purchased,attachments_num,attachments_price,sch_status,level_manage,"
                            + "em_name,subject_funds,decode(type_use,'8','9',type_use) as type_use,handling_em_name,date_change,dv_ly,gbkw,cat_id,date_in_storage,sci_resh_id,danju_id,"
                            + "nvl(bookkerper_name,'张炜') as bookkerper_name ,"
                            + "option1,option2,"
                            + "option3,number1,number2,approved,mark,way_check,approved_fiance,date_fin_approved,approved_by_fin,comments,dv_id,source from eq "
                            + " where eq.sch_status!='5' and eq.sch_status!='6' and  eq.sch_status!='7' and  eq.sch_status!='C' and eq.sch_status!='D' and  (eq.add_eq_id is null or add_eq_id in (select add_eq_id from add_eq where add_eq.status='4'))";
            
            System.out.println("[查询语句]：" + sql);
            
            final Statement stat = conn.createStatement();
            final ResultSet rs = stat.executeQuery(sql);
            int i = 0;
            while (rs.next()) {
                i++;
                System.out.println("正在向主机库中加载第" + i + "条记录");
                final Object[] rowData = new Object[fields.length];
                // 根据archibus 设备表中的dv,dp_top,dp_level确定eq中dv_sy的值
                String dvSy = "";
                final String dvBh = rs.getString("dv_bh_num");
                final String dpBh = rs.getString("dp_bh_num");
                final String dlBh = rs.getString("dl_bh_num");
                if (dvBh != null) {
                    if (!dvBh.equals("")) {
                        dvSy = dvBh;
                        if (dpBh != null) {
                            if (!dpBh.equals("")) {
                                dvSy = dpBh;
                                if (dlBh != null) {
                                    if (!dlBh.equals("")) {
                                        dvSy = dlBh;
                                    }
                                }
                            }
                        }
                    }
                }
                
                rowData[0] = dvSy;// 领用单位号
                rowData[1] = rs.getString("eq_id");// 仪器编号
                rowData[2] = rs.getString("csi_id");// 分类号
                rowData[3] = rs.getString("eq_name");// 仪器名称
                rowData[4] = rs.getString("eq_type");// 型号
                rowData[5] = rs.getString("eq_std");// 规格
                rowData[6] = rs.getDouble("price");// 单价
                rowData[7] = rs.getString("ctry_name");// 国别
                rowData[8] = rs.getString("ctry_id");// 国别码
                rowData[9] = rs.getString("vn_id");// 厂家
                rowData[10] = rs.getString("num_serial");// 出厂号
                final SimpleDateFormat format1 = new SimpleDateFormat("yyyy.MM");
                if (rs.getDate("date_manufactured") == null) {
                    rowData[11] = format1.format(rs.getDate("date_purchased"));
                } else {
                    // rowData[11] = format1.format(rs.getDate("date_manufactured"));// 出厂日期
                    rowData[11] = format1.format(rs.getDate("date_purchased"));
                }
                if (rs.getDate("date_purchased") == null) {
                    rowData[12] = null;// 购置日期
                } else {
                    rowData[12] = format1.format(rs.getDate("date_purchased"));// 购置日期
                }
                rowData[13] = rs.getDouble("attachments_num");// 附件数量
                rowData[14] = rs.getDouble("attachments_price");// 附件总价
                rowData[15] = rs.getString("sch_status");// 现状
                // rowData[15] = "1";// 现状
                rowData[16] = rs.getString("level_manage");// 管理级别
                rowData[17] = rs.getString("em_name");// 领用人
                rowData[18] = rs.getString("subject_funds");// 经费科目
                rowData[19] = rs.getString("type_use");// 使用方向
                rowData[20] = rs.getString("handling_em_name");// 经手人
                
                rowData[21] = rs.getDate("date_change");// 变动日期
                rowData[22] = rs.getString("dv_ly");// 使用单位号
                rowData[23] = rs.getString("gbkw");// 国标分类号
                rowData[24] = rs.getString("cat_id");// 资产类别
                rowData[25] = rs.getDate("date_in_storage");// 入库时间
                rowData[26] = rs.getString("sci_resh_id");// 科研号
                rowData[27] = "";// 设备号
                rowData[28] = rs.getString("danju_id");// 单据号
                rowData[29] = rs.getString("bookkerper_name");// 记账人
                rowData[30] = rs.getString("option1");// 字符字段1
                rowData[31] = rs.getString("option2");// 字符字段2
                rowData[32] = rs.getString("option3");// 字符字段3
                rowData[33] = rs.getDouble("number1");// 数字字段1
                rowData[34] = rs.getDouble("number2");// 数字字段2
                
                final String approved = rs.getString("approved");
                boolean appro = true;
                if (approved == "T") {
                    appro = true;
                } else {
                    appro = false;
                }
                rowData[35] = appro;// 审核
                
                new SimpleDateFormat("yyyyMMdd");
                rowData[36] = rs.getDate("date_in_storage");// 序号
                rowData[37] = rs.getString("mark");// 标志
                rowData[38] = rs.getString("way_check");// 清查方式
                new SimpleDateFormat("yyyy/MM/dd");
                rowData[39] = null;// 清查日期
                rowData[40] = "";// 清查异常
                
                rowData[41] = true;// 财务审核
                rowData[42] = rs.getDate("date_fin_approved");// 财务审核日期
                rowData[43] = rs.getString("approved_by_fin");// 财务审核人
                rowData[44] = "";// 审单人
                rowData[45] = "";// 图片文件
                rowData[46] = "";// 校区
                rowData[47] = rs.getString("comments");// 备注
                rowData[48] = rs.getString("dv_id");// 领用单位名
                rowData[49] = rs.getString("source");// 仪器来源
                rowData[50] = "";// 编号
                rowData[51] = "";// 替换标志
                rowData[52] = null;// 审核日期
                
                writer.addRecord(rowData);
                
                if (i == 10000) {
                    status.setCurrentNumber(20);
                }
                if (i == 20000) {
                    status.setCurrentNumber(30);
                }
                
                if (i == 35000) {
                    status.setCurrentNumber(40);
                }
                
            }
            
            rs.close();
            stat.close();
            conn.close();
            final String dbfFilePath =
                    ContextStore.get().getWebAppPath().toString() + File.separatorChar + "DBF"
                            + File.separatorChar + "s_zj.dbf";
            final OutputStream fos = new FileOutputStream(dbfFilePath);
            
            // 写入数据
            writer.setCharactersetName("GBK");
            writer.write(fos);
            //
            fos.close();
            System.out.println("写入完毕!");
            status.setCurrentNumber(60);
            
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
