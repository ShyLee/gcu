package com.archibus.eventhandler.steps;

import java.io.IOException;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.helpdesk.*;
import com.archibus.eventhandler.sla.ServiceLevelAgreement;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

import freemarker.template.TemplateException;

/**
 * 
 * Step Manager for Helpdesk and On Demand.
 * 
 * <p>
 * This is the default implementation for the <code>StepManager</code> The default package
 * <code>com.archibus.eventhandler.steps</code> contains all default step implementations. This
 * should work for most modules.
 * 
 * @see StepManager
 * @see StatusManager
 */

public class StepManagerImpl extends HelpdeskEventHandlerBase implements StepManager {
    
    /**
     * Step default package, this can be overriden by other modules
     */
    public static final String DEFAULT_STEP_PACKAGE = "com.archibus.eventhandler.steps";
    
    public static String stepPackage = DEFAULT_STEP_PACKAGE;
    
    /**
     * Fields in helpdesk_sla_steps
     */
    private static final String[] STEP_FIELDS =
            { "step_rejected", "role", "step_type", "step", "multiple_required", "condition",
                    "em_id", "vn_id", "step_status", "step_order", "cf_id", "notify_responsible" };
    
    /**
     * Fields in helpdesk_step_log
     */
    private static final String[] STEP_LOG_FIELDS =
            { "step_type", "step", "multiple_required", "condition", "em_id", "vn_id",
                    "step_status_result", "status", "step_order", "date_response", "time_response",
                    "step_code", "activity_id", "step_log_id", "pkey_value", "email_sent" };
    
    /**
     * Activity id
     */
    protected String activity_id;
    
    /**
     * Primary key field
     */
    protected String fieldName;
    
    /**
     * Table of request record
     */
    protected String tableName;
    
    /**
     * Workflow rule execution context
     */
    private EventHandlerContext context;
    
    /**
     * Primary key value
     */
    private int id;
    
    /**
     * Service Level Agreement
     */
    private ServiceLevelAgreement sla;
    
    /**
     * Step order
     */
    private int stepOrder = 0; // hold actual step order
    
    /**
     * Step sequence ended
     */
    private boolean stepSequenceEnd = false;
    
    /**
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value of a request record
     */
    public StepManagerImpl(final EventHandlerContext context, final String activity_id, final int id) {
        this.activity_id = activity_id;
        final String tableName =
                ((String) selectDbValue(context, "afm_activities", "workflow_table",
                    "activity_id = " + literal(context, activity_id))).trim();
        this.tableName = tableName;
        this.fieldName = tableName + "_id";
        this.sla = ServiceLevelAgreement.getInstance(context, this.tableName, this.fieldName, id);
        this.id = id;
        this.context = context;
        context.addResponseParameter(tableName + "." + this.fieldName, new Integer(id));
    }
    
    /**
     * 
     * @param activity_id Activity id
     */
    public StepManagerImpl(final String activity_id) {
        super();
        this.activity_id = activity_id;
    }
    
    /**
     * This is the default constructor without parameters.<br/>
     * This shouldn't be used by the event handlers, only by the status manager<br/>
     * This is why it has only package access<br/>
     * 
     */
    StepManagerImpl() {
        super();
    }
    
    /**
     * Accept a step.<br />
     * Only when the step is an acceptance
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #getStep(int) Get the step instance for the given step log id}</li>
     * <li>If the step is in progress, {@link Step#accept(int, String, String) accept}</li>
     * <li>Else throw exception</li>
     * </ol>
     * </p>
     * 
     * @param stepLogId id in the step log table
     * @param comments comment posted by the user
     * @param user_name current user name
     */
    public void acceptStep(final int stepLogId, final String comments, final String user_name) {
        final Step step = getStep(stepLogId);
        if (step.inProgress()) {
            step.accept(stepLogId, comments, user_name);
        } else if (step.hasEnded()) {
            // @translatable
            final String errorMessage = localizeString(this.context, "Step already ended");
            throw new ExceptionBase(errorMessage, true);
        } else {
            // @translatable
            final String errorMessage = localizeString(this.context, "Unknown step");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    /**
     * Confirm a step.<br />
     * Only when the step is an action step: Approval, Estimation, Scheduling, ...
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #getStep(int) Get the step instance for the given step log id}</li>
     * <li>If the step is in progress, {@link Step#confirm(int, String, String) confirm}</li>
     * <li>Else throw exception</li>
     * </ol>
     * </p>
     * 
     * @param stepLogId id in the step log table
     * @param comment comment posted by the user
     * @param user current user name
     */
    public void confirmStep(final int stepLogId, final String comment, final String user) {
        final Step step = getStep(stepLogId);
        if (step.inProgress()) {
            step.confirm(stepLogId, comment, user);
        } else if (step.hasEnded()) {
            // @translatable
            final String errorMessage = "Step already ended for id [{0}]";
            final Object[] args = { Integer.toString(stepLogId) };
            throw new ExceptionBase(errorMessage, args, true);
        } else {
            // @translatable
            final String errorMessage = "Unknown step for id [{0}]";
            final Object[] args = { Integer.toString(stepLogId) };
            throw new ExceptionBase(errorMessage, args, true);
        }
    }
    
    /**
     * Decline a step.<br />
     * Only when the step is an acceptance
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #getStep(int) Get the step instance for the given step log id}</li>
     * <li>If the step is in progress, {@link Step#decline(int, String, String) decline}</li>
     * <li>Else throw exception</li>
     * </ol>
     * </p>
     * 
     * @param stepLogId id in the step log table
     * @param comments comment posted by the user
     * @param user_name current user name
     */
    public void declineStep(final int stepLogId, final String comments, final String user_name) {
        final Step step = getStep(stepLogId);
        if (step.inProgress()) {
            step.decline(stepLogId, comments, user_name);
        } else if (step.hasEnded()) {
            // @translatable
            final String errorMessage = localizeString(this.context, "Step already ended");
            throw new ExceptionBase(errorMessage, true);
        } else {
            // @translatable
            final String errorMessage = localizeString(this.context, "Unknown step");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    /**
     * 
     * End all pending steps.<br />
     * This ends all steps which are in progress for the current request. Approvals are confirmed
     * and acceptances declined.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get current step</li>
     * <li>Check for all pending steps in <code>helpdesk_step_log</code></li>
     * <li>End the selected steps: approvals are confirmed, acceptances declined</li>
     * </ol>
     * </p>
     * 
     * @param comments comments for ending steps
     * @param user_name user ending the steps
     * @see com.archibus.eventhandler.steps.StepManager#endAllPendingSteps(java.lang.String,
     *      java.lang.String)
     */
    public void endAllPendingSteps(final String comments, final String user_name) {
        final StepImpl currentStep = (StepImpl) getCurrentStep();
        
        if (currentStep == null) {
            return;
        }
        final int stepLogId = currentStep.getStepLogId();
        // check if similar steps exist in the helpdesk_step_log (possible for steps assigned to
        // roles)
        final String where =
                "step_order = (SELECT step_order FROM helpdesk_step_log WHERE step_log_id = "
                        + stepLogId + ")" + " AND date_response IS NULL AND table_name = "
                        + literal(this.context, this.tableName) + " AND pkey_value = " + this.id
                        + " AND status = " + literal(this.context, currentStep.getStatusBefore());
        
        // kb3024826
        final DataSource stepLogDs =
                DataSourceFactory.createDataSource().addTable(Constants.STEP_LOG_TABLE,
                    DataSource.ROLE_MAIN).addField(Constants.STEP_LOG_TABLE,
                    Constants.STEP_LOG_FIELDS).addRestriction(Restrictions.sql(where));
        
        final List<DataRecord> listRecords = stepLogDs.getAllRecords();
        
        for (final DataRecord dataRecord : listRecords) {
            final Map<String, Object> values = new HashMap<String, Object>();
            final Map<String, Object> oldValues = dataRecord.getOldValues(true);
            
            for (final Map.Entry<String, Object> entry : oldValues.entrySet()) {
                final String shortFieldName = Utility.fieldNameFromFullName(entry.getKey());
                values.put(shortFieldName, entry.getValue());
            }
            
            final Step step = createStep(values);
            if (step instanceof Acceptance) {
                final Acceptance acceptance = (Acceptance) step;
                acceptance.updateStep(acceptance.getStepLogId(),
                    acceptance.getStepStatusRejected(), user_name + " :: " + comments);
            } else if (step instanceof Review) {
                final Review review = (Review) step;
                review.updateStep(review.getStepLogId(), review.getStepStatusResult(), user_name
                        + " :: " + comments);
            } else if (step instanceof Approval) {
                final Approval approval = (Approval) step;
                approval.updateStep(approval.getStepLogId(), approval.getStepStatusResult(),
                    user_name + " :: " + comments);
            } else if (step instanceof Dispatch) {
                final Dispatch dispatch = (Dispatch) step;
                dispatch.updateStep(dispatch.getStepLogId(), dispatch.getStepStatusResult(),
                    user_name + " :: " + comments);
            }
        }
    }
    
    /**
     * Forward step. Set step_status_result of the original step on forwarded and add comments
     * Invoke new step with same type and new, for new user (forwardTo)
     * 
     * @param stepLogId step log id of step to forward
     * @param comments comments of user forwarding the step
     * @param user current user (who is forwarding)
     * @param forwardTo new employee for forwarded step
     */
    public void forwardStep(final int stepLogId, final String comments, final String user,
            final String forwardTo) {
        final Step step = getStep(stepLogId);
        step.forward(stepLogId, comments, user, forwardTo);
        
        if (step instanceof Approval) {
            final Approval approval = (Approval) step;
            insertStep(step.getType(), step.getStepName(), forwardTo, step.getStepOrder(), approval
                .isMultiple());
        } else {
            insertStep(step.getType(), step.getStepName(), forwardTo, step.getStepOrder());
        }
        
    }
    
    public String getActivity_id() {
        return this.activity_id;
    }
    
    public EventHandlerContext getContext() {
        return this.context;
    }
    
    /**
     * 
     * Get current step.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select step records for given request from the database</li>
     * <li>{@link #createStep(Map) Create step instance} from last inserted step</li>
     * </ol>
     * </p>
     * 
     * @return Current step in workflow
     */
    public Step getCurrentStep() {
        final String subSql =
                Constants.STEP_LOG_TABLE + ".step_type NOT IN ('escalation', 'forward')";
        
        // select last record for this request in the steplog table
        // escalation and forward steps should be ignored to preserve the original workflow
        final DataSource helpDeskLogDs =
                DataSourceFactory.createDataSource().addTable(Constants.STEP_LOG_TABLE,
                    DataSource.ROLE_MAIN).addField(Constants.STEP_LOG_TABLE, STEP_LOG_FIELDS)
                    .addRestriction(
                        Restrictions.eq(Constants.STEP_LOG_TABLE, "table_name", this.tableName))
                    .addRestriction(
                        Restrictions.eq(Constants.STEP_LOG_TABLE, "field_name", this.fieldName))
                    .addRestriction(
                        Restrictions.eq(Constants.STEP_LOG_TABLE, "pkey_value", this.id))
                    .addRestriction(Restrictions.sql(subSql)).addSort(Constants.STEP_LOG_TABLE,
                        "step_log_id", DataSource.SORT_DESC);
        
        final List<DataRecord> listRecord = helpDeskLogDs.getRecords();
        
        if ((listRecord != null) && (!listRecord.isEmpty())) {
            final DataRecord record = listRecord.get(0);
            final Map<String, Object> values = record.getOldValues(true);
            final Map<String, Object> oldFormatValues = new HashMap<String, Object>();
            
            for (final String fullFieldName : values.keySet()) {
                final String shortFieldName = Utility.fieldNameFromFullName(fullFieldName);
                oldFormatValues.put(shortFieldName, values.get(fullFieldName));
            }
            return createStep(oldFormatValues);
        }
        
        return null;
    }
    
    public String getFieldName() {
        return this.fieldName;
    }
    
    public int getId() {
        return this.id;
    }
    
    /**
     * 
     * @param stepLogId
     * @param activityType
     * @return
     */
    private void doBacktoStep(final int stepLogId, final String comments, final String user_name,
            final String activityType) {
        
        final String backtoStepName = this.getBacktoStepName(stepLogId, activityType);
        
        // if backtoStepName = "" , backto request
        if (!backtoStepName.equals("")) {
            final String subSql =
                    Constants.STEP_LOG_TABLE + ".step_type NOT IN ('escalation', 'forward')";
            
            // select last record for this request in the steplog table
            // escalation and forward steps should be ignored to preserve the original workflow
            final DataSource helpDeskLogDs =
                    DataSourceFactory
                        .createDataSource()
                        .addTable(Constants.STEP_LOG_TABLE, DataSource.ROLE_MAIN)
                        .addField(Constants.STEP_LOG_TABLE, STEP_LOG_FIELDS)
                        .addRestriction(
                            Restrictions.eq(Constants.STEP_LOG_TABLE, "table_name", this.tableName))
                        .addRestriction(
                            Restrictions.eq(Constants.STEP_LOG_TABLE, "field_name", this.fieldName))
                        .addRestriction(
                            Restrictions.eq(Constants.STEP_LOG_TABLE, "pkey_value", this.id))
                        .addRestriction(
                            Restrictions.eq(Constants.STEP_LOG_TABLE, "step", backtoStepName))
                        .addRestriction(Restrictions.sql(subSql)).addSort(Constants.STEP_LOG_TABLE,
                            "step_log_id", DataSource.SORT_ASC);
            
            final List<DataRecord> listRecord = helpDeskLogDs.getRecords();
            if (listRecord.size() != 0) {
                final DataRecord record = listRecord.get(0);
                
                // find the step before the backtoStepName， and we create the steps of
                // helpdesk_step_log through current step reapprove or resubmit.
                final DataSource helpDeskLogDs2 =
                        DataSourceFactory.createDataSource().addTable(Constants.STEP_LOG_TABLE,
                            DataSource.ROLE_MAIN).addField(Constants.STEP_LOG_TABLE,
                            STEP_LOG_FIELDS)
                            .addRestriction(
                                Restrictions.eq(Constants.STEP_LOG_TABLE, "table_name",
                                    this.tableName)).addRestriction(
                                Restrictions.eq(Constants.STEP_LOG_TABLE, "field_name",
                                    this.fieldName)).addRestriction(
                                Restrictions.eq(Constants.STEP_LOG_TABLE, "pkey_value", this.id))
                            .addRestriction(
                                Restrictions.eq(Constants.STEP_LOG_TABLE, "step_order", record
                                    .getInt(Constants.STEP_LOG_TABLE + ".step_order") - 1))
                            .addRestriction(Restrictions.sql(subSql)).addSort(
                                Constants.STEP_LOG_TABLE, "step_log_id", DataSource.SORT_ASC);
                
                final DataRecord record2 = helpDeskLogDs2.getRecords().get(0);
                
                // the step before the backtoStepName
                final Step step =
                        getStep(record2.getInt(Constants.STEP_LOG_TABLE + ".step_log_id"));
                final int stepLogId2 = record2.getInt(Constants.STEP_LOG_TABLE + ".step_log_id");
                final String comments2 = record2.getString(Constants.STEP_LOG_TABLE + ".comments");
                // approver people
                final String emId2 = record2.getString(Constants.STEP_LOG_TABLE + ".user_name");
                final int activityLogId = record2.getInt(Constants.STEP_LOG_TABLE + ".pkey_value");
                final int stepOrder2 = record2.getInt(Constants.STEP_LOG_TABLE + ".step_order");
                if (stepOrder2 == 0) {// current step resubmit
                    // 1.delete all steps.
                    this.deleteStepLogWhenBackStep(record2.getInt(Constants.STEP_LOG_TABLE
                            + ".step_order") - 1);
                    // 2.update ativity_log status = "CREATED" ,comments means reject reason
                    this.updateStatusOfActivityLog(activityLogId, "CREATED", comments);
                    // 3. resubmit.
                    final StatusManager statusManager =
                            new HelpdeskStatusManager(this.context, activityLogId);
                    statusManager.updateStatus("REQUESTED");
                } else {// current step reapprove.
                    // 1.delete the steps behind current step.
                    this.deleteStepLogWhenBackStep(record2.getInt(Constants.STEP_LOG_TABLE
                            + ".step_order"));
                    // 2.reapprove to create next steps.
                    step.confirm(stepLogId2, comments2, emId2);
                    // 3.update ativity_log status,comments means reject reason
                    this.updateStatusOfActivityLog(this.id, record
                        .getString(Constants.STEP_LOG_TABLE + ".status"), comments);
                }
                
            }
            
        } else {
            
            // 1 delete helpdesk_step_log where table_name=this.tableName
            // and field_name=this.fieldName and pkey_value = this.id
            this.deleteStepLogWhenBackStep(0);
            // 2 update activity_log status to created
            this.updateStatusOfActivityLog(this.id, "CREATED", comments);
            
        }
    }
    
    /**
     * update the status of ativity_log xigd add
     * 
     * @param activityLogId
     * @param toStatus
     */
    private void updateStatusOfActivityLog(final int activityLogId, final String toStatus,
            final String comments) {
        final String sql =
                "UPDATE activity_log SET status=" + literal(this.context, toStatus) + ", option1="
                        + literal(this.context, comments) + "  WHERE activity_log_id=" + this.id;
        SqlUtils.executeUpdate("activity_log", sql);
    }
    
    /**
     * delete step_log record after the backtoStep xigd add
     * 
     * @param step_order
     */
    private void deleteStepLogWhenBackStep(final int step_order) {
        // Step1 -- Delete the records of this month in the table sc_zzfrent_details
        String sql = "";
        if (step_order == 0) {
            sql =
                    "DELETE FROM helpdesk_step_log  WHERE table_name="
                            + literal(this.context, this.tableName) + " and field_name="
                            + literal(this.context, this.fieldName) + " and pkey_value=" + this.id;
        } else {
            sql =
                    "DELETE FROM helpdesk_step_log  WHERE table_name="
                            + literal(this.context, this.tableName) + " and field_name="
                            + literal(this.context, this.fieldName) + " and pkey_value=" + this.id
                            + " and step_order>" + step_order;
        }
        
        SqlUtils.executeUpdate("helpdesk_step_log", sql);
    }
    
    /**
     * update date_response and time_response to null xigd add
     * 
     * @param step_log_id
     */
    private void updateDateResponseOfStep(final int step_log_id) {
        final String sql =
                "UPDATE helpdesk_step_log SET date_response=null,time_response=null,step_status_result=null,comments=null"
                        + "  WHERE step_log_id=" + step_log_id;
        SqlUtils.executeUpdate("helpdesk_step_log", sql);
    }
    
    /**
     * get backtoStep name, if no set, return "" xigd add
     * 
     * @param stepLogId
     * @param activityType
     * @return
     */
    private String getBacktoStepName(final int stepLogId, final String activityType) {
        final Step currStep = this.getStep(stepLogId);
        final String subSql =
                Constants.SLA_STEPS_TABLE + ".activity_id="
                        + literal(this.context, this.getActivity_id()) + " and "
                        + Constants.SLA_STEPS_TABLE + ".activity_type="
                        + literal(this.context, activityType) + " and " + Constants.SLA_STEPS_TABLE
                        + ".step_order=" + currStep.getStepOrder() + " and "
                        + Constants.SLA_STEPS_TABLE + ".step='" + currStep.getStepName() + "' and "
                        + Constants.SLA_STEPS_TABLE + ".status='" + currStep.getStatusBefore()
                        + "'";
        final Object[] record =
                selectDbValues(this.context, "helpdesk_sla_steps", STEP_FIELDS, subSql);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("getnextStep where " + subSql);
        }
        String backToStepName = "";
        if (record[0] != null) {
            backToStepName = notNull(record[0].toString());
        }
        
        if (backToStepName == "") {
            // throw new
            // Exception("The Backto Step is empty,please setting the backto step in defining workflow");
            
        }
        return backToStepName;
    }
    
    /**
     * 
     * Get next step in workflow.
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #getCurrentStep() Get current step}</li>
     * <li>Take step order from current step and select next step record in
     * <code>helpdesk_sla_steps</code></li>
     * <li>{@link #createStep(Map) Create step instance} from selected record</li>
     * </ol>
     * </p>
     * 
     * @return Step instance of next step
     */
    public Step getNextStep() {
        // get step order of current step
        final Step currentStep = getCurrentStep();
        
        if (currentStep == null) {
            // @translatable
            final String errorMessage = localizeString(this.context, "Illegal current step");
            throw new ExceptionBase(errorMessage, true);
        }
        // increment the step order to get next step
        this.stepOrder = currentStep.getStepOrder() + 1;
        // get step for next ordering sequence
        Step step = getStep();
        // go and find the next valid step or end (=null)
        while (step != null && (!step.checkRequired() || !step.checkCondition())) {
            this.stepOrder++;
            step = getStep();
        }
        
        return step;
    }
    
    public ServiceLevelAgreement getSla() {
        return this.sla;
    }
    
    public int getStepOrder() {
        return this.stepOrder;
    }
    
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * Initialize after default constructor<br />
     * Tablename and fieldname are selected from the database based on the given activity<br />
     * The Service Level Agreement is created based on the given request record (defined by table,
     * field and id)
     * 
     * @param context Workflow rule execution context
     * @param activity_id Activity id
     * @param id Primary key value of a request record
     */
    public void init(final EventHandlerContext context, final String activity_id, final int id) {
        this.activity_id = activity_id;
        final String tableName =
                ((String) selectDbValue(context, "afm_activities", "workflow_table",
                    "activity_id = " + literal(context, activity_id))).trim();
        this.tableName = tableName.trim();
        
        // get the first field as primary key
        final String fieldName =
                com.archibus.eventhandler.EventHandlerBase.getTablePkFieldNames(context,
                    this.tableName)[0];
        this.fieldName = fieldName.trim();
        
        this.sla = ServiceLevelAgreement.getInstance(context, this.tableName, this.fieldName, id);
        this.id = id;
        this.context = context;
        context.addResponseParameter(this.tableName + "." + this.fieldName, new Integer(id));
    }
    
    /**
     * 
     * Insert extra step in the step sequence.<br />
     * This can happen if the FIM wants to change the workflow after escalation of the step.<br />
     * E.g. add a new dispatch step.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Create a new step instance of the given type</li>
     * <li>Insert into <code>helpdesk_step_log</code> and invoke</li>
     * </ol>
     * </p>
     * 
     * @param type Step type
     * @param name Step name
     * @param em_id Employee code
     * 
     * @see com.archibus.eventhandler.steps.StepManager#insertStep(java.lang.String,
     *      java.lang.String, java.lang.String)
     */
    public void insertStep(final String type, final String name, final String em_id) {
        final Step step = getStepInstance(type);
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("step", name);
        values.put("em_id", em_id);
        step.init(this.context, this.activity_id, this.id, values);
        step.invoke();
    }
    
    /**
     * @param type
     * @param name
     * @param em_id
     * @param stepOrder
     */
    public void insertStep(final String type, final String name, final String em_id,
            final int stepOrder) {
        final Step step = getStepInstance(type);
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("step", name);
        values.put("em_id", em_id);
        values.put("step_order", stepOrder);
        step.init(this.context, this.activity_id, this.id, values);
        step.invoke();
    }
    
    /**
     * Insert (approval) step.
     * 
     * @param type
     * @param name
     * @param em_id
     * @param stepOrder
     * @param multipleRequired
     */
    public void insertStep(final String type, final String name, final String em_id,
            final int stepOrder, final boolean multipleRequired) {
        final Step step = getStepInstance(type);
        final Map<String, Object> values = new HashMap<String, Object>();
        values.put("step", name);
        values.put("em_id", em_id);
        values.put("step_order", stepOrder);
        if (multipleRequired) {
            values.put("multiple_required", 1);
        } else {
            values.put("multiple_required", 0);
        }
        
        step.init(this.context, this.activity_id, this.id, values);
        step.invoke();
    }
    
    /**
     * Invoke first (basic) step and continue the step sequence for this status
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link Basic#invoke() Invoke Basic Step}: log the basic status change</li>
     * <li>{@link #invokeNextStep() Invoke Next Step}: activate optional steps for this state (@see
     * invokeNextStep)</li>
     * <li>{@link AutoRule#invoke() Run Auto Rule} for this state</li>
     * </ol>
     * </p>
     * 
     */
    public void invokeFirstStep() {
        // log basic step
        final Basic step = new Basic(this.context, this.activity_id, this.id);
        step.invoke();
        
        // invoke next step(s) in step sequence
        invokeNextStep();
        
        // get the resulting status
        final String newStatus = getItemStatus();
        // put the id value in the context
        this.context.addResponseParameter(this.tableName + "." + this.fieldName, new Integer(
            this.id));
        
        // run the auto rule for this state
        final AutoRule autoRule = new AutoRule(this.context, this.activity_id, newStatus, this.sla);
        autoRule.invoke();
    }
    
    /**
     * Invoke next step of the step sequence for this status
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get basic status</li>
     * <li>{@link #getNextStep() Get Next Step}</li>
     * <li>{@link com.archibus.eventhandler.steps.Step#invoke() Invoke} through steps, until waiting
     * for response or end</li>
     * <li>If step sequence ended,
     * {@link com.archibus.eventhandler.steps.StatusManager#updateStepStatus(String) update step
     * status}</li>
     * <li>Check if basic status has to change</li>
     * </ol>
     * </p>
     */
    public void invokeNextStep() {
        
        final Step currentStep = getCurrentStep();
        if (currentStep != null && currentStep.inProgress()) {
            return;
        }
        
        Step step = getNextStep();
        
        while (step != null) {
            step.invoke(); // create record in helpdesk_step_log
            
            // if waiting for response, in progress
            if (!step.hasEnded()) {
                break;
            }
            
            step = getNextStep();
        }
        
        if (step == null) {
            this.stepSequenceEnd = true;
            this.stepOrder = 0;
            final StatusManager statusManager =
                    WorkflowFactory.getStatusManager(this.context, this.activity_id, this.id);
            // set step status to 'none'
            statusManager.updateStepStatus(Constants.STEP_STATUS_NULL);
            
            final Step lastStep = getLastCompletedStep();
            // if all acceptance steps are declined, escalate and notify sla manager
            
            if (lastStep.getStatusBefore().equals("APPROVED")) {
                checkAcceptance("APPROVED");
            }
            
            final String statusAfter = lastStep.getStatusAfter();
            if (statusAfter != null) {
                statusManager.updateStatus(statusAfter);
            }
        }
    }
    
    public boolean isStepSequenceEnd() {
        return this.stepSequenceEnd;
    }
    
    /**
     * 
     * Notify requestor when the basic status of his request has changed and if specified by SLA
     */
    public void notifyRequestor() {
        if (this.sla.isNotifyRequestor()) {
            this.context.addResponseParameter(this.tableName + "." + this.fieldName, new Integer(
                this.id));
            final RequestHandler handler = new RequestHandler();
            handler.notifyRequestor(this.context);
        }
    }
    
    /**
     * Reissue a step.<br />
     * Only when the step is a verification
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #getStep(int) Get the step instance for the given step log id}</li>
     * <li>If the step is in progress, {@link Step#reissue(int, String, String) reissue}</li>
     * <li>Else throw exception</li>
     * </ol>
     * </p>
     * 
     * @param stepLogId id in the step log table
     * @param comments comment posted by the user
     * @param user_name current user name
     */
    public void reissueStep(final int stepLogId, final String comments, final String user_name) {
        final Step step = getStep(stepLogId);
        if (step.inProgress()) {
            step.reissue(stepLogId, comments, user_name);
        } else if (step.hasEnded()) {
            // @translatable
            final String errorMessage = localizeString(this.context, "Step already ended");
            throw new ExceptionBase(errorMessage, true);
        } else {
            // @translatable
            final String errorMessage = localizeString(this.context, "Unknown step");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    /**
     * Reject a step.<br />
     * Only when the step is an action step: Approval, Estimation, Scheduling, ...
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #getStep(int) Get the step instance for the given step log id}</li>
     * <li>If the step is in progress, {@link Step#reject(int, String, String) reject}</li>
     * <li>Else throw exception</li>
     * </ol>
     * </p>
     * 
     * @param stepLogId id in the step log table
     * @param comments comment posted by the user
     * @param user_name current user name
     */
    public void rejectStep(final int stepLogId, final String comments, final String user_name) {
        final Step step = getStep(stepLogId);
        if (step.inProgress()) {
            step.reject(stepLogId, comments, user_name);
        } else if (step.hasEnded()) {
            // @translatable
            final String errorMessage = localizeString(this.context, "Step already ended");
            throw new ExceptionBase(errorMessage, true);
        } else {
            // @translatable
            final String errorMessage = localizeString(this.context, "Unknown step");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    /**
     * back a step to previous step.<br />
     * Only when the step is an action step: Approval, Estimation, Scheduling, ...
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>{@link #getStep(int) Get the step instance for the given step log id}</li>
     * <li>If the step is in progress, {@link Step#reject(int, String, String) reject}</li>
     * <li>Else throw exception</li>
     * </ol>
     * </p>
     * 
     * @param stepLogId id in the step log table
     * @param comments comment posted by the user
     * @param user_name current user name
     */
    public void backtoStep(final int stepLogId, final String comments, final String user_name,
            final String activityType) {
        final Step step = getStep(stepLogId);
        if (step.inProgress()) {
            this.doBacktoStep(stepLogId, comments, user_name, activityType);
            // step.backto(stepLogId, comments, user_name);
        } else if (step.hasEnded()) {
            // @translatable
            final String errorMessage = localizeString(this.context, "Step already ended");
            throw new ExceptionBase(errorMessage, true);
        } else {
            // @translatable
            final String errorMessage = localizeString(this.context, "Unknown step");
            throw new ExceptionBase(errorMessage, true);
        }
    }
    
    public void setActivity_id(final String activity_id) {
        this.activity_id = activity_id;
    }
    
    public void setContext(final EventHandlerContext context) {
        this.context = context;
    }
    
    public void setFieldName(final String fieldName) {
        this.fieldName = fieldName;
    }
    
    public void setId(final int id) {
        this.id = id;
    }
    
    public void setSla(final ServiceLevelAgreement sla) {
        this.sla = sla;
    }
    
    public void setStepOrder(final int stepOrder) {
        this.stepOrder = stepOrder;
    }
    
    public void setStepSequenceEnd(final boolean stepSequenceEnd) {
        this.stepSequenceEnd = stepSequenceEnd;
    }
    
    public void setTableName(final String tableName) {
        this.tableName = tableName;
    }
    
    /**
     * Check if there are acceptance steps and everyone declined
     * 
     * @param String status
     */
    private void checkAcceptance(final String status) {
        
        final String[] fields =
                { "step_status_result", "user_name", "step_order", "em_id", "vn_id" };
        final String where =
                "table_name = " + literal(this.context, this.tableName) + " AND pkey_value="
                        + this.id + " AND step_type = 'acceptance' AND status = "
                        + literal(this.context, status);
        final List<Object[]> records =
                selectDbRecords(this.context, Constants.STEP_LOG_TABLE, fields, where);
        
        if (!records.isEmpty()) {
            for (final Object[] record : records) {
                final String stepStatus = notNull(record[0]);
                // if one acceptance found return
                if (stepStatus.equals("accepted")) {
                    return;
                }
            }
            
            // all acceptance steps were declined, escalate and alert sla manager
            // extra comments added in escalation message
            final Escalation escalationStep =
                    new Escalation(this.context, this.activity_id, this.id,
                        Escalation.STEP_ESCALATION_FOR_RESPONSE);
            String comments =
                    localizeMessage(this.context, this.activity_id, "ACCEPTANCE_STEP",
                        "ESCALATION_TEXT", null);
            
            // rich format
            if (getIntegerValue(this.context, selectDbValue(this.context, "messages",
                "is_rich_msg_format", "activity_id = " + literal(this.context, this.activity_id)
                        + " AND referenced_by = 'ACCEPTANCE_STEP'"
                        + " AND message_id = 'ESCALATION_TEXT'")) > 0) {
                final Map<String, Object> datamodel =
                        MessageHelper.getRequestDatamodel(this.context, this.tableName,
                            this.fieldName, this.id);
                
                try {
                    comments =
                            MessageHelper.processTemplate("AcceptanceEscalationComments", comments,
                                datamodel);
                } catch (final TemplateException te) {
                    this.log.debug("Parsing template for acceptance escalation comments failed");
                    te.printStackTrace();
                } catch (final IOException e) {
                    this.log.debug("Parsing template for acceptance escalation comments failed");
                    e.printStackTrace();
                }
            }
            
            escalationStep.setComments(comments);
            escalationStep.invoke();
            this.log.debug("Escalate for Response, when all are declined");
        }
    }
    
    /**
     * Create step and
     * {@link com.archibus.eventhandler.steps.Step#init(EventHandlerContext, String, int, Map)
     * initialize with values}
     * 
     * @param values Map of values to initialize step
     * @return Step instance of the step
     */
    private Step createStep(final Map<String, Object> values) {
        if (!values.containsKey("step_type")) {
            // @translatable
            final String errorMessage = localizeString(this.context, "No step type defined ");
            throw new ExceptionBase(errorMessage, true);
        }
        final String stepType = (String) values.get("step_type");
        final Step step = getStepInstance(stepType);
        
        if (values.containsKey("activity_id")) {
            step.init(this.context, (String) values.get("activity_id"), this.id, values);
        } else {
            step.init(this.context, this.activity_id, this.id, values);
        }
        
        return step;
    }
    
    /**
     * 
     * Select the status of the current request
     * 
     * @return status
     */
    private String getItemStatus() {
        final String status =
                (String) selectDbValue(this.context, this.tableName, "status", this.fieldName + "="
                        + this.id);
        return status.trim();
    }
    
    /**
     * Get last completed step.
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select record for last completed step in the database</li>
     * <li>{@link #createStep(Map) Create new step instance from selected record}</li>
     * </ol>
     * </p>
     * <p>
     * <b>SQL:</b> <div> SELECT * FROM helpdesk_step_log<br />
     * WHERE step_log_id IN<br/>
     * &nbsp;(SELECT MAX(step_log_id FROM helpdesk_step_log<br />
     * &nbsp;&nbsp;WHERE table_name = <i>tableName<i> AND pkey_value = <i>id</i> AND date_response
     * IS NOT NULL) </div>
     * </p>
     * 
     * @return Step instance for last step
     */
    private Step getLastCompletedStep() {
        final String where =
                "step_log_id IN (SELECT MAX(step_log_id) FROM "
                        + Constants.STEP_LOG_TABLE
                        + " WHERE table_name = "
                        + literal(this.context, this.tableName)
                        + " AND pkey_value = "
                        + this.id
                        + " AND date_response IS NOT NULL AND step_type NOT IN ('notification','escalation','forward'))";
        final Object[] record =
                selectDbValues(this.context, Constants.STEP_LOG_TABLE, STEP_LOG_FIELDS, where);
        final Map<String, Object> values = new HashMap<String, Object>();
        for (int i = 0; i < STEP_LOG_FIELDS.length; i++) {
            values.put(STEP_LOG_FIELDS[i], record[i]);
        }
        
        return createStep(values);
    }
    
    private Step getStep() {
        // get next step in helpdesk_sla_steps
        final String status = getItemStatus();
        
        final String where =
                "activity_type = " + literal(this.context, this.sla.getActivity_type())
                        + " AND ordering_seq = " + this.sla.getOrdering_seq() + " AND priority = "
                        + this.sla.getPriority() + " AND status = " + literal(this.context, status)
                        + " AND step_order = " + this.stepOrder;
        final Object[] record =
                selectDbValues(this.context, "helpdesk_sla_steps", STEP_FIELDS, where);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("getnextStep where " + where);
        }
        
        if (record == null) {
            return null; // no next step
        }
        
        final Map<String, Object> values = new HashMap<String, Object>();
        for (int i = 0; i < STEP_FIELDS.length; i++) {
            values.put(STEP_FIELDS[i], record[i]);
        }
        
        if (this.log.isDebugEnabled()) {
            this.log.debug("NEXT STEP " + values);
        }
        
        return createStep(values);
    }
    
    /**
     * Get step instance for given step log id.
     * 
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Select step record for given step log id from the <code>helpdesk_step_log</code></li>
     * <li>{@link #createStep(Map) Create new step instance from selected record}</li>
     * </ol>
     * 
     * @param stepLogId step log id
     * @return Step instance
     */
    private Step getStep(final int stepLogId) {
        final Object[] record =
                selectDbValues(this.context, Constants.STEP_LOG_TABLE, STEP_LOG_FIELDS,
                    "step_log_id = " + stepLogId);
        final Map<String, Object> values = new HashMap<String, Object>();
        for (int i = 0; i < STEP_LOG_FIELDS.length; i++) {
            values.put(STEP_LOG_FIELDS[i], record[i]);
        }
        
        return createStep(values);
    }
    
    /**
     * Create Class Instance for Step using the step type name. The default constructor is used, use
     * init() to initialize it
     * 
     * <p>
     * <b>Pseudo-code:</b>
     * <ol>
     * <li>Get class name for step, use capital and trim it to be sure</li>
     * <li>Get Step instance and return it</li>
     * </ol>
     * </p>
     * 
     * @param stepType step type
     */
    private Step getStepInstance(final String stepType) {
        // trimming a string is required when MS SQL Server is used with char fields
        final String className =
                stepType.substring(0, 1).toUpperCase() + stepType.substring(1).toLowerCase().trim();
        
        Step step = null;
        
        try {
            // it is more safe to use the current thread class loader
            final Class clazz =
                    Thread.currentThread().getContextClassLoader().loadClass(
                        stepPackage + "." + className);
            // Class clazz = Class.forName(STEP_PACKAGE+"."+className);
            step = (Step) clazz.newInstance();
            return step;
        } catch (final ClassNotFoundException e) {
            // @translatable
            final String errorMessage = "ClassNotFoundException, unknown step type [{0}], [{1}]";
            final Object[] args = { stepType, e.getMessage() };
            // logger.error(MessageFormat.format(errorMessage,args));
            throw new ExceptionBase(errorMessage, args, true);
        } catch (final InstantiationException e) {
            // @translatable
            final String errorMessage = "Initiation Error, unknown step type [{0}], [{1}]";
            final Object[] args = { stepType, e.getMessage() };
            // logger.error(MessageFormat.format(errorMessage,args));
            throw new ExceptionBase(errorMessage, args, true);
        } catch (final IllegalAccessException e) {
            // @translatable
            final String errorMessage = "Illegal Access, unknown step type [{0}], [{1}]";
            final Object[] args = { stepType, e.getMessage() };
            // logger.error(MessageFormat.format(errorMessage,args));
            throw new ExceptionBase(errorMessage, args, true);
        }
    }
    
}
