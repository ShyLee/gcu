package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.helpdesk.mobile.maintenance.service.IMaintenanceMobileService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.eventhandler.ondemandwork.WorkRequestHandler;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * WorkflowRule Service for Maintenance mobile application.
 * 
 * Registered in the ARCHIBUS WorkflowRules table as 'AbBldgOpsHelpDesk-MaintenanceMobileService'.
 * 
 * Provides methods for integrating "wr_sync" work requests sync table with "wr" work requests table
 * and the work requests business logic.
 * 
 * Invoked by mobile client.
 * 
 * @author Constantine Kriezis
 * @since 21.1
 * 
 */
@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class MaintenanceMobileService implements IMaintenanceMobileService {
    
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /** {@inheritDoc} */
    
    // TODO: (VT): can cfId be deduced from cfUser here?
    public void syncWorkData(final String cfUser, final String cfId) {
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(String.format("MaintenanceMobileService: username=[%s]", cfUser));
        }
        
        // Get new mobile work assigned to the crafts person
        syncFromMobileNewAssignedWork(cfUser);
        
        // Get new mobile work reported by the crafts person
        syncFromMobileNewReportedWork(cfUser);
        
        // Update existing mobile work data and overwrite Web Central
        syncFromMobileExistingAssignedWork(cfUser);
        
        // Delete all sync data for the user to refresh mobile in the last step
        deleteSyncWork(cfUser);
        
        // Get all Web Central assigned work back to the sync table
        syncFromWebCentralNewAssignedWork(cfUser, cfId);
        
    }
    
    /**
     * syncFromMobileNewAssignedWork Get new assigned work from the mobile device.
     * 
     * @param cfUser - User name of craftsperson
     */
    private void syncFromMobileNewAssignedWork(final String cfUser) {
        // TODO: (VT): don't use context
        // The program needs to call existing workflow rule from class WorkRequestHandler that
        // require context as a parameter
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        final DataSource datasource = MaintenanceMobileWorkUpdate.createWrSyncDataSource();
        
        // We can use request_type in wr_sync and set this to 0 for My Work and 1 for My Requests
        final String sqlRestriction =
                "  mob_locked_by = '"
                        + cfUser
                        + "' AND wr_sync.mob_wr_id IS NOT NULL AND wr_sync.wr_id IS NULL AND EXISTS"
                        + " (SELECT 1 FROM wrcf_sync WHERE wrcf_sync.mob_wr_id=wr_sync.mob_wr_id)";
        
        datasource.addRestriction(Restrictions.sql(sqlRestriction));
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            
            final int mobWrId =
                    record.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.MOB_WR_ID);
            
            final String mobPendingAction =
                    record.getString(Constant.WR_SYNC_TABLE + Constant.DOT
                            + Constant.MOB_PENDING_ACTION);
            
            final int autoNumber =
                    record.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.AUTO_NUMBER);
            
            final int wrId =
                    MaintenanceMobileWorkUpdate.insertWorkRequestRecord(record, mobPendingAction);
            
            // Create labor records from the sync data
            MaintenanceMobileLaborUpdate.createLaborRecords(wrId, mobWrId);
            
            // Create the part records from the sync data
            MaintenanceMobilePartsUpdate.createPartRecords(wrId, mobWrId);
            
            // Create the other cost records from the sync data
            MaintenanceMobileCostsUpdate.createOtherCostRecords(wrId, mobWrId);
            
            // Check and update any document attachments from wr_sync to wr
            MaintenanceMobileDocumentsUpdate.updateDocumentsFromSyncForNewWork(wrId, autoNumber,
                Constant.WR_TABLE);
            
            // Invoke rule to create activity log and wo records
            handler.invokeSLAForMobileWorkRequest(context, wrId);
            
            // Call a std workflow rule to calculate the costs for the work request
            handler.recalculateCosts(context, wrId);
            
            // If there is a pending action (Complete or On Hold) update the status using the
            // corresponding rule in Web Central
            if (pendingAction(mobPendingAction)) {
                handler.updateMobileWorkRequestStatus(wrId, mobPendingAction);
            }
        }
    }
    
    /**
     * 
     * syncFromMobileNewReportedWork - Creates new requests in web central from new requests on the
     * mobile that are reported by the craftsperson for others to complete.
     * 
     * @param cfUser User Name of Crafts Person
     */
    private void syncFromMobileNewReportedWork(final String cfUser) {
        final RequestHandler handler = new RequestHandler();
        
        final DataSource datasource = MaintenanceMobileWorkUpdate.createWrSyncDataSource();
        
        final String sqlRestriction =
                " mob_locked_by = '"
                        + cfUser
                        + "' AND wr_sync.mob_wr_id IS NOT NULL AND wr_sync.wr_id IS NULL AND "
                        + "NOT EXISTS (SELECT 1 FROM wrcf_sync WHERE wrcf_sync.mob_wr_id=wr_sync.mob_wr_id)";
        
        datasource.addRestriction(Restrictions.sql(sqlRestriction));
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            
            final int autoNumber =
                    record.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.AUTO_NUMBER);
            
            // MaintenanceMobileWorkUpdate.insertWorkRequestRecord(record);
            final int activityLogId = MaintenanceMobileWorkUpdate.insertActivityLogRecord(record);
            
            // Check and update any document attachments from from wr_sync to activity_log
            MaintenanceMobileDocumentsUpdate.updateDocumentsFromSyncForNewWork(activityLogId,
                autoNumber, Constant.ACTIVITY_LOG_TABLE);
            
            // Invoke new workflow rule to submit a new mobile request
            handler.submitMobileRequest(activityLogId);
        }
    }
    
    /**
     * 
     * syncFromMobileExistingAssignedWork - Updates existing work requests with the data from
     * mobile. This overwrites the main work request data in web central as the assumption is that
     * once a work request is assigned to a mobile user, that user has control of the fields that
     * he/she can update on the device.
     * 
     * @param cfUser - Username of Craftsperson
     */
    private void syncFromMobileExistingAssignedWork(final String cfUser) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final WorkRequestHandler handler = new WorkRequestHandler();
        
        // Create data source for work request sync table
        final DataSource datasource = MaintenanceMobileWorkUpdate.createWrSyncDataSource();
        
        final String sqlRestriction =
                "mob_locked_by = '" + cfUser + "' AND wr_sync.wr_id IS NOT NULL AND "
                        + "EXISTS (SELECT 1 FROM wrcf_sync WHERE wrcf_sync.wr_id=wr_sync.wr_id)";
        
        // Add restriction to look for all work request sync records that are locked for the
        // craftsperson and that also have a work request code and that also have an associated
        // labor record
        datasource.addRestriction(Restrictions.sql(sqlRestriction));
        
        // Get the work request sync records
        final List<DataRecord> records = datasource.getRecords();
        
        // Go through every work request sync record to update the work request and component
        // records - This can be updated to exclude work requests that are already closed in WebC.
        for (final DataRecord record : records) {
            
            final int wrId = record.getInt(Constant.WR_SYNC_TABLE + Constant.DOT + Constant.WR_ID);
            
            final String mobPendingAction =
                    record.getString(Constant.WR_SYNC_TABLE + Constant.DOT
                            + Constant.MOB_PENDING_ACTION);
            
            // Update the work request data from the sync data
            MaintenanceMobileWorkUpdate.updateWorkRequestRecord(record, wrId, mobPendingAction);
            
            // Update the request's labor records from the sync labor data
            MaintenanceMobileLaborUpdate.updateLaborRecords(wrId);
            
            // Update the request's part records from the sync parts data
            MaintenanceMobilePartsUpdate.updatePartRecords(wrId);
            
            // Update the request's cost records from the sync costs data
            MaintenanceMobileCostsUpdate.updateCostRecords(wrId);
            
            // Call a standard workflow rule to calculate the costs for the work request and also
            // associated work order and activity log
            handler.recalculateCosts(context, wrId);
            
            // Add documents to work request
            MaintenanceMobileDocumentsUpdate.addNewSyncDocumentsToExistingWork(record, wrId);
            
            // If there is a pending action execute the corresponding rule in Web Central
            if (pendingAction(mobPendingAction)) {
                handler.updateMobileWorkRequestStatus(wrId, mobPendingAction);
            }
        }
    }
    
    /**
     * 
     * Deletes all the sync records for the current user. This ensures we start from scratch and
     * rebuild the sync records from the Web Central tables. We update the Web Central tables from
     * mobile before we execute this rule.
     * 
     * @param cfUser User Name of Crafts Person
     */
    private void deleteSyncWork(final String cfUser) {
        
        String sqlStatement;
        
        // Justification: Case #2.3: Statements with DELETE FROM ... pattern
        sqlStatement = "DELETE FROM wr_sync WHERE mob_locked_by = '" + cfUser + Constant.END_QUOTE;
        SqlUtils.executeUpdate(Constant.WR_SYNC_TABLE, sqlStatement);
        
        sqlStatement =
                "DELETE FROM wrcf_sync WHERE mob_locked_by = '" + cfUser + Constant.END_QUOTE;
        SqlUtils.executeUpdate(Constant.WRCF_SYNC_TABLE, sqlStatement);
        
        sqlStatement =
                "DELETE FROM wrpt_sync WHERE mob_locked_by = '" + cfUser + Constant.END_QUOTE;
        SqlUtils.executeUpdate(Constant.WRPT_SYNC_TABLE, sqlStatement);
        
        sqlStatement =
                "DELETE FROM wr_other_sync WHERE mob_locked_by = '" + cfUser + Constant.END_QUOTE;
        SqlUtils.executeUpdate(Constant.WR_OTHER_SYNC_TABLE, sqlStatement);
        
        SqlUtils.commit();
        
    }
    
    /**
     * 
     * Moves all work requests assigned to the mobile user to the sync tables. Looks only at
     * requests of status Issued or On Hold.
     * 
     * @param cfUser User Name of Craftsperson
     * @param cfId Crafts Person Code
     */
    private void syncFromWebCentralNewAssignedWork(final String cfUser, final String cfId) {
        // Get the Maximum number of Work Requests to Sync for each mobile user
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String workRequestLimit =
                EventHandlerBase.getActivityParameterString(context, "AbBldgOpsHelpDesk",
                    "MobileWorkRequestsMaxQuantity");
        
        // If there is no activity parameter we set the default to the value from Constant.java
        // which is 250.
        if (workRequestLimit == null) {
            workRequestLimit = Constant.WORK_REQUESTS_TO_SYNC;
        }
        
        // Make sure that if there is already a wr_sync record locked by another mobile user that we
        // exclude it and only read records that are not locked (in the sync table) and are assigned
        // to the mobile user
        final String sqlRestriction =
                "status IN ('I','HP','HA','HL') AND EXISTS (SELECT 1 FROM wrcf WHERE wrcf.wr_id=wr.wr_id and wrcf.cf_id='"
                        + cfId
                        + "') AND NOT EXISTS (SELECT 1 FROM wr_sync WHERE wr_sync.wr_id=wr.wr_id)";
        
        // Create a data source for work requests
        final DataSource datasource = MaintenanceMobileWorkUpdate.createWrDataSource();
        
        // Add the restriction to get all work of status I HP HA HL that is assigned to the
        // craftsperson
        datasource.addRestriction(Restrictions.sql(sqlRestriction));
        
        datasource.setMaxRecords(Integer.parseInt(workRequestLimit));
        
        // Get all the work request records
        final List<DataRecord> records = datasource.getRecords();
        
        // For each work request record
        for (final DataRecord record : records) {
            
            // Get the work request id
            final int wrId = record.getInt(Constant.WR_TABLE + Constant.DOT + Constant.WR_ID);
            
            // Insert a new work request sync record
            final int wrSyncId =
                    MaintenanceMobileWorkUpdate.insertWorkRequestSyncRecord(record, cfUser);
            
            // Create the corresponding labor sync records
            MaintenanceMobileLaborUpdate.createLaborSyncRecords(wrId, cfUser);
            
            // Create the corresponding part sync records
            MaintenanceMobilePartsUpdate.createPartSyncRecords(wrId, cfUser);
            
            // Create the corresponding other cost records
            MaintenanceMobileCostsUpdate.createOtherCostSyncRecords(wrId, cfUser);
            
            // this.logger.info(wrSyncId);
            
            final String doc1FileName =
                    record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC1);
            final String doc2FileName =
                    record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC2);
            final String doc3FileName =
                    record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC3);
            final String doc4FileName =
                    record.getString(Constant.WR_TABLE + Constant.DOT + Constant.DOC4);
            
            // Copy any documents from the work request table to the sync table.
            MaintenanceMobileDocumentsUpdate.copyDocumentsFromWrToWrSync(wrId, wrSyncId,
                doc1FileName, doc2FileName, doc3FileName, doc4FileName);
        }
    }
    
    /**
     * 
     * Checks to see if there is a pending action based on work request status being Com, HA, HP or
     * HL an.
     * 
     * @param status - Work Request Status
     * @return true or false based on conditional check
     */
    private boolean pendingAction(final String status) {
        return "Com".equals(status) || "HA".equals(status) || "HP".equals(status)
                || "HL".equals(status);
    }
}