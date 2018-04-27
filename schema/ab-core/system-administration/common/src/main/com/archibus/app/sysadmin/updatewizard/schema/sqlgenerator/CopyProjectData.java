package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import com.archibus.app.sysadmin.updatewizard.schema.dbschema.DatabaseSchemaTableDef;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.*;
import com.archibus.schema.*;
import com.archibus.utility.StringUtil;

/**
 * Generates meta-data as INSERT statements.
 * 
 * @author Catalin Purice
 */
public class CopyProjectData {
    
    /**
     * Constant.
     */
    private static final String COMMA = ",";
    
    /**
     * ARCHIBUS table definition.
     */
    private final transient TableDef.ThreadSafe toArchibusTableDef;
    
    /**
     * SQL table definition.
     */
    private final transient DatabaseSchemaTableDef fromSqlTableDef;
    
    /**
     * Output. This can be to log file or execute to DB.
     */
    private final transient SqlCommandOutput out;
    
    /**
     * Name of the table to transfer data to.
     */
    private final transient String toTableName;
    
    /**
     * If table is AUTOINCREMENT now and was not before.
     */
    private final transient boolean newAutoincrementFound;
    
    /**
     * Constructor.
     * 
     * @param fromSqlTableDef @see {@link CopyProjectData#fromSqlTableDef}
     * @param toTableDef @see {@link CopyProjectData#toTableDef}
     * @param out @see {@link CopyProjectData#out}
     */
    public CopyProjectData(final TableDef.ThreadSafe toTableDef,
            final DatabaseSchemaTableDef fromSqlTableDef, final SqlCommandOutput out) {
        this.toArchibusTableDef = toTableDef;
        this.fromSqlTableDef = fromSqlTableDef;
        this.toTableName = SchemaUpdateWizardConstants.TEMP_TABLE;
        this.newAutoincrementFound =
                isNumberOfFieldsChanged() && this.toArchibusTableDef.getIsAutoNumber()
                        && !this.fromSqlTableDef.isAutoNumber();
        
        this.out = out;
    }
    
    /**
     * Getter for the newAutoincrementFound property.
     * 
     * @see newAutoincrementFound
     * @return the newAutoincrementFound property.
     */
    public boolean isTableAutoincrementNow() {
        return this.newAutoincrementFound;
    }
    
    /**
     * Copy data from one column to another. Used in "change column data type" algorithm
     * 
     * @param tableName table name
     * @param oldFieldName old field name
     * @param newFieldName new field name
     * @return statement
     */
    public static String copyFromColumnToColumn(final String tableName, final String oldFieldName,
            final String newFieldName) {
        return "UPDAT_E " + tableName + " SET " + newFieldName + "=" + oldFieldName;
    }
    
    /**
     * Copies rows from a table using INSERT .. SELECT command.
     */
    public void copyData() {
        boolean isIdentityOn = false;
        if (SqlUtils.isSqlServer() && !this.newAutoincrementFound
                && this.toArchibusTableDef.getIsAutoNumber()) {
            this.out.runCommand(SqlServerActions.setIdentity(this.toTableName, true),
                DataSource.DB_ROLE_DATA);
            isIdentityOn = true;
        }
        if (SqlUtils.isOracle() && this.newAutoincrementFound) {
            this.out.runCommand(
                OracleActions.getCreateSequenceStmt(this.toArchibusTableDef.getName()),
                DataSource.DB_ROLE_DATA);
        }
        
        final String insertAllRowsStmt = buildCopyDataStatement();
        
        this.out.runCommand(insertAllRowsStmt, DataSource.DB_ROLE_DATA);
        if (isIdentityOn) {
            this.out.runCommand(SqlServerActions.setIdentity(this.toTableName, false),
                DataSource.DB_ROLE_DATA);
        }
    }
    
    /**
     * 
     * @return INSERT... SELECT statement pattern.
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this class.
     *         <p>
     *         Justification: Case #2: Statements with INSERT ... SELECT pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private String buildCopyDataStatement() {
        String newFields = "";
        String oldFields = "";
        for (final String fieldName : this.toArchibusTableDef.getFieldNames()) {
            final ArchibusFieldDefBase.Immutable archibusFieldDef =
                    this.toArchibusTableDef.getFieldDef(fieldName);
            if (!SqlUtils.isOracle() && this.newAutoincrementFound
                    && archibusFieldDef.isAutoNumber()) {
                // do not add new AUTOINCREMENT field for Sybase and Sql Server, because it will be
                // automatically incremented.
                continue;
            } else {
                // for Oracle include all fields. Use sequences.
                newFields += fieldName + COMMA;
            }
            if (this.fromSqlTableDef.getFieldsName().contains(fieldName)) {
                oldFields += fieldName + COMMA;
            } else if (SqlUtils.isOracle() && this.newAutoincrementFound
                    && archibusFieldDef.isAutoNumber()) {
                oldFields += getOracleNextValueSintax() + COMMA;
            } else {
                // field is new. Use DEFAULT value.
                oldFields += getDefaultValue(archibusFieldDef) + COMMA;
            }
        }
        newFields = newFields.substring(0, newFields.lastIndexOf(COMMA));
        oldFields = oldFields.substring(0, oldFields.lastIndexOf(COMMA));
        return "INSERT INTO " + this.toTableName + "(" + newFields + ") SELECT " + oldFields
                + " FROM " + this.fromSqlTableDef.getTableName();
    }
    
    /**
     * 
     * Get default value for field.
     * 
     * @param archibusFieldDef field definition
     * @return default value
     */
    private String getDefaultValue(final ArchibusFieldDefBase.Immutable archibusFieldDef) {
        final Object defaultValue = SchemaUpdateWizardUtilities.getDefaultValue(archibusFieldDef);
        return (StringUtil.isNullOrEmpty(defaultValue)) ? "NULL" : SchemaUpdateWizardUtilities
            .formatDefaultValue(String.valueOf(defaultValue), archibusFieldDef);
    }
    
    /**
     * 
     * Check if number of fields changed.
     * 
     * @return true if the number of field is different.
     */
    private boolean isNumberOfFieldsChanged() {
        boolean noOfFieldsChanged = false;
        if (this.toArchibusTableDef.getFieldNames().size() != this.fromSqlTableDef.getFieldsName()
            .size()) {
            noOfFieldsChanged = true;
        }
        return noOfFieldsChanged;
    }
    
    /**
     * 
     * Return NEXT VAL syntax for ORACLE sequence.
     * 
     * @return syntax for AUTOINCREMENTED field.
     */
    private String getOracleNextValueSintax() {
        return String.format(OracleActions.SEQ_NAME, this.toArchibusTableDef.getName())
                + ".NEXTVAL";
    }
}
