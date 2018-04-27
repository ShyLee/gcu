package com.archibus.service.school.log;

import java.text.*;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.context.utility.DataSourceContextTemplate;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.ExceptionBase;

public class SyncUtils {
    public static Date StringToDate(final String str) {
        Date time = new Date();
        final SimpleDateFormat st = new SimpleDateFormat("yyyy-MM-dd");
        try {
            time = st.parse(str);
        } catch (final ParseException e) {
            e.printStackTrace();
        }
        return time;
    }
    
    public static int Hour(final Date time) {
        final SimpleDateFormat st = new SimpleDateFormat("yyyyMMddHH");
        return Integer.parseInt(st.format(time));
    }
    
    public String getValue(final String activityId, final String paramId) {
        
        try {
            final DataSource mainDs =
                    DataSourceFactory.createDataSource().addTable("afm_activity_params").addField(
                        "activity_id").addField("param_id").addField("param_value");
            prepareDataSourceContext(mainDs);
            List<DataRecord> list = new ArrayList<DataRecord>();
            list =
                    mainDs.getRecords("afm_activity_params.activity_id='" + activityId
                            + "' and afm_activity_params.param_id='" + paramId + "'");
            if (null != list && list.size() > 0) {
                return list.get(0).getString("afm_activity_params.param_value");
            } else {
                return "0";
            }
        } catch (final ExceptionBase e) {
            
        }
        return "0";
    }
    
    public void setValue(final String activityId, final String paramId, final String paraValue) {
        try {
            final DataSource mainDs =
                    DataSourceFactory.createDataSource().addTable("afm_activity_params").addField(
                        "activity_id").addField("param_id").addField("param_value");
            prepareDataSourceContext(mainDs);
            final DataRecord targetRecord = mainDs.createNewRecord();
            targetRecord.setValue("afm_activity_params.activity_id", activityId);
            targetRecord.setValue("afm_activity_params.param_id", paramId);
            targetRecord.setValue("afm_activity_params.param_value", paraValue);
            mainDs.updateRecord(targetRecord);
        } catch (final ExceptionBase e) {
        }
    }
    
    private void prepareDataSourceContext(final DataSource ds) {
        if (ContextStore.get().getDbConnection() == null) {
            ContextStore.get().setDbConnection(
                ContextStore.get().getDatabase().getPool().getConnection());
        }
        
        if (ContextStore.get().getEventHandlerContext() == null) {
            DataSourceContextTemplate.prepareDataSourceContext(ds);
        }
    }
}
