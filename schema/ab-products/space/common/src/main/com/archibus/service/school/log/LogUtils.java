package com.archibus.service.school.log;

import java.util.*;

import javax.servlet.http.HttpServletRequest;

import com.archibus.context.ContextStore;
import com.archibus.context.utility.DataSourceContextTemplate;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.utility.StringUtil;

public class LogUtils {
    public static String putFullNameGetFieldName(final String fullName) {
        final String[] str = fullName.split("\\.");
        return str[1].toString();
    }
    
    public static String putFullNameGetTableName(final String fullName) {
        final String[] str = fullName.split("\\.");
        return str[0].toString();
    }
    
    public static String getFieldLocalName(final String tableName, final String fieldName) {
        final DataSource ds =
                DataSourceFactory.createDataSource()
                    .addTable("afm_flds_lang", DataSource.ROLE_MAIN).addField("ml_heading_ch");
        
        prepareDataSourceContext(ds);
        final List<DataRecord> emList =
                ds.getRecords("table_name='" + tableName + "' and field_name='" + fieldName + "'");
        if (null == emList || emList.size() == 0) {
            return "";
        }
        String result = emList.get(0).getOldValue("afm_flds_lang.ml_heading_ch").toString();
        if (result.contains("\r\n")) {
            result = result.replaceAll("\r\n", "");
        }
        return result;
        
    }
    
    private static void prepareDataSourceContext(final DataSource ds) {
        if (ContextStore.get().getDbConnection() == null) {
            ContextStore.get().setDbConnection(
                ContextStore.get().getDatabase().getPool().getConnection());
        }
        if (ContextStore.get().getEventHandlerContext() == null) {
            DataSourceContextTemplate.prepareDataSourceContext(ds);
        }
    }
    
    public static String getIpAddr(final HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (StringUtil.isNullOrEmpty(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (StringUtil.isNullOrEmpty(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (StringUtil.isNullOrEmpty(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (StringUtil.isNullOrEmpty(ip)) {
            ip = "unknown";
        }
        return ip;
    }
    
    public static DataRecord getOldDataRecord(final List<String> primaryKey, final DataRecord dr,
            final String tableName) {
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable(tableName, DataSource.ROLE_MAIN);
        
        prepareDataSourceContext(ds);
        final Map<String, String> pkMap = new HashMap<String, String>();
        final List<String> nonePK = new ArrayList<String>();
        final List<DataValue> dvalue = dr.getFields();
        
        if (null != dvalue) {
            for (final DataValue dv : dvalue) {
                final String fullTitle = dv.getName();
                String value = "";
                if (dv.getFieldDef().getJavaType().getClass().getName().equalsIgnoreCase(
                    "com.archibus.schema.FieldJavaDateImpl")) {
                    if (null == dv.getValue()) {
                        value = "";
                    } else {
                        value = LogUtils.trimBoth(dv.getValue().toString());
                    }
                } else {
                    value = LogUtils.trimBoth(dv.getDbValue().toString());
                }
                final String localName = LogUtils.putFullNameGetFieldName(fullTitle);
                if (dv.getFieldDef().isPrimaryKey()) {
                    pkMap.put(localName, value);
                } else {
                    nonePK.add(localName);
                }
            }
        }
        for (final String str : nonePK) {
            ds.addField(str);
        }
        final StringBuffer restriction = new StringBuffer();
        for (final String key : primaryKey) {
            restriction.append(key).append("='" + pkMap.get(key) + "' and ");
        }
        restriction.append("1=1");
        final List<DataRecord> emList = ds.getRecords(restriction.toString());
        return emList.get(0);
        
    }
    
    public static String getPrimaryKeyString(final DataRecord dr) {
        final StringBuilder pkString = new StringBuilder("");
        final List<DataValue> dvalue = dr.getFields();
        final TreeSet<String> set = new TreeSet<String>();
        if (null != dvalue) {
            for (final DataValue dv : dvalue) {
                final String fullTitle = dv.getName();
                final String value = trimBoth(dv.getDbValue());
                LogUtils.putFullNameGetFieldName(fullTitle);
                if (dv.getFieldDef().isPrimaryKey()) {
                    set.add(value);
                }
            }
            final Iterator<String> it = set.iterator();
            while (it.hasNext()) {
                pkString.append(it.next());
            }
        }
        return pkString.toString();
    }
    
    public static String trimBoth(final String dbValue) {
        if (dbValue.startsWith("'") && dbValue.endsWith("'")) {
            return dbValue.replaceAll("'", "");
        }
        return dbValue;
    }
}
