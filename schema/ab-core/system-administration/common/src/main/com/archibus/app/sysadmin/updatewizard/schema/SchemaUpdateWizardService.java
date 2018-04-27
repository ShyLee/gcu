package com.archibus.app.sysadmin.updatewizard.schema;

/**
 * Schema update wizard service interface.
 * 
 * @author Catalin
 * 
 */
public interface SchemaUpdateWizardService {
    
    /**
     * 
     * @param likeWildCard from UI
     * @param includeVTables from UI
     * @param isPUWTables from UI
     * @return true if the table is a doc table
     */
    boolean hasBlobTables(String likeWildCard, boolean includeVTables, boolean isPUWTables);
    
    /**
     * 
     * @param likeWildcard from UI
     * @param includeVTables from UI
     * @param recreateTable from UI
     * @param puwTables from UI
     * @param recreateFk from UI
     * @return job ID
     */
    String startCompareJob(String likeWildcard, boolean includeVTables, boolean recreateTable,
            boolean puwTables, boolean recreateFk);
    
    /**
     * 
     * @param toLogFile from UI
     * @param isRecreateTable from UI
     * @param recreateAllFK from UI
     * @param setToChar from UI
     * @param tableSpaceName from UI
     * @return job ID
     */
    String startUpdateSchemaJob(boolean toLogFile, boolean isRecreateTable, boolean recreateAllFK,
            boolean setToChar, String tableSpaceName);
    
    /**
     * Prepare the schema DB to be used with Schema/Project Update Wizard.
     */
    void updateArchibusSchemaUtilities();
    
    /**
     * Recreates logical objects (triggers,indexes,views ...).
     * 
     * @return job ID
     */
    String startRecreateStructuresJob();
    
    /**
     * 
     * Alters a single table.
     * 
     * @param tableName table name
     * @return job ID
     */
    String startUpdateSchemaForTableJob(String tableName);
}
