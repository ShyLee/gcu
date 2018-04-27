package com.archibus.eventhandler.ondemandwork;

import java.sql.*;
import java.sql.Date;
import java.util.*;

import org.dom4j.DocumentException;
import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.DbConnection;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.sla.*;
import com.archibus.eventhandler.steps.*;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Handles all workflow rules for requests used by the On Demand Work application.
 * 
 */
public class WorkRequestHandler extends HelpdeskEventHandlerBase {
    
    /**
     * Check which work orders are assigned to the current user as supervisor/verification
     * substitute.
     */
    public void checkWoSupervisorSubstitutes(final JSONArray records,
            final boolean includeVerification) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray result = new JSONArray();
        
        if (records.length() > 0) {
            final StringBuffer woIds = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject json = records.getJSONObject(i);
                woIds.append("," + json.getInt("wo.wo_id"));
            }
            
            final DataSource cfDS =
                    DataSourceFactory.createDataSourceForFields("cf", new String[] { "cf_id",
                            "email", "work_team_id" });
            cfDS.addRestriction(Restrictions.eq("cf", "email", ContextStore.get().getUser()
                .getEmail()));
            final DataRecord cfRecord = cfDS.getRecord();
            if (cfRecord != null) {
                cfRecord.getString("cf.work_team_id");
            }
            final String currentEmId = ContextStore.get().getUser().getEmployee().getId();
            
            final StringBuffer sql =
                    new StringBuffer("SELECT wo_id FROM wo WHERE wo_id IN (" + woIds.substring(1)
                            + ") ");
            
            sql.append(" AND ( wo.supervisor IN (SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.substitute_em_id = "
                    + literal(context, currentEmId)
                    + " AND workflow_substitutes.steptype_or_role='supervisor'"
                    + " AND  (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                    + Common.getCurrentLocalDate(null, null, null, null)
                    + ") AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                    + Common.getCurrentLocalDate(null, null, null, null)
                    + "))"
                    + " OR wo.work_team_id IN (SELECT work_team_id FROM cf WHERE email IN (SELECT email FROM em WHERE em_id IN"
                    + " (SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.em_id = em.em_id"
                    + " AND workflow_substitutes.substitute_em_id ="
                    + literal(context, currentEmId)
                    + " AND workflow_substitutes.steptype_or_role= 'supervisor'"
                    + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                    + Common.getCurrentLocalDate(null, null, null, null)
                    + ") AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                    + Common.getCurrentLocalDate(null, null, null, null) + "))))");
            if (includeVerification) {
                sql.append(" OR wo.wo_id IN (SELECT wo_id FROM wr WHERE wr_id IN (SELECT wr_id FROM wr_step_waiting WHERE step_type='verification' AND wr_step_waiting.em_id IN ("
                        + "SELECT em_id FROM workflow_substitutes WHERE substitute_em_id = "
                        + literal(context, currentEmId)
                        + " AND workflow_substitutes.steptype_or_role='verification'"
                        + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                        + Common.getCurrentLocalDate(null, null, null, null)
                        + ")"
                        + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                        + Common.getCurrentLocalDate(null, null, null, null) + "))))");
            }
            sql.append(")");
            
            final List<Object[]> woRecords = selectDbRecords(context, sql.toString());
            if (woRecords != null && !woRecords.isEmpty()) {
                for (final Object[] record : woRecords) {
                    result.put(record[0]);
                }
            }
        }
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Check which work orders are assigned to the current user as supervisor/verification
     * substitute
     */
    public void checkWrSupervisorSubstitutes(final JSONArray records,
            final boolean includeVerification) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray result = new JSONArray();
        
        if (records.length() > 0) {
            final StringBuffer wrIds = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject json = records.getJSONObject(i);
                wrIds.append("," + json.getInt("wr.wr_id"));
            }
            
            final DataSource cfDS =
                    DataSourceFactory.createDataSourceForFields("cf", new String[] { "cf_id",
                            "email", "work_team_id" });
            cfDS.addRestriction(Restrictions.eq("cf", "email", ContextStore.get().getUser()
                .getEmail()));
            final DataRecord cfRecord = cfDS.getRecord();
            if (cfRecord != null) {
                cfRecord.getString("cf.work_team_id");
            }
            final String currentEmId = ContextStore.get().getUser().getEmployee().getId();
            
            final StringBuffer sql =
                    new StringBuffer("SELECT wr_id FROM wr WHERE wr_id IN (" + wrIds.substring(1)
                            + ") ");
            sql.append(" AND ( wr.supervisor IN (SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.substitute_em_id = "
                    + literal(context, currentEmId)
                    + " AND workflow_substitutes.steptype_or_role='supervisor'"
                    + " AND  (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                    + Common.getCurrentLocalDate(null, null, null, null)
                    + ") AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                    + Common.getCurrentLocalDate(null, null, null, null)
                    + "))"
                    + " OR wr.work_team_id IN (SELECT work_team_id FROM cf WHERE email IN (SELECT email FROM em WHERE em_id IN"
                    + " (SELECT em_id FROM workflow_substitutes WHERE workflow_substitutes.em_id = em.em_id"
                    + " AND workflow_substitutes.substitute_em_id ="
                    + literal(context, currentEmId)
                    + " AND workflow_substitutes.steptype_or_role= 'supervisor'"
                    + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                    + Common.getCurrentLocalDate(null, null, null, null)
                    + ") AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                    + Common.getCurrentLocalDate(null, null, null, null) + "))))");
            if (includeVerification) {
                sql.append(" OR wr.wr_id IN (SELECT wr_id FROM wr_step_waiting WHERE step_type='verification' AND wr_step_waiting.em_id IN ("
                        + "SELECT em_id FROM workflow_substitutes WHERE substitute_em_id = "
                        + literal(context, currentEmId)
                        + " AND workflow_substitutes.steptype_or_role='verification'"
                        + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                        + Common.getCurrentLocalDate(null, null, null, null)
                        + ")"
                        + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                        + Common.getCurrentLocalDate(null, null, null, null) + ")))");
            }
            sql.append(")");
            
            final List<Object[]> wrRecords = selectDbRecords(context, sql.toString());
            if (wrRecords != null && !wrRecords.isEmpty()) {
                for (final Object[] record : wrRecords) {
                    result.put(record[0]);
                }
            }
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Check if the current user is allowed to do a verification for the given work request (as
     * workflow substitute)
     * 
     * @param strWrId work request id
     */
    public void checkVerificationSubstitute(final String strWrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wrId = Integer.parseInt(strWrId);
        
        // get open verification steps for the given work request
        final DataSource stepWaitingDS =
                DataSourceFactory.createDataSourceForFields("wr_step_waiting", new String[] {
                        "user_name", "wr_id", "step_type", "em_id", "cf_id", "step_log_id" });
        final List<DataRecord> records =
                stepWaitingDS.getRecords("step_type='verification' AND wr_id = " + wrId);
        
        boolean isSubstitute = false;
        int stepLogId = 0;
        
        if (!records.isEmpty()) {
            for (final DataRecord record : records) {
                if (StringUtil.notNullOrEmpty(record.getString("wr_step_waiting.em_id"))) {
                    if (StepHandler.checkWorkflowEmSubstitute(context,
                        record.getString("wr_step_waiting.em_id"), "verification")) {
                        isSubstitute = true;
                        stepLogId = record.getInt("wr_step_waiting.step_log_id");
                        break;
                    }
                } else if (StringUtil.notNullOrEmpty(record.getString("wr_step_waiting.cf_id"))) {
                    if (StepHandler.checkWorkflowCfSubstitute(context,
                        record.getString("wr_step_waiting.cf_id"), "verification")) {
                        isSubstitute = true;
                        stepLogId = record.getInt("wr_step_waiting.step_log_id");
                        break;
                    }
                }
            }
        }
        final JSONObject result = new JSONObject();
        result.put("isSubstitute", isSubstitute);
        result.put("step_log_id", stepLogId);
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * check which work order(s) are assigned to the current user (craftsperson) as substitute.
     * 
     * @param woRecords work order records to check
     */
    public void checkWoCfSubstitutes(final JSONArray woRecords) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final StringBuffer woIds = new StringBuffer();
        for (int i = 0; i < woRecords.length(); i++) {
            final JSONObject json = woRecords.getJSONObject(i);
            woIds.append("," + json.getInt("wo.wo_id"));
        }
        
        final JSONArray result = new JSONArray();
        
        final DataSource cfDS =
                DataSourceFactory
                    .createDataSourceForFields("cf", new String[] { "cf_id", "email" });
        cfDS.addRestriction(Restrictions.eq("cf", "email", ContextStore.get().getUser().getEmail()));
        final DataRecord cfRecord = cfDS.getRecord();
        if (cfRecord != null) {
            final String currentCfId = cfRecord.getString("cf.cf_id");
            
            final String sql =
                    "SELECT wo_id FROM wo WHERE wo_id IN ("
                            + woIds.substring(1)
                            + ") AND "
                            + " EXISTS (SELECT wr_id FROM wr WHERE wr.wo_id = wo.wo_id AND wr_id IN "
                            + " (SELECT wr_id FROM wrcf WHERE cf_id IN (SELECT cf_id FROM workflow_substitutes WHERE wrcf.cf_id = workflow_substitutes.cf_id "
                            + " AND workflow_substitutes.substitute_cf_id = "
                            + literal(context, currentCfId)
                            + " AND workflow_substitutes.steptype_or_role='craftsperson'"
                            + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                            + Common.getCurrentLocalDate(null, null, null, null)
                            + ")"
                            + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                            + Common.getCurrentLocalDate(null, null, null, null) + "))))";
            
            final List<Object[]> records = selectDbRecords(context, sql);
            if (records != null && !records.isEmpty()) {
                for (final Object[] record : records) {
                    result.put(record[0]);
                }
            }
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Check which of the given work requests are assigned to the current user (craftsperson) as
     * substitute.
     * 
     * @param wrRecords work request records to check
     */
    public void checkWrCfSubstitutes(final JSONArray wrRecords) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final StringBuffer wrIds = new StringBuffer();
        for (int i = 0; i < wrRecords.length(); i++) {
            final JSONObject json = wrRecords.getJSONObject(i);
            wrIds.append("," + json.getInt("wr.wr_id"));
        }
        
        final JSONArray result = new JSONArray();
        
        final DataSource cfDS =
                DataSourceFactory
                    .createDataSourceForFields("cf", new String[] { "cf_id", "email" });
        cfDS.addRestriction(Restrictions.eq("cf", "email", ContextStore.get().getUser().getEmail()));
        final DataRecord cfRecord = cfDS.getRecord();
        if (cfRecord != null) {
            final String currentCfId = cfRecord.getString("cf.cf_id");
            
            final String sql =
                    "SELECT wr_id FROM wr WHERE wr_id IN ("
                            + wrIds.substring(1)
                            + ") AND "
                            + " EXISTS (SELECT wr_id FROM wrcf WHERE wrcf.wr_id = wr.wr_id AND cf_id IN (SELECT cf_id FROM workflow_substitutes WHERE wrcf.cf_id = workflow_substitutes.cf_id "
                            + " AND workflow_substitutes.substitute_cf_id = "
                            + literal(context, currentCfId)
                            + " AND workflow_substitutes.steptype_or_role='craftsperson'"
                            + " AND (workflow_substitutes.start_date_unavailable IS NULL OR workflow_substitutes.start_date_unavailable <= "
                            + Common.getCurrentLocalDate(null, null, null, null)
                            + ")"
                            + " AND (workflow_substitutes.end_date_unavailable IS NULL OR workflow_substitutes.end_date_unavailable >= "
                            + Common.getCurrentLocalDate(null, null, null, null) + ")))";
            
            final List<Object[]> records = selectDbRecords(context, sql);
            if (records != null && !records.isEmpty()) {
                for (final Object[] record : records) {
                    result.put(record[0]);
                }
            }
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Get list of help requests linked for a list of work requests.
     * 
     * Returns a JSON array of help request ids.
     * 
     * @param JSONArray records,wr.wr_id json array
     */
    public void getHelpRequestsForWorkRequests(final JSONArray records) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray helpRequests = new JSONArray();
        
        if (records.length() > 0) {
            final StringBuffer in = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                final int wr_id = record.getInt("wr.wr_id");
                in.append("," + wr_id);
            }
            final String sql =
                    "SELECT DISTINCT activity_log_id FROM activity_log WHERE wr_id IN ("
                            + in.substring(1).toString() + ")";
            final List recs = selectDbRecords(context, sql);
            
            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final Integer activity_log_id = getIntegerValue(context, record[0]);
                helpRequests.put(activity_log_id.intValue());
            }
        }
        context.addResponseParameter("jsonExpression", helpRequests.toString());
    }
    
    /**
     * Update Craftsperson costs.
     * 
     * Calculate the costs, total hours and total cost of the wrcf. Recalculate the work request
     * costs.
     * 
     * @param record,table 'wrcf' JSONObject
     */
    public void updateCraftspersonCosts(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // JSONObject record = context.getJSONObject("record");
        final int wr_id = record.getInt("wrcf.wr_id");
        final String cf_id = record.getString("wrcf.cf_id");
        
        double cost_over = 0;
        double cost_double = 0;
        double hours_over = 0;
        double hours_double = 0;
        final double hours_straight = record.getDouble("wrcf.hours_straight");
        
        final Object[] cf_record =
                selectDbValues(context, "cf", new String[] { "tr_id", "rate_hourly", "rate_double",
                        "rate_over" }, "cf_id = " + literal(context, cf_id));
        final double cost_straight = hours_straight * ((Double) cf_record[1]).doubleValue();
        // Guo changed for KB3021191 2009-01-04
        if (record.get("wrcf.hours_over") != null) {
            hours_over = record.getDouble("wrcf.hours_over");
            cost_over = hours_over * ((Double) cf_record[3]).doubleValue();
        }
        if (record.get("wrcf.hours_double") != null) {
            hours_double = record.getDouble("wrcf.hours_double");
            cost_double = hours_double * ((Double) cf_record[2]).doubleValue();
        }
        final double cost_total = cost_straight + cost_over + cost_double;
        final double hours_total = hours_over + hours_double + hours_straight;
        
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        values.put("cost_over", new Double(cost_over));
        values.put("cost_double", new Double(cost_double));
        values.put("cost_straight", new Double(cost_straight));
        values.put("cost_total", new Double(cost_total));
        values.put("hours_total", new Double(hours_total));
        // Guo changed for KB3021194 2009-01-05
        if (record.get("wrcf.hours_est") != null) {
            final double hours_diff = hours_total - record.getDouble("wrcf.hours_est");
            values.put("hours_diff", new Double(hours_diff));
        } else {
            values.put("hours_diff", new Double(hours_total));
        }
        
        executeDbSave(context, "wrcf", values);
        executeDbCommit(context);
        
        recalculateCosts(context, wr_id);
    }
    
    /**
     * Reject help request by dispatcher.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>comments: comments given by dispatcher when rejecting a request</li>
     * <li>activity_log.activity_log_id: identifier for this request</li>
     * </ul>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>activity_log_id: Help request id of rejected request (to archive)</li>
     * </ul>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get input parameters from context</li>
     * <li>Save the request record to <code>activity_log</code></li>
     * <li>{@link com.archibus.eventhandler.steps.StepManager#rejectStep(int, String, String) Reject
     * dispatch step}</li>
     * <li>{@link RequestHandler#archiveRequest(EventHandlerContext) Archive rejected request}</li>
     * </ol>
     * <p>
     * 
     * @param String tableName
     * @param String fieldName
     * @param String activity_log_id2
     * @param JSONObject record
     * @param String comments
     * @throws DocumentException
     * 
     */
    public void rejectDispatchRequest(final String tableName, final String fieldName,
            final String activity_log_id2, final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final Map fieldValues = parseJSONObject(context, record);
        
        final int stepId =
                getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
                    .intValue();
        final int activity_log_id =
                getIntegerValue(context, fieldValues.get("activity_log.activity_log_id"))
                    .intValue();
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "activity_log."));
        
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        executeDbCommit(context);
        
        final StepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.rejectStep(stepId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
        
        // archive rejected request
        context.addResponseParameter("activity_log_id", new Integer(activity_log_id));
        final RequestHandler requestHandler = new RequestHandler();
        
        requestHandler.archiveRequest(activity_log_id2, record);
    }
    
    /**
     * 
     * Dispatch a help request.<br />
     * The dispatcher can select a supervisor or a trade to dispatch the help request to. If a trade
     * is selected all supervisors of this trade are notified, but the request is assigned to only 1
     * of them. This is the first one reviewing the request (linking it to a work request or work
     * order) or the first one accepting the request if acceptance is required.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save request record (with supervisor or trade)</li>
     * <li>{@link com.archibus.eventhandler.steps.StepManager#confirmStep(int, String, String)
     * Confirm dispatch step}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String activity_log
     * @param String activity_log_id1
     * @param String id
     * @param JSONObject record
     * @param String comments
     *            </p>
     * @throws DocumentException
     */
    public void dispatchRequest(final String activity_log, final String activity_log_id1,
            final String id, final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        int stepId = 0;
        int activity_log_id = 0;
        Map values = null;
        // save trade or supervisor in activity_log
        
        stepId =
                getIntegerValue(context, fieldValues.get("activity_log_step_waiting.step_log_id"))
                    .intValue();
        activity_log_id =
                getIntegerValue(context, fieldValues.get("activity_log.activity_log_id"))
                    .intValue();
        values = stripPrefix(filterWithPrefix(fieldValues, "activity_log."));
        
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        executeDbCommit(context);
        
        final StepManager stepmgr = new HelpdeskStepManager(context, activity_log_id);
        stepmgr.confirmStep(stepId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
        
        // add to fix KB3029391, update work team from supervisor
        updateWorkTeamFromSupervisor();
    }
    
    /**
     * 
     * Save Work Request Verification.<br />
     * A supervisor can verify the work after a request has been completed by the craftsperson(s).
     * Confirming the verification step does not change the basic status of the work request, but
     * changes the step status to Verified
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>{@link com.archibus.eventhandler.steps.StepManager#confirmStep(int, String, String)
     * Confirm verification}</li>
     * <li>{@link #checkWorkorder(EventHandlerContext, String, int) Check if work order
     * date_completed can be set}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record,wr_step_waiting JSONObject record
     *            </p>
     */
    public void verifyWorkRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final int wr_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.wr_id")).intValue();
        
        final String comments = notNull(fieldValues.get("wr_step_waiting.comments"));
        confirmStep(context, wr_id, stepId, comments);
        
        checkWorkorder(context, "Com", wr_id);
    }
    
    /**
     * 
     * Save Rejection of work request verification.<br/>
     * A supervisor can verify the work after a request has been completed by the craftsperson(s).
     * If he thinks the work is not completed succesfully, he can reject the verification and send
     * the work request back to the craftsperson(s). This sets the status of the work request back
     * to 'Issued'
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>{@link com.archibus.eventhandler.steps.StepManager#rejectStep(int, String, String) Reject
     * verification}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record,wr_step_waiting JSONObject record
     *            </p>
     */
    public void returnWorkRequest(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final int wr_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.wr_id")).intValue();
        final String comments = notNull(fieldValues.get("wr_step_waiting.comments"));
        
        final StepManager stepmgr = new OnDemandWorkStepManager(context, wr_id);
        stepmgr.reissueStep(stepId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
        
        checkWorkorder(context, "Com", wr_id);
    }
    
    /**
     * 
     * Complete work request scheduling.<br/>
     * After the supervisor has assigned craftspersons and tools to a work request he can complete
     * the scheduling. This sets the stepstatus of the work request to scheduled and possibly
     * triggers approval and/or notification steps.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>{@link com.archibus.eventhandler.steps.StepManager#confirmStep(int, String, String)
     * Confirm schedule completion}</li>
     * <li>{@link #checkWorkOrderScheduling(EventHandlerContext, int) Check Work Order Scheduling}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record,table wr_step_waiting JSONObject record
     *            </p>
     * @throws DocumentException
     */
    public void completeScheduling(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        
        final int step_log_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        
        final int wr_id = getIntegerValue(context, fieldValues.get("wr.wr_id")).intValue();
        confirmStep(context, wr_id, step_log_id, null);
        
        final Object wo = selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id);
        if (wo != null) {
            final int wo_id = getIntegerValue(context, wo);
            checkWorkOrderScheduling(context, wo_id);
        }
    }
    
    /**
     * 
     * Check if all work requests of the work order to which the given work request belongs are
     * scheduled. <br/>
     * If all work requests of a work order are scheduled the date_assigned of a work order is set
     * to the first start date of all craftsperson assignments for the work requests attached to
     * this work order. If the date_assigned of a work order is filled in the work order can be
     * issued.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select work order the given work request belongs to</li>
     * <li>Get scheduling records from helpdesk_step_log for work requests attached to this work
     * order</li>
     * <li>If all work requests are scheduled, update date_assigned of the work order to the first
     * start date in wrcf for these work requests</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Query to check if all work requests are scheduled (if scheduling is required):<br />
     * (This query returns records for the work requests which are still waiting for a schedule)
     * <div> SELECT step_code, step FROM helpdesk_step_log<br />
     * WHERE step_type='scheduling' AND table_name='wr' AND field_name='wr_id'<br />
     * AND pkey_value IN (SELECT wr_id FROM wr WHERE wo_id = <i>wo_id</i>)<br />
     * AND date_response IS NULL AND time_response IS NULL. </div> Query to update the work order
     * date assigned: <div>UPDATE wo SET date_assigned =<br />
     * (SELECT MIN(date_start) FROM wrcf WHERE wr_id IN <br />
     * &nbsp;&nbsp;(SELECT wr_id FROM wr WHERE wo_id = "+ wo_id+")<br />
     * ) WHERE wo_id = " + wo_id;
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work Request (recently scheduled)
     *            </p>
     */
    private void checkWorkOrderScheduling(final EventHandlerContext context, final int wo_id) {
        final String[] fields = { "step_code", "step" };
        final String where =
                "step_type='scheduling' AND table_name = 'wr' AND field_name='wr_id' "
                        + "AND pkey_value IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id + ")"
                        + "AND date_response IS NULL AND time_response IS NULL";
        final List records = selectDbRecords(context, Constants.STEP_LOG_TABLE, fields, where);
        if (records.isEmpty()) {
            // if all wr's are scheduled wo.date_assigned is set to the
            // first date work starts
            final String sql =
                    "UPDATE wo SET date_assigned = (SELECT MIN(date_start) FROM wrcf WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = "
                            + wo_id + ")) WHERE wo_id = " + wo_id;
            executeDbSql(context, sql, true);
            executeDbCommit(context);
        }
        
    }
    
    /**
     * 
     * Complete work request estimation.<br />
     * After the supervisor has added trades, tooltypes and other resources and has reserved parts
     * for a work request. He can complete the estimation of the work request. This sets the step
     * status to 'Estimated' and does not change the basic status of the work request.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted (for <code>wr</code> and <code>wr_step_waiting</code>)</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Confirm estimation completion}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String wr
     * @param String wrId
     * @param String wrId1
     * @param JSONObject record,table wr_step_waiting JSONObject record
     *            </p>
     * @throws DocumentException
     */
    public void completeEstimation(final String wr, final String wrId, final String wrId1,
            final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final int step_log_id =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final int wr_id = getIntegerValue(context, fieldValues.get("wr.wr_id")).intValue();
        
        confirmStep(context, wr_id, step_log_id, null);
    }
    
    /**
     * 
     * Approve Work Request.<br/>
     * A supervisor can be asked to approve the estimation, schedule or completion of a work
     * request. This does not change the basic status of the work request.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted (for <code>wr</code> and <code>wr_step_waiting</code>)</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save work request (extra fields from approval)</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Confirm approval}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record,table wr_step_waiting JSONObject record
     * @param String comments
     *            </p>
     * @throws DocumentException
     */
    public void approveWorkRequest(final JSONObject record, final String comments) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        // fields of wr
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        executeDbSave(context, "wr", values);
        executeDbCommit(context);
        
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        confirmStep(context, wr_id, stepId, comments);
    }
    
    /**
     * 
     * Reject work request.<br />
     * This sets the basic status of the work request to 'Rejected'.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save work request record in <code>wr</code>(extra fields from approval)</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#confirmStep(EventHandlerContext, int, int, String)
     * Reject approval}</li>
     * <li>{@link #archiveWorkRequest(EventHandlerContext, int) Archive rejected work request}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject recordWr,table wr_step_waiting JSONObject record
     * @param String comments
     *            </p>
     * @throws DocumentException
     */
    public void rejectWorkRequest(final JSONObject recordWr, final String comments)
            throws DocumentException {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, recordWr);
        
        final int stepId =
                getIntegerValue(context, fieldValues.get("wr_step_waiting.step_log_id")).intValue();
        final Map values = stripPrefix(filterWithPrefix(fieldValues, "wr."));
        executeDbSave(context, "wr", values);
        executeDbCommit(context);
        
        final int wr_id = getIntegerValue(context, fieldValues.get("wr.wr_id")).intValue();
        
        rejectStep(context, wr_id, stepId, comments);
        checkPartsRejectedWr(context, wr_id);
        
        checkWorkorder(context, "Rej", wr_id);
        // select all wr of the wo
        final List records =
                selectDbRecords(context,
                    "SELECT wo_id FROM wr WHERE wo_id = (select wo_id from wr where wr_id = "
                            + wr_id + ")");
        if (records.size() == 1) {
            final Object[] rec = (Object[]) records.get(0);
            if (rec[0] != null) {
                context.addResponseParameter("wo_id", rec[0]);
                
                final int wo_id = getIntegerValue(context, rec[0]).intValue();
                recalculateWorkOrderCosts(context, wo_id);
                
                archiveWorkOrder(context);
            } else {
                archiveWorkRequest(wr_id);
            }
        } else { // records.size() == 0 or records.size() > 1
            archiveWorkRequest(wr_id);
            if (!records.isEmpty()) {
                final Object[] record = (Object[]) records.get(0);
                if (record != null) {
                    final int wo_id = getIntegerValue(context, record[0]).intValue();
                    recalculateWorkOrderCosts(context, wo_id);
                }
            }
        }
        checkWorkorder(context, null, wr_id);
    }
    
    /**
     * 
     * Update work request status.<br/>
     * After a work request is issued the basic status can change to different values:
     * <ul>
     * <li>On Hold for Access (HA)</li>
     * <li>On Hold for Parts (HP)</li>
     * <li>On Hold for Labor (HL)</li>
     * <li>Stopped (S)</li>
     * <li>Completed (Com)</li>
     * </ul>
     * These statuses can be set by the supervisor or the craftsperson. When the work is put on
     * hold, it can also be reissued setting the status back to Issued (I).
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save work request</li>
     * <li>{@link com.archibus.eventhandler.steps.StatusManager#updateStatus(String) Update work
     * request status}</li>
     * <li>{@link #checkWorkorder(EventHandlerContext, String, int) Check if the work order needs to
     * be updated}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String wr
     * @param String wr_id1
     * @param String wr_id2
     * @param JSONObject record
     * @param String status
     *            </p>
     * @throws DocumentException
     */
    public void updateWorkRequestStatus(final String wr, final String wr_id1, final String wr_id2,
            final JSONObject record, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final String old_status = Common.getStatusValue(context, "wr", "wr_id", wr_id);
        
        executeDbSave(context, "wr", values);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
        
        if (!status.equals(old_status)) {
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus(status);
            
            checkWorkorder(context, status, wr_id);
        }
    }
    
    /**
     * 
     * Updates the status of a mobile work request - Derived from updateWorkRequestStatus -
     * Constantine Kriezis
     * 
     * @param wrId
     * @param status
     */
    public void updateMobileWorkRequestStatus(final int wrId, final String status) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final StatusManager statusManager = new OnDemandWorkStatusManager(context, wrId);
        statusManager.updateStatus(status);
        
        checkWorkorder(context, status, wrId);
    }
    
    /**
     * Checks if all work requests of a work order have the same status and updates the work order
     * if so.<br />
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select work order to which the given work request is attached</li>
     * <li>Select all work request records from <code>wr</code> attached to the selected work order
     * with another status than the given status or with the given status and step status not null.
     * (e.g. completed, but waiting for verification)
     * <li>If this query does not return records and the given status is 'Completed', update the
     * date and time_completed in the work order table</li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param status current status of given work request
     * @param wr_id recently updated work request
     */
    private void checkWorkorder(final EventHandlerContext context, final String status,
            final int wr_id) {
        // update open wr in wo(open = approved but not yet closed)
        
        final Object result = selectDbValue(context, "wr", "wo_id", "wr_id=" + wr_id);
        
        final Integer wo_id = getIntegerValue(context, result);
        
        // update open work request number of work order
        updateOpenWrNumOfWo(wo_id.toString());
        
        if (status != null) {
            // KB 3016544 default step status 'none'
            final String where =
                    "wo_id = " + wo_id + " AND " + "(status != " + literal(context, status)
                            + " OR (status = " + literal(context, status)
                            + " AND NOT step_status IS NULL AND step_status != "
                            + literal(context, Constants.STEP_STATUS_NULL) + "))";
            final List records =
                    selectDbRecords(context, "wr", new String[] { "wo_id", "wr_id", "status" },
                        where);
            if (records.isEmpty()) { // all wr's of the wo have the same
                // status
                
                if (status.equals("Com")) { // last wr completed => set wo
                    final Map<String, String> map =
                            Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
                    // complete
                    final Map values = new HashMap();
                    values.put(
                        "date_completed",
                        LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                            map.get("blId")));
                    values.put(
                        "time_completed",
                        LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                            map.get("blId")));
                    values.put("wo_id", wo_id);
                    executeDbSave(context, "wo", values);
                    // Guo changed 2009-01-15 for KB3021405
                    executeDbCommit(context);
                }
                final String helpRequestStatus = StatusConverter.getActionStatus(status);
                final Object tmp =
                        selectDbValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
                            "wo_id = (SELECT wo_id FROM wr WHERE wr_id = " + wr_id + ")");
                if (helpRequestStatus != null && tmp != null) {
                    final Integer activity_log_id = getIntegerValue(context, tmp);
                    final StatusManager manager =
                            new HelpdeskStatusManager(context, activity_log_id.intValue());
                    manager.updateStatus(helpRequestStatus);
                    return;
                }
            }
        }
        
        // KB 3016544 default step status 'none'
        final String where =
                " wo_id =  "
                        + wo_id
                        + " AND "
                        + "(status NOT IN ('Com', 'Can', 'S','Rej') OR (status IN ('Com', 'Can', 'S','Rej') AND step_status IS NOT NULL AND step_status != "
                        + literal(context, Constants.STEP_STATUS_NULL) + "))";
        final List records =
                selectDbRecords(context, "wr", new String[] { "wo_id", "wr_id", "status" }, where);
        if (records.isEmpty()) {// wo contains no open wrs
            // check if help request exists for wo
            final String helpRequestStatus = StatusConverter.getActionStatus(status);
            final Object tmp =
                    selectDbValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
                        "wo_id = " + wo_id);
            if (tmp != null) {// update help request status to completed
                final Integer activity_log_id = getIntegerValue(context, tmp);
                final StatusManager manager = new HelpdeskStatusManager(context, activity_log_id);
                manager.updateStatus(helpRequestStatus,
                    StatusConverter.getActionDateField(helpRequestStatus),
                    StatusConverter.getActionTimeField(helpRequestStatus));
            }
        }
        
    }
    
    /**
     * Update open work requests number of selected work order---field wo.qty_open_wr.
     * 
     * @param context Workflow rule execution context
     * @param status current status of given work request
     * @param wr_id recently updated work request
     */
    private void updateOpenWrNumOfWo(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        executeDbSql(
            context,
            "UPDATE wo SET qty_open_wr = "
                    + "(SELECT COUNT(wr_id) FROM wr WHERE wo_id = "
                    + woId
                    + " AND wr.status NOT IN ('S','Can','Com','Clo','Rej') AND wo.date_issued IS NOT NULL)"
                    + " WHERE wo_id = " + woId, false);
        
        executeDbCommit(context);
    }
    
    /**
     * 
     * Retrieves remaining hours to schedule the given tool type for the work request. This is the
     * difference between hours estimated and hours scheduled.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tool_type : Tool type</li>
     * <li>wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with estimation<br />
     * <code>{estimation : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Select difference between hours estimated and hours scheduled for given tooltype from
     * table <code>wrtt</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT hours_est - hours_sched FROM wrtt WHERE wr_id = ? AND tool_type =
     * ?</div>
     * </p>
     * <p>
     * 
     * @param String tool_type
     * @param String wr_id1
     *            </p>
     */
    public void getEstimationFromToolType(final String tool_type, final String wr_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wr_id = Integer.parseInt(wr_id1);
        
        final JSONObject results = new JSONObject();
        final String est = formatSqlIsNull(context, "hours_est,0");
        final String sched = formatSqlIsNull(context, "hours_sched,0");
        final String sql =
                "SELECT " + est + "-" + sched + " FROM wrtt WHERE wr_id = " + wr_id
                        + " AND tool_type = " + literal(context, tool_type);
        final List records = selectDbRecords(context, sql);
        
        if (!records.isEmpty()) {
            final Object[] rec = (Object[]) records.get(0);
            results.put("estimation", rec[0]);
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Retrieves worktype and remaining hours to schedule the given trade for the work request. This
     * is the difference between hours estimated and hours scheduled.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tr_id : Trade Code</li>
     * <li>wr_id : Work request Code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with estimation and work_type<br />
     * <code>{estimation : ?, work_type: ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Select difference between hours estimated and hours scheduled for given trade and work
     * request</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT hours_est - hours_sched FROM wrtr WHERE wr_id = ? AND tr_id = ?</div>
     * </p>
     * <p>
     * 
     * @param String tr_id
     * @param String wrId
     *            </p>
     */
    public void getEstimationFromTrade(final String tr_id, final String wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final int wr_id = Integer.parseInt(wrId);
        
        final JSONObject results = new JSONObject();
        final String est = formatSqlIsNull(context, "hours_est,0");
        final String sched = formatSqlIsNull(context, "hours_sched,0");
        final String sql =
                "SELECT " + est + "-" + sched + ", work_type FROM wrtr WHERE wr_id = " + wr_id
                        + " AND tr_id = " + literal(context, tr_id);
        
        final List recs = selectDbRecords(context, sql);
        
        if (!recs.isEmpty()) {
            final Object[] rec = (Object[]) recs.get(0);
            results.put("estimation", rec[0]);
            results.put("work_type", rec[1]);
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * Link the given help request to an existing work request.<br />
     * This sets the <code>wr_id</code> field in the <code>activity_log</code> table to the work
     * request code of the given work request and the <code>supervisor</code> to the current user.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : work request code</li>
     * <li>activity_log_id : help request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Update help request record in <code>activity_log</code> with wr_id and supervisor</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String wr_id1
     * @param String activity_log_id1
     *            </p>
     */
    public void linkHelpRequestToWorkRequest(final String wr_id1, final String activity_log_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final int wr_id = Integer.parseInt(wr_id1);
        final int activity_log_id = Integer.parseInt(activity_log_id1);
        
        final Map values = new HashMap();
        values.put("activity_log_id", new Integer(activity_log_id));
        values.put("wr_id", new Integer(wr_id));
        
        // current user becomes supervisor of this request
        values.put("supervisor",
            getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
    }
    
    /**
     * 
     * Create new work request based on given help request.<br />
     * This creates a new record in <code>wr</code> with values copied from the given record in the
     * <code>activity_log</code> table.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray with JSONObjects with activity_log_id of requests to create a work
     * request for</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#createWorkRequestFromActionItem(EventHandlerContext, int, boolean)
     * Create Work Request from Action Item} for each action item in the records array</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONArray records
     * @param JSONArray documents1
     *            </p>
     */
    public void createWorkRequestFromHelpRequest(final JSONArray records, final JSONArray documents1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("records", records);
        context.addInputParameter("documents", documents1);
        int wr_id = 0;
        int activity_log_id = 0;
        final JSONArray result = new JSONArray();
        
        // No records need to create Work Request.
        if (records == null || records.length() == 0) {
            return;
        }
        
        JSONObject record = new JSONObject();
        JSONObject tmp = new JSONObject();
        
        for (int i = 0; i < records.length(); i++) {
            record = records.getJSONObject(i);
            activity_log_id = record.getInt("activity_log.activity_log_id");
            wr_id = createWorkRequestFromActionItem(context, activity_log_id, true);
            
            tmp = new JSONObject();
            tmp.put("wr_id", wr_id);
            result.put(tmp);
        }
        
        context.addResponseParameter("jsonExpression", result.toString());
        
    }
    
    /**
     * 
     * Check if a work request should be automatically scheduled.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sla : Service Level Agreement for current request</li>
     * <li>wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>{@link ServiceLevelAgreement#isAutoschedule() Check autoschedule in SLA}</li>
     * <li>If autoschedule create new record in <code>wrtr</code> and <code>wrcf</code> for given
     * work request and craftsperson from the SLA</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#checkWorkOrderScheduling(EventHandlerContext, int)
     * Check if workorder needs to be updated} and if
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#checkAutoIssue(EventHandlerContext)
     * work request should be autoissued}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @return autoschedule
     *         </p>
     */
    public boolean checkAutoSchedule(final EventHandlerContext context) {
        final ServiceLevelAgreement sla = (ServiceLevelAgreement) context.getParameter("sla");
        final int wr_id = context.getInt("wr.wr_id");
        
        if (sla.isAutoschedule()) {
            // issued
            createDefaultEstimationAndScheduling(context, wr_id, sla);
            final Integer wo_id =
                    getIntegerValue(context,
                        selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id));
            checkWorkOrderScheduling(context, wo_id);
            if (!checkAutoIssue(context)) {
                notifySupervisor(context, "Sch", "wo", wo_id);
            }
            
            return true;
        } else {
            return false;
        }
        
    }
    
    /**
     * 
     * Check if a work request should be automatically issued.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>sla : Service Level Agreement for current request</li>
     * <li>wr.wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Get work order for current work request</li>
     * <li>{@link ServiceLevelAgreement#isAutoissue() Check SLA for autoissue}</li>
     * <li>If autoissue,
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#issueWorkorder(EventHandlerContext)
     * issue workorder}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @return autoissue
     *         </p>
     */
    public boolean checkAutoIssue(final EventHandlerContext context) {
        final ServiceLevelAgreement sla = (ServiceLevelAgreement) context.getParameter("sla");
        final int wr_id = context.getInt("wr.wr_id");
        final Integer wo_id =
                getIntegerValue(context, selectDbValue(context, "wr", "wo_id", "wr_id =" + wr_id));
        
        final String sql = "SELECT COUNT (wr_id) FROM wr WHERE wo_id = " + wo_id;
        final List<Object[]> statistics = selectDbRecords(context, sql);
        final Object[] rec = statistics.get(0);
        final Integer countWr = getIntegerValue(context, rec[0]);
        if (countWr.intValue() > 1) {
            return false;
        }
        
        context.addResponseParameter("wo_id", wo_id);
        if (sla.isAutoissue()) {
            issueWorkorder(String.valueOf(wo_id));
            if (sla.isNotifyServiceProvider()) {
                notifySupervisor(context, "I", "wo", wo_id);
            }
            return true;
        }
        return false;
    }
    
    /**
     * 
     * Close work order.<br />
     * A work order can be closed if all its work requests are completed, so if its date completed
     * is filled in (by {@link #checkWorkorder(EventHandlerContext, String, int)}). All attached
     * work requests will also be closed, setting the status to 'Clo' using the
     * {@link StatusManager status manager}.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wo_id : work order code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Close all work request attached to given workorder (except the rejected) with the
     * {@link com.archibus.eventhandler.steps.StatusManager status manager}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateWorkOrderCosts(EventHandlerContext, int)
     * Update work order costs}</li>
     * <li>Set work order <code>date_closed</code> in <code>wo</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#updateInventory(EventHandlerContext, int)
     * Update parts inventory}</li>
     * <li>Check if the work order should be {@link #archiveWorkOrder(EventHandlerContext) archived}
     * , and do if so</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String woId
     *            </p>
     */
    public void closeWorkOrder(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("wo_id", woId);
        final int wo_id = Integer.parseInt(woId);
        
        // KB3037603 - if work order has been closed, do nothing
        final List woRecords =
                selectDbRecords(context, "wo", new String[] { "wo_id" }, "wo_id=" + wo_id);
        if (woRecords.isEmpty()) {
            return;
        }
        
        // make sure all records are Completed, Cancelled, Stopped or Rejected
        List records =
                selectDbRecords(
                    context,
                    "wr",
                    new String[] { "wr_id", "status" },
                    // KB 3016544 default step status 'none'
                    "wo_id = " + wo_id
                            + " AND (status IN ('R','A','AA','I','Rev','HP', 'HA', 'HL')"
                            + " OR (status = 'Com' AND step_status != "
                            + literal(context, Constants.STEP_STATUS_NULL) + "))");
        if (records != null && records.size() > 0) {
            final String errorMessage =
                    localizeString(context,
                        "Complete all work requests before closing the work order with id [{0}]");
            final Object[] args = { Integer.toString(wo_id) };
            throw new ExceptionBase(errorMessage, args, true);
        }
        
        // close all work requests and update inventory
        records =
                selectDbRecords(context, "wr", new String[] { "wr_id", "status" }, "wo_id = "
                        + wo_id);
        
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final Integer wr_id = getIntegerValue(context, record[0]);
            final String status = notNull(record[1]);
            
            if (!status.equals("Rej") && !status.equals("Can")) {// don't close rejected work
                                                                 // requests
                final StatusManager statusManager =
                        new OnDemandWorkStatusManager(context, wr_id.intValue());
                statusManager.updateStatus("Clo");
            }
            
            updateInventory(context, wr_id.intValue());
        }
        
        // update wo costs + date/time_closed
        recalculateWorkOrderCosts(context, wo_id);
        final Map<String, String> map =
                Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));
        
        final Map values = new HashMap();
        values.put("wo_id", new Integer(wo_id));
        values.put(
            "date_closed",
            LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                map.get("blId")));
        values.put(
            "time_closed",
            LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                map.get("blId")));
        executeDbSave(context, "wo", values);
        executeDbCommit(context);
        
        // check if help request exists for wo
        final Object tmp =
                selectDbValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id", "wo_id = "
                        + wo_id);
        if (tmp != null) {// update help request status to completed
            final Integer activity_log_id = getIntegerValue(context, tmp);
            final StatusManager manager =
                    new HelpdeskStatusManager(context, activity_log_id.intValue());
            manager.updateStatus("CLOSED");
        }
        
        /*
         * boolean autoArchive = false; if(getActivityParameterInt(context,
         * Constants.ONDEMAND_ACTIVITY_ID, "AUTO_ARCHIVE") != null) autoArchive =
         * getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
         * "AUTO_ARCHIVE").intValue() > 0;
         * 
         * //archive work order + work requests if (autoArchive) archiveWorkOrder(context);
         */
        
        // when closing a workorder the auto-archive is always performed to
        // be compatible with the work wizard
        archiveWorkOrder(context);
    }
    
    /**
     * Close work orders.
     * 
     * JSONArray records,wo_id record array
     */
    public void closeWorkOrders(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        int wo_id = 0;
        if (records.length() > 0) {
            final StringBuffer inWo = new StringBuffer();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                wo_id = getIntegerValue(context, values.get("wo_id")).intValue();
                inWo.append("," + wo_id);
            }
            
            // check if all given WO's can be closed
            final List wo_records =
                    selectDbRecords(
                        context,
                        "wr",
                        new String[] { "wr_id", "status" },
                        "wo_id IN ("
                                + inWo.substring(1)
                                // KB 3016544 default step status 'none'
                                + ") AND (status IN ('R','A','AA','I','Rev','HP', 'HA', 'HL') OR (status = 'Com' AND step_status != "
                                + literal(context, Constants.STEP_STATUS_NULL) + "))");
            if (wo_records != null && wo_records.size() > 0) {
                final String errorMessage =
                        localizeString(
                            context,
                            "Close Failed: Not all Work Orders selected can be closed. Please select only the Work Orders that can be closed and try again.");
                throw new ExceptionBase(errorMessage, true);
            }
            
            // close WO's one by one
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                wo_id = getIntegerValue(context, values.get("wo_id")).intValue();
                
                context.addResponseParameter("wo_id", new Integer(wo_id));
                closeWorkOrder(String.valueOf(wo_id));
            }
        }
    }
    
    /**
     * Close Work Request.
     * 
     * @param record ,record string that contain jsonobject
     */
    public void closeWorkRequest(final String record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map fieldValues = new HashMap();
        try {
            final JSONObject o = new JSONObject("" + record + "");
            fieldValues = parseJSONObject(context, o);
            
        } catch (final Exception e) {
            
        }
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, "wr", values);
        
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final Integer wo_id = getIntegerValue(context, values.get("wo_id"));
        
        final String status = (String) values.get("status");
        if (!status.equals("Rej") && !status.equals("Can")) {// don't close
            // rejected work
            // requests
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus("Clo");
        }
        // recalculateCosts(context, wr_id);
        updateInventory(context, wr_id);
        
        final Set woToClose = new TreeSet();
        woToClose.add(wo_id);
        
        checkWoClose(context, woToClose);
    }
    
    /**
     * Cancel Work Requests.
     * 
     * 
     * @param JSONArray records
     */
    public void cancelWorkRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final List<Integer> closedWOs = new ArrayList();
        
        int wr_id = 0;
        
        if (records.length() > 0) {
            final Set<Integer> woToClose = new TreeSet<Integer>();
            
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wr_id = getIntegerValue(context, record.get("wr.wr_id")).intValue();
                
                final Object[] tmp =
                        selectDbValues(context, "wr", new String[] { "status", "wo_id" },
                            "wr_id = " + wr_id);
                final String status = notNull(tmp[0]);
                
                if (!status.equals("AA") && !status.equals("R") && !status.equals("A")) {
                    // @translatable
                    final String errorMessage =
                            localizeString(context,
                                "Cancel Failed: Only Work Requests not yet issued can be cancelled.");
                    throw new ExceptionBase(errorMessage, true);
                }
                final Integer wo_id = getIntegerValue(context, tmp[1]);
                woToClose.add(wo_id);
                
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                statusManager.updateStatus("Can");
                
                updateInventoryAfterCancel(context, wr_id);
            }
            closedWOs.addAll(checkWoClose(context, woToClose));
        }
        final JSONObject result = new JSONObject();
        if (!closedWOs.isEmpty()) {
            result.put("WOclosed", true);
        } else {
            result.put("WOclosed", false);
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Cancel Work Request.
     * 
     * 
     * @param String wrId
     */
    public void cancelWorkRequest(final String wrId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wr_id = Integer.parseInt(wrId);
        
        final Object[] tmp =
                selectDbValues(context, "wr", new String[] { "status", "wo_id" }, "wr_id = "
                        + wr_id);
        final String status = notNull(tmp[0]);
        if (!status.equals("AA") && !status.equals("R") && !status.equals("A")) {
            // @translatable
            final String errorMessage =
                    localizeString(context,
                        "Cancel Failed: Only Work Requests not yet issued can be cancelled.");
            throw new ExceptionBase(errorMessage, true);
        }
        
        final Integer wo_id = getIntegerValue(context, tmp[1]);
        final Set<Integer> woToClose = new TreeSet<Integer>();
        woToClose.add(wo_id);
        
        final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
        statusManager.updateStatus("Can");
        
        updateInventoryAfterCancel(context, wr_id);
        
        final JSONObject result = new JSONObject();
        final List<Integer> closedWOs = checkWoClose(context, woToClose);
        if (!closedWOs.isEmpty()) {
            final int closedWo = closedWOs.get(0);
            if (closedWo == wo_id) {// should be
                result.put("WOclosed", true);
            }
        } else {
            result.put("WOclosed", false);
        }
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Close Work Requests.
     * 
     * If the work order is empty, it is also closed and archived.
     * 
     * @param JSONArray records
     */
    public void closeWorkRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        int wr_id = 0;
        if (records.length() > 0) {
            final StringBuffer inWr = new StringBuffer();
            
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                inWr.append("," + record.get("wr.wr_id"));
            }
            
            // check if all given WO's can be closed
            final List wr_records =
                    selectDbRecords(context, "wr", new String[] { "wr_id", "status" }, "wr_id IN ("
                            + inWr.substring(1)
                            + ") AND status IN ('R','A','AA','I','Rev','HP', 'HA', 'HL')");
            if (wr_records != null && wr_records.size() > 0) {
                // @translatable
                final String errorMessage =
                        localizeString(context,
                            "Close Failed: Only Completed Work Requests can be closed.");
                throw new ExceptionBase(errorMessage, true);
            }
            
            final Set woToClose = new TreeSet();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wr_id = getIntegerValue(context, record.get("wr.wr_id")).intValue();
                final Object[] tmp =
                        selectDbValues(context, "wr", new String[] { "status", "wo_id" },
                            "wr_id = " + wr_id);
                final String status = (String) tmp[0];
                
                if (!status.equals("Rej") && !status.equals("Can")) {// don't
                    // close
                    // rejected
                    // work
                    // requests
                    final StatusManager statusManager =
                            new OnDemandWorkStatusManager(context, wr_id);
                    statusManager.updateStatus("Clo");
                }
                
                updateInventory(context, wr_id);
                final Integer wo_id = getIntegerValue(context, tmp[1]);
                woToClose.add(wo_id);
            }
            
            checkWoClose(context, woToClose);
        }
    }
    
    /**
     * Check for Work Orders to Close.
     * 
     * When closing, rejecting or cancelling work requests, the work order can become empty. Then
     * the work order is closed and archived.
     * 
     * 
     * @param context
     * @param Set woToClose
     */
    private List<Integer> checkWoClose(final EventHandlerContext context,
            final Set<Integer> woToClose) {
        final List<Integer> closedWo = new ArrayList<Integer>();
        for (final Integer integer : woToClose) {
            final int wo_id = (integer).intValue();
            recalculateWorkOrderCosts(context, wo_id);
            
            // if all wr's of a work order are closed, the wo can also be closed
            final List testWrs =
                    selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id
                            + " AND status NOT IN ('Clo','Rej','Can')");
            if (testWrs.isEmpty()) {
                
                final Map<String, String> map =
                        Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));
                
                // update the work orders date and time for close
                final Map<String, Object> values = new HashMap<String, Object>();
                values.put("wo_id", new Integer(wo_id));
                values.put(
                    "date_closed",
                    LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                        map.get("blId")));
                values.put(
                    "time_closed",
                    LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                        map.get("blId")));
                executeDbSave(context, "wo", values);
                // Guo added to fix KB3020817
                executeDbCommit(context);
                
                // check if help request exists for wo
                final Object tmp =
                        selectDbValue(context, Constants.ACTION_ITEM_TABLE, "activity_log_id",
                            "wo_id = " + wo_id);
                if (tmp != null) {// update help request status to completed
                    final Integer activity_log_id = getIntegerValue(context, tmp);
                    final StatusManager manager =
                            new HelpdeskStatusManager(context, activity_log_id.intValue());
                    manager.updateStatus("CLOSED");
                }
                context.addResponseParameter("wo_id", new Integer(wo_id));
                archiveWorkOrder(context);
                closedWo.add(wo_id);
            }
        }
        return closedWo;
    }
    
    /**
     * Check parts inventory for rejected work requests.<br />
     * If parts are reserved when a work request is rejected the status in <code>wrpt</code> has to
     * be set on 'N' (new request) so the parts can be reserved for another work request. The
     * quantity on hand and on reserve in the parts table <code>pt</code> are also updated.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wrpt</code> for rejected work requests, with parts reserved for
     * and attached to the given work order</li>
     * <li>Update the parts inventory</li>
     * <li>Update the status of the records in <code>wrpt</code></li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Select inventory records for rejected work requests with reserved parts <div>
     * SELECT wrpt.wr_id, wrpt.part_id,wrpt.date_assigned, wrpt.time_assigned,wrpt.qty_estimated<br />
     * FROM wrpt, wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wr.status = 'Rej' AND wrpt.qty_estimated > 0 AND wrpt.status
     * = 'R'<br />
     * AND wr_id =<i>wr_id</i> </div> Update parts inventory <div> UPDATE pt SET <br />
     * qty_on_hand = qty_on_hand +<i>wrpt.qty_estimated</i>,<br />
     * qty_on_reserve = qty_on_reserve -<i>wrpt.qty_estimated</i><br />
     * WHERE part_id = <i>part_id</i>; </div> Update parts reservation <div> UPDATE wrpt SET status
     * = 'N'<br />
     * WHERE wr_id = <i>wr_id</i> AND part_id = <i>part_id</i><br />
     * AND date_assigned = <i>date_assigned</i> AND time_assigned = <i>time_assigned</i> </div>
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work Request to check
     */
    private void checkPartsRejectedWr(final EventHandlerContext context, final int wr_id) {
        
        final String[] wrptFields =
                { "wr_id", "part_id", "date_assigned", "time_assigned", "qty_estimated", "status" };
        final String[] wrFields = { "wr_id", "status" };
        final String sqlRestriction =
                "wr.wr_id = wrpt.wr_id AND wr.status = 'Rej' AND wrpt.qty_estimated > 0"
                        + " AND wrpt.status = 'R' AND wr.wr_id = " + wr_id;
        
        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFields)
                    .addField("wr", wrFields).addRestriction(Restrictions.sql(sqlRestriction));
        
        final String[] ptFields = { "part_id", "qty_on_hand", "qty_on_reserve" };
        final DataSource ptDs =
                DataSourceFactory.createDataSource().addTable("pt", DataSource.ROLE_MAIN)
                    .addField("pt", ptFields);
        
        final List<DataRecord> wrptRecords = wrptDs.getAllRecords();
        
        if (!wrptRecords.isEmpty()) {
            for (final DataRecord wrptRecord : wrptRecords) {
                final String partId = wrptRecord.getString("wrpt.part_id");
                final double qty_est = wrptRecord.getDouble("wrpt.qty_estimated");
                
                ptDs.clearRestrictions();
                ptDs.addRestriction(Restrictions.eq("pt", "part_id", partId));
                
                final List<DataRecord> ptRecords = ptDs.getAllRecords();
                
                if (!ptRecords.isEmpty()) {
                    for (final DataRecord ptRecord : ptRecords) {
                        double qty_on_hand = ptRecord.getDouble("pt.qty_on_hand");
                        double qty_on_reserve = ptRecord.getDouble("pt.qty_on_reserve");
                        
                        qty_on_hand = qty_on_hand + qty_est;
                        qty_on_reserve = qty_on_reserve - qty_est;
                        
                        ptRecord.setValue("pt.qty_on_hand", qty_on_hand);
                        ptRecord.setValue("pt.qty_on_reserve", qty_on_reserve);
                        
                        ptDs.saveRecord(ptRecord);
                    }
                    
                    // update batch
                    ptDs.commit();
                }
                
                wrptRecord.setValue("wrpt.status", "N");
                wrptDs.saveRecord(wrptRecord);
            }
            
            // update batch.
            wrptDs.commit();
        }
    }
    
    /**
     * Archive work orders param context Workflow rule execution context
     */
    public void archiveWorkOrders(final EventHandlerContext context) {
        JSONArray records = null;
        
        if (context.parameterExists("records")) {
            try {
                records = context.getJSONArray("records");
            } catch (final Exception e) {
                // @translatable
                final String errorMessage =
                        localizeString(context, "Error parsing records JSON object");
                throw new ExceptionBase(errorMessage, true);
            }
            if (records != null && records.length() > 0) {
                for (int i = 0; i < records.length(); i++) {
                    final JSONObject record = records.getJSONObject(i);
                    final int wo_id = record.getInt("wo.wo_id");
                    context.addResponseParameter("wo_id", new Integer(wo_id));
                    archiveWorkOrder(context);
                }
            }
        } else if (context.parameterExists("date_from") && context.parameterExists("date_to")) {
            final Date dateFrom = getDateValue(context, context.getString("date_from"));
            final Date dateTo = getDateValue(context, context.getString("date_to"));
            
            final String isoDateFrom =
                    formatSqlFieldValue(context, dateFrom, "java.sql.Date", "date_from");
            final String isoDateTo =
                    formatSqlFieldValue(context, dateTo, "java.sql.Date", "date_to");
            
            final List recs =
                    selectDbRecords(context, "SELECT wo_id FROM wo WHERE date_closed BETWEEN "
                            + isoDateFrom + " AND " + isoDateTo);
            
            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                context.addResponseParameter("wo_id", record[0]);
                archiveWorkOrder(context);
            }
        }
        
    }
    
    /**
     * Archive Work Order.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wo_id : Code of work order to archive</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #archiveTable(EventHandlerContext, String, int, int) Archive} the given work order
     * </li>
     * <li>{@link #checkPartsRejectedWr(EventHandlerContext, int) Update the parts inventory if this
     * work order contains rejected work requests.}</li>
     * <li>{@link #archiveTable(EventHandlerContext, String, int, int) Archive} all records linked
     * to this work order or its work requests in the tables:
     * <ul>
     * <li><code>wr</code></li>
     * <li><code>wrtt</code></li>
     * <li><code>wrtr</code></li>
     * <li><code>wrpt</code></li>
     * <li><code>wrtl</code></li>
     * <li><code>wrcf</code></li>
     * <li><code>wr_other</code></li>
     * </ul>
     * </li>
     * <li>Remove all archived records from the database, by deleting the work order record
     * (cascading delete)</li>
     * <li>Check if help requests are linked to the selected work order or to a work request
     * assigned to this work order</li>
     * <li>{@link RequestHandler#archiveRequests(EventHandlerContext) Archive help requests} if
     * found</li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     */
    public void archiveWorkOrder(final EventHandlerContext context) {
        // select work requests
        // wo
        if (!context.parameterExists("wo_id")) {
            return;
        }
        
        final int wo_id = context.getInt("wo_id");
        
        archiveTable(context, "wo", wo_id, 0);
        // check for rejected work requests to update inventory
        final List records =
                selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id
                        + " AND status = 'Rej'");
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final int wr_id = getIntegerValue(context, record[0]).intValue();
                checkPartsRejectedWr(context, wr_id);
            }
        }
        // wr
        archiveTable(context, "wr", wo_id, 0);
        
        archiveWorkRequestDocument("wo", wo_id);
        // wrtt
        archiveTable(context, "wrtt", wo_id, 0);
        // wrtr
        archiveTable(context, "wrtr", wo_id, 0);
        // wrpt
        archiveTable(context, "wrpt", wo_id, 0);
        // wrtl
        archiveTable(context, "wrtl", wo_id, 0);
        // wrcf
        archiveTable(context, "wrcf", wo_id, 0);
        // wr_other
        archiveTable(context, "wr_other", wo_id, 0);
        
        final String deleteWr_other =
                "DELETE FROM wr_other WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrcf =
                "DELETE FROM wrcf WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrtl =
                "DELETE FROM wrtl WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrpt =
                "DELETE FROM wrpt WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrtr =
                "DELETE FROM wrtr WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWrtt =
                "DELETE FROM wrtt WHERE wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                        + ")";
        final String deleteWr = "DELETE FROM wr WHERE wo_id = " + wo_id;
        
        // cascade delete all
        final Vector commands = new Vector();
        commands.add(deleteWr_other);
        commands.add(deleteWrcf);
        commands.add(deleteWrtl);
        commands.add(deleteWrpt);
        commands.add(deleteWrtr);
        commands.add(deleteWrtt);
        commands.add(deleteWr);
        
        executeDbSqlCommands(context, commands, false);
        
        // archive help requests linked to the selected work order or to a work
        // request assigned to
        // this work order
        final List helpRequests =
                selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
                    new String[] { "activity_log_id" }, "wo_id = " + wo_id
                            + " OR wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id
                            + ") OR wr_id IN (SELECT wr_id FROM hwr WHERE wo_id = " + wo_id + ")");
        if (!helpRequests.isEmpty()) {
            final JSONArray json = new JSONArray();
            for (final Iterator it = helpRequests.iterator(); it.hasNext();) {
                final Object[] request = (Object[]) it.next();
                final JSONObject object = new JSONObject();
                object.put("activity_log.activity_log_id", request[0]);
                json.put(object);
            }
            
            context.addResponseParameter("records", json.toString());
            final RequestHandler requestHandler = new RequestHandler();
            requestHandler.archiveRequests(json);
        }
        final String deleteWo = "DELETE FROM wo WHERE wo_id = " + wo_id;
        executeDbSql(context, deleteWo, true);
        executeDbCommit(context);
    }
    
    /**
     * Archive records in a table for a given work order.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>If a work order or work request is archived check if the record with maximal id will be
     * archived</li>
     * <li>If so create new dummy record to retain the numbering sequence and delete the previous</li>
     * <li>Update records in <code>helpdesk_step_log</code> (set table_name to <code>hwr</code>)</li>
     * <li>Create a query to copy all records linked to the given work order or its work requests
     * from the given table to its archive table (table name preceeded by 'h')</li>
     * <li>Execute the query</li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param table_name table to archive
     * @param wo_id id of work order to archive (or 0)
     * @param wr_id id of work request to archive (or 0)
     */
    private void archiveTable(final EventHandlerContext context, final String table_name,
            final int wo_id, final int wr_id) {
        // create comma-separated list of all fields of the given table
        final String[] fields_list =
                com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, table_name);
        final StringBuffer fields = new StringBuffer();
        for (final String element : fields_list) {
            if (fields.length() > 0) {
                fields.append(",");
            }
            fields.append(notNull(element));
        }
        
        String where = null;
        if (wo_id != 0 && table_name.equals("wo")) {
            where = " wo_id = " + wo_id;
            // fix KB3029197-comment out below code because the dummy record do not need in latest
            // sybase 9, mssql2005,
            // the numbering sequence work well if max record is deleted(Guo 2011/5/4)
            /*
             * // check if work order to be deleted is record with maximal id int max_wo_id =
             * Common.getMaxId(context, "wo", "wo_id", null); if (wo_id == max_wo_id) { // insert
             * dummy record and delete previous Map values = new HashMap(); String description =
             * localizeMessage(context, Constants.ONDEMAND_ACTIVITY_ID, "ARCHIVE_WFR",
             * "ARCHIVE_DESCRIPTION", null); values.put("description", description);
             * executeDbAdd(context, "wo", values); executeDbCommit(context);
             * 
             * // delete previous dummy record String delete = "DELETE FROM wo WHERE description = "
             * + literal(context, description) + " AND wo_id < " + max_wo_id; executeDbSql(context,
             * delete, false); executeDbCommit(context); }
             */
        } else if (table_name.equals("wr")) {
            // Guo added 2010-11-3 to fix KB3029091
            calculateDiffHour(wo_id, wr_id);
            // check if work request to be deleted is record with maximal id
            // int max_wr_id = Common.getMaxId(context, "wr", "wr_id", null);
            // boolean max = false;
            if (wo_id != 0) {
                where = "wo_id = " + wo_id;
                
                // List records = selectDbRecords(context, "wr", new String[] { "wr_id" }, where);
                
                /*
                 * if (!records.isEmpty()) { for (Iterator record_it = records.iterator();
                 * record_it.hasNext();) { Object[] record = (Object[]) record_it.next(); Integer wr
                 * = getIntegerValue(context, record[0]); if (wr.intValue() == max_wr_id) { max =
                 * true; break; } } }
                 */
                
                // update records in helpdesk_step_log
                final String update =
                        "UPDATE "
                                + Constants.STEP_LOG_TABLE
                                + "  SET table_name='hwr' "
                                + " WHERE table_name='wr' AND pkey_value IN (SELECT wr_id FROM wr WHERE wo_id = "
                                + wo_id + ")";
                executeDbSql(context, update, false);
                executeDbCommit(context);
                
            } else if (wr_id != 0) {
                where = "wr_id = " + wr_id;
                /*
                 * if (wr_id == max_wr_id) { max = true; }
                 */
                
                // update records in helpdesk_step_log
                final String update =
                        "UPDATE " + Constants.STEP_LOG_TABLE + "  SET table_name='hwr' "
                                + " WHERE table_name='wr' AND pkey_value = " + wr_id;
                executeDbSql(context, update, true);
                executeDbCommit(context);
            }
            // fix KB3029197-comment out below code because the dummy record do not need in latest
            // sybase 9, mssql2005,
            // the numbering sequence work well if max record is deleted(Guo 2011/5/4)
            /*
             * if (max) { // insert dummy record and delete previous Map values = new HashMap();
             * String description = localizeMessage(context, Constants.ONDEMAND_ACTIVITY_ID,
             * "ARCHIVE_WFR", "ARCHIVE_DESCRIPTION", null); values.put("description", description);
             * executeDbAdd(context, "wr", values); executeDbCommit(context);
             * 
             * // delete previous dummy record String delete = "DELETE FROM wr WHERE description = "
             * + literal(context, description) + " AND wr_id < " + max_wr_id; executeDbSql(context,
             * delete, false); executeDbCommit(context); }
             */
            
        } else {
            if (wr_id != 0) {
                where = "wr_id = " + wr_id;
            } else if (wo_id != 0) {
                where = "wr_id IN (SELECT wr_id FROM wr WHERE wo_id = " + wo_id + ")";
            }
        }
        // format insert query
        final String insert =
                "INSERT into h" + table_name + "(" + fields.toString() + ") SELECT "
                        + fields.toString() + " FROM " + table_name + " WHERE " + where;
        executeDbSql(context, insert, false);
        executeDbCommit(context);
    }
    
    /**
     * calculate the difference hour related to wr table when hours_total = 0;
     * 
     * @param wo_id Work order request
     * @param wr_id Work request
     */
    private void calculateDiffHour(final int wo_id, final int wr_id) {
        if (wo_id != 0 || wr_id != 0) {
            String where = " WHERE hours_total = 0";
            
            if (wo_id != 0) {
                where += " AND wr_id IN (SELECT wr_id FROM wr WHERE wo_id =" + wo_id + ")";
            }
            
            if (wr_id != 0) {
                where += " AND wr_id =" + wr_id;
            }
            
            final String updateWrcfSql =
                    "UPDATE wrcf SET hours_diff = hours_total - hours_est " + where;
            final String updateWrtrSql =
                    "UPDATE wrtr SET hours_diff = hours_total - hours_est " + where;
            final String updateWrttSql =
                    "UPDATE wrtt SET hours_diff = hours_total - hours_est " + where;
            final String updateWrtlSql =
                    "UPDATE wrtl SET hours_diff = hours_total - hours_est " + where;
            SqlUtils.executeUpdate("wrcf", updateWrcfSql);
            SqlUtils.executeUpdate("wrtr", updateWrtrSql);
            SqlUtils.executeUpdate("wrtt", updateWrttSql);
            SqlUtils.executeUpdate("wrtl", updateWrtlSql);
            SqlUtils.commit();
        }
    }
    
    /**
     * Archive a single work request (e.g. after rejection).
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Use {@link #archiveTable(EventHandlerContext, String, int, int)} to archive all records
     * linked to the given work request from the tables
     * <code>wr, wrtt, wrtr, wrpt, wrtl, wrcf, wr_other</code></li>
     * <li>If archived wr is record with maximal id, insert dummy record</li>
     * <li>Delete the record from <code>wr</code> (cascade delete records from all other tables)</li>
     * <li>Update records in <code>helpdesk_step_log</code> (set table_name to <code>hwr</code>)</li>
     * </ol>
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request to archive
     */
    public void archiveWorkRequest(final int wr_id) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // wr
        archiveTable(context, "wr", 0, wr_id);
        // wrtt
        archiveTable(context, "wrtt", 0, wr_id);
        // wrtr
        archiveTable(context, "wrtr", 0, wr_id);
        // wrpt
        archiveTable(context, "wrpt", 0, wr_id);
        // wrtl
        archiveTable(context, "wrtl", 0, wr_id);
        // wrcf
        archiveTable(context, "wrcf", 0, wr_id);
        // wr_other
        archiveTable(context, "wr_other", 0, wr_id);
        
        // fix KB3029197-comment out below code because the dummy record do not need in latest
        // sybase 9, mssql2005,
        // the numbering sequence work well if max record is deleted(Guo 2011/5/4)
        /*
         * int max_wr_id = Common.getMaxId(context, "wr", "wr_id", null); if (wr_id == max_wr_id) {
         * // insert dummy record and delete previous Map values = new HashMap(); String description
         * = localizeMessage(context, Constants.ONDEMAND_ACTIVITY_ID, "ARCHIVE_WFR",
         * "ARCHIVE_DESCRIPTION", null); values.put("description", description);
         * executeDbAdd(context, "wr", values); executeDbCommit(context);
         * 
         * // delete previous dummy record String delete = "DELETE FROM wr WHERE description = " +
         * literal(context, description) + " AND wr_id < " + max_wr_id; executeDbSql(context,
         * delete, false); executeDbCommit(context); }
         */
        
        final String deleteWr_other = "DELETE FROM wr_other WHERE wr_id  = " + wr_id;
        final String deleteWrcf = "DELETE FROM wrcf WHERE wr_id = " + wr_id;
        final String deleteWrtl = "DELETE FROM wrtl WHERE wr_id = " + wr_id;
        final String deleteWrpt = "DELETE FROM wrpt WHERE wr_id = " + wr_id;
        final String deleteWrtr = "DELETE FROM wrtr WHERE wr_id = " + wr_id;
        final String deleteWrtt = "DELETE FROM wrtt WHERE wr_id = " + wr_id;
        final String deleteWr = "DELETE FROM wr WHERE wr_id = " + wr_id;
        
        // cascade delete all
        final Vector commands = new Vector();
        commands.add(deleteWr_other);
        commands.add(deleteWrcf);
        commands.add(deleteWrtl);
        commands.add(deleteWrpt);
        commands.add(deleteWrtr);
        commands.add(deleteWrtt);
        commands.add(deleteWr);
        
        executeDbSqlCommands(context, commands, false);
        
        // archive help requests linked to the selected work order or to a work
        // request assigned to
        // this work order
        final List helpRequests =
                selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
                    new String[] { "activity_log_id" }, "wr_id = " + wr_id);
        if (!helpRequests.isEmpty()) {
            final JSONArray json = new JSONArray();
            for (final Iterator it = helpRequests.iterator(); it.hasNext();) {
                final Object[] request = (Object[]) it.next();
                final JSONObject object = new JSONObject();
                object.put("activity_log.activity_log_id", request[0]);
                json.put(object);
            }
            
            context.addResponseParameter("records", json.toString());
            final RequestHandler requestHandler = new RequestHandler();
            requestHandler.archiveRequests(json);
        }
        
        // update records in afm_docs
        // KB3036749 - use dasource API to update afm_docs.table_name to support casecade update in
        // MSSQL AND Oracle
        archiveWorkRequestDocument("wr", wr_id);
        
        // update records in helpdesk_step_log
        final String update =
                "UPDATE " + Constants.STEP_LOG_TABLE + "  SET table_name='hwr' "
                        + " WHERE table_name='wr' AND pkey_value = " + wr_id;
        executeDbSql(context, update, false);
        executeDbCommit(context);
    }
    
    /**
     * archive work request documents;
     * 
     * @param tableName wo or wr
     * @param id wo_id value or wr_id value
     */
    public void archiveWorkRequestDocument(final String tableName, final int id) {
        
        final String[] fieldNames = { "table_name", "field_name", "pkey_value" };
        final DataSource docDs =
                DataSourceFactory.createDataSourceForFields("afm_docs", fieldNames);
        
        String restriction = "table_name='wr'";
        if ("wo".equals(tableName)) {
            restriction +=
                    " and pkey_value IN (select wr.wr_id from wr where wr.wo_id =" + id + ")";
        } else {
            restriction += " and pkey_value =" + id;
        }
        
        final List<DataRecord> docRecords = docDs.getRecords(restriction);
        for (final DataRecord docRecord : docRecords) {
            docRecord.setValue("afm_docs.table_name", "hwr");
            docDs.saveRecord(docRecord);
        }
    }
    
    /**
     * 
     * Save work request.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with wr_id of new record<br />
     * <code>{wr_id : ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>If wr_id is given in the inputs, save (update) the record in <code>wr</code></li>
     * <li>Else
     * <ul>
     * <li>Save new record in <code>wr</code></li>
     * <li>{@link #updateWorkRequestFromSLA(EventHandlerContext, int) Update work request according
     * to SLA}</li>
     * <li>Check if workorder code is given, if so put status on AA, else on R</li>
     * <li>Put work request code in a jsonobject and return</li>
     * </ul>
     * </li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject fields,wo table record
     *            </p>
     */
    public void saveWorkRequest(final JSONObject fields) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, fields);
        final Map values = stripPrefix(fieldValues);
        
        if (values.get("wr_id") == null) { // new record
            values.put("supervisor",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
            executeDbAdd(context, "wr", values);
            executeDbCommit(context);
            
            final int wr_id =
                    Common.getMaxId(context, "wr", "wr_id",
                        getRestrictionFromValues(context, values));
            
            updateWorkRequestFromSLA(context, wr_id);
            
            final StatusManager manager = new OnDemandWorkStatusManager(context, wr_id);
            if (values.get("wo_id") != null) {
                manager.updateStatus("AA");
            } else {
                manager.updateStatus("R");
            }
            
            final JSONObject result = new JSONObject();
            result.put("wr_id", wr_id);
            
            context.addResponseParameter("jsonExpression", result.toString());
            
        } else { // update, don't change status !!!
            executeDbSave(context, "wr", values);
            // Guo changed 2009-01-15 for KB3021405
            executeDbCommit(context);
        }
    }
    
    /**
     * Update (new) work request according to the SLA it matches.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create a {@link ServiceLevelAgreement SLA} with the given work request id</li>
     * <li>Calculate the escalation dates/times and get the manager from the SLA</li>
     * <li>Save this values to the record in <code>wr</code></li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request to update
     */
    private void updateWorkRequestFromSLA(final EventHandlerContext context, final int wr_id) {
        // copy SLA parameters to work request table (manager, escalation dates)
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id);
        
        final Map values = new HashMap();
        values.put("wr_id", new Integer(wr_id));
        values.put("manager", sla.getSLAManager());
        
        // calculate escalation date and time
        final Object[] datetimeValues =
                selectDbValues(context, "wr", new String[] { "date_requested", "time_requested" },
                    " wr_id=" + wr_id);
        
        final java.sql.Date dateRequested = getDateValue(context, datetimeValues[0]);
        final java.sql.Time timeRequested = getTimeValue(context, datetimeValues[1]);
        
        final Map escalation = sla.calculateEscalation(dateRequested, timeRequested);
        final Map response = (Map) escalation.get("response");
        if (response != null) {
            final java.sql.Date date_esc_response = (java.sql.Date) response.get("date");
            final java.sql.Time time_esc_response = (java.sql.Time) response.get("time");
            values.put("date_escalation_response", date_esc_response);
            values.put("time_escalation_response", time_esc_response);
        }
        
        final Map completion = (Map) escalation.get("completion");
        if (completion != null) {
            final java.sql.Date date_esc_completion = (java.sql.Date) completion.get("date");
            final java.sql.Time time_esc_completion = (java.sql.Time) completion.get("time");
            
            values.put("date_escalation_completion", date_esc_completion);
            values.put("time_escalation_completion", time_esc_completion);
        }
        
        final ServiceWindow serviceWindow = sla.getServiceWindow();
        if (serviceWindow != null) {
            values.put("serv_window_days", serviceWindow.getServiceWindowDaysAsString());
            values.put("serv_window_start", serviceWindow.getServiceWindowStartTime());
            values.put("serv_window_end", serviceWindow.getServiceWindowEndTime());
            values.put("allow_work_on_holidays",
                serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
        }
        
        executeDbSave(context, "wr", values);
        executeDbCommit(context);
        
        // not issued
        createDefaultEstimationAndScheduling(context, wr_id, sla);
    }
    
    /**
     * Update (new) work request according to the SLA it matches. C. Kriezis based on
     * updateWorkRequestFromSLA. Skip estimation and scheduling step.
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request to update
     */
    private void updateWorkRequestFromSLAMobile(final EventHandlerContext context, final int wr_id) {
        // copy SLA parameters to work request table (manager, escalation dates)
        final ServiceLevelAgreement sla =
                ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id);
        
        final Map values = new HashMap();
        values.put("wr_id", new Integer(wr_id));
        values.put("manager", sla.getSLAManager());
        
        // calculate escalation date and time
        final Object[] datetimeValues =
                selectDbValues(context, "wr", new String[] { "date_requested", "time_requested" },
                    " wr_id=" + wr_id);
        
        final java.sql.Date dateRequested = getDateValue(context, datetimeValues[0]);
        final java.sql.Time timeRequested = getTimeValue(context, datetimeValues[1]);
        
        final Map escalation = sla.calculateEscalation(dateRequested, timeRequested);
        final Map response = (Map) escalation.get("response");
        if (response != null) {
            final java.sql.Date date_esc_response = (java.sql.Date) response.get("date");
            final java.sql.Time time_esc_response = (java.sql.Time) response.get("time");
            values.put("date_escalation_response", date_esc_response);
            values.put("time_escalation_response", time_esc_response);
        }
        
        final Map completion = (Map) escalation.get("completion");
        if (completion != null) {
            final java.sql.Date date_esc_completion = (java.sql.Date) completion.get("date");
            final java.sql.Time time_esc_completion = (java.sql.Time) completion.get("time");
            
            values.put("date_escalation_completion", date_esc_completion);
            values.put("time_escalation_completion", time_esc_completion);
        }
        
        final ServiceWindow serviceWindow = sla.getServiceWindow();
        if (serviceWindow != null) {
            values.put("serv_window_days", serviceWindow.getServiceWindowDaysAsString());
            values.put("serv_window_start", serviceWindow.getServiceWindowStartTime());
            values.put("serv_window_end", serviceWindow.getServiceWindowEndTime());
            values.put("allow_work_on_holidays",
                serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
        }
        
        executeDbSave(context, "wr", values);
        executeDbCommit(context);
    }
    
    /**
     * 
     * Issue work request.<br />
     * Called by {@link #issueWorkorder(EventHandlerContext)}. Updates the basic status of the work
     * request to 'I' using the {@link StatusManager status manager}
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : Work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wr_id from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * Update work request status}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     *            </p>
     */
    public void issueWorkRequest(final EventHandlerContext context) {
        final int wr_id = context.getInt("wr.wr_id");
        
        final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
        statusManager.updateStatus("I");
    }
    
    /**
     * 
     * Issue work order.<br/>
     * When a work order is issued its date_issued is set to the current date,
     * {@link #issueWorkRequest(EventHandlerContext) all work request attached to the work order are
     * also issued} and all craftspersons and supervisors the work requests are assigned to are
     * notified.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wo_id : work order code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wo_id from context</li>
     * <li>Set work order date_issued</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#issueWorkRequest(EventHandlerContext)
     * Issue work requests attached to this work order}</li>
     * <li>Notify
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#notifyCraftspersons(EventHandlerContext, int)
     * craftspersons} and
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#notifySupervisor(EventHandlerContext, String)
     * supervisor}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String woId
     *            </p>
     */
    public void issueWorkorder(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wo_id = Integer.parseInt(woId);
        
        // change date_issued of workorder
        final Map values = new HashMap();
        values.put("wo_id", new Integer(wo_id));
        
        final Map<String, String> map =
                Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));
        
        values.put(
            "date_issued",
            LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                map.get("blId")));
        values.put(
            "time_issued",
            LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                map.get("blId")));
        
        executeDbSave(context, "wo", values);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
        
        // change status of work requests
        // List records = selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " +
        // wo_id);
        final List records =
                selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id
                        + " AND status = 'AA'");
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final Integer wr_id = getIntegerValue(context, record[0]);
            context.addResponseParameter("wr.wr_id", wr_id);
            issueWorkRequest(context);
        }
        
        // notify craftsperson(s)
        notifyCraftspersons(context, wo_id);
        
        // check if help requests are linked to this work order and change their
        // status
        final List recs =
                selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
                    new String[] { "activity_log_id" }, "wo_id = " + wo_id);
        if (recs != null && !recs.isEmpty()) {
            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final Integer activity_log_id = getIntegerValue(context, record[0]);
                final HelpdeskStatusManager statusManager =
                        new HelpdeskStatusManager(context, activity_log_id.intValue());
                statusManager.updateStatus("IN PROGRESS");
            }
        }
        
        // KB3037179 - update wo.qty_open_wr
        updateOpenWrNumOfWo(woId);
    }
    
    /**
     * 
     * Issue work order for mobile. By C. Kriezis based on issueWorkOrder.
     * 
     * @param String woId
     * 
     */
    public void issueWorkorderMobile(final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final int wo_id = Integer.parseInt(woId);
        
        // change date_issued of workorder
        final Map values = new HashMap();
        values.put("wo_id", new Integer(wo_id));
        
        final Map<String, String> map =
                Common.getSiteBuildingIds("wo", "wo_id", String.valueOf(wo_id));
        
        values.put(
            "date_issued",
            LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                map.get("blId")));
        values.put(
            "time_issued",
            LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                map.get("blId")));
        
        executeDbSave(context, "wo", values);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
        
        // change status of work requests
        // List records = selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " +
        // wo_id);
        final List records =
                selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id);
        
        for (final Iterator it = records.iterator(); it.hasNext();) {
            final Object[] record = (Object[]) it.next();
            final Integer wr_id = getIntegerValue(context, record[0]);
            context.addResponseParameter("wr.wr_id", wr_id);
            issueWorkRequest(context);
        }
        
        // notify craftsperson(s) - commented for mobile
        // notifyCraftspersons(context, wo_id);
        
        // check if help requests are linked to this work order and change their
        // status
        final List recs =
                selectDbRecords(context, Constants.ACTION_ITEM_TABLE,
                    new String[] { "activity_log_id" }, "wo_id = " + wo_id);
        if (recs != null && !recs.isEmpty()) {
            for (final Iterator it = recs.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final Integer activity_log_id = getIntegerValue(context, record[0]);
                final HelpdeskStatusManager statusManager =
                        new HelpdeskStatusManager(context, activity_log_id.intValue());
                statusManager.updateStatus("IN PROGRESS");
            }
        }
        
        // KB3037179 - update wo.qty_open_wr
        updateOpenWrNumOfWo(woId);
    }
    
    /**
     * Issue work orders
     * 
     * @param JSONArray records ,wo_id value
     */
    public void issueWorkOrders(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        if (records.length() > 0) {
            int wo_id = 0;
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                
                wo_id = getIntegerValue(context, values.get("wo_id")).intValue();
                
                context.addResponseParameter("wo_id", new Integer(wo_id));
                issueWorkorder(Integer.toString(wo_id));
            }
        }
    }
    
    /**
     * Issue work requests
     * 
     * @param JSONArray records
     */
    public void issueWorkRequests(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Integer wo_id = null;
        Integer wr_id = null;
        if (records.length() > 0) {
            final Map woWrMap = new HashMap();
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wo_id = new Integer(record.getInt("wr.wo_id"));
                wr_id = new Integer(record.getInt("wr.wr_id"));
                if (woWrMap.containsKey(wo_id)) {
                    final List wrs = (ArrayList) woWrMap.get(wo_id);
                    wrs.add(wr_id);
                } else {
                    final List wrs = new ArrayList();
                    wrs.add(wr_id);
                    woWrMap.put(wo_id, wrs);
                }
            }
            for (final Iterator it = woWrMap.keySet().iterator(); it.hasNext();) {
                wo_id = (Integer) it.next();
                final ArrayList wrs = (ArrayList) woWrMap.get(wo_id);
                final StringBuffer wrList = new StringBuffer();
                for (final Iterator wr_it = wrs.iterator(); wr_it.hasNext();) {
                    wrList.append("," + wr_it.next());
                }
                final List missingWrs =
                        selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id
                                + " AND wr_id NOT IN (" + wrList.substring(1) + ")");
                if (missingWrs.isEmpty()) {
                    context.addResponseParameter("wo_id", wo_id);
                    issueWorkorder(String.valueOf(wo_id));
                } else {
                    // @translatable
                    final String errorMessage =
                            prepareMessage(
                                context,
                                "Not all work requests of work order {0} were selected. The selected work requests of this work order are not issued.",
                                new Object[] { wo_id });
                    throw new ExceptionBase(errorMessage, true);
                }
            }
        }
    }
    
    /**
     * 
     * Notify craftsperson(s) of a work request assigned.<br/>
     * Called by {@link #issueWorkorder(EventHandlerContext)}.<br />
     * The body and subject for the message send to the craftsperson are stored in the
     * <code>messages</code> table with the ondemand activity and referenced by 'NOTIFY_CF_WFR'.<br />
     * The link to the view file the craftsperson needs is stored as activity parameter 'CF_VIEW'.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from wrcf for all work requests in given work order</li>
     * <li>Prepare message to send</li>
     * <li>Notify selected craftspersons</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wo_id issued work order
     *            </p>
     */
    private void notifyCraftspersons(final EventHandlerContext context, final int wo_id) {
        final List workRequests =
                selectDbRecords(context, "wr", new String[] { "wr_id" }, "wo_id = " + wo_id);
        for (final Iterator wrIt = workRequests.iterator(); wrIt.hasNext();) {
            final Object[] wrRecord = (Object[]) wrIt.next();
            final Integer wr_id = getIntegerValue(context, wrRecord[0]);
            final ServiceLevelAgreement sla =
                    new ServiceLevelAgreement(context, "wr", "wr_id", wr_id);
            
            if (sla.isNotifyCraftsperson()) {
                final String select = "SELECT DISTINCT cf_id FROM wrcf WHERE wr_id =" + wr_id;
                final List wrcf = selectDbRecords(context, select);
                
                final Message message = new Message(context);
                message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
                message.setReferencedBy("NOTIFY_CF_WFR");
                
                final String link =
                        getWebCentralPath(context)
                                + "/"
                                + getActivityParameterString(context,
                                    Constants.ONDEMAND_ACTIVITY_ID, "CF_VIEW");
                final Map dataModel =
                        MessageHelper.getRequestDatamodel(context, "wr", "wr_id", wr_id);
                dataModel.put("link", link);
                
                // KB 3023429 - also send a message (with different content) to the substitute(s) of
                // the craftsperson(s) (EC 2012/7/10)
                final Message messageForSubstitute = new Message(context);
                messageForSubstitute.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
                messageForSubstitute.setReferencedBy("NOTIFY_CF_SUBSTITUTE_WFR");
                messageForSubstitute.setSubjectMessageId("NOTIFY_CF_TITLE");
                messageForSubstitute.setBodyMessageId("NOTIFY_CF_TEXT");
                if (messageForSubstitute.isBodyRichFormatted()
                        || messageForSubstitute.isSubjectRichFormatted()) {
                    messageForSubstitute.setDataModel(dataModel);
                }
                if (!messageForSubstitute.isBodyRichFormatted()) {
                    messageForSubstitute.setBodyArguments(new Object[] { link });
                }
                
                for (final Iterator it = wrcf.iterator(); it.hasNext();) {
                    final Object[] record = (Object[]) it.next();
                    
                    final String cf_id = notNull(record[0]);
                    final String email =
                            notNull(selectDbValue(context, "cf", "email",
                                "cf_id = " + literal(context, cf_id)));
                    
                    if (email != null && !email.equals("")) {
                        message.setBodyMessageId("NOTIFY_CF_TEXT");
                        message.setSubjectMessageId("NOTIFY_CF_TITLE");
                        
                        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                            message.setDataModel(dataModel);
                        }
                        if (!message.isBodyRichFormatted()) {
                            message.setBodyArguments(new Object[] { link });
                        }
                        message.format();
                        
                        message.setMailTo(email);
                        message.setNameto(cf_id);
                    } else {
                        message.setBodyMessageId("NOTIFY_MGR_TEXT");
                        message.setSubjectMessageId("NOTIFY_MGR_TITLE");
                        
                        if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                            dataModel.put("cf_id", cf_id);
                            message.setDataModel(dataModel);
                        }
                        if (!message.isBodyRichFormatted()) {
                            message.setBodyArguments(new Object[] { cf_id, link });
                        }
                        message.format();
                        
                        final String managerEmail =
                                notNull(selectDbValue(context, "em", "email",
                                    "em_id = (SELECT manager FROM wr WHERE wr_id = " + wr_id + ")"));
                        message.setMailTo(managerEmail);
                    }
                    message.sendMessage();
                    
                    // KB 3023429 - also send a message (with different content) to the
                    // substitute(s) of
                    // the craftsperson(s) (EC 2012/7/10)
                    final List<String> substitutes =
                            StepHandler.getWorkflowCfSubstitutes(context, cf_id, "craftsperson");
                    if (!substitutes.isEmpty()) {
                        for (final String substitute : substitutes) {
                            if (messageForSubstitute.isBodyRichFormatted()
                                    || messageForSubstitute.isSubjectRichFormatted()) {
                                dataModel.put("cf_id", cf_id);
                                messageForSubstitute.setDataModel(dataModel);
                            }
                            messageForSubstitute.format();
                            messageForSubstitute.setMailTo(getEmailAddressForCraftsperson(context,
                                substitute));
                            messageForSubstitute.setNameto(substitute);
                            messageForSubstitute.sendMessage();
                        }
                    }
                }
            }
        }
    }
    
    /**
     * 
     * Delete records from the given table in the database.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>tablename : table to delete from</li>
     * <li>records : JSONArray with records to delete</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Delete records from database</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Recalculate costs for work requests}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String tableName
     * @param JSONArray records
     *            </p>
     */
    public void deleteItems(final String tableName, final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String tr = null;
        String tooltype = null;
        int wr_id = 0;
        // fix KB3031078 - Update Help Desk WFRs to use DataSource API instead of
        // executeDbDelete(Guo 2011/4/18)
        DataSource dataSource = null;
        if (records.length() > 0) {
            dataSource = DataRecord.createDataSourceForRecord(records.getJSONObject(0));
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                wr_id = record.getInt(tableName + ".wr_id");
                
                if (tableName.equals("wrcf")) {
                    if (record.has("wrcf.scheduled_from_tr_id")) {
                        tr = record.getString("wrcf.scheduled_from_tr_id");
                    } else {
                        tr =
                                notNull(selectDbValue(context, "cf", "tr_id",
                                    "cf_id= " + literal(context, record.getString("wrcf.cf_id"))));
                    }
                } else if (tableName.equals("wrtl")) {
                    tooltype =
                            notNull(selectDbValue(context, "tl", "tool_type", "tool_id= "
                                    + literal(context, record.getString("wrtl.tool_id"))));
                }
                
                final Map values = fromJSONObject(record);
                dataSource.deleteRecord(values);
                
                // Map values = parseJSONObject(context, record);
                // values = stripPrefix(values);
                // executeDbDelete(context, tableName, values);
                if (tableName.equals("wrcf") && tr != null) {
                    recalculateTrade(context, wr_id, tr);
                }
                if (tableName.equals("wrtl") && tooltype != null) {
                    recalculateToolType(context, wr_id, tooltype);
                }
            }
        }
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
    }
    
    /**
     * 
     * Save a Work Order.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with code of saved workorder<br />
     * <code>{wo_id: ?}</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Add/Update work order record in <code>wo</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record
     *            </p>
     */
    public void saveWorkorder(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldValues);
        executeDbSave(context, "wo", values);
        executeDbCommit(context);
        
        final JSONObject json = new JSONObject();
        if (values.get("wo_id") == null) {
            final int wo_id = Common.getMaxId(context, "wo", "wo_id", null);
            json.put("wo_id", new Integer(wo_id));
        } else {
            json.put("wo_id", values.get("wo_id"));
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * 
     * Save Workorder and attach work request(s) to it.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * <li>wr_id : code of work request to attach to workorder</li>
     * <li><i>or</i> records : JSONArray of JSONObjects with work request codes to attach to work
     * order</li>
     * <li><i>or</i> activity_log_id : id of help request to create a work request from to attach to
     * the work order</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save work order (with current user as supervisor)</li>
     * <li>If context contains wr_id,
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * update work request status} to AA</li>
     * <li>If context contains records,
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#assignWorkRequestToWorkorder(EventHandlerContext, int, int)
     * attach work requests to workorder}</li>
     * <li>If context contains activity_log_id,
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#createWorkRequestFromActionItem(EventHandlerContext, int, boolean)
     * create work request from help request} and
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#assignWorkRequestToWorkorder(EventHandlerContext, int, int)
     * assign work request to work order}
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject fields1
     * @param JSONArray records1
     * @param String link_to1
     * @param String activity_log_id1
     *            </p>
     */
    public void saveNewWorkorder(final JSONObject fields1, final JSONArray records1,
            final String link_to1, final String activity_log_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("fields", fields1);
        context.addInputParameter("records", records1);
        context.addInputParameter("link_to", link_to1);
        context.addInputParameter("activity_log_id", activity_log_id1);
        Map fieldValues = new HashMap();
        try {
            fieldValues = parseJSONObject(context, fields1);
            
        } catch (final Exception e) {
            
        }
        Map values = stripPrefix(fieldValues);
        
        // set supervisor to employee logged in
        final String supervisor =
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id");
        if (StringUtil.notNullOrEmpty(supervisor)) {
            values.put("supervisor",
                getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
        }
        
        Date currentLocalDate = null;
        Time currentLocalTime = null;
        
        if (values.containsKey("bl_id")) {
            final String blId = (String) values.get("bl_id");
            
            currentLocalDate = LocalDateTimeStore.get().currentLocalDate(null, null, null, blId);
            currentLocalTime = LocalDateTimeStore.get().currentLocalTime(null, null, null, blId);
        }
        
        if (context.parameterExists("activity_log_id")
                && !context.getString("activity_log_id").equals("")) {
            final String activity_log_id = notNull(activity_log_id1);
            if (!"".equals(activity_log_id) && currentLocalDate == null && currentLocalTime == null) {
                final Map<String, String> mapSiteAndBlId =
                        Common.getSiteBuildingIds("activity_log", "activity_log_id",
                            notNull(activity_log_id1));
                final String siteId = mapSiteAndBlId.get("siteId");
                final String blId = mapSiteAndBlId.get("blId");
                
                if (siteId != null && blId != null) {
                    currentLocalDate =
                            LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
                    currentLocalTime =
                            LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
                }
            }
        }
        
        if (currentLocalDate == null && currentLocalTime == null) {
            if (records1.length() > 0) {
                final int wr_id = records1.getJSONObject(0).getInt("wr.wr_id");
                final Map<String, String> mapSiteAndBlId =
                        Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
                final String siteId = mapSiteAndBlId.get("siteId");
                final String blId = mapSiteAndBlId.get("blId");
                
                currentLocalDate =
                        LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
                currentLocalTime =
                        LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
            }
        }
        
        values.put("date_created", currentLocalDate);
        values.put("time_created", currentLocalTime);
        
        executeDbAdd(context, "wo", values);
        executeDbCommit(context);
        
        final int wo_id =
                Common.getMaxId(context, "wo", "wo_id", getRestrictionFromValues(context, values));
        
        if (context.parameterExists("wr_id") && context.getInt("wr_id") > 0) {
            final int wr_id = context.getInt("wr_id");
            if (wr_id != 0) {
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                statusManager.updateStatus("AA");
            }
        }
        
        if (context.parameterExists("records")) {
            final JSONArray records = context.getJSONArray("records");
            int link_to = 0;
            
            if (context.parameterExists("link_to") && !context.getString("link_to").equals("")) {
                link_to = Integer.parseInt(context.getString("link_to"));
                
                final String update =
                        "UPDATE activity_log SET wr_id = NULL, wo_id = " + wo_id
                                + " WHERE activity_log_id = " + link_to;
                executeDbSql(context, update, true);
                executeDbCommit(context);
            }
            if (records.length() > 0) {
                for (int i = 0; i < records.length(); i++) {
                    final JSONObject record = records.getJSONObject(i);
                    final int wr_id = record.getInt("wr.wr_id");
                    assignWorkRequestToWorkorder(context, wr_id, wo_id);
                    if (link_to > 0) {
                        values = new HashMap();
                        values.put("wr_id", new Integer(wr_id));
                        values.put("activity_log_id", new Integer(link_to));
                        executeDbSave(context, "wr", values);
                        executeDbCommit(context);
                    }
                }
                
            }
        }
        
        if (context.parameterExists("activity_log_id")
                && !context.getString("activity_log_id").equals("")) {
            final int activity_log_id = Integer.parseInt(context.getString("activity_log_id"));
            if (activity_log_id != 0) {
                values = new HashMap();
                values.put("activity_log_id", new Integer(activity_log_id));
                values.put("wo_id", new Integer(wo_id));
                executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                executeDbCommit(context);
                
                final Integer wr_id =
                        new Integer(
                            createWorkRequestFromActionItem(context, activity_log_id, false));
                assignWorkRequestToWorkorder(context, wr_id.intValue(), wo_id);
            }
        }
        final JSONObject result = new JSONObject();
        result.put("wo_id", new Integer(wo_id));
        context.addResponseParameter("jsonExpression", result.toString());
        
    }
    
    /**
     * 
     * Save craftsperson assignment.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Check if inputs contain work request code (else throw exception)</li>
     * <li>If estimated time is given and no end date/time, calculate end date/time</li>
     * <li>If date/time assigned are given, update record in <code>wrcf</code></li>
     * <li>Else create new record in <code>wrcf</code></li>
     * <li>Update hours and costs in <code>wrcf</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for the work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateTrade(EventHandlerContext, int, String)
     * Update hours and costs for trade}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject fields
     *            </p>
     * 
     */
    public void saveWorkRequestCraftsperson(final JSONObject fields) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, fields);
        values = stripPrefix(values);
        
        final Integer wr_id = getIntegerValue(context, values.get("wr_id"));
        if (wr_id == null) {
            // @translatable
            final String errorMessage =
                    localizeString(context, "Work Request Code missing in context");
            throw new ExceptionBase(errorMessage, true);
        }
        
        // normally estimated time is submitted not end time
        if (values.get("date_end") == null && values.get("time_end") == null
                && values.get("date_start") != null && values.get("time_start") != null
                && values.get("hours_est") != null) {
            
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id.intValue());
            final ServiceWindow serviceWindow = sla.getServiceWindow();
            
            final java.sql.Date startDate = getDateValue(context, values.get("date_start"));
            final java.sql.Time startTime = getTimeValue(context, values.get("time_start"));
            final Double estimatedTime = (Double) values.get("hours_est");
            final Map endDateTime =
                    serviceWindow.calculateEscalationDate(startDate, startTime,
                        estimatedTime.intValue(), "h");
            if (endDateTime != null) {
                values.put("date_end", endDateTime.get("date"));
                values.put("time_end", endDateTime.get("time"));
                
                executeDbSave(context, "wrcf", values);
                executeDbCommit(context);
            }
        }
        
        // update wrcf (hours and costs)
        final String cf_id = notNull(values.get("cf_id"));
        final String date =
                formatSqlFieldValue(context, values.get("date_assigned"), "java.sql.Date",
                    "date_assigned");
        final String time =
                formatSqlFieldValue(context, values.get("time_assigned"), "java.sql.Time",
                    "time_assigned");
        
        final StringBuffer sql = new StringBuffer("UPDATE wrcf SET");
        sql.append(" hours_total = hours_double + hours_over + hours_straight");
        sql.append(", cost_estimated = hours_est * (SELECT cf.rate_hourly FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(", cost_straight = hours_straight * (SELECT cf.rate_hourly FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(", cost_double = hours_double * (SELECT cf.rate_double FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(", cost_over = hours_over * (SELECT cf.rate_over FROM cf WHERE cf.cf_id = wrcf.cf_id)");
        sql.append(" WHERE cf_id = " + literal(context, cf_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);
        executeDbSql(context, sql.toString(), true);
        
        final StringBuffer sql_ = new StringBuffer("UPDATE wrcf SET");
        sql_.append(" cost_total = cost_double + cost_over + cost_straight");
        sql_.append(" , hours_diff = hours_total - hours_est");
        sql_.append(" WHERE cf_id = " + literal(context, cf_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);
        
        executeDbSql(context, sql_.toString(), true);
        executeDbCommit(context);
        // update wr
        recalculateCosts(context, wr_id.intValue());
        recalculateEstCosts(context, wr_id.intValue());
        
        // update wrtr
        final String tr_scheduled =
                (String) selectDbValue(context, "wrcf", "scheduled_from_tr_id", "cf_id = "
                        + literal(context, cf_id) + " AND wr_id = " + wr_id
                        + " AND date_assigned = " + date + " AND time_assigned = " + time);
        if (tr_scheduled != null) {
            recalculateTrade(context, wr_id.intValue(), tr_scheduled);
        } else {
            final String tr_id =
                    notNull(selectDbValue(context, "cf", "tr_id",
                        "cf_id = " + literal(context, cf_id)));
            values.put("scheduled_from_tr_id", tr_id);
            
            executeDbSave(context, "wrcf", values);
            executeDbCommit(context);
            recalculateTrade(context, wr_id.intValue(), tr_id);
        }
        
    }
    
    /**
     * 
     * Update hours and costs in for trade estimations in <code>wrtr</code>.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update hours and costs in wrtr</li>
     * <li>Select in minimal start date/time and maximal end date/time in wrcf for craftspersons of
     * given trade</li>
     * <li>Update start and end date/time in wrtr</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtr SET <br />
     * hours_sched = (SELECT ISNULL(SUM(hours_est),0) FROM wrcf WHERE wr_id = ? AND cf_id IN (SELECT
     * cf_id FROM cf WHERE tr_id = ?)),<br />
     * hours_straight = (SELECT ISNULL(SUM(hours_straight),0) FROM wrcf WHERE wr_id = ? AND cf_id IN
     * (SELECT cf_id FROM cf WHERE tr_id = ?)),<br />
     * hours_over = (SELECT ISNULL(SUM(hours_over),0) FROM wrcf WHERE wr_id = ? AND cf_id IN (SELECT
     * cf_id FROM cf WHERE tr_id = ?)),<br />
     * cost_straight = (SELECT ISNULL(SUM(cost_straight),0) FROM wrcf WHERE wr_id = ? AND cf_id IN
     * (SELECT cf_id FROM cf WHERE tr_id = ?)),<br />
     * cost_over = (SELECT ISNULL(SUM(cost_over),0) FROM wrcf WHERE wr_id = ? AND cf_id IN (SELECT
     * cf_id FROM cf WHERE tr_id = ?))<br />
     * WHERE wr_id = " + wr_id + " AND tr_id = " + literal(context, tr_id); </div>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     * @param tr_id Trade code
     *            </p>
     */
    public void recalculateTrade(final EventHandlerContext context, final int wr_id,
            final String tr_id) {
        
        final String from =
                " FROM wrcf WHERE wr_id = " + wr_id
                        + " AND cf_id IN (SELECT cf_id FROM cf WHERE tr_id = "
                        + literal(context, tr_id) + ")";
        
        /*
         * String startSql = "SELECT date_start, time_start FROM wrcf WHERE wr_id = " + wr_id + "
         * AND cf_id IN (SELECT cf_id FROM cf WHERE tr_id = " + literal(context, tr_id) + ")" + "
         * ORDER BY date_start ASC, time_start ASC ";
         * 
         * String endSql = "SELECT date_end, time_end FROM wrcf WHERE wr_id = " + wr_id + " AND
         * cf_id IN (SELECT cf_id FROM cf WHERE tr_id = " + literal(context, tr_id) + ")" + " ORDER
         * BY date_end DESC, time_end DESC ";
         */
        // Guo changed 2008-12-22 to fix KB3021005
        String updateSql =
                "UPDATE wrtr SET " + " hours_sched = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_est),0") + from +
                        /*
                         * "), hours_straight = (SELECT "+
                         * formatSqlIsNull(context,"SUM(hours_straight),0") + from +
                         * "), hours_over = (SELECT "+ formatSqlIsNull(context,"SUM(hours_over),0")
                         * + from + "), cost_straight = (SELECT "+
                         * formatSqlIsNull(context,"SUM(cost_straight),0") + from +
                         * "), cost_over = (SELECT "+ formatSqlIsNull(context,"SUM(cost_over),0") +
                         * from +
                         */
                        ") , hours_total = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_total),0") + from + ")"
                        + " WHERE wr_id = " + wr_id + " AND tr_id = " + literal(context, tr_id);
        
        executeDbSql(context, updateSql, false);
        
        updateSql =
                "UPDATE wrtr SET " + " hours_diff = hours_total - hours_est" + " WHERE wr_id = "
                        + wr_id + " AND tr_id = " + literal(context, tr_id);
        
        executeDbSql(context, updateSql, false);
        executeDbCommit(context);
        
        /*
         * List startRecs = selectDbRecords(context, startSql); List endRecs =
         * selectDbRecords(context, endSql);
         * 
         * if (!startRecs.isEmpty() && !endRecs.isEmpty()) { Object[] start = (Object[])
         * startRecs.get(0); Object[] end = (Object[]) endRecs.get(0);
         * 
         * Date date_start = start[0] != null ? getDateValue(context, start[0]) : null; Time
         * time_start = start[1] != null ? getTimeValue(context,start[1]): null; Date date_end =
         * end[0] != null ? getDateValue(context, end[0]): null; Time time_end = end[1] != null ?
         * getTimeValue(context,end[1]):null;
         * 
         * Map values = new HashMap(); values.put("date_start", date_start);
         * values.put("time_start", time_start); values.put("date_end", date_end);
         * values.put("time_end", time_end); values.put("wr_id", new Integer(wr_id));
         * values.put("tr_id",tr_id); executeDbSave(context, "wrtr", values); }
         */
    }
    
    /**
     * 
     * Save part reservation for a work request.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>If date/time assigned are given, update record in <code>wrpt</code></li>
     * <li>Else create new record in <code>wrpt</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#updateInventoryAfterEstimation(EventHandlerContext...)
     * Update inventory}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record
     *            </p>
     * 
     */
    public void saveWorkRequestPart(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        int difference = 0;
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final String part_id = (String) values.get("part_id");
        String date = null;
        String time = null;
        
        date =
                formatSqlFieldValue(context, values.get("date_assigned"), "java.sql.Date",
                    "date_assigned");
        time =
                formatSqlFieldValue(context, values.get("time_assigned"), "java.sql.Time",
                    "time_assigned");
        int currEst = 0;
        if (values.get("qty_estimated") != null) {
            currEst = getIntegerValue(context, values.get("qty_estimated")).intValue();
        }
        final String where =
                "part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                        + " AND date_assigned = " + date + " AND time_assigned = " + time;
        
        final Object tmp = selectDbValue(context, "wrpt", "qty_estimated", where);
        if (tmp != null) {
            final int prevEst = ((Double) tmp).intValue();
            difference = currEst - prevEst;
            executeDbSave(context, "wrpt", values);
        } else {
            executeDbAdd(context, "wrpt", values);
            executeDbCommit(context);
        }
        
        final StringBuffer sql = new StringBuffer("UPDATE wrpt SET ");
        sql.append(" cost_estimated = qty_estimated * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id) ,");
        sql.append(" cost_actual = qty_actual * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id)");
        sql.append(" WHERE part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);
        
        executeDbSql(context, sql.toString(), true);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
        updateInventoryAfterEstimation(context, values, difference);
    }
    
    /**
     * 
     * for the KB#3026552, REMOVE code that adjusts part inventory from the Supervisor / Update Work
     * Orders and Work Requests / Resources tab. The part's Quantity Availalbe and Quantity on
     * Reserve should only be adjusted on the Work Order Close process..
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>If date/time assigned are given, update record in <code>wrpt</code></li>
     * <li>Else create new record in <code>wrpt</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#updateInventoryAfterEstimation(EventHandlerContext...)
     * Update inventory}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record
     *            </p>
     * 
     */
    public void saveWorkRequestPartWithoutPt(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        int difference = 0;
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        final String part_id = (String) values.get("part_id");
        String date = null;
        String time = null;
        
        date =
                formatSqlFieldValue(context, values.get("date_assigned"), "java.sql.Date",
                    "date_assigned");
        time =
                formatSqlFieldValue(context, values.get("time_assigned"), "java.sql.Time",
                    "time_assigned");
        int currEst = 0;
        if (values.get("qty_estimated") != null) {
            currEst = getIntegerValue(context, values.get("qty_estimated")).intValue();
        }
        final String where =
                "part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                        + " AND date_assigned = " + date + " AND time_assigned = " + time;
        
        final Object tmp = selectDbValue(context, "wrpt", "qty_estimated", where);
        if (tmp != null) {
            final int prevEst = ((Double) tmp).intValue();
            difference = currEst - prevEst;
            executeDbSave(context, "wrpt", values);
        } else {
            executeDbAdd(context, "wrpt", values);
            executeDbCommit(context);
        }
        
        final StringBuffer sql = new StringBuffer("UPDATE wrpt SET ");
        sql.append(" cost_estimated = qty_estimated * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id) ,");
        sql.append(" cost_actual = qty_actual * (SELECT pt.cost_unit_avg FROM pt WHERE pt.part_id = wrpt.part_id)");
        sql.append(" WHERE part_id = " + literal(context, part_id) + " AND wr_id = " + wr_id
                + " AND date_assigned = " + date + " AND time_assigned = " + time);
        
        executeDbSql(context, sql.toString(), true);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
        updateInventoryAfterEstimationWithoutPt(context, values, difference);
    }
    
    /**
     * 
     * Update parts inventory after reservation of a part for a work request.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select new parts reservations for the given work request</li>
     * <li>If the reservation status is 'R' update the quantity on reserve and the quantity on hand
     * in the <code>pt</code>table</li>
     * <li>Else only update the quantity on hand in the <code>pt</code> table. (Parts used without
     * reservation)</li>
     * <li>Update the reservation record in <code>wrpt</code>: set status to 'C' and debited to 1</li>
     * </ol>
     * <p>
     * <b>SQL:</b> Select records from wrpt: <div>SELECT
     * wrpt.part_id,wrpt.qty_estimated,wrpt.status,
     * wrpt.qty_actual,wrpt.date_assigned,wrpt.time_assigned,wrpt.wr_id<br />
     * FROM wrpt,wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wrpt.debited != 1 AND wr.wr_id = ?</div> Update reserved
     * parts: (for each selected record with status='R') <div> UPDATE pt SET<br />
     * qty_on_reserve = qty_on_reserve - <i>wrpt.qty_estimated</i>,<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_estimated</i> - <i>wrpt.qty_actual</i><br />
     * WHERE part_id = <i>wrpt.part_id</i> </div> Update other parts: (for each selected record with
     * status !='R') <div> UPDATE pt SET<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_actual</i><br />
     * WHERE part_id = <i>wrpt.part_id</i> </div>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Updated work request
     * 
     */
    public void updateInventory(final EventHandlerContext context, final int wr_id) {
        
        final String[] wrptFieldNames =
                { "part_id", "qty_estimated", "status", "qty_actual", "date_assigned",
                        "time_assigned", "wr_id", "debited" };
        
        final String sqlRestriction =
                "wr.wr_id = wrpt.wr_id AND wrpt.debited != 1 AND wr.wr_id = " + wr_id;
        
        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addTable("wr", DataSource.ROLE_STANDARD).addField("wrpt", wrptFieldNames)
                    .addField("wr", "wr_id").addRestriction(Restrictions.sql(sqlRestriction));
        
        final String[] ptFieldNames = { "qty_on_hand", "qty_on_reserve", "part_id" };
        final DataSource ptDs =
                DataSourceFactory.createDataSource().addTable("pt", DataSource.ROLE_MAIN)
                    .addField("pt", ptFieldNames);
        
        final List<DataRecord> listRecords = wrptDs.getAllRecords();
        
        if (listRecords != null && !listRecords.isEmpty()) {
            for (final DataRecord dataRecord : listRecords) {
                final String status = dataRecord.getString("wrpt.status");
                final String partId = dataRecord.getString("wrpt.part_id");
                
                final double qty_estimated = dataRecord.getDouble("wrpt.qty_estimated");
                final double qty_actual = dataRecord.getDouble("wrpt.qty_actual");
                
                ptDs.clearRestrictions();
                ptDs.addRestriction(Restrictions.eq("pt", "part_id", partId));
                
                final DataRecord ptDataRecord = ptDs.getRecord();
                
                final double qty_on_reserve = ptDataRecord.getDouble("pt.qty_on_reserve");
                final double qty_on_hand = ptDataRecord.getDouble("pt.qty_on_hand");
                
                if ("R".equals(status)) {
                    ptDataRecord.setValue("pt.qty_on_reserve", qty_on_reserve - qty_estimated);
                    ptDataRecord.setValue("pt.qty_on_hand", qty_on_hand - qty_actual
                            + qty_estimated);
                } else {
                    ptDataRecord.setValue("pt.qty_on_hand", qty_on_hand - qty_actual);
                }
                
                ptDs.updateRecord(ptDataRecord);
                ptDs.commit();
                
                dataRecord.setValue("wrpt.status", "C");
                dataRecord.setValue("wrpt.debited", 1);
                wrptDs.updateRecord(dataRecord);
            }
            
            wrptDs.commit();
        }
    }
    
    /**
     * Update inventory after cancel action excude
     * 
     * @param context
     * @param wr_id
     */
    private void updateInventoryAfterCancel(final EventHandlerContext context, final int wr_id) {
        
        final String[] fieldNames =
                { "part_id", "qty_estimated", "status", "date_assigned", "time_assigned", "wr_id" };
        final DataSource wrptDs =
                DataSourceFactory.createDataSource().addTable("wrpt", DataSource.ROLE_MAIN)
                    .addField("wrpt", fieldNames)
                    .addRestriction(Restrictions.eq("wrpt", "wr_id", wr_id));
        
        final String[] ptFieldNames = { "qty_on_hand", "qty_on_reserve", "part_id" };
        final DataSource ptDs =
                DataSourceFactory.createDataSource().addTable("pt", DataSource.ROLE_MAIN)
                    .addField("pt", ptFieldNames);
        
        final List<DataRecord> listRecords = wrptDs.getAllRecords();
        
        for (final DataRecord dataRecord : listRecords) {
            
            final String status = notNull(dataRecord.getString("wrpt.status"));
            final String partId = notNull(dataRecord.getString("wrpt.part_id"));
            final double qtyEstimated = dataRecord.getDouble("wrpt.qty_estimated");
            
            if (status.equals("R") && qtyEstimated != 0.0) {// put reserved
                ptDs.clearRestrictions();
                ptDs.addRestriction(Restrictions.eq("pt", "part_id", partId));
                
                final DataRecord ptDataRecord = ptDs.getRecord();
                
                final double qtyOnHand = ptDataRecord.getDouble("pt.qty_on_hand");
                final double qtyOnReserve = ptDataRecord.getDouble("pt.qty_on_reserve");
                
                ptDataRecord.setValue("pt.qty_on_hand", qtyOnHand + qtyEstimated);
                ptDataRecord.setValue("pt.qty_on_reserve", qtyOnReserve - qtyEstimated);
                
                ptDs.updateRecord(ptDataRecord);
                ptDs.commit();
            }
            
            dataRecord.setValue("wrpt.status", "C");
            wrptDs.updateRecord(dataRecord);
        }
        wrptDs.commit();
    }
    
    /**
     * 
     * for the KB#3026552, REMOVE code that adjusts part inventory from the Supervisor / Update Work
     * Orders and Work Requests / Resources tab. The part's Quantity Availalbe and Quantity on
     * Reserve should only be adjusted on the Work Order Close process..
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wrpt</code> for parts which are not yet reserved for the given
     * work request</li>
     * <li>If enough parts are in stock, update the inventory and set the status in
     * <code>wrpt</code> to 'R' (Reserved)</li>
     * <li>Else set the status in <code>wrpt</code> to 'NI' (Not in stock)
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Select reservation records from wrpt <div> SELECT
     * wrpt.part_id,wrpt.qty_estimated,wrpt.status,wrpt.date_assigned,wrpt.time_assigned,wrpt.wr_id<br />
     * FROM wrpt, wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wr.wr_id = ? <br />
     * AND wrpt.qty_estimated > 0 AND wrpt.status <> 'R' </div> Update inventory if parts are in
     * stock <div> UPDATE pt SET<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_estimated</i>,<br />
     * qty_on_reserve = qty_on_reserve + <i>wrpt.qty_estimated</i><br />
     * WHERE part_id = ? </div> <div>UPDATE wrpt SET status='R' WHERE part_id =?</div> Update
     * reservation if parts are not in stock <div>UPDATE wrpt SET status='NI' WHERE part_id =?</div>
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param Map partEstimation
     * @param int difference
     */
    private void updateInventoryAfterEstimationWithoutPt(final EventHandlerContext context,
            final Map partEstimation, final int difference) {
        final int wr_id = getIntegerValue(context, partEstimation.get("wr_id")).intValue();
        final Date date_assigned = getDateValue(context, partEstimation.get("date_assigned"));
        final Time time_assigned = getTimeValue(context, partEstimation.get("time_assigned"));
        final String part_id = notNull(partEstimation.get("part_id"));
        
        final String[] fields =
                new String[] { "part_id", "qty_estimated", "status", "date_assigned",
                        "time_assigned", "wr_id" };
        final StringBuffer sql = new StringBuffer();
        sql.append("wr_id = " + wr_id + " AND part_id = " + literal(context, part_id));
        sql.append(" AND date_assigned = "
                + formatSqlFieldValue(context, date_assigned, "java.sql.Date", "date_assigned"));
        sql.append(" AND time_assigned = "
                + formatSqlFieldValue(context, time_assigned, "java.sql.Time", "time_assigned"));
        
        final Object[] record = selectDbValues(context, "wrpt", fields, sql.toString());
        
        final Object[] part_record =
                selectDbValues(context, "pt", new String[] { "qty_on_hand", "qty_on_reserve" },
                    "part_id=" + literal(context, part_id));
        final int parts_on_hand = getIntegerValue(context, part_record[0]).intValue();
        getIntegerValue(context, part_record[1]).intValue();
        
        if (record != null) {
            final Map values = new HashMap();
            for (int i = 0; i < fields.length; i++) {
                if (fields[i].startsWith("time")) {
                    values.put(fields[i], getTimeValue(context, record[i]));
                } else if (fields[i].startsWith("date")) {
                    values.put(fields[i], getDateValue(context, record[i]));
                } else if (fields[i].equals("wr_id")) {
                    values.put(fields[i], getIntegerValue(context, record[i]));
                } else {
                    values.put(fields[i], record[i]);
                }
            }
            final int qty_estimated =
                    getIntegerValue(context, values.get("qty_estimated")).intValue();
            values.remove("qty_estimated");// preventing class cast errors when
            // saving
            final String status = notNull(values.get("status")).trim();
            
            if (difference == 0) { // new estimation
                if (qty_estimated <= parts_on_hand) {
                    // update parts inventory
                    
                    values.put("status", "R");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    executeDbCommit(context);
                } else {
                    values.put("status", "NI");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    executeDbCommit(context);
                }
            } else if (difference < 0) {// less parts estimated then before
                if (status.equals("NI")) {
                    if (qty_estimated <= parts_on_hand) {
                        
                        values.put("status", "R");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        executeDbCommit(context);
                    } // else leave status in NI
                } else if (status.equals("R")) {// put difference back in stock
                
                }
            } else if (difference > 0) {
                if (status.equals("R")) {
                    if (parts_on_hand < difference) {// not enough in stock
                        // anymore, put reserved
                        // stuff back
                        values.put("status", "NI");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        executeDbCommit(context);
                    } else {
                    }
                }// status = NI => nothing to change
            }
        }
    }
    
    /**
     * 
     * Update parts inventory after the estimation of a work request.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wrpt</code> for parts which are not yet reserved for the given
     * work request</li>
     * <li>If enough parts are in stock, update the inventory and set the status in
     * <code>wrpt</code> to 'R' (Reserved)</li>
     * <li>Else set the status in <code>wrpt</code> to 'NI' (Not in stock)
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> Select reservation records from wrpt <div> SELECT
     * wrpt.part_id,wrpt.qty_estimated,wrpt.status,wrpt.date_assigned,wrpt.time_assigned,wrpt.wr_id<br />
     * FROM wrpt, wr<br />
     * WHERE wr.wr_id = wrpt.wr_id AND wr.wr_id = ? <br />
     * AND wrpt.qty_estimated > 0 AND wrpt.status <> 'R' </div> Update inventory if parts are in
     * stock <div> UPDATE pt SET<br />
     * qty_on_hand = qty_on_hand - <i>wrpt.qty_estimated</i>,<br />
     * qty_on_reserve = qty_on_reserve + <i>wrpt.qty_estimated</i><br />
     * WHERE part_id = ? </div> <div>UPDATE wrpt SET status='R' WHERE part_id =?</div> Update
     * reservation if parts are not in stock <div>UPDATE wrpt SET status='NI' WHERE part_id =?</div>
     * </p>
     * 
     * @param context Workflow rule execution context
     * @param Map partEstimation
     * @param int difference
     */
    private void updateInventoryAfterEstimation(final EventHandlerContext context,
            final Map partEstimation, final int difference) {
        final int wr_id = getIntegerValue(context, partEstimation.get("wr_id")).intValue();
        final Date date_assigned = getDateValue(context, partEstimation.get("date_assigned"));
        final Time time_assigned = getTimeValue(context, partEstimation.get("time_assigned"));
        final String part_id = notNull(partEstimation.get("part_id"));
        
        final String[] fields =
                new String[] { "part_id", "qty_estimated", "status", "date_assigned",
                        "time_assigned", "wr_id" };
        final StringBuffer sql = new StringBuffer();
        sql.append("wr_id = " + wr_id + " AND part_id = " + literal(context, part_id));
        sql.append(" AND date_assigned = "
                + formatSqlFieldValue(context, date_assigned, "java.sql.Date", "date_assigned"));
        sql.append(" AND time_assigned = "
                + formatSqlFieldValue(context, time_assigned, "java.sql.Time", "time_assigned"));
        
        final Object[] record = selectDbValues(context, "wrpt", fields, sql.toString());
        
        final Object[] part_record =
                selectDbValues(context, "pt", new String[] { "qty_on_hand", "qty_on_reserve" },
                    "part_id=" + literal(context, part_id));
        final int parts_on_hand = getIntegerValue(context, part_record[0]).intValue();
        final int parts_on_reserve = getIntegerValue(context, part_record[1]).intValue();
        
        if (record != null) {
            final Map values = new HashMap();
            for (int i = 0; i < fields.length; i++) {
                if (fields[i].startsWith("time")) {
                    values.put(fields[i], getTimeValue(context, record[i]));
                } else if (fields[i].startsWith("date")) {
                    values.put(fields[i], getDateValue(context, record[i]));
                } else if (fields[i].equals("wr_id")) {
                    values.put(fields[i], getIntegerValue(context, record[i]));
                } else {
                    values.put(fields[i], record[i]);
                }
            }
            final int qty_estimated =
                    getIntegerValue(context, values.get("qty_estimated")).intValue();
            values.remove("qty_estimated");// preventing class cast errors when
            // saving
            final String status = notNull(values.get("status")).trim();
            
            if (difference == 0) { // new estimation
                if (qty_estimated <= parts_on_hand) {
                    // update parts inventory
                    final Map pt_values = new HashMap();
                    pt_values.put("part_id", part_id);
                    pt_values.put("qty_on_hand", new Double(parts_on_hand - qty_estimated));
                    pt_values.put("qty_on_reserve", new Double(parts_on_reserve + qty_estimated));
                    executeDbSave(context, "pt", pt_values);
                    
                    values.put("status", "R");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    executeDbCommit(context);
                } else {
                    values.put("status", "NI");
                    executeDbSave(context, "wrpt", stripPrefix(values));
                    executeDbCommit(context);
                }
            } else if (difference < 0) {// less parts estimated then before
                if (status.equals("NI")) {
                    if (qty_estimated <= parts_on_hand) {
                        // update parts inventory
                        final Map pt_values = new HashMap();
                        pt_values.put("part_id", part_id);
                        pt_values.put("qty_on_hand", new Double(parts_on_hand - qty_estimated));
                        pt_values.put("qty_on_reserve",
                            new Double(parts_on_reserve + qty_estimated));
                        executeDbSave(context, "pt", pt_values);
                        
                        values.put("status", "R");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        executeDbCommit(context);
                    } // else leave status in NI
                } else if (status.equals("R")) {// put difference back in stock
                    final Map pt_values = new HashMap();
                    pt_values.put("part_id", part_id);
                    pt_values.put("qty_on_hand", new Double(parts_on_hand - difference));
                    pt_values.put("qty_on_reserve", new Double(parts_on_reserve + difference));
                    executeDbSave(context, "pt", pt_values);
                    // Guo changed 2009-01-15 for KB3021405
                    executeDbCommit(context);
                }
            } else if (difference > 0) {
                if (status.equals("R")) {
                    if (parts_on_hand < difference) {// not enough in stock
                        // anymore, put reserved
                        // stuff back
                        final Map pt_values = new HashMap();
                        pt_values.put("part_id", part_id);
                        pt_values.put("qty_on_hand", new Double(parts_on_hand + qty_estimated
                                - difference));
                        pt_values.put("qty_on_reserve", new Double(parts_on_reserve - qty_estimated
                                + difference));
                        executeDbSave(context, "pt", pt_values);
                        
                        values.put("status", "NI");
                        executeDbSave(context, "wrpt", stripPrefix(values));
                        executeDbCommit(context);
                    } else {
                        final Map pt_values = new HashMap();
                        pt_values.put("part_id", part_id);
                        pt_values.put("qty_on_hand", new Double(parts_on_hand - difference));
                        pt_values.put("qty_on_reserve", new Double(parts_on_reserve + difference));
                        executeDbSave(context, "pt", pt_values);
                        // Guo changed 2009-01-15 for KB3021405
                        executeDbCommit(context);
                    }
                }// status = NI => nothing to change
            }
        }
    }
    
    /**
     * 
     * Check if new tool assignments conflict with existing.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create SQL query to check if existing assignment records overlap with the new one</li>
     * <li>Execute SQL query</li>
     * <li>Return result</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>SELECT wr_id, tool_id <br />
     * FROM wrtl <br />
     * WHERE tool_id = ?<br />
     * AND (( <i>startDateTime</i> BETWEEN date_start + time_start AND date_end + time_end)<br />
     * OR (<i>endDateTime</i> BETWEEN date_start + time_start AND date_end + time_end)<br />
     * OR (<i>startDateTime</i> < date_start + time_start AND <i>endDateTime</i> > date_end +
     * time_end)<br />
     * );</div>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param tool_id Tool code to check assigment for
     * @param date_start Start date of new assignment
     * @param time_start Start time of new assignment
     * @param date_end End date of new assignment
     * @param time_end End time of new assignment
     * @param int wr_id
     * @return Conflict or not
     */
    private boolean checkReservationConflicts(final EventHandlerContext context,
            final String tool_id, final Date date_start, final Time time_start,
            final Date date_end, final Time time_end, final int wr_id) {
        final StringBuffer where = new StringBuffer("tool_id = " + literal(context, tool_id));
        if (isOracle(context)) {
            final String dateTimeStart =
                    "TO_DATE ( TO_CHAR(date_start, 'YYYY/MM/DD') || ' ' || TO_CHAR(time_start, 'HH24:MI') , 'YYYY/MM/DD HH24:MI')";
            final String dateTimeEnd =
                    "TO_DATE ( TO_CHAR(date_end, 'YYYY/MM/DD') || ' ' || TO_CHAR(time_end, 'HH24:MI') , 'YYYY/MM/DD HH24:MI'  )";
            where.append(" AND (("
                    + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                    + " between " + dateTimeStart + " AND " + dateTimeEnd + ")" + " OR ("
                    + formatSqlDateTime(context, date_end.toString(), time_end.toString())
                    + " between " + dateTimeStart + " AND " + dateTimeEnd + ")" + " OR ("
                    + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                    + " < " + dateTimeStart + " AND "
                    + formatSqlDateTime(context, date_end.toString(), time_end.toString()) + " > "
                    + dateTimeEnd + "))");
        } else {
            where.append(" AND (("
                    + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                    + " between date_start + time_start AND date_end + time_end)" + " OR ("
                    + formatSqlDateTime(context, date_end.toString(), time_end.toString())
                    + " between date_start + time_start and date_end + time_end)" + " OR ("
                    + formatSqlDateTime(context, date_start.toString(), time_start.toString())
                    + "< date_start + time_start AND "
                    + formatSqlDateTime(context, date_end.toString(), time_end.toString())
                    + " > date_end+time_end))");
        }
        
        where.append(" AND wr_id<>" + wr_id);
        
        final List records =
                selectDbRecords(context, "wrtl", new String[] { "wr_id", "tool_id" },
                    where.toString());
        return !records.isEmpty();
    }
    
    /**
     * 
     * Save tool assignment for a work request.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONObject with boolean (true if new assignment conflicts with existing)
     * <br />
     * {conflict : <i>true or false</i>}</li>
     * <li>message : Error message for conflicting assignments</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save tool assigment</li>
     * <li>{@link #checkReservationConflicts(EventHandlerContext, String, Date, Time, Date, Time)
     * Check for conflicts}</li>
     * <li>If no conflicts: Update actual, estimated and total costs for this tool assignment</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateToolType(EventHandlerContext, int, String)
     * Update hours and costs for tool type}</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtl SET<br />
     * cost_estimated = hours_est * (SELECT ISNULL(rate_hourly,0) FROM tt WHERE tool_type = (SELECT
     * tool_type FROM tl where tool_id = ?))<br />
     * WHERE tool_id = ? AND wr_id = ? AND date_assigned = ? AND time_assigned = ?;</div> <div>
     * UPDATE wrtl SET<br />
     * hours_total = hours_over + hours_straight, <br />
     * cost_over = hours_over * (SELECT ISNULL(rate_over,0) FROM tt WHERE tool_type = (SELECT
     * tool_type from tl WHERE tool_id = ?)),<br />
     * cost_straight = hours_straight * (SELECT ISNULL(rate_hourly,0) FROM tt WHERE tool_type =
     * (SELECT tool_type FROM tl WHERE tool_id = ?))<br />
     * WHERE tool_id = ? AND wr_id = ? AND date_assigned = ? AND time_assigned = ?; </div>
     * <div>UPDATE wrtl SET<br />
     * cost_total = cost_over + cost_straight,<br />
     * hours_diff = hours_total - hours_est,<br />
     * WHERE tool_id = ? AND wr_id = ? AND date_assigned = ? AND time_assigned = ?; </div>
     * </p>
     * <p>
     * 
     * @param JSONObject fields
     *            </p>
     * 
     */
    public void saveWorkRequestTool(final JSONObject fields) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        Map values = parseJSONObject(context, fields);
        values = stripPrefix(values);
        final JSONObject conflict = new JSONObject();
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        
        if (!values.containsKey("date_assigned")) {
            final Map<String, String> map =
                    Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
            values.put(
                "date_assigned",
                LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                    map.get("blId")));
            values.put(
                "time_assigned",
                LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                    map.get("blId")));
        }
        
        // executeDbAdd(context, "wrtl", values);
        executeDbSave(context, "wrtl", values);
        executeDbCommit(context);
        
        // normally estimated time is submitted not end time
        if (values.get("date_start") != null && values.get("time_start") != null
                && values.get("hours_est") != null) {
            final java.sql.Date startDate = getDateValue(context, values.get("date_start"));
            final java.sql.Time startTime = getTimeValue(context, values.get("time_start"));
            final Double estimatedTime = (Double) values.get("hours_est");
            
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wr_id);
            final ServiceWindow serv_window = sla.getServiceWindow();
            
            final Map endDateTime =
                    serv_window.calculateEscalationDate(startDate, startTime,
                        estimatedTime.intValue(), "h");
            if (endDateTime != null) {
                final Date endDate = (Date) endDateTime.get("date");
                final Time endTime = (Time) endDateTime.get("time");
                values.put("date_end", endDate);
                values.put("time_end", endTime);
                
                executeDbSave(context, "wrtl", values);
                executeDbCommit(context);
                
                final String tool_id = notNull(values.get("tool_id"));
                
                if (checkReservationConflicts(context, tool_id, startDate, startTime, endDate,
                    endTime, wr_id)) {
                    
                    // remove if it has conflicts.
                    // fix KB3031078 - Update Help Desk WFRs to use DataSource API instead of
                    // executeDbDelete(Guo 2011/4/18)
                    final DataSource dataSource = DataRecord.createDataSourceForRecord(fields);
                    final Map record = fromJSONObject(fields);
                    dataSource.deleteRecord(record);
                    // EventHandlerBase.executeDbDelete(context, "wrtl", values);
                    // executeDbCommit(context);
                    
                    context.addResponseParameter("message",
                        "Tool Assignment overlaps with other assigment(s) for this tool");
                    conflict.put("conflict", true);
                    context.addResponseParameter("jsonExpression", conflict.toString());
                    return;
                }
            }
        }
        
        final String tool_id = notNull(values.get("tool_id"));
        
        final String date =
                formatSqlFieldValue(context, values.get("date_assigned"), "java.sql.Date",
                    "date_assigned");
        final String time =
                formatSqlFieldValue(context, values.get("time_assigned"), "java.sql.Time",
                    "time_assigned");
        
        // update estimated costs
        final String sql =
                "UPDATE wrtl SET" + " cost_estimated = hours_est * (SELECT "
                        + formatSqlIsNull(context, "rate_hourly,0") + " FROM tt WHERE tool_type = "
                        + " (SELECT tool_type FROM tl where tool_id = " + literal(context, tool_id)
                        + ") )" + " WHERE tool_id = " + literal(context, tool_id) + " AND wr_id = "
                        + wr_id + " AND date_assigned = " + date + " AND time_assigned = " + time;
        
        // update hours + costs over/straight
        final String sql_ =
                "UPDATE wrtl SET" + " hours_total = hours_over + hours_straight"
                        + " , cost_over = hours_over * (SELECT "
                        + formatSqlIsNull(context, "rate_over,0") + " FROM tt WHERE tool_type = "
                        + " (SELECT tool_type from tl WHERE tool_id = " + literal(context, tool_id)
                        + ") )" + " , cost_straight = hours_straight * (SELECT "
                        + formatSqlIsNull(context, "rate_hourly,0") + " FROM tt WHERE tool_type = "
                        + " (SELECT tool_type FROM tl WHERE tool_id = " + literal(context, tool_id)
                        + ") )" + " WHERE tool_id = " + literal(context, tool_id) + " AND wr_id = "
                        + wr_id + " AND date_assigned = " + date + " AND time_assigned = " + time;
        
        // update total costs,diff hours
        final String sql_total =
                "UPDATE wrtl SET" + " cost_total = cost_over + cost_straight"
                        + " , hours_diff = hours_total - hours_est" + " WHERE tool_id = "
                        + literal(context, tool_id) + " AND wr_id = " + wr_id
                        + " AND date_assigned = " + date + " AND time_assigned = " + time;
        
        final Vector commands = new Vector();
        commands.add(sql);
        commands.add(sql_);
        commands.add(sql_total);
        
        executeDbSqlCommands(context, commands, true);
        executeDbCommit(context);
        
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
        
        // update wrtt
        final String tool_type =
                notNull(selectDbValue(context, "tl", "tool_type",
                    "tool_id = " + literal(context, tool_id)));
        recalculateToolType(context, wr_id, tool_type);
        
        conflict.put("conflict", false);
        context.addResponseParameter("jsonExpression", conflict.toString());
    }
    
    /**
     * 
     * Update hours and costs for tool type (after new tool assignment).
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update hours and costs for tool type in <code>wrtt</code></li>
     * <li>Select minimal start date/time and maximal end date/time for tool assignments of this
     * tool type</li>
     * <li>Update start and end date/time for given tooltype in <code>wrtt</code></li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtt SET <br />
     * hours_sched = (SELECT ISNULL(SUM(hours_est),0) FROM wrtl WHERE wr_id = ? AND tool_id IN
     * (SELECT tool_id FROM tl WHERE tool_type = ?)),<br />
     * hours_straight = (SELECT ISNULL(SUM(hours_straight),0) FROM wrtl WHERE wr_id = ? AND tool_id
     * IN (SELECT tool_id FROM tl WHERE tool_type = ?)),<br />
     * hours_over = (SELECT ISNULL(SUM(hours_over),0) FROM wrtl WHERE wr_id = ? AND tool_id IN
     * (SELECT tool_id FROM tl WHERE tool_type = ? )),<br />
     * cost_straight = (SELECT ISNULL(SUM(cost_straight),0) FROM wrtl WHERE wr_id = ? AND tool_id IN
     * (SELECT tool_id FROM tl WHERE tool_type = ?)),<br />
     * cost_over = (SELECT ISNULL(SUM(cost_over),0) FROM wrtl WHERE wr_id = ? AND tool_id IN (SELECT
     * tool_id FROM tl WHERE tool_type = ?)) <br />
     * WHERE wr_id = ? AND tool_type = ?; </div>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     * @param tool_type Tool type
     *            </p>
     */
    private void recalculateToolType(final EventHandlerContext context, final int wr_id,
            final String tool_type) {
        final String from =
                " FROM wrtl WHERE wr_id = " + wr_id
                        + " AND tool_id IN (SELECT tool_id FROM tl WHERE tool_type = "
                        + literal(context, tool_type) + ")";
        
        /*
         * String startSql = "SELECT date_start, time_start FROM wrtl WHERE wr_id = " + wr_id + "
         * AND tool_id IN (select tool_id from tl where tool_type = " + literal(context, tool_type)
         * + ")" + " ORDER BY date_start ASC, time_start ASC ";
         * 
         * String endSql = "SELECT date_end, time_end FROM wrtl WHERE wr_id = " + wr_id + " AND
         * tool_id IN (select tool_id from tl where tool_type = " + literal(context, tool_type) +
         * ")" + " ORDER BY date_end DESC, time_end DESC ";
         */
        final String updateSql =
                "UPDATE wrtt SET " + " hours_sched = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_est),0") + from +
                        /*
                         * "), hours_straight = (SELECT "+
                         * formatSqlIsNull(context,"SUM(hours_straight),0") + from +
                         * "), hours_over = (SELECT "+ formatSqlIsNull(context,"SUM(hours_over),0")
                         * + from + "), cost_straight = (SELECT "+
                         * formatSqlIsNull(context,"SUM(cost_straight),0") + from +
                         * "), cost_over = (SELECT "+ formatSqlIsNull(context,"SUM(cost_over),0") +
                         * from +
                         */
                        ") WHERE wr_id = " + wr_id + " AND tool_type = "
                        + literal(context, tool_type);
        
        executeDbSql(context, updateSql, false);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
        
        /*
         * List startRecs = selectDbRecords(context, startSql); List endRecs =
         * selectDbRecords(context, endSql);
         * 
         * if (!startRecs.isEmpty() && !endRecs.isEmpty() && startRecs.get(0) != null &&
         * endRecs.get(0) != null) { Object[] start = (Object[]) startRecs.get(0); Object[] end =
         * (Object[]) endRecs.get(0);
         * 
         * String date_start = start[0] != null ? formatSqlFieldValue(context,
         * getDateValue(context,start[0]), "java.sql.Date", "date_start") : "NULL"; String
         * time_start = start[1] != null ? formatSqlFieldValue(context,
         * getTimeValue(context,start[1]), "java.sql.Time", "time_start") : "NULL";
         * 
         * String date_end = end[0] != null ? formatSqlFieldValue(context,
         * getDateValue(context,end[0]), "java.sql.Date", "date_end") : "NULL"; String time_end =
         * end[1] != null ? formatSqlFieldValue(context, getTimeValue(context,end[1]),
         * "java.sql.Time", "time_end") : "NULL";
         * 
         * String updateDatesSql = "UPDATE wrtt SET " + " date_start = " + date_start +
         * ", date_end = " + date_end + ", time_start = " + time_start + ", time_end = " + time_end
         * + " WHERE wr_id = " + wr_id + " AND tool_type = " + literal(context, tool_type);
         * 
         * executeDbSql(context, updateDatesSql, false); }
         */
    }
    
    /**
     * 
     * Save other resource assigment for a work request.
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save record in <code>wr_other</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record
     *            </p>
     * @throws DocumentException
     */
    public void saveOtherCosts(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        Map values = parseJSONObject(context, record);
        values = stripPrefix(values);
        executeDbSave(context, "wr_other", values);
        executeDbCommit(context);
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
    }
    
    /**
     * 
     * Save a trade for a work request estimation.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save record in <code>wrtr</code></li>
     * <li>Update estimated costs in <code>wrtr</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONObject record
     *            </p>
     * 
     */
    public void saveWorkRequestTrade(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldsValue = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldsValue);
        
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        
        final String tr_id = notNull(values.get("tr_id"));
        final Double rate_hourly =
                (Double) selectDbValue(context, "tr", "rate_hourly",
                    "tr_id = " + literal(context, tr_id));
        if (rate_hourly != null && values.get("hours_est") != null) {
            final Double hours_est = (Double) values.get("hours_est");
            final Double cost_est = new Double(hours_est.doubleValue() * rate_hourly.doubleValue());
            values.put("cost_estimated", cost_est);
            
            final Map<String, String> mapSiteAndBlId =
                    Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
            
            final String siteId = mapSiteAndBlId.get("siteId");
            final String blId = mapSiteAndBlId.get("blId");
            
            final Date currentLocalDate =
                    LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
            final Time currentLocalTime =
                    LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
            
            values.put("date_assigned", currentLocalDate);
            values.put("time_assigned", currentLocalTime);
            
            executeDbSave(context, "wrtr", values);
            executeDbCommit(context);
        }
        recalculateCosts(context, wr_id);
        recalculateEstCosts(context, wr_id);
    }
    
    /**
     * 
     * Save a tooltype for a work request (estimation).
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>Save record in <code>wrtt</code></li>
     * <li>Update estimated costs in <code>wrtt</code></li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#recalculateCosts(EventHandlerContext, int)
     * Update costs for work request}</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wrtt SET<br />
     * cost_estimated = hours_est * (SELECT ISNULL(rate_hourly,0) FROM tt WHERE tool_type = ?)<br />
     * WHERE tool_type = ? AND wr_id = ?; </div>
     * </p>
     * <p>
     * 
     * @param JSONObject record
     *            </p>
     * 
     */
    public void saveWorkRequestToolType(final JSONObject record) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldsValue = parseJSONObject(context, record);
        final Map values = stripPrefix(fieldsValue);
        
        final int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
        
        final Map<String, String> mapSiteAndBlId =
                Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
        
        final String siteId = mapSiteAndBlId.get("siteId");
        final String blId = mapSiteAndBlId.get("blId");
        
        final Date currentLocalDate =
                LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
        final Time currentLocalTime =
                LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
        
        values.put("date_assigned", currentLocalDate);
        values.put("time_assigned", currentLocalTime);
        
        executeDbSave(context, "wrtt", values);
        executeDbCommit(context);
        
        final String tt = notNull(values.get("tool_type"));
        
        final String sql =
                "UPDATE wrtt SET " + " cost_estimated = hours_est * (SELECT "
                        + formatSqlIsNull(context, "rate_hourly,0") + " FROM tt WHERE tool_type = "
                        + literal(context, tt) + ")" + " WHERE tool_type = " + literal(context, tt)
                        + " AND wr_id = " + wr_id;
        
        executeDbSql(context, sql, true);
        // Guo changed 2009-01-15 for KB3021405
        executeDbCommit(context);
        recalculateEstCosts(context, wr_id);
        recalculateCosts(context, wr_id);
    }
    
    /**
     * 
     * Get a list of all trades in <code>tr</code>. This function is used to create a selection list
     * with all trades in the dispatch form.
     * 
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray of JSONObjects with a trade code<br />
     * <code>[{tr_id : ?}]</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select all trades from <code>tr</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * </p>
     */
    public void getTrades() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray results = new JSONArray();
        final List records = selectDbRecords(context, "SELECT tr_id FROM tr ORDER BY tr_id");
        
        JSONObject trade = new JSONObject();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String tr_id = notNull(record[0]);
                
                trade = new JSONObject();
                trade.put("tr_id", tr_id);
                results.put(trade);
            }
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Get tooltypes assigned to a work request.<br/>
     * This eventhandler is used to create a selection list of tooltypes for a tool assignment for
     * the given work request.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : work request to get tooltypes for</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray of JSONObjects with a tooltype<br />
     * <code>[{tool_type : ?}]</code></li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wr_id from context</li>
     * <li>Select all tool types for given work request (from <code>wrtt</code>)</li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String wr_id1
     *            </p>
     */
    public void getToolTypesForWorkRequest(final String wr_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray results = new JSONArray();
        final int wr_id = Integer.parseInt(wr_id1);
        
        final String[] fieldNames = { "tool_type" };
        
        final List records = selectDbRecords(context, "wrtt", fieldNames, "wr_id = " + wr_id);
        JSONObject json = new JSONObject();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String toolType = notNull(record[0]);
                
                json = new JSONObject();
                json.put("tool_type", toolType);
                results.put(json);
            }
        }
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Get trades assigned to a work request.<br/>
     * This eventhandler is used to create a selection list of trades for a craftsperson assignment
     * for the given work request.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>wr_id : work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray of JSONObjects with trade<br />
     * [{tr_id : ?}]</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get wr_id from context</li>
     * <li>Get trades assigned to work request in <code>wrtr</code>/li>
     * <li>Get primary trade from work request in <code>wr</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param String wrId
     *            </p>
     */
    public void getTradesForWorkRequest(final String wrId) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JSONArray results = new JSONArray();
        final int wr_id = Integer.parseInt(wrId);
        final String[] fieldNames = { "tr_id" };
        
        final List records = selectDbRecords(context, "wrtr", fieldNames, "wr_id = " + wr_id);
        JSONObject trade = new JSONObject();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] record = (Object[]) it.next();
                final String trid = notNull(record[0]);
                
                trade = new JSONObject();
                trade.put("tr_id", trid);
                results.put(trade);
            }
        } else {
            // primary trade assigned to work request?
            final String pr_tr = notNull(selectDbValue(context, "wr", "tr_id", "wr_id = " + wr_id));
            trade = new JSONObject();
            trade.put("tr_id", pr_tr);
            results.put(trade);
        }
        
        context.addResponseParameter("jsonExpression", results.toString());
    }
    
    /**
     * 
     * Complete work request(s).<br />
     * A supervisor or craftsperson can set the status of multiple work requests of the same work
     * order at once to completed.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray of JSONObjects with work request data</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>tableName : wr</li>
     * <li>fieldName : wr_id</li>
     * <li>wr.wr_id : code of completed work request</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get records from context</li>
     * <li>Update context (set wr.wr_id)</li>
     * <li>Update work request status to Com with the
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager statusmanager}</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#checkWorkorder(EventHandlerContext, String, int)
     * Check if workorder should be updated}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONArray records
     *            </p>
     */
    public void setComplete(final JSONArray records) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (records.length() > 0) {
            int wr_id = 0;
            for (int i = 0; i < records.length(); i++) {
                final JSONObject record = records.getJSONObject(i);
                
                Map values = parseJSONObject(context, record);
                values = stripPrefix(values);
                
                wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
                final String status = Common.getStatusValue(context, "wr", "wr_id", wr_id);
                if (status.equals("Can") || status.equals("S") || status.equals("Rej")
                        || status.equals("Clo")) {
                    return;
                }
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
                statusManager.updateStatus("Com");
                
                values = new HashMap();
                values.put("wr_id", new Integer(wr_id));
                values.put("completed_by",
                    getParentContextAttributeXPath(context, "/*/preferences/@em_em_id"));
                executeDbSave(context, "wr", values);
                executeDbCommit(context);
                
                // change to fix KB3030018
                checkWorkorder(context, "Com", wr_id);
                // TODO: to preserve compatibility with work wizard auto-archive
                // is checked when
                // completing work requests
                /*
                 * boolean autoArchive = false; if(getActivityParameterInt(context,
                 * Constants.ONDEMAND_ACTIVITY_ID, "AUTO_ARCHIVE") != null) autoArchive =
                 * getActivityParameterInt(context, Constants.ONDEMAND_ACTIVITY_ID,
                 * "AUTO_ARCHIVE").intValue() > 0;
                 * 
                 * //archive work order + work requests if (autoArchive) archiveWorkRequest(context,
                 * wr_id);
                 */
                
            }
        }
    }
    
    /**
     * 
     * Notify a supervisor when a request is assigned to him.<br />
     * The subjects and bodies to use for the emails are put in the <code>messages</code> table with
     * activity_id AbBldgOpsOnDemandWork and referenced_by
     * "NOTIFY_SUPERVISOR_"+status.toUpperCase()+"_WFR"
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log.activity_log_id : (if status = 'A') help request code</li>
     * <li>wr.wr_id : (for other statuses) work request code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>If status = 'A' (Approved) get supervisor and send email</li>
     * <li>Else send email (content depends on status)</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param status Status of request
     * @param tableName
     * @param int pkeyValue
     *        </p>
     */
    public void notifySupervisor(final EventHandlerContext context, final String status,
            final String tableName, final int pkeyValue) {
        final Message message = new Message(context);
        message.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
        
        // KB 3023429 - also send a message (with different content) to the supervisor's
        // substitute(s) (EC 2012/7/10)
        final Message messageForSubstitute = new Message(context);
        messageForSubstitute.setActivityId(Constants.ONDEMAND_ACTIVITY_ID);
        
        if (tableName.equals("activity_log")) { // approved request should be reviewed
            final String link =
                    getWebCentralPath(context)
                            + "/"
                            + getActivityParameterString(context, "AbBldgOpsOnDemandWork",
                                "REVIEW_VIEW");
            
            message.setReferencedBy("NOTIFY_SUPERVISOR_APPROVED_WFR");
            message.setBodyMessageId("NOTIFY_SUPERVISOR_APPROVED_TEXT");
            message.setSubjectMessageId("NOTIFY_SUPERVISOR_APPROVED_TITLE");
            
            messageForSubstitute.setReferencedBy("NOTIFY_SUPERVISOR_SUBSTITUTE_APPROVED_WFR");
            messageForSubstitute.setBodyMessageId("NOTIFY_SUPERVISOR_APPROVED_TEXT");
            messageForSubstitute.setSubjectMessageId("NOTIFY_SUPERVISOR_APPROVED_TITLE");
            
            final Map<String, Object> datamodel =
                    MessageHelper.getRequestDatamodel(context, "activity_log", "activity_log_id",
                        pkeyValue);
            datamodel.put("link", link);
            
            if (messageForSubstitute.isBodyRichFormatted()
                    || messageForSubstitute.isSubjectRichFormatted()) {
                messageForSubstitute.setDataModel(datamodel);
            }
            if (!messageForSubstitute.isBodyRichFormatted()) {
                messageForSubstitute.setBodyArguments(new Object[] { link });
            }
            messageForSubstitute.format();
            
            if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                message.setDataModel(datamodel);
            }
            if (!message.isBodyRichFormatted()) {// only original body contained {?} parameters
                message.setBodyArguments(new Object[] { link });
            }
            message.format();
            
            sendMailToSupervisors(context, tableName, "activity_log_id", pkeyValue, message,
                messageForSubstitute);
            
        } else {
            final StringBuffer link = new StringBuffer(getWebCentralPath(context) + "/");
            message.setReferencedBy("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_WFR");
            message.setBodyMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_TEXT");
            message.setSubjectMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase() + "_TITLE");
            
            // KB 3023429 - also send a message (with different content) to the supervisor's
            // substitute(s) (EC 2012/7/10)
            messageForSubstitute.setReferencedBy("NOTIFY_SUPERVISOR_SUBSTITUTE_"
                    + status.toUpperCase() + "_WFR");
            messageForSubstitute.setBodyMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase()
                    + "_TEXT");
            messageForSubstitute.setSubjectMessageId("NOTIFY_SUPERVISOR_" + status.toUpperCase()
                    + "_TITLE");
            Object[] args = new Object[] { link };
            if (status.equals("A")) {// approved (autocreated) work requests should be assigned to a
                                     // work order
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "ASSIGN_VIEW"));
            } else if (status.equals("AA")) { // new WR's should be managed
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "MANAGE_VIEW"));
                args = new Object[] { pkeyValue, link };
            } else if (status.equals("Sch")) { // scheduled WR's should be
                // Issued
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "ISSUE_VIEW"));
                args = new Object[] { pkeyValue, link };
            } else if (status.equals("I")) { // issued WR's should be
                // updated
                link.append(getActivityParameterString(context, Constants.ONDEMAND_ACTIVITY_ID,
                    "UPDATE_VIEW"));
                args = new Object[] { pkeyValue, link };
            }
            
            final Map datamodel =
                    MessageHelper.getRequestDatamodel(context, tableName, tableName + "_id",
                        pkeyValue);
            datamodel.put("link", link.toString());
            
            if (message.isBodyRichFormatted() || message.isSubjectRichFormatted()) {
                message.setDataModel(datamodel);
            }
            
            if (!message.isBodyRichFormatted()) {
                message.setBodyArguments(args);
            }
            
            message.format();
            
            messageForSubstitute.setDataModel(datamodel);
            if (!messageForSubstitute.isBodyRichFormatted()) {
                messageForSubstitute.setBodyArguments(args);
            }
            messageForSubstitute.format();
            
            sendMailToSupervisors(context, tableName, tableName + "_id", pkeyValue, message,
                messageForSubstitute);
        }
    }
    
    /**
     * Send mail to supervisors.
     * 
     * @param context
     * @param tableName
     * @param fieldName
     * @param pkeyValue
     * @param message
     * @param messageForSubstitute - Message to be sent to the substitute(s) of the supervisor(s)
     */
    public void sendMailToSupervisors(final EventHandlerContext context, final String tableName,
            final String fieldName, final int pkeyValue, final Message message,
            final Message messageForSubstitute) {
        
        String supervisor = null;
        String workTeam = null;
        String manager = null;
        
        if (tableName.equals("wo")) {
            final Object[] tmp =
                    selectDbValues(context, tableName,
                        new String[] { "supervisor", "work_team_id" }, fieldName + "=" + pkeyValue);
            
            supervisor = notNull(tmp[0]);
            workTeam = notNull(tmp[1]);
        } else {
            final Object[] tmp =
                    selectDbValues(context, tableName, new String[] { "supervisor", "work_team_id",
                            "manager" }, fieldName + "=" + pkeyValue);
            supervisor = notNull(tmp[0]);
            workTeam = notNull(tmp[1]);
            manager = notNull(tmp[2]);
        }
        
        if (StringUtil.notNullOrEmpty(supervisor)) {
            final String email =
                    notNull(selectDbValue(context, "em", "email",
                        "em_id = " + literal(context, supervisor)));
            if (StringUtil.notNullOrEmpty(email)) {
                message.setMailTo(email);
                message.setNameto(supervisor);
                message.sendMessage();
                
                // KB 3023429 - also send a message (with different content) to the supervisor's
                // substitute(s) (EC 2012/7/10)
                if (messageForSubstitute != null) {
                    final List<String> substitutes =
                            StepHandler.getWorkflowEmSubstitutes(context, supervisor, "supervisor");
                    if (!substitutes.isEmpty()) {
                        for (final String substitute : substitutes) {
                            messageForSubstitute.getDataModel().put("supervisor", supervisor);
                            messageForSubstitute.setMailTo(getEmailAddress(context, substitute));
                            messageForSubstitute.setNameto(substitute);
                            messageForSubstitute.sendMessage();
                        }
                    }
                }
                
            } else {
                if (StringUtil.notNullOrEmpty(manager)) {
                    message.setReferencedBy("NOTIFY_SUPERVISOR_WFR");
                    message.setSubjectMessageId("NOTIFY_MGR_TITLE");
                    message.setBodyMessageId("NOTIFY_MGR_TEXT");
                    
                    // message should already contain datamodel for rich formatting,
                    // only arguments for old-formatted body should be changed
                    if (!message.isBodyRichFormatted()) {
                        message.setBodyArguments(new Object[] { supervisor,
                                message.getDataModel().get("link") });
                    }
                    message.format();
                    
                    message.setNameto(manager);
                    message.setMailTo(getEmailAddress(context, manager));
                    message.sendMessage();
                }
            }
        } else if (StringUtil.notNullOrEmpty(workTeam)) {
            final List supers =
                    selectDbRecords(context, "em", new String[] { "email", "em_id" },
                        "email IN (SELECT email FROM cf WHERE is_supervisor = 1 AND work_team_id = "
                                + literal(context, workTeam) + ")");
            for (final Iterator it = supers.iterator(); it.hasNext();) {
                final Object[] tmp2 = (Object[]) it.next();
                final String name = notNull(tmp2[1]);
                final String email = notNull(tmp2[0]);
                if (StringUtil.notNullOrEmpty(email)) {
                    message.setMailTo(email);
                    message.setNameto(notNull(tmp2[1]));
                    message.sendMessage();
                }
                
                // KB 3023429 - also send a message (with different content) to the supervisor's
                // substitute(s) (EC 2012/7/10)
                if (messageForSubstitute != null) {
                    final List<String> substitutes =
                            StepHandler.getWorkflowEmSubstitutes(context, name, "supervisor");
                    if (!substitutes.isEmpty()) {
                        for (final String substitute : substitutes) {
                            messageForSubstitute.getDataModel().put("supervisor", name);
                            messageForSubstitute.setMailTo(getEmailAddress(context, substitute));
                            messageForSubstitute.setNameto(substitute);
                            messageForSubstitute.sendMessage();
                        }
                    }
                }
            }
        } else {
            final boolean isDefaultSLA = (Boolean) context.getParameter("isDefaultSLA");
            
            if (!isDefaultSLA) {
                // @translatable
                final String errorMessage =
                        localizeString(context, "No supervisor or work team to notify");
                throw new ExceptionBase(errorMessage, true);
            }
        }
    }
    
    /**
     * 
     * Update costs for a work request.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update (labor/parts/tools/other) costs for work request</li>
     * <li>Update total costs for work request</li>
     * <li>Update all costs for workorder the work request is assigned to</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wr SET<br />
     * cost_labor = (SELECT ISNULL(SUM(cost_total),0) FROM wrcf WHERE wr_id = ?),<br />
     * cost_other = (SELECT ISNULL(SUM(cost_total),0) FROM wr_other WHERE wr_id ?),<br />
     * cost_parts = (SELECT ISNULL(SUM(cost_actual),0) FROM wrpt WHERE wr_id = ?),<br />
     * cost_tools = (SELECT ISNULL(SUM(cost_total),0) FROM wrtl WHERE wr_id = ?)<br />
     * WHERE wr_id = ? </div> <div>UPDATE wr SET <br />
     * cost_total = cost_labor + cost_other + cost_parts + cost_tools<br />
     * WHERE wr_id = ?;</div> <div>UPDATE wo SET <br />
     * cost_labor = (SELECT ISNULL(SUM(cost_labor),0) FROM wr WHERE wo_id = ?),<br />
     * cost_tools = (SELECT ISNULL(SUM(cost_tools),0)FROM wr WHERE wo_id = ?),<br />
     * cost_parts = (SELECT ISNULL(SUM(cost_parts),0)FROM wr WHERE wo_id = ?),<br />
     * cost_other = (SELECT ISNULL(SUM(cost_other),0)FROM wr WHERE wo_id = ?),<br />
     * cost_total = (SELECT ISNULL(SUM(cost_total),0)FROM wr WHERE wo_id = ?)<br />
     * WHERE wo_id = " + wo_id; </div>
     * </p>
     * <p>
     * Switched from private to public to support the Mobile Application - C. Kriezis
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     *            </p>
     */
    public void recalculateCosts(final EventHandlerContext context, final int wr_id) {
        final String sql =
                "UPDATE wr SET " + " est_labor_hours = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_est),0")
                        + " FROM wrcf WHERE wr_id = " + wr_id + ")"
                        + " , act_labor_hours = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_total),0")
                        + " FROM wrcf WHERE wr_id = " + wr_id + ")" + " , cost_labor = (SELECT "
                        + formatSqlIsNull(context, "SUM(cost_total),0")
                        + " FROM wrcf WHERE wr_id = " + wr_id + ")" + " , cost_other = (SELECT "
                        + formatSqlIsNull(context, "SUM(cost_total),0")
                        + " FROM wr_other WHERE wr_id = " + wr_id + ")"
                        + " , cost_parts = (SELECT "
                        + formatSqlIsNull(context, "SUM(cost_actual),0")
                        + " FROM wrpt WHERE wr_id = " + wr_id + ")" + " , cost_tools = (SELECT "
                        + formatSqlIsNull(context, "SUM(cost_total),0")
                        + " FROM wrtl WHERE wr_id = " + wr_id + ")" + " WHERE wr_id = " + wr_id;
        
        executeDbSql(context, sql, true);
        
        final String sql_ =
                "UPDATE wr SET " + "cost_total = cost_labor + cost_other + cost_parts + cost_tools"
                        + " WHERE wr_id = " + wr_id;
        executeDbSql(context, sql_, true);
        
        // update work order costs
        final Integer wo_id =
                getIntegerValue(context, selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id));
        if (wo_id != null) {
            recalculateWorkOrderCosts(context, wo_id.intValue());
        }
        
        final String update =
                "UPDATE activity_log SET " + " cost_actual = (SELECT "
                        + formatSqlIsNull(context, "cost_total,0") + " FROM wr WHERE wr_id = "
                        + wr_id + ")," + " hours_actual = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_total),0")
                        + " FROM wrcf WHERE wr_id =" + wr_id + ")"
                        + " WHERE activity_log_id = (SELECT activity_log_id FROM wr WHERE wr_id = "
                        + wr_id + ")";
        executeDbSql(context, update, false);
        executeDbCommit(context);
    }
    
    /**
     * 
     * Update work order costs.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update actual costs for work order</li>
     * <li>Update estimated costs for work order</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> UPDATE wo SET <br />
     * cost_labor = (SELECT ISNULL(SUM(cost_labor),0) FROM wr WHERE wo_id = ?),<br />
     * cost_tools = (SELECT ISNULL(SUM(cost_tools),0) FROM wr WHERE wo_id = ?),<br />
     * cost_parts = (SELECT ISNULL(SUM(cost_parts),0) FROM wr WHERE wo_id = ?),<br />
     * cost_other = (SELECT ISNULL(SUM(cost_other),0) FROM wr WHERE wo_id = ?),<br />
     * cost_total = (SELECT ISNULL(SUM(cost_total),0) FROM wr WHERE wo_id = ?)<br />
     * WHERE wo_id = ?;</div> <div>UPDATE wo SET <br />
     * cost_estimated = (SELECT ISNULL(SUM(cost_est_total),0)* FROM wr WHERE wo_id = ?)<br />
     * WHERE wo_id = ?; </div>
     * </p>
     * <p>
     * 
     * bv: refactoring spltting a complex query in simple select and update queries to improve
     * performance.
     * 
     * @param context Workflow rule execution context
     * @param wo_id Work order code
     *            </p>
     */
    private void recalculateWorkOrderCosts(final EventHandlerContext context, final int wo_id) {
        
        // actual costs only for wr that are not rejected or cancelled.
        final String select =
                "SELECT " + formatSqlIsNull(context, "SUM(cost_labor),0") + " as cost_labor, "
                        + formatSqlIsNull(context, "SUM(cost_tools),0") + " as cost_tools, "
                        + formatSqlIsNull(context, "SUM(cost_parts),0") + " as cost_parts, "
                        + formatSqlIsNull(context, "SUM(cost_other),0") + " as cost_other, "
                        + formatSqlIsNull(context, "SUM(cost_total),0") + " as cost_total "
                        + " FROM wr WHERE status NOT IN ('Rej','Can') AND wo_id = " + wo_id;
        
        final List totals = selectDbRecords(context, select);
        
        // estimation cost for all wr, also rejected and cancelled
        final String select2 =
                "SELECT " + formatSqlIsNull(context, "SUM(cost_est_total),0")
                        + "FROM wr WHERE wo_id = " + wo_id;
        final List estimation = selectDbRecords(context, select2);
        
        // actual hours and estimation hours both ????
        // TODO: check status for estimation hours
        final String select3 =
                "SELECT " + formatSqlIsNull(context, "SUM(wrcf.hours_est),0") + " as hours_est, "
                        + formatSqlIsNull(context, "SUM(wrcf.hours_total),0") + " as hours_total "
                        + " FROM wrcf LEFT OUTER JOIN wr on wrcf.wr_id = wr.wr_id "
                        + " WHERE wr.status NOT IN ('Rej','Can') AND wr.wo_id = " + wo_id;
        
        final List hours = selectDbRecords(context, select3);
        
        if (!totals.isEmpty()) {
            final Object[] values = (Object[]) totals.get(0);
            final Object[] values2 = (Object[]) estimation.get(0);
            
            final String sql =
                    "UPDATE wo SET cost_labor = " + values[0] + ", cost_tools = " + values[1]
                            + ", cost_parts = " + values[2] + ", cost_other = " + values[3]
                            + ", cost_total = " + values[4] + ", cost_estimated = " + values2[0]
                            + " WHERE wo_id = " + wo_id;
            executeDbSql(context, sql, false);
            // Guo changed 2009-01-15 for KB3021405
            executeDbCommit(context);
            if (!hours.isEmpty()) {
                final Object[] values3 = (Object[]) hours.get(0);
                
                final String update =
                        "UPDATE activity_log SET cost_estimated = " + values2[0]
                                + ", cost_actual = " + values[3] + ", hours_est_baseline = "
                                + values3[0] + ", hours_actual = " + values3[1]
                                + " WHERE activity_log.wo_id = " + wo_id;
                
                executeDbSql(context, update, false);
                executeDbCommit(context);
            }
            
            // KB3023582 edit by Weijie on 20090722
            final String updateActualCost =
                    " update activity_log set cost_actual = " + values[4]
                            + " where  activity_log.wo_id = " + wo_id;
            executeDbSql(context, updateActualCost, false);
            executeDbCommit(context);
        }
        
        /*
         * String sql = "UPDATE wo SET " + "cost_labor = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_labor),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_tools = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_tools),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_parts = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_parts),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_other = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_other),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))," + "cost_total = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_total),0") + " FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN
         * ('Rej','Can'))" + "WHERE wo_id = " + wo_id; executeDbSql(context, sql, false);
         */
        
        /*
         * String sql = "UPDATE wo SET cost_estimated = (SELECT " + formatSqlIsNull(context,
         * "SUM(cost_est_total),0") + "FROM wr WHERE wo_id = " + wo_id + ") WHERE wo_id = " + wo_id;
         * executeDbSql(context, sql, false);
         */
        
        // update costs for help request
        /*
         * String update = "UPDATE activity_log SET " + "cost_estimated = (SELECT " +
         * formatSqlIsNull(context, "cost_estimated,0") + " FROM wo WHERE wo.wo_id = " + wo_id +
         * ")," + " cost_actual = (SELECT " + formatSqlIsNull(context, "cost_total,0") + " FROM wo
         * WHERE wo.wo_id = " + wo_id + ")," + " hours_est_baseline = (SELECT " +
         * formatSqlIsNull(context, "SUM(hours_est),0") + " FROM wrcf WHERE wr_id IN (SELECT wr_id
         * FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN ('Rej','Can')))," + " hours_actual
         * = (SELECT " + formatSqlIsNull(context, "SUM(hours_total),0") + " FROM wrcf WHERE wr_id IN
         * (SELECT wr_id FROM wr WHERE wo_id = " + wo_id + " AND status NOT IN ('Rej','Can')))" + "
         * WHERE activity_log.wo_id = " + wo_id;
         */
        
    }
    
    /**
     * 
     * Recalculate estimated costs for a work request.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Update (labor/parts/tools/other) estimated costs</li>
     * <li>Update total estimated costs</li>
     * <li>Update estimated costs of the work order the work request is attached to</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div>UPDATE wr SET <br />
     * cost_est_labor = (SELECT ISNULL(SUM(cost_estimated),0") FROM wrtr WHERE wr_id = ?)<br />
     * cost_est_other = (SELECT ISNULL(SUM(cost_estimated),0") FROM wr_other WHERE wr_id = ?)<br />
     * cost_est_parts = (SELECT ISNULL(SUM(cost_estimated),0") FROM wrpt WHERE wr_id = ?)<br />
     * cost_est_tools = (SELECT ISNULL(SUM(cost_estimated),0") FROM wrtt WHERE wr_id = ?)<br />
     * WHERE wr_id = ?;</div> <div>UPDATE wr SET<br />
     * cost_est_total = cost_est_labor + cost_est_other + cost_est_parts + cost_est_tools<br />
     * WHERE wr_id = ?</div> <div>UPDATE wo SET<br />
     * cost_estimated = (SELECT ISNULL(SUM(cost_est_total),0) FROM wr WHERE wo_id = ?)</div>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     *            </p>
     */
    protected void recalculateEstCosts(final EventHandlerContext context, final int wr_id) {
        
        final List cfList =
                selectDbRecords(context, "select wr_id from wrcf where wr_id = " + wr_id);
        
        String sql;
        // KB3023929
        if (cfList != null && cfList.size() > 0) {
            
            sql =
                    "UPDATE wr SET " + " est_labor_hours = (SELECT "
                            + formatSqlIsNull(context, "SUM(hours_est),0")
                            + " FROM wrcf WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_labor = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wrcf WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_other = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wr_other WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_parts = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wrpt WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_tools = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wrtt WHERE wr_id = " + wr_id + ")" + " WHERE wr_id = " + wr_id;
            
        } else {
            
            sql =
                    "UPDATE wr SET " + " est_labor_hours = (SELECT "
                            + formatSqlIsNull(context, "SUM(hours_est),0")
                            + " FROM wrtr WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_labor = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wrtr WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_other = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wr_other WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_parts = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wrpt WHERE wr_id = " + wr_id + ")"
                            + " , cost_est_tools = (SELECT "
                            + formatSqlIsNull(context, "SUM(cost_estimated),0")
                            + " FROM wrtt WHERE wr_id = " + wr_id + ")" + " WHERE wr_id = " + wr_id;
        }
        
        executeDbSql(context, sql, true);
        
        final String sql_ =
                "UPDATE wr SET"
                        + " cost_est_total = cost_est_labor + cost_est_other + cost_est_parts + cost_est_tools"
                        + " WHERE wr_id = " + wr_id;
        executeDbSql(context, sql_, true);
        
        final Integer wo_id =
                getIntegerValue(context, selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id));
        if (wo_id != null) {
            recalculateWorkOrderCosts(context, wo_id.intValue());
        }
        
        final String update =
                "UPDATE activity_log SET " + " cost_estimated = (SELECT "
                        + formatSqlIsNull(context, "cost_est_total,0") + " FROM wr WHERE wr_id = "
                        + wr_id + ")," + " hours_est_baseline = (SELECT "
                        + formatSqlIsNull(context, "SUM(hours_est),0")
                        + " FROM wrcf WHERE wr_id = " + wr_id + ")"
                        + " WHERE activity_log_id = (SELECT activity_log_id FROM wr WHERE wr_id = "
                        + wr_id + ")";
        executeDbSql(context, update, false);
        executeDbCommit(context);
    }
    
    /**
     * 
     * Create work order with work request from help request.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select building, description, supervisor and trade of given help request</li>
     * <li>Create new work order record with selected data</li>
     * <li>{@link #createWorkRequestFromActionItem(EventHandlerContext, int, boolean) Create new
     * work request based on given help request}</li>
     * <li>{@link #assignWorkRequestToWorkorder(EventHandlerContext, int, int) Assign new work
     * request to new work order}</li>
     * <li>Return new work request code</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param activity_log_id help request code
     * @return new work request code
     *         </p>
     */
    public int createWorkOrderFromActionItem(final EventHandlerContext context,
            final int activity_log_id) {
        final String[] fields =
                { "bl_id", "description", "supervisor", "tr_id", "work_team_id", "site_id" };
        final Object[] record =
                selectDbValues(context, Constants.ACTION_ITEM_TABLE, fields, "activity_log_id ="
                        + activity_log_id);
        
        final String blId = notNull(record[0]);
        final String siteId = notNull(record[5]);
        // create new Work Order
        final Map values = new HashMap();
        values.put("bl_id", blId);
        values.put("description", notNull(record[1]));
        if (StringUtil.notNullOrEmpty(record[2])) {
            values.put("supervisor", notNull(record[2]));
        }
        values.put("tr_id", notNull(record[3]));
        values.put("name_of_contact", notNull(record[2]));
        values.put("work_team_id", notNull(record[4]));
        
        // add local time, timezone issue.
        values.put("date_created",
            LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId));
        values.put("time_created",
            LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId));
        
        executeDbAdd(context, "wo", values);
        executeDbCommit(context); // always commit when added
        
        final int wo_id =
                Common.getMaxId(context, "wo", "wo_id", getRestrictionFromValues(context, values));
        
        // put wo_id in help request
        final Map act_values = new HashMap();
        act_values.put("activity_log_id", new Integer(activity_log_id));
        act_values.put("wo_id", new Integer(wo_id));
        executeDbSave(context, Constants.ACTION_ITEM_TABLE, act_values);
        executeDbCommit(context);
        
        final int wr_id = createWorkRequestFromActionItem(context, activity_log_id, false);
        assignWorkRequestToWorkorder(context, wr_id, wo_id);
        
        checkWorkorder(context, null, wr_id);
        // create new WR attached to this WO
        return wr_id;
    }
    
    /**
     * 
     * Create work request from help request.
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>fields : form values submitted</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create a new work request record with data from help request</li>
     * <li>Set supervisor on current user</li>
     * <li>Use the status manager to
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * update the work request status} to the status of the help request</li>
     * <li>Link to work request to the help request if linkToWr is true (set wr_id in the
     * <code>activity_log</code> table)
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @param linkToWr Link help request to work request or not
     * @return new work request code
     *         </p>
     */
    public int createWorkRequestFromActionItem(final EventHandlerContext context,
            final int activity_log_id, final boolean linkToWr) {
        // fix KB3029735, to aviod create duplicate work request
        int wr_id = findWrIdFromActionItem(context, activity_log_id);
        
        if (wr_id == 0) {
            final String[] fields =
                    { "activity_log_id", "requestor", "phone_requestor", "site_id", "bl_id",
                            "fl_id", "rm_id", "dv_id", "dp_id", "ac_id", "location", "eq_id",
                            "prob_type", "priority", "description", "date_requested",
                            "date_scheduled", "manager", "supervisor", "dispatcher", "status",
                            "work_team_id", "date_escalation_completion",
                            "time_escalation_completion", "date_escalation_response",
                            "time_escalation_response", "escalated_response",
                            "escalated_completion" };
            final Object[] activity_log_values =
                    selectDbValues(context, Constants.ACTION_ITEM_TABLE, fields,
                        "activity_log_id = " + activity_log_id);
            
            final Map wr_values = new HashMap();
            wr_values.put("activity_log_id", new Integer(activity_log_id));
            
            for (int j = 1; j < fields.length; j++) {
                if (fields[j].equals("phone_requestor")) {
                    wr_values.put("phone", activity_log_values[j]);
                } else if ("date_scheduled".equals(fields[j])) {
                    wr_values.put("date_assigned", activity_log_values[j]);
                } else {
                    wr_values.put(fields[j], activity_log_values[j]);
                }
            }
            
            // add Local Time
            wr_values.put(
                "date_requested",
                LocalDateTimeStore.get().currentLocalDate(null, null,
                    notNull(activity_log_values[3]), notNull(activity_log_values[4])));
            // add Local Time
            wr_values.put(
                "time_requested",
                LocalDateTimeStore.get().currentLocalTime(null, null,
                    notNull(activity_log_values[3]), notNull(activity_log_values[4])));
            
            // update Work Request from SLA
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "activity_log", "activity_log_id",
                        activity_log_id);
            final ServiceWindow serviceWindow = sla.getServiceWindow();
            if (serviceWindow != null) {
                wr_values.put("serv_window_days", serviceWindow.getServiceWindowDaysAsString());
                wr_values.put("serv_window_start", serviceWindow.getServiceWindowStartTime());
                wr_values.put("serv_window_end", serviceWindow.getServiceWindowEndTime());
                wr_values.put("allow_work_on_holidays",
                    serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
            }
            
            final String status =
                    StatusConverter.getWorkRequestStatus(notNull(wr_values.get("status")));
            
            wr_values.put("status", "R"); // set default status Requested
            // if (wr_values.get("supervisor") == null) {
            // wr_values.put("supervisor",
            // getParentContextAttributeXPath(context,"/*/preferences/@em_em_id"));
            // }
            
            // save the work request
            executeDbAdd(context, "wr", wr_values);
            executeDbCommit(context); // always commit when added
            
            wr_id =
                    Common.getMaxId(context, "wr", "wr_id",
                        getRestrictionFromValues(context, wr_values));
            
            final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
            statusManager.updateStatus(status);
            
            final Map values = new HashMap();
            if (linkToWr) {
                values.put("wr_id", new Integer(wr_id));
                values.put("activity_log_id", new Integer(activity_log_id));
                
                // update the help request
                executeDbSave(context, Constants.ACTION_ITEM_TABLE, values);
                executeDbCommit(context);
            }
            
            // not issued
            createDefaultEstimationAndScheduling(context, wr_id, sla);
            
            this.copyDocumentsFromServiceRequestToWr(context, activity_log_id, wr_id);
        }
        
        return wr_id;
    }
    
    /**
     * 
     * copy documents from Service request to Work request. the method will be called in the method
     * createWorkRequestFromActionItem()
     * 
     * 
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @param wr_id Work Request Id </p>
     */
    private void copyDocumentsFromServiceRequestToWr(final EventHandlerContext context,
            final int activity_log_id, final int wr_id) {
        
        if (!(wr_id > 0 && activity_log_id > 0)) {
            return;
        }
        
        final Vector sqlCommands = new Vector();
        // create the work reqeust from detail tab (grid list)
        if (context.parameterExists("documents")) {
            final JSONArray documents = context.getJSONArray("documents");
            
            // if documents to copy only one Service Request is submitted
            if (documents != null && documents.length() > 0) {
                for (int i = 0; i < documents.length(); i++) {
                    final String doc_field = documents.getString(i);
                    this.generateSqlsForCopyDocuments(sqlCommands, doc_field, activity_log_id,
                        wr_id);
                } // end for
            }
        } else {
            final String[] fields = { "doc1", "doc2", "doc3", "doc4" };
            final Object[] activity_log_values =
                    selectDbValues(context, Constants.ACTION_ITEM_TABLE, fields,
                        "activity_log_id = " + activity_log_id);
            
            for (int j = 0; j < fields.length; j++) {
                final String docName = (String) activity_log_values[j];
                // the doc is valid.
                if (docName != null && docName.length() > 1) {
                    final String doc_field = fields[j];
                    this.generateSqlsForCopyDocuments(sqlCommands, doc_field, activity_log_id,
                        wr_id);
                }
            }
        }
        
        if (sqlCommands.size() > 0) {
            executeDbSqlCommands(context, sqlCommands, true);
            // Guo changed 2009-01-15 for KB3021405
            executeDbCommit(context);
        }
    }
    
    /**
     * generate sqls for copying the documents from Service Request to Work Request.
     * 
     * @param sqlCommands
     * @param doc_field
     * @param activity_log_id
     * @param wr_id
     */
    private void generateSqlsForCopyDocuments(final Vector sqlCommands, final String doc_field,
            final int activity_log_id, final int wr_id) {
        
        sqlCommands
            .add("INSERT INTO afm_docs (table_name, field_name, pkey_value, locked, locked_by, lock_date, lock_time, description, deleted) "
                    + " SELECT 'wr', '"
                    + doc_field
                    + "', "
                    + wr_id
                    + ", locked, locked_by, lock_date, lock_time, description, deleted FROM afm_docs "
                    + " WHERE table_name = 'activity_log' AND field_name = '"
                    + doc_field
                    + "' AND pkey_value = " + activity_log_id);
        
        sqlCommands
            .add("INSERT INTO afm_docvers (table_name, field_name, pkey_value, version, file_contents, doc_file, doc_size, comments, checkin_date, checkin_time) "
                    + " SELECT 'wr', '"
                    + doc_field
                    + "', "
                    + wr_id
                    + ",  version, file_contents, doc_file, doc_size, comments, checkin_date, checkin_time FROM afm_docvers "
                    + " WHERE table_name = 'activity_log' AND field_name = '"
                    + doc_field
                    + "' AND pkey_value = "
                    + activity_log_id
                    + " AND version = "
                    + " (select max(version) from afm_docvers where table_name = 'activity_log' AND field_name = '"
                    + doc_field + "' AND pkey_value = " + activity_log_id + " )");
        
        sqlCommands.add("UPDATE wr SET " + doc_field + " = (SELECT " + doc_field
                + " FROM activity_log  WHERE activity_log_id = " + activity_log_id
                + ") WHERE wr_id = " + wr_id);
    }
    
    /**
     * 
     * Assign work request to work order (eventhandler).
     * 
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>records : JSONArray of JSONObjects with a work request</li>
     * <li>wo_id : Work order code</li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get inputs from context</li>
     * <li>
     * {@link com.archibus.eventhandler.ondemandwork.WorkRequestHandler#assignWorkRequestToWorkorder(EventHandlerContext, int, int)
     * Assign work requests to workorder}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param JSONArray records
     * @param String woId
     *            </p>
     */
    public void assignWrToWo(final JSONArray records, final String woId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final int wo_id = Integer.parseInt(woId);
        
        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                final JSONObject rec = records.getJSONObject(i);
                final int wr_id = rec.getInt("wr.wr_id");
                assignWorkRequestToWorkorder(context, wr_id, wo_id);
            }
        }
    }
    
    /**
     * 
     * Assign work request to work order (helper).
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Save work request record (with wo_id)</li>
     * <li>Update context (work request code and SLA)</li>
     * <li>Update work request status to AA with the
     * {@link com.archibus.eventhandler.ondemandwork.OnDemandWorkStatusManager#updateStatus(String)
     * statusmanager}</li>
     * </ol>
     * </p>
     * <p>
     * 
     * @param context Workflow rule execution context
     * @param wr_id Work request code
     * @param wo_id Work order code
     *            </p>
     */
    private void assignWorkRequestToWorkorder(final EventHandlerContext context, final int wr_id,
            final int wo_id) {
        final Map values = new HashMap();
        values.put("wr_id", new Integer(wr_id));
        values.put("wo_id", new Integer(wo_id));
        
        executeDbSave(context, "wr", values);
        executeDbCommit(context);
        
        final StatusManager statusManager = new OnDemandWorkStatusManager(context, wr_id);
        statusManager.updateStatus("AA");
        
        recalculateWorkOrderCosts(context, wo_id);
        checkWorkorder(context, "AA", wr_id);
        
        // add to fix KB3027975(When assigning a work request to a work order, transfer account code
        // of work order to work request)
        updateAcIdOfWr(wr_id);
    }
    
    /**
     * update account code of work request according the linked work order's account when wr.ac_id
     * is null
     * 
     * @param wr_id ID of work request
     */
    private void updateAcIdOfWr(final int wr_id) {
        final String updateSql =
                "UPDATE wr SET wr.ac_id = (SELECT wo.ac_id FROM wo WHERE wo.wo_id = wr.wo_id) WHERE wr.ac_id IS NULL AND wr.wr_id = "
                        + wr_id;
        SqlUtils.executeUpdate("wr", updateSql);
        SqlUtils.commit();
    }
    
    /**
     * Confirm step using {@link com.archibus.eventhandler.steps.StepManager step manager}
     * 
     * @param context Workflow rule execution context
     * @param wr_id ID of work request to confirm
     * @param comments confirmation comments
     * @param stepLogId Step log id of step to confirm
     */
    private void confirmStep(final EventHandlerContext context, final int wr_id,
            final int stepLogId, final String comments) {
        final StepManager stepmgr = new OnDemandWorkStepManager(context, wr_id);
        stepmgr.confirmStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }
    
    /**
     * Reject step using {@link com.archibus.eventhandler.steps.StepManager step manager}
     * 
     * @param context Workflow rule execution context
     * @param wr_id ID of work request to confirm
     * @param comments confirmation comments
     * @param stepLogId Step log id of step to confirm
     */
    private void rejectStep(final EventHandlerContext context, final int wr_id,
            final int stepLogId, final String comments) {
        final StepManager stepmgr = new OnDemandWorkStepManager(context, wr_id);
        stepmgr.rejectStep(stepLogId, comments,
            getParentContextAttributeXPath(context, "/*/preferences/@user_name"));
    }
    
    /**
     * 
     * Get work request similar to a given help request.
     * <p>
     * Retrieve open work requests with the same problem type, location and equipment of the given
     * help request
     * </p>
     * 
     * <p>
     * <b>Inputs:</b>
     * <ul>
     * <li>activity_log_id : Help request id</li>
     * </ul>
     * </p>
     * <p>
     * <b>Outputs:</b>
     * <ul>
     * <li>jsonExpression : JSONArray with JSONObjects for work request records<br />
     * <code>[{wr.wr_id : ?, wr.prob_type : ?, wr.bl_id : ?, wr.fl_id : ?, wr.rm_id : ?, wr.eq_id : ?, wr.status : ?, wr.description : ?}]</code>
     * </li>
     * </ul>
     * </p>
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select records from <code>wr</code></li>
     * <li>Create and return jsonExpression</li>
     * </ol>
     * </p>
     * 
     * @param String activity_log_id1
     */
    public void getSimilarWorkRequests(final String activity_log_id1) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter("activity_log_id", activity_log_id1);
        final int activity_log_id = context.getInt("activity_log_id");
        final Object[] record =
                selectDbValues(context, "activity_log", new String[] { "prob_type", "bl_id",
                        "fl_id", "rm_id", "eq_id" }, "activity_log_id = " + activity_log_id);
        
        final String[] fields =
                new String[] { "wr_id", "prob_type", "bl_id", "fl_id", "rm_id", "eq_id", "status",
                        "description" };
        final StringBuffer where =
                new StringBuffer("prob_type= " + literal(context, notNull(record[0])));
        if (record[1] != null) {
            where.append(" AND bl_id = " + literal(context, notNull(record[1])));
        }
        if (record[2] != null) {
            where.append(" AND fl_id = " + literal(context, notNull(record[2])));
        }
        if (record[3] != null) {
            where.append(" AND rm_id = " + literal(context, notNull(record[3])));
        }
        if (record[4] != null) {
            where.append(" AND eq_id = " + literal(context, notNull(record[4])));
        }
        where.append(" AND status IN ('A','AA','I') ");
        final List records = selectDbRecords(context, "wr", fields, where.toString());
        final JSONArray json = new JSONArray();
        if (!records.isEmpty()) {
            for (final Iterator it = records.iterator(); it.hasNext();) {
                final Object[] rec = (Object[]) it.next();
                final JSONObject object = new JSONObject();
                for (int i = 0; i < fields.length; i++) {
                    if (fields[i].equals("status")) {
                        object.put("wr." + fields[i],
                            getEnumFieldDisplayedValue(context, "wr", "status", (String) rec[i]));
                    } else {
                        object.put("wr." + fields[i], rec[i]);
                    }
                    
                }
                json.put(object);
            }
        }
        context.addResponseParameter("jsonExpression", json.toString());
    }
    
    /**
     * Create Estimation (wrtr) and Schedule (wrcf) record when auto-schedule
     * 
     * This works conform the planning board scheduling.
     * 
     * @param context
     * @param wr_id
     * @param sla
     * @param issue
     */
    private void createDefaultEstimationAndScheduling(final EventHandlerContext context,
            final int wr_id, final ServiceLevelAgreement sla) {
        // first check if SLA requires auto-schedule
        if (sla.getCraftsperson() != null
                && sla.getResponseIntegerParameter("default_duration") != null) {
            final String cf_id = sla.getCraftsperson();
            
            final List records =
                    selectDbRecords(context, "wrcf", new String[] { "date_assigned",
                            "time_assigned" },
                        "wr_id = " + wr_id + " AND cf_id = " + literal(context, cf_id));
            
            // if already scheduled we don't change anything in wrcf
            if (records.isEmpty()) {
                
                final double default_duration =
                        sla.getResponseIntegerParameter("default_duration").doubleValue();
                // get the trade from the craftsperson
                final Object[] cf_values =
                        selectDbValues(context, "cf", new String[] { "tr_id", "std_hours_avail",
                                "rate_hourly" }, "cf_id = " + literal(context, cf_id));
                final String tr_id = notNull(cf_values[0]);
                // get the trade rate for estimation
                final Object tr_value =
                        selectDbValue(context, "tr", "rate_hourly",
                            "tr_id = " + literal(context, tr_id));
                final double trade_rate_hourly = ((Double) tr_value).doubleValue();
                
                final double std_hours_avail = ((Double) cf_values[1]).doubleValue(); // standardHours
                // for
                // this craftsperson
                final double rate_hourly = ((Double) cf_values[2]).doubleValue();
                
                final ServiceWindow serviceWindow = sla.getServiceWindow();
                
                final Map<String, String> map =
                        Common.getSiteBuildingIds("wr", "wr_id", String.valueOf(wr_id));
                
                final Date currrentLocalDate =
                        LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                            map.get("blId"));
                final Time currrentLocalTime =
                        LocalDateTimeStore.get().currentLocalTime(null, null, map.get("siteId"),
                            map.get("blId"));
                
                Date startDate =
                        LocalDateTimeStore.get().currentLocalDate(null, null, map.get("siteId"),
                            map.get("blId"));
                
                final Time startTime = serviceWindow.getServiceWindowStartTime();
                
                final long milliseconds =
                        serviceWindow.getServiceWindowEndTime().getTime()
                                - serviceWindow.getServiceWindowStartTime().getTime();
                final double serviceWindowHours = (milliseconds * 1.0) / (60 * 60 * 1000);
                double hoursToScheduleForDay = serviceWindowHours;
                
                if (std_hours_avail > 0) {
                    hoursToScheduleForDay = Math.min(std_hours_avail, serviceWindowHours);
                }
                
                double duration = default_duration;
                
                // new record in wrtr
                
                final Map trvalues = new HashMap();
                trvalues.put("wr_id", new Integer(wr_id));
                trvalues.put("tr_id", tr_id);
                trvalues.put("hours_est", new Double(default_duration));
                // we will auto-schedule complete task
                trvalues.put("hours_sched", new Double(default_duration));
                // we use the trade rate hourly to do the estimation
                trvalues.put("cost_estimated", new Double(trade_rate_hourly * default_duration));
                
                trvalues.put("date_assigned", currrentLocalDate);
                trvalues.put("time_assigned", currrentLocalTime);
                
                executeDbSave(context, "wrtr", trvalues);
                executeDbCommit(context);
                
                final Map wrcf_values = new HashMap();
                wrcf_values.put("wr_id", new Integer(wr_id));
                wrcf_values.put("cf_id", cf_id);
                
                while (duration > 0) {
                    startDate = serviceWindow.getNextServiceDay(startDate);
                    if (duration < hoursToScheduleForDay) {
                        hoursToScheduleForDay = duration;
                    }
                    
                    wrcf_values.put("date_assigned", startDate);
                    wrcf_values.put("time_assigned", startTime); // always
                    // start at
                    // Service
                    // Window start time
                    
                    wrcf_values.put("hours_est", new Double(hoursToScheduleForDay));
                    wrcf_values.put("scheduled_from_tr_id", tr_id);
                    // use the crafsperson rate for assignment
                    final double cost_est = rate_hourly * hoursToScheduleForDay;
                    wrcf_values.put("cost_estimated", new Double(cost_est));
                    
                    executeDbSave(context, "wrcf", wrcf_values);
                    
                    // calculate time remaining
                    duration = duration - hoursToScheduleForDay;
                } // end while
                
                recalculateEstCosts(context, wr_id);
                
                // calculate the scheduled hours
                recalculateTrade(context, wr_id, tr_id);
                
                final Object tmp = selectDbValue(context, "wr", "wo_id", "wr_id = " + wr_id);
                if (tmp != null) {
                    final Integer wo_id = getIntegerValue(context, tmp);
                    recalculateWorkOrderCosts(context, wo_id.intValue());
                }
            }
            
            executeDbCommit(context);
        }
    }
    
    /**
     * Restriction from values to get proper last inserted id value. Restricted to requestor,
     * supervisor and/or building
     * 
     * 
     * @param context
     * @param values
     * @return
     */
    private String getRestrictionFromValues(final EventHandlerContext context, final Map values) {
        final StringBuffer sb = new StringBuffer();
        if (values.containsKey("requestor") && StringUtil.notNullOrEmpty(values.get("requestor"))) {
            sb.append("requestor = " + literal(context, notNull(values.get("requestor"))));
        } else if (values.containsKey("supervisor")
                && StringUtil.notNullOrEmpty(values.get("supervisor"))) {
            sb.append("supervisor = " + literal(context, notNull(values.get("supervisor"))));
        } else if (values.containsKey("bl_id") && StringUtil.notNullOrEmpty(values.get("bl_id"))) {
            sb.append("bl_id = " + literal(context, notNull(values.get("bl_id"))));
        } else {
            return null;
        }
        
        return sb.toString();
    }
    
    /**
     * This scheduled workflow rule is for users who insert Work Request records (wr records) from
     * sources other than Web Central to invoke the SLA process By Guo Jiangtao 2010-08-23
     * 
     * @param context
     */
    public void invokeSLAForWorkRequests(final EventHandlerContext context) {
        // Create work request datasource and add restriction
        final DataSource wrDS =
                DataSourceFactory.createDataSourceForFields("wr", new String[] { "wr_id",
                        "activity_log_id", "pmp_id", "eq_id", "status", "site_id", "bl_id",
                        "fl_id", "rm_id", "dv_id", "dp_id", "prob_type", "priority",
                        "date_requested", "time_requested", "supervisor", "work_team_id",
                        "manager", "requestor", "serv_window_days", "serv_window_start",
                        "serv_window_end", "allow_work_on_holidays" });
        wrDS.addRestriction(Restrictions
            .sql("wr.activity_log_id IS NULL AND wr.status IN ('A','AA','I')"));
        
        // get record list and invoke sla for every matched work request
        final List<DataRecord> wrList = wrDS.getAllRecords();
        for (final DataRecord wrRecord : wrList) {
            final int wrId = wrRecord.getInt("wr.wr_id");
            final int priority = wrRecord.getInt("wr.priority");
            final String status = wrRecord.getString("wr.status");
            if (priority >= 1 && priority <= 5) {
                wrRecord.setValue("wr.priority", priority);
            } else {
                // set the priority default to 1
                wrRecord.setValue("wr.priority", 1);
            }
            // set back the status to "R" to updadte the status to current status by calling
            // OnDemandWorkStatusManager.updateStatus(status);
            wrRecord.setValue("wr.status", "R");
            wrDS.saveRecord(wrRecord);
            wrDS.commit();
            
            // update Work Request values from SLA
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);
            final ServiceWindow serviceWindow = sla.getServiceWindow();
            if (serviceWindow != null) {
                wrRecord.setValue("wr.serv_window_days",
                    serviceWindow.getServiceWindowDaysAsString());
                wrRecord
                    .setValue("wr.serv_window_start", serviceWindow.getServiceWindowStartTime());
                wrRecord.setValue("wr.serv_window_end", serviceWindow.getServiceWindowEndTime());
                wrRecord.setValue("wr.allow_work_on_holidays",
                    serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
            }
            
            wrRecord.setValue("wr.manager", sla.getSLAManager());
            wrRecord.setValue("wr.supervisor", sla.getSupervisor());
            wrRecord.setValue("wr.work_team_id", sla.getWorkTeam());
            // create Activity Log and update wr.activity_log_id
            final DataRecord alRecord = createNewActivityLog(wrRecord);
            final int activityLogId = alRecord.getInt("activity_log.activity_log_id");
            wrRecord.setValue("wr.activity_log_id", activityLogId);
            wrDS.saveRecord(wrRecord);
            wrDS.commit();
            createDefaultEstimationAndScheduling(context, wrId, sla);
            
            // update status and invoke sla steps
            try {
                final StatusManager statusManager = new OnDemandWorkStatusManager(context, wrId);
                statusManager.updateStatus(status);
            } catch (final Exception e) {
                wrRecord.setValue("wr.status", status);
                wrDS.saveRecord(wrRecord);
                wrDS.commit();
                this.log.info("update status error for work request: " + wrId);
            }
        }
    }
    
    /**
     * Invoke SLA for a mobile work request created after Sync. Started using the
     * invokeSLAForWorkRequests method as a prototype. Constantine Kriezis 2013-03-11.
     * 
     * @param context
     * @param wrId
     */
    public void invokeSLAForMobileWorkRequest(final EventHandlerContext context, final int wrId) {
        // Create the work request datasource and add the restriction to find the current record.
        final DataSource wrDS =
                DataSourceFactory.createDataSourceForFields("wr", new String[] { "wr_id",
                        "activity_log_id", "pmp_id", "eq_id", "status", "site_id", "bl_id",
                        "fl_id", "rm_id", "dv_id", "dp_id", "prob_type", "description", "priority",
                        "date_requested", "time_requested", "supervisor", "work_team_id",
                        "manager", "tr_id", "requestor", "serv_window_days", "serv_window_start",
                        "serv_window_end", "allow_work_on_holidays", "wo_id" });
        
        wrDS.addRestriction(Restrictions.eq("wr", "wr_id", wrId));
        
        // Get the new work request record and invoke the required SLA
        final DataRecord wrRecord = wrDS.getRecord();
        
        if (wrRecord != null) {
            wrRecord.getString("wr.status");
            
            // set back the status to "R" to update the status to current status by calling
            // OnDemandWorkStatusManager.updateStatus(status);
            wrRecord.setValue("wr.status", "R");
            wrDS.saveRecord(wrRecord);
            wrDS.commit();
            
            // update Work Request values from SLA
            final ServiceLevelAgreement sla =
                    ServiceLevelAgreement.getInstance(context, "wr", "wr_id", wrId);
            
            final ServiceWindow serviceWindow = sla.getServiceWindow();
            
            if (serviceWindow != null) {
                wrRecord.setValue("wr.serv_window_days",
                    serviceWindow.getServiceWindowDaysAsString());
                wrRecord
                    .setValue("wr.serv_window_start", serviceWindow.getServiceWindowStartTime());
                wrRecord.setValue("wr.serv_window_end", serviceWindow.getServiceWindowEndTime());
                wrRecord.setValue("wr.allow_work_on_holidays",
                    serviceWindow.isAllowWorkOnHolidays() ? new Integer(1) : new Integer(0));
            }
            
            wrRecord.setValue("wr.manager", sla.getSLAManager());
            wrRecord.setValue("wr.supervisor", sla.getSupervisor());
            wrRecord.setValue("wr.work_team_id", sla.getWorkTeam());
            
            // Create new Work Order
            final Map values = new HashMap();
            values.put("bl_id", wrRecord.getString("wr.bl_id"));
            values.put("description", wrRecord.getString("wr.description"));
            values.put("supervisor", wrRecord.getString("wr.supervisor"));
            values.put("name_of_contact", wrRecord.getString("wr.supervisor"));
            values.put("work_team_id", wrRecord.getString("wr.work_team_id"));
            values.put("tr_id", wrRecord.getString("wr.tr_id"));
            values.put("date_created", wrRecord.getDate("wr.date_requested"));
            values.put("time_created", wrRecord.getDate("wr.time_requested"));
            
            executeDbAdd(context, "wo", values);
            executeDbCommit(context);
            
            final int woId =
                    Common.getMaxId(context, "wo", "wo_id",
                        getRestrictionFromValues(context, values));
            
            wrRecord.setValue("wr.wo_id", woId);
            wrDS.saveRecord(wrRecord);
            wrDS.commit();
            
            // Create activity log and also update activity_log.wo_id
            final DataRecord alRecord = createNewActivityLogForMobile(wrRecord);
            final int activityLogId = alRecord.getInt("activity_log.activity_log_id");
            
            // Update wr.activity_log_id
            wrRecord.setValue("wr.activity_log_id", activityLogId);
            wrDS.saveRecord(wrRecord);
            wrDS.commit();
            
            updateWorkRequestFromSLAMobile(context, wrId);
            
            // Commenting the estimating and scheduling step as the tehcnician assigns work to
            // complete directly.
            // createDefaultEstimationAndScheduling(context, wrId, sla);
            
            // We make sure we issue the work request
            issueWorkorderMobile(String.valueOf(woId));
            
            // // update status and invoke sla steps
            // try {
            // final StatusManager statusManager = new OnDemandWorkStatusManager(context, wrId);
            // statusManager.updateStatus(status);
            // } catch (final Exception e) {
            // wrRecord.setValue("wr.status", status);
            // wrDS.saveRecord(wrRecord);
            // wrDS.commit();
            // this.log.info("update status error for work request: " + wrId);
            // }
        }
    }
    
    /**
     * This method create a new service request record by filling information from work request.
     * 
     * By Guo Jiangtao 2010-08-23
     * 
     * @param wrRecord : Work request record
     */
    private DataRecord createNewActivityLog(final DataRecord wrRecord) {
        final DataSource alDS =
                DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                        "activity_log_id", "activity_type", "autocreate_wr", "site_id", "bl_id",
                        "fl_id", "pmp_id", "eq_id", "rm_id", "dv_id", "dp_id", "prob_type",
                        "status", "date_issued", "date_requested", "time_requested", "supervisor",
                        "work_team_id", "manager", "requestor", "wr_id" });
        wrRecord.getString("wr.status");
        final String status = "REQUESTED";
        DataRecord alRecord = alDS.createNewRecord();
        alRecord.setValue("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
        alRecord.setValue("activity_log.prob_type", wrRecord.getString("wr.prob_type"));
        alRecord.setValue("activity_log.pmp_id", wrRecord.getString("wr.pmp_id"));
        alRecord.setValue("activity_log.eq_id", wrRecord.getString("wr.eq_id"));
        alRecord.setValue("activity_log.site_id", wrRecord.getString("wr.site_id"));
        alRecord.setValue("activity_log.bl_id", wrRecord.getString("wr.bl_id"));
        alRecord.setValue("activity_log.fl_id", wrRecord.getString("wr.fl_id"));
        alRecord.setValue("activity_log.rm_id", wrRecord.getString("wr.rm_id"));
        alRecord.setValue("activity_log.dv_id", wrRecord.getString("wr.dv_id"));
        alRecord.setValue("activity_log.dp_id", wrRecord.getString("wr.dp_id"));
        alRecord.setValue("activity_log.status", status);
        alRecord.setValue("activity_log.date_requested", wrRecord.getDate("wr.date_requested"));
        alRecord.setValue("activity_log.time_requested", wrRecord.getValue("wr.time_requested"));
        alRecord.setValue("activity_log.supervisor", wrRecord.getString("wr.supervisor"));
        alRecord.setValue("activity_log.work_team_id", wrRecord.getString("wr.work_team_id"));
        alRecord.setValue("activity_log.manager", wrRecord.getValue("wr.manager"));
        alRecord.setValue("activity_log.requestor", wrRecord.getValue("wr.requestor"));
        alRecord.setValue("activity_log.wr_id", wrRecord.getInt("wr.wr_id"));
        alRecord = alDS.saveRecord(alRecord);
        alDS.commit();
        
        return alRecord;
    }
    
    /**
     * This method create a new service request record by filling information from work request.
     * 
     * By Guo Jiangtao 2010-08-23, C. Kriezis added description,wo_id 2013-06-07
     * 
     * @param wrRecord : Work request record
     */
    private DataRecord createNewActivityLogForMobile(final DataRecord wrRecord) {
        final DataSource alDS =
                DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                        "activity_log_id", "activity_type", "autocreate_wr", "site_id", "bl_id",
                        "fl_id", "pmp_id", "eq_id", "rm_id", "dv_id", "dp_id", "prob_type",
                        "description", "status", "date_issued", "date_requested", "time_requested",
                        "supervisor", "work_team_id", "manager", "requestor", "wr_id", "wo_id" });
        
        final String status = "REQUESTED";
        DataRecord alRecord = alDS.createNewRecord();
        alRecord.setValue("activity_log.activity_type", "SERVICE DESK - MAINTENANCE");
        alRecord.setValue("activity_log.prob_type", wrRecord.getString("wr.prob_type"));
        alRecord.setValue("activity_log.description", wrRecord.getString("wr.description"));
        alRecord.setValue("activity_log.pmp_id", wrRecord.getString("wr.pmp_id"));
        alRecord.setValue("activity_log.eq_id", wrRecord.getString("wr.eq_id"));
        alRecord.setValue("activity_log.site_id", wrRecord.getString("wr.site_id"));
        alRecord.setValue("activity_log.bl_id", wrRecord.getString("wr.bl_id"));
        alRecord.setValue("activity_log.fl_id", wrRecord.getString("wr.fl_id"));
        alRecord.setValue("activity_log.rm_id", wrRecord.getString("wr.rm_id"));
        alRecord.setValue("activity_log.dv_id", wrRecord.getString("wr.dv_id"));
        alRecord.setValue("activity_log.dp_id", wrRecord.getString("wr.dp_id"));
        alRecord.setValue("activity_log.status", status);
        alRecord.setValue("activity_log.date_requested", wrRecord.getDate("wr.date_requested"));
        alRecord.setValue("activity_log.time_requested", wrRecord.getValue("wr.time_requested"));
        alRecord.setValue("activity_log.supervisor", wrRecord.getString("wr.supervisor"));
        alRecord.setValue("activity_log.work_team_id", wrRecord.getString("wr.work_team_id"));
        alRecord.setValue("activity_log.manager", wrRecord.getValue("wr.manager"));
        alRecord.setValue("activity_log.requestor", wrRecord.getValue("wr.requestor"));
        alRecord.setValue("activity_log.wr_id", wrRecord.getInt("wr.wr_id"));
        alRecord.setValue("activity_log.wo_id", wrRecord.getInt("wr.wo_id"));
        alRecord = alDS.saveRecord(alRecord);
        alDS.commit();
        
        return alRecord;
    }
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN updateWrDateAssigned WFR
    // Added for 19.2 Bldgops
    // ---------------------------------------------------------------------------------------------
    /**
     * To make the Date to Perform more relevant in On Demand Work, this scheduled workflow rule
     * updates wr.date_assigned for On Demand Work Requests based on the earliest date that any
     * trade, craftsperson, or resource is assigned.
     * 
     * By Zhang Yi 2010-08-23
     */
    
    public void updateDateAssignedOfWorkRequest() {
        
        final StringBuilder updateWrSql = new StringBuilder();
        updateWrSql.append("update wr set wr.date_assigned=(");
        updateWrSql
            .append("    case when not exists( select  wrtr.date_assigned from wrtr where wrtr.wr_id=wr.wr_id  )");
        updateWrSql
            .append("          and not exists( select  wrcf.date_assigned from wrcf where wrcf.wr_id=wr.wr_id  )");
        updateWrSql
            .append("          and not exists( select  wrtl.date_assigned from wrtl where wrtl.wr_id=wr.wr_id  )");
        updateWrSql
            .append("          and not exists( select  wrtt.date_assigned from wrtt where wrtt.wr_id=wr.wr_id  )");
        updateWrSql
            .append("          and not exists( select  wrpt.date_assigned from wrpt where wrpt.wr_id=wr.wr_id  )");
        updateWrSql
            .append("    then (                                                                      ");
        updateWrSql
            .append("            case when  wr.date_assigned is null                                 ");
        updateWrSql
            .append("            then wr.date_requested                                                         ");
        updateWrSql
            .append("            end                                                                 ");
        updateWrSql
            .append("         )                                                                      ");
        updateWrSql
            .append("    else                                                                            ");
        updateWrSql
            .append("        (SELECT min(wrRes.minDATRASSIGNED) from (                           ");
        updateWrSql
            .append("            select min( wrtr.date_assigned ) ${sql.as} minDATRASSIGNED from wrtr where wrtr.wr_id=wr.wr_id and  exists( select  wrtr.date_assigned from wrtr where wrtr.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql
            .append("            select min ( wrcf.date_assigned) ${sql.as} minDATRASSIGNED from wrcf where wrcf.wr_id=wr.wr_id and  exists( select  wrcf.date_assigned from wrcf where wrcf.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql
            .append("            select min ( wrpt.date_assigned) ${sql.as} minDATRASSIGNED from wrpt where wrpt.wr_id=wr.wr_id and  exists( select  wrpt.date_assigned from wrpt where wrpt.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql
            .append("            select min ( wrtt.date_assigned) ${sql.as} minDATRASSIGNED from wrtt where wrtt.wr_id=wr.wr_id and  exists( select  wrtt.date_assigned from wrtt where wrtt.wr_id=wr.wr_id)");
        updateWrSql.append("            union all ");
        updateWrSql
            .append("            select min ( wrtl.date_assigned) ${sql.as} minDATRASSIGNED from wrtl where wrtl.wr_id=wr.wr_id and  exists( select  wrtl.date_assigned from wrtl where wrtl.wr_id=wr.wr_id)");
        updateWrSql
            .append("            ) ${sql.as} wrRes                                                       ");
        updateWrSql
            .append("         )                                                                          ");
        updateWrSql
            .append("    end                                                                                                                                                                                                            ");
        updateWrSql
            .append(")                                                                          ");
        
        final StringBuilder updateWrSqlOracle = new StringBuilder();
        updateWrSqlOracle.append("update wr set wr.date_assigned=(");
        updateWrSqlOracle
            .append("    case when not exists( select  wrtr.date_assigned from wrtr where wrtr.wr_id=wr.wr_id  )");
        updateWrSqlOracle
            .append("          and not exists( select  wrcf.date_assigned from wrcf where wrcf.wr_id=wr.wr_id  )");
        updateWrSqlOracle
            .append("          and not exists( select  wrtl.date_assigned from wrtl where wrtl.wr_id=wr.wr_id  )");
        updateWrSqlOracle
            .append("          and not exists( select  wrtt.date_assigned from wrtt where wrtt.wr_id=wr.wr_id  )");
        updateWrSqlOracle
            .append("          and not exists( select  wrpt.date_assigned from wrpt where wrpt.wr_id=wr.wr_id  )");
        updateWrSqlOracle
            .append("    then (                                                                      ");
        updateWrSqlOracle
            .append("            case when  wr.date_assigned is null                                 ");
        updateWrSqlOracle
            .append("            then wr.date_requested                                                         ");
        updateWrSqlOracle
            .append("            end                                                                 ");
        updateWrSqlOracle
            .append("         )                                                                      ");
        updateWrSqlOracle
            .append("    else                                                                            ");
        updateWrSqlOracle
            .append("        (SELECT min(wrRes.date_assigned) from (                           ");
        updateWrSqlOracle
            .append("            select  wrtr.wr_id, min(wrtr.date_assigned)  date_assigned from wrtr   group by wrtr.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle
            .append("            select  wrtt.wr_id, min(wrtt.date_assigned)  date_assigned from wrtt   group by wrtt.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle
            .append("            select  wrtl.wr_id, min(wrtl.date_assigned)  date_assigned from wrtl   group by wrtl.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle
            .append("            select  wrpt.wr_id, min(wrpt.date_assigned)  date_assigned from wrpt   group by wrpt.wr_id ");
        updateWrSqlOracle.append("            union all ");
        updateWrSqlOracle
            .append("            select  wrcf.wr_id, min(wrcf.date_assigned)  date_assigned from wrcf   group by wrcf.wr_id ");
        updateWrSqlOracle
            .append("            ) ${sql.as} wrRes  where wrRes.wr_id=wr.wr_id                                              ");
        updateWrSqlOracle
            .append("         )                                                                          ");
        updateWrSqlOracle
            .append("    end                                                                                                                                                                                                            ");
        updateWrSqlOracle
            .append(")                                                                          ");
        
        final DataSource wrUpdateDS =
                DataSourceFactory.createDataSourceForFields("wr", new String[] { "wr_id",
                        "prob_type", "date_assigned", "date_requested" });
        if (!wrUpdateDS.isOracle()) {
            wrUpdateDS.addQuery(updateWrSql.toString());
        } else {
            wrUpdateDS.addQuery(updateWrSqlOracle.toString());
            
        }
        wrUpdateDS.executeUpdate();
        
    }
    
    // ---------------------------------------------------------------------------------------------
    // END updateWrDateAssigned WFR
    // ---------------------------------------------------------------------------------------------
    
    /**
     * 
     * Find work order from help request.
     * 
     * 
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @return found work request code
     * 
     */
    public int findWoIdFromActionItem(final EventHandlerContext context, final int activity_log_id) {
        int wo_id = 0;
        
        final DataSource activityLogDS =
                DataSourceFactory.createDataSourceForFields("activity_log", new String[] { "wo_id",
                        "activity_log_id" });
        final DataRecord activityLogRec =
                activityLogDS.getRecord(" activity_log.activity_log_id=" + activity_log_id);
        if (activityLogRec != null) {
            wo_id = activityLogRec.getInt("activity_log.wo_id");
        }
        
        return wo_id;
    }
    
    /**
     * 
     * Find work request from help request.
     * 
     * 
     * @param context Workflow rule execution context
     * @param activity_log_id Id of help request to create work request from
     * @return found work request code
     * 
     */
    public int findWrIdFromActionItem(final EventHandlerContext context, final int activity_log_id) {
        int wr_id = 0;
        
        final DataSource wrDS =
                DataSourceFactory.createDataSourceForFields("wr", new String[] { "wr_id",
                        "activity_log_id" });
        final DataRecord wrRec = wrDS.getRecord(" wr.activity_log_id=" + activity_log_id);
        if (wrRec != null) {
            wr_id = wrRec.getInt("wr.wr_id");
        }
        
        return wr_id;
    }
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Update Work Team Code by Supervisor
    // ---------------------------------------------------------------------------------------------
    /**
     * 
     * INSERT the Work Team Code in the activity_log, wr, and wo tables if the assigned Supervisor
     * belongs to a work team
     * 
     */
    private DataSource wrDS = null;
    
    private DataSource woDS = null;
    
    private DataSource activityLogDS = null;
    
    public void updateWorkTeamFromSupervisor() {
        // Prepare datasouce
        this.wrDS =
                DataSourceFactory.createDataSourceForFields("wr", new String[] { "wr_id",
                        "supervisor", "work_team_id" });
        
        this.woDS =
                DataSourceFactory.createDataSourceForFields("wo", new String[] { "wo_id",
                        "supervisor", "work_team_id" });
        
        this.activityLogDS =
                DataSourceFactory.createDataSourceForFields("activity_log", new String[] {
                        "activity_log_id", "supervisor", "work_team_id" });
        
        // SQL Server JDBC driver requires either autoCommit=true, or SelectMethod=cursor
        // if multiple Statements are used within a single Connection
        // SelectMethod=cursor imposes severe performance penalty,
        // so we use autoCommit=true
        if (this.wrDS.isSqlServer()) {
            final EventHandlerContext eventHandlerContext =
                    ContextStore.get().getEventHandlerContext();
            final DbConnection.ThreadSafe connection =
                    EventHandlerBase.getDbConnection(eventHandlerContext);
            connection.setAutoCommit(true);
        }
        
        // Query all data records matching condition from wrDS and handle each of them in an inner
        // class RecordHandler object
        this.wrDS.queryRecords(" wr.supervisor IS NOT NULL AND wr.work_team_id IS NULL ",
            new RecordHandler() {
                
                public boolean handleRecord(final DataRecord wrRec) {
                    fillWorkTeamIdBySupervisor(wrRec, WorkRequestHandler.this.wrDS, "wr");
                    return true;
                }
            });
        
        // Query all data records matching condition from work order and handle each of them in an
        // inner
        // class RecordHandler object
        this.woDS.queryRecords(" wo.supervisor IS NOT NULL AND wo.work_team_id IS NULL ",
            new RecordHandler() {
                
                public boolean handleRecord(final DataRecord woRec) {
                    fillWorkTeamIdBySupervisor(woRec, WorkRequestHandler.this.woDS, "wo");
                    return true;
                }
            });
        
        // Query all data records matching condition from wrDS and handle each of them in an inner
        // class RecordHandler object
        this.activityLogDS.queryRecords(
            " activity_log.supervisor IS NOT NULL AND activity_log.work_team_id IS NULL ",
            new RecordHandler() {
                
                public boolean handleRecord(final DataRecord acRec) {
                    fillWorkTeamIdBySupervisor(acRec, WorkRequestHandler.this.activityLogDS,
                        "activity_log");
                    return true;
                }
            });
    }
    
    public void fillWorkTeamIdBySupervisor(final DataRecord rec, final DataSource ds,
            final String tableName) {
        final String supervisor = rec.getString(tableName + ".supervisor");
        final String workTeamId =
                (String) selectDbValue(
                    ContextStore.get().getEventHandlerContext(),
                    "cf",
                    "work_team_id",
                    "email = (SELECT email FROM em WHERE em_id = "
                            + literal(ContextStore.get().getEventHandlerContext(), supervisor)
                            + ")");
        // If the supervisor has attached work_team_id, then fill it to work request
        if (StringUtil.notNullOrEmpty(workTeamId)) {
            rec.setValue(tableName + ".work_team_id", workTeamId);
            ds.saveRecord(rec);
        }
    }
    // ---------------------------------------------------------------------------------------------
    // END Update Work Team Code by Supervisor
    // ---------------------------------------------------------------------------------------------
    
}
