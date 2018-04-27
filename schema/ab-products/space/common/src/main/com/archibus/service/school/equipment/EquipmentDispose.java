/**
 * 
 */
package com.archibus.service.school.equipment;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * @author Administrator
 * 
 */
public class EquipmentDispose extends EventHandlerBase {
    public static void dispose_equipment(final String rtr_dip_id) {
        if (rtr_dip_id.equals("")) {
            return;
        }
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String updateSQL =
                "UPDATE eq SET eq.sch_status =   (SELECT eq_change.status   FROM eq_change WHERE eq.eq_id           = eq_change.eq_id  AND eq_change.rtr_dip_id = '"
                        + rtr_dip_id
                        + "' )WHERE eq.eq_id IN  (SELECT eq_change.eq_id  FROM eq_change  WHERE  eq_change.rtr_dip_id = '"
                        + rtr_dip_id + "'  )";
        System.out.println("[updateSQL]：" + updateSQL.toString());
        try {
            executeDbSql(context, updateSQL, false);
        } catch (final Exception e) {
            System.out.println("[错误]：" + e.toString());
        }
        
    }
}
