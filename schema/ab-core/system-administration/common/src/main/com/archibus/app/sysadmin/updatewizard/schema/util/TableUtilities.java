package com.archibus.app.sysadmin.updatewizard.schema.util;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlFieldDefinition;
import com.archibus.datasource.*;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.*;

/**
 * Utility class. Provides methods used for table creation/alteration.
 * 
 * @author Catalin Purice
 * @since 20.1
 * 
 */
public final class TableUtilities {
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private TableUtilities() {
    }
    
    /**
     * @param nlsToChar NLS to CHAR
     * @param tableSpaceName table-space name for Oracle
     * @param tableFieldsDef fields definition
     * @return fields definition statement
     */
    public static String buildTableFields(final boolean nlsToChar, final String tableSpaceName,
            final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> tableFieldsDef) {
        String fieldsDefinitionStmt = " (";
        String fieldDefStmt = "";
        boolean firstFieldAdded = false;
        String blobStmt = "";
        for (final ArchibusFieldDefBase.Immutable archFieldDef : tableFieldsDef) {
            fieldDefStmt =
                    new SqlFieldDefinition(archFieldDef, nlsToChar).fieldDefinition(false, null,
                        null, false, "");
            if (SqlUtils.isOracle()
                    && archFieldDef.getArchibusFieldType().getCode() == SchemaUpdateWizardConstants.AFM_DOC_TYPE) {
                blobStmt =
                        OracleActions.blobClauseForOracle(archFieldDef.getName(), tableSpaceName);
            }
            
            if (fieldDefStmt.length() > 0) {
                if (firstFieldAdded) {
                    fieldsDefinitionStmt += ", ";
                } else {
                    firstFieldAdded = true;
                }
                fieldsDefinitionStmt += fieldDefStmt;
            }
        }
        fieldsDefinitionStmt += ")";
        fieldsDefinitionStmt += blobStmt;
        return fieldsDefinitionStmt;
    }
    
    /**
     * Grants permissions.
     * 
     * @param tableName name of the table
     * @param output output type
     */
    public static void grantPermissionToTable(final String tableName, final SqlCommandOutput output) {
        if (SqlUtils.isOracle()) {
            OracleActions.runOracleGrants(tableName, output);
        } else {
            final String grantStmt = SchemaUpdateWizardUtilities.sybaseAndMsSqlGrants(tableName);
            output.runCommand(grantStmt, DataSource.DB_ROLE_SECURITY);
        }
    }
    
    /**
     * Decide if PK or FK key were changed.
     * 
     * @param alterField field to alter
     * @return boolean
     */
    public static boolean isPkOrFkChanged(final CompareFieldDef alterField) {
        boolean pkFkChanged = false;
        if (alterField.getArcFieldDef().isPrimaryKey()
                || alterField.getArcFieldDef().isForeignKey()
                || alterField.getSysFieldDef().isPrimaryKey()
                || alterField.getSysFieldDef().isForeignKey()) {
            pkFkChanged = true;
        }
        return pkFkChanged;
    }
    
    /**
     * Decide if to recreate table or not.
     * 
     * @param alterField field to alter
     * @return boolean
     */
    public static boolean isRecreateTable(final CompareFieldDef alterField) {
        boolean recreateTable = false;
        if (SqlUtils.isSqlServer() && alterField.get(PropertyType.AUTONUM).isChanged()) {
            recreateTable = true;
        }
        return recreateTable;
    }
    
    /**
     * Updates the NULL fields with default value if exists.
     * 
     * @param arcFieldDef ARCHIBUS field definition
     * @return UPDATE SQL command 
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #3: Statements with UPDATE ... WHERE pattern.
     */
    
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static String updateNullFields(final ArchibusFieldDefBase.Immutable arcFieldDef) {
        Object defaultValue = arcFieldDef.getDefaultValue();
        if (StringUtil.isNullOrEmpty(defaultValue)) {
            if (arcFieldDef.IsNumType()) {
                defaultValue = 0;
            } else {
                // can't use empty string because ORACLE converts it to NULL.
                if (SqlUtils.isOracle()) {
                    defaultValue = " ";
                } else {
                    defaultValue = "";
                }
            }
        }
        
        final String sqlDefaultValue =
                "NULL".equals(SqlUtils.formatValueForSql(defaultValue)) ? "' '" : SqlUtils
                    .formatValueForSql(defaultValue);

        return String.format("UPDATE %s SET %s = %s WHERE %s IS NULL", arcFieldDef.getTableName(),
            arcFieldDef.getName(), sqlDefaultValue, arcFieldDef.getName());
    }
}
