package com.archibus.service.school.equipment;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

public class GetPrimaryKeyValue {
    
    /**
     * 根据设定的规则自动设置主键值
     * 
     * @author JiaGuoqiang 2012-08
     * @param drecord 传入的DataRecord类型的参数
     * @param primaryTableFieldVlaue 当使用 主表键值+尾数 的主键策略时传入的主键值 当第二个参数为null时，即表示不按照 "主表键值+尾数"的方式生成主键
     * @return 生成后的主键字符
     */
    public static String getKey(final DataRecord drecord, final String primaryValue) {
        
        String primaryKey = "";// 生成的主键值存入的变量
        try {
            // 获取所传的drecord中的每条记录
            final String tableName = drecord.getValue("pk_rule.table_name").toString();
            final String fieldName = drecord.getValue("pk_rule.field_name").toString();
            String pkChar = "";
            final String ruleType = String.valueOf(drecord.getValue("pk_rule.pk_rule"));
            final Date pkDate = new Date();
            final SimpleDateFormat formater = new SimpleDateFormat("yyyyMMdd");
            String pkDateChar = formater.format(pkDate);
            int pkNum = 0;
            String queryLike = "";// 数据检索字段如YS2012
            
            // 主键字符串+年份+4位尾数
            if (ruleType.equals("0")) {
                pkChar = drecord.getValue("pk_rule.pk_char").toString();
                pkDateChar = pkDateChar.substring(0, 4);
                queryLike = pkChar + pkDateChar;
            }
            // 主键字符串+日期+4位尾数
            if (ruleType.equals("1")) {
                pkChar = drecord.getValue("pk_rule.pk_char").toString();
                queryLike = pkChar + pkDateChar;
            }
            // 主表主键值+4位尾数
            if (ruleType.equals("2")) {
                queryLike = primaryValue;
            }
            // 报增单号+尾数（其中尾数为报增单表中的count值）
            if (ruleType.equals("3")) {
                final String[] paramArray = primaryValue.split(":");
                queryLike = paramArray[0];
                pkNum = paramArray[1].length();
                if (pkNum == 1) {
                    pkNum = 2;
                }
            } else {
                pkNum = new Integer(drecord.getValue("pk_rule.pk_num").toString());
                if (pkNum == 1) {
                    pkNum = 2;
                }
            }
            
            // 年份+4位尾数
            if (ruleType.equals("4")) {
                pkNum = new Integer(drecord.getValue("pk_rule.pk_num").toString());
                queryLike = pkDateChar.substring(0, 4);
            }
            
            String sql = fieldName + " like '" + queryLike;
            for (int i = 0; i < pkNum; i++) {
                sql = sql.concat("_");
            }
            sql = sql.concat("'");
            // 获取所要查询的表和列所构成的dataSource
            final DataSource queryDataSource =
                    DataSourceFactory.createDataSourceForFields(tableName,
                        new String[] { fieldName }, false);
            // 为dataSource添加筛选条件
            queryDataSource.addRestriction(Restrictions.sql(sql));
            
            queryDataSource.setApplyVpaRestrictions(false);
            // 查询所有符合条件的record
            final List<DataRecord> records = queryDataSource.getAllRecords();
            // 当获取的记录为空时，即不存在符合规则的条件时，返回的主键值从1开始
            if (records.isEmpty() || records.size() == 0) {
                primaryKey = queryLike;
                if ((pkNum - 1) == 0) {
                    primaryKey = primaryKey.concat("0");
                } else if ((pkNum - 1) > 0) {
                    for (int i = 0; i < pkNum - 1; i++) {
                        primaryKey = primaryKey.concat("0");
                    }
                }
                primaryKey = primaryKey.concat("1");
            } else {
                // 所有的符合条件的记录中的最大的尾数，在此基础上执行+1操作
                int maxNum = 0;
                for (int i = 0; i < records.size(); i++) {
                    final DataRecord record = records.get(i);
                    final String fieldValue =
                            record.getValue(tableName + "." + fieldName).toString();
                    final String weiShu = fieldValue.substring(queryLike.length());// 截取出后面的几位尾数
                    // 判断后面几位尾数是否是数字形式的，如果不是则跳过
                    // 如果符合数字形式则挑选出所有记录中最大的一个，并在此基础上执行+1操作
                    final Pattern patt = Pattern.compile("[0-9]*");
                    final Matcher match = patt.matcher(weiShu);
                    if (match.matches() == true) {
                        final int biJiaoShu = new Integer(weiShu);
                        final int beiBiJiaoShu = new Integer(maxNum);
                        // 将每条记录对比后，挑出其中最大的
                        if (biJiaoShu > beiBiJiaoShu) {
                            maxNum = biJiaoShu;
                        }
                    }
                }
                
                // 设置被比较数，即9999*的形式，防止数据溢出;假如pk_num为4，那么转换的尾数的整数形式必须小于等于9999
                String fullNum = "";
                for (int t = 0; t < pkNum; t++) {
                    fullNum = fullNum.concat("9");
                }
                // 9999转换为整数
                final int fullNumInt = new Integer(fullNum);
                // 当尾数小于9999时，执行相关补零操作
                if (maxNum < fullNumInt) {
                    maxNum = maxNum + 1;
                    // 将数字前补零后存入生成的主键中
                    final int buLingShu = pkNum - (String.valueOf(maxNum).length());// 计算出补零的个数
                    String weiShuFanal = "";// 最终生成的位数的字符串形式
                    if (buLingShu == 0) {
                        // weiShuFanal = weiShuFanal.concat("0");
                    } else if (buLingShu > 0) {
                        for (int i = 0; i < buLingShu; i++) {
                            weiShuFanal = weiShuFanal.concat("0");
                        }
                    }
                    weiShuFanal = weiShuFanal.concat(String.valueOf(maxNum));
                    primaryKey = queryLike + weiShuFanal;
                } else {
                    primaryKey = "keyIsFull";
                }
            }
            
        } catch (final Exception e) {
            e.printStackTrace();
        }
        return primaryKey;
    }
}