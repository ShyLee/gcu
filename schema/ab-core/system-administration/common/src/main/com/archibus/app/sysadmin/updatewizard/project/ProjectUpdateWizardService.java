package com.archibus.app.sysadmin.updatewizard.project;

import java.util.List;

/**
 * Project update wizard service interface.
 * 
 * @author Catalin Purice
 * 
 */
public interface ProjectUpdateWizardService {
    
    /**
     * Sets chosen action.
     * 
     * @param autonumId afm_flds_trans.autonumbered_id
     * @param chosenAction value to set
     */
    void setChosenAction(String autonumId, String chosenAction);
    
    /**
     * Populates the afm_transfer_set table with data.
     * 
     * @param tableTypesList list of table types group if selected from UI
     * @param isValidated true/false check box from UI option "Include validated tables"
     * @param namedTable represents table like input from UI
     * @param isTransferIn true if the user selects transfer in process from UI
     * @return job ID
     */
    String addTableNamesToTransferSet(List<String> tableTypesList, boolean isValidated,
            String namedTable, boolean isTransferIn);
    
    /**
     * Keep the ML Heading.
     */
    void keepMlHeading();
    
    /**
     * Starts compare job.
     * 
     * @return job ID
     */
    String startCompareJob();
    
    /**
     * Starts transfer in job.
     * 
     * @param isDeleteEachFile delete each file?
     * @param ddSelected if the transfer in is actually a merge data dictionary operation then true
     * @return job ID
     */
    String startTransferInJob(final boolean isDeleteEachFile, final boolean ddSelected);
    
    /**
     * Starts transfer out job.
     * 
     * @param isDeleteFiles true if the file will be deleted before transfer out job begins
     * @return job ID
     */
    String startTransferOutJob(boolean isDeleteFiles);
    
    /**
     * Starts apply chosen action job.
     * 
     * @return job ID
     */
    String startApplyChosenActionJob();
    
    /**
     * Starts apply recommended job.
     * 
     * @return job ID
     */
    String startApplyRecommActionJob();
    
    /**
     * Starts update ARCHIBUS schema job.
     * 
     * @return job ID
     */
    String startUpdateTableTypesJob();
    
    /**
     * Checks if the file exists on the server.
     * 
     * @param fileName name of the file
     * @return true if the file exist and false otherwise
     */
    boolean fileExists(final String fileName);
    
    /**
     * Checks if the files exists on the server.
     * 
     * @param fileNamePath paths of the files
     * @return false if any of the files is missing and false otherwise
     */
    boolean filesExists(final List<String> fileNamePath);
}
