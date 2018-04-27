package com.archibus.app.sysadmin.updatewizard.project.job;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.*;

/**
 * Gets table_type and default_view from the db and updates the database. Applies to old DB only.
 * 
 * @author Catalin Purice
 * 
 */
public class UpdateTableTypeJob extends JobBase {
    
    /**
     * Constant.
     */
    private static final String FILE_NAME = "afm_tbls_table_types";
    
    /**
     * Constant.
     */
    private static final String AFM_TBLS_TABLE_TYPE = "afm_tbls.table_type";
    
    /**
     * Constant.
     */
    private static final String TABLE_TYPE = "table_type";
    
    /**
     * Load the afm_tbls_table_types.csv table data.
     * 
     * @return List<Map<String, Object>>
     */
    private List<Map<String, Object>> loadTablesTypes() {
        return CsvUtilities.getMapsFromFile(FILE_NAME);
    }
    
    /**
     * Updates afm_tbls.table_type with the values from afm_tbls_table_types.csv.
     */
    public void updateAfmTbls() {
        final String[] fields = { "table_name", TABLE_TYPE };
        final DataSource afmTblsDs =
                DataSourceFactory.createDataSourceForFields(ProjectUpdateWizardConstants.AFM_TBLS,
                    fields);
        final List<DataRecord> records = afmTblsDs.getRecords();
        final List<Map<String, Object>> afmTblsFromFile = loadTablesTypes();
        if (!afmTblsFromFile.isEmpty()) {
            this.status.setTotalNumber(records.size());
            this.status.setCurrentNumber(0);
            for (final DataRecord record : records) {
                final String tableName = record.getValue("afm_tbls.table_name").toString();
                final Map<String, Object> tableMap =
                        CsvUtilities.getTableMap(tableName, afmTblsFromFile);
                if (!tableMap.isEmpty()) {
                    record.setValue(AFM_TBLS_TABLE_TYPE, tableMap.get(TABLE_TYPE).toString());
                    afmTblsDs.saveRecord(record);
                }
                this.status.incrementCurrentNumber();
            }
        }
    }
    
    @Override
    public void run() {
        updateAfmTbls();
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
