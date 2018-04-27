package com.archibus.app.sysadmin.updatewizard.project.job;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.compare.*;
import com.archibus.app.sysadmin.updatewizard.project.loader.*;
import com.archibus.app.sysadmin.updatewizard.project.transfer.in.TransferFileIn;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;

/**
 * Compares ARCHIBUS schema to afm_tbls.csv/afm_flds.csv files.
 * 
 * @author Catalin Purice
 */
public class CompareArchibusToCsvSchemaJob extends JobBase {
    @Override
    public void run() {
        
        // delete from table
        ProjectUpdateWizardUtilities.deleteFromTable(ProjectUpdateWizardConstants.AFM_FLDS_TRANS);
        
        deleteAfmFldsLangTable();
        
        final TransferFileIn fileToTable = new TransferFileIn();
        // check if file exists
        fileToTable.setTableName(ProjectUpdateWizardConstants.AFM_TBLS);
        final boolean isAfmTblsFileExists = fileToTable.fileExists();
        fileToTable.setTableName(ProjectUpdateWizardConstants.AFM_FLDS);
        final boolean isAfmFldsFileExists = fileToTable.fileExists();
        
        if (isAfmTblsFileExists && isAfmFldsFileExists) {
            final List<LoadTableData> tablesDataFromFile = LoadTableData.getAllTablesData();
            final List<Map<String, Object>> fieldsDataFromFile =
                    LoadLangFieldData.loadAllCSVFieldsData();
            // use number of tables as counter.
            this.status.setTotalNumber(tablesDataFromFile.size());
            int currentTableNo = 0;
            ProjectUpdateWizardUtilities.updateTableStatus(ProjectUpdateWizardConstants.AFM_TBLS,
                ProjectUpdateWizardConstants.IN_PROGRESS);
            ProjectUpdateWizardUtilities.updateTableStatus(ProjectUpdateWizardConstants.AFM_FLDS,
                ProjectUpdateWizardConstants.IN_PROGRESS);
            
            CompareTableProperties.checkMissingTables(tablesDataFromFile);
            CompareTableProperties.checkMissingFieldsFromCsv(fieldsDataFromFile);
            CompareTableProperties.checkCircularReferences();
            
            for (final LoadTableData loadTable : tablesDataFromFile) {
                if (this.stopRequested) {
                    this.status.setCode(JobStatus.JOB_STOPPED);
                } else {
                    CompareFieldUtilities.compareEachField(loadTable, fieldsDataFromFile, false);
                    this.status.setCurrentNumber(currentTableNo++);
                }
            }
        } else {
            if (!isAfmFldsFileExists) {
                ProjectUpdateWizardUtilities.updateTableStatus(
                    ProjectUpdateWizardConstants.AFM_FLDS,
                    ProjectUpdateWizardConstants.NO_EXTRACT_FILE);
            }
            if (!isAfmTblsFileExists) {
                ProjectUpdateWizardUtilities.updateTableStatus(
                    ProjectUpdateWizardConstants.AFM_TBLS,
                    ProjectUpdateWizardConstants.NO_EXTRACT_FILE);
            }
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Delete afm_flds_lang when doing compare.
     */
    private void deleteAfmFldsLangTable() {
        final DataSource dsDelete = DataSourceFactory.createDataSource();
        dsDelete.addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET);
        dsDelete.addTable("autonumbered_id");
        dsDelete.addField(ProjectUpdateWizardConstants.TABLE_NAME);
        dsDelete.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            ProjectUpdateWizardConstants.TABLE_NAME, "afm_flds_lang"));
        dsDelete.deleteRecord(dsDelete.getRecord());
    }
    
}
