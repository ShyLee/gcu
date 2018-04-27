package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.LocalDateTimeStore;

/**
 * Provides supporting methods related to synchronizing the data in the main work request tables.
 * Supports the MaintenanceMobileService class.
 * 
 * @author Constantine Kriezis
 * @since 21.1
 * 
 */
final class MaintenanceMobileWorkUpdate {
    
    /**
     * Hide default constructor.
     */
    private MaintenanceMobileWorkUpdate() {
    }
    
    /**
     * Creates a base data source with the common elements for the work request and the work request
     * sync table.
     * 
     * @param tableName - Either wr, wr_sync or activity_log
     * @return datasource - The data source of either wr, wr_sync or activity_log with the common
     *         fields
     */
    static DataSource createBaseWorkDataSource(final String tableName) {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(tableName, DataSource.ROLE_MAIN);
        
        // Fields that are common between the wr, wr_sync, activity_log tables
        datasource.addField(Constant.BL_ID);
        datasource.addField(Constant.CAUSE_TYPE);
        datasource.addField(Constant.DATE_REQUESTED);
        datasource.addField(Constant.DESCRIPTION);
        datasource.addField(Constant.DOC1);
        datasource.addField(Constant.DOC2);
        datasource.addField(Constant.DOC3);
        datasource.addField(Constant.DOC4);
        datasource.addField(Constant.EQ_ID);
        datasource.addField(Constant.FL_ID);
        datasource.addField(Constant.LOCATION);
        datasource.addField(Constant.PMP_ID);
        datasource.addField(Constant.PRIORITY);
        datasource.addField(Constant.PROB_TYPE);
        datasource.addField(Constant.REPAIR_TYPE);
        datasource.addField(Constant.REQUESTOR);
        datasource.addField(Constant.RM_ID);
        datasource.addField(Constant.SITE_ID);
        datasource.addField(Constant.STATUS);
        datasource.addField(Constant.TIME_REQUESTED);
        datasource.addField(Constant.TR_ID);
        
        return datasource;
    }
    
    /**
     * Creates a data source for the work request table.
     * 
     * @return data source for wr table
     */
    static DataSource createWrDataSource() {
        final DataSource datasource = createBaseWorkDataSource(Constant.WR_TABLE);
        
        // Extra fields in the wr table
        datasource.addField(Constant.WR_ID);
        datasource.addField(Constant.ACTIVITY_TYPE);
        datasource.addField(Constant.CF_NOTES);
        datasource.addField(Constant.DATE_ASSIGNED);
        datasource.addField(Constant.DATE_EST_COMPLETION);
        datasource.addField(Constant.COMPLETED_BY);
        
        return datasource;
    }
    
    /**
     * Creates data source for the work request sync table.
     * 
     * @return wr_sync data source
     */
    static DataSource createWrSyncDataSource() {
        final DataSource datasource = createBaseWorkDataSource(Constant.WR_SYNC_TABLE);
        
        // Extra fields in the wr_sync table
        datasource.addField(Constant.AUTO_NUMBER);
        datasource.addField(Constant.WR_ID);
        datasource.addField(Constant.CF_NOTES);
        datasource.addField(Constant.DATE_ASSIGNED);
        datasource.addField(Constant.DATE_EST_COMPLETION);
        datasource.addField(Constant.MOB_WR_ID);
        datasource.addField(Constant.MOB_IS_CHANGED);
        datasource.addField(Constant.MOB_LOCKED_BY);
        datasource.addField(Constant.MOB_PENDING_ACTION);
        
        return datasource;
    }
    
    /**
     * Creates data source for the activity log table.
     * 
     * @return activity_log data source
     */
    static DataSource createActivityLogDataSource() {
        final DataSource datasource = createBaseWorkDataSource(Constant.ACTIVITY_LOG_TABLE);
        
        datasource.addField(Constant.ACTIVITY_LOG_ID);
        datasource.addField(Constant.ACTIVITY_TYPE);
        datasource.addField(Constant.COMMENTS);
        datasource.addField(Constant.CREATED_BY);
        datasource.addField(Constant.DATE_PLANNED_FOR);
        datasource.addField(Constant.DATE_SCHEDULED);
        
        return datasource;
    }
    
    /**
     * Creates data source for the activity log table.
     * 
     * @return activity_log data source
     */
    static DataSource createBlDataSource() {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(Constant.BL_TABLE, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.BL_ID);
        datasource.addField(Constant.SITE_ID);
        
        return datasource;
    }
    
    /**
     * Insert a new work request record from a work request sync record from the mobile device.
     * 
     * @param record wr_sync record
     * @param mobPendingAction - if set to "Com" we update the completed_by field
     * @return wrId - work request code
     */
    static int insertWorkRequestRecord(final DataRecord record, final String mobPendingAction) {
        // Start a new work request record
        final DataSource datasource = createWrDataSource();
        
        DataRecord newRecord = datasource.createNewRecord();
        
        final String blId =
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.BL_ID);
        
        final String siteId = getSiteId(blId);
        
        final java.sql.Date currentLocalDate =
                LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
        
        final java.sql.Time currentLocalTime =
                LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
        
        // Set the activity_type field to the default value. This is not set at the mobile.
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.ACTIVITY_TYPE,
            Constant.DEFAULT_ACTIVITY_TYPE);
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.BL_ID, blId);
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.SITE_ID, siteId);
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.CAUSE_TYPE,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CAUSE_TYPE));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.CF_NOTES,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CF_NOTES));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DATE_ASSIGNED,
            record.getDate(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_ASSIGNED));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DATE_EST_COMPLETION,
            record.getDate(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_EST_COMPLETION));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DATE_REQUESTED,
            currentLocalDate);
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.TIME_REQUESTED,
            currentLocalTime);
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DESCRIPTION,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DESCRIPTION));
        
        // Copy all the doc fields as this is a new record
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DOC1,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC1));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DOC2,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC2));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DOC3,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC3));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DOC4,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC4));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.EQ_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.EQ_ID));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.FL_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.FL_ID));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.LOCATION,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.LOCATION));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.PRIORITY,
            record.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PRIORITY));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.PROB_TYPE,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PROB_TYPE));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.REPAIR_TYPE,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REPAIR_TYPE));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.REQUESTOR,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REQUESTOR));
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.RM_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.RM_ID));
        
        // Set the status to Issued
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.STATUS, "I");
        
        if (Constant.COMPLETED_STATUS.equals(mobPendingAction)) {
            newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.COMPLETED_BY,
                ContextStore.get().getUser().getEmployee().getId());
        }
        
        newRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.TR_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.TR_ID));
        
        newRecord = datasource.saveRecord(newRecord);
        datasource.commit();
        
        return newRecord.getInt(Constant.WR_TABLE + Constant.DOT + Constant.WR_ID);
    }
    
    /**
     * Insert a new activity log record from a work request sync record from the mobile device.
     * 
     * @param record wr_sync record
     * @return activity_log_id Activity Log ID
     */
    static int insertActivityLogRecord(final DataRecord record) {
        // Create the activity log data source
        final DataSource datasource = createActivityLogDataSource();
        
        // Open a new record to save the data for the new activity log
        DataRecord newRecord = datasource.createNewRecord();
        
        final String blId =
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.BL_ID);
        
        final String siteId = getSiteId(blId);
        
        final java.sql.Date currentLocalDate =
                LocalDateTimeStore.get().currentLocalDate(null, null, siteId, blId);
        
        final java.sql.Time currentLocalTime =
                LocalDateTimeStore.get().currentLocalTime(null, null, siteId, blId);
        
        // Set the activity_type field to the default value. This is not set at the mobile.
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.ACTIVITY_TYPE,
            Constant.DEFAULT_ACTIVITY_TYPE);
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.BL_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.BL_ID));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.SITE_ID, siteId);
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.CAUSE_TYPE,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CAUSE_TYPE));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.COMMENTS,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CF_NOTES));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.DATE_SCHEDULED,
            record.getDate(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_EST_COMPLETION));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.DATE_REQUESTED,
            currentLocalDate);
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.TIME_REQUESTED,
            currentLocalTime);
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.DESCRIPTION,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DESCRIPTION));
        
        // Copy all the doc fields as this is a new activity log record
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.DOC1,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC1));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.DOC2,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC2));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.DOC3,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC3));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.DOC4,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC4));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.EQ_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.EQ_ID));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.FL_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.FL_ID));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.LOCATION,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.LOCATION));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.PRIORITY,
            record.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PRIORITY));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.PROB_TYPE,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PROB_TYPE));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.REPAIR_TYPE,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REPAIR_TYPE));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.CREATED_BY,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REQUESTOR));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.REQUESTOR,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REQUESTOR));
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.RM_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.RM_ID));
        
        // Create the activity log with status CREATED
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.STATUS, "CREATED");
        
        newRecord.setValue(Constant.ACTIVITY_LOG_TABLE + Constant.DOT + Constant.TR_ID,
            record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.TR_ID));
        
        newRecord = datasource.saveRecord(newRecord);
        datasource.commit();
        
        return newRecord.getInt(Constant.ACTIVITY_LOG_TABLE + Constant.DOT
                + Constant.ACTIVITY_LOG_ID);
    }
    
    /**
     * Update the fields of an existing work request with the values coming from the mobile device.
     * 
     * @param record wr_sync record
     * @param wrId - work request code
     * @param mobPendingAction - if set to "Com" we update the completed_by field
     */
    static void updateWorkRequestRecord(final DataRecord record, final int wrId,
            final String mobPendingAction) {
        // Create the data source for the work request table
        final DataSource datasource = createWrDataSource();
        
        // Restrict based on the work request code to find the record that we need to update
        datasource.addRestriction(Restrictions.eq(Constant.WR_TABLE, Constant.WR_ID, wrId));
        
        // Get the work request record
        final DataRecord wrRecord = datasource.getRecord();
        
        // Update the work request fields from data on the sync table. Does not update
        // date_requested.
        if (wrRecord != null) {
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.BL_ID,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.BL_ID));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.CAUSE_TYPE,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CAUSE_TYPE));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.CF_NOTES,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CF_NOTES));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DATE_ASSIGNED,
                record.getDate(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_ASSIGNED));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DATE_EST_COMPLETION,
                record
                    .getDate(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_EST_COMPLETION));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.DESCRIPTION,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DESCRIPTION));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.EQ_ID,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.EQ_ID));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.FL_ID,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.FL_ID));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.LOCATION,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.LOCATION));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.PRIORITY,
                record.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PRIORITY));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.PROB_TYPE,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PROB_TYPE));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.REPAIR_TYPE,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REPAIR_TYPE));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.REQUESTOR,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REQUESTOR));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.RM_ID,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.RM_ID));
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.SITE_ID,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.SITE_ID));
            
            // We are not setting the status. If there is a pending action that action will set the
            // status. If not the status stays unchanged as the only status changes are from pending
            // actions.
            // wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.STATUS,
            // record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.STATUS));
            
            if (Constant.COMPLETED_STATUS.equals(mobPendingAction)) {
                wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.COMPLETED_BY,
                    ContextStore.get().getUser().getEmployee().getId());
            }
            
            wrRecord.setValue(Constant.WR_TABLE + Constant.DOT + Constant.TR_ID,
                record.getString(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.TR_ID));
            
            datasource.saveRecord(wrRecord);
            datasource.commit();
        }
    }
    
    /**
     * Create a new work request sync record from a work request record and mark it as locked for
     * the user of the mobile device.
     * 
     * @param record - Work request record
     * @param cfUser - Username of Craftsperson
     * @return auto_number - ID of the new sync record
     */
    static int insertWorkRequestSyncRecord(final DataRecord record, final String cfUser) {
        final DataSource datasource = createWrSyncDataSource();
        
        DataRecord newRecord = datasource.createNewRecord();
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.BL_ID,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.BL_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CAUSE_TYPE,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.CAUSE_TYPE));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.CF_NOTES,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.CF_NOTES));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_ASSIGNED,
            record.getDate(Constant.WR_TABLE + Constant.DOT + Constant.DATE_ASSIGNED));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_EST_COMPLETION,
            record.getDate(Constant.WR_TABLE + Constant.DOT + Constant.DATE_EST_COMPLETION));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DATE_REQUESTED,
            record.getDate(Constant.WR_TABLE + Constant.DOT + Constant.DATE_REQUESTED));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DESCRIPTION,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DESCRIPTION));
        
        // Copy all the doc fields from the work request table to the sync table
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC1,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC1));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC2,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC2));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC3,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC3));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.DOC4,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC4));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.EQ_ID,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.EQ_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.FL_ID,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.FL_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.LOCATION,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.LOCATION));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PMP_ID,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.PMP_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PRIORITY,
            record.getInt(Constant.WR_TABLE + Constant.DOT + Constant.PRIORITY));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.PROB_TYPE,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.PROB_TYPE));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REPAIR_TYPE,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.REPAIR_TYPE));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.REQUESTOR,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.REQUESTOR));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.RM_ID,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.RM_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.SITE_ID,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.SITE_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.STATUS,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.STATUS));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.TR_ID,
            record.getString(Constant.WR_TABLE + Constant.DOT + Constant.TR_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.WR_ID,
            record.getInt(Constant.WR_TABLE + Constant.DOT + Constant.WR_ID));
        
        newRecord.setValue(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.MOB_LOCKED_BY, cfUser);
        
        newRecord = datasource.saveRecord(newRecord);
        datasource.commit();
        
        return newRecord.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.AUTO_NUMBER);
    }
    
    /**
     * Get the site id.
     * 
     * @param blId - Building Code
     * @return siteId - Site Code
     */
    static String getSiteId(final String blId) {
        
        final DataSource bldatasource = createBlDataSource();
        
        bldatasource.addRestriction(Restrictions.eq(Constant.BL_TABLE, Constant.BL_ID, blId));
        
        final DataRecord blRecord = bldatasource.getRecord();
        
        final String siteId =
                blRecord.getString(Constant.BL_TABLE + Constant.DOT + Constant.SITE_ID);
        
        return siteId;
    }
}