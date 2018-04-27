package com.archibus.service.school.lc;

import org.json.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;

public class StepHandler extends EventHandlerBase {
    /**
     * 
     * 删除流程步骤,同时删除流程、流程log日志中相关步骤
     * 1.首先删除helpdesk_step_log表中的相关流程步骤
     * 2.删除helpdesk_sla_steps表中的相关流程步骤
     * 3.最后删除afm_wf_steps表中的流程步骤
     * @param records
     */
    public void deleteWFStepRecord(final JSONArray records) {
        for (int i = 0; i < records.length(); i++) {
            final JSONObject record = records.getJSONObject(i);
            final String activityId = record.getString("afm_wf_steps.activity_id");
            final String step = record.getString("afm_wf_steps.step");
            final String status = record.getString("afm_wf_steps.status");
            
            final String sql1 =
                    "DELETE FROM helpdesk_step_log  WHERE activity_id = '" + activityId + "' AND status = '" + status
                            + "' AND step = '" + step + "'";
            SqlUtils.executeUpdate("helpdesk_step_log", sql1);
            SqlUtils.commit();
            
            final String sql2 =
                    "DELETE FROM helpdesk_sla_steps  WHERE activity_id = '" + activityId + "' AND status = '" + status
                            + "' AND step = '" + step + "'";
            SqlUtils.executeUpdate("helpdesk_sla_steps", sql2);
            SqlUtils.commit();
            
            final String sql3 =
                    "DELETE FROM afm_wf_steps  WHERE activity_id = '" + activityId + "' AND status = '" + status
                            + "' AND step = '" + step + "'";
            SqlUtils.executeUpdate("afm_wf_steps", sql3);
            SqlUtils.commit();
            
        }
    }
}
