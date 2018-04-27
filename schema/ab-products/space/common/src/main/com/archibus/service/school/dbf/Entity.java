package com.archibus.service.school.dbf;

import java.io.*;

import com.archibus.service.school.javadbf.*;

public class Entity {
    
    public static void readDbf() {
        
        try {
            
            // create a DBFReader object
            //
            // String dbfFileUrl = ContextStore.get().getWebAppPath().toString() +
            // File.separatorChar
            // + "reports" + File.separatorChar + "s_zj.dbf";
            // String dbfFileUrl = "D:/DBFTest/s_zj.dbf";
            final String dbfFileUrl = "D:/DBFTest/S_dw.dbf";
            // String dbfFileUrl = "D:/DBFTest/eq-bh.DBF";
            System.out.println(dbfFileUrl);
            new File(dbfFileUrl);
            final InputStream inputStream = new FileInputStream(dbfFileUrl); // take dbf file as
            // program
            final InputStreamReader inputReader = new InputStreamReader(inputStream);
            System.out.println("编码格式为：" + inputReader.getEncoding());
            // argument
            final DBFReader reader = new DBFReader(inputStream);
            
            // 获取字段个数
            System.out.println("字段个数为:" + reader.getFieldCount());
            
            reader.setCharactersetName(inputReader.getEncoding());
            final int numberOfFields = reader.getFieldCount();
            System.out.println("----------------表头------------------------");
            for (int i = 0; i < numberOfFields; i++) {
                
                final DBFField field = reader.getField(i);
                // System.out.println("---------------第" + i + "个字段--------------");
                // System.out.println("字段长度为：" + field.getFieldLength());
                // System.out.println("字段类型：" + field.getDataType());
                
                System.out.print(field.getName().toString().trim() + "\t");
                
                // Entity.write(field.getName(), "E:/Entity.txt");
                // System.out.println("文件输出完成");
            }
            System.out.println("----------------表头------------------------");
            System.out.println();
            // 循环输出各行数据
            
            System.out.println("----->>开始输出各列数据...");
            System.out.println();
            Object[] rowObj = null;
            while ((rowObj = reader.nextRecord()) != null) {
                // System.out.println("-------------正在输出第" + index + "条数据记录------------");
                for (final Object element : rowObj) {
                    System.out.print(element.toString().trim() + "\t");
                }
                System.out.println();
            }
            
            // By now, we have itereated through all of the rows
            
            inputStream.close();
        } catch (final DBFException e) {
            
            System.out.println(e.getMessage());
        } catch (final IOException e) {
            
            System.out.println(e.getMessage());
        }
    }
    
    public static void main(final String args[]) {
        Entity.readDbf();
    }
}
