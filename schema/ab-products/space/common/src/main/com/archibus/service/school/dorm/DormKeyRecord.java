package com.archibus.service.school.dorm;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class DormKeyRecord extends EventHandlerBase {
    StringBuffer errorLog = new StringBuffer();
    
    /**
     * 更新预算信息，同级预算总金额
     * 
     * @param budget_id
     * @param record
     */
    public void updateKeys(final String blId, final String flId, final String rmId,
            final String countAllKey, final String countKeyBackup) {
        
        final String updateSQL =
                "UPDATE rm SET count_all_key ='" + countAllKey + "' , count_key_backup ='"
                        + countKeyBackup + "'  WHERE bl_id = '" + blId + "' AND fl_id = '" + flId
                        + "' AND rm_id = '" + rmId + "'";
        this.log.debug("[UPDATE SQL]:[" + updateSQL + "]");
        SqlUtils.executeUpdate("rm", updateSQL);
        SqlUtils.commit();
    }
    
    /**
     * 通过bl_name拿到bl_id
     * 
     */
    public String getBlId(final String bl_name) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectSQL = "select bl_id from bl where name='" + bl_name + "'";
        
        try {
            final List records = retrieveDbRecords(context, selectSQL);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                if (!record.equals(null)) {
                    final String blId = record.get("bl_id").toString();
                    return blId;
                } else {
                    return "111";
                }
            }
        } catch (final Exception e) {
            this.log.debug("无楼栋名称");
            return "111";
        }
        return "111";
    }
    
    public String getFlId(final String blId, final String fl_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectSQL =
                "select fl_id from fl where fl_id='" + fl_id + "' AND bl_id= '" + blId + "'";
        
        try {
            final List records = retrieveDbRecords(context, selectSQL);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                if (!record.equals(null)) {
                    final String flId = record.get("fl_id").toString();
                    return flId;
                } else {
                    return "111";
                }
            }
        } catch (final Exception e) {
            this.log.debug("无楼层号");
            return "111";
        }
        return "111";
    }
    
    public String getRmId(final String blId, final String flId, final String rm_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String selectSQL =
                "select rm_id from rm where fl_id='" + flId + "' AND bl_id= '" + blId
                        + "' AND rm_id= '" + rm_id + "'";
        
        try {
            final List records = retrieveDbRecords(context, selectSQL);
            if (!records.isEmpty()) {
                final Map record = (Map) records.get(0);
                if (!record.equals(null)) {
                    final String rmId = record.get("rm_id").toString();
                    return rmId;
                } else {
                    return "111";
                }
            }
        } catch (final Exception e) {
            this.log.debug("无房间号");
            return "111";
        }
        return "111";
    }
    
    /**
     * 格式化数字类型数据，目前要求是如果输入的内容为空，则保存空值
     * 
     * @param record
     * @param name
     * @return
     */
    
    protected static int getNoNullInteger(final HashMap<String, Object> record, final String name) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Object rec = record.get(name);
        int n = 0;
        if (rec != null && rec != "") {
            n = getIntegerValue(context, rec).intValue();
            
        }
        return n;
    }
}
