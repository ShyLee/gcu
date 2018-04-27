package com.archibus.service.school.dbf;

import java.io.*;

import com.archibus.service.school.javadbf.*;

public class writeDBF {
    public static void write(final String path) {
        
        try
        
        {
            
            // DBFWriter writer = new DBFWriter(new File(path));
            
            final DBFWriter writer = new DBFWriter();
            
            // 把字段信息写入DBFWriter实例，即定义表结构
            final DBFField fields[] = new DBFField[12];
            fields[0] = new DBFField();
            fields[0].setName("单位编号");
            // fields[0].setName("dwbh");
            fields[0].setDataType(DBFField.FIELD_TYPE_C);
            fields[0].setFieldLength(10);
            
            fields[1] = new DBFField();
            fields[1].setName("单位名称");
            // fields[1].setName("dwmc");
            fields[1].setDataType(DBFField.FIELD_TYPE_C);
            fields[1].setFieldLength(30);
            
            fields[2] = new DBFField();
            fields[2].setName("单位简称");
            // fields[2].setName("dwjc");
            fields[2].setDataType(DBFField.FIELD_TYPE_C);
            fields[2].setFieldLength(10);
            
            fields[3] = new DBFField();
            fields[3].setName("单位简码");
            // fields[3].setName("dwjm");
            fields[3].setDataType(DBFField.FIELD_TYPE_C);
            fields[3].setFieldLength(20);
            
            fields[4] = new DBFField();
            fields[4].setName("建立年份");
            // fields[4].setName("jlnf");
            fields[4].setDataType(DBFField.FIELD_TYPE_C);
            fields[4].setFieldLength(4);
            
            fields[5] = new DBFField();
            fields[5].setName("单位性质");
            // fields[5].setName("dwxz");
            fields[5].setDataType(DBFField.FIELD_TYPE_C);
            fields[5].setFieldLength(1);
            
            fields[6] = new DBFField();
            fields[6].setName("使用方向值");
            // fields[6].setName("syfxz");
            fields[6].setDataType(DBFField.FIELD_TYPE_C);
            fields[6].setFieldLength(1);
            
            fields[7] = new DBFField();
            fields[7].setName("经费科目值");
            // fields[7].setName("jfkmz");
            fields[7].setDataType(DBFField.FIELD_TYPE_C);
            fields[7].setFieldLength(1);
            
            fields[8] = new DBFField();
            fields[8].setName("单位标志");
            // fields[8].setName("dwbz");
            fields[8].setDataType(DBFField.FIELD_TYPE_C);
            fields[8].setFieldLength(1);
            
            fields[9] = new DBFField();
            fields[9].setName("标志");
            // fields[9].setName("bz");
            fields[9].setDataType(DBFField.FIELD_TYPE_C);
            fields[9].setFieldLength(1);
            
            fields[10] = new DBFField();
            fields[10].setName("审核");
            // fields[10].setName("sh");
            fields[10].setDataType(DBFField.FIELD_TYPE_C);
            fields[10].setFieldLength(1);
            
            fields[11] = new DBFField();
            fields[11].setName("校区");
            // fields[11].setName("xq");
            fields[11].setDataType(DBFField.FIELD_TYPE_C);
            fields[11].setFieldLength(1);
            // writer.setCharactersetName("GBK");
            writer.setFields(fields);
            // 一条条的写入记录
            for (int i = 0; i < 10; i++) {
                final Object[] rowData = new Object[12];
                
                rowData[0] = "001"; // 单位编号
                
                rowData[1] = "测试测试测试测试测试测试测试测试"; // 单位名称
                
                rowData[2] = "测试测试测试测试"; // 单位简称
                rowData[3] = ""; // 单位简码
                rowData[4] = "2012";// 建立年份
                rowData[5] = "3";// 单位性质
                rowData[6] = "1";// 使用方向
                rowData[7] = "1";// 经费科目值
                rowData[8] = "";// 单位标志
                rowData[9] = "";// 标志
                rowData[10] = "F";// 审核
                rowData[11] = "0";// 校区
                // writer.setCharactersetName("UTF-8");
                writer.addRecord(rowData);
            }
            
            // 定义输出流，并关联的一个文件
            
            final OutputStream fos = new FileOutputStream(path);
            
            // 写入数据
            writer.setCharactersetName("GBK");
            writer.write(fos);
            //
            fos.close();
            // writer.write();
            
        } catch (final Exception e)
        
        {
            
            e.printStackTrace();
            
        }
        
        finally
        
        {
            
            try {
                
                System.out.println("写入完成");
                
            } catch (final Exception e) {
            }
            
        }
    }
    
    public static void main(final String[] args) {
        final String path = "D:/DBFTest/S_dw.dbf";
        writeDBF.write(path);
    }
}
