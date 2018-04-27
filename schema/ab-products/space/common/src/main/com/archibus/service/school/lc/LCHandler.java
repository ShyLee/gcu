package com.archibus.service.school.lc;

import org.json.JSONObject;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class LCHandler extends EventHandlerBase {

    public void addUpdateLog(JSONObject record) {
        EventHandlerContext context = ContextStore.get().getEventHandlerContext(); 
        String operator = ContextStore.get().getUser().getName();
        String sql = "INSERT INTO sc_update_log(activity_log_id, bl_id, fl_id, rm_id,operator, description) values("+
        record.getString("activity_log_id")+","+
        literal(context, record.getString("bl_id"))+","+
        literal(context, record.getString("fl_id"))+","+
        literal(context, record.getString("rm_id"))+","+
        literal(context, operator)+","+
        literal(context, record.getString("description"))+")";
        
        SqlUtils.executeUpdate("sc_update_log", sql);
        SqlUtils.commit();
    }
}
