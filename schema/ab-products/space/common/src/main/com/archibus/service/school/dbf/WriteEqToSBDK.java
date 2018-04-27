package com.archibus.service.school.dbf;

import java.io.*;
import java.sql.*;
import java.text.*;

import com.archibus.context.ContextStore;
import com.archibus.service.school.javadbf.*;

public class WriteEqToSBDK {
    public void writeToSbdk() {
        try {
            
            final DBFWriter writer = new DBFWriter();
            // 获取EQ设备表的字段
            final DBFField fields[] = FieldChangeDef.getChangeFields();
            writer.setFields(fields);
            
            // 从数据库中挑出值
            final getConnection getConn = new getConnection();
            final java.sql.Connection conn = getConn.get();
            
            final String sql =
                    "select changeDs.id,changeDs.eq_id,changeDs.dv_id_old,changeDs.dp_id_old,changeDs.dl_id_old,changeDs.operator,"
                            + "(select bh_num from dv where dv.dv_id=changeDs.dv_id_old) as dvNum,"
                            + "changeDs.dv_id,"
                            + "(select bh_num from dv where dv.dv_id=changeDs.dv_id) as dvToNum,"
                            + "(select bh_num from dp_top where dp_top.dv_id=changeDs.dv_id_old and dp_top.dp_id=changeDs.dp_id_old) as dpNum,"
                            + "(select bh_num from dp_level where dp_level.dv_id=changeDs.dv_id_old and dp_level.dp_id=changeDs.dp_id_old and dp_level.dl_id=changeDs.dl_id_old) as dlNum,"
                            + "changeDs.date_appraisal,"
                            + "NVL(changeDs.cost_old,0) as cost_old,"
                            + "NVL(changeDs.cz_value,0) as cz_value,"
                            + "substr(csi_id,0,8) as csi_id,eq.eq_name,eq.eq_type,eq.eq_std,eq.ctry_name,eq.ctry_id,eq.vn_id,"
                            + "NVL((select company from vn where vn.vn_id=eq.vn_id),eq.vn_id) as vn_name,"
                            + "eq.num_serial,eq.date_manufactured,eq.date_purchased,eq.attachments_num,"
                            + "eq.attachments_price,eq.sch_status,eq.level_manage,eq.em_name,eq.subject_funds,"
                            + "eq.type_use,eq.handling_em_name,"
                            + "(select NVL(change_reason,(select description from return_dispose where rtr_dip_id=eq_change.rtr_dip_id)) from eq_change where id=changeDs.id) as eq_quxiang,"
                            + "eq.gbkw,eq.cat_id,eq.date_in_storage,eq.sci_resh_id,eq.danju_id,eq.bookkerper_name,"
                            + "eq.option1,eq.option2,eq.option3,eq.number1,eq.number2,decode(eq.approved,'T','true','F','false') as approved,to_char(date_in_storage,'yyyymmdd') as eq_xuhao,"
                            + "eq.way_check,eq.date_fin_approved,eq.approved_by_fin,eq.comments,eq.source,eq.mark "
                            + "from "
                            + "("
                            + "(select id,eq_id,dv_id_old,dp_id_old,dl_id_old,dv_id,cost_old,date_appraisal,null as cz_value,"
                            + "(select name from em where em_id=eq_change.operator) as operator "
                            + " from eq_change where  "
                            + "approved_status='1' and rtr_dip_id in (select rtr_dip_id from return_dispose where audit_status='4' and data_type='0')) "
                            + "union "
                            + "(select id,eq_id,dv_id_old,dp_id_old,dl_id_old,null as dv_id,cost_old,date_appraisal,"
                            + "(cost-cost_old) as cz_value,"
                            + "(select name from em where em_id=eq_change.operator) as operator  "
                            + "from eq_change "
                            + "where type_adjust='3' and cost is not null and cost!=0 and rtr_dip_id in (select rtr_dip_id from return_dispose where audit_status='4' and data_type='1'))  "
                            + "union "
                            + "(select id,eq_id,dv_id_old,dp_id_old,dl_id_old,null as dv_id,cost_old,date_appraisal, "
                            + "(cost-cost_old) as cz_value, "
                            + "(select name from em where em_id=eq_change.operator) as operator "
                            + "from eq_change  "
                            + "where type_adjust='3' and (cost is  null or cost=0) and rtr_dip_id in (select rtr_dip_id from return_dispose where audit_status='4' and data_type='1')) "
                            + "union"
                            + "(select id,eq_id,dv_id_old,dp_id_old,dl_id_old,dv_id,cost_old,date_appraisal,null as cz_value,"
                            + "(select name from em where em_id=eq_change.operator) as operator "
                            + " from eq_change "
                            + "where approved_status='2' and rtr_dip_id in (select rtr_dip_id from return_dispose where audit_status='4' and data_type='0')) "
                            + ") changeDs,eq where changeDs.eq_id=eq.eq_id";
            
            System.out.println("[查询语句]：" + sql);
            
            final Statement stat = conn.createStatement();
            final ResultSet rs = stat.executeQuery(sql);
            int i = 0;
            while (rs.next()) {
                i++;
                System.out.println("正在向变动库中加载第" + i + "条记录");
                final Object[] rowData = new Object[fields.length];
                
                // 向变动库中写入数据
                final String dvNum = rs.getString("dvNum");
                final String dpNum = rs.getString("dpNum");
                final String dlNum = rs.getString("dlNum");
                String dvNumFinal = "";
                
                if (dvNum != null) {
                    if (!dvNum.equals("")) {
                        dvNumFinal = dvNum;
                        if (dpNum != null) {
                            if (!dpNum.equals("")) {
                                dvNumFinal = dpNum;
                                if (dlNum != null) {
                                    if (!dlNum.equals("")) {
                                        dvNumFinal = dlNum;
                                    }
                                }
                            }
                        }
                    }
                }
                
                rowData[0] = dvNumFinal;// 领用单位号
                rowData[1] = rs.getString("dv_id_old");// 领用单位名
                rowData[2] = rs.getString("eq_id");// 仪器编号
                rowData[3] = rs.getString("eq_name");// 仪器名称
                rowData[4] = rs.getString("sch_status");// 现状
                rowData[5] = rs.getDate("date_appraisal");// 变动日期
                
                rowData[6] = rs.getDouble("cost_old");// 单价
                rowData[7] = rs.getDouble("cz_value");// 变动单价
                rowData[8] = rs.getString("dvToNum");// 转入单位
                rowData[9] = rs.getString("eq_quxiang");// 去向
                
                rowData[10] = "";// 变动单据号
                rowData[11] = rs.getString("eq_type");// 型号
                rowData[12] = rs.getString("eq_std");// 规格
                rowData[13] = rs.getString("ctry_name");// 国别
                rowData[14] = rs.getString("csi_id");// 分类号
                rowData[15] = rs.getString("ctry_id");// 国别码
                rowData[16] = rs.getString("vn_id");// 厂家
                rowData[17] = rs.getString("num_serial");// 出厂号
                
                final SimpleDateFormat format1 = new SimpleDateFormat("yyyy.MM");
                rowData[18] = format1.format(rs.getDate("date_manufactured"));// 出厂日期
                rowData[19] = format1.format(rs.getDate("date_purchased"));// 购置日期
                rowData[20] = new Double("0");// 附件数量
                rowData[21] = new Double("1.01");// 附件单价
                rowData[22] = rs.getString("level_manage");// 管理级别
                rowData[23] = rs.getString("em_name");// 领用人
                rowData[24] = rs.getString("subject_funds");// 经费科目
                rowData[25] = rs.getString("type_use");// 使用方向
                rowData[26] = rs.getString("cat_id");// 资产类别
                rowData[27] = rs.getString("gbkw");// 国标分类号
                rowData[28] = rs.getString("handling_em_name");// 经手人
                rowData[30] = rs.getString("mark");// 标志
                rowData[31] = "";// 附件编号
                rowData[32] = "";// 附件名称
                rowData[33] = "";// 附型号规格
                rowData[34] = new Double("0.00");// 附件单价
                rowData[35] = new Double("0.00");// 附件进口价
                rowData[36] = new Double("0.00");// 进口单价
                rowData[37] = rs.getDate("date_in_storage");// 入库时间
                rowData[38] = rs.getString("dvNum");// 使用单位号
                rowData[39] = rs.getString("sci_resh_id");// 科研号
                rowData[40] = rs.getString("danju_id");// 单据号
                rowData[41] = "";// 设备号
                rowData[42] = rs.getString("option1");// 字符字段1
                rowData[43] = rs.getString("option2");// 字符字段2
                rowData[44] = rs.getString("option3");// 字符字段3
                rowData[45] = rs.getDouble("number1");// 数字字段1
                rowData[46] = rs.getDouble("number2");// 数字字段2
                rowData[47] = rs.getDate("date_in_storage");// 序号
                
                final String approved = rs.getString("approved");
                boolean appro = true;
                if (approved == "T") {
                    appro = true;
                } else {
                    appro = false;
                }
                rowData[48] = appro;// 审核
                rowData[49] = rs.getString("operator");// 修改人
                rowData[50] = "";// 校区
                rowData[51] = "";// 审单人
                rowData[52] = rs.getString("comments");// 备注
                rowData[53] = "";// 图片文件
                rowData[54] = true;// 财务审核
                rowData[55] = rs.getDate("date_fin_approved");// 财务审核日期
                rowData[56] = rs.getString("approved_by_fin");// 财务审核人
                rowData[57] = rs.getString("source");// 仪器来源
                
                writer.addRecord(rowData);
                
            }
            
            rs.close();
            stat.close();
            conn.close();
            final String dbfFilePath =
                    ContextStore.get().getWebAppPath().toString() + File.separatorChar + "DBF"
                            + File.separatorChar + "S_BDK.dbf";
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
