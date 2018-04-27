package com.archibus.eventhandler.compliance;

import com.archibus.datasource.*;

/**
 * Compliance Helper Class contains all workflow rule methods using SQL.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 * 
 *         Justification: Please see particular case of justification in each method's comment.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class ComplianceSqlHelper {
    
    /**
     * Constructor.
     * 
     */
    private ComplianceSqlHelper() {
    }
    
    /**
     * Delete unused or empty compliance_locations records.
     * 
     * Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void cleanUpLocations() {
        
        final StringBuilder sql = new StringBuilder();
        sql.append(" DELETE FROM compliance_locations WHERE ");
        sql.append(" NOT EXISTS (select 1 from activity_log ");
        sql.append("    WHERE activity_log.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from regloc ");
        sql.append("    WHERE regloc.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from regviolation ");
        sql.append("    WHERE regviolation.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from docs_assigned ");
        sql.append("    WHERE docs_assigned.location_id=compliance_locations.location_id )");
        sql.append(" AND NOT EXISTS (select 1 from ls_comm ");
        sql.append("    WHERE ls_comm.location_id=compliance_locations.location_id )");
        
        SqlUtils.executeUpdate(Constant.COMPLIANCE_LOCATIONS, sql.toString());
    }
    
    /**
     * Takes a String format restriction to activity_log and delete all matched activity_log
     * records.
     * 
     * @param restriction SQL restriction to deleted activity_logs
     * 
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteEvents(final String restriction) {
        
        SqlUtils.executeUpdate(Constant.ACTIVITY_LOG, " DELETE FROM activity_log WHERE "
                + restriction);
    }
    
    /**
     * Takes a String format restriction to notifications and delete all matched notifications
     * records.
     * 
     * @param restriction SQL restriction to deleted notifications
     * 
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteNotifications(final String restriction) {
        
        SqlUtils
            .executeUpdate(
                Constant.NOTIFICATIONS,
                " DELETE FROM notifications WHERE EXISTS (SELECT 1 FROM activity_Log where activity_log.activity_log_id=notifications.activity_log_id and "
                        + restriction + ")");
    }
    
    /**
     * This WFR takes a Compliance Event ID (activity_log.activity_log_id) and creates records in
     * notifications table using the settings in regnotify table for the Event’s Requirement or
     * Program.
     * 
     * @param eventId Activity Log ID
     * 
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteNotificationsByEvent(final String eventId) {
        
        SqlUtils.executeUpdate(Constant.NOTIFICATIONS,
            " DELETE FROM notifications WHERE notifications.activity_log_id=" + eventId);
    }
    
    /**
     * Takes a String format restriction to regloc and delete all matched regloc records.
     * 
     * @param restriction SQL restriction to deleted reglocs
     * 
     *            Justification: Case #2.3 : Statement with DELETE ... pattern.
     */
    public static void deleteReglocs(final String restriction) {
        
        SqlUtils.executeUpdate(Constant.REGLOC, " DELETE FROM regloc WHERE " + restriction);
        
    }
    
    /**
     * @return found existed location id in compliance_locations table.
     * 
     * @param restriction restriction String contains clauses from location field values
     * 
     *            Justification: Case #1: Statement with subquerys - IN (SElECT ... ) pattern.
     */
    public static int getMaxMatchedCompliancelocId(final String restriction) {
        
        int loctionId =
                DataStatistics.getInt(Constant.COMPLIANCE_LOCATIONS, Constant.LOCATION_ID, "MAX",
                    restriction + " AND  "
                            + " location_id NOT IN (SELECT location_id FROM regloc) ");
        
        if (loctionId <= 0) {
            loctionId = -1;
        }
        
        return loctionId;
    }
    
    /**
     * When assign a template to a program, remove from regnotify all current assignments of the
     * template to any of the program's requirements.
     * 
     * @param regulation String Regulation Code
     * @param program String Compliance Program Code
     * @param templateId String Notify Template id
     * 
     *            Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    public static void removeRequirementsAssignmentOfProgram(final String regulation,
            final String program, final String templateId) {
        
        // Delete from regnotify rn where rn.regulation=prog.regulation and
        // rn.reg_program=prog.reg_program and rn.reg_requirement is not null and rn.template_id=tid
        
        SqlUtils.executeUpdate(Constant.REGNOTIFY,
            " DELETE  FROM regnotify WHERE reg_requirement is not null and reg_program = '"
                    + program + "'  and regulation = '" + regulation + "' and template_id='"
                    + templateId + "'    ");
    }
    
    /**
     * When assign multiple templates to a program, remove from regnotify all current assignments of
     * the templates to any of the program's requirements.
     * 
     * @param regulation String Regulation Code
     * @param program String Compliance Program Code
     * @param templateIds StringBuilder Notify Template id list
     * 
     *            Justification: Case #2.3: Statement with DELETE ... WHERE pattern.
     */
    public static void removeRequirementsAssignmentOfProgram(final String regulation,
            final String program, final StringBuilder templateIds) {
        
        // Delete from regnotify rn where rn.regulation=prog.regulation and
        // rn.reg_program=prog.reg_program and rn.reg_requirement is not null and rn.template_id in
        // templateIds
        
        SqlUtils.executeUpdate(
            Constant.REGNOTIFY,
            " DELETE FROM regnotify WHERE reg_requirement is not null and reg_program ='" + program
                    + "' and regulation = '" + regulation + "' and template_id IN "
                    + templateIds.toString() + "  ");
    }
    
    /**
     * This WFR takes a Compliance Requirement (regulation;reg_program;reg_requirement) and turns
     * notifications on/off (notifications.is_active) depending on regrequirement.is_active setting.
     * 
     * @param regulation regulation
     * @param program reg_program
     * @param requirement reg_requirement
     * @param isActive table requirement field is_active
     * 
     *            Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void toggleNotifications(final String regulation, final String program,
            final String requirement, final int isActive) {
        
        // UPDATE notifications, activity_log, regrequirementSET
        // notifications.is_active=regrequirement.is_active
        // WHERE notifications.activity_log_id = activity_log.activity_log_id
        // AND regrequirement.regulation;reg_program;reg_requirement
        // =activity_log.regulation;reg_program;reg_requirement;
        
        String sql = " UPDATE notifications SET notifications.is_active= " + isActive + " WHERE ";
        
        // Do not turn on notifications that have already been sent
        if (isActive == 1) {
            sql += " date_sent IS NULL AND ";
        }
        sql +=
                " EXISTS (select 1 from regrequirement,activity_log "
                        + " WHERE notifications.activity_log_id = activity_log.activity_log_id "
                        + " AND activity_log.regulation = '" + regulation + "' "
                        + " AND activity_log.reg_program = '" + program + "'  "
                        + " AND activity_log.reg_requirement = '" + requirement + "')";
        
        SqlUtils.executeUpdate(Constant.NOTIFICATIONS, sql);
    }
    
}
