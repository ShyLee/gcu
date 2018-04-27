package com.archibus.service.school.lc;

import java.util.*;

import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class RoleLookUp extends EventHandlerBase {
    
    public List<String> getDivisionManager(final EventHandlerContext context) {
        final String tableName = context.getString("tableName");
        final String fieldName = context.getString("fieldName");
        final String pkField = tableName + "." + fieldName;
        final int pkValue = context.getInt(pkField);
        
        final String requestor =
                notNull(selectDbValue(context, tableName, "requestor", fieldName + "=" + pkValue));
        final String dvId =
                notNull(selectDbValue(context, "em", "dv_id", "em.em_id ='" + requestor + "'"));
        return getManagerByDivision(context, dvId);
    }
    
    public List<String> getEmListByRole(final EventHandlerContext context) {
        final String role = (String) context.getParameter("role");
        this.log.info("role is " + role);
        return getListByHelpdeskRole(context, role);
    }
    
    public List<String> getManagerByDivision(final EventHandlerContext context, final String dvId) {
        final String tableName = context.getString("tableName");
        final String fieldName = context.getString("fieldName");
        final String pkField = tableName + "." + fieldName;
        context.getInt(pkField);
        
        final String manager =
                notNull(selectDbValue(context, "dv", "head", "dv.dv_id ='" + dvId + "'"));
        final List<String> list = new ArrayList<String>();
        if (manager.equals("")) {
            list.add("AFM");
        } else {
            list.add(manager);
        }
        return list;
    }
    
    public List<String> getListByHelpdeskRole(final EventHandlerContext context, final String role) {
        final List<String> emlist = new ArrayList<String>();
        final List records =
                selectDbRecords(context, "sc_role_em", new String[] { "em_id", "role" },
                    "sc_role_em.role ='" + role + "'");
        
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final String emId = (String) record[0];
            emlist.add(emId);
        }
        return emlist;
    }
    
    /**
     * when request submit, if the dv.head is not assigned. admin will assign the new dv.head, but
     * this new account of dv.head can not see the request info. So if it occurs, use this method to
     * adjust the helpdesk_step_log.em_id
     * 
     * @param context
     * @param activity_log_id
     * @throws Exception
     */
    public void adjustHelpStepLogExecutor(final EventHandlerContext context,
            final int activity_log_id) throws Exception {
        // 1 getDivisionManager
        final String requestor =
                notNull(selectDbValue(context, "activity_log", "requestor", "activity_log_id" + "="
                        + activity_log_id));
        final String dvId =
                notNull(selectDbValue(context, "em", "dv_id", "em.em_id ='" + requestor + "'"));
        final String manager =
                notNull(selectDbValue(context, "dv", "head", "dv.dv_id ='" + dvId + "'"));
        
        //
        final String message = "Info--The Head of Division : " + dvId + " is " + manager;
        if (this.log.isInfoEnabled()) {
            this.log.info(message);
        }
        // 2 update helpdesk_step_log.em_id
        final List records =
                selectDbRecords(context, "helpesk_step_log", new String[] { "step_log_id" },
                    "field_name ='activity_log_id' and step !='Basic' and em_id='AFM' and pkey_value="
                            + activity_log_id + "'");
        
        String stepLogId = "";
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            stepLogId = (String) record[0];
        }
        if (!stepLogId.equals("")) {
            final String updatesql =
                    "update helpdesk_step_log set em_id=" + literal(context, manager)
                            + ",user_name=" + literal(context, manager) + "where step_log_id = "
                            + stepLogId;
            SqlUtils.executeUpdate("sc_zzfrent_details", updatesql);
        } else {
            throw new Exception("Can not find step log record of this activity_log id :"
                    + activity_log_id);
        }
        
    }
    
    /**
     * when the dv.head changed, the username of the new head can not approve the step which should
     * approved by pre-head. So these step should assign to the username of new dv.head
     * 
     * @param context
     * @param dvId
     * @param preDvHead
     */
    public void reAssignStepAfterChgDvHead(final EventHandlerContext context, final String dvId,
            final String preDvHead) {
        // 1 get new manager
        final String newManager =
                notNull(selectDbValue(context, "dv", "head", "dv.dv_id ='" + dvId + "'"));
        
        //
        final String message = "Info--The new Head of Division : " + dvId + " is " + newManager;
        if (this.log.isInfoEnabled()) {
            this.log.info(message);
        }
        // 2 get the not finished activity_log
        final String activity_log_id = "";
        // {To do}
        
        // 3 get the step_log of activity_log which got from 2
        
        final List records =
                selectDbRecords(context, "helpesk_step_log", new String[] { "step_log_id" },
                    "field_name ='activity_log_id' and step !='Basic' and pkey_value="
                            + activity_log_id + "'");
        
        String stepLogId = "";
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            stepLogId = (String) record[0];
        }
        
        // 4 update these step_log.em_id with newManager
        if (!stepLogId.equals("")) {
            final String updatesql =
                    "update helpdesk_step_log set em_id=" + literal(context, newManager)
                            + ",user_name=" + literal(context, newManager) + "where step_log_id = "
                            + stepLogId;
            SqlUtils.executeUpdate("sc_zzfrent_details", updatesql);
        } else {
            
        }
    }
    
}
