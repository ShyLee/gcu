package com.archibus.service.school.equipment;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

public class UpdatePrimaryKeyValue {
    /**
     * 当插入记录时，更新相应表的主键
     * 
     * @param tableName 表名
     * @param fieldName 字段名
     * @param primaryTableFieldVlaue 主表的主键值
     * @return
     */
    public static String updateKey(final String tableName, final String fieldName,
            final String primaryValue) {
        // 返回结果
        String primaryKey = "";
        // 创建pk_rule表的dataSource，以便从中取得record
        final DataSource pkRuleDataSource =
                DataSourceFactory.createDataSourceForFields("pk_rule", new String[] { "table_name",
                        "field_name", "pk_rule", "pk_num", "pk_char", "pk_date_char", "comments" },
                    false);
        // 根据tableName和fieldName为筛选条件，检索出对应的记录
        final Clause clause1 = new Clause("pk_rule", "table_name", tableName, "=");
        final Clause clause2 = new Clause("pk_rule", "field_name", fieldName, "=");
        pkRuleDataSource.addRestriction(clause1);
        pkRuleDataSource.addRestriction(clause2);
        final List<DataRecord> records = pkRuleDataSource.getAllRecords();
        if (records.isEmpty()) {
            primaryKey = "";
        } else {
            final DataRecord record = records.get(0);
            // 调用方法，生成主键
            primaryKey = GetPrimaryKeyValue.getKey(record, primaryValue);
        }
        return primaryKey;
    }
}
