package com.archibus.basic.data.service;

import java.util.*;

import com.alibaba.fastjson.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;

public class AjaxDataServiceImpl extends EventHandlerBase implements AjaxDataService {
    
    /**
     * fetchSumByTableFieldRestriction.
     * 
     * @param tableName
     * @param fieldName
     * @param restriction
     * @return 根据表名、字段名、条件 返回统计求和信息 如所有土地面积求和
     */
    public String sumForTable(final String tableName, final String fieldName, String restriction) {
        if ("".equals(restriction) || null == restriction) {
            restriction = "1=1";
        }
        
        final double result =
                DataStatistics.getDouble(tableName, fieldName, DataServiceUtils.SUM, restriction);
        final String tmp = DataServiceUtils.get2Double(result);
        final JSONObject obj = new JSONObject();
        obj.put("sum:" + tableName + "." + fieldName, tmp);
        return obj.toJSONString();
    }
    
    /**
     * 
     * fetchCountByTableFieldRestriction.
     * 
     * @param tableName
     * @param fieldName
     * @param restriction
     * @return 根据表名、字段名、条件 返回统计个数 如统计地块数量
     */
    public String countForTable(final String tableName, final String fieldName, String restriction) {
        if ("".equals(restriction) || null == restriction) {
            restriction = "1=1";
        }
        
        final Integer result =
                DataStatistics.getInt(tableName, fieldName, DataServiceUtils.COUNT, restriction);
        final JSONObject obj = new JSONObject();
        obj.put(tableName + "." + fieldName, result);
        return obj.toJSONString();
    }
    
    public String executeSQL(final String sql) {
        final List listObjects =
                EventHandlerBase.selectDbRecords(ContextStore.get().getEventHandlerContext(), sql);
        final String result = JSON.toJSONString(listObjects);
        return result;
    }
    
    public String getUserName() {
        final DataSource userDS =
                DataSourceFactory.createDataSourceForFields("em", new String[] { "em_id", "name" });
        userDS.setApplyVpaRestrictions(false);
        userDS.addRestriction(Restrictions
            .eq("em", "em_id", ContextStore.get().getUser().getName()));
        final DataRecord record = userDS.getRecord();
        String userName = "";
        if (record != null) {
            userName = record.getString("em.name");
        }
        
        return userName;
    }
    
    public String updateDataSchema(final String tableName) {
        final String sql =
                "select table_name,field_name,ml_heading from afm_flds where table_name='"
                        + tableName + "'";
        final List listObjects =
                EventHandlerBase.selectDbRecords(ContextStore.get().getEventHandlerContext(), sql);
        final Iterator it = listObjects.iterator();
        while (it.hasNext()) {
            final Object[] row = (Object[]) it.next();
            System.err.println(row);
            final String execsql =
                    "COMMENT ON COLUMN " + row[0].toString() + "." + row[1].toString() + " IS '"
                            + row[2].toString() + "'";
            SqlUtils.executeUpdate(row[0].toString(), execsql);
            SqlUtils.commit();
        }
        return "success";
    }
    
}
