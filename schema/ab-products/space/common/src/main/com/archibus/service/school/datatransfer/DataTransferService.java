package com.archibus.service.school.datatransfer;

import java.sql.*;

public class DataTransferService {
    
    public static void houseTrans() throws Exception {
        Connection conn = null;
        // MySql 数据库Ip:10.1.1.57:3306/hnlgoa username=root password=oa2014
        final String url =
                "jdbc:mysql://10.1.1.57:3306/hnlgoa?"
                        + "user=root&password=oa2014&useUnicode=true&characterEncoding=UTF8";
        
        try {
            Class.forName("com.mysql.jdbc.Driver");
            System.out.println("成功加载MySQL驱动程序");
            conn = DriverManager.getConnection(url);
            new DataTransferHouseToFc().SyncHouseDataToFc(conn);
        } catch (final SQLException e) {
            System.out.println("MySQL操作错误");
            e.printStackTrace();
        } catch (final Exception e) {
            e.printStackTrace();
        } finally {
            conn.close();
        }
    }
}
