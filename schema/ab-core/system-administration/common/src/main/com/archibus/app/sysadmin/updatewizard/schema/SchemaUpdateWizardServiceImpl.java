package com.archibus.app.sysadmin.updatewizard.schema;

import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.job.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.*;
import com.archibus.app.sysadmin.updatewizard.schema.prepare.UpdateSchemaVersion;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;

/**
 * Schema update wizard service implementation.
 * 
 * @author Catalin Purice
 * 
 */
public class SchemaUpdateWizardServiceImpl implements SchemaUpdateWizardService {
    
    /**
     * Minimal DB version number supported by the schema update wizard.
     */
    private static final int MIN_DB_VER_NUM = 121;
    
    /**
     * Returns true if the table is a document table.
     * 
     * @param likeWildCard like wild card
     * @param includeVTables true/false if to include validated tables
     * @param isPuwTables true/false if the user selected this option from the UI
     * @return boolean
     */
    public boolean hasBlobTables(final String likeWildCard, final boolean includeVTables,
            final boolean isPuwTables) {
        
        final TablesLoader selectedTables =
                new TablesLoader(null, likeWildCard, includeVTables, false);
        selectedTables.initializeBlobTables(isPuwTables);
        return selectedTables.hasDocumentTables();
    }
    
    /**
     * Starts compare job.
     * 
     * @param likeWildcard like wild card
     * @param includeVTables true/false if to include validated tables
     * @param puwTables true/false if the user selected this option from the UI
     * @param recreateTable true/false if the user selected this option from the UI
     * @param recreateFk true/false if the user selected this option from the UI
     * 
     * @return job ID
     */
    public String startCompareJob(final String likeWildcard, final boolean includeVTables,
            final boolean recreateTable, final boolean puwTables, final boolean recreateFk) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job =
                new CompareJob(likeWildcard, includeVTables, recreateTable, puwTables, recreateFk);
        return jobManager.startJob(job);
    }
    
    /**
     * Starts the recreate structures job.
     * 
     * @return job ID
     */
    public String startRecreateStructuresJob() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new RecreateStructuresJob();
        return jobManager.startJob(job);
    }
    
    /**
     * Starts schema update wizard job.
     * 
     * @param executeDbCommand true if the command is to be executed directly on Db
     * @param tableSpaceName table space name from UI(Oracle only)
     * @param setToChar true/false if the user selected this option from the UI (Oracle only)
     * @param recreateAllFk true/false if the user selected this option from the UI
     * @param isRecreateTable true/false if the user selected this option from the UI
     * @return job ID
     */
    public String startUpdateSchemaJob(final boolean executeDbCommand,
            final boolean isRecreateTable, final boolean recreateAllFk, final boolean setToChar,
            final String tableSpaceName) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job =
                new UpdateSchemaJob(executeDbCommand, isRecreateTable, recreateAllFk, setToChar,
                    tableSpaceName);
        return jobManager.startJob(job);
    }
    
    /**
     * Prepare Schema for Project Update Wizard.
     */
    public void updateArchibusSchemaUtilities() {
        final SqlCommandOutput output = new ExecuteCommand();
        // do not continue if any SQL command fails at this stage.
        output.setThrowException(true);
        
        final int dbVerNumber = UpdateSchemaVersion.getCurrentDbVersionNumber();
        
        final UpdateSchemaVersion dbVerUpdate = new UpdateSchemaVersion(output);
        
        if (dbVerNumber < MIN_DB_VER_NUM) {
            dbVerUpdate.updateDbVersion120to121();
        }
        dbVerUpdate.updateDbVersionForProjUpWiz();
        output.close();
    }
    
    /**
     * {@inheritDoc}
     */
    public String startUpdateSchemaForTableJob(final String tableName) {
        ContextStore.get().getProject().clearCachedTableDefs();
        
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        
        final TableProperties table = new TableProperties();
        table.setName(tableName);
        table.setNoOfRecords(0);
        
        ProjectUpdateWizardUtilities.insertIntoAfmTransferSet(table, false);
        
        final Job job = new UpdateSchemaJob(true, false, false, false, "");
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        return jobManager.startJob(job);
    }
}
