package com.archibus.service.school.equipment;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * 根据csi_id生成分类编码的层级树
 * 
 * @author JiaGuoqiang
 * @since 2012-07
 * 
 */
public class CreateTreeLevel {
    /**
     * 
     * 通过一个树的一个节点，自动生成这个树的层级列表
     * 
     */
    public static void createTreeLevel() {
        final String tableName = "csi";// 表
        final String levelName = "hierarchy_ids";// 层次字符串所在的列
        final String treeId = "csi_id";// 参照的Id所在的列
        String StringTreeLevel = "";// 最终生成的层级结构字符串
        // 初始化创建数据源
        DataSource queryDataSource = null;
        // 初始化数据记录列表
        List<DataRecord> records = null;
        // 初始化数据单条记录
        DataRecord record = null;
        Clause clause = null;
        
        // 将所有数据根据头两位分为16组，减少缓存数据量
        for (int m = 0; m < 17; m++) {
            String headValue = "";
            if (m < 10) {
                headValue = "0" + String.valueOf(m);
            } else {
                headValue = String.valueOf(m);
            }
            queryDataSource =
                    DataSourceFactory.createDataSourceForFields(tableName, new String[] { treeId,
                            levelName }, false);
            if (headValue.equals("00")) {
                clause = new Clause(tableName, treeId, "0", "=");
            } else {
                clause = new Clause(tableName, treeId, "'" + headValue + "%'", "like");
            }
            queryDataSource.addRestriction(clause);
            records = queryDataSource.getAllRecords();
            
            // 取出records中的值进行遍历和操作
            if (!records.isEmpty() && records.size() != 0 && records != null) {
                for (int i = 0; i < records.size(); i++) {
                    record = records.get(i);
                    final String tableValue = tableName.concat(".").concat(treeId);
                    final String treeLevelId = record.getValue(tableValue).toString();
                    // 获取最终得到的层级字符串
                    StringTreeLevel = getConvertTreeLevel(treeLevelId);
                    // 将层级字符串保存到record中
                    record.setValue(tableName + "." + levelName, StringTreeLevel);
                    queryDataSource.updateRecord(record);
                }
            }
        }
    }
    
    /**
     * 拆分编号的方法
     * 
     * @param treeId 传入的用于拆分的编号
     * @return 返回按层级拆分好的编号
     */
    public static String getConvertTreeLevel(final String treeId) {
        String treeLevelString = "0";// 初始化最终生成的层级字符串
        // 将层级字符串进行两两拆分，存入数组
        final String[] ArrayLevel = new String[treeId.length() / 2];
        int k = 0;// 数组的索引值
        for (int i = 0; i < treeId.length() - 1; i = i + 2) {
            if (k < ArrayLevel.length) {
                ArrayLevel[k] = treeId.substring(i, i + 2);
                k = k + 1;
            }
        }
        String nodeT = "";// 递增追加单个节点
        // 依次向后遍历数组，当值不为00时，就追加到层级字符串中，当遇到00时就退出
        for (int i = 0; i < ArrayLevel.length; i++) {
            final String node = ArrayLevel[i];
            if (!node.equals("00")) {
                String nodeLevel = nodeT.concat(node);// 初始化节点字符串
                nodeT = nodeT.concat(node);
                final int bulingshu = (8 - (i + 1) * 2);// 设置每个节点补零的个数
                for (int j = 0; j < bulingshu; j++) {
                    nodeLevel = nodeLevel.concat("0");
                }
                // 将节点字符串拼接到层级字符串中
                treeLevelString = treeLevelString.concat("|" + nodeLevel);
            } else if (node.equals("00")) {
                break;
            }
        }
        treeLevelString = treeLevelString.concat("|");
        return treeLevelString;
    }
}