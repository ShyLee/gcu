package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Compliance Common Handler.
 * 
 * Justification: This class contains all public Workflow rule entries. It need to contain all entry
 * WFR methods and reference to actual methods
 * 
 * @author ASC-BJ:Zhang Yi
 */
// CHECKSTYLE:OFF Suppress 'Class Data Abstraction Coupling' warning.
// TODO: (VT): I disagree with suppressing 'Class Data Abstraction Coupling' warning. This class
// should be re-factored: it should delegate calls to DAOs. - KB3038952
@SuppressWarnings({ "PMD.TooManyMethods" })
public class ComplianceCommonHandler extends JobBase {
    // CHECKSTYLE:ON
    
    /**
     * This WFR is just an interface method for ComplianceLevelCalculator.calculateCompLevel. It is
     * used in the afm_wf_rules entry for scheduling.
     * 
     */
    public static void calculateComplianceLevels() {
        ComplianceLevelCalculator.calculateCompLevel();
    }
    
    /**
     * This WFR takes a Compliance Event ID (activity_log.activity_log_id) and creates records in
     * notifications table using the settings in regnotify table for the Event’s Requirement or
     * Program.
     * 
     * @param eventId Activity Log ID
     */
    public static void createNotifications(final String eventId) {
        
        // KB#3036301: check value of ACTIVITY PARAMETER createNotifications .
        // If not equal to 1, then do not create any notifications.
        final boolean createNotify =
                ComplianceUtility
                    .loadBooleanActivityParameter(Constant.ACTIVITY_PARAMETER_CREATENOTIFICATIONS);
        
        if (createNotify) {
            
            ComplianceNotifyHelper.createNotifications(eventId);
        }
        
    }
    
    /**
     * This WFR is just an interface method for ComplianceSqlHelper.toggleNotifications.
     * 
     * @param regulation regulation
     * @param program reg_program
     * @param requirement reg_requirement
     * @param isActive table requirement field is_active
     */
    public static void toggleNotifications(final String regulation, final String program,
            final String requirement, final int isActive) {
        
        ComplianceSqlHelper.toggleNotifications(regulation, program, requirement, isActive);
        
    }
    
    /**
     * This WFR assigns selected templates to activity defaults, programs, or requirements.
     * 
     * @param templates List of notification template ids
     * @param assignTo String : assignTo is ‘requirement? if pkey is a reg_requirement, ‘program? if
     *            pkey is a reg_program, and NULL if pkey is NULL Activity Log ID
     * @param key key value
     */
    public void assignNotifyTemplates(final List<String> templates, final String assignTo,
            final Map<String, String> key) {
        
        final ComplianceNotifyHelper helper = new ComplianceNotifyHelper();
        
        final StringBuilder inSqlOfSelectedIds =
                ComplianceUtility.getStringBuilderFromList(templates);
        
        if (StringUtil.isNullOrEmpty(assignTo) || key.isEmpty()) {
            
            helper.assignNotifyTemplatesForNull(templates, inSqlOfSelectedIds);
            
        } else if (Constant.REQUIREMENT.equalsIgnoreCase(assignTo)) {
            helper.assignNotifyTemplatesForRequirement(templates, inSqlOfSelectedIds, key);
            
        } else if (Constant.PROGRAM.equalsIgnoreCase(assignTo)) {
            
            helper.assignNotifyTemplatesForProgram(templates, inSqlOfSelectedIds, key);
            
        }
        
    }
    
    /**
     * This WFR checks to make sure that a new Compliance Location (regloc table) record (before
     * saving) is not a duplicate of an existing record.
     * 
     * @param record one of Compliance Regulation/Compliance Program/Compliance Requirement, use
     *            only field name( no table name ) as keys in JSON object.
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param type one of 'regulation'/'reg_program'/'reg_requirement'
     * @param locationId -1 if new record, or PK of existing record
     */
    public void chkDupLocations(final JSONObject record, final JSONObject location,
            final String type, final Integer locationId) {
        
        final ComplianceLocationsHelper helper = new ComplianceLocationsHelper();
        
        helper.getLocationHierarchy().fillHierarchyForMultiLocationKey(location);
        
        final List<DataRecord> existedRecords =
                helper.chkDupLocations(record, location, type, locationId);
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        if (existedRecords.isEmpty()) {
            context.addResponseParameter(Constant.VALUE, Constant.NULL);
            
        } else {
            context.addResponseParameter(Constant.VALUE,
                existedRecords.get(0).getInt(Constant.REGLOC + Constant.DOT + Constant.LOCATION_ID)
                        + Constant.DOT);
        }
        
        final DataRecord locationRecord = DataRecord.createRecordFromJSON(location);
        context.setResponse(locationRecord);
        
    }
    
    /**
     * This WFR is just an interface method for ComplianceSqlHelper.cleanUpLocations. It is used in
     * the afm_wf_rules entry for scheduling.This Schedule WFR is to delete unused or empty
     * compliance_locations records.
     * 
     */
    public void cleanUpLocations() {
        
        ComplianceSqlHelper.cleanUpLocations();
        
    }
    
    /**
     * This WFR takes a list of locations and a list of regulations, programs, and/or requirements
     * and creates records in table regloc.
     * 
     * @param regulations List of Regulation for Compliance Program
     * @param programs List of Compliance Program Code
     * @param requirments List of Compliance Requirements
     * @param locations JSONObject contains lists of Country Code, Region Code, State Code, City
     *            Code, County Code, Site Code, Property Code, Building Code, Floor Code, Room Code,
     *            Equipment Code, Equipment Standard, Employee Code.
     */
    public void createComplianceLocations(final JSONArray regulations, final JSONArray programs,
            final JSONArray requirments, final JSONObject locations) {
        
        final ComplianceLocationsHelper helper = new ComplianceLocationsHelper();
        
        final List<DataRecord> records = new ArrayList<DataRecord>();
        
        for (int i = 0; i < regulations.length(); i++) {
            final JSONObject regulation = regulations.getJSONObject(i);
            ComplianceUtility.clearUselessFields(regulation);
            
            final DataRecord regulationRecord = DataRecord.createRecordFromJSON(regulation);
            final String regId = regulationRecord.getString("regulation.regulation");
            
            regulation.put(Constant.REGULATION, regId);
            
            helper.createComplianceLocationForLocationsList(regulation, "regulation", locations,
                records);
        }
        
        for (int i = 0; i < programs.length(); i++) {
            final JSONObject program = programs.getJSONObject(i);
            ComplianceUtility.clearUselessFields(program);
            
            final DataRecord programRecord = DataRecord.createRecordFromJSON(program);
            final String progId = programRecord.getString(Constant.REGPROGRAM_REG_PROGRAM);
            final String regId = programRecord.getString(Constant.REGPROGRAM_REGULATION);
            
            program.put(Constant.REGULATION, regId);
            program.put(Constant.REG_PROGRAM, progId);
            helper.createComplianceLocationForLocationsList(program, Constant.REG_PROGRAM,
                locations, records);
        }
        
        for (int i = 0; i < requirments.length(); i++) {
            final JSONObject requirement = requirments.getJSONObject(i);
            ComplianceUtility.clearUselessFields(requirement);
            
            final DataRecord requirementRecord = DataRecord.createRecordFromJSON(requirement);
            final String progId = requirementRecord.getString(Constant.REGREQUIREMENT_REG_PROGRAM);
            final String regId = requirementRecord.getString(Constant.REGREQUIREMENT_REGULATION);
            final String reqId =
                    requirementRecord.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT);
            
            requirement.put(Constant.REGULATION, regId);
            requirement.put(Constant.REG_PROGRAM, progId);
            requirement.put(Constant.REG_REQUIREMENT, reqId);
            helper.createComplianceLocationForLocationsList(requirement, Constant.REG_REQUIREMENT,
                locations, records);
            
        }
        
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(records);
        ContextStore.get().getEventHandlerContext().setResponse(dataSet);
    }
    
    /**
     * This WFR assigns selected templates to activity defaults, programs, or requirements.
     * 
     * @param templates List of notification template ids
     * @param records list of records of requirement or programs
     * @param assignTo assignTo is ‘requirement? if pkey is a reg_requirement, ‘program? if pkey is
     *            a reg_program
     */
    public void createNotifyTemplateAssignments(final List<String> templates,
            final JSONArray records, final String assignTo) {
        
        final DataSource regnotifyDs = ComplianceUtility.getDataSourceRegNotify();
        
        for (int i = 0; i < records.length(); i++) {
            // for each JSON object represents a record from client side, need to remove useless
            // no-pk fields; this is partly for avoiding a core issue when convert a JSON to a
            // DataReocrd with un-null date value.
            final JSONObject record = records.getJSONObject(i);
            ComplianceUtility.clearUselessFields(record);
            
            if (Constant.REQUIREMENT.equalsIgnoreCase(assignTo)) {
                ComplianceNotifyHelper.createRegNotifyRecords(regnotifyDs, templates,
                    Constant.REGREQUIREMENT, DataRecord.createRecordFromJSON(record));
                
            } else if (Constant.PROGRAM.equalsIgnoreCase(assignTo)) {
                
                ComplianceNotifyHelper.createRegNotifyRecords(regnotifyDs, templates,
                    Constant.REGPROGRAM, DataRecord.createRecordFromJSON(record));
            }
            
        }
        
    }
    
    /**
     * If any compliance location field is changed, call locid = createOrUpdateLocation(existing
     * location_id, compliance_locations record CL, reg/prog/req record RL) WFR.
     * 
     * @param location JSON Object format of a compliance_locations record passed from client
     * @param locationId location id.
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * 
     */
    public void createOrUpdateLocation(final JSONObject location, final Integer locationId,
            final String regulation, final String program, final String requirement) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(Constant.JSON_EXPRESSION, String
            .valueOf(new ComplianceLocationsHelper().createOrUpdateLocation(location, locationId,
                regulation, program, requirement)));
    }
    
    /**
     * This WFR takes a Compliance Requirement record (regrequirement.reg_requirement) that is to be
     * deleted and removes all associated future events and notifications.
     * 
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * 
     */
    public void deleteComplianceCleanup(final String regulation, final String program,
            final String requirement) {
        
        if (StringUtil.notNullOrEmpty(regulation) && !Constant.NULL.equalsIgnoreCase(regulation)) {
            
            final ComplianceLocationsHelper helper = new ComplianceLocationsHelper();
            // construct a restriction from passed un-empty primary keys to regloc
            final StringBuilder reglocRestriction = new StringBuilder();
            {
                reglocRestriction.append(" regloc.regulation='").append(regulation)
                    .append(Constant.LEFT_SINGLE_QUOTATION);
                
                if (StringUtil.notNullOrEmpty(program) && !Constant.NULL.equalsIgnoreCase(program)) {
                    
                    reglocRestriction.append(" and regloc.reg_program='").append(program)
                        .append(Constant.LEFT_SINGLE_QUOTATION);
                    
                }
                
                if (StringUtil.notNullOrEmpty(requirement)
                        && !Constant.NULL.equalsIgnoreCase(requirement)) {
                    reglocRestriction.append(" and regloc.reg_requirement='").append(requirement)
                        .append(Constant.LEFT_SINGLE_QUOTATION);
                    
                }
            }
            
            // delete associated reglocs
            {
                // get location_id array of all reglocs to be deleted
                final DataSource dsRegloc = ComplianceUtility.getDataSourceRegloc();
                final List<DataRecord> reglocs = dsRegloc.getRecords(reglocRestriction.toString());
                
                ComplianceSqlHelper.deleteReglocs(reglocRestriction.toString());
                
                // For each regloc record, if regloc.location_id does not exist in docs_assigned,
                // regviolation, ls_comm, activity_log, then also delete the associated
                // compliance_locations record
                for (final DataRecord regloc : reglocs) {
                    helper.deleteLocation(regloc.getInt("regloc.location_id"), 0);
                }
            }
            
            // delete associated activity_log and notifications
            {
                // construct a restriction to activity_log: date_scheduled > today() AND status NOT
                // IN (COMPLETED, COMPLETED-V, CLOSED).
                final StringBuilder eventRestriction = new StringBuilder();
                eventRestriction
                    .append(
                        reglocRestriction.toString().replaceAll(Constant.REGLOC,
                            Constant.ACTIVITY_LOG))
                    .append(
                        " AND activity_log.status NOT IN ('COMPLETED', 'COMPLETED-V', 'CLOSED') ")
                    .append(" AND activity_log.date_scheduled>")
                    .append(SqlUtils.formatValueForSql(new Date()));
                
                ComplianceSqlHelper.deleteNotifications(eventRestriction.toString());
                
                helper.deleteLocationsByEvents(eventRestriction.toString());
                ComplianceSqlHelper.deleteEvents(eventRestriction.toString());
                
            }
        }
    }
    
    /**
     * This WFR will delete compliance_locations record by location_id.
     * 
     * @param locationId location id.
     * @param limit count limit used to check if delete given location.
     * 
     */
    public void deleteLocation(final Integer locationId, final Integer limit) {
        new ComplianceLocationsHelper().deleteLocation(locationId, limit);
    }
    
    /**
     * This WFR takes a Compliance Event ID (activity_log.activity_log_id) and creates records in
     * notifications table using the settings in regnotify table for the Event’s Requirement or
     * Program.
     * 
     * @param eventId Activity Log ID
     * 
     */
    public void deleteNotifications(final String eventId) {
        
        ComplianceSqlHelper.deleteNotificationsByEvent(eventId);
        
    }
    
    /**
     * This WFR takes a Compliance Requirement record (regrequirement.reg_requirement) and generates
     * or regenerates the scheduled events in activity_log according to the recurrence pattern and
     * other settings in the Requirement record.
     * 
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * @param replace sign indicates if to replace all existed events, 0/1
     * @param notify sign indicates if to generate notifications, 0/1
     * 
     */
    public void generateEvents(final String regulation, final String program,
            final String requirement, final boolean replace, final Integer notify) {
        
        final ComplianceEventHelper helper = new ComplianceEventHelper();
        
        boolean createNotify =
                ComplianceUtility
                    .loadBooleanActivityParameter(Constant.ACTIVITY_PARAMETER_CREATENOTIFICATIONS);
        if (createNotify && notify == 1) {
            createNotify = true;
        } else {
            createNotify = false;
        }
        
        final DataRecord regRequirement =
                ComplianceUtility.getDataSourceRequirement().getRecord(
                    " regrequirement.reg_requirement= '" + requirement
                            + "' and regrequirement.regulation='" + regulation
                            + "' and regrequirement.reg_program='" + program + "'  ");
        
        final DataRecord regProgram =
                ComplianceUtility.getDataSourceProgram().getRecord(
                    " regprogram.regulation= '" + regulation + "' and regprogram.reg_program='"
                            + program + "'   ");
        
        final ParsedRestrictionDef reglocRestriction = new ParsedRestrictionDef();
        reglocRestriction.addClause(Constant.REGLOC, Constant.REGULATION, regulation,
            Operation.EQUALS);
        reglocRestriction.addClause(Constant.REGLOC, Constant.REG_PROGRAM, program,
            Operation.EQUALS);
        reglocRestriction.addClause(Constant.REGLOC, Constant.REG_REQUIREMENT, requirement,
            Operation.EQUALS);
        
        if (regRequirement != null && regProgram != null) {
            
            final Object[] result =
                    helper.generateEvents(regRequirement, regProgram, reglocRestriction,
                        createNotify, replace);
            final JSONObject json = new JSONObject();
            json.put("count", result[0]);
            json.put("hasPastDate", result[1]);
            // set return result
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            context.setResponse(json);
        }
        
    }
    
    /**
     * This WFR will take and construct some field values for event record from Compliance
     * Requirement record.
     * 
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * @param event record
     * 
     */
    public void setEventRecordByRequirement(final String regulation, final String program,
            final String requirement, final DataRecord event) {
        
        final DataRecord regRequirement =
                ComplianceUtility.getDataSourceRequirement().getRecord(
                    "  regrequirement.reg_requirement= '" + requirement
                            + "'  and regrequirement.regulation='" + regulation
                            + "'  and regrequirement.reg_program='" + program + "'    ");
        
        final DataRecord regProgram =
                ComplianceUtility.getDataSourceProgram().getRecord(
                    "  regprogram.regulation= '" + regulation + "'  and regprogram.reg_program='"
                            + program + "'     ");
        
        if (regRequirement != null && regProgram != null) {
            
            final ComplianceEventHelper helper = new ComplianceEventHelper();
            helper.fillRequirementInfoToEvent(regRequirement, regProgram, event);
            
            // set return result
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            context.setResponse(event);
        }
    }
    
    /**
     * Update Regulation, Program, Requirement and Location ID to associated docs_assigned and
     * communication logs when saving an event record in ab-comp-event-all-edit and its Requirement
     * PK or Location ID changed.
     * 
     * 
     * @param eventId activity_log id
     * @param regulation Regulation Code
     * @param program Program Code
     * @param requirement Requirement Code
     * @param locId Location ID
     * 
     *            Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void updateDocAndLogByEvent(final String eventId, final String regulation,
            final String program, final String requirement, final String locId) {
        
        // UPDATE docs_assigned SET reg/prog/req/locid = activity_log.reg/prog/req/locid WHERE
        // docs_assigned.activity_log_id=activity_log.activity_log_id AND
        // docs_assigned.activity_log_id=eventid
        String locIdVal = locId;
        if (!StringUtil.notNullOrEmpty(locId)) {
            locIdVal = "NULL";
        }
        SqlUtils.executeUpdate(Constant.DOCS_ASSIGNED, "UPDATE docs_assigned SET regulation='"
                + regulation + "',  reg_program='" + program + "',  reg_requirement='"
                + requirement + "',  location_id=  " + locIdVal
                + "  WHERE docs_assigned.activity_log_id=" + eventId);
        
        SqlUtils.executeUpdate(Constant.LS_COMM, "UPDATE ls_comm SET regulation='" + regulation
                + "', reg_program='" + program + "', reg_requirement='" + requirement
                + "',  location_id=" + locIdVal + " WHERE ls_comm.activity_log_id=" + eventId);
    }
    
    /**
     * This WFR takes a list of Compliance Event IDs (activity_log.activity_log_id) and a list of
     * field-value pairs to update all specified activity_log records with the specified values.
     * 
     * @param events List of activity_log
     * @param values JSONObject of field's name-value pairs
     */
    public void updateEvents(final JSONArray events, final DataRecord values) {
        
        final String[] fieldNames =
                EventHandlerBase.getAllFieldNames(ContextStore.get().getEventHandlerContext(),
                    Constant.ACTIVITY_LOG);
        final DataSource eventDs =
                DataSourceFactory.createDataSourceForFields(Constant.ACTIVITY_LOG, fieldNames);
        
        for (int i = 0; i < events.length(); i++) {
            
            final DataRecord eventRecord =
                    eventDs.getRecord(" activity_log.activity_log_id=" + events.getInt(i));
            for (final DataValue value : values.getFields()) {
                if (StringUtil.notNullOrEmpty(value.getNeutralValue())) {
                    eventRecord.setValue(value.getName(), value.getValue());
                }
            }
            eventDs.saveRecord(eventRecord);
        }
        
    }
    
}
