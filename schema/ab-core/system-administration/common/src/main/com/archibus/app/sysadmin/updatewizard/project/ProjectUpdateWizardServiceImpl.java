package com.archibus.app.sysadmin.updatewizard.project;

import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.job.*;
import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.UpdateArchibusSchema.ACTIONTYPE;
import com.archibus.app.sysadmin.updatewizard.project.util.UpdateArchibusSchemaUtilities;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.FileFind;

/**
 * Project update wizard service implementation class.
 * 
 * @author Catalin Purice
 * 
 */
public class ProjectUpdateWizardServiceImpl implements ProjectUpdateWizardService {
    
    /**
     * Starts apply chosen action job.
     * 
     * @return job ID
     */
    public String startApplyChosenActionJob() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new UpdateArchibusSchemaJob(ACTIONTYPE.CHOSEN_ACTION);
        return jobManager.startJob(job);
    }
    
    /**
     * Starts apply recommended action job.
     * 
     * @return job ID
     */
    public String startApplyRecommActionJob() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new UpdateArchibusSchemaJob(ACTIONTYPE.REC_ACTION);
        return jobManager.startJob(job);
    }
    
    /**
     * Sets chosen action.
     * 
     * @param autonumId afm_flds_trans.autonumbered_id
     * @param chosenAction value to set
     */
    public void setChosenAction(final String autonumId, final String chosenAction) {
        UpdateArchibusSchemaUtilities.setChosenAction(autonumId, chosenAction);
    }
    
    /**
     * Populates the afm_transfer_set table with data.
     * 
     * @param tableTypes list of table types group if selected from UI
     * @param includeValidatingTables true/false check box from UI option "Include validated tables"
     * @param tableNameWildcard represents table like input from UI
     * @param isTransferIn true if the transfer in is selected from UI
     * @return job ID
     */
    public String addTableNamesToTransferSet(final List<String> tableTypes,
            final boolean includeValidatingTables, final String tableNameWildcard,
            final boolean isTransferIn) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job =
                new AddTableNamesToTransferSetJob(tableTypes, includeValidatingTables,
                    tableNameWildcard, isTransferIn);
        return jobManager.startJob(job);
    }
    
    /**
     * Keeps ML Heading.
     */
    public void keepMlHeading() {
        UpdateArchibusSchemaUtilities.keepMlHeading();
    }
    
    /**
     * Starts the compare job.
     * 
     * @return job ID
     */
    public String startCompareJob() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new CompareJob();
        return jobManager.startJob(job);
    }
    
    /**
     * Starts transfer in job.
     * 
     * @param isDeleteEachFile delete each file?
     * @param ddSelected if the transfer in is actually a merge data dictionary operation then true
     * @return job ID
     */
    public String startTransferInJob(final boolean isDeleteEachFile, final boolean ddSelected) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        Job job = null;
        if (ddSelected) {
            job = new CompareArchibusToCsvSchemaJob();
        } else {
            job = new TransferInJob(isDeleteEachFile);
        }
        return jobManager.startJob(job);
    }
    
    /**
     * Starts transfer out job.
     * 
     * @param isDeleteFiles true if the file will be deleted before transfer out job begins
     * @return job ID
     */
    public String startTransferOutJob(final boolean isDeleteFiles) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new TransferOutJob(isDeleteFiles);
        return jobManager.startJob(job);
    }
    
    /**
     * Starts the update afm_tbls fields job.
     * 
     * @return job ID
     */
    public String startUpdateTableTypesJob() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final Job job = new UpdateTableTypeJob();
        return jobManager.startJob(job);
    }
    
    /**
     * Checks is file exist.
     * 
     * @param fullPathFileName path
     * @return true if the file exists or false otherwise
     */
    public boolean fileExists(final String fullPathFileName) {
        return FileFind.fileExists(ContextStore.get().getWebAppPath() + fullPathFileName);
    }
    
    /**
     * {@inheritDoc}
     */
    public boolean filesExists(final List<String> fullPathsFilesName) {
        boolean exist = true;
        for (final String fullPathFileName : fullPathsFilesName) {
            if (!fileExists(fullPathFileName)) {
                exist = false;
                break;
            }
        }
        return exist;
    }
}
