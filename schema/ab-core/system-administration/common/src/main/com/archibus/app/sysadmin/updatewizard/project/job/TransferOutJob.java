package com.archibus.app.sysadmin.updatewizard.project.job;

import java.io.File;
import java.util.List;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.transfer.out.TransferFileOut;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Project update wizard transfer out job.
 * 
 * @author Catalin Purice
 * 
 */
public class TransferOutJob extends JobBase {
    
    /**
     * true if the files to be deleted first.
     */
    private final transient boolean isDeleteFiles;
    
    /**
     * 
     * @param isDeleteAllFiles true if the files to be deleted first
     */
    public TransferOutJob(final boolean isDeleteAllFiles) {
        super();
        this.isDeleteFiles = isDeleteAllFiles;
    }
    
    /**
     * Delete all files before transfer out.
     */
    public void deleteAllFiles() {
        final String path = TransferFile.getTransferFolder();
        final File directory = new File(path);
        if (directory.exists()) {
            // Get all files in directory
            final File[] files = directory.listFiles();
            for (final File file : files) {
                if (file.isDirectory()
                        && !ProjectUpdateWizardConstants.PUW_FOLDER
                            .equalsIgnoreCase(file.getName())) {
                    TransferFile.deleteDir(file);
                } else {
                    if (!file.delete()) {
                        ProjectUpdateWizardLogger.logException("Unable to delete files");
                    }
                }
            }
        }
    }
    
    /**
     * @return the isDeleteEachFile
     */
    public boolean isDeleteAllFiles() {
        return this.isDeleteFiles;
    }
    
    @Override
    public void run() {
        // delete all files
        final boolean deleteFiles = isDeleteAllFiles();
        
        if (deleteFiles) {
            deleteAllFiles();
        }
        
        final List<String> tablesToTransfer =
                ProjectUpdateWizardUtilities.getTablesNamesInPending();
        
        final TransferFileOut tableToFile = new TransferFileOut();
        
        this.status.setTotalNumber(TransferFile.getTotalNoOfRecordsToTransfer());
        
        tableToFile.getDtOutManager().setJobStatus(getStatus());
        
        for (final String tableName : tablesToTransfer) {
            
            if (this.stopRequested) {
                break;
            } else {
                
                // skip the tables
                if ("afm_docvers".equalsIgnoreCase(tableName)
                        || "afm_docversarch".equalsIgnoreCase(tableName)) {
                    ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                        ProjectUpdateWizardConstants.NOT_PROCESSED);
                    continue;
                }
                
                // export the table
                tableToFile.setTableName(tableName);
                
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.IN_PROGRESS);
                
                try {
                    
                    tableToFile.transferOut();
                    
                } catch (final ExceptionBase e) {
                    ProjectUpdateWizardLogger.logException(e.toStringForLogging());
                    ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                        ProjectUpdateWizardConstants.NOT_PROCESSED);
                }
                
                ProjectUpdateWizardUtilities.updateTableStatus(tableName,
                    ProjectUpdateWizardConstants.EXPORTED);
            }
        }
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
}
