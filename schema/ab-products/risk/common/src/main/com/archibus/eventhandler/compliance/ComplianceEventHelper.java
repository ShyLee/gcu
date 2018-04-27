package com.archibus.eventhandler.compliance;

import java.text.*;
import java.util.*;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobBase;
import com.archibus.model.view.datasource.ParsedRestrictionDef;
import com.archibus.utility.StringUtil;

/**
 * Helper Classes for Compliance Event related business logic.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceEventHelper extends JobBase {
    
    /**
     * DataSource of Compliance Event( table: activity_log ).
     * 
     */
    private final DataSource activityLogDs;
    
    /**
     * DataSource of Compliance Locations( table: compliance_locations ).
     * 
     */
    private final DataSource dsComplianceLocations;
    
    /**
     * DataSource of Compliance Location Assignments( table: regloc ).
     * 
     */
    private final DataSource dsRegloc;
    
    /**
     * boolean sign indicate if generated event contains date_scheduled is earlier than today.
     * 
     */
    private boolean hadPastDate;
    
    /**
     * Date represents 'today' without hour, minute, seconds, millisecond.
     */
    private final Date today;
    
    /**
     * Constructor.
     * 
     */
    public ComplianceEventHelper() {
        super();
        
        this.dsRegloc =
                DataSourceFactory.createDataSourceForFields("regloc", new String[] {
                        Constant.LOCATION_ID, "event_offset", Constant.REGULATION,
                        Constant.REG_PROGRAM, Constant.REG_REQUIREMENT });
        
        this.dsComplianceLocations =
                DataSourceFactory.createDataSourceForFields("compliance_locations", new String[] {
                        Constant.LOCATION_ID, "site_id", "pr_id", "bl_id", "fl_id", "rm_id",
                        "eq_id" });
        
        this.activityLogDs = ComplianceUtility.getDataSourceEvent();
        
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        this.today = (Date) calendar.getTime().clone();
    }
    
    /**
     * delete existed events and notifications.
     * 
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement compliance requirement id
     * @param replace sign indicate if replace current eixsted events and notifications
     * 
     *            Justification: Case#2.3 : Statement with DELETE ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static void deleteEventsAndNotifications(final String regulation, final String program,
            final String requirement, final boolean replace) {
        
        final String isReplaceAll = replace ? " 1=1 " : " 1=0 ";
        
        // Construct event restriction
        final StringBuilder eventRes = new StringBuilder();
        eventRes
            .append(" activity_log.regulation=${parameters['regulation']} AND activity_log.reg_program=${parameters['reg_program']}  ");
        eventRes
            .append(" AND activity_log.reg_requirement=${parameters['reg_requirement']} AND activity_log.date_scheduled >${sql.currentDate} ");
        eventRes.append(" AND activity_log.status='SCHEDULED' AND (activity_log.hcm_labeled=0 OR ");
        eventRes.append(isReplaceAll);
        eventRes.append(" )");
        
        // 1. delete notifications associated with events restricted by above restriction
        final StringBuilder deleteSql1 = new StringBuilder();
        deleteSql1
            .append("  DELETE FROM notifications WHERE exists( select 1 from activity_log where activity_log.activity_log_id = notifications.activity_log_id and ");
        deleteSql1.append(eventRes).append(")");
        executeSqlWithEventRestriction(Constant.NOTIFICATIONS, deleteSql1, regulation, program,
            requirement);
        
        // 2. clear foreign key activity_log_id of docs_assigned associated with events restricted
        // by above restriction
        final StringBuilder clearSql1 = new StringBuilder();
        clearSql1
            .append(" UPDATE docs_assigned SET activity_log_id=NULL WHERE EXISTS( select 1 from activity_log where activity_log.activity_log_id = docs_assigned.activity_log_id and ");
        clearSql1.append(eventRes).append(") ");
        executeSqlWithEventRestriction(Constant.DOCS_ASSIGNED, clearSql1, regulation, program,
            requirement);
        
        // 3. clear foreign key activity_log_id of ls_comm associated with events restricted by
        // above restriction
        final StringBuilder clearSql2 = new StringBuilder();
        clearSql2
            .append(" UPDATE ls_comm SET activity_log_id=NULL WHERE EXISTS(  select 1 from activity_log where activity_log.activity_log_id = ls_comm.activity_log_id and ");
        clearSql2.append(eventRes).append(" ) ");
        executeSqlWithEventRestriction(Constant.LS_COMM, clearSql2, regulation, program,
            requirement);
        
        // 4. delete events restricted by above restriction
        final StringBuilder deleteSql2 = new StringBuilder();
        deleteSql2.append(" DELETE FROM activity_log WHERE ");
        deleteSql2.append(eventRes).toString();
        executeSqlWithEventRestriction(Constant.ACTIVITY_LOG, deleteSql2, regulation, program,
            requirement);
    }
    
    /**
     * set proper SQL parameter values and then execute the SQL.
     * 
     * @param table on which the batch SQL will run
     * @param sql batch update SQL
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement compliance requirement id
     * 
     */
    private static void executeSqlWithEventRestriction(final String table, final StringBuilder sql,
            final String regulation, final String program, final String requirement) {
        
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(table,
                    new String[] { Constant.ACTIVITY_LOG_ID });
        
        dataSource.addQuery(sql.toString());
        
        dataSource.addParameter(Constant.REG_REQUIREMENT, "", DataSource.DATA_TYPE_TEXT);
        dataSource.addParameter(Constant.REG_PROGRAM, "", DataSource.DATA_TYPE_TEXT);
        dataSource.addParameter(Constant.REGULATION, "", DataSource.DATA_TYPE_TEXT);
        dataSource.setParameter(Constant.REG_REQUIREMENT, requirement);
        dataSource.setParameter(Constant.REG_PROGRAM, program);
        dataSource.setParameter(Constant.REGULATION, regulation);
        dataSource.executeUpdate();
    }
    
    /**
     * Create activity log records for specified requirement and date.
     * 
     * @param requirement compliance requirement record
     * @param program Compliance Program record
     * @param reglocRestriction restriction composed of regulation code, rogram code and requirement
     *            code for querying regloc records
     * @param createNotify boolean value of activity parameter "createNotifications"
     * @param date date
     * 
     * @return count of created activity log records
     */
    public int createEvent(final DataRecord requirement, final DataRecord program,
            final ParsedRestrictionDef reglocRestriction, final boolean createNotify,
            final Date date) {
        
        int count = 0;
        
        final int scheLoc = requirement.getInt("regrequirement.sched_loc");
        
        if (scheLoc == 0) {
            // If regrequirement.sched_loc=0, create one record for requirement.
            this.createSingleEvent(requirement, program, date, createNotify);
            count++;
            
        } else {
            // Else if regrequirement.sched_loc=1, create one event record for each regloc record
            // where regloc.regulation,reg_program,reg_requirement =
            // regulation,reg_program,reg_requirement.
            final List<DataRecord> regLocs = this.dsRegloc.getRecords(reglocRestriction);
            count += regLocs.size();
            for (final DataRecord record : regLocs) {
                
                // “If this is for a regloc record (sched_loc=1), nextDate = nextDate +
                // event_offset;
                final Date locDate = (Date) date.clone();
                locDate.setTime(date.getTime() + record.getInt("regloc.event_offset")
                        * Constant.MILLSECONDS);
                
                final DataRecord activityLog =
                        this.createSingleEvent(requirement, program, locDate, createNotify);
                
                this.fillRegLocInformationToEvent(
                    this.dsComplianceLocations.getRecord(Constant.LOCATION_ID + "="
                            + record.getInt("regloc.location_id")), activityLog);
                
                this.activityLogDs.updateRecord(activityLog);
            }
        }
        return count;
    }
    
    /**
     * @return new saved event record.
     * 
     * @param requirement compliance requirement record
     * @param program Compliance Program record
     * @param date date
     * @param createNotify boolean value of activity parameter "createNotifications"
     */
    public DataRecord createSingleEvent(final DataRecord requirement, final DataRecord program,
            final Date date, final boolean createNotify) {
        
        final DataRecord event = this.activityLogDs.createNewRecord();
        
        // fill basic information
        fillBasicInfoToEvent(requirement, event);
        
        // fill date field values
        fillDateValuesToEvent(requirement, date, event);
        
        // fill information constructed from requirement and program
        fillRequirementInfoToEvent(requirement, program, event);
        
        // since API saveRecord() only return reocrd with pk fields, so below have to set saved pk
        // values to original record
        final DataRecord savedRecord = this.activityLogDs.saveRecord(event);
        
        if (savedRecord != null && savedRecord.getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID) != 0) {
            event.setValue(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID,
                savedRecord.getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID));
            
            if (createNotify) {
                ComplianceNotifyHelper.createNotifications(String.valueOf(savedRecord
                    .getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID)));
            }
        }
        
        return event;
    }
    
    /**
     * Fill necessary values to empty fields of event from requirement record.
     * 
     * @param requirement Compliance Requirement Record
     * @param program Compliance Program Record
     * @param event Compliance Event Record(activity_log)
     */
    public void fillRequirementInfoToEvent(final DataRecord requirement, final DataRecord program,
            final DataRecord event) {
        // action_title = regrequirement.event_title (if null then summary, else reg_requirement);
        String eventTitle = requirement.getString("regrequirement.event_title");
        if (StringUtil.isNullOrEmpty(eventTitle)) {
            eventTitle = requirement.getString("regrequirement.summary");
        }
        if (StringUtil.isNullOrEmpty(eventTitle)) {
            eventTitle = requirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT);
        }
        event.setValue("activity_log.action_title", eventTitle);
        
        // manager = regrequirement.em_id;
        event.setValue("activity_log.manager", requirement.getString("regrequirement.em_id"));
        
        // description = regrequirement.description;
        event.setValue("activity_log.description",
            requirement.getString("regrequirement.description"));
        
        // status = ‘SCHEDULED?
        event.setValue("activity_log.status", "SCHEDULED");
        
        // vn_id = regrequirement.vn_id;
        event.setValue("activity_log.vn_id", requirement.getString("regrequirement.vn_id"));
        
        // contact_id = regrequirement.contact_id;
        event.setValue("activity_log.contact_id",
            requirement.getString("regrequirement.contact_id"));
        
        // hcm_labeled = 0;
        event.setValue("activity_log.hcm_labeled", 0);
        
        // project_id = regprogram.project_id;
        event.setValue("activity_log.project_id", program.getString("regprogram.project_id"));
        
        // comments = regrequirement.hold_reason;
        event
            .setValue("activity_log.comments", requirement.getString("regrequirement.hold_reason"));
        
        // construct and fill Satisfaction Notes to event
        fillSatisfactionNotes(event, requirement);
    }
    
    /**
     * Generate events for given date, requirement record and program record; meanwhile create
     * notifications when createNotify is true.
     * 
     * @param regRequirement Compliance Requirement Record
     * @param regProgram Compliance Program Record
     * @param reglocRestriction restriction composed of regulation code, rogram code and requirement
     *            code for querying regloc records
     * @param createNotify boolean value of activity parameter "createNotifications"
     * @param replace sign indicates if to replace all existed events, 0/1
     * 
     * @return count and pastDate sign of generated events
     */
    public Object[] generateEvents(final DataRecord regRequirement, final DataRecord regProgram,
            final ParsedRestrictionDef reglocRestriction, final boolean createNotify,
            final boolean replace) {
        
        int count = 0;
        
        // 1. Remove all future event occurrences and associated notifications
        deleteEventsAndNotifications(regRequirement.getString(Constant.REGREQUIREMENT_REGULATION),
            regRequirement.getString(Constant.REGREQUIREMENT_REG_PROGRAM),
            regRequirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT), replace);
        
        // DateStart = date_initial OR today(), whichever is greater (i.e. if date_initial >=
        // today, DateStart=date_initial, else DateStart=today). This means do not generate
        // events in the past.
        Date dataStart =
                regRequirement
                    .getDate(Constant.REGREQUIREMENT + Constant.DOT + Constant.DATE_START);
        final Date dateInitial =
                regRequirement.getDate(Constant.REGREQUIREMENT + Constant.DOT
                        + Constant.DATE_INITIAL);
        
        if (dateInitial != null) {
            dataStart = dateInitial;
        }
        
        // kb 3037289 - Compare dates without times
        final Date todayWithZeroTime = getDateWithoutTime(new Date());
        if (!dataStart.after(todayWithZeroTime)) {
            dataStart = todayWithZeroTime;
        }
        
        // DateEnd = date_recurrence_end (but if date_recurrence_end is NULL, then DateEnd =
        // date_end.
        final Date dataRecurrenceEnd =
                regRequirement.getDate(Constant.REGREQUIREMENT + Constant.DOT
                        + Constant.DATE_RECURRENCE_END);
        Date dataEnd =
                regRequirement.getDate(Constant.REGREQUIREMENT + Constant.DOT + Constant.DATE_END);
        dataEnd = dataRecurrenceEnd == null ? dataEnd : dataRecurrenceEnd;
        
        // 2. Call the generateRecurringSchedules(recurrence_rule, DateStart, DateEnd) WFR to
        // get a list of dates on which to schedule the events.
        final RecurringScheduleService recurringService = new RecurringScheduleService();
        final String recurringRule =
                regRequirement.getString(Constant.REGREQUIREMENT + Constant.DOT
                        + Constant.RECURRING_RULE);
        final List<Date> dates = recurringService.getDatesList(dataStart, dataEnd, recurringRule);
        
        // 3. For each date in the list returned by WFR above (nextDate), create activity_log
        // record(s) as follows
        for (final Date date : dates) {
            count =
                    count
                            + this.createEvent(regRequirement, regProgram, reglocRestriction,
                                createNotify, date);
            
        }
        
        return new Object[] { count, this.hadPastDate };
    }
    
    /**
     * Strip the time values from a Date object.
     * 
     * @param dateWithTime Date to strip time from
     * @return Date
     */
    private Date getDateWithoutTime(final Date dateWithTime) {
        // kb 3037289 - Compare dates without times
        final DateFormat dFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        Date dateWithZeroTime;
        try {
            dateWithZeroTime = dFormat.parse(dFormat.format(dateWithTime));
        } catch (final ParseException ex) {
            dateWithZeroTime = dateWithTime;
        }
        return dateWithZeroTime;
    }
    
    /**
     * Fill basic values to empty fields of event from requirement record.
     * 
     * @param requirement Compliance Requirement Record
     * @param event Compliance Event Record(activity_log)
     */
    private void fillBasicInfoToEvent(final DataRecord requirement, final DataRecord event) {
        // fill basic information
        event.setValue(Constant.ACTIVITY_LOG_REGULATION,
            requirement.getString(Constant.REGREQUIREMENT_REGULATION));
        event.setValue(Constant.ACTIVITY_LOG_REG_PROGRAM,
            requirement.getString(Constant.REGREQUIREMENT_REG_PROGRAM));
        event.setValue(Constant.ACTIVITY_LOG_REG_REQUIREMENT,
            requirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT));
        event.setValue("activity_log.activity_type", "COMPLIANCE - EVENT");
    }
    
    /**
     * Fill calculated data field values to empty fields of event.
     * 
     * @param requirement Compliance Requirement Record
     * @param date single date
     * @param event Compliance Event Record(activity_log)
     */
    private void fillDateValuesToEvent(final DataRecord requirement, final Date date,
            final DataRecord event) {
        // fill date fields: date_required = nextDate;
        final Date dateRequired = (Date) date.clone();
        event.setValue("activity_log.date_required", dateRequired);
        
        // date_scheduled_end = nextDate ?regrequirement.event_sched_buffer
        date.setTime(date.getTime()
                - requirement.getInt(Constant.REGREQUIREMENT_EVENT_SCHED_BUFFER)
                * Constant.MILLSECONDS);
        final Date dateScheduledEnd = (Date) date.clone();
        event.setValue("activity_log.date_scheduled_end", dateScheduledEnd);
        
        // date_scheduled = nextDate ?regrequirement.event_sched_buffer ?event_duration -+ 1
        int eventDuration = requirement.getInt("regrequirement.event_duration");
        if (eventDuration > 0) {
            eventDuration = eventDuration - 1;
        } else {
            eventDuration = 0;
        }
        date.setTime(date.getTime() - eventDuration * Constant.MILLSECONDS);
        event.setValue("activity_log.date_scheduled", date);
        
        if (date.before(this.today)) {
            this.hadPastDate = true;
        }
        
    }
    
    /**
     * fill location related values from regloc to event.
     * 
     * @param location compliance_locations record
     * @param event activity log record
     */
    private void fillRegLocInformationToEvent(final DataRecord location, final DataRecord event) {
        
        if (location != null && event != null) {
            event.setValue("activity_log.location_id",
                location.getValue("compliance_locations.location_id"));
        }
        
    }
    
    /**
     * Copy the following regrequirement fields into activity_log.satisfaction_notes field in the
     * given format (i.e. include the field titles as shown below, one per line. This is used to
     * archive critical information in case regulation, program, or requirement are deleted in the
     * future
     * 
     * @param event activity_log record
     * @param requirement regrequirement record
     */
    private void fillSatisfactionNotes(final DataRecord event, final DataRecord requirement) {
        
        if (requirement != null && event != null) {
            
            final StringBuilder notes = new StringBuilder();
            
            // Regulation: regrequirement.regulation
            notes.append("Regulation:").append(
                requirement.getString(Constant.REGREQUIREMENT_REGULATION));
            // Program Code: regrequirement.reg_program
            notes.append(Constant.ENTER).append("Program Code:")
                .append(requirement.getString(Constant.REGREQUIREMENT_REG_PROGRAM));
            // Requirement Code: regrequirement.reg_requirement
            notes.append(Constant.ENTER).append("Requirement Code:")
                .append(requirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT));
            // Requirement Type: regrequirement.reg_type
            notes.append(Constant.ENTER).append("Requirement Type:")
                .append(requirement.findField("regrequirement.regreq_type").getLocalizedValue());
            // Requirement Priority: regrequirement.priority
            notes.append(Constant.ENTER).append("Requirement Priority:")
                .append(requirement.findField("regrequirement.priority").getLocalizedValue());
            // Requirement Compliance Level: regrequirement.comp_level
            notes.append(Constant.ENTER).append("Requirement Compliance Level:")
                .append(requirement.getString("regrequirement.comp_level"));
            // Requirement Status: regrequirement.status
            notes.append(Constant.ENTER).append("Requirement Status:")
                .append(requirement.findField("regrequirement.status").getLocalizedValue());
            
            event.setValue("activity_log.satisfaction_notes", notes.toString());
        }
        
    }
    
}
