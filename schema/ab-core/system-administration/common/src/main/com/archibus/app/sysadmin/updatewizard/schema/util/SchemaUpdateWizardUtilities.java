package com.archibus.app.sysadmin.updatewizard.schema.util;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator.SqlTypes;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.schema.*;
import com.archibus.schema.TableDef.ThreadSafe;
import com.archibus.utility.*;
import com.archibus.utility.ListWrapper.Immutable;

/**
 * Utility class.
 * 
 * @author Catalin Purice
 * 
 */

public final class SchemaUpdateWizardUtilities {
    
    /**
     * Constant.
     */
    public static final int MAX_MSSQL_CHAR = 8000;
    
    /**
     * Constant.
     */
    public static final String APOS = "'";
    
    /**
     * Constant.
     */
    public static final String DOT = ".";
    
    /**
     * constant.
     */
    private static final int MAX_CONSTR_NAME_ORACLE = 30;
    
    /**
     * Constant.
     */
    private static final String TO_DATA_USER = " TO " + SchemaUpdateWizardConstants.getDataUser();
    
    /**
     * Constant.
     */
    private static final String GRANT_ALL_ON = "GRANT ALL ON "
            + SchemaUpdateWizardConstants.getDataUser() + DOT;
    
    /**
     * Constant.
     */
    private static final String AFM_USERS = "afm_users";
    
    /**
     * Constant.
     */
    private static final String AFM_SIZE = "afm_size";
    
    /**
     * Constant.
     */
    private static final String AFM_GROUPS = "afm_groups";
    
    /**
     * Constant.
     */
    private static final int MAX_ORACLE_CHAR = 4000;
    
    /**
     * Constant.
     */
    private static final String SET_TRUNCATE = "set rtruncation %s";
    
    /**
     * Constant.
     */
    private static final int CALC_FIELD = 2070;
    
    /**
     * Constructor.
     */
    private SchemaUpdateWizardUtilities() {
    }
    
    /**
     * Converts arrays to a string format like: arr[0], arr[1],... arr[n].
     * 
     * @param fieldsList list of fields
     * @param separator separator
     * @return String
     */
    public static String convertArrayToString(final Immutable<String> fieldsList,
            final char separator) {
        final StringBuffer buffer = new StringBuffer();
        int pos = 0;
        if (fieldsList != null) {
            for (final String field : fieldsList) {
                pos++;
                buffer.append(field);
                if (fieldsList.size() > 1 && pos < fieldsList.size()) {
                    buffer.append(separator);
                }
            }
        }
        return buffer.toString();
    }
    
    /**
     * Get ARCHIBUS validated tables. Get all the foreign keys that refer to tableNames's primary
     * key.
     * 
     * @param tableName table name
     * @return List of validated tables
     */
    public static List<String> getARCHValidatedTables(final String tableName) {
        final DataSource getValidatedTablesDs = DataSourceFactory.createDataSource();
        getValidatedTablesDs.addTable(ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_MAIN);
        getValidatedTablesDs.addTable(ProjectUpdateWizardConstants.AFM_FLDS,
            DataSource.ROLE_STANDARD);
        getValidatedTablesDs.addField(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.TABLE_NAME);
        getValidatedTablesDs.addField(ProjectUpdateWizardConstants.AFM_FLDS,
            ProjectUpdateWizardConstants.FIELD_NAME);
        getValidatedTablesDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
            "is_sql_view", 0));
        getValidatedTablesDs.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
            "ref_table", tableName));
        final List<DataRecord> records = getValidatedTablesDs.getRecords();
        final List<String> tableNameList = new ArrayList<String>();
        for (final DataRecord record : records) {
            tableNameList.add(record.getValue("afm_tbls.table_name").toString());
        }
        return tableNameList;
    }
    
    /**
     * Returns current time syntax for different web servers.
     * 
     * @param isDate true for date type
     * @return current time semantics
     */
    public static String getCurrentDateTime(final boolean isDate) {
        String currDataTime = "";
        if (SqlUtils.isOracle()) {
            currDataTime = "SYSDATE";
        } else if (SqlUtils.isSqlServer()) {
            currDataTime = "getdate()";
        } else {
            if (isDate) {
                currDataTime = "CURRENT DATE";
            } else {
                currDataTime = "CURRENT TIME";
            }
        }
        return currDataTime;
    }
    
    /**
     * 
     * @param newFldDef Archibus field definition
     * @return default value
     */
    public static Object getDefaultValue(final ArchibusFieldDefBase.Immutable newFldDef) {
        Object defaultValue = "";
        final Object dfltObj = newFldDef.getDefaultValue();
        if (!newFldDef.isAutoNumber() && newFldDef.isDateTimeType()) {
            final FieldDateTimeImpl dateTimeNewField = (FieldDateTimeImpl) newFldDef;
            if (dateTimeNewField.isDefaultValueCurrent()) {
                final boolean isDate = isDate(dateTimeNewField);
                defaultValue = getCurrentDateTime(isDate);
            } else {
                if (StringUtil.notNullOrEmpty(dfltObj)) {
                    defaultValue = dfltObj.toString();
                }
            }
        } else {
            if (StringUtil.notNullOrEmpty(dfltObj)) {
                if (CALC_FIELD == newFldDef.getArchibusFieldType().getCode()) {
                    defaultValue =
                            getArchibusDfltVal(newFldDef.getTableName(), newFldDef.getName());
                } else {
                    defaultValue = dfltObj.toString();
                }
            }
        }
        return defaultValue;
    }
    
    /**
     * Gets afm_flds.dflt_val for the field name.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return afm_flds.dflt_val
     */
    private static String getArchibusDfltVal(final String tableName, final String fieldName) {
        final DataSource fieldPropDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_FLDS)
                    .addField("dflt_val")
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, "field_name",
                            fieldName))
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS,
                            ProjectUpdateWizardUtilities.TABLE_NAME, tableName));
        final Object fieldValue = fieldPropDS.getRecord().getValue("afm_flds.dflt_val");
        return fieldValue == null ? "" : fieldValue.toString();
    }
    
    /**
     * 
     * @param dateTimeNewField datetime field
     * @return true if the field is date and false if the field is time or timestamp
     */
    private static boolean isDate(final FieldDateTimeImpl dateTimeNewField) {
        boolean isDate = true;
        if (dateTimeNewField.isDefaultValueCurrent()) {
            final int sqlType = dateTimeNewField.getSqlType();
            if (sqlType == SqlTypes.SQL_TIME || sqlType == SqlTypes.SQL_TIMESTAMP) {
                isDate = false;
            }
        }
        return isDate;
    }
    
    /**
     * Sets the meta-data truncation to on or off.
     * 
     * @param isOn true or false
     */
    public static void setTruncation(final boolean isOn) {
        String setTruncateStmt = String.format(SET_TRUNCATE, "on");
        if (!isOn) {
            setTruncateStmt = String.format(SET_TRUNCATE, "off");
        }
        SqlUtils.executeUpdate("", setTruncateStmt);
    }
    
    /**
     * Removes trailing and leading character c.
     * 
     * @param inString String to be converted
     * @param leadChar leading character to be removed
     * @param trailChar trailing character to be removed
     * @return The new string
     */
    public static String trimChar(final String inString, final char leadChar, final char trailChar) {
        final int strLen = inString.length() - 1;
        String outString = inString;
        if (strLen >= 0 && inString.charAt(0) == leadChar && inString.charAt(strLen) == trailChar) {
            outString = inString.substring(1, strLen);
        }
        return outString;
    }
    
    /**
     * for Oracle, tables afm_users and afm_groups are owned by afm_secure. Thus when issuing the
     * Alter Table statement, we need to specify the owner.
     * 
     * @param tableName name of the table
     * 
     * @return true if the table is afm_users or afm_groups, otherwise false
     */
    public static boolean useAfmSecurePrefixForTable(final String tableName) {
        boolean isAfmSecure = false;
        if (SqlUtils.isOracle()
                && (AFM_USERS.equalsIgnoreCase(tableName) || AFM_GROUPS.equalsIgnoreCase(tableName))) {
            isAfmSecure = true;
        }
        return isAfmSecure;
    }
    
    /**
     * @param tableName table name
     * @return sql grants
     */
    public static String sybaseAndMsSqlGrants(final String tableName) {
        String grantStmt = "";
        if (AFM_USERS.equalsIgnoreCase(tableName) || AFM_GROUPS.equalsIgnoreCase(tableName)
                || "afm_roles".equalsIgnoreCase(tableName)
                || "afm_groupsforroles".equalsIgnoreCase(tableName)) {
            
            grantStmt = GRANT_ALL_ON + tableName + TO_DATA_USER;
        } else {
            if (SqlUtils.isSqlServer()) {
                grantStmt = grantForSqlServer(tableName);
            } else {
                grantStmt = GRANT_ALL_ON + tableName + TO_DATA_USER;
            }
        }
        return grantStmt;
    }
    
    /**
     * 
     * @param tableName table name
     * @return grant statement
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case 4: Changes to SQL schema.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static String grantForSqlServer(final String tableName) {
        String grantStmt = "";
        if (AFM_USERS.equalsIgnoreCase(tableName)) {
            grantStmt = "GRANT REFERENCES, SELECT ON ";
        } else {
            grantStmt = "GRANT REFERENCES, SELECT, UPDATE ON ";
        }
        grantStmt += SchemaUpdateWizardConstants.getDataUser() + DOT;
        grantStmt += tableName;
        grantStmt += TO_DATA_USER;
        return grantStmt;
    }
    
    /**
     * Return the foreign keys with afm_flds.validate_data=1.
     * 
     * @param archTableDef table definition
     * @return the foreign key list
     */
    public static Immutable<com.archibus.schema.ForeignKey.Immutable> getValidatedForeignKeys(
            final ThreadSafe archTableDef) {
        final ListWrapper.Immutable<ForeignKey.Immutable> archFkeys = archTableDef.getForeignKeys();
        final List<ForeignKey.Immutable> tempArchForeignKeys =
                new ArrayList<ForeignKey.Immutable>();
        for (final ForeignKey.Immutable archFkey : archFkeys) {
            if (archTableDef.getFieldDef(archFkey.getName()).isValidateData()) {
                tempArchForeignKeys.add(archFkey);
            }
        }
        final ConcurrentListImpl<ForeignKey.Immutable> validForeignKeys =
                new ConcurrentListImpl<ForeignKey.Immutable>(tempArchForeignKeys);
        return validForeignKeys;
    }
    
    /**
     * 
     * @param dfltValue default value
     * @param fieldDefn field definition
     * @return default stmt
     */
    public static String formatDefaultValue(final String dfltValue,
            final ArchibusFieldDefBase.Immutable fieldDefn) {
        String newDefault = dfltValue;
        if (fieldDefn.isCharType()) {
            if (dfltValue.contains(APOS)) {
                newDefault = dfltValue.replaceAll(APOS, APOS + APOS);
            } else if (fieldDefn.isCharType()) {
                newDefault = APOS + dfltValue + APOS;
            }
        }
        return newDefault;
    }
    
    /**
     * Build Constraint Name.
     * 
     * @param tableName name of the table
     * @param fieldName name of the field
     * @return constraint name
     */
    public static String buildConstraintName(final String tableName, final String fieldName) {
        String constraintName = tableName + "_" + fieldName;
        /*
         * for Oracle we need too truncate the constraint name as Oracle server will throw an error
         */
        if (SqlUtils.isOracle() && constraintName.length() > MAX_CONSTR_NAME_ORACLE) {
            constraintName = OracleActions.truncateConstraintName(constraintName);
        }
        return constraintName;
    }
    
    /**
     * returns true is the table exists in afm_transfer_set and false otherwise.
     * 
     * @param tableName table name
     * @return true if table exist in afm_transfer_set
     */
    public static boolean isTableInAfmTransferSet(final String tableName) {
        boolean tableExists = true;
        final DataSource missingTableDS =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET)
                    .addField(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                        ProjectUpdateWizardUtilities.TABLE_NAME)
                    .addRestriction(
                        Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
                            ProjectUpdateWizardUtilities.TABLE_NAME, tableName));
        final List<DataRecord> archTblsRecords = missingTableDS.getRecords();
        if (archTblsRecords.isEmpty()) {
            tableExists = false;
        }
        return tableExists;
    }
    
    /**
     * Updates max field size in ARCHIBUS data dictionary if the maximum size is exceeded.
     */
    public static void adjustTooBigFieldsSizes() {
        if (!SqlUtils.isSybase()) {
            int maxSize = MAX_MSSQL_CHAR;
            if (SqlUtils.isOracle()) {
                maxSize = MAX_ORACLE_CHAR;
            }
            final DataSource getMaxFieldSizeDs =
                    DataSourceFactory
                        .createDataSource()
                        .addTable(ProjectUpdateWizardConstants.AFM_FLDS)
                        .addField(ProjectUpdateWizardUtilities.TABLE_NAME)
                        .addField(ProjectUpdateWizardUtilities.FIELD_NAME)
                        .addField(AFM_SIZE)
                        .addRestriction(
                            Restrictions.gt(ProjectUpdateWizardConstants.AFM_FLDS, AFM_SIZE,
                                maxSize))
                        .addRestriction(
                            Restrictions.eq(ProjectUpdateWizardConstants.AFM_FLDS, "data_type", 12));
            final List<DataRecord> records = getMaxFieldSizeDs.getRecords();
            for (final DataRecord record : records) {
                record.setValue("afm_flds.afm_size", maxSize);
                getMaxFieldSizeDs.saveRecord(record);
            }
        }
    }
}