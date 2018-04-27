package com.archibus.service.school;

import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;

public class UpdateRmUse extends EventHandlerBase {
    
    public void updateRmUseInfo() {
        final String oneSql =
                "update rm set em_use =(select wm_concat(em.name) from em where  rm.bl_id=em.bl_id AND RM.FL_ID=EM.FL_ID and rm.rm_id=em.rm_id and em.rm_id is not null)";
        this.log.debug("[UPDATE RM SQL]:[" + oneSql + "]");
        SqlUtils.executeUpdate("rm", oneSql);
        SqlUtils.commit();
        
    }
    
}
